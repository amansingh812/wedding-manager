import { describe, expect, it } from "vitest";
import { isPreviewBot, isRsvpLocked, normalizeSubmission, RsvpError } from "@/lib/rsvp";
import { formatAd, formatTime } from "@/lib/format";
import { buildIcs } from "@/lib/ics";
import { seedCeremonies, seedWedding } from "@/lib/data/seed";
import type { InviteView } from "@/lib/types";

const view: InviteView = {
  wedding: seedWedding,
  household: { id: "h1", displayName: "Test", side: "bride", maxGuests: 4, slug: "test-abc123", openedAt: null, openCount: 0 },
  ceremonies: seedCeremonies.filter((c) => ["e-haldi", "e-bibah"].includes(c.id)),
  rsvps: [],
  response: null,
};

describe("normalizeSubmission", () => {
  it("caps headcount at maxGuests and zeroes it when not attending", () => {
    const out = normalizeSubmission(view, {
      answers: [
        { ceremonyId: "e-haldi", attending: true, headcount: 9 },
        { ceremonyId: "e-bibah", attending: false, headcount: 3 },
      ],
      vegCount: 2,
      blessing: "  Shubhakamana  ",
    });
    expect(out.answers).toEqual([
      { ceremonyId: "e-haldi", attending: true, headcount: 4 },
      { ceremonyId: "e-bibah", attending: false, headcount: 0 },
    ]);
    expect(out.blessing).toBe("Shubhakamana");
  });

  it("drops ceremonies the household is not invited to", () => {
    const out = normalizeSubmission(view, {
      answers: [
        { ceremonyId: "e-haldi", attending: true, headcount: 2 },
        { ceremonyId: "e-reception", attending: true, headcount: 2 },
      ],
      vegCount: 0,
      blessing: "",
    });
    expect(out.answers.map((a) => a.ceremonyId)).toEqual(["e-haldi"]);
  });

  it("never lets veg meals exceed the largest confirmed headcount", () => {
    const out = normalizeSubmission(view, {
      answers: [{ ceremonyId: "e-haldi", attending: true, headcount: 2 }],
      vegCount: 4,
      blessing: "",
    });
    expect(out.vegCount).toBe(2);
  });

  it("rejects an empty submission", () => {
    expect(() => normalizeSubmission(view, { answers: [], vegCount: 0, blessing: "" })).toThrow(RsvpError);
  });

  it("raises attending headcount of 0 to 1", () => {
    const out = normalizeSubmission(view, {
      answers: [{ ceremonyId: "e-haldi", attending: true, headcount: 0 }],
      vegCount: 0,
      blessing: "",
    });
    expect(out.answers[0].headcount).toBe(1);
  });
});

describe("isRsvpLocked", () => {
  it("is open on the deadline day in Nepal and locked the day after", () => {
    // 20 Feb 2027 23:00 NPT = 17:15 UTC
    expect(isRsvpLocked("2027-02-20", new Date("2027-02-20T17:15:00Z"))).toBe(false);
    // 21 Feb 2027 00:30 NPT = 20 Feb 18:45 UTC
    expect(isRsvpLocked("2027-02-20", new Date("2027-02-20T18:45:00Z"))).toBe(true);
    expect(isRsvpLocked(null)).toBe(false);
  });
});

describe("isPreviewBot", () => {
  it("detects WhatsApp and Facebook link previews but not phones", () => {
    expect(isPreviewBot("WhatsApp/2.23.20.0 A")).toBe(true);
    expect(isPreviewBot("facebookexternalhit/1.1")).toBe(true);
    expect(
      isPreviewBot("Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"),
    ).toBe(false);
  });
});

describe("format", () => {
  it("formats AD dates without time-zone drift", () => {
    expect(formatAd("2027-02-28")).toBe("Sun, 28 Feb");
    expect(formatAd("2027-03-01")).toBe("Mon, 1 Mar");
  });
  it("formats times", () => {
    expect(formatTime("15:00")).toBe("3 PM");
    expect(formatTime("11:30")).toBe("11:30 AM");
    expect(formatTime("00:00")).toBe("12 AM");
  });
});

describe("buildIcs", () => {
  it("converts Nepal time to UTC", () => {
    const ics = buildIcs(seedWedding, [seedCeremonies.find((c) => c.id === "e-bibah")!], new Date("2026-11-24T00:00:00Z"));
    // 11:00 NPT on 28 Feb = 05:15 UTC
    expect(ics).toContain("DTSTART:20270228T051500Z");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics.split("\r\n").every((l) => Buffer.byteLength(l, "utf8") <= 75)).toBe(true);
  });
});
