// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for shift / duration math and formatting.
//
// Phase 1 (Correctness): every displayed figure on a shift page MUST come from
// computeShift(). Do not compute or format durations anywhere else in a template.
//
// Hard rule: a DURATION is never rendered with a CLOCK formatter.
//   - formatDurationHHMM(totalMin)  -> "07:30"  (an elapsed span)
//   - formatClockTime(minOfDay)     -> "07:30"  (a wall-clock time of day)
// The two happen to share a glyph shape but are semantically different and come
// from different functions, so a span can never be mislabelled as a time of day.
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = 'de' | 'en';

export type Shift = {
  startMin: number; // minutes from midnight, 0–1439
  endMin: number;   // minutes from midnight, 0–1439
  breakMin: number; // unpaid break in minutes, >= 0
};

export type ShiftResult = {
  grossMin: number;       // handles rollover: if end <= start, +1440
  netMin: number;         // max(0, grossMin - breakMin)
  grossHHMM: string;      // "08:00" (a duration, not a clock time)
  netHHMM: string;        // "07:30" (a duration, not a clock time)
  netDecimal: number;     // 7.5  (2 dp, half-up)
  netDecimalStr: string;  // "7,50" (de-DE) | "7.50" (en-US)
  grossDecimal: number;   // 8.0
  grossDecimalStr: string;// "8,00" | "8.00"
  netTotalMinutes: number;// alias of netMin, kept for template clarity
  crossesMidnight: boolean;
  nightMinutes: number;   // minutes of the worked span inside 23:00–06:00
};

const DAY = 1440;
const NIGHT_START = 23 * 60; // 23:00
const NIGHT_END = 6 * 60;    // 06:00

function pad2(n: number): string {
  return Math.trunc(n).toString().padStart(2, '0');
}

// Half-up rounding to `dp` decimal places. netMin is always >= 0, so a simple
// epsilon-nudged Math.round is exact for our inputs.
function roundHalfUp(value: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Format an elapsed span (minutes) as HH:MM. Never used for a time of day. */
export function formatDurationHHMM(totalMin: number): string {
  const m = Math.max(0, Math.round(totalMin));
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/** Format a wall-clock time of day (minutes from midnight) as HH:MM. */
export function formatClockTime(minOfDay: number): string {
  const m = ((Math.round(minOfDay) % DAY) + DAY) % DAY;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/** Locale-aware decimal string: de-DE uses a comma, en-US a period. */
export function formatDecimal(value: number, locale: Locale, dp = 2): string {
  const fixed = value.toFixed(dp);
  return locale === 'de' ? fixed.replace('.', ',') : fixed;
}

// Overlap (in minutes) between [a, b) and [c, d).
function overlap(a: number, b: number, c: number, d: number): number {
  return Math.max(0, Math.min(b, d) - Math.max(a, c));
}

// Minutes of the absolute worked interval [startAbs, endAbs) that fall inside
// the repeating night window 23:00–06:00. Handles spans that cross midnight and
// full-day (1440 min) spans.
function computeNightMinutes(startAbs: number, endAbs: number): number {
  let total = 0;
  // Cover enough day copies to span any interval up to (and including) 1440 min
  // that starts anywhere in the first day.
  for (let day = -1; day <= 2; day++) {
    const base = day * DAY;
    // Evening slice 23:00–24:00
    total += overlap(startAbs, endAbs, base + NIGHT_START, base + DAY);
    // Morning slice 00:00–06:00
    total += overlap(startAbs, endAbs, base, base + NIGHT_END);
  }
  return total;
}

export function computeShift(s: Shift, locale: Locale): ShiftResult {
  const startMin = ((Math.round(s.startMin) % DAY) + DAY) % DAY;
  const endMin = ((Math.round(s.endMin) % DAY) + DAY) % DAY;
  const breakMin = Math.max(0, Math.round(s.breakMin));

  // Rollover: end <= start means the shift runs into (or fills) the next day.
  const grossMin = endMin <= startMin ? endMin + DAY - startMin : endMin - startMin;
  const netMin = Math.max(0, grossMin - breakMin);

  const netDecimal = roundHalfUp(netMin / 60, 2);
  const grossDecimal = roundHalfUp(grossMin / 60, 2);

  const startAbs = startMin;
  const endAbs = startMin + grossMin;

  return {
    grossMin,
    netMin,
    grossHHMM: formatDurationHHMM(grossMin),
    netHHMM: formatDurationHHMM(netMin),
    netDecimal,
    netDecimalStr: formatDecimal(netDecimal, locale, 2),
    grossDecimal,
    grossDecimalStr: formatDecimal(grossDecimal, locale, 2),
    netTotalMinutes: netMin,
    crossesMidnight: endMin <= startMin,
    nightMinutes: computeNightMinutes(startAbs, endAbs),
  };
}

// ─── Bridge helpers for the existing decimal-hour data model ─────────────────
// The data files (timeRanges.ts) store start/end as decimal hours (e.g. 8.5).
// These convert cleanly into the minute-based Shift the engine expects.

/** Decimal hour (e.g. 8.5) -> minutes from midnight (e.g. 510). */
export function hourToMin(h: number): number {
  return Math.round(h * 60);
}

/** Build a ShiftResult straight from decimal-hour start/end + break minutes. */
export function computeShiftFromHours(
  startHour: number,
  endHour: number,
  breakMin: number,
  locale: Locale,
): ShiftResult {
  return computeShift(
    { startMin: hourToMin(startHour), endMin: hourToMin(endHour), breakMin },
    locale,
  );
}
