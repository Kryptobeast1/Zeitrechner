// XML builders for the split sitemap (Phase 6.1). No changefreq / priority —
// Google ignores both. Real per-page lastmod from the manifest.
import { SITE } from './sitemapUrls';
import { lastmodFor, latestLastmod } from './lastmod';

const xmlResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });

export function urlset(paths: string[]): Response {
  const urls = paths.map(p => `  <url><loc>${SITE}${p}</loc><lastmod>${lastmodFor(p)}</lastmod></url>`).join('\n');
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
}

export function sitemapindex(children: Array<{ name: string; paths: string[] }>): Response {
  const items = children.map(c =>
    `  <sitemap><loc>${SITE}/${c.name}</loc><lastmod>${latestLastmod(c.paths)}</lastmod></sitemap>`
  ).join('\n');
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`);
}
