// Sanity-check the Brückentage engine. Run:
//   node --experimental-strip-types scripts/verify-brueckentage.ts
import { computeBrueckentage } from '../src/lib/brueckentage.ts';
import { getHolidays } from '../src/lib/holidays.ts';

const wd = (iso: string) => ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date(iso + 'T00:00:00Z').getUTCDay()];

for (const [year, state] of [[2027, 'NW'], [2027, 'BY'], [2026, 'BE']] as const) {
  const r = computeBrueckentage(year, state);
  console.log(`\n=== ${state} ${year} — ${getHolidays(year, state).length} Feiertage · headline: ${r.bestUrlaub} Urlaubstage → ${r.bestFree} freie Tage · ${r.bridges.length} Brücken ===`);
  for (const b of r.bridges.slice(0, 8)) {
    console.log(`  ${b.efficiency.toFixed(1)}x  ${b.label} — nimm ${b.urlaubCount} UT (${b.urlaubDates.map(d => `${d} ${wd(d)}`).join(', ')}) → ${b.freeDays} frei (${b.freeStartISO} ${wd(b.freeStartISO)} → ${b.freeEndISO} ${wd(b.freeEndISO)})`);
  }
}
