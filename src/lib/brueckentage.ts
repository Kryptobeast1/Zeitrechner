// Brückentage ("bridge day") optimiser. For a given year + Bundesland it finds
// the short runs of working days that sit between two blocks of free days (a
// weekend and/or a public holiday). Taking those working days as vacation turns
// a holiday into a long stretch off. Fully computed from the holiday engine —
// no hardcoded dates, correct for every state and year (movable feasts included).
import { getHolidays, BUNDESLAENDER, type Bundesland } from './holidays.ts';

/** URL slug per Bundesland (German name, ASCII-folded) for /brueckentage-{year}-{slug}/. */
export const STATE_SLUGS: Record<Bundesland, string> = {
  BW: 'baden-wuerttemberg', BY: 'bayern', BE: 'berlin', BB: 'brandenburg',
  HB: 'bremen', HH: 'hamburg', HE: 'hessen', MV: 'mecklenburg-vorpommern',
  NI: 'niedersachsen', NW: 'nordrhein-westfalen', RP: 'rheinland-pfalz', SL: 'saarland',
  SN: 'sachsen', ST: 'sachsen-anhalt', SH: 'schleswig-holstein', TH: 'thueringen',
};
export const STATE_BY_SLUG: Record<string, Bundesland> =
  Object.fromEntries(Object.entries(STATE_SLUGS).map(([code, slug]) => [slug, code as Bundesland]));

/** Other states with an identical set of public-holiday DATES in this year (⇒ identical Brückentage). */
export function statesWithSameHolidays(year: number, state: Bundesland): Bundesland[] {
  const sig = (s: Bundesland) => getHolidays(year, s).map(h => h.dateISO).join(',');
  const mine = sig(state);
  return BUNDESLAENDER.map(b => b.code).filter(c => c !== state && sig(c) === mine);
}

export interface Bridge {
  label: string;          // holiday(s) that anchor the bridge, e.g. "Christi Himmelfahrt"
  holidayNames: string[];
  urlaubDates: string[];  // ISO working days to take off
  urlaubCount: number;
  freeStartISO: string;   // first day of the resulting free stretch
  freeEndISO: string;     // last day of the resulting free stretch
  freeDays: number;       // length of that stretch
  efficiency: number;     // freeDays / urlaubCount (higher = better)
}

export interface BrueckenResult {
  year: number;
  state: Bundesland;
  bridges: Bridge[];      // sorted by efficiency desc, then date
  bestUrlaub: number;     // vacation days in a non-overlapping optimal pick
  bestFree: number;       // free days that pick yields
}

const pad = (n: number) => String(n).padStart(2, '0');
const isoUTC = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

interface Block { startIdx: number; endIdx: number; hasHoliday: boolean; holidayNames: string[]; }

export function computeBrueckentage(year: number, state: Bundesland): BrueckenResult {
  const holidays = new Map<string, string>();
  for (const h of getHolidays(year, state)) holidays.set(h.dateISO, h.de);

  // Day-by-day flags for the whole year.
  const start = new Date(Date.UTC(year, 0, 1));
  const days: { iso: string; off: boolean; holiday?: string }[] = [];
  for (let d = new Date(start.getTime()); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = isoUTC(d);
    const dow = d.getUTCDay();
    const holiday = holidays.get(iso);
    days.push({ iso, off: dow === 0 || dow === 6 || !!holiday, holiday });
  }

  // Maximal runs of consecutive free days.
  const blocks: Block[] = [];
  for (let i = 0; i < days.length; i++) {
    if (!days[i].off) continue;
    const startIdx = i;
    const names: string[] = [];
    while (i < days.length && days[i].off) { if (days[i].holiday) names.push(days[i].holiday as string); i++; }
    blocks.push({ startIdx, endIdx: i - 1, hasHoliday: names.length > 0, holidayNames: [...new Set(names)] });
  }

  // A bridge = a gap of 1–4 working days between two free blocks where at least
  // one block owes to a public holiday (so it is holiday-driven, not any old week).
  const bridges: Bridge[] = [];
  for (let b = 0; b < blocks.length - 1; b++) {
    const left = blocks[b], right = blocks[b + 1];
    const gapStart = left.endIdx + 1, gapEnd = right.startIdx - 1;
    const gapLen = gapEnd - gapStart + 1;
    if (gapLen < 1 || gapLen > 4) continue;
    if (!left.hasHoliday && !right.hasHoliday) continue;
    const urlaubDates = days.slice(gapStart, gapEnd + 1).map(d => d.iso);
    const holidayNames = [...new Set([...left.holidayNames, ...right.holidayNames])];
    const freeDays = right.endIdx - left.startIdx + 1;
    bridges.push({
      label: holidayNames.join(' + ') || 'Brückentag',
      holidayNames,
      urlaubDates,
      urlaubCount: gapLen,
      freeStartISO: days[left.startIdx].iso,
      freeEndISO: days[right.endIdx].iso,
      freeDays,
      efficiency: freeDays / gapLen,
    });
  }

  bridges.sort((a, b) => b.efficiency - a.efficiency || a.freeStartISO.localeCompare(b.freeStartISO));

  // Non-overlapping optimal pick (greedy by efficiency) for the year headline.
  const used = new Set<string>();
  let bestUrlaub = 0, bestFree = 0;
  for (const br of bridges) {
    const span: string[] = [];
    for (let d = new Date(br.freeStartISO + 'T00:00:00Z'); isoUTC(d) <= br.freeEndISO; d.setUTCDate(d.getUTCDate() + 1)) span.push(isoUTC(d));
    if (span.some(s => used.has(s))) continue;
    span.forEach(s => used.add(s));
    bestUrlaub += br.urlaubCount;
    bestFree += br.freeDays;
  }

  return { year, state, bridges, bestUrlaub, bestFree };
}
