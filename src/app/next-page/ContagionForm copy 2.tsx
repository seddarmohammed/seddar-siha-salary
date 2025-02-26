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
  { level: "0", value: 0 },
  { level: "1", value: 8000 },
  { level: "2", value: 10000 },
  { level: "3", value: 12000 },
  { level: "4", value: 17000 },
  { level: "5", value: 24000 },
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
    useState<string>("0");

  const handleSubmit = () => {
    const queryParams = new URLSearchParams({
      mainCorp: encodeURIComponent(mainCorp),
      subCorp: encodeURIComponent(subCorp),
      grade: encodeURIComponent(grade),
      echelon: echelon,
      posteSup: selectedPosteSup,
      contagionLevel: selectedLevel,
      interessementLevel: selectedInteressement,
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
              <SelectValue placeholder="اختر المنصب الإداري" />
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
            <SelectTrigger className="text-right h-14 rounded-lg">
              <SelectValue placeholder="اختر مستوى منحة المشاركة من 0 إلى 5" />
            </SelectTrigger>
            <SelectContent className="max-h-96">
              {interessementLevels.map((option) => (
                <SelectItem
                  key={option.level}
                  value={option.level}
                  className="h-14 hover:bg-gray-100"
                >
                  <div className="w-full grid grid-cols-2 items-center py-2 px-4">
                    <span className="text-base justify-self-start">
                      المستوى {option.level}
                    </span>
                    <span className="text-base justify-self-end text-left">
                      {option.value.toLocaleString()} دج
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        className="w-full mt-6"
        onClick={handleSubmit}
        disabled={
          !selectedLevel || (postesSuperieurs.length > 0 && !selectedPosteSup)
        }
      >
        عرض النتائج
      </Button>
    </div>
  );
}
