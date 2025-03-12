// src/components/PrintablePayslip.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export interface PrintablePayslipProps {
  // Practitioner and personal info
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

  // Salary components
  baseSalary: number;
  expSalary: number;
  princSalary: number;
  posteSupValue: number;
  contagionValue: number;
  interessementValue: number;

  // Compensations
  activeCompensations: Array<{
    nameComp: string;
    type: string;
    value: number;
    compensationValue: number;
  }>;

  // Totals
  brutSalary: number;
  socialSecurityRetention: number;
  imposableSalary: number;
  irgRetention: number;
  totalRetention: number;

  // Family allocations
  enfprime: number;
  enf10prime: number;
  uniquesalary: number;
  totalallocfam: number;

  // Net salary
  netSalary: number;

  // Prime compensations
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

const PrintablePayslip: React.FC<PrintablePayslipProps> = (props) => {
  const {
    mainCorp,
    grade,
    category,
    echelon,
    indiceCat,
    echValue,
    // posteSupTitle,
    // contractType,
    // contagionLevel,

    baseSalary,
    expSalary,
    princSalary,
    posteSupValue,
    contagionValue,
    interessementValue,

    activeCompensations,

    brutSalary,
    socialSecurityRetention,
    // imposableSalary,
    irgRetention,
    totalRetention,

    // enfprime,
    // enf10prime,
    // uniquesalary,
    totalallocfam,

    netSalary,

    primeCompensations,
    // totalPrimeCompensations,
    threeMonthBrut,
    socialSecurityRetentionPrime,
    // imposablePrime,
    irgRetentionPrime,
    netPrime,
  } = props;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatNumber = (num: number | undefined | null) => {
    // Handle all invalid number cases
    const safeNum = Number(num) || 0;
    return safeNum.toLocaleString("ar-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div>
      <style type="text/css" media="print">
        {`
          @page {
            size: A4;
            margin: 10mm 20mm 20mm 20mm;
          }
          .print-container {
            width: 155mm;
            min-height: 260mm;
            padding: 0;
            margin: 0 auto;
          }
        `}
      </style>

      <div className="print-container bg-white p-1 print:p-1 text-[9pt] print:text-[10pt] mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-2 print:mb-3">
          <h1 className="text-[14pt] print:text-[18pt] font-bold mb-0 leading-tight">
            كشف الراتب
          </h1>
          <div className="text-[9pt] print:text-[10pt] mt-1">
            {formattedDate}
          </div>
        </div>

        {/* Tight Practitioner Info Grid */}
        <div className="grid grid-cols-2 gap-1 mb-3 text-[8pt] print:text-[9pt]">
          <div className="flex items-center border-b py-0.5 h-5">
            <span>السلك:</span>
            <span className="font-bold">{mainCorp}</span>
          </div>
          <div className="flex items-center border-b py-0.5 h-5">
            <span>الرتبة:</span>
            <span className="font-bold ">{grade}</span>
          </div>
          <div className="flex items-center border-b py-0.5 h-5">
            <span>الصنف:</span>
            <span className="font-bold">
              {category} ({indiceCat})
            </span>
          </div>
          <div className="flex items-center border-b py-0.5 h-5">
            <span>الدرجة:</span>
            <span className="font-bold">
              {echelon}({echValue})
            </span>
          </div>
        </div>

        {/* Salary Details Section */}
        <div className="mb-2 print:mb-3">
          <h2 className="text-[10pt] print:text-[12pt] font-bold mb-1 text-primary text-right">
            تفاصيل الراتب
          </h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="text-right p-1 border w-3/5">الراتب الأساسي</td>
                <td className="text-right p-1 border w-2/5 font-semibold">
                  {formatNumber(baseSalary)}
                </td>
              </tr>
              <tr>
                <td className="text-right p-1 border">تعويض الخبرة المهنية</td>
                <td className="text-right p-1 border font-semibold">
                  {formatNumber(expSalary)}
                </td>
              </tr>
              {posteSupValue > 0 && (
                <tr>
                  <td className="text-right p-1 border">المنصب العالي</td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(posteSupValue)}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td className="text-right p-1 border font-semibold">
                  الراتب الرئيسي
                </td>
                <td className="text-right p-1 border font-semibold">
                  {formatNumber(princSalary)}
                </td>
              </tr>

              {activeCompensations.map((comp, index) => (
                <tr key={index}>
                  <td className="text-right p-1 border">
                    {comp.nameComp}
                    <span className="text-[7pt] text-gray-500 mr-1">
                      {comp.type === "PERCENTAGE"
                        ? `(${(Number(comp.value || 0) * 100).toFixed(0)}%)`
                        : `(${formatNumber(comp.value)} دج)`}
                    </span>
                  </td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(comp.compensationValue)}
                  </td>
                </tr>
              ))}

              {contagionValue > 0 && (
                <tr>
                  <td className="text-right p-1 border">
                    التعويض عن خطر العدوى
                  </td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(contagionValue)}
                  </td>
                </tr>
              )}
              {interessementValue > 0 && (
                <tr>
                  <td className="text-right p-1 border">علاوة الانتفاع</td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(interessementValue)}
                  </td>
                </tr>
              )}

              <tr className="bg-gray-100">
                <td className="text-right p-1 border font-bold">الأجر الخام</td>
                <td className="text-right p-1 border font-bold">
                  {formatNumber(brutSalary)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions Section */}
        <div className="mb-2 print:mb-3">
          <h2 className="text-[10pt] print:text-[12pt] font-bold mb-1 text-red-800 text-right">
            الاقتطاعات
          </h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="text-right p-1 border w-3/5">
                  الضمان الاجتماعي (9%)
                </td>
                <td className="text-right p-1 border w-2/5 font-semibold">
                  {formatNumber(socialSecurityRetention)}
                </td>
              </tr>
              <tr>
                <td className="text-right p-1 border">الضريبة على الدخل</td>
                <td className="text-right p-1 border font-semibold">
                  {formatNumber(irgRetention)}
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="text-right p-1 border font-semibold">
                  إجمالي الاقتطاعات
                </td>
                <td className="text-right p-1 border font-semibold">
                  {formatNumber(totalRetention)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Family Allocations */}
        {totalallocfam > 0 && (
          <div className="mb-2 print:mb-3">
            <h2 className="text-[10pt] print:text-[12pt] font-bold mb-1 text-blue-800 text-right">
              المنح العائلية
            </h2>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-blue-50">
                  <td className="text-right p-1 border w-3/5">
                    إجمالي المنح العائلية
                  </td>
                  <td className="text-right p-1 border w-2/5 font-semibold">
                    {formatNumber(totalallocfam)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Net Salary */}
        <div className="mb-2 print:mb-3">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-green-50">
                <td className="text-right p-1 border w-3/5 font-bold">
                  الراتب الصافي
                </td>
                <td className="text-right p-1 border font-bold">
                  {formatNumber(netSalary)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Prime Compensation */}
        {primeCompensations.length > 0 && (
          <div className="mb-2 print:mb-3">
            <h2 className="text-[10pt] print:text-[12pt] font-bold mb-1 text-primary text-right">
              {primeCompensations[0]?.nameComp}
            </h2>
            <table className="w-full border-collapse">
              <tbody>
                {primeCompensations.map((comp, index) => (
                  <tr key={index}>
                    <td className="text-right p-1 border w-3/5">
                      {comp.nameComp}
                      <span className="text-[7pt] text-gray-500 mr-1">
                        {comp.type === "PERCENTAGE"
                          ? `(${(Number(comp.value) * 100).toFixed(0)}%)`
                          : `(${formatNumber(comp.value)} دج)`}
                      </span>
                    </td>
                    <td className="text-right p-1 border w-2/5 font-semibold">
                      {formatNumber(comp.compensationValue)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td className="text-right p-1 border">
                    مبلغ العلاوة الفصلية
                  </td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(threeMonthBrut)}
                  </td>
                </tr>
                <tr className="bg-red-50">
                  <td className="text-right p-1 border">
                    الضمان الاجتماعي (9%)
                  </td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(socialSecurityRetentionPrime)}
                  </td>
                </tr>
                <tr className="bg-red-50">
                  <td className="text-right p-1 border">
                    الضريبة على الدخل (10%)
                  </td>
                  <td className="text-right p-1 border font-semibold">
                    {formatNumber(irgRetentionPrime)}
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="text-right p-1 border font-bold">
                    الصافي النهائي (3 أشهر)
                  </td>
                  <td className="text-right p-1 border font-bold">
                    {formatNumber(netPrime)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 print:mt-8 print:mb-4 text-[7pt] print:text-[8pt] text-gray-600">
          <p>تم إنشاء هذا الكشف عبر منصة </p>
          <b>صدار صحة Salaries</b>
        </div>
      </div>

      {/* Print Button */}
      <div className="print:hidden mt-4 flex justify-center">
        <Button
          onClick={handlePrint}
          className="bg-primary rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg"
          aria-label="طباعة الكشف"
        >
          <Printer className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default PrintablePayslip;
