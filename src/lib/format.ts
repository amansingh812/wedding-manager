const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2027-02-27" → "Sat, 27 Feb". Parsed as a calendar date, never shifted by time zone. */
export function formatAd(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]}, ${d} ${MONTHS[m - 1]}`;
}

/** "2027-02-28" → "28 Feb 2027" */
export function formatAdLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "15:00" → "3 PM", "11:30" → "11:30 AM" */
export function formatTime(t: string | null): string | null {
  if (!t) return null;
  const [h, min] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return min ? `${h12}:${String(min).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

/** Whole days from now until an ISO date (Nepal time), never negative. */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  const targetUtc = Date.UTC(y, m - 1, d) - (5 * 60 + 45) * 60_000;
  return Math.max(0, Math.ceil((targetUtc - now.getTime()) / 86_400_000));
}
