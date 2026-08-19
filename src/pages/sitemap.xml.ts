import { sitemapindex } from '../lib/sitemapXml';
import { deHoursPaths, enHoursPaths, deCountdownPaths, enCountdownPaths, pagePaths } from '../lib/sitemapUrls';

export async function GET() {
  return sitemapindex([
    { name: 'sitemap-de-hours.xml', paths: deHoursPaths() },
    { name: 'sitemap-en-hours.xml', paths: enHoursPaths() },
    { name: 'sitemap-de-countdown.xml', paths: deCountdownPaths() },
    { name: 'sitemap-en-countdown.xml', paths: enCountdownPaths() },
    { name: 'sitemap-pages.xml', paths: pagePaths() },
  ]);
}
