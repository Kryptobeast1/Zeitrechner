// SEO Engine — canonical URLs, meta generation, hreflang, noindex logic

export type Lang = 'de' | 'en';
export type PageType = 'time-range' | 'work-hours' | 'add-time' | 'countdown' | 'hub';

export interface SEOMeta {
  title: string;
  description: string;
  canonical: string;
  hreflang: { lang: string; url: string }[];
  noindex: boolean;
  jsonLd?: Record<string, unknown>;
  ogImage?: string;
  ogImageAlt?: string;
}

const BASE_URL = 'https://zeit-rechner.com';

// ─── CTR-OPTIMIZED TITLE TEMPLATES ──────────────────────────────────────────
// Goal: 50-60 characters, high relevance, includes year/primary brand
const titleTemplates: Record<PageType, Record<Lang, (params: Record<string, string>) => string>> = {
  'time-range': {
    en: ({ start, end }) => `How Many Hours From ${start} To ${end}? — Calculator 2026`,
    de: ({ start, end }) => `Stunden von ${start} bis ${end} Uhr berechnen — Zeitrechner 2026`,
  },
  'work-hours': {
    en: ({ start, end, net }) => `Work Hours Calculator: ${start} to ${end} (${net}h Netto) — 2026`,
    de: ({ start, end, net }) => `Arbeitszeit von ${start} bis ${end} Uhr berechnen — ${net}h Netto`,
  },
  'add-time': {
    en: ({ hours, base }) => `What Time Is ${hours} Hours After ${base}? — Quick Calculator`,
    de: ({ hours, base }) => `Wie viel Uhr ist ${hours} Stunden nach ${base}? — Zeit-Rechner`,
  },
  'countdown': {
    en: ({ name }) => `Days Until ${name}: Live Countdown & Timer 2026`,
    de: ({ name }) => `Tage bis ${name}: Live-Countdown & Zeitrechner 2026`,
  },
  'hub': {
    en: () => 'Time Calculator — Hours, Work Hours & Countdown | Quick & Precise',
    de: () => 'Zeitrechner — Stunden, Arbeitsstunden & Countdown online berechnen',
  },
};

// ─── DESCRIPTION TEMPLATES ───────────────────────────────────────────────────
// Goal: 150-160 characters, informative, clear CTA
const descTemplates: Record<PageType, Record<Lang, (params: Record<string, string>) => string>> = {
  'time-range': {
    en: ({ start, end, hours }) =>
      `Calculate exactly how many hours are between ${start} and ${end}. Result: ${hours} hours. Optimized for payroll, shift planning, and scheduling. Free and precise online tool.`,
    de: ({ start, end, hours }) =>
      `Berechne genau, wie viele Stunden zwischen ${start} und ${end} Uhr liegen. Ergebnis: ${hours} Stunden. Ideal für Lohnabrechnung, Dienstpläne und Zeitmanagement. Jetzt kostenlos nutzen.`,
  },
  'work-hours': {
    en: ({ start, end, net }) =>
      `How many productive hours from ${start} to ${end}? With breaks, the net result is ${net} hours. Professional timesheet calculator for every industry. Mobile-friendly and fast.`,
    de: ({ start, end, net }) =>
      `Wie viele produktive Arbeitsstunden von ${start} bis ${end} Uhr? Netto-Ergebnis mit Pause: ${net} Stunden. Professioneller Stundenzettel-Rechner für alle Branchen. Schnell & mobil.`,
  },
  'add-time': {
    en: ({ hours, base, result }) =>
      `Instantly find out what time it will be ${hours} hours after ${base}. The exact answer is ${result}. Free tool for quick scheduling, meeting planning, and deadline management.`,
    de: ({ hours, base, result }) =>
      `Was ist ${hours} Stunden nach ${base} Uhr? Das Ergebnis ist exakt ${result} Uhr. Kostenloser Rechner für schnelle Terminplanung, Deadlines und effizientes Zeitmanagement.`,
  },
  'countdown': {
    en: ({ name, days }) =>
      `Live countdown to ${name}. Only ${days} days remaining. Precise day, hour, minute, and second timer for tracking your important deadlines and events in real-time.`,
    de: ({ name, days }) =>
      `Live-Countdown bis ${name}. Es verbleiben noch ${days} Tage bis zum Ereignis. Genaue Anzeige in Tagen, Stunden, Minuten und Sekunden. Verpasse nie wieder eine wichtige Deadline.`,
  },
  'hub': {
    en: () =>
      'Free online calculation tool. Find time differences, manage work hours shifts, and track live countdowns. Reliable, mobile-compatible, and fast for professional use.',
    de: () =>
      'Ihr kostenloser Online-Zeitrechner. Berechne Zeitspannen, Arbeitsstunden und Live-Countdowns. Zuverlässig, schnell und für Mobilgeräte optimiert für Alltag und Beruf.',
  },
};

