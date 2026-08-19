// ─────────────────────────────────────────────────────────────────────────────
// Variation system (Phase 5). All variation is DERIVED from page data, so it is
// deterministic across builds and defensible.
//   Axis 1 — archetype (6): layout/module selection from shift shape
//   Axis 2 — band (5):       accent palette from start hour  (→ data-band)
//   Axis 3 — treatment (3):  result visual, by stable slug hash
// 6 × 5 × 3 = 90 distinct visual combinations.
// ─────────────────────────────────────────────────────────────────────────────

import { computeShiftFromHours } from './shift.ts';

export type Archetype = 'kurzzeit' | 'standard' | 'nacht' | 'lang' | 'countdown' | 'hub';
export type Band = 'dawn' | 'day' | 'midday' | 'evening' | 'night';
export type Treatment = 'band' | 'dial' | 'split';

// Deterministic 31-bit hash of a slug (same page → same value across builds).
export function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) { h = ((h << 5) - h) + slug.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

/** Layout archetype from the shift's shape. */
export function getArchetype(startHour: number, endHour: number): Archetype {
  const r = computeShiftFromHours(startHour, endHour, 0, 'de');
  const durH = r.grossMin / 60;
  if (r.crossesMidnight || r.nightMinutes > 0) return 'nacht';
  if (durH < 4) return 'kurzzeit';
  if (durH > 9) return 'lang';
  return 'standard'; // 4–9h, daytime
}

/** Accent band from the start hour (drives --band-accent via [data-band]). */
export function getBand(startHour: number): Band {
  const h = ((Math.floor(startHour) % 24) + 24) % 24;
  if (h >= 4 && h < 8) return 'dawn';
  if (h >= 8 && h < 12) return 'day';
  if (h >= 12 && h < 16) return 'midday';
  if (h >= 16 && h < 22) return 'evening';
  return 'night'; // 22:00–03:59
}

/** Result visual treatment, rotated by a stable hash of the slug. */
const TREATMENTS: Treatment[] = ['band', 'dial', 'split'];
export function getTreatment(slug: string): Treatment {
  return TREATMENTS[slugHash(slug + '::treat') % TREATMENTS.length];
}

/** WCAG-AA-verified accents (against --surface #FFFFFF). Kept in one place so the
 *  audit and the CSS reference the same source values. */
export const BAND_ACCENTS: Record<Band, string> = {
  dawn: '#1B6B5A',
  day: '#124559',
  midday: '#3A6B35',
  evening: '#8A4B08',
  night: '#2D3A6B',
};
