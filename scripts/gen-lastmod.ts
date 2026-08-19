// ─────────────────────────────────────────────────────────────────────────────
// Per-page <lastmod> manifest (Phase 6.1). Google discounts a sitemap whose
// every URL carries an identical build-timestamp lastmod. Instead we hash each
// page's real content signature and keep a committed manifest: a page's lastmod
// only advances when its own signature changes. Unchanged pages keep their date
// across builds.
//   node --experimental-strip-types scripts/gen-lastmod.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../src/data/timeRanges.ts';
import { ALL_EVENTS, getNextOccurrence } from '../src/data/dateEvents.ts';
import { formatHour24, getRangeHours } from '../src/data/timeRanges.ts';
import { computeShiftFromHours } from '../src/lib/shift.ts';
import { getArchetype } from '../src/lib/archetype.ts';
import { getShiftModules } from '../src/lib/shiftModules.ts';
import {
  timeRangeIntros_de, timeRangeIntros_en, faqSets_de, faqSets_en,
  workHoursFaqSets_de, workHoursFaqSets_en, countdownIntros_de, countdownIntros_en, variantIndex,
} from '../src/data/contentVariants.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = resolve(ROOT, 'lastmod-manifest.json');
const TODAY = new Date().toISOString().slice(0, 10);

const prev: Record<string, { hash: string; lastmod: string }> =
  existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const next: Record<string, { hash: string; lastmod: string }> = {};

const sha = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 16);

function record(path: string, signature: string) {
  const hash = sha(signature);
  const before = prev[path];
  next[path] = { hash, lastmod: before && before.hash === hash ? before.lastmod : TODAY };
}

// ── time-range pages (DE + EN), signature = the real rendered content ────────
function rangeSignature(r: typeof ALL_TIME_RANGES[number], lang: 'de' | 'en'): string {
  const s = formatHour24(r.start), e = formatHour24(r.end), h = getRangeHours(r.start, r.end);
  const g = computeShiftFromHours(r.start, r.end, 0, lang);
  const n = computeShiftFromHours(r.start, r.end, 30, lang);
  const modules = getShiftModules(r.start, r.end, getArchetype(r.start, r.end)).map(m => m.id).join(',');
  const slug = lang === 'de' ? r.deSlug : r.slug;
  const intros = lang === 'de' ? timeRangeIntros_de : timeRangeIntros_en;
  const faqSets = lang === 'de' ? faqSets_de : faqSets_en;
  const whFaq = lang === 'de' ? workHoursFaqSets_de : workHoursFaqSets_en;
  const intro = intros[variantIndex(slug + (lang === 'en' ? '' : ''), intros.length)](s, e, h);
  const faqs = faqSets[variantIndex(slug + 'faq', faqSets.length)](s, e, h);
  const wfaqs = whFaq[0](s, e, n.netDecimal);
  return `TR|${slug}|${g.grossHHMM}|${g.grossDecimalStr}|${n.netHHMM}|${modules}|${intro}|${JSON.stringify(faqs)}|${JSON.stringify(wfaqs)}`;
}
for (const r of ALL_TIME_RANGES) {
  record(`/stunden-zwischen-${r.deSlug}/`, rangeSignature(r, 'de'));
  record(`/en/hours-between-${r.slug}/`, rangeSignature(r, 'en'));
}

// ── countdown pages (evergreen only; year pages handled by lifecycle) ────────
const currentYear = new Date().getFullYear();
for (const ev of ALL_EVENTS) {
  const y = parseInt(ev.targetDate.split('-')[0], 10);
  if (y < currentYear) continue;
  const { date } = getNextOccurrence(ev.targetDate);
  const introDe = countdownIntros_de[variantIndex(ev.deSlug, countdownIntros_de.length)](ev.deName, 0);
  const introEn = countdownIntros_en[variantIndex(ev.slug, countdownIntros_en.length)](ev.name, 0);
  record(`/tage-bis-${ev.deSlug}/`, `CD|${ev.deSlug}|${date}|${introDe}`);
  record(`/en/days-until-${ev.slug}/`, `CD|${ev.slug}|${date}|${introEn}`);
}

// ── static pages: signature = source file mtime (real change signal) ─────────
const STATIC: Array<[string, string]> = [
  ['/', 'src/pages/index.astro'],
  ['/en/', 'src/pages/en/index.astro'],
  ['/alle-rechner/', 'src/pages/alle-rechner.astro'],
  ['/en/all-calculators/', 'src/pages/en/all-calculators.astro'],
  ['/ratgeber/', 'src/pages/ratgeber/index.astro'],
  ['/en/guides/', 'src/pages/en/guides/index.astro'],
  ['/impressum/', 'src/pages/impressum.astro'],
  ['/datenschutz/', 'src/pages/datenschutz.astro'],
  ['/nutzungsbedingungen/', 'src/pages/nutzungsbedingungen.astro'],
  ['/ueber-uns/', 'src/pages/ueber-uns.astro'],
  ['/en/imprint/', 'src/pages/en/imprint.astro'],
  ['/en/privacy-policy/', 'src/pages/en/privacy-policy.astro'],
  ['/en/terms-of-service/', 'src/pages/en/terms-of-service.astro'],
  ['/en/about-us/', 'src/pages/en/about-us.astro'],
];
for (const [path, src] of STATIC) {
  const full = resolve(ROOT, src);
  const sig = existsSync(full) ? statSync(full).mtime.toISOString().slice(0, 10) : 'missing';
  record(path, `ST|${path}|${sig}`);
}

const changed = Object.keys(next).filter(k => !prev[k] || prev[k].hash !== next[k].hash).length;
writeFileSync(MANIFEST, JSON.stringify(next, null, 0) + '\n', 'utf8');
console.log(`[gen-lastmod] ${Object.keys(next).length} URLs, ${changed} changed (lastmod → ${TODAY})`);
