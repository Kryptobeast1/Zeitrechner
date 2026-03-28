// Date events data — holidays, special days, and year countdowns
// Used for /de/tage-bis-[slug] and /en/days-until-[slug]

export interface DateEvent {
  name: string;      // English name
  deName: string;    // German name
  slug: string;      // URL slug EN
  deSlug: string;    // URL slug DE
  targetDate: string; // ISO date string (YYYY-MM-DD)
  category: 'holiday' | 'year' | 'seasonal' | 'event';
  priority: 'high' | 'medium' | 'low';
}

/**
 * List of major holidays and events for 2025-2027.
 */
export const BASE_EVENTS: DateEvent[] = [
  // Global / Major
  { name: 'Christmas', deName: 'Weihnachten', slug: 'christmas', deSlug: 'weihnachten-2026', targetDate: '2026-12-25', category: 'holiday', priority: 'high' },
  { name: '2nd Day of Christmas', deName: '2. Weihnachtstag', slug: 'boxing-day', deSlug: 'zweiter-weihnachtstag', targetDate: '2026-12-26', category: 'holiday', priority: 'medium' },
  { name: 'New Year 2027', deName: 'Neujahr 2027', slug: 'new-year-2027', deSlug: 'neujahr-2027', targetDate: '2027-01-01', category: 'holiday', priority: 'high' },
  { name: 'Valentine\'s Day', deName: 'Valentinstag', slug: 'valentines-day', deSlug: 'valentinstag', targetDate: '2027-02-14', category: 'holiday', priority: 'medium' },
  { name: 'Easter Sunday 2026', deName: 'Ostersonntag 2026', slug: 'easter-2026', deSlug: 'ostersonntag-2026', targetDate: '2026-04-05', category: 'holiday', priority: 'high' },
  { name: 'Easter Sunday 2027', deName: 'Ostersonntag 2027', slug: 'easter-2027', deSlug: 'ostersonntag-2027', targetDate: '2027-04-17', category: 'holiday', priority: 'medium' },
  { name: 'Halloween', deName: 'Halloween', slug: 'halloween', deSlug: 'halloween', targetDate: '2026-10-31', category: 'holiday', priority: 'high' },
  { name: 'St. Patrick\'s Day', deName: 'St. Patrick\'s Day', slug: 'st-patricks-day', deSlug: 'st-patricks-day', targetDate: '2027-03-17', category: 'holiday', priority: 'medium' },
  
  // US Federal Holidays
  { name: 'Martin Luther King Jr. Day', deName: 'MLK Day', slug: 'mlk-day', deSlug: 'mlk-tag', targetDate: '2027-01-18', category: 'holiday', priority: 'medium' },
  { name: 'Presidents\' Day', deName: 'Presidents Day', slug: 'presidents-day', deSlug: 'presidents-day', targetDate: '2027-02-15', category: 'holiday', priority: 'medium' },
  { name: 'Memorial Day 2026', deName: 'Memorial Day 2026', slug: 'memorial-day-2026', deSlug: 'memorial-day-2026', targetDate: '2026-05-25', category: 'holiday', priority: 'high' },
  { name: 'Juneteenth 2026', deName: 'Juneteenth 2026', slug: 'juneteenth-2026', deSlug: 'juneteenth-2026', targetDate: '2026-06-19', category: 'holiday', priority: 'medium' },
  { name: 'Independence Day', deName: 'Unabhängigkeitstag (USA)', slug: 'independence-day', deSlug: 'unabhaengigkeitstag-usa', targetDate: '2026-07-04', category: 'holiday', priority: 'high' },
  { name: 'Labor Day 2026', deName: 'Tag der Arbeit (USA)', slug: 'labor-day-2026', deSlug: 'tag-der-arbeit-usa-2026', targetDate: '2026-09-07', category: 'holiday', priority: 'high' },
  { name: 'Columbus Day', deName: 'Columbus Day', slug: 'columbus-day', deSlug: 'columbus-tag', targetDate: '2026-10-12', category: 'holiday', priority: 'medium' },
  { name: 'Veterans Day', deName: 'Veterans Day', slug: 'veterans-day', deSlug: 'veterans-tag', targetDate: '2026-11-11', category: 'holiday', priority: 'medium' },
  { name: 'Thanksgiving 2026', deName: 'Thanksgiving 2026', slug: 'thanksgiving-2026', deSlug: 'thanksgiving-2026', targetDate: '2026-11-26', category: 'holiday', priority: 'high' },
  
  // DE Specific (Statutory Feiertage)
  { name: 'German Unity Day', deName: 'Tag der Deutschen Einheit', slug: 'german-unity-day', deSlug: 'tag-der-deutschen-einheit', targetDate: '2026-10-03', category: 'holiday', priority: 'high' },
  { name: 'Labour Day Germany', deName: 'Erster Mai', slug: 'may-day-germany', deSlug: 'erster-mai', targetDate: '2026-05-01', category: 'holiday', priority: 'medium' },
  { name: 'Epiphany', deName: 'Heilige Drei Könige', slug: 'epiphany', deSlug: 'heilige-drei-koenige', targetDate: '2027-01-06', category: 'holiday', priority: 'medium' },
  { name: 'International Women\'s Day', deName: 'Frauentag', slug: 'womens-day', deSlug: 'frauentag', targetDate: '2027-03-08', category: 'holiday', priority: 'medium' },
  { name: 'Good Friday 2026', deName: 'Karfreitag 2026', slug: 'good-friday-2026', deSlug: 'karfreitag-2026', targetDate: '2026-04-03', category: 'holiday', priority: 'medium' },
  { name: 'Easter Monday 2026', deName: 'Ostermontag 2026', slug: 'easter-monday-2026', deSlug: 'ostermontag-2026', targetDate: '2026-04-06', category: 'holiday', priority: 'medium' },
  { name: 'Ascension Day 2026', deName: 'Christi Himmelfahrt 2026', slug: 'ascension-day-2026', deSlug: 'christi-himmelfahrt-2026', targetDate: '2026-05-14', category: 'holiday', priority: 'medium' },
  { name: 'Whit Monday 2026', deName: 'Pfingstmontag 2026', slug: 'whit-monday-2026', deSlug: 'pfingstmontag-2026', targetDate: '2026-05-25', category: 'holiday', priority: 'medium' },
  { name: 'Corpus Christi 2026', deName: 'Fronleichnam 2026', slug: 'corpus-christi-2026', deSlug: 'fronleichnam-2026', targetDate: '2026-06-04', category: 'holiday', priority: 'low' },
  { name: 'Assumption Day', deName: 'Mariä Himmelfahrt', slug: 'assumption-day', deSlug: 'mariae-himmelfahrt', targetDate: '2026-08-15', category: 'holiday', priority: 'low' },
  { name: 'All Saints\' Day', deName: 'Allerheiligen', slug: 'all-saints-day', deSlug: 'allerheiligen', targetDate: '2026-11-01', category: 'holiday', priority: 'medium' },

  // Religious & Global Cultural
  { name: 'Ramadan 2026', deName: 'Ramadan 2026', slug: 'ramadan-2026', deSlug: 'ramadan-2026', targetDate: '2026-02-18', category: 'holiday', priority: 'high' },
  { name: 'Eid al-Fitr 2026', deName: 'Eid al-Fitr 2026', slug: 'eid-al-fitr-2026', deSlug: 'eid-al-fitr-2026', targetDate: '2026-03-20', category: 'holiday', priority: 'medium' },
  { name: 'Diwali 2026', deName: 'Diwali 2026', slug: 'diwali-2026', deSlug: 'diwali-2026', targetDate: '2026-11-08', category: 'holiday', priority: 'medium' },
  { name: 'Lunar New Year 2027', deName: 'Chinesisches Neujahr 2027', slug: 'lunar-new-year-2027', deSlug: 'chinesisches-neujahr-2027', targetDate: '2027-02-06', category: 'holiday', priority: 'medium' },
  { name: 'Hanukkah 2026', deName: 'Chanukka 2026', slug: 'hanukkah-2026', deSlug: 'chanukka-2026', targetDate: '2026-12-04', category: 'holiday', priority: 'medium' },

  // Major Global Events
  { name: 'World Cup 2026 Opening', deName: 'WM 2026 Eröffnung', slug: 'world-cup-2026-start', deSlug: 'wm-2026-start', targetDate: '2026-06-11', category: 'event', priority: 'high' },
  { name: 'World Cup 2026 Final', deName: 'WM 2026 Finale', slug: 'world-cup-2026-final', deSlug: 'wm-2026-finale', targetDate: '2026-07-19', category: 'event', priority: 'high' },
  { name: 'Super Bowl LXI', deName: 'Super Bowl 2027', slug: 'super-bowl-2027', deSlug: 'super-bowl-2027', targetDate: '2027-02-14', category: 'event', priority: 'high' },
  { name: 'Solar Eclipse 2026', deName: 'Sonnenfinsternis 2026', slug: 'solar-eclipse-2026', deSlug: 'sonnenfinsternis-2026', targetDate: '2026-08-12', category: 'event', priority: 'medium' },
  { name: 'Black Friday 2026', deName: 'Black Friday 2026', slug: 'black-friday-2026', deSlug: 'black-friday-2026', targetDate: '2026-11-27', category: 'event', priority: 'medium' },
  
  // Seasonal & Astronomical
  { name: 'First Day of Spring', deName: 'Frühlingsanfang', slug: 'first-day-of-spring', deSlug: 'fruehlingsanfang', targetDate: '2027-03-20', category: 'seasonal', priority: 'medium' },
  { name: 'Summer Solstice', deName: 'Sommersonnenwende', slug: 'summer-solstice', deSlug: 'sommersonnenwende', targetDate: '2026-06-21', category: 'seasonal', priority: 'medium' },
  { name: 'First Day of Autumn', deName: 'Herbstanfang', slug: 'first-day-of-autumn', deSlug: 'herbfang', targetDate: '2026-09-22', category: 'seasonal', priority: 'medium' },
  { name: 'Winter Solstice', deName: 'Wintersonnenwende', slug: 'winter-solstice', deSlug: 'wintersonnenwende', targetDate: '2026-12-21', category: 'seasonal', priority: 'medium' },
  { name: 'Earth Day', deName: 'Tag der Erde', slug: 'earth-day', deSlug: 'tag-der-erde', targetDate: '2027-04-22', category: 'holiday', priority: 'medium' },
];

