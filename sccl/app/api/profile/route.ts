import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/lib/profile';
import type { ProfileFormData } from '@/types/profile';

function resolveUserId(searchParams: URLSearchParams, body?: Record<string, unknown>): string | null {
  return (
    searchParams.get('userId') ??
    searchParams.get('studentId') ??
    (typeof body?.userId === 'string' ? body.userId : null) ??
    (typeof body?.studentId === 'string' ? body.studentId : null)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = resolveUserId(searchParams);

  if (!userId) {
    return NextResponse.json({ text: 'User ID is required.' }, { status: 400 });
  }

  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      return NextResponse.json({ text: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ text: 'Failed to load profile.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = resolveUserId(new URL(request.url).searchParams, body);
    const { username, full_name, email, phone } = body as ProfileFormData & {
      userId?: string;
      studentId?: string;
    };

    if (!userId) {
      return NextResponse.json({ text: 'User ID is required.' }, { status: 400 });
    }

    const result = await updateUserProfile(userId, {
      username: username ?? '',
      full_name: full_name ?? '',
      email: email ?? '',
      phone: phone ?? '',
    });

    if (!result.success) {
      return NextResponse.json(
        { field: result.field, text: result.message ?? 'Failed to update profile.' },
        { status: result.field ? 400 : 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully.',
      profile: result.profile,
    });
  } catch {
    return NextResponse.json({ text: 'Failed to update profile.' }, { status: 500 });
  }
}
