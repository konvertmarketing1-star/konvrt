/**
 * The offer menu. Change a price or a line here and the page updates.
 * Custom creative is the one people inquire about. The rest have a price.
 */

export type PackageId =
  | "refresh"
  | "rebuild"
  | "front-desk"
  | "care"
  | "creative"
  | "shoot"
  | "custom";

export type WebsiteId = "refresh" | "rebuild" | "front-desk";

export type Cadence = "once" | "month" | "quote";

export type Offer = {
  id: PackageId;
  name: string;
  /** Short label for the price strip and the form. */
  short: string;
  price: number | null;
  priceNote: string;
  /** How the price lands on an invoice. */
  cadence: Cadence;
  /** Monthly amount billed with a one-time build. Front desk only. */
  monthly?: number;
  summary: string;
  bestFor: string;
  items: string[];
  cta: string;
  core?: boolean;
};

export const websites: Array<Offer & { id: WebsiteId }> = [
  {
    id: "refresh",
    name: "Refresh",
    short: "Refresh",
    price: 1500,
    priceNote: "one time",
    cadence: "once",
    summary: "A new design and clearer copy on the site you already have.",
    bestFor: "The site is up. It needs more sales, more leads, or more calls.",
    items: [
      "New design on your current site",
      "Copy aimed at the sale, the lead, or the call",
      "A path to buy, book, or request a quote",
      "Click-to-call when a call is the next step",
      "Mobile and desktop",
      "Built once. You own it.",
    ],
    cta: "Request Refresh",
  },
  {
    id: "rebuild",
    name: "Rebuild",
    short: "Rebuild",
    price: 3000,
    priceNote: "one time",
    cadence: "once",
    summary: "A full new site, built to convert.",
    bestFor: "A shop that should sell more, or a firm that should bring in more leads.",
    items: [
      "A full new site, up to 6 pages",
      "A shop, a law firm, an insurance agency, or a local business",
      "A way to buy, book a consult, or request a quote",
      "Click-to-call when a call is the next step",
      "Mobile and desktop",
      "Built once. You own it.",
    ],
    cta: "Request Rebuild",
    core: true,
  },
  {
    id: "front-desk",
    name: "Rebuild + AI Front Desk",
    short: "Front desk",
    price: 3500,
    priceNote: "plus $297/month",
    cadence: "once",
    monthly: 297,
    summary: "The new site, plus a bot that answers and follows up.",
    bestFor: "You want questions answered and the next step booked while you are with a client.",
    items: [
      "Everything in Rebuild",
      "A bot that answers shoppers and new leads",
      "Books a consult, an estimate, or a callback",
      "Follows up",
      "$297/month for the front desk",
      "The site build is paid once",
    ],
    cta: "Request the front desk",
  },
];

export const addons: Offer[] = [
  {
    id: "care",
    name: "Care plan",
    short: "Care plan",
    price: 150,
    priceNote: "per month, optional",
    cadence: "month",
    summary: "Updates, fixes, and hosting help after the site launches.",
    bestFor: "You want someone available after the build, without a new project every time.",
    items: [
      "Updates after launch",
      "Fixes",
      "Hosting help",
      "Optional. The site is yours either way.",
      "Month to month",
    ],
    cta: "Add the care plan",
  },
  {
    id: "creative",
    name: "Creative direction",
    short: "Creative",
    price: 750,
    priceNote: "per month",
    cadence: "month",
    summary: "A month of hooks, captions, a calendar, and shot notes. You post it.",
    bestFor: "A product, a practice, or a local business. You want the drafts, and you will post them.",
    items: [
      "Hooks for the month",
      "Captions",
      "A posting calendar",
      "Shot notes",
      "Drafts included",
      "You post it. We never log into your accounts.",
    ],
    cta: "Request creative direction",
  },
  {
    id: "shoot",
    name: "Half-day shoot",
    short: "Shoot",
    price: 400,
    priceNote: "per half-day",
    cadence: "once",
    summary: "Filmed and edited from the creative plan.",
    bestFor: "You want the footage shot and cut, ready to post from the plan.",
    items: [
      "Half a day of filming",
      "Edited from the creative plan",
      "Ready for you to post",
      "$400 each half-day",
    ],
    cta: "Request a shoot",
  },
];

