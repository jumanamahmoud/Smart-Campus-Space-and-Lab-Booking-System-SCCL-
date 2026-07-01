import type { ProfileFieldError, ProfileFormData } from '@/types/profile';

/** Lowercase letters and digits only — no spaces, capitals, or special characters. */
export const USERNAME_REGEX = /^[a-z0-9]+$/;

const FULL_NAME_REGEX = /^[a-zA-Z\s'.-]{2,100}$/;

const STUDENT_EMAIL_SUFFIX = '@graduate.utm.my';
const ADMIN_EMAIL_SUFFIX = '@utm.my';

/** Malaysia mobile: 01X… or +60 / 60 prefix after normalising separators. */
const MALAYSIA_PHONE_REGEX = /^(?:\+?60|0)1[0-46-9]\d{7,8}$/;

export function normalizePhone(input: string): string {
  return input.replace(/[\s-]/g, '');
}

export function formatMalaysiaPhone(input: string): string {
  const digits = normalizePhone(input);
  if (!digits) return '';

  let local = digits;
  if (local.startsWith('+60')) local = `0${local.slice(3)}`;
  else if (local.startsWith('60')) local = `0${local.slice(2)}`;

  if (local.length === 10) {
    return `${local.slice(0, 3)}-${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (local.length === 11) {
    return `${local.slice(0, 3)}-${local.slice(3, 7)} ${local.slice(7)}`;
  }
  return input.trim();
}

export function validateProfileForm(
  data: ProfileFormData,
  role: 'student' | 'admin' = 'student'
): ProfileFieldError | null {
  const username = data.username.trim();
  const fullName = data.full_name.trim();
  const email = data.email.trim().toLowerCase();
  const phone = normalizePhone(data.phone);

  if (!username) {
    return { field: 'username', message: 'Username is required.' };
  }
  if (username.length < 3 || username.length > 30) {
    return { field: 'username', message: 'Username must be between 3 and 30 characters.' };
  }
  if (!USERNAME_REGEX.test(username)) {
    return {
      field: 'username',
      message: 'Username must use lowercase letters and numbers only (no spaces, capitals, or special characters).',
    };
  }

  if (!fullName) {
    return { field: 'full_name', message: 'Full name is required.' };
  }
  if (!FULL_NAME_REGEX.test(fullName)) {
    return {
      field: 'full_name',
      message: 'Full name may only contain letters, spaces, hyphens, and apostrophes.',
    };
  }

  if (!email) {
    return { field: 'email', message: 'Email is required.' };
  }
  if (role === 'student' && !email.endsWith(STUDENT_EMAIL_SUFFIX)) {
    return { field: 'email', message: 'Student email must end with @graduate.utm.my.' };
  }
  if (role === 'admin' && !email.endsWith(ADMIN_EMAIL_SUFFIX)) {
    return { field: 'email', message: 'Admin email must end with @utm.my.' };
  }

  if (!phone) {
    return { field: 'phone', message: 'Phone number is required.' };
  }
  if (!MALAYSIA_PHONE_REGEX.test(phone)) {
    return {
      field: 'phone',
      message: 'Enter a valid Malaysia mobile number (e.g. 012-345 6789 or +60123456789).',
    };
  }

  return null;
}

export function getEmailHint(role: 'student' | 'admin'): string {
  return role === 'admin'
    ? 'Must be your @utm.my faculty address.'
    : 'Must be your @graduate.utm.my address.';
}
