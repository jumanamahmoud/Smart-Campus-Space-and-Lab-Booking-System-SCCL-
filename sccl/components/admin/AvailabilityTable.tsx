'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMonthLabel, shiftMonth, toLocalDateString } from '@/lib/dates';
import { getSpaceCategoryStyle } from '@/lib/spaceMeta';
import type { AvailabilityCell, AvailabilityTableData } from '@/types/admin';

function formatDayHeader(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dayNum: date.getDate(),
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
  if (cell.bookingId) parts.push('Click to view booking');
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </span>
  );
}

function AvailabilityCellPill({
  cell,
  onBookedClick,
}: {
  cell: AvailabilityCell;
  onBookedClick?: (bookingId: string) => void;
}) {
  const tooltip = getCellTooltip(cell);
  const hasBooking = (cell.status === 'pending' || cell.status === 'approved') && cell.bookingId;

  const content =
    cell.status === 'available' ? (
      <CheckIcon className="h-4 w-4 text-[var(--status-available-fg)]" />
    ) : cell.status === 'maintenance' ? (
      <HammerIcon className="h-4 w-4 text-[var(--status-maintenance-fg)]" />
    ) : cell.status === 'pending' ? (
      <ClockIcon className="h-4 w-4 text-[var(--status-pending-fg)]" />
    ) : (
      <LockIcon className="h-4 w-4 text-[var(--status-booked-fg)]" />
    );

  const pillClass =
    cell.status === 'available'
      ? 'sccl-pill-available'
      : cell.status === 'maintenance'
        ? 'sccl-pill-maintenance'
        : cell.status === 'pending'
          ? 'sccl-pill-pending'
          : 'sccl-pill-booked';

  if (hasBooking && onBookedClick) {
    return (
      <button
        type="button"
        onClick={() => onBookedClick(cell.bookingId!)}
        className={`sccl-availability-pill ${pillClass} cursor-pointer transition hover:ring-2 hover:ring-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-300`}
        title={tooltip}
        aria-label={tooltip}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`sccl-availability-pill ${pillClass}`} title={tooltip} aria-label={tooltip}>
      {content}
    </div>
  );
}

function getInitialMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function AvailabilityTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const router = useRouter();
  const [table, setTable] = useState<AvailabilityTableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [{ year, month }, setViewMonth] = useState(getInitialMonth);
  const [filterDate, setFilterDate] = useState<string>('');

  const monthLabel = useMemo(() => getMonthLabel(year, month), [year, month]);

  const monthInputValue = `${year}-${String(month).padStart(2, '0')}`;

  const loadTable = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
      });
      if (filterDate) params.set('date', filterDate);

      const response = await fetch(`/api/admin/availability?${params.toString()}`, {
        cache: 'no-store',
      });
      const result = await response.json();
      if (response.ok) setTable(result.table ?? null);
    } finally {
      setLoading(false);
    }
  }, [year, month, filterDate]);

  useEffect(() => {
    loadTable();
  }, [loadTable, refreshKey]);

  const handleBookedClick = (bookingId: string) => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  const handleMonthInput = (value: string) => {
    if (!value) return;
    const [y, m] = value.split('-').map(Number);
    if (!y || !m) return;
    setViewMonth({ year: y, month: m });
    setFilterDate('');
  };

  const handleDateFilter = (value: string) => {
    setFilterDate(value);
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (y && m) setViewMonth({ year: y, month: m });
    }
  };

  const visibleSpaces = useMemo(() => {
    if (!table) return [];
    if (!filterDate) return table.spaces;

    return table.spaces.filter((space) => {
      const cell = table.grid[space.id]?.[filterDate];
      return cell && (cell.status === 'pending' || cell.status === 'approved');
    });
  }, [table, filterDate]);

  if (loading && !table) {
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
      <div className="sccl-card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMonth((prev) => shiftMonth(prev.year, prev.month, -1))}
            className="sccl-btn-secondary px-3 py-2"
            aria-label="Previous month"
          >
            ←
          </button>
          <div className="min-w-[160px] text-center">
            <p className="text-lg font-bold text-slate-900">{monthLabel}</p>
            <p className="text-xs text-slate-500">Monthly calendar view</p>
          </div>
          <button
            type="button"
            onClick={() => setViewMonth((prev) => shiftMonth(prev.year, prev.month, 1))}
            className="sccl-btn-secondary px-3 py-2"
            aria-label="Next month"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMonth(getInitialMonth());
              setFilterDate('');
            }}
            className="rounded-xl px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Today
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label htmlFor="month-picker" className="mb-1 block text-xs font-semibold text-slate-500">
              Jump to month
            </label>
            <input
              id="month-picker"
              type="month"
              value={monthInputValue}
              onChange={(e) => handleMonthInput(e.target.value)}
              className="sccl-input py-2"
            />
          </div>
          <div>
            <label htmlFor="date-filter" className="mb-1 block text-xs font-semibold text-slate-500">
              Filter by date
            </label>
            <div className="flex gap-2">
              <input
                id="date-filter"
                type="date"
                value={filterDate}
                min={table.startDate}
                max={table.endDate}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="sccl-input py-2"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate('')}
                  className="sccl-btn-secondary shrink-0 px-3 py-2 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sccl-legend">
        <LegendItem label="Available to book" description="Open slot">
          <span className="sccl-availability-pill sccl-pill-available w-14">
            <CheckIcon className="h-4 w-4 text-[var(--status-available-fg)]" />
          </span>
        </LegendItem>
        <LegendItem label="Pending approval" description="Click to view request">
          <span className="sccl-availability-pill sccl-pill-pending w-14">
            <ClockIcon className="h-4 w-4 text-[var(--status-pending-fg)]" />
          </span>
        </LegendItem>
        <LegendItem label="Booked" description="Approved — click to view booking">
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

      {filterDate && visibleSpaces.length === 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No bookings on {formatLongDate(filterDate)}. Clear the filter to see the full month.
        </div>
      )}

      <div className="sccl-card-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="sticky left-0 z-10 min-w-[240px] bg-slate-50/95 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
                  Room
                </th>
                {table.dates.map((date) => {
                  const { weekday, label, dayNum } = formatDayHeader(date);
                  const isFiltered = filterDate === date;
                  const isToday = date === toLocalDateString(new Date());

                  return (
                    <th
                      key={date}
                      className={`min-w-[52px] px-1 py-3 text-center ${
                        isFiltered ? 'bg-brand-50' : ''
                      } ${isToday ? 'ring-1 ring-inset ring-brand-200' : ''}`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {weekday}
                      </div>
                      <div
                        className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? 'bg-brand-600 text-white'
                            : isFiltered
                              ? 'bg-brand-100 text-brand-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {dayNum}
                      </div>
                      {!filterDate && (
                        <div className="mt-0.5 text-[10px] font-medium text-slate-400">{label}</div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filterDate ? visibleSpaces : table.spaces).map((space) => {
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
                      const isFiltered = filterDate === date;

                      return (
                        <td
                          key={date}
                          className={`px-1 py-2 text-center ${isFiltered ? 'bg-brand-50/50' : ''}`}
                        >
                          <div className="flex justify-center">
                            <AvailabilityCellPill cell={cell} onBookedClick={handleBookedClick} />
                          </div>
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
            {filterDate ? (
              <>
                Showing bookings for{' '}
                <span className="font-medium text-slate-700">{formatLongDate(filterDate)}</span>.
                Click a pending or booked cell to open the booking page.
              </>
            ) : (
              <>
                Full month view: {formatLongDate(table.startDate)} –{' '}
                {formatLongDate(table.endDate)}. Click pending or booked cells to view booking details.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
