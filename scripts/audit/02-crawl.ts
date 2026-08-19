// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 02 — CRAWL & REDIRECTS  (Phase 2 gate, re-runnable / CI)
//
// vercel.json redirects are a platform feature (not served by astro dev/preview),
// so this audit validates statically against the built dist/ + the redirect table:
//
//   1. every internal <a href> on the DE home, EN home and 20 sampled money pages
//      resolves to a built file (a single 200) — zero 3xx, zero 4xx, no hops
//   2. no built HTML contains the string "Redirecting to" (interstitials gone)
//   3. legacy -and-/-und- slugs resolve to a 301 whose Location is the canonical
//      page, and that canonical exists in dist (verified against vercel.json)
//
// Run:  node --experimental-strip-types scripts/audit/02-crawl.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../../src/data/timeRanges.ts';
import { ALL_EVENTS } from '../../src/data/dateEvents.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'dist');

type VercelRedirect = { source: string; destination: string; permanent: boolean; has?: unknown[] };
const vercel = JSON.parse(readFileSync(resolve(ROOT, 'vercel.json'), 'utf8')) as { redirects: VercelRedirect[] };

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

// ─── dist resolution ──────────────────────────────────────────────────────────
function distFileFor(urlPath: string): string | null {
  const clean = urlPath.split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return null;
  if (/\.[a-z0-9]+$/i.test(clean)) return resolve(DIST, '.' + clean); // has extension
  const withSlash = clean.endsWith('/') ? clean : clean + '/';
  return resolve(DIST, '.' + withSlash + 'index.html');
}
const exists200 = (urlPath: string): boolean => {
  const f = distFileFor(urlPath);
  return !!f && existsSync(f);
};

// ─── vercel.json redirect matcher (path-to-regexp-lite, first match wins) ──────
function compile(source: string): { regex: RegExp; names: string[] } {
  const names: string[] = [];
  const tokens = source.split(/(:[A-Za-z_]+\*?)/g);
  let re = '^';
  for (const t of tokens) {
    const m = t.match(/^:([A-Za-z_]+)(\*?)$/);
    if (m) { names.push(m[1]); re += m[2] === '*' ? '(.*)' : '([^/]+)'; }
    else re += t; // literal / raw regex passthrough
  }
  return { regex: new RegExp(re + '$'), names };
}
function redirectFor(url: string): { destination: string; permanent: boolean } | null {
  for (const r of vercel.redirects) {
    if (r.has) continue; // host-conditional (www) — not exercised here
    const { regex, names } = compile(r.source);
    const m = url.match(regex);
    if (!m) continue;
    let dest = r.destination;
    names.forEach((n, i) => { dest = dest.replace(new RegExp(':' + n + '\\*?', 'g'), m[i + 1] ?? ''); });
    return { destination: dest, permanent: r.permanent };
  }
  return null;
}

// ─── 1 + 2: crawl sampled pages ────────────────────────────────────────────────
function sampleMoneyPages(): string[] {
  const pick = <T>(arr: T[], n: number) => {
    const step = Math.max(1, Math.floor(arr.length / n));
    const out: T[] = [];
    for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i]);
    return out;
  };
  const pages: string[] = ['/', '/en/'];
  for (const r of pick(ALL_TIME_RANGES, 14)) pages.push(`/stunden-zwischen-${r.deSlug}/`);
  for (const r of pick(ALL_TIME_RANGES, 6)) pages.push(`/en/hours-between-${r.slug}/`);
  return pages;
}

let linksChecked = 0;
const anchorRe = /<a\s[^>]*href="([^"]+)"/gi;
for (const page of sampleMoneyPages()) {
  const f = distFileFor(page);
  if (!f || !existsSync(f)) { fail(`sampled page missing in dist: ${page}`); continue; }
  const html = readFileSync(f, 'utf8');
  if (html.includes('Redirecting to')) fail(`interstitial "Redirecting to" found in ${page}`);
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue; // external / protocol-relative
    if (href.startsWith('#')) continue;
    const path = href.split('#')[0].split('?')[0]; // strip fragment/query before matching
    if (!path) continue; // pure in-page anchor
    linksChecked++;
    if (redirectFor(path)) { fail(`internal link points at a redirect: ${href} (on ${page})`); continue; }
    if (!exists200(path)) fail(`internal link 404 (no dist file): ${href} (on ${page})`);
  }
}

