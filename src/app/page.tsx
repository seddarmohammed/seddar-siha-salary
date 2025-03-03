import { Header } from "@/components/Header";
import { HomeClient } from "./HomeClient";

export default function Home() {
  return (
    <>
      <Header />
      <div className="grid grid-rows-[1fr_auto] min-h-screen">
        <main className="flex flex-col items-center justify-center px-4 py-8 md:py-16">
          <div className="max-w-4xl w-full space-y-4">
            <div className="text-center space-y-2 md:space-y-3">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                مرحباً بك
              </h1>
              <h2 className="text-lg md:text-xl font-semibold text-violet-500">
                رمضان كريم
              </h2>
              <h3 className="text-sm md:text-base font-medium mb-2">
                لا تترددوا في زيارة مجموعتنا على تيليجرام
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
                يتم تحديث المنصة بناءً على اقتراحاتكم و تعليقاتكم
              </p>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 items-center max-w-md mx-auto mt-2">
              <HomeClient />
            </div>
          </div>
        </main>

        <footer className="py-3 md:py-4 border-t">
          <div className="container mx-auto flex gap-3 md:gap-4 flex-wrap items-center justify-center text-xs md:text-sm">
            {/* <a href="#" className="hover:text-primary">
              تواصل معنا
            </a> */}
            {/* <a href="#" className="hover:text-primary">
              الشروط والأحكام
            </a> */}
            <a
              href="#"
              className="hover:text-slate-400 max-w-[200px] text-center"
            >
              م ع إ - مغنية تلمسان @ 2025
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
