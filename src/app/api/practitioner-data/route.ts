// src/app/api/practitioner-data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const mainCorp = decodeURIComponent(searchParams.get('mainCorp') || '');
    const subCorp = decodeURIComponent(searchParams.get('subCorp') || '');
    const grade = decodeURIComponent(searchParams.get('grade') || '');
    // const echelon = searchParams.get('echelon') || '0';
    const posteSup = searchParams.get('posteSup') || '';
    // const contagionLevel = searchParams.get('contagionLevel') || '0';
    // const interessementLevel = searchParams.get('interessementLevel') || '0';

    // 1. Get practitioner
    const practitioner = await prisma.healthPractitioner.findFirst({
      where: { 
        mainCorp,
        subCorp,
        grade 
      },
    });

    if (!practitioner) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    // 2. Get salary scale
    const salaryScale = await prisma.salaryScale.findUnique({
      where: { cat: practitioner.category },
    });

    // 3. Get poste supérieur
    const posteSupRecord = posteSup && posteSup !== "none" 
      ? await prisma.posteSuperieur.findUnique({
          where: { id: parseInt(posteSup) },
        })
      : null;

    // 4. Get compensation codes
    const compensationCodes = await prisma.compensationCode.findMany();

    return NextResponse.json({
      practitioner,
      salaryScale,
      posteSupRecord,
      compensationCodes,
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practitioner data' },
      { status: 500 }
    );
  }
}