export const customOffer: Offer = {
  id: "custom",
  name: "Custom creative",
  short: "Custom",
  price: null,
  priceNote: "scoped to the work",
  cadence: "quote",
  summary: "Creative work that is more than a monthly plan or a half-day shoot.",
  bestFor: "You can describe the creative you need, and the two add-ons are the wrong shape.",
  items: [
    "A launch, a series, or a one-off",
    "Scope and price in writing",
    "A start date you approve",
    "You still post it yourself",
  ],
  cta: "Inquire",
};

export const offers: Offer[] = [...websites, ...addons, customOffer];

export const guarantee =
  "Websites are built once. You pay for the build, then you own the site. The care plan is optional.";

export const mediaNote =
  "Creative direction is the plan and the drafts. You post it. We never log into your social accounts.";

export type ComparisonRow = {
  label: string;
  cells: Record<WebsiteId, string>;
};

export const comparison: ComparisonRow[] = [
  {
    label: "What you get",
    cells: {
      refresh: "Upgrade of the current site",
      rebuild: "Full new site",
      "front-desk": "Full new site + front desk",
    },
  },
  {
    label: "Pages",
    cells: {
      refresh: "Your current site",
      rebuild: "Up to 6",
      "front-desk": "Up to 6",
    },
  },
  {
    label: "Design and copy",
    cells: {
      refresh: "New design, clearer offer",
      rebuild: "Written to convert",
      "front-desk": "Written to convert",
    },
  },
  {
    label: "Path to buy, book, or inquire",
    cells: { refresh: "Yes", rebuild: "Yes", "front-desk": "Yes" },
  },
  {
    label: "Click-to-call",
    cells: { refresh: "Yes", rebuild: "Yes", "front-desk": "Yes" },
  },
  {
    label: "Answers and books the next step",
    cells: { refresh: "—", rebuild: "—", "front-desk": "Yes" },
  },
  {
    label: "Follow-up",
    cells: { refresh: "—", rebuild: "—", "front-desk": "Yes" },
  },
  {
    label: "Build price",
    cells: {
      refresh: "$1,500 once",
      rebuild: "$3,000 once",
      "front-desk": "$3,500 once",
    },
  },
  {
    label: "Monthly fee",
    cells: {
      refresh: "None",
      rebuild: "None",
      "front-desk": "$297 for the front desk",
    },
  },
  {
    label: "Care plan",
    cells: {
      refresh: "Optional, $150/month",
      rebuild: "Optional, $150/month",
      "front-desk": "Optional, $150/month",
    },
  },
];

export const steps = [
  {
    n: "01",
    title: "Tell us the business.",
    body: "What you sell, who the site is for, and which offer you want. A shop, a law firm, an insurance agency, or a local business. For custom creative, the inquiry is the brief.",
  },
  {
    n: "02",
    title: "We confirm the price.",
    body: "Refresh, Rebuild, the front desk, care, creative direction, and shoots come back at the price on this page. Custom creative comes back with a scope and a price. Nothing starts until you approve it.",
  },
  {
    n: "03",
    title: "You launch.",
    body: "The site goes up with one next step: buy, book a consult, or call. The care plan is there if you want updates after that. Creative, if you add it, is a plan you post yourself.",
  },
];

export const fit = {
  forYou: [
    "A Shopify or online brand that needs more sales",
    "A lawyer or insurance agent who needs more leads",
    "A local business that needs quotes and calls",
    "You want the site built once, then you own it",
    "You want a content plan, and you will post it yourself",
  ],
  outside: [
    "Daily posting done for you, inside your social accounts",
    "Ads, fulfillment, or the client work itself",
    "Custom creative with nothing to describe",
  ],
};

