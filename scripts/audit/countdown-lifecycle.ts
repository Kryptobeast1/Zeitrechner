// ─────────────────────────────────────────────────────────────────────────────
// AUDIT: countdown event lifecycle.
//
// Finds countdown pages that are broken because the build/redirect lifecycle
// keys off the calendar YEAR (year >= currentYear) instead of the actual DATE.
// A 2026 event whose date has already passed is still built + indexed, then
// getNextOccurrence() rolls it forward by bumping the year — which is:
//   • WRONG for movable feasts (Easter 2027 = Apr 17, not Apr 5)
//   • NONSENSE for one-time events (World Cup 2026, Solar Eclipse 2026)
//   • a DUPLICATE of the evergreen / next-year page when it lands on the same date
//
// Run: node --experimental-strip-types scripts/audit/countdown-lifecycle.ts
// ─────────────────────────────────────────────────────────────────────────────
import { ALL_EVENTS, resolveActiveDate, isRetired, daysUntilISO } from '../../src/data/dateEvents.ts';

const TODAY = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);

type Row = { deSlug: string; name: string; built: boolean; active: string; days: number };

const rows: Row[] = ALL_EVENTS.map(e => ({
  deSlug: e.deSlug, name: e.deName,
  built: !isRetired(e, TODAY),
  active: resolveActiveDate(e, TODAY),
  days: daysUntilISO(resolveActiveDate(e, TODAY), TODAY),
}));

const built = rows.filter(r => r.built);
// A built page is broken only if its active date is in the past (must be 0 now).
const broken = built.filter(r => new Date(r.active + 'T00:00:00Z').getTime() < Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), TODAY.getUTCDate()));
// Duplicate clusters: >1 built page resolving to the same active date.
const byActive = new Map<string, Row[]>();
for (const r of built) (byActive.get(r.active) ?? byActive.set(r.active, []).get(r.active)!).push(r);
const dupeClusters = [...byActive.entries()].filter(([, g]) => g.length > 1);

console.log(`\n=== COUNTDOWN LIFECYCLE AUDIT (today ${iso(TODAY)}) ===\n`);
console.log(`Total events: ${rows.length}  ·  live/built: ${built.length}  ·  retired: ${rows.length - built.length}\n`);

console.log(`── BROKEN: built pages with a past active date (${broken.length}) ──`);
broken.forEach(r => console.log(`  /tage-bis-${r.deSlug}/ → ${r.active}`));
if (broken.length === 0) console.log('  none ✓');

console.log(`\n── DUPLICATE CLUSTERS — multiple built pages, same active date (${dupeClusters.length}) ──`);
if (dupeClusters.length === 0) console.log('  none ✓');
for (const [date, g] of dupeClusters.sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${date}:`);
  g.forEach(r => console.log(`     /tage-bis-${r.deSlug}/  (${r.name})`));
}

console.log(`\n── Sample of live pages (correct computed dates) ──`);
for (const r of built.filter(r => /oster|karfreitag|himmelfahrt|pfingst|thanksgiving|memorial|neujahr|weihnachten/.test(r.deSlug)).slice(0, 12)) {
  console.log(`  /tage-bis-${r.deSlug}/ → ${r.active}  (${r.days} days)`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`  broken (past active date) : ${broken.length}`);
console.log(`  duplicate clusters        : ${dupeClusters.length}  (${dupeClusters.reduce((n, [, g]) => n + g.length, 0)} pages)`);
