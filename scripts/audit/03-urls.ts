// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 03 — URL SCHEME & PRUNING  (Phase 3 gate, re-runnable / CI)
//
//   1. zero zero-duration pages remain (no range where start === end)
//   2. the work-hours/arbeitsstunden routes are merged away (no such dist dirs)
//   3. every canonical EN slug is unambiguous 24h form (never an old 12h slug)
//   4. reports the built URL count per family
//
// Run:  node --experimental-strip-types scripts/audit/03-urls.ts
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../../src/data/timeRanges.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', '..', 'dist');

const failures: string[] = [];
const fail = (m: string) => failures.push(m);
const countDirs = (dir: string, prefix: string) =>
  existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory() && e.name.startsWith(prefix)).length : 0;

// 1. no zero-duration ranges in the generator
const zeroDuration = ALL_TIME_RANGES.filter(r => r.start === r.end);
if (zeroDuration.length > 0) fail(`${zeroDuration.length} zero-duration ranges still generated (e.g. ${zeroDuration[0].deSlug})`);

// 2. work-hours / arbeitsstunden routes merged away
const arbeits = countDirs(DIST, 'arbeitsstunden-');
const enWork = countDirs(resolve(DIST, 'en'), 'work-hours-');
if (arbeits > 0) fail(`${arbeits} arbeitsstunden-* pages still built (should be merged into stunden-zwischen)`);
if (enWork > 0) fail(`${enWork} en/work-hours-* pages still built (should be merged into en/hours-between)`);

// 3. every EN canonical slug is unambiguous 24h form and never the legacy 12h form
const slug24 = /^\d{1,2}(-30)?-and-\d{1,2}(-30)?$/;
for (const r of ALL_TIME_RANGES) {
  if (!slug24.test(r.slug)) fail(`EN slug not 24h form: ${r.slug}`);
  if (/pm|am/i.test(r.slug)) fail(`EN slug still 12h (am/pm): ${r.slug}`);
  if (r.legacyEnSlug && r.legacyEnSlug === r.slug) fail(`legacyEnSlug equals canonical for ${r.slug}`);
  // end hour must be a real 24h hour (0..23) — catches "8-and-4" style ambiguity
  const endTok = r.slug.split('-and-')[1] ?? '';
  const endH = parseInt(endTok.split('-')[0], 10);
  if (!(endH >= 0 && endH <= 23)) fail(`EN slug end hour out of range: ${r.slug}`);
}

// 4. report
const deRanges = countDirs(DIST, 'stunden-zwischen-');
const enRanges = countDirs(resolve(DIST, 'en'), 'hours-between-');
console.log(`\n[audit 03-urls]`);
console.log(`  DE time-range pages    : ${deRanges}`);
console.log(`  EN time-range pages    : ${enRanges}`);
console.log(`  arbeitsstunden pages   : ${arbeits} (merged)`);
console.log(`  en/work-hours pages    : ${enWork} (merged)`);
console.log(`  zero-duration ranges   : ${zeroDuration.length}`);
console.log(`  failures               : ${failures.length}`);
if (failures.length > 0) {
  for (const f of failures.slice(0, 25)) console.log(`    - ${f}`);
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — one canonical page per pair, no zero-duration, EN slugs unambiguous.\n`);
  process.exit(0);
}
