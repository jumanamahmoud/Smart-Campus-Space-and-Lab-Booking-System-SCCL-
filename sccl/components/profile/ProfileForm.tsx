'use client';

import { useEffect, useState } from 'react';
import type { ProfileFieldError, ProfileFormData, UserProfile } from '@/types/profile';
import { getEmailHint, USERNAME_REGEX, validateProfileForm } from '@/lib/profileValidation';

interface ProfileFormProps {
  userId: string;
  role: 'student' | 'admin';
  onSaved: (profile: UserProfile) => void;
}

const emptyForm: ProfileFormData = {
  username: '',
  full_name: '',
  email: '',
  phone: '',
};

const fieldClass = 'sccl-input';

export default function ProfileForm({ userId, role, onSaved }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ProfileFieldError | { text: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
        const result = await response.json();

        if (!response.ok) {
          if (!cancelled) {
            setError({ text: result.text ?? 'Failed to load profile.' });
          }
          return;
        }

        const profile = result.profile as UserProfile;
        if (!cancelled) {
          setForm({
            username: profile.username ?? '',
            full_name: profile.full_name ?? '',
            email: profile.email ?? '',
            phone: profile.phone ?? '',
          });
        }
      } catch {
        if (!cancelled) {
          setError({ text: 'Network error while loading profile.' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    const nextValue = field === 'username' ? value.toLowerCase() : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
    if (error && 'field' in error && error.field === field) {
      setError(null);
    }
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const clientError = validateProfileForm(form, role);
    if (clientError) {
      setError(clientError);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.field) {
          setError({ field: result.field, message: result.text });
        } else {
          setError({ text: result.text ?? 'Failed to update profile.' });
        }
        return;
      }

      const profile = result.profile as UserProfile;
      setForm({
        username: profile.username,
        full_name: profile.full_name ?? '',
        email: profile.email,
        phone: profile.phone ?? '',
      });
      setSuccessMessage('Your profile has been saved.');
      onSaved(profile);
    } catch {
      setError({ text: 'Network error while saving profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sccl-card flex items-center justify-center px-6 py-16">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const fieldError = (field: keyof ProfileFormData) =>
    error && 'field' in error && error.field === field ? error.message : null;

  return (
    <div className="sccl-card-lg max-w-2xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-semibold text-slate-900">
            Username
          </label>
          <input
            id="username"
            required
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={fieldClass}
            autoComplete="username"
            spellCheck={false}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Lowercase letters and numbers only — no spaces, capitals, or special characters.
          </p>
          {fieldError('username') && (
            <p className="mt-1 text-xs font-medium text-red-600">{fieldError('username')}</p>
          )}
          {form.username && !USERNAME_REGEX.test(form.username) && !fieldError('username') && (
            <p className="mt-1 text-xs text-amber-600">Username contains invalid characters.</p>
          )}
        </div>

        <div>
          <label htmlFor="full_name" className="mb-1 block text-sm font-semibold text-slate-900">
            Full name
          </label>
          <input
            id="full_name"
            required
            value={form.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className={fieldClass}
            autoComplete="name"
          />
          {fieldError('full_name') && (
            <p className="mt-1 text-xs font-medium text-red-600">{fieldError('full_name')}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-900">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={fieldClass}
            autoComplete="email"
          />
          <p className="mt-1.5 text-xs text-slate-500">{getEmailHint(role)}</p>
          {fieldError('email') && (
            <p className="mt-1 text-xs font-medium text-red-600">{fieldError('email')}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-slate-900">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={fieldClass}
            placeholder="012-345 6789"
            autoComplete="tel"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Malaysia mobile number (e.g. 012-345 6789 or +60123456789).
          </p>
          {fieldError('phone') && (
            <p className="mt-1 text-xs font-medium text-red-600">{fieldError('phone')}</p>
          )}
        </div>

        {error && !('field' in error) && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.text}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={submitting} className="sccl-btn-primary min-w-[140px]">
            {submitting ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
