"use client";

import { useState, useEffect, Suspense } from "react";
import { usePDF } from "react-to-pdf";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Printer, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import PrintablePayslip from "@/components/PrintablePayslip";
import type {
  HealthPractitioner,
  SalaryScale,
  PosteSuperieur,
  CompensationCode,
} from "@/types";

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

interface PayslipData {
  mainCorp: string;
  subCorp: string;
  grade: string;
  category: string;
  echelon: string;
  indiceCat: number;
  echValue: number;
  posteSupTitle?: string;
  contractType: string;
  contagionLevel: string;
  baseSalary: number;
  expSalary: number;
  princSalary: number;
  posteSupValue: number;
  contagionValue: number;
  interessementValue: number;
  activeCompensations: Array<{
    nameComp: string;
    type: string;
    value: number;
    compensationValue: number;
  }>;
  brutSalary: number;
  socialSecurityRetention: number;
  imposableSalary: number;
  irgRetention: number;
  totalRetention: number;
  enfprime: number;
  enf10prime: number;
  uniquesalary: number;
  totalallocfam: number;
  netSalary: number;
  primeCompensations: Array<{
    nameComp: string;
    type: string;
    value: number;
    compensationValue: number;
  }>;
  totalPrimeCompensations: number;
  threeMonthBrut: number;
  socialSecurityRetentionPrime: number;
  imposablePrime: number;
  irgRetentionPrime: number;
  netPrime: number;
  specialPrimeValue: number;
  specialPrimePercentage: number;
}

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

function calculateSpecialPrimePercentage(echelonNum: number): number {
  if (echelonNum >= 1 && echelonNum <= 2) return 0.05;
  if (echelonNum >= 3 && echelonNum <= 4) return 0.1;
  if (echelonNum >= 5 && echelonNum <= 6) return 0.15;
  if (echelonNum >= 7 && echelonNum <= 8) return 0.2;
  if (echelonNum >= 9 && echelonNum <= 10) return 0.25;
  if (echelonNum >= 11 && echelonNum <= 12) return 0.3;
  return 0;
}

export default function PrintPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <PrintableContent />
    </Suspense>
  );
}

