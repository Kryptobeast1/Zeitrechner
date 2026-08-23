// ─────────────────────────────────────────────────────────────────────────────
// FULL-SITE DUPLICATE / THIN-CONTENT AUDIT
// Walks dist/**/*.html and reports the things that actually hurt SEO:
//   1. Colliding <link rel=canonical> (two pages claiming the same canonical)
//   2. Non-self-referencing canonicals (page's canonical ≠ its own URL)
//   3. Exact-duplicate <title>
//   4. Exact-duplicate meta description
//   5. Exact-duplicate <h1>
//   6. Thin pages (very low main-content word count)
//   7. Near-duplicate body text (5-gram Jaccard) — worst pairs per template family
//
// Run after a build:  node scripts/audit/dupe-scan.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const SITE = 'https://zeit-rechner.com';

// ── collect all built HTML pages ──────────────────────────────────────────────
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.html')) files.push(full);
  }
})(DIST);

const urlOf = (f) => '/' + relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '/');
const pick = (re, s) => { const m = re.exec(s); return m ? m[1].trim() : ''; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

// main content text: strip scripts/styles/tags, collapse whitespace
function mainText(html) {
  let body = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const main = /<main[\s\S]*?<\/main>/i.exec(body);
  body = main ? main[0] : body;
  return decode(body.replace(/<[^>]+>/g, ' ')).toLowerCase();
}

const pages = [];
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const url = urlOf(f);
  const isNoindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
  pages.push({
    url, file: f, isNoindex,
    title: decode(pick(/<title>([\s\S]*?)<\/title>/i, html)),
    desc: decode(pick(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i, html)),
    canonical: pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i, html).replace(SITE, ''),
    h1: decode(pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html)),
    text: mainText(html),
  });
}
const indexable = pages.filter(p => !p.isNoindex && !p.url.startsWith('/embed'));

// ── helper: group by a key, keep groups with >1 ───────────────────────────────
const groupDupes = (arr, keyFn) => {
  const m = new Map();
  for (const p of arr) { const k = keyFn(p); if (!k) continue; (m.get(k) ?? m.set(k, []).get(k)).push(p); }
  return [...m.entries()].filter(([, g]) => g.length > 1);
};

console.log(`\n=== FULL-SITE DUPLICATE AUDIT ===`);
console.log(`HTML pages: ${pages.length}  ·  indexable (no-noindex, non-embed): ${indexable.length}\n`);

// 1. Colliding canonicals
const canonGroups = groupDupes(indexable.filter(p => p.canonical), p => p.canonical);
console.log(`── 1. COLLIDING CANONICALS (${canonGroups.length}) — multiple pages claim the same canonical ──`);
if (!canonGroups.length) console.log('  none ✓');
for (const [c, g] of canonGroups.slice(0, 20)) { console.log(`  canonical ${c}:`); g.forEach(p => console.log(`     ${p.url}`)); }

// 2. Non-self canonicals
const nonSelf = indexable.filter(p => p.canonical && p.canonical !== p.url);
console.log(`\n── 2. NON-SELF CANONICALS (${nonSelf.length}) — page canonical ≠ own URL ──`);
if (!nonSelf.length) console.log('  none ✓');
nonSelf.slice(0, 20).forEach(p => console.log(`  ${p.url}  → canonical ${p.canonical}`));

// 3. Duplicate titles
const titleGroups = groupDupes(indexable, p => p.title);
console.log(`\n── 3. DUPLICATE <title> (${titleGroups.length} groups, ${titleGroups.reduce((n,[,g])=>n+g.length,0)} pages) ──`);
for (const [t, g] of titleGroups.slice(0, 15)) { console.log(`  "${t}"  ×${g.length}`); g.slice(0, 4).forEach(p => console.log(`     ${p.url}`)); if (g.length > 4) console.log(`     …+${g.length - 4} more`); }
if (!titleGroups.length) console.log('  none ✓');

// 4. Duplicate meta descriptions
const descGroups = groupDupes(indexable.filter(p => p.desc), p => p.desc);
console.log(`\n── 4. DUPLICATE meta description (${descGroups.length} groups, ${descGroups.reduce((n,[,g])=>n+g.length,0)} pages) ──`);
for (const [d, g] of descGroups.slice(0, 15)) { console.log(`  "${d.slice(0, 90)}…"  ×${g.length}`); g.slice(0, 4).forEach(p => console.log(`     ${p.url}`)); if (g.length > 4) console.log(`     …+${g.length - 4} more`); }
if (!descGroups.length) console.log('  none ✓');

