// app/api/salary-scales/[cat]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { cat: string } }
) {
  const scale = await prisma.salaryScale.findUnique({
    where: { cat: params.cat },
  });

  return NextResponse.json(scale);
}