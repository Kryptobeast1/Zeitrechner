// German public-holiday engine (Phase 4).
// Holidays are computed, not hardcoded: fixed-date holidays, Easter-relative
// movable feasts (via the Anonymous Gregorian algorithm), and the one special
// case (Buß- und Bettag). The per-Bundesland applicability map is the maintained
// "dataset" — see data/holidays/SOURCES.md for provenance and the annual review.
// All date maths is in UTC to stay free of timezone/DST drift.

export type Bundesland =
  | 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH' | 'HE' | 'MV'
  | 'NI' | 'NW' | 'RP' | 'SL' | 'SN' | 'ST' | 'SH' | 'TH';

export const BUNDESLAENDER: { code: Bundesland; de: string; en: string }[] = [
  { code: 'BW', de: 'Baden-Württemberg', en: 'Baden-Württemberg' },
  { code: 'BY', de: 'Bayern', en: 'Bavaria' },
  { code: 'BE', de: 'Berlin', en: 'Berlin' },
  { code: 'BB', de: 'Brandenburg', en: 'Brandenburg' },
  { code: 'HB', de: 'Bremen', en: 'Bremen' },
  { code: 'HH', de: 'Hamburg', en: 'Hamburg' },
  { code: 'HE', de: 'Hessen', en: 'Hesse' },
  { code: 'MV', de: 'Mecklenburg-Vorpommern', en: 'Mecklenburg-Vorpommern' },
  { code: 'NI', de: 'Niedersachsen', en: 'Lower Saxony' },
  { code: 'NW', de: 'Nordrhein-Westfalen', en: 'North Rhine-Westphalia' },
  { code: 'RP', de: 'Rheinland-Pfalz', en: 'Rhineland-Palatinate' },
  { code: 'SL', de: 'Saarland', en: 'Saarland' },
  { code: 'SN', de: 'Sachsen', en: 'Saxony' },
  { code: 'ST', de: 'Sachsen-Anhalt', en: 'Saxony-Anhalt' },
  { code: 'SH', de: 'Schleswig-Holstein', en: 'Schleswig-Holstein' },
  { code: 'TH', de: 'Thüringen', en: 'Thuringia' },
];
const ALL_STATES = BUNDESLAENDER.map(b => b.code);

type Applicability = Bundesland[] | 'ALL';

interface HolidayRule {
  id: string;
  de: string;
  en: string;
  kind: 'fixed' | 'easter' | 'buss-bettag';
  month?: number;      // 1-12 for fixed
  day?: number;        // for fixed
  offset?: number;     // days from Easter Sunday for movable feasts
  states: Applicability;
  note?: string;       // e.g. municipal exceptions
}

