'use client';

import type { BookingRequest, BookingStatus } from '@/types/booking';

interface BookingHistoryProps {
  bookings: BookingRequest[];
  loading?: boolean;
  onCancel: (requestId: string) => Promise<void>;
  cancelingId?: string | null;
}

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  denied: 'bg-red-50 text-red-700',
  canceled: 'bg-gray-100 text-gray-600',
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
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="h-64 animate-pulse bg-gray-100" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">You have not made any booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Space
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const canCancel =
                booking.status === 'pending' || booking.status === 'approved';

              return (
                <tr key={booking.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {booking.spaces?.name ?? 'Unknown space'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.spaces?.location ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {formatDate(booking.booking_date)}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-sm text-gray-700">
                    <p className="line-clamp-2">{booking.reason}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => onCancel(booking.id)}
                        disabled={cancelingId === booking.id}
                        className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                      >
                        {cancelingId === booking.id ? 'Canceling...' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
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