/**
 * Generate year countdowns (2026–2035)
 */
export function generateYearEvents(): DateEvent[] {
  const years: DateEvent[] = [];
  for (let y = 2026; y <= 2035; y++) {
    years.push({
      name: `Year ${y}`,
      deName: `Jahr ${y}`,
      slug: `year-${y}`,
      deSlug: `jahr-${y}`,
      targetDate: `${y}-01-01`,
      category: 'year',
      priority: y <= 2028 ? 'high' : 'low',
    });
  }
  return years;
}

export const ALL_EVENTS: DateEvent[] = [
  ...BASE_EVENTS,
  ...generateYearEvents(),
];

export const INDEXED_EVENTS = ALL_EVENTS.filter(e => e.priority !== 'low' || parseInt(e.targetDate.split('-')[0]) <= 2028);

/**
 * Helper: Find the next occurrence of a potentially passed date.
 * If target is Jan 1st 2026 and today is March 2026, it returns Jan 1st 2027.
 */
export function getNextOccurrence(target: string): { date: string; yearShift: number } {
  const now = new Date();
  const originalDate = new Date(target);
  let targetDate = new Date(target);
  let yearShift = 0;

  if (targetDate.getTime() < now.getTime()) {
    // Attempt current year first
    targetDate.setFullYear(now.getFullYear());
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setFullYear(now.getFullYear() + 1);
    }
    yearShift = targetDate.getFullYear() - originalDate.getFullYear();
  }
  
  // Return YYYY-MM-DD
  const y = targetDate.getFullYear();
  const m = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const d = targetDate.getDate().toString().padStart(2, '0');
  return { date: `${y}-${m}-${d}`, yearShift };
}

/**
 * Helper: Days until a date.
 * Always ensures a future-facing countdown for recurring events.
 */
export function getDaysUntil(target: string): number {
  const now = new Date();
  const { date } = getNextOccurrence(target);
  const targetDate = new Date(date);
  
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Format a countdown result
 */
export function formatCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  const now = new Date();
  let target = new Date(targetDate);
  
  const diff = target.getTime() - now.getTime();
  const isPast = diff < 0;
  
  // For formatting, we use absolute difference.
  const absDiff = Math.abs(diff);

  return {
    days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((absDiff % (1000 * 60)) / 1000),
    isPast,
  };
}

