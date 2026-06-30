import { NextResponse } from 'next/server';
import { supabase } from '../../../../supabase'; // Keeps your working relative import path

const SECRET_ADMIN_PASSCODE = "UTM-MJIIT-2026";

// CLEANED BACKEND REGEX: Matches the frontend perfectly
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*~])(?=.{8,})/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, role, staffId, adminCode } = body;

    // ---- SERVER-SIDE VALIDATION BACKUPS ----
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json({ field: 'password', text: 'Password requirements not met.' }, { status: 400 });
    }

    // FIX: Checks for standard institutional 'graduate@utm.my' format
    if (role === 'student' && !email.endsWith('@graduate.utm.my')) {
      return NextResponse.json({ field: 'email', text: 'Invalid Student Email Domain.' }, { status: 400 });
    }

    if (role === 'admin') {
      if (!email.endsWith('@utm.my')) {
        return NextResponse.json({ field: 'email', text: 'Invalid faculty email.' }, { status: 400 });
      }
      if (!staffId?.startsWith("UTM")) {
        return NextResponse.json({ field: 'staffId', text: 'Invalid Staff ID.' }, { status: 400 });
      }
      if (adminCode !== SECRET_ADMIN_PASSCODE) {
        return NextResponse.json({ field: 'adminCode', text: 'Invalid administrative authorization pass.' }, { status: 400 });
      }
    }

    // ---- SUPABASE AUTH & DATABASE INTEGRATION ----
    // 1. Register the core credentials inside Supabase Auth management system
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role } // Custom metadata parameters
      }
    });

    if (authError) {
      return NextResponse.json({ field: 'email', text: authError.message }, { status: 400 });
    }

    // 2. Insert contextual details into your custom structural table mapping profiles
    // Ensure you create a 'profiles' table in your Supabase dashboard workspace
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user?.id, // Syncing the Auth UID record
          username,
          email,
          role,
          staff_id: role === 'admin' ? staffId : null,
          created_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      return NextResponse.json({ field: 'username', text: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User successfully provisioned.' }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ text: 'Internal Server Request Compile Error' }, { status: 500 });
  }
}