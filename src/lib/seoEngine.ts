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
      `Calculate the hours between ${start} and ${end} (${hours} hours). Precise timesheet calculator for payroll, scheduling, and shifts. Free & online.`,
    de: ({ start, end, hours }) =>
      `Berechne die Stunden von ${start} bis ${end} Uhr (${hours} Stunden). Präziser Stundenrechner für Lohnabrechnung, Schichtpläne & Freizeit. Kostenlos.`,
  },
  'work-hours': {
    en: ({ start, end, net }) =>
      `Calculate work hours from ${start} to ${end} (${net}h net with breaks). Professional timesheet calculator for payroll, freelancers, and shifts. Fast & free.`,
    de: ({ start, end, net }) =>
      `Arbeitszeit von ${start} bis ${end} Uhr berechnen (Netto: ${net}h mit Pause). Stundenzettel-Rechner für Lohnabrechnung, Freelancer & Zeiterfassung.`,
  },
  'add-time': {
    en: ({ hours, base, result }) =>
      `Find out what time is ${hours} hours after ${base} (Result: ${result}). Free tool for meeting planning, scheduling, and deadline calculations.`,
    de: ({ hours, base, result }) =>
      `Ermittle, wie viel Uhr es ${hours} Stunden nach ${base} Uhr ist (Ergebnis: ${result} Uhr). Rechner für Termine, Deadlines & Zeitmanagement.`,
  },
  'countdown': {
    en: ({ name, days }) =>
      `Live countdown to ${name}. There are ${days} days remaining. Track the exact days, hours, and minutes in real-time. Free online timer.`,
    de: ({ name, days }) =>
      `Live-Countdown bis ${name}. Noch ${days} Tage bis zum Event. Genaue verbleibende Zeit in Tagen, Stunden und Minuten live mitverfolgen.`,
  },
  'hub': {
    en: () =>
      'Free online time calculator. Compute time differences, track work hours with breaks, and view live countdowns. Fast, precise, and private.',
    de: () =>
      'Kostenloser Zeitrechner online. Berechne Zeitdifferenzen, Arbeitsstunden mit Pausen und Live-Countdowns. Präzise, schnell und mobiloptimiert.',
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
      { lang: 'x-default', url: getFullUrl(lang === 'en' ? canonical : alternateUrl) },
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
