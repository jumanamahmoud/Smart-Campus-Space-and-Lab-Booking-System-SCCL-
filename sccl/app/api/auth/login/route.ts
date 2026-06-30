import { NextResponse } from 'next/server';
import { supabase } from '../../../../supabase'; // Using your working relative path

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 1. Accept identifier (can be email OR username) from the frontend payload
    const { identifier, password } = body;

    // Basic validation backup checking the correct frontend variable
    if (!identifier || !password) {
      return NextResponse.json(
        { text: 'Please fill in all fields.' }, 
        { status: 400 }
      );
    }

    let targetEmail = identifier.trim();

    // 2. USERNAME BRIDGE: If it doesn't contain an '@', treat it as a username lookup
    if (!targetEmail.includes('@')) {
      const { data: profileData, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', targetEmail)
        .maybeSingle(); // Prevents throwing hard crashes if username doesn't exist

      if (lookupError || !profileData) {
        // Obfuscate the error message for security so malicious actors can't scrape usernames
        return NextResponse.json(
          { text: 'Invalid username/email or password.' }, 
          { status: 400 }
        );
      }
      
      // Successfully resolved the username to the account's actual email!
      targetEmail = profileData.email;
    }

    // 3. Authenticate the user with Supabase Auth using the resolved email string
    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: password,
    });

    if (error) {
      // Handles wrong password, email not found, etc.
      return NextResponse.json(
        { text: 'Invalid email/username or password.' }, 
        { status: 400 }
      );
    }

    // 4. Fetch the user's role from your custom profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { text: 'User profile not found.' }, 
        { status: 404 }
      );
    }

    // Return the successful login token data along with their user context role
    return NextResponse.json({
      message: 'Authentication successful.',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: profile.username,
        role: profile.role // This tells your app if they are a student or admin
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { text: 'Internal Server Login Error' }, 
      { status: 500 }
    );
  }
}