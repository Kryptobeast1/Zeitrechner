// Date events data — holidays, special days, and year countdowns.
// Used for /tage-bis-[slug] (DE) and /en/days-until-[slug] (EN).
//
// LIFECYCLE MODEL (rewritten to fix the year-vs-date bug):
//   • Recurring events carry a `recur` rule and are ALWAYS live — their date is
//     COMPUTED for the next occurrence, never hardcoded. Movable feasts come from
//     the tested Easter algorithm; floating US holidays from an nth-weekday rule.
//   • One-time / year-anchored events (`oneTime` / the jahr-series) keep a fixed
//     date and are RETIRED once that date has passed (not built, 301'd away) —
//     we never invent a future instance of a World Cup or an eclipse.
//   • A page is "over" when its DATE is in the past, not when its YEAR rolled.
import { computeEaster } from '../lib/holidays.ts';

export type Recur =
  | { kind: 'fixed'; month: number; day: number }              // same M/D every year
  | { kind: 'easter'; offset: number }                          // days from Easter Sunday
  | { kind: 'nth-weekday'; month: number; weekday: number; n: number; offset?: number }; // n<0 = from end

export interface DateEvent {
  name: string;       // English name
  deName: string;     // German name
  slug: string;       // URL slug EN
  deSlug: string;     // URL slug DE
  targetDate: string; // ISO anchor date (YYYY-MM-DD). For recurring events this is
                      // only a fallback/sort anchor; the live date comes from `recur`.
  category: 'holiday' | 'year' | 'seasonal' | 'event';
  priority: 'high' | 'medium' | 'low';
  recur?: Recur;      // present ⇒ evergreen recurring (compute next occurrence)
  oneTime?: boolean;  // present ⇒ never rolls forward; retire once past
}

// ── date helpers ──────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');
const isoUTC = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const midnight = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Nth weekday of a month. n>0 counts from the start (1 = first), n<0 from the end (-1 = last). */
function nthWeekday(year: number, month1: number, weekday: number, n: number): Date {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month1 - 1, 1));
    const shift = (weekday - first.getUTCDay() + 7) % 7;
    return new Date(Date.UTC(year, month1 - 1, 1 + shift + (n - 1) * 7));
  }
  const last = new Date(Date.UTC(year, month1, 0)); // last day of month1
  const shift = (last.getUTCDay() - weekday + 7) % 7;
  return new Date(Date.UTC(year, month1 - 1, last.getUTCDate() - shift));
}

/** The date a recurrence falls on in a given year. */
function recurInYear(recur: Recur, year: number): Date {
  if (recur.kind === 'fixed') return new Date(Date.UTC(year, recur.month - 1, recur.day));
  if (recur.kind === 'easter') {
    const d = computeEaster(year);
    d.setUTCDate(d.getUTCDate() + recur.offset);
    return d;
  }
  const d = nthWeekday(year, recur.month, recur.weekday, recur.n);
  if (recur.offset) d.setUTCDate(d.getUTCDate() + recur.offset);
  return d;
}

/** The next occurrence (today or later) of a recurring event. */
function nextRecurrence(recur: Recur, today: Date): Date {
  const y = today.getUTCFullYear();
  const thisYear = recurInYear(recur, y);
  return thisYear.getTime() >= midnight(today).getTime() ? thisYear : recurInYear(recur, y + 1);
}

/**
 * The live target date (ISO) a page should count down to.
 * Recurring ⇒ next computed occurrence. One-time / series ⇒ its fixed date.
 */
export function resolveActiveDate(event: DateEvent, today: Date = new Date()): string {
  return event.recur ? isoUTC(nextRecurrence(event.recur, today)) : event.targetDate;
}

