// src/app/results/page.tsx
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { CollapsibleSection } from "@/components/CollapsibleSection";

const contagionLevels = [
  { level: "غير مستفيد", value: 0 },
  { level: "خطر عدوى متوسط الصنف 3", value: 2500 },
  { level: "خطر عدوى متوسط الصنف 2", value: 3000 },
  { level: "خطر عدوى متوسط الصنف 1", value: 4000 },
  { level: "خطر عدوى عال", value: 5800 },
  { level: "خطر عدوى عال جدا", value: 7200 },
];

const interessementLevels = [
  { level: "غير مستفيد", value: 0 },
  { level: "1", value: 8000 },
  { level: "2", value: 10000 },
  { level: "3", value: 12000 },
  { level: "4", value: 17000 },
  { level: "5", value: 24000 },
];

function roundToTen(amount: number): number {
  return Math.floor(amount / 10) * 10;
}

function calculateIRG(imposableSalary: number): number {
  if (imposableSalary <= 30000) return 0;
  if (imposableSalary <= 35000) {
    const base = (imposableSalary - 20000) * 0.23;
    const abattement = base * 0.4;
    if (abattement <= 1000) return ((base - 1000) * 137) / 51 - 27925 / 8;
    if (abattement >= 1500) return ((base - 1500) * 137) / 51 - 27925 / 8;
    return (base * 0.6 * 137) / 51 - 27925 / 8;
  }
  if (imposableSalary <= 40000) {
    const base = (imposableSalary - 20000) * 0.23;
    const abattement = base * 0.4;
    if (abattement <= 1000) return base - 1000;
    if (abattement >= 1500) return base - 1500;
    return base * 0.6;
  }
  if (imposableSalary <= 80000)
    return (imposableSalary - 40000) * 0.27 + 4600 - 1500;
  if (imposableSalary <= 160000)
    return (imposableSalary - 80000) * 0.3 + 15400 - 1500;
  if (imposableSalary <= 320000)
    return (imposableSalary - 160000) * 0.33 + 39400 - 1500;
  return (imposableSalary - 320000) * 0.35 + 92200 - 1500;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  // Extract parameters
  const mainCorp = decodeURIComponent(searchParams.mainCorp || "");
  const subCorp = decodeURIComponent(searchParams.subCorp || "");
  const grade = decodeURIComponent(searchParams.grade || "");
  const echelon = searchParams.echelon || "0";
  const posteSup = searchParams.posteSup || "";
  const contagionLevel = searchParams.contagionLevel || "0";
  const interessementLevel = searchParams.interessementLevel || "0";

  // Fetch data
  const practitioner = await prisma.healthPractitioner.findFirst({
    where: { mainCorp, subCorp, grade },
  });

  const salaryScale = practitioner?.category
    ? await prisma.salaryScale.findUnique({
        where: { cat: practitioner.category },
      })
    : null;

  const compensationCodes = await prisma.compensationCode.findMany();

  // Get poste supérieur value
  const posteSupRecord =
    posteSup && posteSup !== "none"
      ? await prisma.posteSuperieur.findUnique({
          where: { id: parseInt(posteSup) },
        })
      : null;
  const posteSupValue = posteSupRecord?.indicePosteSup
    ? posteSupRecord.indicePosteSup * 45
    : 0;

  // Calculate values
  const contagionValue =
    contagionLevels.find((l) => l.level === contagionLevel)?.value || 0;
  const category = practitioner?.category || "غير محدد";
  const indiceCat = salaryScale?.indiceCat || 0;
  const echValue = salaryScale
    ? Number(salaryScale[`Ech${echelon}` as keyof typeof salaryScale]) || 0
    : 0;
  const baseSalary = indiceCat * 45;
  const isContractual = mainCorp === "الأعوان المتعاقدين";
  let expSalary = 0;

  if (isContractual) {
    const years = Number.isNaN(parseInt(echelon, 10))
      ? 0
      : parseInt(echelon, 10);
    expSalary = (years * 1.4 * baseSalary) / 100;
  } else {
    expSalary = echValue * 45; // Use echelon value from salary scale multiplied by 45
  }

  const princSalary = baseSalary + expSalary;
  const interessementValue =
    mainCorp === "الممارسين الطبيون المتخصصون"
      ? interessementLevels.find((l) => l.level === interessementLevel)
          ?.value || 0
      : 0;
  // Prime compensations (PRIME)
  const primeCompensations = compensationCodes.filter((code) => {
    const fieldName = `comp_${code.codeComp.replace(/-/g, "_")}`;
    return (
      (practitioner as Record<string, unknown>)?.[fieldName] !== null &&
      code.description?.includes("PRIME")
    );
  });

  // Active compensations
  const activeCompensations = compensationCodes.filter((code) => {
    const fieldName = `comp_${code.codeComp.replace(/-/g, "_")}`;
    return (
      (practitioner as Record<string, unknown>)?.[fieldName] !== null &&
      !code.description?.includes("PRIME")
    );
  });

  // Calculate total compensation value
  const totalCompensations = activeCompensations.reduce((total, code) => {
    const fieldName = `comp_${code.codeComp.replace(/-/g, "_")}`;
    const value = (practitioner as Record<string, unknown>)?.[fieldName];
    const compensationValue =
      code.type === "PERCENTAGE" ? princSalary * Number(value) : Number(value);
    return total + compensationValue;
  }, 0);

  // Calculate salaries
  const brutSalary =
    princSalary +
    posteSupValue +
    totalCompensations +
    contagionValue +
    interessementValue;
  const socialSecurityRetention = Number((brutSalary * 0.09).toFixed(2));
  const imposableSalary = roundToTen(brutSalary - socialSecurityRetention);
  const irgRetention = calculateIRG(imposableSalary);
  const netSalary = brutSalary - socialSecurityRetention - irgRetention;

  // Calculate prime compensations total
  const totalPrimeCompensations = primeCompensations.reduce((total, code) => {
    const fieldName = `comp_${code.codeComp.replace(/-/g, "_")}`;
    const value = (practitioner as Record<string, unknown>)?.[fieldName];
    const compensationValue =
      code.type === "PERCENTAGE" ? princSalary * Number(value) : Number(value);
    return total + compensationValue;
  }, 0);

  // 3-month calculations
  const threeMonthBrut = totalPrimeCompensations * 3;
  const socialSecurityRetentionPrime = Number(
    (threeMonthBrut * 0.09).toFixed(2)
  ); // Arrondi à 2 décimales
  const imposablePrime = threeMonthBrut - socialSecurityRetentionPrime;
  const irgRetentionPrime = Number((imposablePrime * 0.1).toFixed(2));
  const netPrime =
    threeMonthBrut - socialSecurityRetentionPrime - irgRetentionPrime;

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 px-4 ">
        <Card className="max-w-4xl mx-auto mb-4">
          <CardHeader className="flex flex-col items-start gap-2 pb-2">
            <CardTitle className="text-xl font-bold text-primary">
              {grade}
            </CardTitle>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col space-y-1 border-r pr-4">
                <div className="flex items-center gap-1">
                  <span className="mt-0 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-theme-xs font-medium text-blue-700 dark:bg-white/[0.03] dark:text-white/80">
                    الصنف {category}
                  </span>
                  <span className="text-muted-foreground">{indiceCat}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-1 border-r pr-4">
                <div className="flex items-center gap-1">
                  <span className="mt-0 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-theme-xs font-medium text-blue-700 dark:bg-white/[0.03] dark:text-white/80">
                    الدرجة {echelon}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    {isContractual ? "1.4%" : echValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-1 border-r pr-4">
                <span className="text-xs text-muted-foreground">
                  المنصب العالي
                </span>
                <span className="font-semibold">
                  {posteSupRecord?.posteSup || "بدون"}
                </span>
              </div>

              <div className="flex flex-col space-y-1 border-r pr-4">
                <span className="text-xs text-muted-foreground">
                  طبيعة العقد
                </span>
                <span className="font-semibold">
                  {isContractual ? "تعاقدي" : "عقد دائم"}
                </span>
              </div>
              <div className="flex flex-col space-y-1 border-r pr-4">
                <span className="text-xs text-muted-foreground">
                  خطر العدوى{" "}
                </span>
                <span className="font-semibold">
                  {contagionValue.toLocaleString("ar-DZ")} دج
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-2 text-white shadow-md flex flex-row items-center justify-center gap-4">
              <h3 className="text-base font-sm">الراتب الصافي</h3>
              <div className="text-xl font-bold">
                {netSalary.toLocaleString("ar-DZ", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-xl mr-1">دج</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Basic Salary Section */}
          <CollapsibleSection title="  تفاصيل الراتب   " defaultOpen={false}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Salary */}
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right font-medium text-xs text-primary">
                      الراتب الأساسي
                    </div>
                    <div className="text-left text-muted-foreground">
                      {baseSalary.toLocaleString("ar-DZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/*{/* Experience Salary */}
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right font-medium text-xs text-primary">
                      تعويض الخبرة المهنية
                    </div>
                    <div className="text-left text-muted-foreground">
                      {expSalary.toLocaleString("ar-DZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* Poste Sup Salary */}
                {posteSup && posteSup !== "none" && (
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-right font-medium text-xs text-primary">
                        المنصب العالي
                      </div>
                      <div className="text-left text-muted-foreground">
                        {posteSupValue.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Princ Salary */}
                <div className="p-4 border rounded-lg bg-primary/5 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right font-medium text-xs text-primary">
                      الراتب الرئيسي
                    </div>
                    <div className="text-left font-bold">
                      {princSalary.toLocaleString("ar-DZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* Compensations section */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeCompensations.map((code) => {
                      const fieldName = `comp_${code.codeComp.replace(
                        /-/g,
                        "_"
                      )}`;
                      const value = (practitioner as Record<string, unknown>)?.[
                        fieldName
                      ];
                      const compensationValue =
                        code.type === "PERCENTAGE"
                          ? princSalary * Number(value)
                          : Number(value);

                      return (
                        <div
                          key={code.codeComp}
                          className="p-4 border rounded-lg bg-white shadow-sm grid grid-cols-3 gap-2 items-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-right space-y-1 col-span-2">
                            <div className="font-medium text-xs text-primary">
                              {code.nameComp}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {code.type === "PERCENTAGE"
                                ? `${(Number(value) * 100).toFixed(0)}%`
                                : `${Number(value).toLocaleString("ar-DZ")} دج`}
                            </div>
                          </div>
                          <div className="text-right font-medium text-lg text-green-600">
                            {compensationValue.toLocaleString("ar-DZ", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {contagionValue > 0 && (
                      <div className="p-4 border rounded-lg bg-white shadow-sm grid grid-cols-3 gap-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="text-right space-y-1 col-span-2">
                          <div className="font-medium text-xs text-primary">
                            التعويض عن خطر العدوى{" "}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {contagionValue.toLocaleString("ar-DZ")} دج
                          </div>
                        </div>
                        <div className="text-right font-medium text-lg text-green-600">
                          {contagionValue.toLocaleString("ar-DZ", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    )}
                    {interessementValue > 0 && (
                      <div className="p-4 border rounded-lg bg-white shadow-sm grid grid-cols-3 gap-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="text-right space-y-1 col-span-2">
                          <div className="font-medium text-xs text-primary">
                            علاوة الانتفاع{" "}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {interessementValue.toLocaleString("ar-DZ")} دج
                          </div>
                        </div>
                        <div className="text-right font-medium text-lg text-green-600">
                          {interessementValue.toLocaleString("ar-DZ", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Salary Breakdown */}
                {/* Total Gross Salary */}
                <div className="p-4 border rounded-lg bg-slate-100 grid grid-cols-3 gap-2 items-center">
                  <div className="text-right space-y-1 col-span-2">
                    <div className="font-extrabold text-base text-primary">
                      الأجر الخام{" "}
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-lg text-gray-800">
                    {brutSalary.toLocaleString("ar-DZ", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Deductions Section */}
                <div className="bg-red-50 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-right text-red-800">
                      الاقتطاعات
                    </h4>
                  </div>

                  {/* Social Security Retention */}
                  <div className="p-4 border-t border-red-100 grid grid-cols-3 gap-2 items-center">
                    <div className="text-right space-y-1 col-span-2">
                      <div className="text-sm text-red-800">
                        الضمان الاجتماعي (9%)
                      </div>
                    </div>
                    <div className="text-right text-lg text-red-800">
                      {socialSecurityRetention.toLocaleString("ar-DZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {/* Imposable Salary */}
                  <div className="p-4 bg-slate-100 grid grid-cols-3 gap-2 items-center hidden">
                    <div className="text-right space-y-1 col-span-2">
                      <div className="text-base text-primary">
                        الراتب الخاضع للضريبة
                      </div>
                    </div>
                    <div className="text-right text-lg text-gray-800">
                      {imposableSalary.toLocaleString("ar-DZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {/* IRG Retention */}
                  <div className="p-4 border-t border-red-100 grid grid-cols-3 gap-2 items-center">
                    <div className="text-right space-y-1 col-span-2">
                      <div className="text-sm text-red-800">
                        الضريبة على الدخل
                      </div>
                    </div>
                    <div className="text-right text-lg text-red-800">
                      {irgRetention.toLocaleString("ar-DZ", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* Net Salary Bottom Summary */}
                <div className="p-4 border rounded-lg bg-green-100 grid grid-cols-3 gap-2 items-center">
                  <div className="text-right space-y-1 col-span-2">
                    <div className="font-extrabold text-base text-primary">
                      الراتب الصافي{" "}
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-lg text-green-800">
                    {netSalary.toLocaleString("ar-DZ", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Prime Compensations Section */}
          {primeCompensations.length > 0 && (
            <CollapsibleSection
              title={primeCompensations[0]?.nameComp || ""}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-right font-medium text-xs text-primary">
                        الراتب الأساسي
                      </div>
                      <div className="text-left text-muted-foreground">
                        {baseSalary.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                  {/*{/* Experience Salary */}
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-right font-medium text-xs text-primary">
                        تعويض الخبرة المهنية
                      </div>
                      <div className="text-left text-muted-foreground">
                        {expSalary.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Princ Salary */}
                  <div className="p-4 border rounded-lg bg-primary/5 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-right font-medium text-xs text-primary">
                        الراتب الرئيسي
                      </div>
                      <div className="text-left font-bold">
                        {princSalary.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Prime compensation items */}
                  {primeCompensations.map((code) => {
                    const fieldName = `comp_${code.codeComp.replace(
                      /-/g,
                      "_"
                    )}`;
                    const value = (practitioner as Record<string, unknown>)?.[
                      fieldName
                    ];
                    const compensationValue =
                      code.type === "PERCENTAGE"
                        ? princSalary * Number(value)
                        : Number(value);

                    return (
                      <div
                        key={code.codeComp}
                        className="p-4 border rounded-lg bg-white shadow-sm grid grid-cols-3 gap-2 items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-right space-y-1 col-span-2">
                          <div className="font-medium text-xs text-primary">
                            {code.nameComp}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {code.type === "PERCENTAGE"
                              ? `${(Number(value) * 100).toFixed(0)}%`
                              : `${Number(value).toLocaleString("ar-DZ")} دج`}
                          </div>
                        </div>
                        <div className="text-right font-medium text-lg text-green-600">
                          {compensationValue.toLocaleString("ar-DZ", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* 3-month Calculations */}
                  <div className="col-span-full space-y-4">
                    {/* 3-month Brut */}
                    <div className="p-4 border rounded-lg bg-blue-100 grid grid-cols-3 gap-2 items-center">
                      <div className="text-right space-y-1 col-span-2">
                        <div className="font-medium text-sm text-blue-800">
                          مبلغ العلاوة الفصلية
                        </div>
                      </div>
                      <div className="text-right font-semibold text-blue-800">
                        {threeMonthBrut.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Social Security Retention */}
                    <div className="p-4 border rounded-lg bg-red-50 grid grid-cols-3 gap-2 items-center">
                      <div className="text-right space-y-1 col-span-2">
                        <div className="font-medium text-sm text-red-800">
                          الضمان الاجتماعي (9%)
                        </div>
                      </div>
                      <div className="text-right font-semibold text-red-800">
                        {socialSecurityRetentionPrime.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Imposable Amount */}
                    <div className="hidden p-4 border rounded-lg bg-purple-50 grid grid-cols-3 gap-2 items-center">
                      <div className="text-right space-y-1 col-span-2">
                        <div className="font-medium text-sm text-purple-800">
                          المبلغ الخاضع للضريبة
                        </div>
                        <div className="text-xs text-purple-600">
                          (الإجمالي - الضمان الاجتماعي)
                        </div>
                      </div>
                      <div className="text-right font-semibold text-purple-800">
                        {imposablePrime.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <span className="text-sm mr-1">دج</span>
                      </div>
                    </div>

                    {/* IRG Retention */}
                    <div className="p-4 border rounded-lg bg-red-50 grid grid-cols-3 gap-2 items-center">
                      <div className="text-right space-y-1 col-span-2">
                        <div className="font-medium text-sm text-red-800">
                          الضريبة على الدخل (10%)
                        </div>
                      </div>
                      <div className="text-right font-semibold text-red-800">
                        {irgRetentionPrime.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Net Prime */}
                    <div className="p-4 border rounded-lg bg-green-100 grid grid-cols-3 gap-2 items-center">
                      <div className="text-right space-y-1 col-span-2">
                        <div className="font-medium text-sm text-green-800">
                          الصافي النهائي (3 أشهر)
                        </div>
                      </div>
                      <div className="text-right font-semibold text-green-800">
                        {netPrime.toLocaleString("ar-DZ", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </>
  );
}
