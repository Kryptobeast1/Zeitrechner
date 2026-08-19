// Reads the committed per-page lastmod manifest (Phase 6.1) at build time.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PATH = resolve(process.cwd(), 'lastmod-manifest.json');
const manifest: Record<string, { hash: string; lastmod: string }> =
  existsSync(PATH) ? JSON.parse(readFileSync(PATH, 'utf8')) : {};

const FALLBACK = new Date().toISOString().slice(0, 10);

/** ISO date (YYYY-MM-DD) for a canonical path; falls back to today if unknown. */
export function lastmodFor(path: string): string {
  return manifest[path]?.lastmod ?? FALLBACK;
}

/** Latest lastmod across a set of paths — used for a sitemap-index child entry. */
export function latestLastmod(paths: string[]): string {
  let max = '0000-00-00';
  for (const p of paths) { const d = lastmodFor(p); if (d > max) max = d; }
  return max === '0000-00-00' ? FALLBACK : max;
}
