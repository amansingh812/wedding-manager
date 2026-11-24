"use server";

import { getStore } from "@/lib/data/store";
import { RsvpError, SLUG_RE, submissionSchema } from "@/lib/rsvp";
import type { InviteView } from "@/lib/types";

export type RsvpResult = { ok: true; view: InviteView } | { ok: false; error: string };

export async function submitRsvp(slug: string, raw: unknown): Promise<RsvpResult> {
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
    return { ok: false, error: "This invitation link isn't valid." };
  }
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Something in the form didn't look right. Please try again." };
  try {
    const view = await getStore().saveRsvp(slug, parsed.data);
    return { ok: true, view };
  } catch (e) {
    if (e instanceof RsvpError) return { ok: false, error: e.message };
    console.error("submitRsvp failed", e);
    return { ok: false, error: "We couldn't save your RSVP. Please try again in a moment." };
  }
}
