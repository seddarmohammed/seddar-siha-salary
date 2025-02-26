// src/app/get-started/page.tsx
import { GetStartedForm } from "./GetStartedForm";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/components/Header";

async function getHealthPractitioners() {
  return prisma.healthPractitioner.findMany({
    orderBy: {
      mainCorp: "asc",
    },
  }); // Removed the take: 1000 limit
}

export default async function GetStarted() {
  const practitioners = await getHealthPractitioners();
  console.log("Retrieved practitioners:", practitioners); // Add this line

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 pb-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            {/* <CardTitle className="text-2xl text-right">اختر تخصصك</CardTitle> */}
            <CardDescription className="text-right">
              قم باختيار التصنيف المناسب لوظيفتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GetStartedForm practitioners={practitioners} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
