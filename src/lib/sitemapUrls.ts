// Single source for which URLs go in which sitemap (Phase 6.1). Both the sitemap
// index and each child sitemap read from here so they can never drift.
import { INDEXED_RANGES } from '../data/timeRanges';
import { INDEXED_EVENTS } from '../data/dateEvents';
import { STATE_SLUGS } from './brueckentage';
import { shouldIndex } from './seoEngine';

export const SITE = 'https://zeit-rechner.com';

// Live events only — retired (past one-time / year) events are 301'd, not listed.
const liveEvents = INDEXED_EVENTS;
const liveRanges = INDEXED_RANGES.filter(r => r.start !== r.end && shouldIndex('time-range', r.demandScore));

// Brückentage detail pages: current year + next two × all 16 Bundesländer.
export function brueckentagePaths(): string[] {
  const y0 = new Date().getFullYear();
  const years = [y0, y0 + 1, y0 + 2];
  const out: string[] = [];
  for (const y of years) for (const slug of Object.values(STATE_SLUGS)) out.push(`/brueckentage-${y}-${slug}/`);
  return out;
}

export function deHoursPaths(): string[] { return liveRanges.map(r => `/stunden-zwischen-${r.deSlug}/`); }
export function enHoursPaths(): string[] { return liveRanges.map(r => `/en/hours-between-${r.slug}/`); }
export function deCountdownPaths(): string[] { return liveEvents.map(e => `/tage-bis-${e.deSlug}/`); }
export function enCountdownPaths(): string[] { return liveEvents.map(e => `/en/days-until-${e.slug}/`); }

// Hubs, guides, legal, home — everything else that should be indexed.
export function pagePaths(): string[] {
  return [
    '/', '/en/',
    '/alle-rechner/', '/en/all-calculators/',
    '/schichten/ab-07-uhr/', '/schichten/8-stunden/', '/schichten/nachtschichten/', '/schichten/teilzeit/',
    '/en/shifts/ab-07-uhr/', '/en/shifts/8-stunden/', '/en/shifts/nachtschichten/', '/en/shifts/teilzeit/',
    '/pausenrechner/', '/ruhezeit-checker/', '/nachtzuschlag-rechner/', '/gleitzeitkonto/', '/tarifmodelle/', '/arbeitstage-rechner/', '/brueckentage-rechner/',
    ...brueckentagePaths(),
    '/ratgeber/', '/ratgeber/arbeitszeit-berechnen/', '/ratgeber/ueberstunden-berechnen/',
    '/ratgeber/urlaubstage-berechnen/', '/ratgeber/monatsarbeitszeit/',
    '/ratgeber/zeiterfassung-freelancer/', '/ratgeber/zeiterfassung-pflicht/',
    '/en/guides/', '/en/guides/how-to-calculate-work-hours/', '/en/guides/tracking-time-freelancers/',
    '/en/german-working-hours-calculator/', '/en/break-rules-germany/', '/en/overtime-in-germany/', '/en/german-public-holidays/',
    '/en/rest-period-germany/', '/en/night-work-germany/', '/en/vacation-entitlement-germany/', '/en/decimal-hours-calculator/',
    '/en/working-days-calculator/',
    '/wochenarbeitszeit/', '/datum-in-x-tagen/',
    '/impressum/', '/datenschutz/', '/nutzungsbedingungen/', '/ueber-uns/', '/redaktion/',
    '/en/imprint/', '/en/privacy-policy/', '/en/terms-of-service/', '/en/about-us/', '/en/editorial-guidelines/',
  ];
}

export const CHILD_SITEMAPS = [
  'sitemap-de-hours.xml',
  'sitemap-en-hours.xml',
  'sitemap-de-countdown.xml',
  'sitemap-en-countdown.xml',
  'sitemap-pages.xml',
];
