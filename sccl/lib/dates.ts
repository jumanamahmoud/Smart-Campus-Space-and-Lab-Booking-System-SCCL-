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
