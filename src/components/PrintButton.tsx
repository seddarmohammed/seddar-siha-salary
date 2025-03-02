// src/components/PrintButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const router = useRouter();

  const handlePrint = () => {
    const queryParams = new URLSearchParams(searchParams).toString();
    router.push(`/print?${queryParams}`);
  };

  return (
    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
      <Printer className="mr-2 h-4 w-4" />
      طباعة الكشف
    </Button>
  );
}
