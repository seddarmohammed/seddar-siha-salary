// src/app/next-page/page.tsx
import { ContagionForm } from "./ContagionForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/db";

async function getPostesSuperieurs(mainCorp: string, subCorp: string) {
  return prisma.posteSuperieur.findMany({
    where: {
      mainCorp,
      subCorp,
    },
    orderBy: {
      indicePosteSup: "desc",
    },
  });
}

export default async function NextPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract all parameters properly
  const mainCorp = Array.isArray(searchParams.mainCorp)
    ? searchParams.mainCorp[0]
    : searchParams.mainCorp || "";

  const subCorp = Array.isArray(searchParams.subCorp)
    ? searchParams.subCorp[0]
    : searchParams.subCorp || "";

  const grade = Array.isArray(searchParams.grade)
    ? searchParams.grade[0]
    : searchParams.grade || "";

  const echelon = Array.isArray(searchParams.echelon)
    ? searchParams.echelon[0]
    : searchParams.echelon || "0";

  // Rest of the code remains the same
  const postesSuperieurs =
    mainCorp && subCorp ? await getPostesSuperieurs(mainCorp, subCorp) : [];
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-right">
              الإضافات الوظيفية
            </CardTitle>
            <CardDescription className="text-right">
              اختر المنصب الإداري ومستوى منحة العدوى
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContagionForm
              postesSuperieurs={postesSuperieurs}
              mainCorp={mainCorp}
              subCorp={subCorp}
              grade={grade}
              echelon={echelon}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
