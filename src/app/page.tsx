// src/app/page.tsx
import { Header } from "@/components/Header";
import { HomeClient } from "./HomeClient";

export default function Home() {
  return (
    <>
      <Header />
      <div className="grid grid-rows-[1fr_auto] min-h-screen">
        <main className="flex flex-col items-center justify-center px-4 py-24">
          <div className="max-w-4xl w-full space-y-16">
            <div className="text-center space-y-6">
              <h1 className="text-4xl sm:text-6xl font-bold">مرحباً بك</h1>
              <p className="text-sm text-muted-foreground">
                في خِضَمِّ النقاشات العامة حول أجور العاملين في قطاع الصحة، يطفو
                على السطح إشكالٌ كبير: عجز الإعلام عن تقديم صورة واضحة وعادلة عن
                أنظمة التعويضات، حيث تُختزل الحقائق في عناوين مُضللة أو أرقام
                مجتزأة، مما يُغذّي الجدل ويُهمّش جوهر القضية. أمام هذا العرض
                الباهت وتداول رواتب موظفي الصحة على كل لسان، جاءت فكرة
                محاولةانشاء منصةٍ تُعيد الحق في معرفة المستحقات وتعطي فهما اوضح
                للزيادات الاسمية.
              </p>
            </div>

            <div className="flex flex-col gap-8 items-center max-w-md mx-auto">
              <HomeClient />
            </div>
          </div>
        </main>

        <footer className="py-6 border-t">
          <div className="container mx-auto flex gap-6 flex-wrap items-center justify-center text-sm">
            {/* <a href="#" className="hover:text-primary">
              تواصل معنا
            </a> */}
            {/* <a href="#" className="hover:text-primary">
              الشروط والأحكام
            </a> */}
            <a
              href="#"
              className="hover:text-primary max-w-[200px] text-center"
            >
              خلية الرقمنة المؤسسة العمومية الاستشفائية مغنية - تلمسان -{" "}
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
