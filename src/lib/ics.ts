import type { Ceremony, Wedding } from "@/lib/types";

const NPT_OFFSET_MIN = 5 * 60 + 45;

/** Local Nepal date + time → UTC basic format "20270228T051500Z". */
function toUtcStamp(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const ms = Date.UTC(y, m - 1, d, hh, mm) - NPT_OFFSET_MIN * 60_000 + addMinutes * 60_000;
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets as RFC 5545 requires. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (start === 0 ? 75 : 74), bytes.length);
    // don't split a multi-byte character
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
  }
  return parts.join("\r\n ");
}

export function buildIcs(wedding: Wedding, ceremonies: Ceremony[], now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WeddingManager//Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(wedding.title)}`,
  ];
  for (const c of ceremonies) {
    const where = [c.venueName, c.venueCity].filter(Boolean).join(", ");
    lines.push("BEGIN:VEVENT", `UID:${c.id}@wedding-manager`, `DTSTAMP:${stamp}`);
    if (c.startsAt) {
      lines.push(`DTSTART:${toUtcStamp(c.eventDate, c.startsAt)}`);
      lines.push(c.endsAt ? `DTEND:${toUtcStamp(c.eventDate, c.endsAt)}` : `DTEND:${toUtcStamp(c.eventDate, c.startsAt, 180)}`);
    } else {
      const d = c.eventDate.replace(/-/g, "");
      lines.push(`DTSTART;VALUE=DATE:${d}`);
    }
    lines.push(`SUMMARY:${esc(`${c.name} · ${wedding.title}`)}`);
    if (where) lines.push(`LOCATION:${esc(where)}`);
    const desc = [`${c.dateBs} (BS)`, c.dressCode ? `Dress: ${c.dressCode}` : null, c.mapUrl].filter(Boolean).join("\n");
    lines.push(`DESCRIPTION:${esc(desc)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
