# German public holidays — data provenance & annual review (Phase 4)

The holiday data lives in [`src/lib/holidays.ts`](../../lib/holidays.ts) as **rules**, not
per-year JSON files. Dates are **computed**, never hardcoded:

- **Fixed-date holidays** — a month/day (e.g. German Unity Day = 3 October).
- **Movable feasts** — an offset in days from **Easter Sunday**, which is computed with the
  Anonymous Gregorian (Meeus) algorithm. Covers Good Friday (−2), Easter Sunday (0),
  Easter Monday (+1), Ascension (+39), Whit Sunday (+49), Whit Monday (+50),
  Corpus Christi (+60).
- **Buß- und Bettag** — the Wednesday before 23 November (Saxony only), computed.

The **maintained dataset** is therefore just two things: the list of holidays and the
**per-Bundesland applicability map** (which of the 16 states observe each holiday). These
change only when the law changes — rarely — so there is no per-year regeneration of dates.

## Applicability map — source

The state-by-state map reflects the statutory public holidays (gesetzliche Feiertage) of
each Land. Authoritative sources for the annual check:

- Bundesministerium des Innern (BMI) — Feiertage overview: https://www.bmi.bund.de/
- Each Land's Feiertagsgesetz (state holiday act) — the binding source per state.
- KMK / statistical overviews for cross-checking counts per Land.

Counts encoded (statewide, 2026): nationwide 9; Bavaria 12 (13 in Catholic municipalities via
Mariä Himmelfahrt); Baden-Württemberg 12; Saxony 11; NRW/RP/Saarland 11–12; Berlin 10;
Bremen/Hamburg/Lower Saxony/Schleswig-Holstein 10.

## Known municipal / partial exceptions (not encoded as statewide)

- **Mariä Himmelfahrt (15 Aug):** statewide in Saarland; in Bavaria only in predominantly
  Catholic municipalities.
- **Fronleichnam (Corpus Christi):** also observed in some municipalities of Saxony and
  Thuringia beyond the statewide list.
- **Augsburger Friedensfest (8 Aug):** public holiday only in the city of Augsburg.

These are flagged in `notes` on the relevant rules but are not treated as statewide.

## Annual review (put a reminder in September each year)

Because dates auto-compute, the yearly job is small — confirm the **rules and the map**, not
the dates:

1. Check each Land's Feiertagsgesetz for any changes to which holidays are observed
   (e.g. a state adding/removing a holiday, as Berlin did with Women's Day and several
   northern states did with Reformation Day).
2. Re-run the verification: `node --experimental-strip-types scripts/verify-holidays.ts`
   (checks Easter dates, movable feasts, Buß- und Bettag, and per-state counts).
3. Spot-check the upcoming year's computed dates against an official calendar.
4. If a rule changes, edit `RULES` / `states` in `src/lib/holidays.ts` and add a note.

## Why this is the moat

Any competitor can copy the UI in a weekend. To be *correct* on the day someone plans a
roster or a deadline, they must maintain the 16-state applicability map, handle the municipal
exceptions, and compute the movable feasts — every year, without drift. Content farms will
not do this; an algorithmic engine with a documented review process does it reliably.
