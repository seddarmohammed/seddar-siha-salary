"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PrintablePayslip from "@/components/PrintablePayslip";
import { Card, CardContent } from "@/components/ui/card";
import type {
  HealthPractitioner,
  SalaryScale,
  PosteSuperieur,
  CompensationCode,
} from "@/types";

// Define the contagion and interessement levels arrays
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
}

// Helper function to round to nearest 10
function roundToTen(amount: number): number {
  return Math.floor(amount / 10) * 10;
}

// Helper function to calculate IRG
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

export default function PrintPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Extract parameters
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

        // Extract family allocation parameters
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

        // Make API call to get practitioner and salary data
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
        if (!mainCorp || !subCorp || !grade) {
          setError("البيانات المطلوبة غير متوفرة");
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch practitioner data");
        }

        const data = (await response.json()) as {
          practitioner: HealthPractitioner | null;
          salaryScale: SalaryScale | null;
          posteSupRecord: PosteSuperieur | null;
          compensationCodes: CompensationCode[];
        };

        // Type guard for compensation keys
        const isCompensationKey = (
          key: string,
          practitioner: HealthPractitioner | null
        ): key is keyof HealthPractitioner => {
          if (!practitioner) return false;
          return key.startsWith("comp_") && key in practitioner;
        };

        // Calculate family allocations
        const enfprime = childrenCount * 300;
        const enf10prime = olderChildrenCount * 11.25;
        const uniquesalary = childrenCount > 0 && spouseWorks ? 800 : 0;
        const totalallocfam = enfprime + enf10prime + uniquesalary;

        // Get data from API response
        const practitioner = data.practitioner;
        const salaryScale = data.salaryScale;
        const posteSupRecord = data.posteSupRecord;
        const compensationCodes = data.compensationCodes;

        // Get poste supérieur value
        const posteSupValue = posteSupRecord?.indicePosteSup
          ? posteSupRecord.indicePosteSup * 45
          : 0;

        // Get contagion value
        const contagionValue =
          contagionLevels.find((l) => l.level === contagionLevel)?.value || 0;

        // Calculate values
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

        // Get interessement value
        const interessementValue =
          mainCorp === "الممارسين الطبيون المتخصصون"
            ? interessementLevels.find(
                (l) => l.value === Number(interessementLevel)
              )?.value || 0
            : 0;

        // Prime compensations
        // Prime compensations
        const primeCompensations = compensationCodes
          .filter((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(/-/g, "_")}`;
            return (
              isCompensationKey(fieldName, practitioner) &&
              practitioner?.[fieldName] !== null &&
              code.description?.includes("PRIME")
            );
          })
          .map((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(
              /-/g,
              "_"
            )}` as keyof HealthPractitioner;
            const value = Number(practitioner?.[fieldName] ?? 0);
            const compensationValue =
              code.type === "PERCENTAGE" ? princSalary * value : value;
            return {
              nameComp: code.nameComp,
              type: code.type.toString(),
              value: value,
              compensationValue: compensationValue,
            };
          });

        // Active compensations
        const activeCompensations = compensationCodes
          .filter((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(/-/g, "_")}`;
            return (
              isCompensationKey(fieldName, practitioner) &&
              practitioner?.[fieldName] !== null &&
              !code.description?.includes("PRIME")
            );
          })
          .map((code: CompensationCode) => {
            const fieldName = `comp_${code.codeComp.replace(
              /-/g,
              "_"
            )}` as keyof HealthPractitioner;
            const value = Number(practitioner?.[fieldName] ?? 0);
            const compensationValue =
              code.type === "PERCENTAGE" ? princSalary * value : value;
            return {
              nameComp: code.nameComp,
              type: code.type.toString(),
              value: value,
              compensationValue: compensationValue,
            };
          });

        // Calculate total compensation value
        const totalCompensations = activeCompensations.reduce(
          (total, comp) => total + comp.compensationValue,
          0
        );

        // Calculate salaries
        const brutSalary =
          princSalary +
          posteSupValue +
          totalCompensations +
          contagionValue +
          interessementValue;
        const socialSecurityRetention = Number((brutSalary * 0.09).toFixed(2));
        const imposableSalary = roundToTen(
          brutSalary - socialSecurityRetention
        );
        const irgRetention = calculateIRG(imposableSalary);
        const totalRetention = socialSecurityRetention + irgRetention;
        const netSalary =
          brutSalary - socialSecurityRetention - irgRetention + totalallocfam;

        // Calculate prime compensations total
        const totalPrimeCompensations = primeCompensations.reduce(
          (total, comp) => total + comp.compensationValue,
          0
        );

        // 3-month calculations
        const threeMonthBrut = totalPrimeCompensations * 3;
        const socialSecurityRetentionPrime = Number(
          (threeMonthBrut * 0.09).toFixed(2)
        );
        const imposablePrime = threeMonthBrut - socialSecurityRetentionPrime;
        const irgRetentionPrime = Number((imposablePrime * 0.1).toFixed(2));
        const netPrime =
          threeMonthBrut - socialSecurityRetentionPrime - irgRetentionPrime;

        // Set all the data
        setPayslipData({
          mainCorp,
          subCorp,
          grade,
          category,
          echelon,
          indiceCat,
          echValue,
          posteSupTitle: posteSupRecord?.posteSup || "بدون",
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

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {payslipData && <PrintablePayslip {...payslipData} />}
    </div>
  );
}
