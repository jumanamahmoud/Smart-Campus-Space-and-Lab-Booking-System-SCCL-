import { NextResponse } from 'next/server';
import { processRequestDecision } from '@/lib/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { decision } = body;

    if (decision !== 'approved' && decision !== 'denied') {
      return NextResponse.json({ text: 'Decision must be approved or denied.' }, { status: 400 });
    }

    const result = await processRequestDecision(id, decision);
    return NextResponse.json({
      message: `Booking request ${decision}.`,
      booking: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process decision.';
    const status = message.includes('already approved') ? 409 : 500;
    return NextResponse.json({ text: message }, { status });
  }
}
