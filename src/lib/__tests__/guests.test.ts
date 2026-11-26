import { describe, expect, it } from "vitest";
import { makeSlug, normalizePhone, parsePaste, parseSide } from "../guests";

describe("normalizePhone", () => {
  it("reads Nepal mobiles in common formats", () => {
    expect(normalizePhone("9812345678")).toBe("+9779812345678");
    expect(normalizePhone("981-234 5678")).toBe("+9779812345678");
    expect(normalizePhone("+977 9812345678")).toBe("+9779812345678");
    expect(normalizePhone("009779812345678")).toBe("+9779812345678");
    expect(normalizePhone("9779812345678")).toBe("+9779812345678");
  });
  it("reads Indian mobiles", () => {
    expect(normalizePhone("7012345678")).toBe("+917012345678");
    expect(normalizePhone("9876543210")).toBe("+9779876543210"); // 98… without a code = Nepal (most guests)
    expect(normalizePhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalizePhone("919876543210")).toBe("+919876543210");
  });
  it("rejects junk", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("call me")).toBeNull();
  });
});

describe("parseSide", () => {
  it("accepts friendly words", () => {
    expect(parseSide("Groom")).toBe("groom");
    expect(parseSide("both")).toBe("common");
    expect(parseSide("B")).toBe("bride");
    expect(parseSide("uncle")).toBeNull();
  });
});

describe("makeSlug", () => {
  it("is readable, valid and random-tailed", () => {
    const s = makeSlug("Dr. R.K. Sharma & Family", () => 0);
    expect(s).toBe("dr-r-k-sharma-family-aaaaaa");
    expect(s).toMatch(/^[a-z0-9-]{3,80}$/);
    expect(makeSlug("राम परिवार", () => 0)).toBe("guest-aaaaaa");
  });
});

describe("parsePaste", () => {
  it("parses tab-separated rows from Excel and skips the header", () => {
    const rows = parsePaste("Name\tPhone\tSide\tGuests\tGroup\nJha Family\t9812345678\tgroom\t4\tDarbhanga\nOffice\t\t\t\t");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ displayName: "Jha Family", phone: "+9779812345678", side: "groom", maxGuests: 4, groupTag: "Darbhanga", problems: [] });
    expect(rows[1]).toMatchObject({ displayName: "Office", phone: null, side: "common", maxGuests: 2 });
  });
  it("parses CSV and flags problems per row", () => {
    const rows = parsePaste("Sharma,123,uncle,50", "bride");
    expect(rows[0].problems).toEqual([
      'phone "123" not recognised',
      'side "uncle" should be groom, bride or common',
      'guests "50" should be 1–30',
    ]);
    expect(rows[0].side).toBe("bride");
  });
});

import { fillMessage, whatsappUrl } from "../guests";

describe("WhatsApp message", () => {
  it("fills {name} and {link}, appending the link if missing", () => {
    expect(fillMessage("Namaste {name}! {link}", "Jha ji", "https://x/invite/a")).toBe("Namaste Jha ji! https://x/invite/a");
    expect(fillMessage("Namaste 🙏", "A", "https://x/i")).toBe("Namaste 🙏\nhttps://x/i");
  });
  it("builds a wa.me link with digits only and encoded text", () => {
    expect(whatsappUrl("+9779812345678", "Hi & bye")).toBe("https://wa.me/9779812345678?text=Hi%20%26%20bye");
  });
});
