// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 07 — FEATURES & DIFFERENTIATION  (Phase 7 gate, re-runnable / CI)
//
//   1. copy buttons present and screen-reader announced (aria-live region)
//   2. embed renders standalone, is noindex, excluded from every sitemap, and
//      framable (per-path headers in vercel.json)
//   3. print stylesheet + signable Stundenzettel + print button present
//   4. zero unsubstantiated trust-badge claims in the build output
//   5. the German-law tools are built
//
// Run:  node --experimental-strip-types scripts/audit/07-features.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = resolve(ROOT, 'dist');
const failures: string[] = [];
const fail = (m: string) => failures.push(m);
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

// ── 4. trust badge purge (scan all HTML) ─────────────────────────────────────
const BANNED = ['Von HR- & Payroll-Experten verifiziert', 'Verified by HR & Payroll Specialists', 'Expert Insight'];
let htmlScanned = 0, badgeHits = 0;
function scan(dir: string) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) scan(full);
    else if (e.name.endsWith('.html')) {
      htmlScanned++;
      const html = readFileSync(full, 'utf8');
      for (const b of BANNED) if (html.includes(b)) { badgeHits++; if (failures.length < 20) fail(`trust badge "${b}" in ${full.replace(DIST, 'dist')}`); }
    }
  }
}
scan(DIST);

// ── 1. copy buttons + SR announcement ────────────────────────────────────────
const shift = read(resolve(DIST, 'stunden-zwischen-9-und-17', 'index.html'));
if (!shift) fail('sample shift page missing');
else {
  if (!/class="copy-btn"/.test(shift)) fail('no copy buttons on shift page');
  if (!/id="zr-live"[^>]*aria-live/.test(shift)) fail('no aria-live region for copy announcements');
  if (!/class="print-btn"[^>]*data-print|data-print/.test(shift)) fail('no print button on shift page');
  if (!/class="print-sheet"/.test(shift)) fail('no printable Stundenzettel on shift page');
  if (!/class="embed-panel"/.test(shift)) fail('no embed/share panel on shift page');
}

// ── 3. print stylesheet in bundled CSS ───────────────────────────────────────
let hasPrintCss = false;
for (const e of readdirSync(resolve(DIST, '_astro'))) {
  if (e.endsWith('.css') && /@media\s+print/.test(readFileSync(resolve(DIST, '_astro', e), 'utf8'))) hasPrintCss = true;
}
if (!hasPrintCss) fail('no @media print stylesheet in bundled CSS');

// ── 2. embed: built, noindex, framable, excluded from sitemaps ───────────────
const embed = read(resolve(DIST, 'embed', 'arbeitszeit', 'index.html'));
if (!embed) fail('embed page not built');
else {
  if (!/noindex/.test(embed)) fail('embed page is not noindex');
  if (!/zeit-rechner\.com/.test(embed)) fail('embed page has no attribution link');
}
for (const e of readdirSync(DIST)) {
  if (e.startsWith('sitemap') && e.endsWith('.xml')) {
    if (readFileSync(resolve(DIST, e), 'utf8').includes('/embed/')) fail(`${e} lists an /embed/ URL (must be excluded)`);
  }
}
const vercel = read(resolve(ROOT, 'vercel.json'));
if (!vercel || !/\/embed\/\(\.\*\)/.test(vercel) || !/frame-ancestors \*/.test(vercel)) fail('vercel.json does not grant framing to /embed/*');

// ── 5. German-law tools built ────────────────────────────────────────────────
const tools = ['pausenrechner', 'ruhezeit-checker', 'nachtzuschlag-rechner', 'gleitzeitkonto', 'tarifmodelle'];
let toolsBuilt = 0;
for (const t of tools) { if (existsSync(resolve(DIST, t, 'index.html'))) toolsBuilt++; else fail(`tool not built: /${t}/`); }

console.log(`\n[audit 07-features]`);
console.log(`  html scanned           : ${htmlScanned}`);
console.log(`  trust-badge hits       : ${badgeHits}`);
console.log(`  German-law tools built : ${toolsBuilt}/5`);
console.log(`  failures               : ${failures.length}`);
if (failures.length > 0) {
  for (const f of failures.slice(0, 25)) console.log(`    - ${f}`);
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — copy+SR, embed (noindex, framable, off-sitemap), print, no trust badge, tools live.\n`);
  process.exit(0);
}
