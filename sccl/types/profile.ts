export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'student' | 'admin';
}

/** @deprecated Use UserProfile */
export type StudentProfile = UserProfile;

export interface ProfileFormData {
  username: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface ProfileFieldError {
  field: keyof ProfileFormData;
  message: string;
}
