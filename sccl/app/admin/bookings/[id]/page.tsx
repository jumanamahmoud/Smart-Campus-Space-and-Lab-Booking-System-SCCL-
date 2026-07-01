'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/student/AlertModal';
import type { AdminBookingRequest } from '@/types/admin';
import type { UserSession } from '@/types/booking';

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    denied: 'bg-red-50 text-red-700 ring-red-100',
    canceled: 'bg-slate-100 text-slate-600 ring-slate-200',
  };
  return styles[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [from, setFrom] = useState<string | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<AdminBookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const backLink = useMemo(() => {
    if (from === 'requests') {
      return { href: '/admin/dashboard?tab=requests', label: '← Back to review requests' };
    }
    return { href: '/admin/dashboard?tab=availability', label: '← Back to availability' };
  }, [from]);

  useEffect(() => {
    setFrom(new URLSearchParams(window.location.search).get('from'));
  }, []);

  useEffect(() => {
    params.then((p) => setBookingId(p.id));
  }, [params]);

  const loadBooking = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) {
        setAlert({ title: 'Not found', message: result.text ?? 'Booking could not be loaded.' });
        setBooking(null);
        return;
      }
      setBooking(result.booking);
    } catch {
      setAlert({ title: 'Network error', message: 'Failed to load booking details.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sessionRaw = localStorage.getItem('user_session');
    if (!sessionRaw) {
      router.replace('/login');
      return;
    }

    try {
      const session = JSON.parse(sessionRaw) as UserSession;
      if (session.role !== 'admin') {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }

    if (bookingId) loadBooking(bookingId);
  }, [router, bookingId, loadBooking]);

  const handleDecision = async (decision: 'approved' | 'denied') => {
    if (!booking) return;
    setProcessing(true);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const result = await response.json();

      if (!response.ok) {
        setAlert({
          title: decision === 'approved' ? 'Approval failed' : 'Denial failed',
          message: result.text ?? 'Could not process request.',
        });
        return;
      }

      setSuccessMessage(`Booking request ${decision}.`);
      await loadBooking(booking.id);
    } catch {
      setAlert({ title: 'Network error', message: 'Failed to process request.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb]">
        <p className="text-sm text-slate-500">Loading booking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={backLink.href}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {backLink.label}
        </Link>

        <div className="mb-6">
          <h1 className="sccl-heading">Request Details</h1>
          <p className="sccl-subheading">Full booking request information for admin review.</p>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {!booking ? (
          <div className="sccl-card p-8 text-center">
            <p className="text-sm text-slate-500">Booking not found.</p>
          </div>
        ) : (
          <div className="sccl-card-lg divide-y divide-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1 ring-inset ${statusBadge(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Request ID: {booking.id.slice(0, 8)}…</p>
                <p className="mt-1">Submitted {formatDateTime(booking.created_at)}</p>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <DetailField label="Space">
                <p className="font-semibold text-slate-900">
                  {booking.spaces?.name ?? 'Unknown space'}
                </p>
                <p className="text-sm text-slate-500">{booking.spaces?.location ?? '—'}</p>
                <p className="text-sm text-slate-500">
                  {booking.spaces?.type ?? '—'}
                  {booking.spaces?.capacity != null && ` · Capacity ${booking.spaces.capacity}`}
                </p>
                {booking.spaces?.status && (
                  <p className="mt-1 text-xs capitalize text-slate-400">
                    Space status: {booking.spaces.status}
                  </p>
                )}
              </DetailField>
              <DetailField label="Booking date">
                <p className="font-semibold text-slate-900">{formatDate(booking.booking_date)}</p>
              </DetailField>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <DetailField label="Student username">
                <p className="font-semibold text-slate-900">
                  {booking.profiles?.username ?? 'Unknown'}
                </p>
              </DetailField>
              <DetailField label="Full name">
                <p className="font-semibold text-slate-900">
                  {booking.profiles?.full_name ?? '—'}
                </p>
              </DetailField>
              <DetailField label="Email">
                <p className="text-sm text-slate-700">{booking.profiles?.email ?? '—'}</p>
              </DetailField>
              <DetailField label="Phone">
                <p className="text-sm text-slate-700">{booking.profiles?.phone ?? '—'}</p>
              </DetailField>
            </div>

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason for booking
              </p>
              <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                  {booking.reason}
                </p>
              </div>
            </div>

            {booking.status === 'pending' && (
              <div className="flex flex-wrap gap-3 p-6">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('approved')}
                  className="sccl-btn-primary"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('denied')}
                  className="sccl-btn-secondary"
                >
                  Deny
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {alert && (
        <AlertModal title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
      )}
    </div>
  );
}
