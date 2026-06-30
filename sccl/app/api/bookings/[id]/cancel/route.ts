import { NextResponse } from 'next/server';
import { cancelBookingRequest } from '@/lib/booking';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ text: 'Student ID is required.' }, { status: 400 });
    }

    const result = await cancelBookingRequest(id, studentId);

    if (!result.success) {
      return NextResponse.json(
        { text: result.message ?? 'Failed to cancel booking request.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: result.message });
  } catch {
    return NextResponse.json({ text: 'Failed to cancel booking request.' }, { status: 500 });
  }
}
