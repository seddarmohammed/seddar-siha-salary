// src/components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-16 h-8 rounded-3xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-normal">
              صدار
            </span>
          </div>
          <span className="font-bold text-lg">Health-Salary</span>
        </Link>
        <nav className="flex gap-6 items-center">
          <Button variant="outline" size="sm">
            التواصل
          </Button>
        </nav>
      </div>
    </header>
  );
}
