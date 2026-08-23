# Full-site duplicate / thin-content audit (today: 2026-08-22)

Re-run after a build: `node scripts/audit/dupe-scan.mjs`

Scanned **1,307 built HTML pages** (1,303 indexable, excluding noindex + /embed).

## Verdict: no harmful duplicate-content problem

The signals Google actually uses to fold or skip pages are all clean:

| Check | Result |
|---|---|
| Colliding canonicals (2 pages → same canonical) | **0** ✓ |
| Non-self canonicals (canonical ≠ own URL) | **0** ✓ |
| Duplicate `<title>` | **0** ✓ |
| Duplicate meta description | **0** ✓ |
| Duplicate `<h1>` | **0** ✓ |
| Body-text pairs > 0.85 similarity | **0** ✓ |

The countdown lifecycle fix removed the only true near-duplicates — the old
evergreen-vs-year twins that used to sit at 0.75–0.86 similarity. Countdowns now
top out at ~0.50 (different events that merely share structure).

## Two things worth improving (neither is a "duplicate" penalty risk)

### A. 16 thin pages (< 250 words of main content)
Most are **legal pages** (Impressum 137w, Imprint 113w, Datenschutz, Terms…) —
inherently short and completely fine; Google does not expect long legal text.

The **actionable** ones are content hubs that are mostly link grids with little prose:

| Page | Words | Note |
|---|---|---|
| /ratgeber/ | 58 | guide index — add an intro + section framing |
| /en/guides/ | 66 | guide index — same |
| /en/shifts/ab-07-uhr/ | 87 | shift hub — thin intro |
| /schichten/ab-07-uhr/ | 102 | shift hub — thin intro |
| /en/shifts/nachtschichten/ · /8-stunden/ · /teilzeit/ | 182–187 | shift hubs |
| /schichten/nachtschichten/ · /8-stunden/ · /teilzeit/ | 220–226 | shift hubs |
| /alle-rechner/ | 209 | link hub — acceptable, could add framing |

Enriching these with 1–2 orienting paragraphs strengthens them without touching
the programmatic pages. Legal pages need no change.

### B. Programmatic hours pages share template scaffolding (expected)
`stunden-zwischen` (588) and `hours-between` (588): mean max-similarity **0.59**,
with ~35–49 pages above 0.70 but **none above 0.85**. The > 0.70 pairs are ranges
that compute the **same duration** (e.g. `3–15` and `2:30–14:30` are both 12 h) so
their prose overlaps. Because every page still has a unique title, description, H1
and a distinct computed result, this stays within Google's tolerance for
templated pages — it is not a duplicate-content liability. If we ever want to
lower it further, the lever is injecting more start/end-specific prose variants;
not required today.

## Bottom line
Nothing here is hurting the site through duplication. The one worthwhile follow-up
is bolstering the handful of thin **content hubs** (§A) — a content task, not a
canonical/redirect fix.
