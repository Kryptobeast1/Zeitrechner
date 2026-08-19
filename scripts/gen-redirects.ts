// ─────────────────────────────────────────────────────────────────────────────
// Generates vercel.json redirects from the route data (single source of truth).
//
// Legacy slugs must return a real HTTP 301 — never a client-side meta-refresh.
// Vercel processes redirects top-to-bottom, first match wins, so ordering is:
//   1. host canonicalisation (www -> apex)
//   2. legacy path specials (/de, /zeitrechner, ...)
//   3. explicit slug redirects where the DE/EN slugs are NOT a plain and/und swap
//      (the 12 hand-authored 12h work shifts + every countdown event)
//   4. regex catch-alls for the ~600 generated pairs that ARE a plain swap
//   5. add-trailing-slash catch-all (last)
//
// Run:  node --experimental-strip-types scripts/gen-redirects.ts
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ALL_TIME_RANGES } from '../src/data/timeRanges.ts';
import { ALL_EVENTS } from '../src/data/dateEvents.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: string; value: string }[];
};

const R = (source: string, destination: string): Redirect => ({ source, destination, permanent: true });

const redirects: Redirect[] = [];

// 1. www -> apex
redirects.push({
  source: '/(.*)',
  has: [{ type: 'host', value: 'www.zeit-rechner.com' }],
  destination: 'https://zeit-rechner.com/$1',
  permanent: true,
});

// 2. legacy path specials
redirects.push(R('/de', '/'));
redirects.push(R('/de/:path*', '/:path*'));
redirects.push(R('/zeitrechner/', '/'));
redirects.push(R('/en/time-calculator/', '/en/'));

// 3a. explicit legacy 12h EN slugs -> canonical 24h (Phase 3.1). Must precede the
//     regex/merge rules so they resolve in a single hop (no dash-swap chain).
let explicitLegacy = 0;
for (const r of ALL_TIME_RANGES) {
  if (!r.legacyEnSlug) continue;
  explicitLegacy++;
  // EN: legacy 12h hours-between AND merged work-hours -> canonical EN hours-between
  redirects.push(R(`/en/hours-between-${r.legacyEnSlug}/`, `/en/hours-between-${r.slug}/`));
  redirects.push(R(`/en/work-hours-${r.legacyEnSlug}/`, `/en/hours-between-${r.slug}/`));
  // DE: the same legacy English-form on DE paths -> canonical DE stunden-zwischen
  redirects.push(R(`/stunden-zwischen-${r.legacyEnSlug}/`, `/stunden-zwischen-${r.deSlug}/`));
  redirects.push(R(`/arbeitsstunden-${r.legacyEnSlug}/`, `/stunden-zwischen-${r.deSlug}/`));
}

// 3b. countdown redirects — lifecycle (Phase 6.4) + slug normalisation.
let explicitEvents = 0, pastEvents = 0;
const currentYear = new Date().getFullYear();
const stripYear = (s: string) => s.replace(/-\d{4}$/, '');
for (const e of ALL_EVENTS) {
  const y = parseInt(e.targetDate.split('-')[0], 10);
  if (y < currentYear) {
    // Past-year page → 301 to the evergreen parent (auto-jumps to next occurrence), else the hub.
    const evDe = ALL_EVENTS.find(x => x.deSlug === stripYear(e.deSlug) && !/-\d{4}$/.test(x.deSlug));
    const evEn = ALL_EVENTS.find(x => x.slug === stripYear(e.slug) && !/-\d{4}$/.test(x.slug));
    const deTarget = evDe ? `/tage-bis-${evDe.deSlug}/` : '/';
    const enTarget = evEn ? `/en/days-until-${evEn.slug}/` : '/en/';
    redirects.push(R(`/tage-bis-${e.deSlug}/`, deTarget));
    if (e.slug !== e.deSlug) redirects.push(R(`/tage-bis-${e.slug}/`, deTarget));
    redirects.push(R(`/en/days-until-${e.slug}/`, enTarget));
    if (e.slug !== e.deSlug) redirects.push(R(`/en/days-until-${e.deSlug}/`, enTarget));
    pastEvents++;
    continue;
  }
  if (e.slug === e.deSlug) continue;
  explicitEvents++;
  redirects.push(R(`/tage-bis-${e.slug}/`, `/tage-bis-${e.deSlug}/`));
  redirects.push(R(`/en/days-until-${e.deSlug}/`, `/en/days-until-${e.slug}/`));
}

// 4. regex rules: merge arbeitsstunden/work-hours into the time-range page (Phase 3.3)
//    and normalise legacy English-form / German-form slugs to canonical.
//    Order: more-specific (-and-/-und-) before the general :rest catch-all.
redirects.push(R('/arbeitsstunden-:a-and-:b/', '/stunden-zwischen-:a-und-:b/')); // english-form arbeits -> DE canonical
redirects.push(R('/arbeitsstunden-:rest/', '/stunden-zwischen-:rest/'));          // und-form arbeits -> DE canonical (merge)
redirects.push(R('/stunden-zwischen-:a-and-:b/', '/stunden-zwischen-:a-und-:b/'));// english-form stunden -> DE canonical
redirects.push(R('/en/work-hours-:rest/', '/en/hours-between-:rest/'));           // EN work-hours -> EN hours-between (merge)
redirects.push(R('/en/hours-between-:a-und-:b/', '/en/hours-between-:a-and-:b/'));// stray und-form on EN -> EN canonical

// 5. add trailing slash (last)
redirects.push(R('/((?!.*\\.).*[^/])', '/$1/'));

const config = {
  redirects,
  headers: [
    {
      // Everything except /embed/* — deny framing.
      source: '/((?!embed/).*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://zeit-rechner.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net; frame-ancestors 'none'; upgrade-insecure-requests;",
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
    {
      // Embed widgets — framable by any site (Phase 7.2).
      source: '/embed/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-ancestors *; upgrade-insecure-requests;",
        },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

writeFileSync(resolve(ROOT, 'vercel.json'), JSON.stringify(config, null, 2) + '\n', 'utf8');

console.log(`[gen-redirects] wrote vercel.json`);
console.log(`  total redirects        : ${redirects.length}`);
console.log(`  legacy 12h EN slugs    : ${explicitLegacy} (x4 rules)`);
console.log(`  explicit countdowns    : ${explicitEvents} (x2 rules)`);
console.log(`  past-year countdowns   : ${pastEvents} (lifecycle → evergreen)`);
console.log(`  merge/normalise regex  : 5`);
