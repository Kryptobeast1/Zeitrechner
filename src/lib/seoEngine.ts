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

// ─── TITLE TEMPLATES ─────────────────────────────────────────────────────────

const titleTemplates: Record<PageType, Record<Lang, (params: Record<string, string>) => string>> = {
  'time-range': {
    en: ({ start, end, hours }) => `Hours Between ${start} and ${end} — ${hours} Hours | Time Calculator`,
    de: ({ start, end, hours }) => `Stunden zwischen ${start} und ${end} Uhr — ${hours} Stunden | Zeitrechner`,
  },
  'work-hours': {
    en: ({ start, end, net }) => `Work Hours ${start}–${end} (${net}h Net) | Timesheet Calculator`,
    de: ({ start, end, net }) => `Arbeitsstunden ${start}–${end} Uhr (${net}h netto) | Arbeitszeitrechner`,
  },
  'add-time': {
    en: ({ hours, base }) => `What Time Is ${hours} Hours After ${base}? | Time Calculator`,
    de: ({ hours, base }) => `Was ist ${hours} Stunden nach ${base} Uhr? | Zeitrechner`,
  },
  'countdown': {
    en: ({ name, days }) => `Days Until ${name} — ${days} Days Countdown | Timer`,
    de: ({ name, days }) => `Tage bis ${name} — Noch ${days} Tage | Countdown`,
  },
  'hub': {
    en: () => 'Time Calculator — Hours, Work Hours & Countdown | Zeitrechner',
    de: () => 'Zeitrechner — Stunden, Arbeitsstunden & Countdown berechnen',
  },
};

// ─── DESCRIPTION TEMPLATES ───────────────────────────────────────────────────

const descTemplates: Record<PageType, Record<Lang, (params: Record<string, string>) => string>> = {
  'time-range': {
    en: ({ start, end, hours }) =>
      `Calculate how many hours are between ${start} and ${end}. The answer is ${hours} hours (${parseInt(hours) * 60} minutes). Use our free time difference calculator.`,
    de: ({ start, end, hours }) =>
      `Berechne, wie viele Stunden zwischen ${start} und ${end} Uhr liegen. Ergebnis: ${hours} Stunden (${parseInt(hours) * 60} Minuten). Kostenloser Zeitrechner.`,
  },
  'work-hours': {
    en: ({ start, end, net }) =>
      `Calculate net work hours from ${start} to ${end} with break deductions. Net result: ${net} hours. Ideal for timesheets and payroll.`,
    de: ({ start, end, net }) =>
      `Berechne Nettoarbeitsstunden von ${start} bis ${end} Uhr mit Pausenabzug. Nettostunden: ${net}. Ideal für Stundenzettel und Lohnabrechnung.`,
  },
  'add-time': {
    en: ({ hours, base, result }) =>
      `What time is ${hours} hours after ${base}? The answer is ${result}. Use our free time addition calculator for instant results.`,
    de: ({ hours, base, result }) =>
      `Was ist ${hours} Stunden nach ${base} Uhr? Das Ergebnis ist ${result} Uhr. Kostenloser Zeitrechner für sofortige Ergebnisse.`,
  },
  'countdown': {
    en: ({ name, days }) =>
      `Live countdown to ${name}. Only ${days} days remaining! Get the exact time in days, hours, minutes and seconds.`,
    de: ({ name, days }) =>
      `Live-Countdown bis ${name}. Nur noch ${days} Tage! Genaue Zeit in Tagen, Stunden, Minuten und Sekunden.`,
  },
  'hub': {
    en: () =>
      'Free online time calculator. Calculate time differences, add or subtract hours, track work hours, and create live countdowns. Fast, accurate, mobile-friendly.',
    de: () =>
      'Kostenloser Online-Zeitrechner. Berechne Zeitdifferenzen, addiere oder subtrahiere Stunden, ermittle Arbeitszeiten und erstelle Live-Countdowns.',
  },
};

// ─── URL BUILDERS ─────────────────────────────────────────────────────────────

export function buildUrl(lang: Lang, path: string): string {
  return `${BASE_URL}/${lang}/${path}`.replace(/\/+/g, '/').replace('https:/', 'https://');
}

export function getHubUrl(lang: Lang): string {
  return lang === 'de' ? `${BASE_URL}/de/zeitrechner/` : `${BASE_URL}/en/time-calculator/`;
}

export function getTimeRangeUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `${BASE_URL}/de/stunden-zwischen-${slug}/`
    : `${BASE_URL}/en/hours-between-${slug}/`;
}

export function getWorkHoursUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `${BASE_URL}/de/arbeitsstunden-${slug}/`
    : `${BASE_URL}/en/work-hours-${slug}/`;
}

export function getCountdownUrl(lang: Lang, slug: string): string {
  return lang === 'de'
    ? `${BASE_URL}/de/tage-bis-${slug}/`
    : `${BASE_URL}/en/days-until-${slug}/`;
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
    canonical,
    hreflang: [
      { lang, url: canonical },
      { lang: alternateLang, url: alternateUrl },
      { lang: 'x-default', url: alternateUrl },
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
      item: item.url,
    })),
  };
}

export function buildWebAppSchema(lang: Lang): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: lang === 'de' ? 'Zeitrechner' : 'Time Calculator',
    url: getHubUrl(lang),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: lang === 'de'
      ? 'Kostenloser Online-Zeitrechner für Zeitdifferenzen, Arbeitszeiten und Countdowns.'
      : 'Free online time calculator for time differences, work hours, and countdowns.',
  };
}
