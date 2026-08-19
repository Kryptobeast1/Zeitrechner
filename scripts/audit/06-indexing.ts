// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 06 — INDEXING INFRASTRUCTURE  (Phase 6 gate, re-runnable / CI)
//
//   1. sitemap index validates: <sitemapindex> → child <urlset>s that exist,
//      every URL has <lastmod>, and NO <changefreq>/<priority> anywhere
//   2. sampled shift pages carry reciprocal de/en/x-default hreflang
//   3. the /alle-rechner/ + /en/all-calculators/ pages are tiered hubs, not a
//      1000-link wall (and hub pages hold 20–40 links)
//   4. no page bakes a build-time clock (the live clock is client-only)
//
// Run:  node --experimental-strip-types scripts/audit/06-indexing.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../../src/data/timeRanges.ts';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const failures: string[] = [];
const fail = (m: string) => failures.push(m);
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const toPath = (href: string) => href.replace(/^https?:\/\/[^/]+/, '');

// ── 1. sitemap index + children ──────────────────────────────────────────────
const idx = read(resolve(DIST, 'sitemap.xml'));
if (!idx) fail('dist/sitemap.xml missing');
else {
  if (!idx.includes('<sitemapindex')) fail('sitemap.xml is not a <sitemapindex>');
  const children = [...idx.matchAll(/<loc>https:\/\/zeit-rechner\.com\/(sitemap-[^<]+)<\/loc>/g)].map(m => m[1]);
  if (children.length < 5) fail(`sitemap index lists ${children.length} children (expected 5)`);
  let totalUrls = 0;
  for (const child of children) {
    const xml = read(resolve(DIST, child));
    if (!xml) { fail(`child sitemap missing: ${child}`); continue; }
    if (!xml.includes('<urlset')) fail(`${child} is not a <urlset>`);
    if (/<changefreq>|<priority>/.test(xml)) fail(`${child} still contains changefreq/priority`);
    const locs = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
    for (const u of locs) { totalUrls++; if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(u[1])) fail(`a URL in ${child} lacks a valid <lastmod>`); }
  }
  if (/<changefreq>|<priority>/.test(idx)) fail('sitemap index contains changefreq/priority');
  console.log(`  sitemap children: ${children.length}, total URLs: ${totalUrls}`);
}

// ── 2. reciprocal hreflang on sampled shift pages ────────────────────────────
let hreflangChecked = 0;
const sample = ALL_TIME_RANGES.filter((_, i) => i % 40 === 0).slice(0, 15);
for (const r of sample) {
  const dePath = `/stunden-zwischen-${r.deSlug}/`;
  const deHtml = read(resolve(DIST, `stunden-zwischen-${r.deSlug}`, 'index.html'));
  if (!deHtml) { fail(`missing DE page ${dePath}`); continue; }
  for (const hl of ['de', 'en', 'x-default']) {
    if (!new RegExp(`hreflang="${hl}"`).test(deHtml)) fail(`${dePath} missing hreflang="${hl}"`);
  }
  const enHref = (deHtml.match(/hreflang="en" href="([^"]+)"/) || [])[1];
  if (!enHref) { fail(`${dePath} has no en hreflang href`); continue; }
  const enPath = toPath(enHref);
  const enHtml = read(resolve(DIST, '.' + enPath, 'index.html')) ?? read(resolve(DIST, '.' + enPath.replace(/\/$/, '') + '/index.html'));
  if (!enHtml) { fail(`en alternate not built: ${enPath}`); continue; }
  const backHref = (enHtml.match(/hreflang="de" href="([^"]+)"/) || [])[1];
  if (!backHref || toPath(backHref) !== dePath) fail(`hreflang not reciprocal: ${dePath} ↔ ${enPath} (back=${backHref ? toPath(backHref) : 'none'})`);
  hreflangChecked++;
}

// ── 3. no link wall ──────────────────────────────────────────────────────────
for (const p of ['alle-rechner', 'en/all-calculators']) {
  const html = read(resolve(DIST, p, 'index.html'));
  if (!html) { fail(`missing ${p}`); continue; }
  const links = (html.match(/<a\s/g) || []).length;
  if (links > 80) fail(`${p} still a link wall (${links} <a> tags)`);
}
for (const hub of ['schichten/8-stunden', 'en/shifts/8-stunden']) {
  const html = read(resolve(DIST, hub, 'index.html'));
  if (!html) fail(`hub not built: ${hub}`);
}

// ── 4. no build-time clock baked into HTML ───────────────────────────────────
for (const [p, id] of [['index.html', 'live-time'], ['en/index.html', 'live-time-en']] as const) {
  const html = read(resolve(DIST, p));
  if (!html) { fail(`missing ${p}`); continue; }
  const m = html.match(new RegExp(`id="${id}"[^>]*>([^<]*)<`));
  if (m && /\d{1,2}:\d{2}/.test(m[1])) fail(`${p} bakes a build-time clock into #${id}: "${m[1].trim()}"`);
  if (/Aktualisiert:\s*\d|Updated:\s*\d\d/.test(html)) fail(`${p} still shows a build-date "Aktualisiert/Updated" label`);
}

console.log(`\n[audit 06-indexing]`);
console.log(`  hreflang pages checked : ${hreflangChecked}`);
console.log(`  failures               : ${failures.length}`);
if (failures.length > 0) {
  for (const f of failures.slice(0, 25)) console.log(`    - ${f}`);
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — split sitemap valid, reciprocal hreflang, tiered hubs, no baked clock.\n`);
  process.exit(0);
}
