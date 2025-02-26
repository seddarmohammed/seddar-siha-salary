// src/app/get-started/GetStartedForm.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MinusCircle, PlusCircle } from "lucide-react";
import type { HealthPractitioner, SalaryScale } from "@/types";

// Define the interface for EchelonSelector props
interface EchelonSelectorProps {
  isContractual?: boolean;
  value?: string;
  onChange: (value: string) => void;
  salaryScale: SalaryScale | null;
}

// Updated EchelonSelector component with circular progress
const EchelonSelector = (props: EchelonSelectorProps) => {
  const { isContractual = false, value = "0", onChange, salaryScale } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentValue, setCurrentValue] = useState(parseInt(value));

  const maxValue = isContractual ? 32 : 12;

  useEffect(() => {
    setCurrentValue(parseInt(value));
  }, [value]);

  const handleIncrement = () => {
    if (currentValue < maxValue) {
      const newValue = currentValue + 1;
      setCurrentValue(newValue);
      if (onChange) {
        onChange(newValue.toString());
      }
    }
  };

  const handleDecrement = () => {
    if (currentValue > 0) {
      const newValue = currentValue - 1;
      setCurrentValue(newValue);
      if (onChange) {
        onChange(newValue.toString());
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    if (Math.abs(diff) > 20) {
      if (diff > 0) {
        handleDecrement();
      } else {
        handleIncrement();
      }
      setStartX(currentX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const calculateSalaryValue = () => {
    if (isContractual) {
      return (currentValue * 1.4).toFixed(1);
    } else {
      // Type assertion to ensure TypeScript recognizes the key
      const echelonKey = `Ech${currentValue}` as keyof SalaryScale;
      return salaryScale?.[echelonKey]?.toString() || "0";
    }
  };

  const progressPercentage = (currentValue / maxValue) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-50 to-transparent opacity-70 pointer-events-none" />

      <div className="text-center mb-3">
        <p className="text-gray-500 text-sm">
          {isContractual ? "حدد عدد السنوات" : "حدد الدرجة المناسبة"}
        </p>
      </div>

      <div
        className="touch-selector relative py-6 mb-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={handleDecrement}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-200 transition-colors"
            disabled={currentValue === 0}
          >
            <MinusCircle
              className={`w-6 h-6 ${
                currentValue === 0 ? "text-gray-300" : "text-gray-700"
              }`}
            />
          </button>

          <div className="flex-1 mx-3 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-32 h-32">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-primary transition-all duration-300 ease-out"
                    strokeDasharray="282.7"
                    strokeDashoffset={
                      282.7 - (progressPercentage / 100) * 282.7
                    }
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-sm">
                    <span className="text-4xl font-bold text-black">
                      {currentValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleIncrement}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-200 transition-colors"
            disabled={currentValue === maxValue}
          >
            <PlusCircle
              className={`w-6 h-6 ${
                currentValue === maxValue ? "text-gray-300" : "text-gray-700"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="text-center mt-3">
        <div className="text-xs text-gray-500">
          {isContractual
            ? `الرقم الاستدلالي للدرجة = ${currentValue} × 1.4 = ${calculateSalaryValue()}`
            : `الرقم الاستدلالي للدرجة : ${calculateSalaryValue()}`}
        </div>
      </div>
    </div>
  );
};

interface GetStartedFormProps {
  practitioners: HealthPractitioner[];
}

export function GetStartedForm({ practitioners }: GetStartedFormProps) {
  const router = useRouter();
  const [selectedMainCorp, setSelectedMainCorp] = useState<string>("");
  const [selectedSubCorp, setSelectedSubCorp] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [salaryScale, setSalaryScale] = useState<SalaryScale | null>(null);
  const [selectedEchelon, setSelectedEchelon] = useState<string>("0");
  const isContractual = selectedMainCorp === "الأعوان المتعاقدين";

  const [options, setOptions] = useState({
    mainCorps: [] as { value: string; label: string }[],
    subCorps: [] as { value: string; label: string }[],
    grades: [] as { value: string; label: string }[],
  });

  useEffect(() => {
    if (practitioners.length > 0) {
      const uniqueMainCorps = Array.from(
        new Set(practitioners.map((p) => p.mainCorp))
      ).sort();

      setOptions((prev) => ({
        ...prev,
        mainCorps: uniqueMainCorps.map((corp) => ({
          value: corp,
          label: corp,
        })),
      }));
    }
  }, [practitioners]);

  // Update the useEffect for mainCorp selection
  useEffect(() => {
    if (selectedMainCorp) {
      const filteredPractitioners = practitioners.filter(
        (p) => p.mainCorp === selectedMainCorp
      );

      const uniqueSubCorps = Array.from(
        new Set(filteredPractitioners.map((p) => p.subCorp))
      ).sort();

      // Auto-select if only one subcorp
      if (uniqueSubCorps.length === 1) {
        setSelectedSubCorp(uniqueSubCorps[0]);
      }

      setOptions((prev) => ({
        ...prev,
        subCorps: uniqueSubCorps.map((corp) => ({
          value: corp,
          label: corp,
        })),
      }));
      setSelectedGrade("");
      setCategory("");
    }
  }, [selectedMainCorp, practitioners]);

  // Update the useEffect for subCorp selection
  useEffect(() => {
    if (selectedMainCorp && selectedSubCorp) {
      const filteredPractitioners = practitioners.filter(
        (p) => p.mainCorp === selectedMainCorp && p.subCorp === selectedSubCorp
      );

      const uniqueGrades = Array.from(
        new Set(filteredPractitioners.map((p) => p.grade))
      ).sort();

      // Auto-select if only one grade
      if (uniqueGrades.length === 1) {
        setSelectedGrade(uniqueGrades[0]);
      }

      setOptions((prev) => ({
        ...prev,
        grades: uniqueGrades.map((grade) => ({
          value: grade,
          label: grade,
        })),
      }));
      setCategory("");
    }
  }, [selectedMainCorp, selectedSubCorp, practitioners]);

  useEffect(() => {
    if (selectedMainCorp && selectedSubCorp && selectedGrade) {
      const matchingPractitioner = practitioners.find(
        (p) =>
          p.mainCorp === selectedMainCorp &&
          p.subCorp === selectedSubCorp &&
          p.grade === selectedGrade
      );

      if (matchingPractitioner) {
        setCategory(matchingPractitioner.category);
        fetch(`/api/salary-scales/${matchingPractitioner.category}`)
          .then((res) => res.json())
          .then((data) => {
            setSalaryScale(data);
            setSelectedEchelon("0");
          })
          .catch(console.error);
      }
    }
  }, [selectedMainCorp, selectedSubCorp, selectedGrade, practitioners]);

  const handleMainCorpChange = (value: string) => {
    setSelectedMainCorp(value);
  };

  const handleSubCorpChange = (value: string) => {
    setSelectedSubCorp(value);
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
  };

  const handleSubmit = () => {
    router.push(
      `/next-page?mainCorp=${encodeURIComponent(
        selectedMainCorp
      )}&subCorp=${encodeURIComponent(
        selectedSubCorp
      )}&grade=${encodeURIComponent(selectedGrade)}&echelon=${selectedEchelon}`
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          dir="rtl"
          value={selectedMainCorp}
          onValueChange={handleMainCorpChange}
        >
          <SelectTrigger className="text-right h-10 rounded-2xl">
            <SelectValue placeholder="اختر الفئة الرئيسية" />
          </SelectTrigger>
          <SelectContent>
            {options.mainCorps.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[20vh] w-[var(--radix-select-trigger-width)]">
        <Select
          dir="rtl"
          value={selectedSubCorp}
          onValueChange={handleSubCorpChange}
          disabled={!selectedMainCorp}
        >
          <SelectTrigger className="text-right h-10 rounded-2xl">
            <SelectValue placeholder="اختر الفئة الفرعية" />
          </SelectTrigger>
          <SelectContent>
            {options.subCorps.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Select
          dir="rtl"
          value={selectedGrade}
          onValueChange={handleGradeChange}
          disabled={!selectedSubCorp}
        >
          <SelectTrigger className="text-right h-10 rounded-2xl">
            <SelectValue placeholder="اختر الدرجة" />
          </SelectTrigger>
          <SelectContent>
            {options.grades.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {category && salaryScale && (
        <div className="space-y-1">
          <div className="flex justify-between items-center bg-gray-100 p-1 px-4 rounded-lg">
            <div className="space-y-0 text-right">
              <span className="text-sm font-medium text-gray-600">التصنيف</span>
              <div className="text-2xl font-bold">{category}</div>
            </div>
            <div className="space-y-0">
              <span className="text-sm font-medium text-gray-600">المؤشر</span>
              <div className="text-2xl font-bold">{salaryScale?.indiceCat}</div>
            </div>
          </div>

          <EchelonSelector
            isContractual={isContractual}
            value={selectedEchelon}
            onChange={setSelectedEchelon}
            salaryScale={salaryScale}
          />
        </div>
      )}

      <Button
        className="w-full mt-6 h-12 text-lg rounded-full relative"
        onClick={handleSubmit}
        disabled={
          !selectedMainCorp ||
          !selectedSubCorp ||
          !selectedGrade ||
          !category ||
          !selectedEchelon
        }
      >
        متابعة
      </Button>
    </div>
  );
}

export default GetStartedForm;
