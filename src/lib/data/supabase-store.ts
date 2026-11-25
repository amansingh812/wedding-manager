import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Ceremony, InviteView, RsvpSubmission } from "@/lib/types";
import { isRsvpLocked, normalizeSubmission, RsvpError, SLUG_RE } from "@/lib/rsvp";
import type { InviteStore } from "./store";

/**
 * Supabase-backed store. Runs only on the server with the service-role key,
 * always scoped to the one household found by slug (guests never query tables).
 */
let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

type EventRow = {
  id: string; kind: string | null; name: string; subtitle: string | null; event_date: string; date_bs: string;
  starts_at: string | null; ends_at: string | null; venue_name: string | null; venue_city: string | null;
  address: string | null; map_url: string | null; dress_code: string | null; dress_colors: string[] | null;
  image_path: string | null; sort_order: number; is_published: boolean;
};

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : null);

function toCeremony(e: EventRow): Ceremony {
  return {
    id: e.id, kind: e.kind, name: e.name, subtitle: e.subtitle, eventDate: e.event_date, dateBs: e.date_bs,
    startsAt: hhmm(e.starts_at), endsAt: hhmm(e.ends_at), venueName: e.venue_name, venueCity: e.venue_city,
    address: e.address, mapUrl: e.map_url, dressCode: e.dress_code, dressColors: e.dress_colors ?? [],
    imagePath: e.image_path, sortOrder: e.sort_order, isPublished: e.is_published,
  };
}

async function load(slug: string): Promise<InviteView | null> {
  if (!SLUG_RE.test(slug)) return null;
  const { data: h, error } = await db()
    .from("households")
    .select(
      "id, display_name, side, max_guests, slug, opened_at, open_count, wedding:weddings(id, groom_name, bride_name, title, main_date, main_date_bs, hashtag, rsvp_deadline), invitations(id, event:events(*), rsvp:rsvps(attending, headcount)), response:responses(veg_count, blessing, submitted_at, updated_at)",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!h) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w: any = h.wedding;
  const invs: any[] = (h.invitations as any[]) ?? [];
  const visible = invs.filter((i) => i.event?.is_published);
  const ceremonies = visible
    .map((i) => toCeremony(i.event as EventRow))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.sortOrder - b.sortOrder);
  const rsvps = visible
    .filter((i) => i.rsvp)
    .map((i) => ({ ceremonyId: i.event.id as string, attending: i.rsvp.attending as boolean, headcount: i.rsvp.headcount as number }));
  const r: any = Array.isArray(h.response) ? h.response[0] : h.response;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    wedding: {
      id: w.id, groomName: w.groom_name, brideName: w.bride_name, title: w.title, mainDate: w.main_date,
      mainDateBs: w.main_date_bs, hashtag: w.hashtag, rsvpDeadline: w.rsvp_deadline,
    },
    household: {
      id: h.id, displayName: h.display_name, side: h.side, maxGuests: h.max_guests, slug: h.slug,
      openedAt: h.opened_at, openCount: h.open_count,
    },
    ceremonies,
    rsvps,
    response: r ? { vegCount: r.veg_count, blessing: r.blessing, submittedAt: r.submitted_at, updatedAt: r.updated_at } : null,
  };
}

export const supabaseStore: InviteStore = {
  getInvite: load,

  async markOpened(slug) {
    if (!SLUG_RE.test(slug)) return;
    const { error } = await db().rpc("mark_invite_opened", { p_slug: slug });
    if (error) console.error("markOpened failed", error.message);
  },

  async saveRsvp(slug, submission: RsvpSubmission) {
    const view = await load(slug);
    if (!view) throw new RsvpError("invalid", "This invitation link isn't valid.");
    if (isRsvpLocked(view.wedding.rsvpDeadline)) {
      throw new RsvpError("locked", "RSVPs are closed. Please call the family to make changes.");
    }
    const clean = normalizeSubmission(view, submission);
    const { error } = await db().rpc("save_rsvp", {
      p_household: view.household.id,
      p_answers: clean.answers.map((a) => ({ event_id: a.ceremonyId, attending: a.attending, headcount: a.headcount })),
      p_veg: clean.vegCount,
      p_blessing: clean.blessing || null,
    });
    if (error) throw error;
    return (await load(slug))!;
  },
};
