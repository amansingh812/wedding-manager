export type Side = "groom" | "bride" | "common";

export interface Wedding {
  id: string;
  groomName: string;
  brideName: string;
  title: string;
  mainDate: string; // ISO date, e.g. 2027-02-28
  mainDateBs: string; // "Fagun 16, 2083"
  hashtag: string | null;
  rsvpDeadline: string | null; // ISO date, inclusive (Nepal time)
}

export interface Ceremony {
  id: string;
  kind: string | null;
  name: string;
  subtitle: string | null;
  eventDate: string; // ISO date
  dateBs: string; // "Fagun 16"
  startsAt: string | null; // "11:00"
  endsAt: string | null;
  venueName: string | null;
  venueCity: string | null;
  address: string | null;
  mapUrl: string | null;
  dressCode: string | null;
  dressColors: string[];
  imagePath: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface Household {
  id: string;
  displayName: string;
  side: Side;
  maxGuests: number;
  slug: string;
  openedAt: string | null;
  openCount: number;
}

export interface CeremonyRsvp {
  ceremonyId: string;
  attending: boolean;
  headcount: number;
}

export interface HouseholdResponse {
  vegCount: number;
  blessing: string | null;
  submittedAt: string;
  updatedAt: string;
}

/** Everything one guest household is allowed to see. */
export interface InviteView {
  wedding: Wedding;
  household: Household;
  ceremonies: Ceremony[]; // only invited + published, sorted
  rsvps: CeremonyRsvp[];
  response: HouseholdResponse | null;
}

export interface RsvpSubmission {
  answers: CeremonyRsvp[];
  vegCount: number;
  blessing: string;
}

/** What the public home page may show: no addresses, map links or guest data. */
export interface PublicCeremony {
  id: string; name: string; subtitle: string | null; eventDate: string; dateBs: string;
  startsAt: string | null; venueCity: string | null; imagePath: string | null;
  kind: string | null;
  /** Only filled for the public venues (wedding + reception); home ceremonies stay private. */
  venueName: string | null; mapUrl: string | null;
}
export interface HomeContent {
  welcome?: string; nickname?: string; blessing?: string;
  groomFamily?: string; brideFamily?: string; brideFullName?: string;
  groomFrom?: string; groomTradition?: string; groomNote?: string;
  brideFrom?: string; brideTradition?: string; brideNote?: string;
}
export interface PublicSite { wedding: Wedding; ceremonies: PublicCeremony[]; home: HomeContent }