/** Whole days from today until an ISO date (never negative; today not counted). */
export function daysUntilISO(iso: string, today: Date = new Date()): number {
  const diff = new Date(iso + 'T00:00:00Z').getTime() - midnight(today).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

/**
 * Retired = a non-recurring event whose date has already passed. Such pages are
 * not built and are 301'd away, so we never show a stale or invented countdown.
 */
export function isRetired(event: DateEvent, today: Date = new Date()): boolean {
  if (event.recur) return false;
  return new Date(event.targetDate + 'T00:00:00Z').getTime() < midnight(today).getTime();
}

// ── event data ────────────────────────────────────────────────────────────────
const fixed = (month: number, day: number): Recur => ({ kind: 'fixed', month, day });
const easter = (offset: number): Recur => ({ kind: 'easter', offset });
const nth = (month: number, weekday: number, n: number, offset?: number): Recur => ({ kind: 'nth-weekday', month, weekday, n, offset });

// Recurring events — always live, dates computed. targetDate is a sort anchor only.
const RECURRING: DateEvent[] = [
  // Fixed-date holidays
  { name: 'Christmas', deName: 'Weihnachten', slug: 'christmas', deSlug: 'weihnachten', targetDate: '2026-12-25', category: 'holiday', priority: 'high', recur: fixed(12, 25) },
  { name: '2nd Day of Christmas', deName: '2. Weihnachtstag', slug: 'boxing-day', deSlug: 'zweiter-weihnachtstag', targetDate: '2026-12-26', category: 'holiday', priority: 'medium', recur: fixed(12, 26) },
  { name: 'New Year', deName: 'Neujahr', slug: 'new-year', deSlug: 'neujahr', targetDate: '2027-01-01', category: 'holiday', priority: 'high', recur: fixed(1, 1) },
  { name: 'Valentine\'s Day', deName: 'Valentinstag', slug: 'valentines-day', deSlug: 'valentinstag', targetDate: '2027-02-14', category: 'holiday', priority: 'medium', recur: fixed(2, 14) },
  { name: 'Halloween', deName: 'Halloween', slug: 'halloween', deSlug: 'halloween', targetDate: '2026-10-31', category: 'holiday', priority: 'high', recur: fixed(10, 31) },
  { name: 'St. Patrick\'s Day', deName: 'St. Patrick\'s Day', slug: 'st-patricks-day', deSlug: 'st-patricks-day', targetDate: '2027-03-17', category: 'holiday', priority: 'medium', recur: fixed(3, 17) },
  { name: 'Independence Day', deName: 'Unabhängigkeitstag (USA)', slug: 'independence-day', deSlug: 'unabhaengigkeitstag-usa', targetDate: '2026-07-04', category: 'holiday', priority: 'high', recur: fixed(7, 4) },
  { name: 'Epiphany', deName: 'Heilige Drei Könige', slug: 'epiphany', deSlug: 'heilige-drei-koenige', targetDate: '2027-01-06', category: 'holiday', priority: 'medium', recur: fixed(1, 6) },
  { name: 'International Women\'s Day', deName: 'Frauentag', slug: 'womens-day', deSlug: 'frauentag', targetDate: '2027-03-08', category: 'holiday', priority: 'medium', recur: fixed(3, 8) },
  { name: 'Labour Day Germany', deName: 'Erster Mai', slug: 'may-day-germany', deSlug: 'erster-mai', targetDate: '2026-05-01', category: 'holiday', priority: 'medium', recur: fixed(5, 1) },
  { name: 'Assumption Day', deName: 'Mariä Himmelfahrt', slug: 'assumption-day', deSlug: 'mariae-himmelfahrt', targetDate: '2026-08-15', category: 'holiday', priority: 'low', recur: fixed(8, 15) },
  { name: 'All Saints\' Day', deName: 'Allerheiligen', slug: 'all-saints-day', deSlug: 'allerheiligen', targetDate: '2026-11-01', category: 'holiday', priority: 'medium', recur: fixed(11, 1) },
  { name: 'German Unity Day', deName: 'Tag der Deutschen Einheit', slug: 'german-unity-day', deSlug: 'tag-der-deutschen-einheit', targetDate: '2026-10-03', category: 'holiday', priority: 'high', recur: fixed(10, 3) },
  { name: 'Veterans Day', deName: 'Veterans Day', slug: 'veterans-day', deSlug: 'veterans-tag', targetDate: '2026-11-11', category: 'holiday', priority: 'medium', recur: fixed(11, 11) },
  { name: 'Juneteenth', deName: 'Juneteenth', slug: 'juneteenth', deSlug: 'juneteenth', targetDate: '2027-06-19', category: 'holiday', priority: 'medium', recur: fixed(6, 19) },
  { name: 'Earth Day', deName: 'Tag der Erde', slug: 'earth-day', deSlug: 'tag-der-erde', targetDate: '2027-04-22', category: 'holiday', priority: 'medium', recur: fixed(4, 22) },
  { name: 'First Day of Spring', deName: 'Frühlingsanfang', slug: 'first-day-of-spring', deSlug: 'fruehlingsanfang', targetDate: '2027-03-20', category: 'seasonal', priority: 'medium', recur: fixed(3, 20) },
  { name: 'Summer Solstice', deName: 'Sommersonnenwende', slug: 'summer-solstice', deSlug: 'sommersonnenwende', targetDate: '2027-06-21', category: 'seasonal', priority: 'medium', recur: fixed(6, 21) },
  { name: 'First Day of Autumn', deName: 'Herbstanfang', slug: 'first-day-of-autumn', deSlug: 'herbfang', targetDate: '2026-09-22', category: 'seasonal', priority: 'medium', recur: fixed(9, 22) },
  { name: 'Winter Solstice', deName: 'Wintersonnenwende', slug: 'winter-solstice', deSlug: 'wintersonnenwende', targetDate: '2026-12-21', category: 'seasonal', priority: 'medium', recur: fixed(12, 21) },

  // Easter-derived (movable) — computed, never hardcoded
  { name: 'Easter Sunday', deName: 'Ostersonntag', slug: 'easter', deSlug: 'ostersonntag', targetDate: '2027-03-28', category: 'holiday', priority: 'high', recur: easter(0) },
  { name: 'Good Friday', deName: 'Karfreitag', slug: 'good-friday', deSlug: 'karfreitag', targetDate: '2027-03-26', category: 'holiday', priority: 'medium', recur: easter(-2) },
  { name: 'Easter Monday', deName: 'Ostermontag', slug: 'easter-monday', deSlug: 'ostermontag', targetDate: '2027-03-29', category: 'holiday', priority: 'medium', recur: easter(1) },
  { name: 'Ascension Day', deName: 'Christi Himmelfahrt', slug: 'ascension-day', deSlug: 'christi-himmelfahrt', targetDate: '2027-05-06', category: 'holiday', priority: 'medium', recur: easter(39) },
  { name: 'Whit Monday', deName: 'Pfingstmontag', slug: 'whit-monday', deSlug: 'pfingstmontag', targetDate: '2027-05-17', category: 'holiday', priority: 'medium', recur: easter(50) },
  { name: 'Corpus Christi', deName: 'Fronleichnam', slug: 'corpus-christi', deSlug: 'fronleichnam', targetDate: '2027-05-27', category: 'holiday', priority: 'low', recur: easter(60) },

  // Floating US holidays (nth weekday) — computed
  { name: 'Martin Luther King Jr. Day', deName: 'MLK Day', slug: 'mlk-day', deSlug: 'mlk-tag', targetDate: '2027-01-18', category: 'holiday', priority: 'medium', recur: nth(1, 1, 3) },
  { name: 'Presidents\' Day', deName: 'Presidents Day', slug: 'presidents-day', deSlug: 'presidents-day', targetDate: '2027-02-15', category: 'holiday', priority: 'medium', recur: nth(2, 1, 3) },
  { name: 'Memorial Day', deName: 'Memorial Day', slug: 'memorial-day', deSlug: 'memorial-day', targetDate: '2027-05-31', category: 'holiday', priority: 'high', recur: nth(5, 1, -1) },
  { name: 'Labor Day (USA)', deName: 'Tag der Arbeit (USA)', slug: 'labor-day', deSlug: 'tag-der-arbeit-usa', targetDate: '2026-09-07', category: 'holiday', priority: 'high', recur: nth(9, 1, 1) },
  { name: 'Columbus Day', deName: 'Columbus Day', slug: 'columbus-day', deSlug: 'columbus-tag', targetDate: '2026-10-12', category: 'holiday', priority: 'medium', recur: nth(10, 1, 2) },
  { name: 'Thanksgiving', deName: 'Thanksgiving', slug: 'thanksgiving', deSlug: 'thanksgiving', targetDate: '2026-11-26', category: 'holiday', priority: 'high', recur: nth(11, 4, 4) },
  { name: 'Black Friday', deName: 'Black Friday', slug: 'black-friday', deSlug: 'black-friday', targetDate: '2026-11-27', category: 'event', priority: 'medium', recur: nth(11, 4, 4, 1) },
];

// One-time & lunar/religious events — fixed date, retired once past (no invented future).
const DATED: DateEvent[] = [
  { name: 'World Cup 2026 Opening', deName: 'WM 2026 Eröffnung', slug: 'world-cup-2026-start', deSlug: 'wm-2026-start', targetDate: '2026-06-11', category: 'event', priority: 'high', oneTime: true },
  { name: 'World Cup 2026 Final', deName: 'WM 2026 Finale', slug: 'world-cup-2026-final', deSlug: 'wm-2026-finale', targetDate: '2026-07-19', category: 'event', priority: 'high', oneTime: true },
  { name: 'Super Bowl LXI', deName: 'Super Bowl 2027', slug: 'super-bowl-2027', deSlug: 'super-bowl-2027', targetDate: '2027-02-14', category: 'event', priority: 'high', oneTime: true },
  { name: 'Solar Eclipse 2026', deName: 'Sonnenfinsternis 2026', slug: 'solar-eclipse-2026', deSlug: 'sonnenfinsternis-2026', targetDate: '2026-08-12', category: 'event', priority: 'medium', oneTime: true },
  { name: 'Ramadan 2026', deName: 'Ramadan 2026', slug: 'ramadan-2026', deSlug: 'ramadan-2026', targetDate: '2026-02-18', category: 'holiday', priority: 'high', oneTime: true },
  { name: 'Eid al-Fitr 2026', deName: 'Eid al-Fitr 2026', slug: 'eid-al-fitr-2026', deSlug: 'eid-al-fitr-2026', targetDate: '2026-03-20', category: 'holiday', priority: 'medium', oneTime: true },
  { name: 'Diwali 2026', deName: 'Diwali 2026', slug: 'diwali-2026', deSlug: 'diwali-2026', targetDate: '2026-11-08', category: 'holiday', priority: 'medium', oneTime: true },
  { name: 'Lunar New Year 2027', deName: 'Chinesisches Neujahr 2027', slug: 'lunar-new-year-2027', deSlug: 'chinesisches-neujahr-2027', targetDate: '2027-02-06', category: 'holiday', priority: 'medium', oneTime: true },
  { name: 'Hanukkah 2026', deName: 'Chanukka 2026', slug: 'hanukkah-2026', deSlug: 'chanukka-2026', targetDate: '2026-12-04', category: 'holiday', priority: 'medium', oneTime: true },
];

/** Year countdowns 2026–2035 (distinct "count down to year N" product). */
export function generateYearEvents(): DateEvent[] {
  const years: DateEvent[] = [];
  for (let y = 2026; y <= 2035; y++) {
    years.push({
      name: `Year ${y}`, deName: `Jahr ${y}`, slug: `year-${y}`, deSlug: `jahr-${y}`,
      targetDate: `${y}-01-01`, category: 'year', priority: y <= 2028 ? 'high' : 'low',
    });
  }
  return years;
}

export const BASE_EVENTS: DateEvent[] = [...RECURRING, ...DATED];
export const ALL_EVENTS: DateEvent[] = [...BASE_EVENTS, ...generateYearEvents()];

/** Events that should be built/listed: everything not yet retired. */
export const INDEXED_EVENTS = ALL_EVENTS.filter(e => !isRetired(e) && (e.priority !== 'low' || e.recur !== undefined));

/**
 * Legacy → canonical countdown redirects: duplicate year-twins that used to
 * duplicate an evergreen holiday, and year-suffixed slugs that are now evergreen.
 * Consumed by gen-redirects.ts. { fromDe, fromEn, toDe, toEn } are bare slugs.
 */
export const LEGACY_EVENT_REDIRECTS: { fromDe: string; fromEn: string; toDe: string; toEn: string }[] = [
  // Duplicate holiday twins → evergreen
  { fromDe: 'weihnachten-2025', fromEn: 'christmas-2025', toDe: 'weihnachten', toEn: 'christmas' },
  { fromDe: 'weihnachten-2026', fromEn: 'christmas-2026', toDe: 'weihnachten', toEn: 'christmas' },
  { fromDe: 'neujahr-2027', fromEn: 'new-year-2027', toDe: 'neujahr', toEn: 'new-year' },
  { fromDe: 'ostersonntag-2026', fromEn: 'easter-2026', toDe: 'ostersonntag', toEn: 'easter' },
  { fromDe: 'ostersonntag-2027', fromEn: 'easter-2027', toDe: 'ostersonntag', toEn: 'easter' },
  // Year-suffixed slugs now recurring/evergreen
  { fromDe: 'karfreitag-2026', fromEn: 'good-friday-2026', toDe: 'karfreitag', toEn: 'good-friday' },
  { fromDe: 'ostermontag-2026', fromEn: 'easter-monday-2026', toDe: 'ostermontag', toEn: 'easter-monday' },
  { fromDe: 'christi-himmelfahrt-2026', fromEn: 'ascension-day-2026', toDe: 'christi-himmelfahrt', toEn: 'ascension-day' },
  { fromDe: 'pfingstmontag-2026', fromEn: 'whit-monday-2026', toDe: 'pfingstmontag', toEn: 'whit-monday' },
  { fromDe: 'fronleichnam-2026', fromEn: 'corpus-christi-2026', toDe: 'fronleichnam', toEn: 'corpus-christi' },
  { fromDe: 'memorial-day-2026', fromEn: 'memorial-day-2026', toDe: 'memorial-day', toEn: 'memorial-day' },
  { fromDe: 'juneteenth-2026', fromEn: 'juneteenth-2026', toDe: 'juneteenth', toEn: 'juneteenth' },
  { fromDe: 'thanksgiving-2026', fromEn: 'thanksgiving-2026', toDe: 'thanksgiving', toEn: 'thanksgiving' },
  { fromDe: 'tag-der-arbeit-usa-2026', fromEn: 'labor-day-2026', toDe: 'tag-der-arbeit-usa', toEn: 'labor-day' },
  { fromDe: 'black-friday-2026', fromEn: 'black-friday-2026', toDe: 'black-friday', toEn: 'black-friday' },
];

// ── back-compat helpers (fixed-date only; prefer resolveActiveDate for events) ──
export function getNextOccurrence(target: string): { date: string; yearShift: number } {
  const now = new Date();
  const original = new Date(target + 'T00:00:00Z');
  const d = new Date(original.getTime());
  let yearShift = 0;
  if (d.getTime() < midnight(now).getTime()) {
    d.setUTCFullYear(now.getUTCFullYear());
    if (d.getTime() < midnight(now).getTime()) d.setUTCFullYear(now.getUTCFullYear() + 1);
    yearShift = d.getUTCFullYear() - original.getUTCFullYear();
  }
  return { date: isoUTC(d), yearShift };
}

export function getDaysUntil(target: string): number {
  return daysUntilISO(getNextOccurrence(target).date);
}

export function formatCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  const now = new Date();
  const diff = new Date(targetDate).getTime() - now.getTime();
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1000),
    isPast: diff < 0,
  };
}
