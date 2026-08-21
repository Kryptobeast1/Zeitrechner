# Phase 3 — English locale: reposition plan (for decision)

## The problem, in the data

The `/en/` tree is a straight translation of German calculators competing for the most
commoditised query on the web — "time calculator" — against calculator.net, timeanddate,
and omnicalculator.

- EN pulls ~1,259 GSC impressions but ranks **badly**: homepage **pos 54**, `days-until`
  pages **pos 40–57**. Only the merged `hours-between`/`work-hours` pages do okay (pos 6–20).
- The winning EN queries are generic head terms ("time calculator", "hours calculator")
  where a young site cannot compete on authority.
- **The site's actual moat — German working-time law (ArbZG, Industrieminuten, Bundesland
  holidays, Stundenzettel) — is invisible in the generic EN pages.** That knowledge is
  worthless to a global "time calculator" searcher, but valuable to a specific, far less
  contested audience.

## The reposition thesis

Stop translating German calculators into English for a global tool audience.
Instead: **English-language coverage of *German* working time**, for the millions of
English-speaking people who must deal with it —

- **Expats & international employees** working in Germany
- **HR / payroll teams** at German subsidiaries of international companies
- **Remote workers & contractors** billing German clients

These users search in English for German rules: "working hours law germany", "break rules
germany", "german public holidays 2026", "overtime germany", "night shift bonus germany",
"how many vacation days germany". Low competition, real intent, and **we already own the
authoritative content in German** — it just needs an English home.

## Why this is cheap to build

Everything needed already exists; reposition is mostly **framing + hreflang**, not new logic:

| New EN page | Reuses (already built) |
|---|---|
| `/en/german-working-hours-calculator/` | `computeShift` engine + WorkHoursCalc |
| `/en/break-rules-germany/` | pausenrechner content (§ 4 ArbZG) |
| `/en/rest-period-germany/` | ruhezeit-checker (§ 5, 11h) |
| `/en/night-work-germany/` | nachtzuschlag content (§ 6 ArbZG + § 3b EStG rates) |
| `/en/overtime-in-germany/` | ratgeber/ueberstunden content |
| `/en/vacation-entitlement-germany/` | ratgeber/urlaubstage content (BUrlG) |
| `/en/german-public-holidays/` (+ by-state later) | dateEvents + Phase 4 holiday data |
| `/en/decimal-hours-calculator/` | conversion + existing decimal content |

## Concrete plan

### Keep (with a reframed hub)
- `/en/` homepage → reframe as **"Working time in Germany — calculators & rules (in English)"**,
  linking the new cluster. Keeps its impressions but points them at differentiated content.
- `/en/hours-between-*` and `/en/days-until-*` → **keep** (they rank pos 6–20 and were just
  upgraded); they still serve the global long tail and the "holidays in Germany" angle.

### Build (first batch — 4 pages, highest intent)
1. `/en/german-working-hours-calculator/` — the hub calculator + ArbZG explainer in English
2. `/en/break-rules-germany/` — § 4 (30/45 min), split breaks, minors
3. `/en/overtime-in-germany/` — Mehrarbeit vs overtime, § 3 limits, pay vs time off
4. `/en/german-public-holidays/` — nationwide + by-state (ties into Phase 4)

### Build (second batch)
5. `/en/rest-period-germany/` (§ 5, 11h)
6. `/en/night-work-germany/` (§ 6 + § 3b EStG tax-free rates)
7. `/en/vacation-entitlement-germany/` (BUrlG)
8. `/en/decimal-hours-calculator/`

### hreflang
- Each new EN page pairs with its genuine DE equivalent (e.g.
  `/en/break-rules-germany/` ↔ `/pausenrechner/`) — real equivalents, not near-duplicates.
- Generic EN calculators with **no** German context and no ranking get `noindex` (the plan's
  Option A applied selectively, not wholesale).

## The alternative (Option A — retire)

`noindex` the whole `/en/` tree, drop hreflang, concentrate everything on German. Simplest,
and defensible given EN's weak positions — **but** it throws away ~1,259 impressions and a
genuinely underserved niche where we already hold the content. Retire is the right call only
if there's no appetite to maintain an English cluster at all.

## Recommendation

**Option B, phased and selective.** Build the 4-page first batch, reframe the EN homepage as
the German-working-time hub, keep the pages that already rank, and `noindex` only the generic
EN calculators that neither rank nor differentiate. Low build cost (content already exists in
German), a real audience, and it turns the EN tree from a liability into the site's second moat.

**Effort:** first batch ≈ 4 pages, each mostly translated/adapted from existing DE content +
wired to existing engines. No new infrastructure. Reversible (it's additive; the retire option
stays open if it doesn't perform).

## Decision needed from you
1. **B (reposition), A (retire), or neither for now?**
2. If B: OK to start with the **4-page first batch** above, or adjust the page list?
3. If B: confirm the EN homepage should become the **"working time in Germany" hub** (vs. staying a generic tool homepage).
