# Traffic insights — GSC + Bing (as of 2026-08-21)

## Headline: this is a Bing site, not (yet) a Google site

| Engine | Window | Impressions | Clicks |
|---|---|---|---|
| **Bing Webmaster** | 88 days (since 23 May) | **21,482** | **606** |
| **Google (GSC)** | export window | 2,615 | 9 |

Bing delivers **~8× the impressions and ~67× the clicks** of Google. Bing is
**growing fast** — last 14 days ≈ 544 impressions/day (7,613 impr, 226 clicks),
up from ~5/day in late May. Google is tiny but **ranks page 1 where it shows**.

The implication is structural: **the implementation plan is written entirely around
Google Search Console signals, but the site's actual audience is on Bing.** Any
strategy that optimises for GSC while risking the breadth of indexed pages is
optimising for ~1.5% of current clicks.

## What actually ranks (GSC top pages)

| page | impressions | position |
|---|---|---|
| `/tage-bis-halloween/` | 777 | **8.4** |
| `/tage-bis-ramadan-2026/` | 88 | **6.1** |
| `/arbeitsstunden-7-30-und-16/` | 107 | **8.5** |
| `/tage-bis-jahr-2027/` | 29 | **7.7** |
| `/arbeitsstunden-9-und-17/` | 21 | **5.9** |
| `/tage-bis-allerheiligen/` | 13 | **4.8** |

By section (GSC): countdowns (tage-bis) 955 impr / 6 pages; DE work-hours
(arbeitsstunden + stunden-zwischen) ~245 impr / 31 pages; EN ~1,247 impr but weak
positions (home EN pos 54, days-until pos 40–57). GSC DE 1,356 vs EN 1,259 impr.

## The decision this changes: DO NOT run the aggressive prune

The plan's Phase 0.3 / Phase 1 propose pruning the `stunden-zwischen-*` family to
Tier C (noindex) and collapsing ~1,300 pages to 11 URLs. **The data contraindicates this:**

1. **The top performers ARE the programmatic pages** — countdowns and DE work-hours,
   ranking page 1 (pos 5–9). These are the families the plan would prune.
2. **The word-count Tier-C rule would noindex the single best pages.** Countdown pages
   are thin on words (122–146) but are the #1 traffic driver (Halloween 777 impr, pos 8).
   Applying "unique words < 150 → noindex" literally kills the crown jewels.
3. **The plan's tier thresholds assume a mature site.** At 3 months old with 9 Google
   clicks total, almost every URL falls below "≥10 clicks / ≥500 impr," so a mechanical
   pass would Tier-C/D most of the site — including pages that are ranking and growing.
4. **Pruning breadth would likely hurt Bing**, where the long tail of indexed pages is
   driving 21k impressions and climbing.

## Recommended disposition (data-driven)

- **KEEP** the programmatic pages. They rank page 1 where indexed and feed Bing growth.
  No page qualifies as Tier D (all have unique content + internal links).
- **UPGRADE the countdown pages first** — they are the proven winners and the thinnest
  (122–146 words). Thicken them (per-event context, related events, "add to calendar"
  .ics), which lifts the exact pages already earning position.
- **Deduplicate the 67 templated boilerplate strings** on the time-range families —
  safe quality win, independent of any prune.
- **Improve EN rather than retire it wholesale** — EN earns real impressions but ranks
  poorly (home pos 54); Phase 3's "reposition for German-working-time-for-expats" angle
  fits, but there's no case for retiring it given the impression volume.
- **Keep feeding Bing** (IndexNow is already wired into the build — this is why Bing is
  growing). Prioritise Bing signals over GSC while Google is still ramping.

## What from the plan still applies regardless

The plan's engineering is channel-agnostic and still valuable: the three-number model
(0.4), pure engines + CI consistency gates (1.1/1.5), permalinks/artefacts (2.2), and
the trust layer (0.6, largely done in BLOCKING). Adopt those; drop the prune.
