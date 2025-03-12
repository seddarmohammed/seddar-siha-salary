// src\app\print\page.tsx
"use client";

import { useState, useEffect } from "react"; // Add missing import
import PrintablePayslip from "@/components/PrintablePayslip";
import type { PrintablePayslipProps } from "@/components/PrintablePayslip";

export default function PrintPage() {
  const [payslipData, setPayslipData] = useState<PrintablePayslipProps | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("payslipData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed.baseSalary === "number") {
          setPayslipData(parsed);
        } else {
          console.error("Invalid payslip data");
        }
      } catch (e) {
        console.error("Data parsing error", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center p-8">جاري التحميل...</div>;
  if (!payslipData)
    return <div className="text-center p-8">لم يتم العثور على بيانات</div>;

  return <PrintablePayslip {...payslipData} />;
}
