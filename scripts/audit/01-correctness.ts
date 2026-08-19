// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 01 — CORRECTNESS  (Phase 1 gate, re-runnable / CI)
//
// Runs against the built `dist/` output. For every generated shift page it
// asserts that every displayed result figure comes from the single source of
// truth (computeShift) and that no two figures on a page contradict each other.
//
//   1. grossMin === (end - start + 1440) % 1440   (or 1440 for a full day)
//   2. netMin   === max(0, grossMin - breakMin)
//   3. every data-result figure in the HTML matches its ShiftResult field
//   4. no two result figures on a page contradict (HH:MM vs decimal agree)
//   5. no duration is rendered with a clock formatter in a duration slot
//   6. no EN page contains blocklisted German vocabulary
//
// Usage:  node --experimental-strip-types scripts/audit/01-correctness.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../../src/data/timeRanges.ts';
import { computeShiftFromHours, formatDurationHHMM } from '../../src/lib/shift.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'dist');

type Failure = { page: string; assertion: number; message: string };
const failures: Failure[] = [];
let pagesChecked = 0;
let pagesSkipped = 0;

const BREAKS = [0, 30, 45, 60];
// Documented blocklist: German words that must never appear in EN visible text.
const GERMAN_BLOCKLIST = ['Netto', 'Stunden', 'Uhr', 'zwischen', 'Arbeitszeit', 'Nettoarbeitszeit'];

function readPage(relPath: string): string | null {
  const full = resolve(DIST, relPath, 'index.html');
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf8');
}

// Extract all <... data-result="key">VALUE</...> pairs.
function extractResults(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /data-result="([^"]+)"[^>]*>([^<]*)</g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

// Visible text only: drop <script>/<style> and all tags (so attribute URLs,
// which legitimately carry German slugs, are excluded from the vocab check).
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function fail(page: string, assertion: number, message: string) {
  failures.push({ page, assertion, message });
}

