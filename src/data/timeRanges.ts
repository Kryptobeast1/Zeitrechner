// Time ranges data — all meaningful hour pairs for programmatic SEO pages
// Covers common work shifts, meal times, and all-hour combinations

export interface TimeRange {
  start: number;   // 0–23
  end: number;     // 0–23 (can be next day if end < start)
  slug: string;    // URL slug
  deSlug: string;  // German slug
  priority: 'high' | 'medium' | 'low';
  index: boolean;  // Should this page be indexed?
  workShift?: boolean;
}

// Common work shifts (HIGH priority — index all)
const workShifts: TimeRange[] = [
  { start: 8, end: 16, slug: '8-and-4', deSlug: '8-und-16', priority: 'high', index: true, workShift: true },
  { start: 8, end: 17, slug: '8-and-5', deSlug: '8-und-17', priority: 'high', index: true, workShift: true },
  { start: 9, end: 17, slug: '9-and-5', deSlug: '9-und-17', priority: 'high', index: true, workShift: true },
  { start: 9, end: 18, slug: '9-and-6', deSlug: '9-und-18', priority: 'high', index: true, workShift: true },
  { start: 10, end: 18, slug: '10-and-6', deSlug: '10-und-18', priority: 'high', index: true, workShift: true },
  { start: 10, end: 19, slug: '10-and-7', deSlug: '10-und-19', priority: 'high', index: true, workShift: true },
  { start: 7, end: 15, slug: '7-and-3', deSlug: '7-und-15', priority: 'high', index: true, workShift: true },
  { start: 7, end: 16, slug: '7-and-4', deSlug: '7-und-16', priority: 'high', index: true, workShift: true },
  { start: 6, end: 14, slug: '6-and-2', deSlug: '6-und-14', priority: 'medium', index: true, workShift: true },
  { start: 6, end: 15, slug: '6-and-3', deSlug: '6-und-15', priority: 'medium', index: true, workShift: true },
  { start: 8, end: 12, slug: '8-and-12', deSlug: '8-und-12', priority: 'medium', index: true, workShift: true },
  { start: 9, end: 12, slug: '9-and-12', deSlug: '9-und-12', priority: 'medium', index: true, workShift: true },
  { start: 13, end: 17, slug: '1pm-and-5pm', deSlug: '13-und-17', priority: 'medium', index: true, workShift: true },
  { start: 8, end: 18, slug: '8-and-6', deSlug: '8-und-18', priority: 'high', index: true, workShift: true },
  { start: 9, end: 13, slug: '9-and-1pm', deSlug: '9-und-13', priority: 'medium', index: true, workShift: true },
  { start: 0, end: 8, slug: '12am-and-8am', deSlug: '0-und-8', priority: 'low', index: true, workShift: true },
  { start: 22, end: 6, slug: '10pm-and-6am', deSlug: '22-und-6', priority: 'low', index: true, workShift: true },
  { start: 12, end: 20, slug: '12pm-and-8pm', deSlug: '12-und-20', priority: 'medium', index: true, workShift: true },
  { start: 14, end: 22, slug: '2pm-and-10pm', deSlug: '14-und-22', priority: 'low', index: true, workShift: true },
  { start: 8, end: 20, slug: '8-and-8pm', deSlug: '8-und-20', priority: 'medium', index: true, workShift: true },
];

// General time ranges (MEDIUM priority)
function generateGeneralRanges(): TimeRange[] {
  const ranges: TimeRange[] = [];
  const commonStarts = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const durations = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

  for (const start of commonStarts) {
    for (const dur of durations) {
      const end = (start + dur) % 24;
      // Skip if already in workShifts
      const exists = workShifts.some(w => w.start === start && w.end === end);
      if (exists) continue;

      const startH = start.toString().padStart(2, '0');
      const endH = end.toString().padStart(2, '0');
      const isHighDemand = (dur === 8 || dur === 4) && start >= 6 && start <= 12;

      ranges.push({
        start,
        end,
        slug: `${start}-and-${end}`,
        deSlug: `${start}-und-${end}`,
        priority: isHighDemand ? 'medium' : 'low',
        index: isHighDemand || dur >= 4,
      });
    }
  }
  return ranges;
}

export const ALL_TIME_RANGES: TimeRange[] = [
  ...workShifts,
  ...generateGeneralRanges(),
];

export const INDEXED_RANGES = ALL_TIME_RANGES.filter(r => r.index);

// Format hour to 12h display
export function formatHour12(h: number): string {
  if (h === 0) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h > 12) return `${h - 12}:00 PM`;
  return `${h}:00 AM`;
}

// Format hour to 24h display
export function formatHour24(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`;
}

// Get duration in hours between two times (handles overnight)
export function getRangeHours(start: number, end: number): number {
  if (end > start) return end - start;
  return 24 - start + end; // overnight
}

// Get all similar ranges for internal linking  
export function getSimilarRanges(range: TimeRange, count = 8): TimeRange[] {
  const hours = getRangeHours(range.start, range.end);
  return INDEXED_RANGES
    .filter(r => r.slug !== range.slug)
    .map(r => ({ r, diff: Math.abs(getRangeHours(r.start, r.end) - hours) + Math.abs(r.start - range.start) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, count)
    .map(x => x.r);
}
