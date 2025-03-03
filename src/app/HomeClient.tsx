// File: src/app/HomeClient.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push("/get-started");
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-violet-600 w-full h-12 text-lg text-neutral-100 rounded-full relative"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white">
            {" "}
          </div>
        </div>
      ) : (
        "ابدأ الآن"
      )}
    </Button>
  );
}