// ─── 2 (full sweep): no interstitials anywhere in dist ─────────────────────────
let interstitials = 0;
function sweep(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) sweep(full);
    else if (entry.name.endsWith('.html')) {
      if (readFileSync(full, 'utf8').includes('Redirecting to')) {
        interstitials++;
        if (interstitials <= 5) fail(`interstitial file: ${full.replace(DIST, 'dist')}`);
      }
    }
  }
}
sweep(DIST);
if (interstitials > 0) fail(`total interstitial pages found: ${interstitials}`);

// ─── 3: legacy slugs 301 correctly ─────────────────────────────────────────────
let redirectsVerified = 0;
function checkLegacy(legacy: string, expectedCanonical: string) {
  const r = redirectFor(legacy);
  if (!r) { fail(`legacy slug has no redirect: ${legacy}`); return; }
  if (!r.permanent) fail(`redirect not permanent (301): ${legacy}`);
  if (r.destination !== expectedCanonical) {
    fail(`redirect Location wrong: ${legacy} -> ${r.destination} (expected ${expectedCanonical})`);
    return;
  }
  if (!exists200(expectedCanonical)) fail(`redirect target not built: ${expectedCanonical}`);
  redirectsVerified++;
}

// time-range legacy slugs
const rangeSample = [...ALL_TIME_RANGES.slice(0, 20), ...ALL_TIME_RANGES.filter(r => r.workShift)];
for (const r of rangeSample) {
  // English-form slug on DE path -> DE canonical (regex dash-swap)
  checkLegacy(`/stunden-zwischen-${r.slug}/`, `/stunden-zwischen-${r.deSlug}/`);
  // Phase 3.3 merge: arbeitsstunden -> stunden-zwischen ; work-hours -> hours-between
  checkLegacy(`/arbeitsstunden-${r.deSlug}/`, `/stunden-zwischen-${r.deSlug}/`);
  checkLegacy(`/en/work-hours-${r.slug}/`, `/en/hours-between-${r.slug}/`);
  // Legacy ambiguous 12h EN slugs (Phase 3.1) resolve in one hop to canonical
  if (r.legacyEnSlug) {
    checkLegacy(`/en/hours-between-${r.legacyEnSlug}/`, `/en/hours-between-${r.slug}/`);
    checkLegacy(`/en/work-hours-${r.legacyEnSlug}/`, `/en/hours-between-${r.slug}/`);
    checkLegacy(`/stunden-zwischen-${r.legacyEnSlug}/`, `/stunden-zwischen-${r.deSlug}/`);
    checkLegacy(`/arbeitsstunden-${r.legacyEnSlug}/`, `/stunden-zwischen-${r.deSlug}/`);
  }
}
// countdown legacy slugs
for (const e of ALL_EVENTS.filter(e => e.slug !== e.deSlug).slice(0, 15)) {
  checkLegacy(`/tage-bis-${e.slug}/`, `/tage-bis-${e.deSlug}/`);
  checkLegacy(`/en/days-until-${e.deSlug}/`, `/en/days-until-${e.slug}/`);
}

// ─── Report ──────────────────────────────────────────────────────────────────
console.log(`\n[audit 02-crawl]`);
console.log(`  internal links checked : ${linksChecked}`);
console.log(`  legacy redirects checked: ${redirectsVerified}`);
console.log(`  interstitials found    : ${interstitials}`);
console.log(`  failures               : ${failures.length}`);
if (failures.length > 0) {
  console.log(`\n  first 25 failures:`);
  for (const f of failures.slice(0, 25)) console.log(`    - ${f}`);
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — links resolve 200, no interstitials, legacy slugs 301 correctly.\n`);
  process.exit(0);
}
