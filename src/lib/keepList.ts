// ─────────────────────────────────────────────────────────────────────────────
// Demand-based keep-list (Phase 3.2).
//
// When `keep-list.csv` exists at the repo root, every canonical URL NOT listed
// is served `noindex, follow` — kept reachable and functional, removed from the
// index. When the file is absent we are in DRY-RUN: nothing is de-indexed, but
// `keepListStatus()` reports how the site would be pruned once the list lands.
//
// CSV format: one URL path per line (e.g. `/stunden-zwischen-8-und-16/`).
// Lines starting with `#` and blank lines are ignored. A leading `url` header
// line is tolerated.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const KEEP_LIST_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'keep-list.csv');

let cached: Set<string> | null | undefined;

function normalise(path: string): string {
  let p = path.trim();
  if (!p) return '';
  // Accept full URLs or bare paths; reduce to the path with a single trailing slash.
  try {
    if (p.startsWith('http')) p = new URL(p).pathname;
  } catch { /* keep as-is */ }
  if (!p.startsWith('/')) p = '/' + p;
  if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/';
  return p;
}

/** The keep-list Set, or null in dry-run (no file present). Loaded once. */
export function loadKeepList(): Set<string> | null {
  if (cached !== undefined) return cached;
  if (!existsSync(KEEP_LIST_PATH)) { cached = null; return cached; }
  const raw = readFileSync(KEEP_LIST_PATH, 'utf8');
  const set = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.toLowerCase() === 'url') continue;
    const n = normalise(t.split(',')[0]); // first CSV column is the URL
    if (n) set.add(n);
  }
  cached = set;
  return cached;
}

/**
 * Should this canonical path be noindexed for lack of demand?
 * Dry-run (no keep-list file) always returns false — pages stay indexed.
 */
export function shouldNoindexByDemand(canonicalPath: string): boolean {
  const keep = loadKeepList();
  if (!keep) return false; // dry-run
  return !keep.has(normalise(canonicalPath));
}

/** Human-readable status for build logs / audits. */
export function keepListStatus(): string {
  const keep = loadKeepList();
  return keep ? `keep-list active: ${keep.size} URLs kept indexed` : 'keep-list DRY-RUN: no keep-list.csv — all pages stay indexed';
}
