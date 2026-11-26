import type { Ceremony, Side, Wedding } from "@/lib/types";

/**
 * Demo wedding used until Supabase is connected (Phase 2).
 * This is data, not app code: once the database is live, the family edits
 * these names, dates and places from the dashboard. Mirrors supabase/seed.sql.
 */
export const seedWedding: Wedding = {
  id: "w-nirajan-deepa",
  groomName: "Nirajan",
  brideName: "Ashika",
  title: "Nirajan & Ashika",
  mainDate: "2027-02-28",
  mainDateBs: "Fagun 16, 2083",
  hashtag: "#NirajanWedsAshika",
  rsvpDeadline: "2027-02-20",
};

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const seedCeremonies: Ceremony[] = [
  {
    id: "e-tilak", kind: "tilak_matkor", name: "Tilak & Matkor", subtitle: "तिलक आ मटकोर",
    eventDate: "2027-02-26", dateBs: "Fagun 14", startsAt: "15:00", endsAt: null,
    venueName: "Groom's home", venueCity: "Biratnagar", address: "Biratnagar, Morang", mapUrl: maps("Biratnagar"),
    dressCode: "Mithila red & yellow", dressColors: ["#C62828", "#F2B61F"], imagePath: "/images/tilak-matkor.jpg",
    sortOrder: 1, isPublished: true,
  },
  {
    id: "e-haldi", kind: "haldi", name: "Haldi", subtitle: "हल्दी",
    eventDate: "2027-02-27", dateBs: "Fagun 15", startsAt: "11:00", endsAt: null,
    venueName: "Both homes", venueCity: "Biratnagar & Gaighat", address: null, mapUrl: null,
    dressCode: "Marigold yellow", dressColors: ["#F2B61F", "#FFFFFF"], imagePath: "/images/haldi.jpg",
    sortOrder: 2, isPublished: true,
  },
  {
    id: "e-mehendi", kind: "mehendi", name: "Mehendi", subtitle: "मेहेन्दी",
    eventDate: "2027-02-27", dateBs: "Fagun 15", startsAt: "15:00", endsAt: null,
    venueName: "Bride's home", venueCity: "Gaighat", address: "Gaighat, Udayapur", mapUrl: maps("Gaighat, Udayapur"),
    dressCode: "Leaf green", dressColors: ["#2E7D32", "#F3D99B"], imagePath: "/images/mehendi.jpg",
    sortOrder: 3, isPublished: true,
  },
  {
    id: "e-baraat", kind: "baraat", name: "Baraat / Janti", subtitle: "बरियात",
    eventDate: "2027-02-28", dateBs: "Fagun 16", startsAt: "07:00", endsAt: null,
    venueName: "Departs groom's home", venueCity: "Biratnagar → Gaighat", address: "Biratnagar, Morang", mapUrl: maps("Biratnagar"),
    dressCode: "Festive", dressColors: ["#8E1B1B", "#C9A24A"], imagePath: "/images/baraat.jpg",
    sortOrder: 4, isPublished: true,
  },
  {
    id: "e-bibah", kind: "bibah", name: "Bibah", subtitle: "बिहे",
    eventDate: "2027-02-28", dateBs: "Fagun 16", startsAt: "11:00", endsAt: null,
    venueName: "[Venue]", venueCity: "Gaighat", address: "Gaighat, Udayapur", mapUrl: maps("Gaighat, Udayapur"),
    dressCode: "Red & gold", dressColors: ["#8E1B1B", "#C9A24A"], imagePath: "/images/bibah.jpg",
    sortOrder: 5, isPublished: true,
  },
  {
    id: "e-reception", kind: "reception", name: "Reception", subtitle: "भोज",
    eventDate: "2027-03-01", dateBs: "Fagun 17", startsAt: "18:00", endsAt: null,
    venueName: "[Venue]", venueCity: "Biratnagar", address: "Biratnagar, Morang", mapUrl: maps("Biratnagar"),
    dressCode: "Festive", dressColors: ["#1F4E3D", "#3A0A0C"], imagePath: "/images/reception.jpg",
    sortOrder: 6, isPublished: true,
  },
];

export interface SeedHousehold {
  id: string;
  displayName: string;
  side: Side;
  maxGuests: number;
  slug: string;
  ceremonyIds: string[];
}

export const seedHouseholds: SeedHousehold[] = [
  {
    id: "h-sharma", displayName: "Dr. R.K. Sharma & Family", side: "bride", maxGuests: 4,
    slug: "sharma-parivar-9k4m2x", ceremonyIds: ["e-haldi", "e-mehendi", "e-bibah", "e-reception"],
  },
  {
    id: "h-jha", displayName: "Jha Family (Darbhanga)", side: "groom", maxGuests: 6,
    slug: "jha-family-p7q2wd", ceremonyIds: ["e-tilak", "e-haldi", "e-baraat", "e-bibah", "e-reception"],
  },
  {
    id: "h-office", displayName: "Office – Tech Team", side: "common", maxGuests: 8,
    slug: "office-tech-team-c3n8vr", ceremonyIds: ["e-reception"],
  },
];
