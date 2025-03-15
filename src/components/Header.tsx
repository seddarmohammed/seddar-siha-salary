// src/components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaTelegramPlane, FaFacebook } from "react-icons/fa";

export function Header() {
  return (
    <header className="fixed top-0 w-full bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-16 h-6 rounded-3xl bg-violet-600 flex items-center justify-center">
            <span className="text-neutral-100 text-m font-normals">صدار</span>
          </div>
          <span className="font-light text-xs">Siha Salary</span>
        </Link>
        <nav className="flex gap-1 items-center">
          <Button className="bg-blue-400 text-neutral-100" size="sm" asChild>
            <Link
              href="https://t.me/+hHSke5Ft7hA3NjA0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row-reverse items-center gap-2"
            >
              <FaTelegramPlane className="h-4 w-4" />
              {/* <span>انضم لمجموعتنا</span> */}
            </Link>
          </Button>
          <Button className="bg-blue-600 text-neutral-100" size="sm" asChild>
            <Link
              href="https://facebook.com/share/16DKzAGzQk/" // Replace with your actual Facebook group URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row-reverse items-center gap-2"
            >
              <FaFacebook className="h-4 w-4" />
              <span>صفحتنا على فيسبوك</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
