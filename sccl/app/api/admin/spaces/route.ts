import { NextResponse } from 'next/server';
import { addSpace } from '@/lib/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, capacity, type, status } = body;

    if (!name?.trim() || !location?.trim() || !capacity || !type?.trim() || !status) {
      return NextResponse.json({ text: 'All space fields are required.' }, { status: 400 });
    }

    const space = await addSpace({
      name,
      location,
      capacity: Number(capacity),
      type,
      status,
    });

    return NextResponse.json({ message: 'Space added successfully.', space }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to add space.' },
      { status: 500 }
    );
  }
}
