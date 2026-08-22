// Single source for which URLs go in which sitemap (Phase 6.1). Both the sitemap
// index and each child sitemap read from here so they can never drift.
import { INDEXED_RANGES } from '../data/timeRanges';
import { ALL_EVENTS } from '../data/dateEvents';
import { shouldIndex } from './seoEngine';

export const SITE = 'https://zeit-rechner.com';
const CURRENT_YEAR = new Date().getFullYear();

// Future/evergreen events only — past year-pages are 301'd to their evergreen parent.
const liveEvents = ALL_EVENTS.filter(e => parseInt(e.targetDate.split('-')[0], 10) >= CURRENT_YEAR);
const liveRanges = INDEXED_RANGES.filter(r => r.start !== r.end && shouldIndex('time-range', r.demandScore));

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
    '/pausenrechner/', '/ruhezeit-checker/', '/nachtzuschlag-rechner/', '/gleitzeitkonto/', '/tarifmodelle/', '/arbeitstage-rechner/',
    '/ratgeber/', '/ratgeber/arbeitszeit-berechnen/', '/ratgeber/ueberstunden-berechnen/',
    '/ratgeber/urlaubstage-berechnen/', '/ratgeber/monatsarbeitszeit/',
    '/ratgeber/zeiterfassung-freelancer/', '/ratgeber/zeiterfassung-pflicht/',
    '/en/guides/', '/en/guides/how-to-calculate-work-hours/', '/en/guides/tracking-time-freelancers/',
    '/en/german-working-hours-calculator/', '/en/break-rules-germany/', '/en/overtime-in-germany/', '/en/german-public-holidays/',
    '/en/rest-period-germany/', '/en/night-work-germany/', '/en/vacation-entitlement-germany/', '/en/decimal-hours-calculator/',
    '/en/working-days-calculator/',
    '/wochenarbeitszeit/', '/datum-in-x-tagen/',
    '/impressum/', '/datenschutz/', '/nutzungsbedingungen/', '/ueber-uns/',
    '/en/imprint/', '/en/privacy-policy/', '/en/terms-of-service/', '/en/about-us/',
  ];
}

export const CHILD_SITEMAPS = [
  'sitemap-de-hours.xml',
  'sitemap-en-hours.xml',
  'sitemap-de-countdown.xml',
  'sitemap-en-countdown.xml',
  'sitemap-pages.xml',
];
