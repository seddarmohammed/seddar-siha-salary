"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define a proper interface for the component props
interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  bgColor?: string;
  textColor?: string;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  bgColor = "bg-white",
  textColor = "text-primary",
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden border ${bgColor}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between"
      >
        <h3 className={`text-xl font-semibold ${textColor}`}>{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
};
