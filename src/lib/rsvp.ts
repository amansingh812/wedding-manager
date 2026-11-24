import { z } from "zod";
import type { CeremonyRsvp, InviteView, RsvpSubmission } from "@/lib/types";

export const SLUG_RE = /^[a-z0-9-]{3,80}$/;
export const BLESSING_MAX = 500;

/** Cookie set after a guest first opens their doors, so a return visit skips them. */
export const seenCookie = (slug: string) => `seen_${slug.replace(/-/g, "_")}`;

export const submissionSchema = z.object({
  answers: z
    .array(
      z.object({
        ceremonyId: z.string().min(1).max(64),
        attending: z.boolean(),
        headcount: z.number().int().min(0).max(30),
      }),
    )
    .max(20),
  vegCount: z.number().int().min(0).max(30),
  blessing: z.string().max(BLESSING_MAX * 2),
});

/** Nepal is UTC+05:45 all year (no daylight saving). */
const NPT_OFFSET_MIN = 5 * 60 + 45;

/** RSVPs lock at the end of the deadline day, Nepal time. */
export function isRsvpLocked(deadline: string | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  const [y, m, d] = deadline.split("-").map(Number);
  const endOfDayUtc = Date.UTC(y, m - 1, d, 23, 59, 59) - NPT_OFFSET_MIN * 60_000;
  return now.getTime() > endOfDayUtc;
}

export class RsvpError extends Error {
  constructor(public code: "locked" | "invalid", message: string) {
    super(message);
  }
}

/**
 * Applies the product rules to a guest's submission:
 * - only ceremonies this household is invited to are kept
 * - headcount is 1..maxGuests when attending, 0 when not
 * - veg meals never exceed the largest headcount they confirmed
 * - blessing is trimmed to 500 characters
 */
export function normalizeSubmission(view: InviteView, input: RsvpSubmission): RsvpSubmission {
  const max = view.household.maxGuests;
  const invited = new Set(view.ceremonies.map((c) => c.id));
  const seen = new Set<string>();
  const answers: CeremonyRsvp[] = [];
  for (const a of input.answers) {
    if (!invited.has(a.ceremonyId) || seen.has(a.ceremonyId)) continue;
    seen.add(a.ceremonyId);
    answers.push({
      ceremonyId: a.ceremonyId,
      attending: a.attending,
      headcount: a.attending ? Math.min(Math.max(1, Math.floor(a.headcount)), max) : 0,
    });
  }
  if (answers.length === 0) throw new RsvpError("invalid", "Please answer for at least one ceremony.");
  const maxHeads = Math.max(0, ...answers.map((a) => a.headcount));
  const vegCount = Math.min(Math.max(0, Math.floor(input.vegCount)), maxHeads);
  const blessing = input.blessing.trim().slice(0, BLESSING_MAX);
  return { answers, vegCount, blessing };
}

/** Link-preview bots must not count as an open. */
export function isPreviewBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /whatsapp|facebookexternalhit|facebot|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|googlebot|bingbot|bot\b|crawler|spider|preview/i.test(
    userAgent,
  );
}
