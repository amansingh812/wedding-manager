import "server-only";
import type { CeremonyRsvp, HouseholdResponse, InviteView, RsvpSubmission } from "@/lib/types";
import { isRsvpLocked, normalizeSubmission, RsvpError, SLUG_RE } from "@/lib/rsvp";
import { seedCeremonies, seedHouseholds, seedWedding } from "./seed";
import type { InviteStore } from "./store";

/**
 * In-memory store for local testing. Data resets when the server restarts.
 * Kept on globalThis so hot reload in dev doesn't wipe RSVPs.
 */
interface MockState {
  opened: Map<string, { openedAt: string; openCount: number }>;
  rsvps: Map<string, CeremonyRsvp[]>;
  responses: Map<string, HouseholdResponse>;
}

const g = globalThis as unknown as { __weddingMock?: MockState };
const state: MockState =
  g.__weddingMock ?? (g.__weddingMock = { opened: new Map(), rsvps: new Map(), responses: new Map() });

function build(slug: string): InviteView | null {
  if (!SLUG_RE.test(slug)) return null;
  const h = seedHouseholds.find((x) => x.slug === slug);
  if (!h) return null;
  const opened = state.opened.get(h.id);
  const ceremonies = seedCeremonies
    .filter((c) => c.isPublished && h.ceremonyIds.includes(c.id))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.sortOrder - b.sortOrder);
  const visible = new Set(ceremonies.map((c) => c.id));
  return {
    wedding: seedWedding,
    household: {
      id: h.id,
      displayName: h.displayName,
      side: h.side,
      maxGuests: h.maxGuests,
      slug: h.slug,
      openedAt: opened?.openedAt ?? null,
      openCount: opened?.openCount ?? 0,
    },
    ceremonies,
    rsvps: (state.rsvps.get(h.id) ?? []).filter((r) => visible.has(r.ceremonyId)),
    response: state.responses.get(h.id) ?? null,
  };
}

export const mockStore: InviteStore = {
  async getInvite(slug) {
    return build(slug);
  },

  async markOpened(slug) {
    const view = build(slug);
    if (!view) return;
    const cur = state.opened.get(view.household.id);
    state.opened.set(view.household.id, {
      openedAt: cur?.openedAt ?? new Date().toISOString(),
      openCount: (cur?.openCount ?? 0) + 1,
    });
  },

  async saveRsvp(slug, submission: RsvpSubmission) {
    const view = build(slug);
    if (!view) throw new RsvpError("invalid", "This invitation link isn't valid.");
    if (isRsvpLocked(view.wedding.rsvpDeadline)) {
      throw new RsvpError("locked", "RSVPs are closed. Please call the family to make changes.");
    }
    const clean = normalizeSubmission(view, submission);
    const now = new Date().toISOString();
    const prev = state.responses.get(view.household.id);
    state.rsvps.set(view.household.id, clean.answers);
    state.responses.set(view.household.id, {
      vegCount: clean.vegCount,
      blessing: clean.blessing || null,
      submittedAt: prev?.submittedAt ?? now,
      updatedAt: now,
    });
    return build(slug)!;
  },
};
