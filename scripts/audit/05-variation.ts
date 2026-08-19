// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 05 — VARIATION SYSTEM  (Phase 5 gate, re-runnable / CI)
//
// Samples 100 consecutive pages in sitemap order and asserts:
//   (a) ≥ 12 distinct archetype+band+treatment combinations appear
//   (b) no run of > 8 consecutive pages shares an identical combination
//   (c) no page renders a conditional module whose condition is false
// Plus: every band accent passes WCAG AA (≥ 4.5:1) against --surface (#FFFFFF).
//
// Run:  node --experimental-strip-types scripts/audit/05-variation.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../../src/data/timeRanges.ts';
import { BAND_ACCENTS } from '../../src/lib/archetype.ts';
import { moduleConditionHolds } from '../../src/lib/shiftModules.ts';
import type { ModuleId } from '../../src/lib/shiftModules.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = resolve(ROOT, 'dist');
const failures: string[] = [];
const fail = (m: string) => failures.push(m);

const byDeSlug = new Map(ALL_TIME_RANGES.map(r => [r.deSlug, r]));

// Sitemap order → DE time-range slugs
const sitemap = readFileSync(resolve(DIST, 'sitemap.xml'), 'utf8');
const slugs: string[] = [];
for (const m of sitemap.matchAll(/<loc>https:\/\/zeit-rechner\.com\/stunden-zwischen-(.+?)\/<\/loc>/g)) slugs.push(m[1]);

const sample = slugs.slice(0, 100);
if (sample.length < 100) fail(`only ${sample.length} DE time-range URLs in sitemap (need ≥100)`);

const attr = (html: string, name: string) => (html.match(new RegExp(`<html[^>]*\\b${name}="([^"]*)"`)) || [])[1] ?? '';

const combos: string[] = [];
let modulesChecked = 0;

for (const slug of sample) {
  const file = resolve(DIST, `stunden-zwischen-${slug}`, 'index.html');
  if (!existsSync(file)) { fail(`missing built page: stunden-zwischen-${slug}`); continue; }
  const html = readFileSync(file, 'utf8');
  const archetype = attr(html, 'data-archetype');
  const band = attr(html, 'data-band');
  const treatment = attr(html, 'data-treatment');
  if (!archetype || !band || !treatment) fail(`missing variation attrs on ${slug} (a=${archetype} b=${band} t=${treatment})`);
  combos.push(`${archetype}|${band}|${treatment}`);

  // (c) every rendered module's condition must hold
  const range = byDeSlug.get(slug);
  if (range) {
    for (const mm of html.matchAll(/data-module="([^"]+)"/g)) {
      const id = mm[1] as ModuleId;
      modulesChecked++;
      if (!moduleConditionHolds(id, range.start, range.end)) {
        fail(`module "${id}" rendered on ${slug} but its condition is FALSE`);
      }
    }
  }
}

// (a) distinct combos
const distinct = new Set(combos);
if (distinct.size < 12) fail(`only ${distinct.size} distinct combinations in 100 pages (need ≥12)`);

// (b) longest identical run
let longest = 0, run = 0, prev = '';
for (const c of combos) { run = c === prev ? run + 1 : 1; prev = c; if (run > longest) longest = run; }
if (longest > 8) fail(`a combination repeats ${longest}× consecutively (max 8)`);

// WCAG AA for band accents vs white
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
for (const [band, hex] of Object.entries(BAND_ACCENTS)) {
  const ratio = (1.0 + 0.05) / (luminance(hex) + 0.05);
  if (ratio < 4.5) fail(`band "${band}" accent ${hex} fails WCAG AA vs white (${ratio.toFixed(2)}:1)`);
}

console.log(`\n[audit 05-variation]`);
console.log(`  pages sampled          : ${sample.length}`);
console.log(`  distinct combinations  : ${distinct.size}`);
console.log(`  longest identical run  : ${longest}`);
console.log(`  conditional modules    : ${modulesChecked} rendered (all condition-checked)`);
console.log(`  failures               : ${failures.length}`);
if (failures.length > 0) {
  for (const f of failures.slice(0, 25)) console.log(`    - ${f}`);
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — ${distinct.size} combos, no run >8, every module condition holds, bands AA.\n`);
  process.exit(0);
}
