/**
 * App-level settings. Nothing couple-specific lives in code:
 * names, dates, places and wording come from the database (weddings table),
 * so the family can edit them without a deploy.
 */
export const site = {
  appName: "Wedding Manager",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Background music for the invite. null = no music button (add a licensed track later). */
  musicSrc: null as string | null,
  /** RSVP form on the invite. Off for now: the invite only shows ceremonies. Flip to true to bring it back. */
  rsvpEnabled: false,
};