// ─── URL BUILDERS ─────────────────────────────────────────────────────────────
// CRITICAL: We use relative paths for internal navigation to avoid dev-mode 404s.

export function getHubUrl(lang: Lang): string {
  return lang === 'de' ? `/` : `/en/`;
}

export function getToolUrl(lang: Lang): string {
  return getHubUrl(lang);
}

export function formatTimeSlug(h: string | number): string {
  return h.toString().replace('.', '-').replace('-5', '-30');
}

export function getTimeRangeUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/stunden-zwischen-${slug}/`
    : `/en/hours-between-${slug}/`;
}

export function getWorkHoursUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/arbeitsstunden-${slug}/`
    : `/en/work-hours-${slug}/`;
}

export function getCountdownUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/tage-bis-${slug}/`
    : `/en/days-until-${slug}/`;
}

export function getGuideUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/ratgeber/${slug}/`
    : `/en/guides/${slug}/`;
}

// Utility to prepends domain for Canonical/Sitemap
export function getFullUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

// ─── INDEXING STRATEGY ────────────────────────────────────────────────────────

export function shouldIndex(type: PageType, demandScore: number): boolean {
  if (type === 'hub') return true;
  // Lower threshold (20 instead of 30) to capture more long-tail search intent.
  return demandScore >= 20; 
}

// ─── META BUILDER ─────────────────────────────────────────────────────────────

export function buildSEOMeta(
  type: PageType,
  lang: Lang,
  params: Record<string, string>,
  canonical: string,
  alternateLang: Lang,
  alternateUrl: string,
  noindex = false,
  ogImage?: string,
  ogImageAlt?: string,
): SEOMeta {
  const title = titleTemplates[type][lang](params);
  const description = descTemplates[type][lang](params);

  return {
    title,
    description,
    canonical: getFullUrl(canonical),
    hreflang: [
      { lang, url: getFullUrl(canonical) },
      { lang: alternateLang, url: getFullUrl(alternateUrl) },
      { lang: 'x-default', url: getFullUrl(alternateUrl) },
    ],
    noindex,
    ogImage: ogImage ? getFullUrl(ogImage) : getFullUrl('/og-image.png'),
    ogImageAlt: ogImageAlt || (lang === 'de' ? 'Zeit-Rechner.com — Präzise Online-Zeitrechner für Alltag und Beruf' : 'Zeit-Rechner.com — Precise Online Time Calculators for Everyone'),
  };
}

// ─── JSON-LD BUILDERS ─────────────────────────────────────────────────────────

export function buildFAQSchema(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('/') ? getFullUrl(item.url) : item.url,
    })),
  };
}

export function buildWebAppSchema(lang: Lang): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: lang === 'de' ? 'Zeitrechner' : 'Time Calculator',
    url: getFullUrl(getHubUrl(lang)),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: lang === 'de'
      ? 'Präziser Online-Zeitrechner für Differenzen, Arbeitszeit und Live-Countdowns.'
      : 'Accurate online time calculator for differences, work hours, and live countdowns.',
  };
}