function LoadingComponent() {
  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center mt-4">جاري تحميل كشف الراتب...</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorComponent({ message }: { message: string }) {
  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function PrintableContent() {
  const { toPDF, targetRef } = usePDF({ filename: "payslip.pdf" });
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mainCorp = searchParams.get("mainCorp")
          ? decodeURIComponent(searchParams.get("mainCorp") as string)
          : "";
        const subCorp = searchParams.get("subCorp")
          ? decodeURIComponent(searchParams.get("subCorp") as string)
          : "";
        const grade = searchParams.get("grade")
          ? decodeURIComponent(searchParams.get("grade") as string)
          : "";
        const echelon = searchParams.get("echelon") || "0";
        const posteSup = searchParams.get("posteSup") || "";
        const contagionLevel = searchParams.get("contagionLevel") || "0";
        const childrenCount = parseInt(
          searchParams.get("childrenCount") || "0",
          10
        );
        const olderChildrenCount = parseInt(
          searchParams.get("olderChildrenCount") || "0",
          10
        );
        const spouseWorks = searchParams.get("spouseStatus") === "true";
        const interessementLevel =
          searchParams.get("interessementLevel") || "0";

        if (!mainCorp || !subCorp || !grade) {
          setError("البيانات المطلوبة غير متوفرة");
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          mainCorp: encodeURIComponent(mainCorp),
          subCorp: encodeURIComponent(subCorp),
          grade: encodeURIComponent(grade),
          echelon,
          posteSup,
          contagionLevel,
          interessementLevel,
        });

        const response = await fetch(
          `/api/practitioner-data?${params.toString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch practitioner data");

        const data = await response.json();

        const practitioner: HealthPractitioner | null = data.practitioner;
        const salaryScale: SalaryScale | null = data.salaryScale;
        const posteSupRecord: PosteSuperieur | null = data.posteSupRecord;
        const compensationCodes: CompensationCode[] = data.compensationCodes;

        const posteSupValue = posteSupRecord?.indicePosteSup
          ? posteSupRecord.indicePosteSup * 45
          : 0;

        const contagionValue =
          contagionLevels.find((l) => l.level === contagionLevel)?.value || 0;

        const category = practitioner?.category || "غير محدد";
        const indiceCat = salaryScale?.indiceCat || 0;
        const echValue = salaryScale
          ? Number(
              salaryScale[
                `Ech${Math.min(
                  Math.max(parseInt(echelon) || 0, 1),
                  12
                )}` as keyof SalaryScale
              ]
            ) || 0
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
          expSalary = echValue * 45;
        }

        const princSalary = baseSalary + expSalary;
        const interessementValue =
          mainCorp === "الممارسين الطبيون المتخصصون"
            ? interessementLevels.find(
                (l) => l.value === Number(interessementLevel)
              )?.value || 0
            : 0;

        const specialPrimeCode = compensationCodes.find(
          (code) => code.codeComp === "1-2-26"
        );

        let specialPrimeValue = 0;
        let specialPrimePercentage = 0;
        if (
          mainCorp === "النفسانيون العياديون والأرطوفونيون" &&
          specialPrimeCode
        ) {
          const echelonNum = parseInt(echelon, 10);
          specialPrimePercentage = calculateSpecialPrimePercentage(echelonNum);
          specialPrimeValue = princSalary * specialPrimePercentage;
        }

        const primeCompensations = compensationCodes
          .filter((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(
              /-/g,
              "_"
            )}` as keyof HealthPractitioner;
            return (
              practitioner?.[fieldName] !== null &&
              code.description?.includes("PRIME")
            );
          })
          .map((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(
              /-/g,
              "_"
            )}` as keyof HealthPractitioner;
            const value = practitioner?.[fieldName]
              ? Number(practitioner[fieldName])
              : 0;
            return {
              nameComp: code.nameComp,
              type: code.type,
              value: value,
              compensationValue:
                code.type === "PERCENTAGE" ? princSalary * value : value,
            };
          });

        const activeCompensations = compensationCodes
          .filter((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(
              /-/g,
              "_"
            )}` as keyof HealthPractitioner;
            return (
              practitioner?.[fieldName] !== null &&
              !code.description?.includes("PRIME")
            );
          })
          .map((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(
              /-/g,
              "_"
            )}` as keyof HealthPractitioner;
            const value = practitioner?.[fieldName]
              ? Number(practitioner[fieldName])
              : 0;
            return {
              nameComp: code.nameComp,
              type: code.type,
              value: value,
              compensationValue:
                code.type === "PERCENTAGE" ? princSalary * value : value,
            };
          });

        if (specialPrimeValue > 0 && specialPrimeCode) {
          const newCompensation = {
            nameComp: specialPrimeCode.nameComp,
            type: "PERCENTAGE" as const,
            value: specialPrimePercentage,
            compensationValue: specialPrimeValue,
          };

          activeCompensations.push(newCompensation);
        }

        const totalCompensations = activeCompensations.reduce(
          (total, comp) => total + comp.compensationValue,
          0
        );

        const brutSalary =
          princSalary +
          posteSupValue +
          totalCompensations +
          contagionValue +
          interessementValue +
          specialPrimeValue;

        const socialSecurityRetention = Number((brutSalary * 0.09).toFixed(2));
        const imposableSalary = roundToTen(
          brutSalary - socialSecurityRetention
        );
        const irgRetention = calculateIRG(imposableSalary);
        const totalRetention = socialSecurityRetention + irgRetention;

        const enfprime = childrenCount * 300;
        const enf10prime = olderChildrenCount * 11.25;
        const uniquesalary = childrenCount > 0 && spouseWorks ? 800 : 0;
        const totalallocfam = enfprime + enf10prime + uniquesalary;
        const netSalary = brutSalary - totalRetention + totalallocfam;

        const totalPrimeCompensations = primeCompensations.reduce(
          (total, comp) => total + comp.compensationValue,
          0
        );

        const threeMonthBrut = totalPrimeCompensations * 3;
        const socialSecurityRetentionPrime = Number(
          (threeMonthBrut * 0.09).toFixed(2)
        );
        const imposablePrime = threeMonthBrut - socialSecurityRetentionPrime;
        const irgRetentionPrime = Number((imposablePrime * 0.1).toFixed(2));
        const netPrime =
          threeMonthBrut - socialSecurityRetentionPrime - irgRetentionPrime;

        setPayslipData({
          mainCorp,
          subCorp,
          grade,
          category,
          echelon,
          indiceCat,
          echValue,
          posteSupTitle: posteSupRecord?.posteSup,
          contractType: isContractual ? "تعاقدي" : "عقد دائم",
          contagionLevel,
          baseSalary,
          expSalary,
          princSalary,
          posteSupValue,
          contagionValue,
          interessementValue,
          activeCompensations,
          brutSalary,
          socialSecurityRetention,
          imposableSalary,
          irgRetention,
          totalRetention,
          enfprime,
          enf10prime,
          uniquesalary,
          totalallocfam,
          netSalary,
          primeCompensations,
          totalPrimeCompensations,
          threeMonthBrut,
          socialSecurityRetentionPrime,
          imposablePrime,
          irgRetentionPrime,
          netPrime,
          specialPrimeValue,
          specialPrimePercentage,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.");
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-4 mb-6 print:hidden">
        <Button
          onClick={() => toPDF()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Printer className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Link href="/" passHref>
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>

      <div ref={targetRef}>
        {payslipData && <PrintablePayslip {...payslipData} />}
      </div>
    </div>
  );
}
