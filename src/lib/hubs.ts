// Tiered hub definitions (Phase 6.3). Each hub is an independently rankable page
// of 20–40 links — replacing the /alle-rechner/ link wall that dumped 1000+.
import { INDEXED_RANGES, getRangeHours } from '../data/timeRanges';
import type { TimeRange } from '../data/timeRanges';
import { getArchetype } from './archetype';

export interface Hub {
  slug: string;
  deTitle: string; enTitle: string;
  deDesc: string; enDesc: string;
  filter: (r: TimeRange) => boolean;
}

export const HUBS: Hub[] = [
  {
    slug: 'ab-07-uhr',
    deTitle: 'Schichten ab 07:00 Uhr', enTitle: 'Shifts starting at 07:00',
    deDesc: 'Alle Arbeitszeit-Rechner für Schichten, die um 07:00 Uhr beginnen.',
    enDesc: 'Every work-hours calculator for shifts that start at 07:00.',
    filter: (r) => r.start === 7,
  },
  {
    slug: '8-stunden',
    deTitle: '8-Stunden-Schichten', enTitle: '8-Hour Shifts',
    deDesc: 'Die klassische 8-Stunden-Schicht — alle Start- und Endzeiten mit 8 Stunden Dauer.',
    enDesc: 'The classic 8-hour shift — every start/end pair lasting 8 hours.',
    filter: (r) => getRangeHours(r.start, r.end) === 8,
  },
  {
    slug: 'nachtschichten',
    deTitle: 'Nachtschichten', enTitle: 'Night Shifts',
    deDesc: 'Schichten mit Nachtarbeit (23:00–06:00 Uhr) oder über Mitternacht.',
    enDesc: 'Shifts with night work (23:00–06:00) or crossing midnight.',
    filter: (r) => getArchetype(r.start, r.end) === 'nacht',
  },
  {
    slug: 'teilzeit',
    deTitle: 'Teilzeit (4–6 Stunden)', enTitle: 'Part-Time (4–6 hours)',
    deDesc: 'Kürzere Schichten zwischen 4 und 6 Stunden — typische Teilzeitmodelle.',
    enDesc: 'Shorter shifts between 4 and 6 hours — typical part-time patterns.',
    filter: (r) => { const h = getRangeHours(r.start, r.end); return h >= 4 && h <= 6; },
  },
];

/** Up to `limit` ranges for a hub, in start-time order. */
export function hubRanges(hub: Hub, limit = 40): TimeRange[] {
  return INDEXED_RANGES.filter(r => r.start !== r.end && hub.filter(r))
    .sort((a, b) => a.start - b.start || getRangeHours(a.start, a.end) - getRangeHours(b.start, b.end))
    .slice(0, limit);
}
