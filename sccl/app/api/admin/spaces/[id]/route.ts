import { NextResponse } from 'next/server';
import { deleteSpace, editSpace } from '@/lib/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const space = await editSpace(id, body);
    return NextResponse.json({ message: 'Space updated successfully.', space });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to update space.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSpace(id);
    return NextResponse.json({ message: 'Space deleted successfully.' });
  } catch (error) {
    return NextResponse.json(
      { text: error instanceof Error ? error.message : 'Failed to delete space.' },
      { status: 500 }
    );
  }
}
