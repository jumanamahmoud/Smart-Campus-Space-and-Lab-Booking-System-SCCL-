import { supabaseServer } from '@/lib/supabaseServer';
import { formatMalaysiaPhone, validateProfileForm } from '@/lib/profileValidation';
import type { ProfileFormData, UserProfile } from '@/types/profile';

function formatSupabaseError(context: string, error: { message: string; code?: string }) {
  console.error(`[${context}]`, error);
  return `${context}: ${error.message}`;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('id, username, email, full_name, phone, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseError('Failed to load profile', error));
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  form: ProfileFormData
): Promise<{ success: boolean; profile?: UserProfile; field?: string; message?: string }> {
  const { data: existing, error: fetchError } = await supabaseServer
    .from('profiles')
    .select('id, username, email, role')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, message: formatSupabaseError('Failed to load profile', fetchError) };
  }
  if (!existing || (existing.role !== 'student' && existing.role !== 'admin')) {
    return { success: false, message: 'Profile not found.' };
  }

  const role = existing.role as 'student' | 'admin';
  const validationError = validateProfileForm(form, role);
  if (validationError) {
    return { success: false, field: validationError.field, message: validationError.message };
  }

  const username = form.username.trim();
  const email = form.email.trim().toLowerCase();
  const fullName = form.full_name.trim();
  const phone = formatMalaysiaPhone(form.phone);

  if (username !== existing.username) {
    const { data: duplicate, error: duplicateError } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (duplicateError) {
      return {
        success: false,
        message: formatSupabaseError('Failed to verify username', duplicateError),
      };
    }
    if (duplicate) {
      return { success: false, field: 'username', message: 'This username is already taken.' };
    }
  }

  if (email !== existing.email) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return {
        success: false,
        field: 'email',
        message: 'Email cannot be changed until the server service role key is configured.',
      };
    }

    const { error: authError } = await supabaseServer.auth.admin.updateUserById(userId, {
      email,
    });

    if (authError) {
      return { success: false, field: 'email', message: authError.message };
    }
  }

  const { data, error } = await supabaseServer
    .from('profiles')
    .update({
      username,
      email,
      full_name: fullName,
      phone,
    })
    .eq('id', userId)
    .select('id, username, email, full_name, phone, role')
    .single();

  if (error) {
    if (error.code === '42501') {
      return {
        success: false,
        message:
          'Permission denied. Run supabase/migrations/004_student_profile_fields.sql in the Supabase SQL Editor.',
      };
    }
    if (error.code === '23505') {
      return { success: false, field: 'username', message: 'This username is already taken.' };
    }
    return { success: false, message: formatSupabaseError('Failed to update profile', error) };
  }

  return { success: true, profile: data };
}
