'use client';

import type { AdminBookingRequest } from '@/types/admin';

interface PendingRequestsTableProps {
  requests: AdminBookingRequest[];
  loading?: boolean;
  onDecision: (requestId: string, decision: 'approved' | 'denied') => Promise<void>;
  processingId?: string | null;
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PendingRequestsTable({
  requests,
  loading,
  onDecision,
  processingId,
}: PendingRequestsTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="h-64 animate-pulse bg-slate-100" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No pending booking requests to review.</p>
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
                Student
              </th>
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
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900">
                    {request.profiles?.username ?? 'Unknown'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {request.profiles?.email ?? '—'}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {request.spaces?.name ?? 'Unknown space'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {request.spaces?.location ?? '—'}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700">
                  {formatDate(request.booking_date)}
                </td>
                <td className="max-w-xs px-5 py-4 text-sm text-slate-700">
                  <p className="line-clamp-2">{request.reason}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onDecision(request.id, 'approved')}
                      disabled={processingId === request.id}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecision(request.id, 'denied')}
                      disabled={processingId === request.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
