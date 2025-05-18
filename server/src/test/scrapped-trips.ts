// Testovací typ pre manuálne tripy bez provider/line v hlavnom tripe
export type TestTripSegment = {
  from: string;
  to: string;
  type: "train" | "bus" | "walk";
  icon: "bus" | "walk" | "train";
  line: string;
  provider: string;
  stops: { time: string; station: string }[];
};

export type TestTripOption = {
  from: { time: string; station: string; city: string };
  to: { time: string; station: string; city: string };
  duration: number;
  segments: TestTripSegment[];
  price: number;
  totalPrice: number;
  adults: number;
  children: number;
  date: string;
};

// Manuálne prepísané tripy zo stránky CP.sk pre trasu Dubník → Bratislava
// Ikony: 'bus', 'walk', 'train' (SVG podľa lucide-react)

export const manualTrips: TestTripOption[] = [
  {
    from: { time: "13:21", station: "Dubník, nám.", city: "Dubník" },
    to: { time: "15:55", station: "Bratislava hl.st.", city: "Bratislava" },
    duration: 154, // 2 hod 34 min
    segments: [
      {
        from: "Dubník, nám.",
        to: "Nové Zámky,,rázc.k žel.st.",
        type: "bus",
        icon: "bus",
        line: "Bus 404415 38",
        provider: "ARRIVA Nové Zámky, a.s.",
        stops: [
          { time: "13:21", station: "Dubník, nám." },
          { time: "13:48", station: "Nové Zámky,,rázc.k žel.st." },
        ],
      },
      {
        from: "Nové Zámky,,rázc.k žel.st.",
        to: "Nové Zámky",
        type: "walk",
        icon: "walk",
        line: "",
        provider: "",
        stops: [
          { time: "13:48", station: "Nové Zámky,,rázc.k žel.st." },
          { time: "13:54", station: "Nové Zámky" },
        ],
      },
      {
        from: "Nové Zámky",
        to: "Bratislava hl.st.",
        type: "train",
        icon: "train",
        line: "EC 274 Metropolitan",
        provider: "ZSSK",
        stops: [
          { time: "15:03", station: "Nové Zámky" },
          { time: "15:55", station: "Bratislava hl.st." },
        ],
      },
    ],
    price: 6,
    totalPrice: 6,
    adults: 1,
    children: 0,
    date: "18.5.",
  },
  // Trip 2
  {
    from: { time: "14:21", station: "Dubník, nám.", city: "Dubník" },
    to: { time: "16:55", station: "Bratislava hl.st.", city: "Bratislava" },
    duration: 154,
    segments: [
      {
        from: "Dubník, nám.",
        to: "Nové Zámky,,rázc.k žel.st.",
        type: "bus",
        icon: "bus",
        line: "Bus 404416 38",
        provider: "ARRIVA Nové Zámky, a.s.",
        stops: [
          { time: "14:21", station: "Dubník, nám." },
          { time: "14:48", station: "Nové Zámky,,rázc.k žel.st." },
        ],
      },
      {
        from: "Nové Zámky,,rázc.k žel.st.",
        to: "Nové Zámky",
        type: "walk",
        icon: "walk",
        line: "",
        provider: "",
        stops: [
          { time: "14:48", station: "Nové Zámky,,rázc.k žel.st." },
          { time: "14:54", station: "Nové Zámky" },
        ],
      },
      {
        from: "Nové Zámky",
        to: "Bratislava hl.st.",
        type: "train",
        icon: "train",
        line: "EC 276 Metropolitan",
        provider: "ZSSK",
        stops: [
          { time: "15:03", station: "Nové Zámky" },
          { time: "16:55", station: "Bratislava hl.st." },
        ],
      },
    ],
    price: 6,
    totalPrice: 6,
    adults: 1,
    children: 0,
    date: "18.5.",
  },
  // Trip 3
  {
    from: { time: "15:21", station: "Dubník, nám.", city: "Dubník" },
    to: { time: "17:55", station: "Bratislava hl.st.", city: "Bratislava" },
    duration: 154,
    segments: [
      {
        from: "Dubník, nám.",
        to: "Nové Zámky,,rázc.k žel.st.",
        type: "bus",
        icon: "bus",
        line: "Bus 404417 38",
        provider: "ARRIVA Nové Zámky, a.s.",
        stops: [
          { time: "15:21", station: "Dubník, nám." },
          { time: "15:48", station: "Nové Zámky,,rázc.k žel.st." },
        ],
      },
      {
        from: "Nové Zámky,,rázc.k žel.st.",
        to: "Nové Zámky",
        type: "walk",
        icon: "walk",
        line: "",
        provider: "",
        stops: [
          { time: "15:48", station: "Nové Zámky,,rázc.k žel.st." },
          { time: "15:54", station: "Nové Zámky" },
        ],
      },
      {
        from: "Nové Zámky",
        to: "Bratislava hl.st.",
        type: "train",
        icon: "train",
        line: "EC 278 Metropolitan",
        provider: "ZSSK",
        stops: [
          { time: "16:03", station: "Nové Zámky" },
          { time: "17:55", station: "Bratislava hl.st." },
        ],
      },
    ],
    price: 6,
    totalPrice: 6,
    adults: 1,
    children: 0,
    date: "18.5.",
  },
];
