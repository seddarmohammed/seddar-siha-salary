// src/app/next-page/ContagionForm.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PosteSuperieur } from "@/types";

const contagionLevels = [
  { level: "غير مستفيد", value: 0 },
  { level: "خطر عدوى متوسط الصنف 3", value: 2500 },
  { level: "خطر عدوى متوسط الصنف 2", value: 3000 },
  { level: "خطر عدوى متوسط الصنف 1", value: 4000 },
  { level: "خطر عدوى عال", value: 5800 },
  { level: "خطر عدوى عال جدا", value: 7200 },
];

const interessementLevels = [
  { level: "غير مستفيد", value: "0" },
  { level: "ممارس متخصص مساعد", value: 8000 },
  { level: "رئيس وحدة", value: 10000 },
  { level: "رئيس مصلحة", value: 12000 },
];

interface ContagionFormProps {
  postesSuperieurs: PosteSuperieur[];
  mainCorp: string;
  subCorp: string;
  grade: string;
  echelon: string;
}

export function ContagionForm({
  postesSuperieurs,
  mainCorp,
  subCorp,
  grade,
  echelon,
}: ContagionFormProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedPosteSup, setSelectedPosteSup] = useState<string>("");
  const [selectedInteressement, setSelectedInteressement] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async () => {
    setIsLoading(true); // Activate loading state
    // إضافة تأخير 50 مللي ثانية لضمان عرض الحالة
    await new Promise((resolve) => setTimeout(resolve, 50));
    const queryParams = new URLSearchParams({
      mainCorp: encodeURIComponent(mainCorp),
      subCorp: encodeURIComponent(subCorp),
      grade: encodeURIComponent(grade),
      echelon: echelon,
      posteSup: selectedPosteSup,
      contagionLevel: selectedLevel,
      interessementLevel:
        interessementLevels
          .find((l) => l.value === selectedInteressement)
          ?.value.toString() || "0",
    });

    router.push(`/results?${queryParams.toString()}`);
  };

  // Add "No Position" option to postesSuperieurs
  const posteOptions = [
    {
      id: "none",
      posteSup: "لا أشغل أي منصب عال",
      nivposteSup: "0",
      indicePosteSup: 0,
    },
    ...postesSuperieurs,
  ];

  return (
    <div className="space-y-6">
      {/* Poste Supérieur Selection */}
      {postesSuperieurs.length > 0 && (
        <div className="space-y-2">
          <Select
            dir="rtl"
            value={selectedPosteSup}
            onValueChange={setSelectedPosteSup}
          >
            <SelectTrigger className="text-right h-14 rounded-lg w-full">
              <SelectValue placeholder="اختر المنصب العالي" />
            </SelectTrigger>
            <SelectContent
              className="max-h-96 w-[var(--radix-select-trigger-width)]"
              dir="rtl"
              align="end"
            >
              {posteOptions.map((poste) => (
                <SelectItem
                  key={poste.id}
                  value={poste.id.toString()}
                  className="h-14 hover:bg-gray-100"
                >
                  <div className="w-full grid grid-cols-[auto_1fr] items-center gap-4 pr-2">
                    <span className="text-sm font-bold text-primary">
                      {poste.indicePosteSup.toLocaleString()}
                    </span>
                    <div className="text-right">
                      <div className="text-xs font-medium">
                        {poste.posteSup}
                      </div>
                      {poste.id !== "none" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          المستوى: {poste.nivposteSup}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Contagion Level Selection */}

      <div className="space-y-2">
        <Select
          dir="rtl"
          value={selectedLevel}
          onValueChange={setSelectedLevel}
        >
          <SelectTrigger className="text-right h-14 rounded-lg w-full">
            <SelectValue placeholder="اختر مستوى منحة العدوى" />
          </SelectTrigger>
          <SelectContent
            className="max-h-[35vh] w-[var(--radix-select-trigger-width)]" // Changed from max-h-96
            dir="rtl"
            align="end"
          >
            {" "}
            {contagionLevels.map((option) => (
              <SelectItem
                key={option.level}
                value={option.level}
                className="h-14 hover:bg-gray-100"
              >
                <div className="w-full flex justify-between items-center pr-2 text-right">
                  <span className="text-xs">{option.level} </span>
                </div>
                <div className="w-full grid grid-cols-[auto_1fr] items-center gap-4 pr-2">
                  <span className="text-sm font-bold text-primary">
                    {option.value.toLocaleString()} دج
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Interessement Prime - Only for specific mainCorp */}
      {mainCorp === "الممارسين الطبيون المتخصصون" && (
        <div className="space-y-2">
          <Select
            dir="rtl"
            value={selectedInteressement}
            onValueChange={setSelectedInteressement}
          >
            <SelectTrigger className="text-right h-14 rounded-lg w-full">
              <SelectValue placeholder="اختر مستوى علاوة الانتفاع" />
            </SelectTrigger>
            <SelectContent
              className="max-h-[35vh] w-[var(--radix-select-trigger-width)]"
              dir="rtl"
              align="end"
            >
              {interessementLevels.map((option) => (
                <SelectItem
                  key={option.level}
                  value={option.level}
                  className="h-14 hover:bg-gray-100"
                >
                  <div className="w-full flex justify-between items-center pr-2 text-right">
                    <span className="text-xs">{option.level} </span>
                  </div>
                  <div className="w-full grid grid-cols-[auto_1fr] items-center gap-4 pr-2">
                    <span className="text-sm font-bold text-primary">
                      {option.value.toLocaleString()} دج
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Added note here */}
          <p className="text-xs text-muted-foreground text-right pr-2">
            ملاحظة: تمنح علاوة الانتفاع للممارسين الطبيين المتخصصين شريطة التخلي
            عن النشاط التكميلي لمدة دنيا تقدر بخمس 5 سنوات .تدمج في الراتب بعد
            طلب المعني ودراسة الملف الإداري.
          </p>
        </div>
      )}

      <Button
        className="w-full mt-6"
        onClick={handleSubmit}
        disabled={
          !selectedLevel ||
          (postesSuperieurs.length > 0 && !selectedPosteSup) ||
          isLoading // Add loading to disabled condition
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
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
            <span>جاري حساب راتبك</span>
          </div>
        ) : (
          "عرض النتائج"
        )}
      </Button>
    </div>
  );
}

export default ContagionForm;
