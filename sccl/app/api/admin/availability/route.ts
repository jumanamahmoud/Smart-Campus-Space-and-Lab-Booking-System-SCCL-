import { NextResponse } from 'next/server';
import { generateAvailabilityTable } from '@/lib/admin';

export async function GET() {
  try {
    const table = await generateAvailabilityTable();
    return NextResponse.json({ table });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to generate availability table.' },
      { status: 500 }
    );
  }
}
