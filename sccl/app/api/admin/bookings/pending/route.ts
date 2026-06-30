import { NextResponse } from 'next/server';
import { getPendingBookingRequests } from '@/lib/admin';

export async function GET() {
  try {
    const requests = await getPendingBookingRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to load pending requests.' },
      { status: 500 }
    );
  }
}
