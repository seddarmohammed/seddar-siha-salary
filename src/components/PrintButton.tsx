"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import type { PrintablePayslipProps } from "@/components/PrintablePayslip";

export function PrintButton({
  payslipData,
}: {
  payslipData: PrintablePayslipProps;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        router.push("/print");
      }, 3000); // 3 seconds delay
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, router]);

  const handlePrint = () => {
    try {
      sessionStorage.setItem("payslipData", JSON.stringify(payslipData));
      setIsLoading(true);
    } catch (e) {
      console.error("Failed to prepare print data", e);
      alert("حدث خطأ في تحضير بيانات الطباعة");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePrint}
      className="bg-primary hover:bg-primary/90"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          جاري التحميل...
        </>
      ) : (
        <>
          <Printer className="mr-2 h-4 w-4" />
          طباعة الكشف
        </>
      )}
    </Button>
  );
}
