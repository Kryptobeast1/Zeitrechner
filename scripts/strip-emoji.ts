// One-shot dev tool (Phase 4.1): strip pictographic emoji from source templates.
// Removes \p{Extended_Pictographic} + variation selector (FE0F) + ZWJ (200D) +
// the text-dingbat check marks (✓ ✔), plus one trailing space, so headings/labels
// don't keep an orphaned leading space. Leaves typographic glyphs (→ ▾ › •) alone.
//   node --experimental-strip-types scripts/strip-emoji.ts
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname } from 'node:path';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const EMOJI = /(?:[‍️✓✔]|\p{Extended_Pictographic})+ ?/gu;

let filesChanged = 0, removed = 0;
function walk(dir: string) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) { walk(full); continue; }
    if (!['.astro', '.tsx', '.ts'].includes(extname(e.name))) continue;
    const src = readFileSync(full, 'utf8');
    const out = src.replace(EMOJI, (m) => { removed += [...m.replace(/ $/, '')].length; return ''; });
    if (out !== src) { writeFileSync(full, out, 'utf8'); filesChanged++; console.log(`  ✓ ${full.replace(SRC, 'src')}`); }
  }
}
walk(SRC);
console.log(`\n[strip-emoji] ${filesChanged} files changed, ${removed} emoji code points removed`);
