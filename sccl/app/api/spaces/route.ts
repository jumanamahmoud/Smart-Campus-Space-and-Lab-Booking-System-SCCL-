import { NextResponse } from 'next/server';
import { supabase } from '../../../supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('spaces')
    .select('id, name, location, capacity, type, status')
    .order('name');

  if (error) {
    return NextResponse.json(
      { text: 'Failed to load campus spaces.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ spaces: data ?? [] });
}