// Decimal string ("7,50" | "7.50") -> number
function parseDecimal(s: string): number {
  return parseFloat(s.replace(',', '.'));
}
// "HH:MM" duration -> total minutes
function hhmmToMin(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

function checkExpectedMath(page: string, startH: number, endH: number) {
  const startMin = Math.round(startH * 60);
  const endMin = Math.round(endH * 60);
  const expectedGross = startMin === endMin ? 1440 : ((endMin - startMin + 1440) % 1440 || 1440);
  const r0 = computeShiftFromHours(startH, endH, 0, 'de');
  // Assertion 1
  if (r0.grossMin !== expectedGross) {
    fail(page, 1, `grossMin ${r0.grossMin} !== expected ${expectedGross}`);
  }
  // Assertion 2
  for (const b of BREAKS) {
    const r = computeShiftFromHours(startH, endH, b, 'de');
    const expectedNet = Math.max(0, expectedGross - b);
    if (r.netMin !== expectedNet) {
      fail(page, 2, `netMin(break=${b}) ${r.netMin} !== expected ${expectedNet}`);
    }
  }
}

function checkTimeRangePage(page: string, startH: number, endH: number, locale: 'de' | 'en') {
  const html = readPage(page);
  if (!html) return false;
  if (html.includes('Redirecting to')) { pagesSkipped++; return false; }
  pagesChecked++;

  const g = computeShiftFromHours(startH, endH, 0, locale);
  const results = extractResults(html);

  // Assertion 3 — each tagged figure matches the ShiftResult
  const expect: Record<string, string> = {
    'gross-hours': g.grossDecimalStr,
    'gross-hours-hhmm': g.grossHHMM,
    'gross-minutes': String(g.grossMin),
    'gross-seconds': String(g.grossMin * 60),
    'gross-decimal': g.grossDecimalStr,
  };
  for (const [key, want] of Object.entries(expect)) {
    if (results.has(key) && results.get(key) !== want) {
      fail(page, 3, `[${key}] rendered "${results.get(key)}" !== expected "${want}"`);
    }
  }
  // Assertion 4 — HH:MM and decimal agree
  if (results.has('gross-hours-hhmm') && results.has('gross-decimal')) {
    const fromHHMM = hhmmToMin(results.get('gross-hours-hhmm')!);
    const fromDec = Math.round(parseDecimal(results.get('gross-decimal')!) * 60);
    if (fromHHMM !== fromDec) {
      fail(page, 4, `HH:MM (${fromHHMM}m) contradicts decimal (${fromDec}m)`);
    }
  }
  // Assertion 5 — duration slot equals the duration formatter's output
  if (results.has('gross-hours-hhmm') && results.get('gross-hours-hhmm') !== formatDurationHHMM(g.grossMin)) {
    fail(page, 5, `duration slot "${results.get('gross-hours-hhmm')}" not from formatDurationHHMM`);
  }

  // Merged net-after-break figures (Phase 3.3): validate every break on the same page
  for (const b of BREAKS) {
    const r = computeShiftFromHours(startH, endH, b, locale);
    if (results.has(`net-hhmm-${b}`) && results.get(`net-hhmm-${b}`) !== r.netHHMM) {
      fail(page, 3, `[net-hhmm-${b}] "${results.get(`net-hhmm-${b}`)}" !== "${r.netHHMM}"`);
    }
    if (results.has(`net-decimal-${b}`) && results.get(`net-decimal-${b}`) !== r.netDecimalStr) {
      fail(page, 3, `[net-decimal-${b}] "${results.get(`net-decimal-${b}`)}" !== "${r.netDecimalStr}"`);
    }
    if (results.has(`net-hhmm-${b}`) && results.has(`net-decimal-${b}`)) {
      const fromHHMM = hhmmToMin(results.get(`net-hhmm-${b}`)!);
      const fromDec = Math.round(parseDecimal(results.get(`net-decimal-${b}`)!) * 60);
      if (fromHHMM !== fromDec) fail(page, 4, `net break=${b}: HH:MM (${fromHHMM}m) contradicts decimal (${fromDec}m)`);
    }
    if (results.has(`net-hhmm-${b}`) && results.get(`net-hhmm-${b}`) !== formatDurationHHMM(r.netMin)) {
      fail(page, 5, `net-hhmm-${b} "${results.get(`net-hhmm-${b}`)}" not from formatDurationHHMM`);
    }
  }

  if (locale === 'en') checkBlocklist(page, html);
  return true;
}

function checkBlocklist(page: string, html: string) {
  const text = visibleText(html);
  for (const word of GERMAN_BLOCKLIST) {
    const re = new RegExp(`\\b${word}\\b`);
    if (re.test(text)) {
      fail(page, 6, `EN page contains blocklisted German word "${word}"`);
    }
  }
}

// ─── Run over every range on both (merged) page families ─────────────────────
// Post Phase 3.3 each time-pair is a single page carrying both gross and net figures.
for (const r of ALL_TIME_RANGES) {
  checkExpectedMath(`data:${r.deSlug}`, r.start, r.end);
  checkTimeRangePage(`stunden-zwischen-${r.deSlug}`, r.start, r.end, 'de');
  checkTimeRangePage(`en/hours-between-${r.slug}`, r.start, r.end, 'en');
}

// ─── Report ──────────────────────────────────────────────────────────────────
console.log(`\n[audit 01-correctness]`);
console.log(`  pages checked : ${pagesChecked}`);
console.log(`  stubs skipped : ${pagesSkipped}`);
console.log(`  failures      : ${failures.length}`);

if (failures.length > 0) {
  const byAssertion = new Map<number, number>();
  for (const f of failures) byAssertion.set(f.assertion, (byAssertion.get(f.assertion) ?? 0) + 1);
  console.log(`\n  failures by assertion:`);
  for (const [a, n] of [...byAssertion.entries()].sort()) console.log(`    #${a}: ${n}`);
  console.log(`\n  first 25 failures:`);
  for (const f of failures.slice(0, 25)) {
    console.log(`    [#${f.assertion}] ${f.page} — ${f.message}`);
  }
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — all figures trace to computeShift, no contradictions.\n`);
  process.exit(0);
}
