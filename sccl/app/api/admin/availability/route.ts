import { NextResponse } from 'next/server';
import { generateAvailabilityTable } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');
  const filterDate = searchParams.get('date');

  const year = yearParam ? Number(yearParam) : undefined;
  const month = monthParam ? Number(monthParam) : undefined;

  if (yearParam && Number.isNaN(year)) {
    return NextResponse.json({ text: 'Invalid year parameter.' }, { status: 400 });
  }
  if (monthParam && (Number.isNaN(month) || month! < 1 || month! > 12)) {
    return NextResponse.json({ text: 'Invalid month parameter.' }, { status: 400 });
  }

  try {
    const table = await generateAvailabilityTable({
      year,
      month,
      filterDate,
    });
    return NextResponse.json({ table });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to generate availability table.' },
      { status: 500 }
    );
  }
}
