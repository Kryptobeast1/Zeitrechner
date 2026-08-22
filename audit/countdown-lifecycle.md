# Countdown lifecycle audit (today: 2026-08-22)

Re-run any time: `node --experimental-strip-types scripts/audit/countdown-lifecycle.ts`

> **STATUS: RESOLVED** (full fix shipped). Lifecycle is now keyed off the actual
> date; movable feasts are computed (`src/lib/holidays.ts` → `computeEaster`) and
> US floating holidays from an nth-weekday rule; one-time/past events retire and
> 301 to their evergreen parent or the hub; duplicate year-twins 301 to evergreen.
> Post-fix audit: **0 broken pages, 0 true-duplicate clusters** (the two remaining
> same-date pairs — Neujahr/Jahr-2027 and Valentinstag/Super-Bowl — are distinct
> intents, kept deliberately). The findings below are the ORIGINAL diagnosis.

## Root cause

The build filter (`getStaticPaths`) and the redirect generator both decide "is this
event over?" by **calendar year** (`year >= currentYear`), not by the **actual date**.
So a 2026 event whose date already passed months ago is still **built and indexed**.
The page then calls `getNextOccurrence()`, which rolls the date forward by **bumping the
year and keeping the same month/day** — a naive rule that is:

- **WRONG for movable feasts** — Easter/Whitsun/etc. land on a different day each year.
- **NONSENSE for one-time events** — World Cup 2026, Solar Eclipse 2026 don't recur.
- a **DUPLICATE** whenever the rolled date equals the evergreen / next-year page.

A second, independent bug: some hardcoded dates in `dateEvents.ts` are simply wrong —
`ostersonntag` / `ostersonntag-2027` say **2027-04-17**, but Easter 2027 is **2027-03-28**
(verified against the Meeus algorithm in `src/lib/holidays.ts`).

## 1. Built + indexed, but the date already passed (18 pages)

These count down to a rolled-forward date while their URL/name still say the old year.

| Page | Original | Shows | Problem |
|---|---|---|---|
| /tage-bis-ostersonntag-2026/ | 2026-04-05 | 2027-04-05 | ❌ real Easter 2027 = 2027-03-28 |
| /tage-bis-karfreitag-2026/ | 2026-04-03 | 2027-04-03 | ❌ real = 2027-03-26 |
| /tage-bis-ostermontag-2026/ | 2026-04-06 | 2027-04-06 | ❌ real = 2027-03-29 |
| /tage-bis-christi-himmelfahrt-2026/ | 2026-05-14 | 2027-05-14 | ❌ real = 2027-05-06 |
| /tage-bis-pfingstmontag-2026/ | 2026-05-25 | 2027-05-25 | ❌ real = 2027-05-17 |
| /tage-bis-fronleichnam-2026/ | 2026-06-04 | 2027-06-04 | ❌ real = 2027-05-27 |
| /tage-bis-wm-2026-start/ | 2026-06-11 | 2027-06-11 | ❌ one-time event, invented |
| /tage-bis-wm-2026-finale/ | 2026-07-19 | 2027-07-19 | ❌ one-time event, invented |
| /tage-bis-sonnenfinsternis-2026/ | 2026-08-12 | 2027-08-12 | ❌ one-time event, invented |
| /tage-bis-ramadan-2026/ | 2026-02-18 | 2027-02-18 | movable (real ≈ 2027-02-08) |
| /tage-bis-eid-al-fitr-2026/ | 2026-03-20 | 2027-03-20 | movable (real ≈ 2027-03-10) |
| /tage-bis-memorial-day-2026/ | 2026-05-25 | 2027-05-25 | year in URL now lies |
| /tage-bis-juneteenth-2026/ | 2026-06-19 | 2027-06-19 | year in URL now lies |
| /tage-bis-jahr-2026/ | 2026-01-01 | 2027-01-01 | dup of jahr-2027 / neujahr |
| /tage-bis-unabhaengigkeitstag-usa/ | 2026-07-04 | 2027-07-04 | fixed date — roll is OK |
| /tage-bis-erster-mai/ | 2026-05-01 | 2027-05-01 | fixed date — roll is OK |
| /tage-bis-mariae-himmelfahrt/ | 2026-08-15 | 2027-08-15 | fixed date — roll is OK |
| /tage-bis-sommersonnenwende/ | 2026-06-21 | 2027-06-21 | ~fixed — roll roughly OK |

(Each also has an EN twin under `/en/days-until-…`.)

## 2. Wrong date after rollforward (9 pages)

Movable/one-time events where the rolled date is factually incorrect: `ostersonntag-2026`,
`karfreitag-2026`, `ostermontag-2026`, `christi-himmelfahrt-2026`, `pfingstmontag-2026`,
`fronleichnam-2026`, `wm-2026-start`, `wm-2026-finale`, `sonnenfinsternis-2026`.

## 3. Duplicate clusters — multiple built pages, same active date (6 clusters / 14 pages)

| Active date | Competing pages |
|---|---|
| 2026-12-25 | /tage-bis-weihnachten/ · /tage-bis-weihnachten-2026/ |
| 2027-01-01 | /tage-bis-neujahr/ · /tage-bis-neujahr-2027/ · /tage-bis-jahr-2026/ · /tage-bis-jahr-2027/ |
| 2027-02-14 | /tage-bis-valentinstag/ · /tage-bis-super-bowl-2027/ (coincidental same day) |
| 2027-03-20 | /tage-bis-eid-al-fitr-2026/ (rolled, wrong) · /tage-bis-fruehlingsanfang/ |
| 2027-04-17 | /tage-bis-ostersonntag/ · /tage-bis-ostersonntag-2027/ (both wrong: real = 03-28) |
| 2027-05-25 | /tage-bis-memorial-day-2026/ (rolled) · /tage-bis-pfingstmontag-2026/ (rolled, wrong) |

## Recommended fixes

1. **Key the lifecycle off the actual date, not the year.** An event is "over" when
   `targetDate < today`, not when `year < currentYear`. Past year-specific pages →
   301 to their evergreen parent (already the intended Phase 6.4 behaviour, just gated
   on the wrong condition).
2. **Compute movable feasts, don't hardcode them.** Easter-derived dates should come from
   `holidays.ts` (`computeEaster`), which is already tested. Fixes the 2027-04-17 error
   and every rolled Easter date.
3. **One-time events must not roll forward.** World Cup 2026, Solar Eclipse 2026, etc.
   should show a "this event has passed" state (or 301 to the hub) and drop out of the
   sitemap once done — never invent a 2027 instance.
4. **De-duplicate the clusters.** Keep one canonical page per real date (evergreen), 301
   the year-twins to it. `jahr-2026` is past → 301 to `neujahr`/`jahr-2027`.