// The maintained dataset: which holidays exist and which states observe them.
// Movable feasts carry an Easter offset; the actual date is computed per year.
const RULES: HolidayRule[] = [
  { id: 'neujahr', de: 'Neujahr', en: "New Year's Day", kind: 'fixed', month: 1, day: 1, states: 'ALL' },
  { id: 'hl-drei-koenige', de: 'Heilige Drei Könige', en: 'Epiphany', kind: 'fixed', month: 1, day: 6, states: ['BW', 'BY', 'ST'] },
  { id: 'frauentag', de: 'Internationaler Frauentag', en: "International Women's Day", kind: 'fixed', month: 3, day: 8, states: ['BE', 'MV'] },
  { id: 'karfreitag', de: 'Karfreitag', en: 'Good Friday', kind: 'easter', offset: -2, states: 'ALL' },
  { id: 'ostersonntag', de: 'Ostersonntag', en: 'Easter Sunday', kind: 'easter', offset: 0, states: ['BB'] },
  { id: 'ostermontag', de: 'Ostermontag', en: 'Easter Monday', kind: 'easter', offset: 1, states: 'ALL' },
  { id: 'tag-der-arbeit', de: 'Tag der Arbeit', en: 'Labour Day', kind: 'fixed', month: 5, day: 1, states: 'ALL' },
  { id: 'christi-himmelfahrt', de: 'Christi Himmelfahrt', en: 'Ascension Day', kind: 'easter', offset: 39, states: 'ALL' },
  { id: 'pfingstsonntag', de: 'Pfingstsonntag', en: 'Whit Sunday', kind: 'easter', offset: 49, states: ['BB'] },
  { id: 'pfingstmontag', de: 'Pfingstmontag', en: 'Whit Monday', kind: 'easter', offset: 50, states: 'ALL' },
  { id: 'fronleichnam', de: 'Fronleichnam', en: 'Corpus Christi', kind: 'easter', offset: 60, states: ['BW', 'BY', 'HE', 'NW', 'RP', 'SL'], note: 'Also in some municipalities of Saxony and Thuringia.' },
  { id: 'mariae-himmelfahrt', de: 'Mariä Himmelfahrt', en: 'Assumption Day', kind: 'fixed', month: 8, day: 15, states: ['SL'], note: 'Also in predominantly Catholic municipalities of Bavaria.' },
  { id: 'weltkindertag', de: 'Weltkindertag', en: "World Children's Day", kind: 'fixed', month: 9, day: 20, states: ['TH'] },
  { id: 'tag-deutsche-einheit', de: 'Tag der Deutschen Einheit', en: 'German Unity Day', kind: 'fixed', month: 10, day: 3, states: 'ALL' },
  { id: 'reformationstag', de: 'Reformationstag', en: 'Reformation Day', kind: 'fixed', month: 10, day: 31, states: ['BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH'] },
  { id: 'allerheiligen', de: 'Allerheiligen', en: "All Saints' Day", kind: 'fixed', month: 11, day: 1, states: ['BW', 'BY', 'NW', 'RP', 'SL'] },
  { id: 'buss-bettag', de: 'Buß- und Bettag', en: 'Repentance Day', kind: 'buss-bettag', states: ['SN'] },
  { id: 'weihnachten-1', de: '1. Weihnachtstag', en: 'Christmas Day', kind: 'fixed', month: 12, day: 25, states: 'ALL' },
  { id: 'weihnachten-2', de: '2. Weihnachtstag', en: 'Boxing Day', kind: 'fixed', month: 12, day: 26, states: 'ALL' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** Easter Sunday (Gregorian), Anonymous/Meeus algorithm. Computed, never hardcoded. */
export function computeEaster(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/** Buß- und Bettag: the Wednesday before 23 November. */
function bussUndBettag(year: number): Date {
  const d = new Date(Date.UTC(year, 10, 22)); // Nov 22
  while (d.getUTCDay() !== 3) d.setUTCDate(d.getUTCDate() - 1); // 3 = Wednesday
  return d;
}

function ruleDate(rule: HolidayRule, year: number, easter: Date): Date {
  if (rule.kind === 'fixed') return new Date(Date.UTC(year, (rule.month as number) - 1, rule.day));
  if (rule.kind === 'buss-bettag') return bussUndBettag(year);
  const d = new Date(easter.getTime());
  d.setUTCDate(d.getUTCDate() + (rule.offset as number));
  return d;
}

export interface Holiday {
  id: string;
  dateISO: string;
  de: string;
  en: string;
  nationwide: boolean;
  states: Bundesland[];
  note?: string;
}

/** All public holidays for a year, optionally filtered to one Bundesland. Sorted by date. */
export function getHolidays(year: number, state?: Bundesland): Holiday[] {
  const easter = computeEaster(year);
  const out: Holiday[] = [];
  for (const rule of RULES) {
    const states = rule.states === 'ALL' ? [...ALL_STATES] : rule.states;
    if (state && !states.includes(state)) continue;
    out.push({
      id: rule.id,
      dateISO: toISO(ruleDate(rule, year, easter)),
      de: rule.de,
      en: rule.en,
      nationwide: rule.states === 'ALL',
      states,
      note: rule.note,
    });
  }
  return out.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

/** Number of public holidays a Bundesland observes in a year. */
export function holidayCount(year: number, state: Bundesland): number {
  return getHolidays(year, state).length;
}

/** Is the given YYYY-MM-DD a public holiday in the given state? */
export function isPublicHoliday(dateISO: string, state: Bundesland): boolean {
  const year = parseInt(dateISO.slice(0, 4), 10);
  return getHolidays(year, state).some(h => h.dateISO === dateISO);
}

export interface WorkingDaysResult {
  workingDays: number;
  weekendDays: number;
  holidayDays: number;   // holidays that fell on a weekday and were excluded
  totalDays: number;
  holidaysHit: Holiday[];
}

/**
 * Working days (Mon–Fri, excluding public holidays) between two dates.
 * Inclusive of both endpoints. Spans multiple years correctly.
 */
export function workingDaysBetween(startISO: string, endISO: string, state: Bundesland): WorkingDaysResult {
  let start = new Date(startISO + 'T00:00:00Z');
  let end = new Date(endISO + 'T00:00:00Z');
  if (end < start) [start, end] = [end, start];

  // Collect holidays for the year range once.
  const holidays = new Map<string, Holiday>();
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    for (const h of getHolidays(y, state)) holidays.set(h.dateISO, h);
  }

  let workingDays = 0, weekendDays = 0, holidayDays = 0, totalDays = 0;
  const holidaysHit: Holiday[] = [];
  const cur = new Date(start.getTime());
  while (cur <= end) {
    totalDays++;
    const dow = cur.getUTCDay();
    const iso = toISO(cur);
    if (dow === 0 || dow === 6) {
      weekendDays++;
    } else if (holidays.has(iso)) {
      holidayDays++;
      holidaysHit.push(holidays.get(iso) as Holiday);
    } else {
      workingDays++;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return { workingDays, weekendDays, holidayDays, totalDays, holidaysHit };
}
