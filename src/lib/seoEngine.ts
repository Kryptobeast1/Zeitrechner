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
}

const BASE_URL = 'https://zeitrechner.app';

// ─── CTR-OPTIMIZED TITLE TEMPLATES ──────────────────────────────────────────

const titleTemplates: Record<PageType, Record<Lang, (params: Record<string, string>) => string>> = {
  'time-range': {
    en: ({ start, end, hours }) => `${hours} Hours From ${start} To ${end} (Instant Calculate)`,
    de: ({ start, end, hours }) => `Stunden von ${start} bis ${end} Uhr: Genau ${hours} Stunden`,
  },
  'work-hours': {
    en: ({ start, end, net }) => `Work Calculator: Hours Between ${start}–${end} (${net}h Net)`,
    de: ({ start, end, net }) => `Arbeitszeitrechner: Stunden von ${start}–${end} Uhr (${net}h Netto)`,
  },
  'add-time': {
    en: ({ hours, base, result }) => `What Time Is ${hours} Hours After ${base}? (Result: ${result})`,
    de: ({ hours, base, result }) => `Was ist ${hours} Stunden nach ${base} Uhr? (${result})`,
  },
  'countdown': {
    en: ({ name, days }) => `How Many Days Until ${name}? (Only ${days} Days Left)`,
    de: ({ name, days }) => `Tage bis ${name}: Countdown (Noch ${days} Tage)`,
  },
  'hub': {
    en: () => 'Time Calculator — Hours, Work Hours & Countdown | Quick & Precise',
    de: () => 'Zeitrechner — Stunden, Arbeitsstunden & Countdown berechnen',
  },
};

// ─── DESCRIPTION TEMPLATES ───────────────────────────────────────────────────

const descTemplates: Record<PageType, Record<Lang, (params: Record<string, string>) => string>> = {
  'time-range': {
    en: ({ start, end, hours }) =>
      `Calculate exactly how many hours are between ${start} and ${end}. Result: ${hours} hours (${Math.round(parseFloat(hours) * 60)} minutes). Optimized for payroll or scheduling.`,
    de: ({ start, end, hours }) =>
      `Berechne genau, wie viele Stunden zwischen ${start} und ${end} Uhr liegen. Ergebnis: ${hours} Stunden (${Math.round(parseFloat(hours) * 60)} Minuten). Für Lohnabrechnung oder Planung.`,
  },
  'work-hours': {
    en: ({ start, end, net }) =>
      `How many productive hours from ${start} to ${end}? With breaks, the net result is ${net} hours. Free timesheet calculator for every industry.`,
    de: ({ start, end, net }) =>
      `Wie viele produktive Arbeitsstunden von ${start} bis ${end} Uhr? Netto-Ergebnis mit Pause: ${net} Stunden. Kostenloser Stundenzettel-Rechner.`,
  },
  'add-time': {
    en: ({ hours, base, result }) =>
      `Instantly find out what time it will be ${hours} hours after ${base}. The exact answer is ${result}. Free tool for quick scheduling decisions.`,
    de: ({ hours, base, result }) =>
      `Was ist ${hours} Stunden nach ${base} Uhr? Das Ergebnis ist exakt ${result} Uhr. Kostenloser Rechner für schnelle Terminplanung.`,
  },
  'countdown': {
    en: ({ name, days }) =>
      `Live countdown to ${name}. There are ${days} days remaining until the event. Precise d/h/m/s timer for tracking deadlines.`,
    de: ({ name, days }) =>
      `Live-Countdown bis ${name}. Es verbleiben noch ${days} Tage bis zum Ereignis. Genaue Anzeige in Tagen, Stunden, Minuten und Sekunden.`,
  },
  'hub': {
    en: () =>
      'Free online calculation tool. Find time differences, manage work hours shifts, and track live countdowns. Reliable, mobile-compatible, and fast.',
    de: () =>
      'Einfacher Online-Zeitrechner. Berechne Zeitspannen, Arbeitsstunden und Live-Countdowns. Zuverlässig, schnell und für Mobilgeräte optimiert.',
  },
};

// ─── URL BUILDERS ─────────────────────────────────────────────────────────────
// CRITICAL: We use relative paths for internal navigation to avoid dev-mode 404s.

export function getHubUrl(lang: Lang): string {
  return lang === 'de' ? `/de/zeitrechner/` : `/en/time-calculator/`;
}

export function formatTimeSlug(h: string | number): string {
  return h.toString().replace('.', '-').replace('-5', '-30');
}

export function getTimeRangeUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/de/stunden-zwischen-${slug}/`
    : `/en/hours-between-${slug}/`;
}

export function getWorkHoursUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/de/arbeitsstunden-${slug}/`
    : `/en/work-hours-${slug}/`;
}

export function getCountdownUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `/de/tage-bis-${slug}/`
    : `/en/days-until-${slug}/`;
}

// Utility to prepends domain for Canonical/Sitemap
export function getFullUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

// ─── INDEXING STRATEGY ────────────────────────────────────────────────────────

export function shouldIndex(type: PageType, demandScore: number): boolean {
  if (type === 'hub') return true;
  if (type === 'work-hours') return demandScore >= 40; 
  return demandScore >= 50; 
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
