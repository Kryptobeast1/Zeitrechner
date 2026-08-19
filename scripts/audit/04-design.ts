// ─────────────────────────────────────────────────────────────────────────────
// AUDIT 04 — DESIGN SYSTEM  (Phase 4 gate, re-runnable / CI)
//
//   1. zero emoji code points in any rendered HTML (nav, headings, labels, …)
//   2. no external font host referenced (fonts are self-hosted)
//   3. self-hosted @font-face files are actually referenced by the bundled CSS
//
// Lighthouse (perf/a11y ≥ 95, CLS < 0.05) must be run against a deploy/preview
// with a headless Chrome — it cannot run in this sandbox, so it is checked
// manually; this script covers the statically-verifiable parts of Gate 4.
//
// Run:  node --experimental-strip-types scripts/audit/04-design.ts
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const failures: string[] = [];
const fail = (m: string) => failures.push(m);

// Emoji ranges only — deliberately excludes typographic glyphs the design uses:
// arrows (→ U+2192), breadcrumb › (U+203A), caret ▾ (U+25BE), bullet • (U+2022),
// and © ® ™ (all < U+2600).
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{231A}\u{231B}\u{23E9}-\u{23FA}\u{24C2}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{FE0F}\u{200D}]/u;

let htmlFiles = 0, cssFiles = 0, fontRefs = 0, emojiHits = 0;

function walk(dir: string, fn: (f: string) => void) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

walk(DIST, (full) => {
  if (full.endsWith('.html')) {
    htmlFiles++;
    const html = readFileSync(full, 'utf8');
    if (/fonts\.(googleapis|gstatic)\.com/.test(html)) fail(`external font host referenced in ${full.replace(DIST, 'dist')}`);
    // scan character-by-character so we can report the offending glyph + context
    const m = html.match(new RegExp(EMOJI, 'gu'));
    if (m) {
      emojiHits += m.length;
      const idx = html.search(EMOJI);
      const ctx = html.slice(Math.max(0, idx - 25), idx + 5).replace(/\s+/g, ' ');
      if (failures.length < 25) fail(`emoji ${JSON.stringify(m[0])} in ${full.replace(DIST, 'dist')} … "${ctx}"`);
    }
  } else if (full.endsWith('.css')) {
    cssFiles++;
    const css = readFileSync(full, 'utf8');
    if (/fonts\.(googleapis|gstatic)\.com/.test(css)) fail(`external font host referenced in bundled CSS ${full.replace(DIST, 'dist')}`);
    const refs = css.match(/url\((?:'|")?\/fonts\/[^)]+\.woff2/g);
    if (refs) fontRefs += refs.length;
  }
});

if (!existsSync(resolve(DIST, 'fonts'))) fail('dist/fonts/ missing — fonts not self-hosted');
if (fontRefs === 0) fail('no self-hosted @font-face url(/fonts/*.woff2) reference found in bundled CSS');

console.log(`\n[audit 04-design]`);
console.log(`  html files scanned     : ${htmlFiles}`);
console.log(`  css files scanned      : ${cssFiles}`);
console.log(`  self-hosted font refs  : ${fontRefs}`);
console.log(`  emoji code points found: ${emojiHits}`);
console.log(`  failures               : ${failures.length}`);
if (failures.length > 0) {
  for (const f of failures.slice(0, 25)) console.log(`    - ${f}`);
  process.exit(1);
} else {
  console.log(`\n  ✓ PASS — zero emoji, fonts self-hosted. (Run Lighthouse on a preview for perf/a11y/CLS.)\n`);
  process.exit(0);
}
