// src/app/layout.tsx
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Import Toaster

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  weight: "variable",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "rtl:text-right",
            classNames: {
              toast: "rtl:font-sans gap-3",
              title: "text-right",
              description: "text-right",
              actionButton: "ml-2",
              cancelButton: "mr-2",
            },
          }}
        />
      </body>
    </html>
  );
}
