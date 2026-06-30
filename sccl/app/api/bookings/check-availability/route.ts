import { NextResponse } from 'next/server';
import { checkDateAvailability } from '@/lib/booking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spaceId, requestedDate } = body;

    if (!spaceId || !requestedDate) {
      return NextResponse.json(
        { text: 'spaceId and requestedDate are required.' },
        { status: 400 }
      );
    }

    const result = await checkDateAvailability(spaceId, requestedDate);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ text: 'Failed to check availability.' }, { status: 500 });
  }
}
