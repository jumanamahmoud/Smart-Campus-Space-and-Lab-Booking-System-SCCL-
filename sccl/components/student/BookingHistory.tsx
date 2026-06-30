'use client';

import type { BookingRequest, BookingStatus } from '@/types/booking';

interface BookingHistoryProps {
  bookings: BookingRequest[];
  loading?: boolean;
  onCancel: (requestId: string) => Promise<void>;
  cancelingId?: string | null;
}

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  denied: 'bg-red-100 text-red-700',
  canceled: 'bg-slate-100 text-slate-600',
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BookingHistory({
  bookings,
  loading,
  onCancel,
  cancelingId,
}: BookingHistoryProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="h-64 animate-pulse bg-slate-100" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">You have not made any booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Space
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const canCancel =
                booking.status === 'pending' || booking.status === 'approved';

              return (
                <tr key={booking.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {booking.spaces?.name ?? 'Unknown space'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {booking.spaces?.location ?? '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {formatDate(booking.booking_date)}
                  </td>
                  <td className="max-w-xs px-5 py-4 text-sm text-slate-700">
                    <p className="line-clamp-2">{booking.reason}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => onCancel(booking.id)}
                        disabled={cancelingId === booking.id}
                        className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                      >
                        {cancelingId === booking.id ? 'Canceling...' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
