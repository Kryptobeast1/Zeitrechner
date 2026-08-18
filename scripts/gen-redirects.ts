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

// A DE/EN slug pair is a "plain swap" if replacing -and- with -und- yields the DE slug.
const isPlainSwap = (slug: string, deSlug: string) => slug.replace('-and-', '-und-') === deSlug;

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

// 3a. explicit time-range redirects (only the non-plain-swap pairs, e.g. 8-and-4 -> 8-und-16)
let explicitRanges = 0;
for (const r of ALL_TIME_RANGES) {
  if (isPlainSwap(r.slug, r.deSlug)) continue;
  explicitRanges++;
  redirects.push(R(`/stunden-zwischen-${r.slug}/`, `/stunden-zwischen-${r.deSlug}/`));
  redirects.push(R(`/arbeitsstunden-${r.slug}/`, `/arbeitsstunden-${r.deSlug}/`));
  redirects.push(R(`/en/hours-between-${r.deSlug}/`, `/en/hours-between-${r.slug}/`));
  redirects.push(R(`/en/work-hours-${r.deSlug}/`, `/en/work-hours-${r.slug}/`));
}

// 3b. explicit countdown redirects (event names are never a plain swap)
let explicitEvents = 0;
for (const e of ALL_EVENTS) {
  if (e.slug === e.deSlug) continue;
  explicitEvents++;
  redirects.push(R(`/tage-bis-${e.slug}/`, `/tage-bis-${e.deSlug}/`));
  redirects.push(R(`/en/days-until-${e.deSlug}/`, `/en/days-until-${e.slug}/`));
}

// 4. regex catch-alls for the plain-swap pairs
redirects.push(R('/stunden-zwischen-:a-and-:b/', '/stunden-zwischen-:a-und-:b/'));
redirects.push(R('/arbeitsstunden-:a-and-:b/', '/arbeitsstunden-:a-und-:b/'));
redirects.push(R('/en/hours-between-:a-und-:b/', '/en/hours-between-:a-and-:b/'));
redirects.push(R('/en/work-hours-:a-und-:b/', '/en/work-hours-:a-and-:b/'));

// 5. add trailing slash (last)
redirects.push(R('/((?!.*\\.).*[^/])', '/$1/'));

const config = {
  redirects,
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://zeit-rechner.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net; frame-ancestors 'none'; upgrade-insecure-requests;",
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
};

writeFileSync(resolve(ROOT, 'vercel.json'), JSON.stringify(config, null, 2) + '\n', 'utf8');

console.log(`[gen-redirects] wrote vercel.json`);
console.log(`  total redirects        : ${redirects.length}`);
console.log(`  explicit time-ranges   : ${explicitRanges} (x4 rules)`);
console.log(`  explicit countdowns    : ${explicitEvents} (x2 rules)`);
console.log(`  regex catch-alls       : 4`);
