'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminBookingRequest } from '@/types/admin';

interface PendingRequestsTableProps {
  requests: AdminBookingRequest[];
  loading?: boolean;
  onDecision: (requestId: string, decision: 'approved' | 'denied') => Promise<void>;
  processingId?: string | null;
}

const REASON_PREVIEW_LENGTH = 100;

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ReasonCell({ reason, requestId }: { reason: string; requestId: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = reason.length > REASON_PREVIEW_LENGTH;

  return (
    <div className="min-w-[200px] max-w-md">
      <p
        className={`whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 ${
          !expanded && isLong ? 'line-clamp-3' : ''
        }`}
        title={!expanded && isLong ? reason : undefined}
      >
        {reason}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <Link
          href={`/admin/bookings/${requestId}?from=requests`}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          View details →
        </Link>
      </div>
    </div>
  );
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
              <th className="min-w-[220px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.id} className="align-top hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900">
                    {request.profiles?.username ?? 'Unknown'}
                  </div>
                  <div className="text-sm text-slate-500">{request.profiles?.email ?? '—'}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {request.spaces?.name ?? 'Unknown space'}
                  </div>
                  <div className="text-sm text-slate-500">{request.spaces?.location ?? '—'}</div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {formatDate(request.booking_date)}
                </td>
                <td className="px-5 py-4">
                  <ReasonCell reason={request.reason} requestId={request.id} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
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
