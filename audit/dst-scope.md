# DST scope (Phase 0.5)

Rule (from the plan): **a calculator with no date input has no DST exposure.** Only
date-accepting surfaces need IANA/timezone handling. A `DST-sicher` / `DST-safe`
badge on a surface where `dst_relevant = false` is a false claim and must be removed.

Method: enumerated every interactive calculator component and the static computed
surfaces in `src/`. `currently_claims_dst_safe` = does the page rendering this surface
show a "DST-sicher"/"DST-safe" badge or an explicit DST-safety claim.

| surface | component / page | accepts_date | dst_relevant | currently_claims_dst_safe |
|---|---|---|---|---|
| Time difference (home hero) | `TimeDiffCalc` | yes (optional start/end date) | **yes** — real elapsed differs from wall-clock across a transition | yes (homepage `DST-sicher` badge + prose) |
| Add / Subtract | `AddSubtractCalc` | yes (`datetime-local` base) | **yes** — adding days can cross a transition | no |
| Countdown builder | `CountdownCalc` | yes (target date) | **yes** — day boundaries shift at transition | homepage prose ("Countdowns … DST fehlerfrei") |
| From now | `NowBasedCalc` | implicit (now) + duration | **yes** — now + offset can cross a transition | no |
| Work hours | `WorkHoursCalc` | no (times only) | no | no |
| Pause / Ruhezeit / Nachtzuschlag | `ArbZGTool` | no (times only) | no | no |
| Gleitzeit | `GleitzeitTool` | no (hours only) | no | no |
| Weekly timesheet | `WeeklyAccumulator` + wochenarbeitszeit table | no (times per weekday) | no | no |
| Date difference / deadline | `/datum-in-x-tagen/` | yes (dates) | **yes** | no |
| Static time-range pages | `computeShiftFromHours` | no (fixed hours) | no | no |
| Static countdown pages | date diff to event | yes (event date) | **yes** (marginal) | no |

## False-claim check

No surface with `dst_relevant = false` renders a DST-safety badge. The only visible
`DST-sicher` / `DST-safe` badge is on the **homepage hero**, whose primary calculator
(time difference) **does** accept a date and returns real elapsed time across a DST
transition — so the badge is *substantiated for that surface*.

## Caveat / recommendation

- The homepage badge is a blanket site claim, while the *default* home usage (no date)
  has no DST exposure. It is defensible but imprecise. Options: (a) keep — it is true for
  the date-accepting difference/countdown calculators; (b) soften to a scoped statement
  near those calculators rather than a hero badge. **No removal is required on correctness
  grounds.**
- The homepage prose already scopes the claim correctly ("Zeitdifferenzen und Countdowns …
  berechnen Schaltjahre sowie die Sommerzeit (DST) fehlerfrei").
- **Phase-1 dependency:** the date-accepting calculators currently return only *elapsed*
  time (real ms difference, which is DST-correct). The plan's three-number model
  (0.4: `wallClock` vs `elapsed`, `crossedDST` flag) is **not yet implemented** — that is a
  Phase 1 task, and is where genuine IANA handling for date-accepting surfaces belongs.
