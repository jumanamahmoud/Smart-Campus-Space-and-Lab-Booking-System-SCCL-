/** Format a Date as YYYY-MM-DD in local time (avoids UTC drift from toISOString). */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today and the next `days - 1` dates as local YYYY-MM-DD strings. */
export function getLocalDateRange(days: number, start = new Date()): string[] {
  const dates: string[] = [];
  const anchor = new Date(start);
  anchor.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + i);
    dates.push(toLocalDateString(date));
  }

  return dates;
}

/** All dates in a calendar month (month is 1–12). */
export function getMonthDateRange(year: number, month: number): string[] {
  const dates: string[] = [];
  const cursor = new Date(year, month - 1, 1);
  cursor.setHours(0, 0, 0, 0);

  while (cursor.getMonth() === month - 1) {
    dates.push(toLocalDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function parseDateString(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
