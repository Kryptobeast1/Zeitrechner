// Expands the built sitemap INDEX (dist/sitemap.xml) into the full list of real
// page URLs by reading every child sitemap it references. Both the IndexNow and
// Google Indexing submitters use this so they push actual pages, not the 5
// child-sitemap .xml files (which is what submitting sitemap.xml directly does).
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');

/** All <loc> values in one .xml file. */
function locs(xml) {
  return (xml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [])
    .map(m => m.replace(/<\/?loc>/g, '').trim());
}

/**
 * Returns every real page URL across all child sitemaps.
 * If dist/sitemap.xml is a sitemap index, its children are read from dist/.
 * If it already holds page URLs (non-.xml locs), those are returned as-is.
 */
export function allPageUrls() {
  const indexPath = path.join(DIST, 'sitemap.xml');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Sitemap not found at ${indexPath} — run the build first.`);
  }
  const top = locs(fs.readFileSync(indexPath, 'utf-8'));
  const childUrls = top.filter(u => u.endsWith('.xml'));

  // Not an index (locs are pages, not .xml) — return them directly.
  if (childUrls.length === 0) return dedupe(top);

  const pages = [];
  for (const childUrl of childUrls) {
    const name = childUrl.split('/').pop();
    const childPath = path.join(DIST, name);
    if (!fs.existsSync(childPath)) {
      console.warn(`[sitemap] child sitemap missing on disk: ${name} — skipped`);
      continue;
    }
    pages.push(...locs(fs.readFileSync(childPath, 'utf-8')));
  }
  return dedupe(pages);
}

function dedupe(arr) { return [...new Set(arr)]; }
