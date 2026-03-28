// Date events data for countdown pages
// Covers holidays, special dates, and years 2025–2035

export interface DateEvent {
  slug: string;       // URL slug
  deSlug: string;     // German slug
  name: string;       // English name
  deName: string;     // German name
  targetDate: string; // ISO date string (YYYY-MM-DD)
  priority: 'high' | 'medium' | 'low';
  index: boolean;
  category: 'holiday' | 'year' | 'season' | 'special';
}

const currentYear = new Date().getFullYear();

// Generate year events 2025–2035
function generateYearEvents(): DateEvent[] {
  const events: DateEvent[] = [];
  for (let year = 2025; year <= 2035; year++) {
    events.push({
      slug: `${year}`,
      deSlug: `${year}`,
      name: `New Year ${year}`,
      deName: `Neujahr ${year}`,
      targetDate: `${year}-01-01`,
      priority: year <= currentYear + 2 ? 'high' : 'medium',
      index: true,
      category: 'year',
    });
  }
  return events;
}

// Fixed holidays (recurring each year)
function generateHolidayEvents(): DateEvent[] {
  const holidays: DateEvent[] = [];
  const years = [currentYear, currentYear + 1];

  for (const year of years) {
    holidays.push(
      {
        slug: `christmas-${year}`,
        deSlug: `weihnachten-${year}`,
        name: `Christmas ${year}`,
        deName: `Weihnachten ${year}`,
        targetDate: `${year}-12-25`,
        priority: 'high',
        index: true,
        category: 'holiday',
      },
      {
        slug: `new-years-eve-${year}`,
        deSlug: `silvester-${year}`,
        name: `New Year's Eve ${year}`,
        deName: `Silvester ${year}`,
        targetDate: `${year}-12-31`,
        priority: 'high',
        index: true,
        category: 'holiday',
      },
      {
        slug: `halloween-${year}`,
        deSlug: `halloween-${year}`,
        name: `Halloween ${year}`,
        deName: `Halloween ${year}`,
        targetDate: `${year}-10-31`,
        priority: 'medium',
        index: true,
        category: 'holiday',
      },
      {
        slug: `valentines-day-${year}`,
        deSlug: `valentinstag-${year}`,
        name: `Valentine's Day ${year}`,
        deName: `Valentinstag ${year}`,
        targetDate: `${year}-02-14`,
        priority: 'medium',
        index: year >= currentYear,
        category: 'holiday',
      },
      {
        slug: `labor-day-${year}`,
        deSlug: `tag-der-arbeit-${year}`,
        name: `Labor Day ${year}`,
        deName: `Tag der Arbeit ${year}`,
        targetDate: `${year}-05-01`,
        priority: 'medium',
        index: year >= currentYear,
        category: 'holiday',
      },
      {
        slug: `german-unity-day-${year}`,
        deSlug: `tag-der-deutschen-einheit-${year}`,
        name: `German Unity Day ${year}`,
        deName: `Tag der Deutschen Einheit ${year}`,
        targetDate: `${year}-10-03`,
        priority: 'medium',
        index: year >= currentYear,
        category: 'holiday',
      },
    );
  }
  return holidays;
}

// Summer/season events
const seasonEvents: DateEvent[] = [
  {
    slug: `summer-${currentYear}`,
    deSlug: `sommer-${currentYear}`,
    name: `Summer Solstice ${currentYear}`,
    deName: `Sommersonnenwende ${currentYear}`,
    targetDate: `${currentYear}-06-21`,
    priority: 'low',
    index: true,
    category: 'season',
  },
];

export const ALL_DATE_EVENTS: DateEvent[] = [
  ...generateYearEvents(),
  ...generateHolidayEvents(),
  ...seasonEvents,
];

export const INDEXED_EVENTS = ALL_DATE_EVENTS.filter(e => e.index);

// Get days until a date from now
export function getDaysUntil(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format a countdown result
export function formatCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  const now = new Date();
  const target = new Date(targetDate);
  let diff = target.getTime() - now.getTime();
  const isPast = diff < 0;
  diff = Math.abs(diff);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast };
}
