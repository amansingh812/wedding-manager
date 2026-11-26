/** Starter checklist items per ceremony kind. Added on request, then fully editable. */
export type StarterItem = { title: string; kind: "buy" | "bring" | "do" | "book"; group: string; qty?: string };

export const KIND_LABEL = { buy: "Buy", bring: "Bring", do: "Do", book: "Book" } as const;

export const STARTERS: Record<string, StarterItem[]> = {
  tilak_matkor: [
    { title: "Rice (akshata)", kind: "buy", group: "Puja samagri", qty: "2 kg" },
    { title: "Sindoor, abir, roli", kind: "buy", group: "Puja samagri" },
    { title: "Betel leaves & supari", kind: "buy", group: "Puja samagri", qty: "51" },
    { title: "Clay pots for matkor", kind: "buy", group: "Puja samagri", qty: "5" },
    { title: "Dhoti, gamchha & clothes for groom", kind: "buy", group: "Gifts" },
    { title: "Fruits & sweets for tilak", kind: "buy", group: "Food" },
    { title: "Book pandit ji", kind: "book", group: "People" },
    { title: "Call relatives for matkor singing", kind: "do", group: "People" },
  ],
  haldi: [
    { title: "Haldi paste (turmeric, besan, oil)", kind: "buy", group: "Puja samagri" },
    { title: "Mango leaves", kind: "buy", group: "Decoration" },
    { title: "Yellow clothes for bride/groom", kind: "buy", group: "Clothes" },
    { title: "Marigold garlands", kind: "buy", group: "Decoration", qty: "20" },
    { title: "Old towels & sheets", kind: "bring", group: "Setup" },
    { title: "Snacks & tea for guests", kind: "buy", group: "Food" },
    { title: "Dholak / music", kind: "book", group: "People" },
  ],
  mehendi: [
    { title: "Book mehendi artist", kind: "book", group: "People" },
    { title: "Mehendi cones", kind: "buy", group: "Supplies", qty: "30" },
    { title: "Cushions & floor seating", kind: "bring", group: "Setup" },
    { title: "Green bangles", kind: "buy", group: "Gifts" },
    { title: "Snacks & cold drinks", kind: "buy", group: "Food" },
    { title: "Music / speaker", kind: "bring", group: "Setup" },
  ],
  baraat: [
    { title: "Book car / horse for groom", kind: "book", group: "Transport" },
    { title: "Book band baja / naumati baja", kind: "book", group: "People" },
    { title: "Buses for baraatis", kind: "book", group: "Transport" },
    { title: "Sehra, safa, mala for groom", kind: "buy", group: "Clothes" },
    { title: "Final list of baraatis", kind: "do", group: "People" },
    { title: "Water & snacks for the road", kind: "buy", group: "Food" },
  ],
  bibah: [
    { title: "Book pandit ji for vivah", kind: "book", group: "People" },
    { title: "Mandap & decoration", kind: "book", group: "Venue" },
    { title: "Havan samagri, ghee, wood", kind: "buy", group: "Puja samagri" },
    { title: "Sindoor box, potey, mangalsutra", kind: "buy", group: "Puja samagri" },
    { title: "Kanyadaan items", kind: "buy", group: "Puja samagri" },
    { title: "Wedding clothes & jewellery ready", kind: "do", group: "Clothes" },
    { title: "Catering for guests", kind: "book", group: "Food" },
    { title: "Photographer & video", kind: "book", group: "People" },
  ],
  reception: [
    { title: "Book venue / banquet", kind: "book", group: "Venue" },
    { title: "Confirm caterer & menu", kind: "book", group: "Food" },
    { title: "Stage decoration", kind: "book", group: "Venue" },
    { title: "Sound & DJ", kind: "book", group: "People" },
    { title: "Return gifts", kind: "buy", group: "Gifts" },
    { title: "Final plate count to caterer", kind: "do", group: "Food" },
  ],
};
