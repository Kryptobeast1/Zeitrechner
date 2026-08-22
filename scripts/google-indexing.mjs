/**
 * Google Indexing API submitter.
 *
 * ── HONEST CAVEAT ──────────────────────────────────────────────────────────
 * Google officially supports the Indexing API only for pages with JobPosting
 * or BroadcastEvent structured data. For ordinary pages Google MAY ignore the
 * ping — it is a nudge to crawl sooner, never a guarantee of indexing. Treat a
 * successful HTTP 200 here as "Google was told", not "the page is indexed".
 * The real indexing decision still depends on content quality / duplication.
 *
 * ── SETUP (one time) ───────────────────────────────────────────────────────
 *   1. Google Cloud Console → create a project → enable "Indexing API".
 *   2. Create a Service Account → create a JSON key → download it.
 *   3. In Google Search Console → Settings → Users and permissions →
 *      add the service account's client_email as an **Owner** of the property.
 *   4. Never commit the key. Point this script at it via env or --key.
 *
 * ── USAGE ──────────────────────────────────────────────────────────────────
 *   npm run build                       # produces dist/ sitemaps
 *   $env:GOOGLE_SA_KEY="C:\path\key.json"; node scripts/google-indexing.mjs
 *   node scripts/google-indexing.mjs --key C:\path\key.json --limit 200
 *   node scripts/google-indexing.mjs --reset      # clear progress, start over
 *
 * Quota: Google's default is 200 URL notifications/day. The script submits at
 * most --limit (default 200) new URLs per run and remembers what it already
 * sent in .google-indexing-progress.json, so running it daily works through
 * the whole site (~1,340 pages) over about a week, priority pages first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createSign } from 'node:crypto';
import { allPageUrls } from './lib/sitemap-page-urls.mjs';

const PROGRESS_FILE = path.join(process.cwd(), '.google-indexing-progress.json');
const SCOPE = 'https://www.googleapis.com/auth/indexing';
const ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

// ── args ────────────────────────────────────────────────────────────────────
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const KEY_PATH = arg('--key', process.env.GOOGLE_SA_KEY);
const LIMIT = parseInt(arg('--limit', '200'), 10);
const RESET = process.argv.includes('--reset');

// ── base64url + JWT + access token ───────────────────────────────────────────
const b64url = (input) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = { iss: sa.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key)
    .toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`OAuth token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

// ── priority: hubs/guides/new pages first, then countdowns, then the long tail
function priority(url) {
  const p = url.replace('https://zeit-rechner.com', '');
  if (/-\d+-und-\d+\/$|hours-between-\d+/.test(p)) return 3; // hours long tail
  if (/tage-bis-|days-until-/.test(p)) return 2;             // countdowns
  return 1;                                                  // hubs, guides, legal, tools
}

async function main() {
  if (RESET) {
    if (fs.existsSync(PROGRESS_FILE)) fs.rmSync(PROGRESS_FILE);
    console.log('[Google] Progress reset.');
    return;
  }
  if (!KEY_PATH || !fs.existsSync(KEY_PATH)) {
    console.error('[Google] Service-account key not found. Set GOOGLE_SA_KEY or pass --key <path>. See the header of this file for setup.');
    process.exit(1);
  }
  const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'));

  const all = allPageUrls().sort((a, b) => priority(a) - priority(b) || a.localeCompare(b));
  const done = new Set(fs.existsSync(PROGRESS_FILE) ? JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) : []);
  const pending = all.filter(u => !done.has(u));

  if (pending.length === 0) {
    console.log(`[Google] All ${all.length} URLs already submitted. Use --reset to start a new pass.`);
    return;
  }

  const batch = pending.slice(0, LIMIT);
  console.log(`[Google] ${pending.length} URLs pending; submitting ${batch.length} this run (of ${all.length} total).`);

  const token = await getAccessToken(sa);
  let ok = 0, fail = 0;
  for (const url of batch) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      });
      if (res.ok) { ok++; done.add(url); }
      else {
        fail++;
        const text = await res.text();
        console.warn(`[Google] ${res.status} for ${url}: ${text.slice(0, 200)}`);
        if (res.status === 429) { console.error('[Google] Daily quota hit (429). Stopping; run again tomorrow.'); break; }
        if (res.status === 401 || res.status === 403) { console.error('[Google] Auth error — check the service account is an Owner in Search Console.'); break; }
      }
    } catch (e) {
      fail++;
      console.warn(`[Google] Request failed for ${url}: ${e.message}`);
    }
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...done], null, 0), 'utf-8');
  const remaining = all.length - done.size;
  console.log(`[Google] Done. Success ${ok}, failed ${fail}. ${remaining} URLs remain — run again tomorrow to continue.`);
}

main().catch(e => { console.error('[Google] Fatal:', e); process.exit(1); });
