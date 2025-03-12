// src/app/page.tsx
import { Header } from "@/components/Header";
import { HomeClient } from "./HomeClient";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Main Content Container */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-8 space-y-8 md:space-y-12 pb-8 md:pb-12">
          {" "}
          {/* Space between Header and CTA */}
          <section className="pt-20 md:pt-12">
            {" "}
            {/* Added top padding */}
            <div className="bg-gradient-to-t from-gray-200 to-gray-200 rounded-xl shadow-lg p-6 md:p-8">
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-violet-600">
                  مرحباً بك
                </h2>
                <p className="text-neutral-500 max-w-md mx-auto">
                  منصة لإدارة وحساب مستحقات مهنيي قطاع الصحة بطريقة سهلة وسريعة
                  في اسلوب يليق بمقام منتسبي القطاع بعيدا عن صخب وسذاجة الطرح
                </p>
                <div className="max-w-xs mx-auto">
                  <HomeClient />
                </div>
              </div>
            </div>
          </section>
          {/* Space between CTA and Testimonials */}
          <section className="pt-0 md:pt-8">
            <TestimonialsCarousel />
          </section>
        </div>
      </div>

      {/* Space between Testimonials and Footer */}
      <footer className="py-2 md:py-2 border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                م ع إ - مغنية تلمسان @ 2025
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
