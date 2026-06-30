import { NextResponse } from 'next/server';
import {
  getStudentBookingHistory,
  submitBookingRequest,
} from '@/lib/booking';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ text: 'Student ID is required.' }, { status: 400 });
  }

  try {
    const bookings = await getStudentBookingHistory(studentId);
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ text: 'Failed to load booking history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, spaceId, bookingDate, reason } = body;

    if (!studentId || !spaceId || !bookingDate || !reason?.trim()) {
      return NextResponse.json(
        { text: 'Student ID, space ID, booking date, and reason are required.' },
        { status: 400 }
      );
    }

    const result = await submitBookingRequest(studentId, spaceId, bookingDate, reason);

    if (!result.success) {
      return NextResponse.json(
        { text: result.message ?? 'Selected date is not available.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: result.message, booking: result.booking },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ text: 'Failed to submit booking request.' }, { status: 500 });
  }
}
