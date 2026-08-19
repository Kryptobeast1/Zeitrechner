// ─────────────────────────────────────────────────────────────────────────────
// Conditional content modules (Phase 5.4). Each is emitted ONLY when genuinely
// applicable — this replaces the unconditional boilerplate that pasted
// inapplicable claims ("work before 6 AM qualifies for night premiums") across
// hundreds of pages. All legal thresholds are ArbZG values.
// ─────────────────────────────────────────────────────────────────────────────

import { computeShiftFromHours, formatClockTime, hourToMin } from './shift.ts';
import type { Archetype } from './archetype.ts';

export type ModuleId =
  | 'nachtzuschlag' | 'ruhezeit' | 'pausenpflicht'
  | 'mitternachtswechsel' | 'ueberstunden' | 'teilzeit';

export interface ShiftModule {
  id: ModuleId;
  data: Record<string, string | number>;
}

const CONTRACT_MIN = 480; // a standard 8-hour day

// Priority order per archetype (only applicable modules are kept).
const ORDER: Record<Archetype, ModuleId[]> = {
  nacht:    ['mitternachtswechsel', 'nachtzuschlag', 'ruhezeit', 'pausenpflicht', 'ueberstunden', 'teilzeit'],
  lang:     ['pausenpflicht', 'ruhezeit', 'ueberstunden', 'nachtzuschlag', 'mitternachtswechsel', 'teilzeit'],
  standard: ['pausenpflicht', 'ueberstunden', 'teilzeit', 'ruhezeit', 'nachtzuschlag', 'mitternachtswechsel'],
  kurzzeit: ['teilzeit', 'ruhezeit'],           // break/compliance modules dropped
  countdown: [],
  hub: [],
};

export function getShiftModules(startHour: number, endHour: number, archetype: Archetype): ShiftModule[] {
  const gross = computeShiftFromHours(startHour, endHour, 0, 'de');
  const net30 = computeShiftFromHours(startHour, endHour, 30, 'de');
  const endMin = ((Math.round(hourToMin(endHour)) % 1440) + 1440) % 1440;

  // Build every applicable module keyed by id.
  const applicable = new Map<ModuleId, ShiftModule>();

  if (gross.nightMinutes > 0) {
    applicable.set('nachtzuschlag', { id: 'nachtzuschlag', data: { nightMinutes: gross.nightMinutes } });
  }
  // Ruhezeit: 11h minimum rest → earliest legal next start
  {
    const nextStart = (endMin + 11 * 60) % 1440;
    applicable.set('ruhezeit', { id: 'ruhezeit', data: { endClock: formatClockTime(endMin), nextStart: formatClockTime(nextStart) } });
  }
  if (gross.grossMin > 6 * 60) {
    const requiredBreak = gross.grossMin > 9 * 60 ? 45 : 30;
    applicable.set('pausenpflicht', { id: 'pausenpflicht', data: { requiredBreak, grossHHMM: gross.grossHHMM } });
  }
  if (gross.crossesMidnight) {
    applicable.set('mitternachtswechsel', { id: 'mitternachtswechsel', data: { grossHHMM: gross.grossHHMM } });
  }
  if (net30.netMin > CONTRACT_MIN) {
    const over = net30.netMin - CONTRACT_MIN;
    applicable.set('ueberstunden', { id: 'ueberstunden', data: { overMin: over, overHHMM: `${Math.floor(over / 60)}:${String(over % 60).padStart(2, '0')}` } });
  }
  if (net30.netMin < 6 * 60) {
    applicable.set('teilzeit', { id: 'teilzeit', data: { netDecimalDe: net30.netDecimalStr, netHHMM: net30.netHHMM } });
  }

  // Order by archetype priority; drop anything not applicable.
  return ORDER[archetype].map(id => applicable.get(id)).filter((m): m is ShiftModule => !!m);
}

/** Predicate mirror used by the audit to prove no false-condition module renders. */
export function moduleConditionHolds(id: ModuleId, startHour: number, endHour: number): boolean {
  const gross = computeShiftFromHours(startHour, endHour, 0, 'de');
  const net30 = computeShiftFromHours(startHour, endHour, 30, 'de');
  switch (id) {
    case 'nachtzuschlag': return gross.nightMinutes > 0;
    case 'ruhezeit': return true;
    case 'pausenpflicht': return gross.grossMin > 6 * 60;
    case 'mitternachtswechsel': return gross.crossesMidnight;
    case 'ueberstunden': return net30.netMin > CONTRACT_MIN;
    case 'teilzeit': return net30.netMin < 6 * 60;
  }
}
