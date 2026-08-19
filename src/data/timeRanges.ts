// Time ranges data — all meaningful hour pairs for programmatic SEO pages
// Covers common work shifts, meal times, and all-hour combinations

export interface TimeRange {
  start: number;   // 0–23 (can be decimal 8.5 for 08:30)
  end: number;     // 0–23 (can be decimal 17.5 for 17:30)
  slug: string;    // Canonical EN URL slug, 24h (e.g. 8-30-and-17)
  deSlug: string;  // Canonical DE URL slug, 24h (e.g. 8-30-und-17)
  legacyEnSlug?: string; // Old ambiguous 12h EN slug to 301 from (e.g. 8-30-and-5)
  priority: 'high' | 'medium' | 'low';
  index: boolean;  // Should this page be indexed?
  workShift?: boolean;
  demandScore: number; // 0-100 (intent signal)
}

/**
 * Validates if a page has logical search intent.
 * Prevents machine-generated nonsense pairs.
 */
function isValidPage(start: number, end: number, dur: number): boolean {
  // Office hours / Work shifts are always valid
  if (start >= 5 && start <= 11 && dur >= 3 && dur <= 12) return true;
  if (start >= 12 && start <= 15 && dur <= 6) return true; // Afternoon/Part-time
  if (start >= 18 && start <= 23 && dur >= 4) return true; // Evening/Night
  if (dur === 8 || dur === 4 || dur === 1 || dur === 0.5 || dur === 1.5 || dur === 7.5) return true;
  
  // Logic: Most people search for intervals that start on "round" hours or common shift times.
  const commonStarts = [0, 5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 12, 12.5, 13, 14, 15, 16, 17, 18, 20, 22];
  if (commonStarts.includes(start)) return true;

  // Otherwise, only if duration is "meaningful"
  const meaningfulDurs = [5, 10, 12, 14, 16, 24];
  return meaningfulDurs.includes(dur);
}

// Common work shifts (EXTREMELY HIGH demand).
// EN slug is canonical zero-ambiguity 24h; legacyEnSlug is the old 12h form we 301 from.
const workShifts: TimeRange[] = [
  { start: 8, end: 16, slug: '8-and-16', deSlug: '8-und-16', legacyEnSlug: '8-and-4', priority: 'high', index: true, workShift: true, demandScore: 100 },
  { start: 8, end: 17, slug: '8-and-17', deSlug: '8-und-17', legacyEnSlug: '8-and-5', priority: 'high', index: true, workShift: true, demandScore: 100 },
  { start: 8.5, end: 17, slug: '8-30-and-17', deSlug: '8-30-und-17', legacyEnSlug: '8-30-and-5', priority: 'high', index: true, workShift: true, demandScore: 90 },
  { start: 8.5, end: 17.5, slug: '8-30-and-17-30', deSlug: '8-30-und-17-30', legacyEnSlug: '8-30-and-5-30', priority: 'high', index: true, workShift: true, demandScore: 85 },
  { start: 9, end: 17, slug: '9-and-17', deSlug: '9-und-17', legacyEnSlug: '9-and-5', priority: 'high', index: true, workShift: true, demandScore: 100 },
  { start: 9, end: 18, slug: '9-and-18', deSlug: '9-und-18', legacyEnSlug: '9-and-6', priority: 'high', index: true, workShift: true, demandScore: 95 },
  { start: 9.5, end: 18.5, slug: '9-30-and-18-30', deSlug: '9-30-und-18-30', legacyEnSlug: '9-30-and-6-30', priority: 'high', index: true, workShift: true, demandScore: 80 },
  { start: 7.5, end: 16, slug: '7-30-and-16', deSlug: '7-30-und-16', legacyEnSlug: '7-30-and-4', priority: 'high', index: true, workShift: true, demandScore: 85 },
  { start: 7, end: 15, slug: '7-and-15', deSlug: '7-und-15', legacyEnSlug: '7-and-3', priority: 'high', index: true, workShift: true, demandScore: 95 },
  { start: 7.5, end: 15.5, slug: '7-30-and-15-30', deSlug: '7-30-und-15-30', legacyEnSlug: '7-30-and-3-30', priority: 'high', index: true, workShift: true, demandScore: 80 },
  { start: 6, end: 14, slug: '6-and-14', deSlug: '6-und-14', legacyEnSlug: '6-and-2', priority: 'high', index: true, workShift: true, demandScore: 80 },
  { start: 12, end: 20, slug: '12-and-20', deSlug: '12-und-20', legacyEnSlug: '12pm-and-8pm', priority: 'high', index: true, workShift: true, demandScore: 80 },
];

/**
 * Phase 3 Scaling logic (Captures niche shifts and half-hour ranges)
 */
function generatePhase3Ranges(): TimeRange[] {
  const ranges: TimeRange[] = [];
  
  // All start hours (0-23 in 0.5 steps)
  for (let start = 0; start < 24; start += 0.5) {
    // Meaningful durations (include half-hours)
    const durations = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 8.5, 9, 10, 12, 24];
    
    for (const dur of durations) {
      const end = (start + dur) % 24;

      // Phase 3.2: never generate zero-duration / full-day junk (start === end).
      // e.g. "Stunden zwischen 08:00 und 08:00" — no search intent, should 410/404.
      if (end === start) continue;

      // Skip if already in workShifts
      if (workShifts.some(w => w.start === start && w.end === end)) continue;

      // Intent Check (Only index high-intent half-hour combos)
      if (!isValidPage(start, end, dur)) continue;

      const isHighDemand = (dur === 8 || dur === 4 || dur === 8.5);
      const isShiftTime = (start === 7.5 || start === 8.5 || start === 9.5);
      
      const dScore = (isHighDemand && isShiftTime) ? 75 : (isHighDemand ? 60 : 30);

      // Slug creation helper
      const formatSlug = (h: number) => h.toString().replace('.', '-').replace('-5', '-30');

      ranges.push({
        start,
        end,
        slug: `${formatSlug(start)}-and-${formatSlug(end)}`,
        deSlug: `${formatSlug(start)}-und-${formatSlug(end)}`,
        priority: dScore >= 60 ? 'medium' : 'low', // Keep 'low' for very common durations to prioritize crawl budget on high-demand, but we now index both.
        index: dScore >= 30, 
        demandScore: dScore,
      });
    }
  }
  return ranges;
}

export const ALL_TIME_RANGES: TimeRange[] = [
  ...workShifts,
  ...generatePhase3Ranges(),
];

export const INDEXED_RANGES = ALL_TIME_RANGES.filter(r => r.index);

// Format hour to 12h display
export function formatHour12(h: number): string {
  const hours = Math.floor(h);
  const minutes = (h % 1) * 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Format hour to 24h display
export function formatHour24(h: number): string {
  const hours = Math.floor(h);
  const minutes = (h % 1) * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Get duration in hours between two times (handles overnight)
export function getRangeHours(start: number, end: number): number {
  if (end > start) return end - start;
  if (end === start) return 24; 
  return 24 - start + end; // overnight
}

// Get all similar ranges for internal linking (Mesh Network)
export function getSimilarRanges(range: TimeRange, count = 12): TimeRange[] {
  const hours = getRangeHours(range.start, range.end);
  return INDEXED_RANGES
    .filter(r => r.slug !== range.slug)
    .map(r => ({ 
      r, 
      diff: Math.abs(getRangeHours(r.start, r.end) - hours) * 2 + Math.abs(r.start - range.start) 
    }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, count)
    .map(x => x.r);
}
