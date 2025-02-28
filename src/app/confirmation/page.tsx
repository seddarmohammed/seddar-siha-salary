"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Header } from "@/components/Header";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">جاري التحميل...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Get and decode URL parameters
  const getDecodedParam = (param: string) =>
    decodeURIComponent(searchParams.get(param) || "");

  // Initial values from URL
  const initialValues = {
    mainCorp: getDecodedParam("mainCorp"),
    subCorp: getDecodedParam("subCorp"),
    grade: getDecodedParam("grade"),
    echelon: searchParams.get("echelon") || "",
    childrenCount: searchParams.get("childrenCount") || "0",
    olderChildrenCount: searchParams.get("olderChildrenCount") || "0",
    spouseStatus: searchParams.get("spouseStatus") || "false",
  };

  const [childrenCount, setChildrenCount] = useState(
    initialValues.childrenCount
  );
  const [olderChildrenCount, setOlderChildrenCount] = useState(
    initialValues.olderChildrenCount
  );
  const [spouseWorks, setSpouseWorks] = useState(
    initialValues.spouseStatus === "true"
  );

  // Calculate values
  const childrenNum = parseInt(childrenCount) || 0;
  const olderChildrenNum = parseInt(olderChildrenCount) || 0;

  const enfprime = childrenNum * 300;
  const enf10prime = olderChildrenNum * 11.25;
  const uniquesalary = childrenNum > 0 && spouseWorks ? 800 : 0;

  // Validate form and update older children if needed
  useEffect(() => {
    const childrenNum = parseInt(childrenCount, 10);
    const olderChildrenNum = parseInt(olderChildrenCount, 10);

    if (olderChildrenNum > childrenNum) {
      setOlderChildrenCount(childrenCount);
    }

    setIsFormValid(true);
  }, [childrenCount, olderChildrenCount]);

  const handleFinalSubmit = () => {
    setIsLoading(true);
    const queryParams = new URLSearchParams({
      ...initialValues,
      childrenCount,
      olderChildrenCount,
      spouseStatus: spouseWorks.toString(),
    });

    router.push(`/results?${queryParams.toString()}`);
  };

  // Generate children count options (0-5)
  const childrenOptions = Array.from({ length: 6 }, (_, i) => i);

  // Generate older children options based on selected children count
  const olderChildrenOptions = Array.from(
    { length: childrenNum + 1 },
    (_, i) => i
  );

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <div className="container max-w-4xl mx-auto pt-12 pb-8 px-4">
        <Card className="border-zinc-800/10 shadow-lg">
          <CardHeader className="border-b border-zinc-200 pb-4">
            <CardTitle className="text-3xl font-bold text-right text-zinc-900">
              المنح العائلية
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="block text-right text-zinc-800 text-lg font-medium">
                  عدد الأبناء الكلي
                </Label>
                <p className="text-sm text-right text-zinc-500">
                  مبلغ الإعانة: {enfprime.toLocaleString()} دج (عدد الأبناء ×
                  300 دج)
                </p>
                <Select
                  dir="rtl"
                  value={childrenCount}
                  onValueChange={setChildrenCount}
                >
                  <SelectTrigger className="text-right h-14 rounded-lg border-zinc-300 focus:ring-black focus:border-black bg-white">
                    <SelectValue placeholder="اختر عدد الأبناء" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[35vh]" dir="rtl" align="end">
                    {childrenOptions.map((num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        className="h-14 hover:bg-gray-100"
                      >
                        <div className="w-full flex flex-col pr-2 text-right">
                          <span className="text-sm">{num} أبناء</span>
                          <span className="text-sm font-bold text-primary mt-1">
                            {(num * 300).toLocaleString()} دج
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {childrenNum > 0 && (
                <div className="space-y-2">
                  <Label className="block text-right text-zinc-800 text-lg font-medium">
                    الأبناء فوق 10 سنوات
                  </Label>
                  <p className="text-sm text-right text-zinc-500">
                    مبلغ الإعانة: {enf10prime.toLocaleString()} دج (عدد الأبناء
                    فوق 10 سنوات × 11.25 دج)
                  </p>
                  <Select
                    dir="rtl"
                    value={olderChildrenCount}
                    onValueChange={setOlderChildrenCount}
                  >
                    <SelectTrigger className="text-right h-14 rounded-lg border-zinc-300 focus:ring-black focus:border-black bg-white">
                      <SelectValue placeholder="اختر عدد الأبناء فوق 10 سنوات" />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-[35vh]"
                      dir="rtl"
                      align="end"
                    >
                      {olderChildrenOptions.map((num) => (
                        <SelectItem
                          key={num}
                          value={num.toString()}
                          className="h-14 hover:bg-gray-100"
                        >
                          <div className="w-full flex flex-col pr-2 text-right">
                            <span className="text-sm">
                              {num} أبناء فوق 10 سنوات
                            </span>
                            <span className="text-sm font-bold text-primary mt-1">
                              {(num * 11.25).toLocaleString()} دج
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {childrenNum > 0 && (
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base text-zinc-800">
                      منحة الاجر الوحيد
                    </Label>
                    <p className="text-sm text-zinc-500">
                      {spouseWorks
                        ? "الزوج/الزوجة لا يعمل حالياً"
                        : "الزوج/الزوجة يعمل حالياً"}
                    </p>
                    <p className="text-sm text-right text-zinc-500">
                      بدل الزوجة غير العاملة: {uniquesalary.toLocaleString()} دج
                    </p>
                  </div>
                  <div dir="ltr" className="flex flex-col items-start gap-1">
                    <Switch
                      checked={spouseWorks}
                      onCheckedChange={setSpouseWorks}
                      className="switch-component data-[state=checked]:bg-zinc-900"
                    />
                    <span
                      className={`text-sm font-medium ${
                        uniquesalary === 800 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {uniquesalary === 800 ? "مستفيد" : "غير مستفيد"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-6 pb-6 px-6">
            <Button
              className="w-full h-14 text-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
              onClick={handleFinalSubmit}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex gap-2 items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                "تأكيد وإرسال"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
