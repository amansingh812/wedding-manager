/** Pure helpers for the guest list (no server or DB imports, so they're unit-testable). */

export type Side = "groom" | "bride" | "common";

/**
 * Turn what people type or paste into E.164 (+9779812345678).
 * No country code: 10-digit numbers starting 97/98 are Nepal mobiles; other 10-digit
 * numbers starting 6–9 are Indian mobiles. Returns null if it doesn't look like a phone.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().replace(/[\s\-().]/g, "");
  if (s === "") return null;
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("+")) return /^\+[0-9]{8,15}$/.test(s) ? s : null;
  if (!/^[0-9]+$/.test(s)) return null;
  if (s.length === 13 && s.startsWith("977")) return "+" + s;
  if (s.length === 12 && s.startsWith("91")) return "+" + s;
  if (s.length === 11 && s.startsWith("0")) s = s.slice(1); // 09812345678 / 09876543210
  if (s.length === 10 && /^9[78]/.test(s)) return "+977" + s;
  if (s.length === 10 && /^[6-9]/.test(s)) return "+91" + s;
  return null;
}

export function parseSide(raw: string | null | undefined): Side | null {
  const s = (raw ?? "").trim().toLowerCase();
  if (["groom", "g", "boy", "groom side", "ketā", "keta"].includes(s)) return "groom";
  if (["bride", "b", "girl", "bride side", "keti"].includes(s)) return "bride";
  if (["common", "both", "c", "friends", "office"].includes(s)) return "common";
  return null;
}

/** Readable, unguessable invite slug: "sharma-parivar-k4m2x9". */
export function makeSlug(name: string, random: () => number = Math.random): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  let tail = "";
  for (let i = 0; i < 6; i++) tail += abc[Math.floor(random() * abc.length)];
  return `${base || "guest"}-${tail}`;
}

export type ImportRow = {
  line: number;
  displayName: string;
  phone: string | null;
  side: Side;
  maxGuests: number;
  groupTag: string | null;
  problems: string[];
};

/**
 * Parse rows pasted from Excel / Google Sheets (tab separated) or CSV.
 * Columns: Name, Phone, Side, Guests, Group. A header row is skipped automatically.
 */
export function parsePaste(text: string, defaultSide: Side = "common"): ImportRow[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const rows: ImportRow[] = [];
  lines.forEach((raw, i) => {
    if (raw.trim() === "") return;
    const cells = (raw.includes("\t") ? raw.split("\t") : raw.split(",")).map((c) => c.trim());
    const [name = "", phoneRaw = "", sideRaw = "", guestsRaw = "", group = ""] = cells;
    if (i === 0 && /^(name|household|family|guest)/i.test(name) && !/\d{6,}/.test(phoneRaw)) return; // header
    const problems: string[] = [];
    const displayName = name.slice(0, 80);
    if (!displayName) problems.push("missing name");
    const phone = normalizePhone(phoneRaw);
    if (phoneRaw && !phone) problems.push(`phone "${phoneRaw}" not recognised`);
    const side = sideRaw ? parseSide(sideRaw) : defaultSide;
    if (sideRaw && !side) problems.push(`side "${sideRaw}" should be groom, bride or common`);
    let maxGuests = 2;
    if (guestsRaw) {
      const n = Number(guestsRaw);
      if (Number.isInteger(n) && n >= 1 && n <= 30) maxGuests = n;
      else problems.push(`guests "${guestsRaw}" should be 1–30`);
    }
    rows.push({ line: i + 1, displayName, phone, side: side ?? defaultSide, maxGuests, groupTag: group.slice(0, 40) || null, problems });
  });
  return rows;
}