export const faqs = [
  {
    id: "custom",
    q: "How does custom creative work?",
    a: "Send the inquiry with the outcome, a budget range, and the timing. Within one business day you get a written scope and a price, or a note that creative direction or a half-day shoot already fits. Work starts after you approve the scope.",
  },
  {
    id: "sites",
    q: "What is the difference between Refresh and Rebuild?",
    a: "Refresh is $1,500. It upgrades the site you have with a new design, clearer copy, and a next step: buy, book, or call. Rebuild is $3,000. It is a full new site, up to 6 pages, for a shop, a law firm, an insurance agency, or a local business.",
  },
  {
    id: "who",
    q: "Do you work with Shopify brands, lawyers, and insurance agents?",
    a: "Yes. Shopify and online brands get a site built to convert and sell. Lawyers and insurance agents get a site built to collect leads. Local businesses still get a quote form and click-to-call. The prices on this page are the same for each.",
  },
  {
    id: "desk",
    q: "What is the AI front desk, and what is the $297?",
    a: "Rebuild + AI Front Desk is $3,500 for the site, then $297 a month. The bot answers shoppers and new leads, books a consult, an estimate, or a callback, and follows up. It does not give legal advice or bind an insurance policy. The $297 is for that front desk, not for the site itself.",
  },
  {
    id: "care",
    q: "Do I have to take the care plan?",
    a: "No. It is $150 a month for updates, fixes, and hosting help after launch. The site is yours without it.",
  },
  {
    id: "post",
    q: "Do you post on my social accounts?",
    a: "No. Creative direction is $750 a month for hooks, captions, a calendar, and shot notes, drafted for you. You post it. We never log into your accounts.",
  },
  {
    id: "shoot",
    q: "What is a half-day shoot?",
    a: "It is $400 for a half-day, filmed and edited from the creative plan, so you have footage ready to post.",
  },
  {
    id: "pay",
    q: "How do I pay?",
    a: "This form does not charge a card. The reply includes an invoice at the published price. Custom creative is invoiced only after you approve the written scope. The front desk build is $3,500, then $297 a month while that bot is on.",
  },
  {
    id: "own",
    q: "Who owns the website?",
    a: "You do, once the invoice for the build is paid.",
  },
];

export const customSeeds = [
  {
    label: "A launch month",
    note: "We are launching something new and need creative for that month, more than the standard plan.",
  },
  {
    label: "A series, one project",
    note: "We need a set of creative pieces for one project, not an ongoing monthly plan.",
  },
  {
    label: "Not sure which add-on",
    note: "We know we need creative, and we want a recommendation between the monthly plan, a shoot, or a custom scope.",
  },
];

export const budgets = [
  "Under $1,000",
  "$1,000 to $2,500",
  "$2,500 to $5,000",
  "$5,000 or more",
  "I want a recommendation",
];

export const timelines = [
  "This month",
  "In the next 30 days",
  "This quarter",
  "No deadline yet",
];

export function isWebsite(id: PackageId) {
  return id === "refresh" || id === "rebuild" || id === "front-desk";
}

export function offerById(id: PackageId) {
  const offer = offers.find((item) => item.id === id);
  if (!offer) throw new Error(`Unknown package: ${id}`);
  return offer;
}

export function priceHeadline(offer: Offer) {
  if (offer.price === null) return "Inquire";
  return `$${offer.price.toLocaleString("en-US")}`;
}

export function priceSpoken(offer: Offer) {
  if (offer.price === null) return offer.priceNote;
  return `${priceHeadline(offer)} ${offer.priceNote}`;
}

export function money(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export type SelectionQuote = {
  items: Offer[];
  once: number;
  monthly: number;
  custom: boolean;
};

/** Priced options add up. Custom creative stays off the number until it is scoped. */
export function quoteSelection(ids: PackageId[]): SelectionQuote {
  const items = offers.filter((offer) => ids.includes(offer.id));
  let once = 0;
  let monthly = 0;
  for (const offer of items) {
    if (offer.cadence === "quote" || offer.price === null) continue;
    if (offer.cadence === "month") monthly += offer.price;
    else once += offer.price;
    if (offer.monthly) monthly += offer.monthly;
  }
  return { items, once, monthly, custom: ids.includes("custom") };
}