// 5. Duplicate H1
const h1Groups = groupDupes(indexable.filter(p => p.h1), p => p.h1);
console.log(`\n── 5. DUPLICATE <h1> (${h1Groups.length} groups, ${h1Groups.reduce((n,[,g])=>n+g.length,0)} pages) ──`);
for (const [h, g] of h1Groups.slice(0, 15)) { console.log(`  "${h}"  ×${g.length}`); g.slice(0, 4).forEach(p => console.log(`     ${p.url}`)); if (g.length > 4) console.log(`     …+${g.length - 4} more`); }
if (!h1Groups.length) console.log('  none ✓');

// 6. Thin pages
const wc = (t) => t ? t.split(/\s+/).length : 0;
const thin = indexable.map(p => ({ ...p, words: wc(p.text) })).filter(p => p.words < 250).sort((a, b) => a.words - b.words);
console.log(`\n── 6. THIN PAGES (${thin.length}) — main-content words < 250 ──`);
if (!thin.length) console.log('  none ✓');
thin.slice(0, 20).forEach(p => console.log(`  ${p.words} words  ${p.url}`));

// 7. Near-duplicate body text per family (5-gram Jaccard)
function shingles(t) {
  const w = t.split(/\s+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' '));
  return s;
}
function jac(a, b) { let inter = 0; for (const x of a) if (b.has(x)) inter++; return inter / (a.size + b.size - inter || 1); }

function familyOf(u) {
  if (/^\/stunden-zwischen-/.test(u)) return 'de-hours';
  if (/^\/en\/hours-between-/.test(u)) return 'en-hours';
  if (/^\/tage-bis-/.test(u)) return 'de-countdown';
  if (/^\/en\/days-until-/.test(u)) return 'en-countdown';
  if (/^\/schichten\//.test(u) || /^\/en\/shifts\//.test(u)) return 'shift-hub';
  return 'other';
}
const fams = {};
for (const p of indexable) { const f = familyOf(p.url); (fams[f] ??= []).push({ ...p, sh: null }); }

console.log(`\n── 7. NEAR-DUPLICATE BODY TEXT (5-gram Jaccard) per family ──`);
const overallWorst = [];
for (const [fam, arr] of Object.entries(fams)) {
  if (arr.length < 2) continue;
  for (const p of arr) p.sh = shingles(p.text);
  // For big families, sample to keep it O(n·k): compare each page to 40 random others.
  const big = arr.length > 120;
  let sum = 0, cnt = 0, over70 = 0, over85 = 0;
  const worst = [];
  for (let i = 0; i < arr.length; i++) {
    let maxSim = 0, maxJ = -1;
    const partners = big ? Array.from({ length: 40 }, () => Math.floor(Math.random() * arr.length)) : arr.map((_, k) => k);
    for (const j of partners) {
      if (j === i) continue;
      const s = jac(arr[i].sh, arr[j].sh);
      if (s > maxSim) { maxSim = s; maxJ = j; }
    }
    sum += maxSim; cnt++;
    if (maxSim > 0.70) over70++;
    if (maxSim > 0.85) over85++;
    if (maxJ >= 0) worst.push([maxSim, arr[i].url, arr[maxJ].url]);
  }
  worst.sort((a, b) => b[0] - a[0]);
  console.log(`\n  [${fam}] ${arr.length} pages · mean max-sim ${(sum / cnt).toFixed(3)} · >0.70: ${over70} · >0.85: ${over85}${big ? ' (sampled)' : ''}`);
  worst.slice(0, 5).forEach(([s, a, b]) => console.log(`     ${s.toFixed(3)}  ${a}  ~  ${b}`));
  overallWorst.push(...worst.filter(w => w[0] > 0.85));
}

console.log(`\n=== SUMMARY ===`);
console.log(`  colliding canonicals   : ${canonGroups.length}`);
console.log(`  non-self canonicals    : ${nonSelf.length}`);
console.log(`  duplicate titles       : ${titleGroups.length} groups`);
console.log(`  duplicate descriptions : ${descGroups.length} groups`);
console.log(`  duplicate h1           : ${h1Groups.length} groups`);
console.log(`  thin pages (<250w)     : ${thin.length}`);
console.log(`  body pairs >0.85 sim   : ${overallWorst.length}`);
