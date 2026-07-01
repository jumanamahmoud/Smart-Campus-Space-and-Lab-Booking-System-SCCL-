import { NextResponse } from 'next/server';
import { getAdminBookingById } from '@/lib/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await getAdminBookingById(id);

    if (!booking) {
      return NextResponse.json({ text: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to load booking.' },
      { status: 500 }
    );
  }
}
