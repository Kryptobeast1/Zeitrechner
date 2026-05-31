import { INDEXED_RANGES } from '../data/timeRanges';
import { ALL_EVENTS } from '../data/dateEvents';
import { getHubUrl, getToolUrl, getTimeRangeUrl, getWorkHoursUrl, getCountdownUrl, getGuideUrl, shouldIndex, getFullUrl } from '../lib/seoEngine';

export async function GET() {
  const languages = ['de', 'en'] as const;
  const currentYear = 2026;

  // Collect all indexable URLs
  const urlSet = new Set<string>();

  // Hubs & Tools
  languages.forEach(lang => {
    urlSet.add(getFullUrl(getHubUrl(lang)));
    urlSet.add(getFullUrl(getToolUrl(lang)));
  });

  // Time Ranges (Exclude same-time ranges)
  INDEXED_RANGES.filter(r => shouldIndex('time-range', r.demandScore) && r.start !== r.end).forEach(range => {
    languages.forEach(lang => {
      urlSet.add(getFullUrl(getTimeRangeUrl(lang, lang === 'de' ? range.deSlug : range.slug)));
    });
  });

  // Work Hours (Exclude same-time ranges)
  INDEXED_RANGES.filter(r => (shouldIndex('work-hours', r.demandScore) || r.workShift) && r.start !== r.end).forEach(range => {
    languages.forEach(lang => {
      urlSet.add(getFullUrl(getWorkHoursUrl(lang, lang === 'de' ? range.deSlug : range.slug)));
    });
  });

  // Countdowns (Exclude past-year countdowns)
  ALL_EVENTS.filter(e => {
    const eventYear = parseInt(e.targetDate.split('-')[0]);
    if (eventYear < currentYear) return false;
    return e.priority !== 'low' || eventYear <= 2027;
  }).forEach(event => {
    languages.forEach(lang => {
      urlSet.add(getFullUrl(getCountdownUrl(lang, lang === 'de' ? event.deSlug : event.slug)));
    });
  });

  // Guides & Tools
  urlSet.add(getFullUrl(getGuideUrl('de', 'arbeitszeit-berechnen')));
  urlSet.add(getFullUrl(getGuideUrl('en', 'how-to-calculate-work-hours')));
  urlSet.add(getFullUrl(getGuideUrl('de', 'zeiterfassung-freelancer')));
  urlSet.add(getFullUrl(getGuideUrl('en', 'tracking-time-freelancers')));
  urlSet.add(getFullUrl(getGuideUrl('de', 'ueberstunden-berechnen')));
  urlSet.add(getFullUrl(getGuideUrl('de', 'urlaubstage-berechnen')));
  urlSet.add(getFullUrl('/wochenarbeitszeit/'));
  urlSet.add(getFullUrl(getGuideUrl('de', 'monatsarbeitszeit')));
  urlSet.add(getFullUrl('/datum-in-x-tagen/'));
  urlSet.add(getFullUrl(getGuideUrl('de', 'zeiterfassung-pflicht')));
  urlSet.add(getFullUrl('/autor/dr-jan-mueller/'));

  // HTML Sitemaps
  urlSet.add(getFullUrl('/alle-rechner/'));
  urlSet.add(getFullUrl('/en/all-calculators/'));

  // Legal Pages
  urlSet.add(getFullUrl('/impressum/'));
  urlSet.add(getFullUrl('/datenschutz/'));
  urlSet.add(getFullUrl('/nutzungsbedingungen/'));
  urlSet.add(getFullUrl('/ueber-uns/'));
  urlSet.add(getFullUrl('/en/imprint/'));
  urlSet.add(getFullUrl('/en/privacy-policy/'));
  urlSet.add(getFullUrl('/en/terms-of-service/'));
  urlSet.add(getFullUrl('/en/about-us/'));

  const urls = Array.from(urlSet);

  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.endsWith('/') && url.split('/').length <= 4 ? '1.0' : '0.7'}</priority>
  </url>`).join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

