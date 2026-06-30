'use client';

import { getSpaceCategoryStyle } from '@/lib/spaceMeta';
import type { AvailabilityCell, AvailabilityTableData } from '@/types/admin';

interface AvailabilityTableProps {
  table: AvailabilityTableData | null;
  loading?: boolean;
}

function formatDayHeader(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

function formatLongDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCellTooltip(cell: AvailabilityCell) {
  if (cell.status === 'available') return 'Available to book';
  if (cell.status === 'maintenance') return 'Under maintenance';
  const statusLabel = cell.status === 'pending' ? 'Pending approval' : 'Approved booking';
  const parts = [statusLabel, cell.label];
  if (cell.reason) parts.push(cell.reason);
  return parts.filter(Boolean).join(' — ');
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function HammerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      />
    </svg>
  );
}

function AvailabilityCellPill({ cell }: { cell: AvailabilityCell }) {
  const tooltip = getCellTooltip(cell);

  if (cell.status === 'available') {
    return (
      <div
        className="sccl-availability-pill sccl-pill-available"
        title={tooltip}
        aria-label={tooltip}
      >
        <CheckIcon className="h-4 w-4 text-[var(--status-available-fg)]" />
      </div>
    );
  }

  if (cell.status === 'maintenance') {
    return (
      <div
        className="sccl-availability-pill sccl-pill-maintenance"
        title={tooltip}
        aria-label={tooltip}
      >
        <HammerIcon className="h-4 w-4 text-[var(--status-maintenance-fg)]" />
      </div>
    );
  }

  return (
    <div
      className="sccl-availability-pill sccl-pill-booked"
      title={tooltip}
      aria-label={tooltip}
    >
      <LockIcon className="h-4 w-4 text-[var(--status-booked-fg)]" />
    </div>
  );
}

function LegendItem({
  children,
  label,
  description,
}: {
  children: React.ReactNode;
  label: string;
  description?: string;
}) {
  return (
    <span className="inline-flex items-center gap-3">
      {children}
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description && (
          <span className="block text-xs text-slate-500">{description}</span>
        )}
      </span>
    </span>
  );
}

export default function AvailabilityTable({ table, loading }: AvailabilityTableProps) {
  if (loading) {
    return (
      <div className="sccl-card-lg">
        <div className="h-96 animate-pulse bg-slate-100" />
      </div>
    );
  }

  if (!table || table.spaces.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No spaces available to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sccl-legend">
        <LegendItem label="Available to book" description="Open slot">
          <span className="sccl-availability-pill sccl-pill-available w-14">
            <CheckIcon className="h-4 w-4 text-[var(--status-available-fg)]" />
          </span>
        </LegendItem>
        <LegendItem label="Booked" description="Pending or approved">
          <span className="sccl-availability-pill sccl-pill-booked w-14">
            <LockIcon className="h-4 w-4 text-[var(--status-booked-fg)]" />
          </span>
        </LegendItem>
        <LegendItem label="Under maintenance" description="Temporarily closed">
          <span className="sccl-availability-pill sccl-pill-maintenance w-14">
            <HammerIcon className="h-4 w-4 text-[var(--status-maintenance-fg)]" />
          </span>
        </LegendItem>
      </div>

      <div className="sccl-card-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="sticky left-0 z-10 min-w-[240px] bg-slate-50/95 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
                  Room
                </th>
                {table.dates.map((date) => {
                  const { weekday, label } = formatDayHeader(date);
                  return (
                    <th
                      key={date}
                      className="min-w-[76px] px-2 py-3 text-center text-slate-500"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {weekday}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-400">{label}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.spaces.map((space) => {
                const { icon, iconBg } = getSpaceCategoryStyle(space.type);

                return (
                  <tr key={space.id} className="transition-colors hover:bg-brand-50/30">
                    <td className="sticky left-0 z-10 bg-white px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${iconBg}`}
                        >
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{space.name}</p>
                          <p className="truncate text-sm text-slate-500">{space.location}</p>
                        </div>
                      </div>
                    </td>
                    {table.dates.map((date) => {
                      const cell = table.grid[space.id]?.[date] ?? {
                        status: 'available' as const,
                        label: 'Available',
                      };

                      return (
                        <td key={date} className="px-2 py-3">
                          <AvailabilityCellPill cell={cell} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-xs leading-relaxed text-slate-500">
            Hover cells to see booking details. Showing 14 days from{' '}
            <span className="font-medium text-slate-700">{formatLongDate(table.startDate)}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
