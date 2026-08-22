// Verification for the holiday engine. Run: node --experimental-strip-types scripts/verify-holidays.ts
import { computeEaster, getHolidays, holidayCount, workingDaysBetween } from '../src/lib/holidays.ts';

const iso = (d: Date) => d.toISOString().slice(0, 10);
let fails = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = String(got) === String(want);
  if (!ok) fails++;
  console.log(`${ok ? '✓' : '✗'} ${label}: got ${got}${ok ? '' : ` — expected ${want}`}`);
};

// Easter dates (known)
check('Easter 2026', iso(computeEaster(2026)), '2026-04-05');
check('Easter 2027', iso(computeEaster(2027)), '2027-03-28');
check('Easter 2025', iso(computeEaster(2025)), '2025-04-20');

// Movable feasts 2026 (relative to Easter 2026-04-05)
const h2026 = getHolidays(2026);
const find = (id: string) => h2026.find(h => h.id === id)?.dateISO;
check('Karfreitag 2026', find('karfreitag'), '2026-04-03');
check('Ostermontag 2026', find('ostermontag'), '2026-04-06');
check('Christi Himmelfahrt 2026', find('christi-himmelfahrt'), '2026-05-14');
check('Pfingstmontag 2026', find('pfingstmontag'), '2026-05-25');
check('Fronleichnam 2026', find('fronleichnam'), '2026-06-04');
check('Buß- und Bettag 2026', find('buss-bettag'), '2026-11-18');

// Fixed feasts
check('Tag der Deutschen Einheit 2026', find('tag-deutsche-einheit'), '2026-10-03');

// State counts (statewide)
check('Nationwide count 2026', getHolidays(2026).filter(h => h.nationwide).length, 9);
check('Bayern count 2026', holidayCount(2026, 'BY'), 12);
check('Berlin count 2026', holidayCount(2026, 'BE'), 10);
check('Sachsen count 2026', holidayCount(2026, 'SN'), 11);
check('NRW count 2026', holidayCount(2026, 'NW'), 11);

// Working days: a known small range. Mon 2026-08-24 to Fri 2026-08-28 = 5 working days, no holiday.
const w1 = workingDaysBetween('2026-08-24', '2026-08-28', 'BE');
check('Working days Aug 24–28 2026 (BE)', w1.workingDays, 5);
// Range containing German Unity Day (Sat 2026-10-03) — falls on a weekend, so no weekday lost.
const w2 = workingDaysBetween('2026-10-01', '2026-10-07', 'BE');
check('Oct 1–7 2026 holidayDays (Unity Day is Sat)', w2.holidayDays, 0);
// Range containing Christmas 2026 (Fri Dec 25) — a weekday holiday.
const w3 = workingDaysBetween('2026-12-21', '2026-12-27', 'BE');
check('Dec 21–27 2026 holidayDays (25+26)', w3.holidayDays, 1); // Dec 25 Fri weekday; Dec 26 Sat weekend

console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILURES'}`);
process.exit(fails === 0 ? 0 : 1);
