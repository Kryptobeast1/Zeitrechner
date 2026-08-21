// Content Variation Engine
// One deterministic hash of the slug picks a variant set, so a given page
// always renders the same copy while no two pages read identically.
// Every string is evergreen (no baked dates/years) and answer-first: the
// direct result leads, followed by one distinct information-gain nugget so
// each variant teaches something the others don't.

// Helpers shared by the German variants (decimal + industrial minutes).
const dec = (h: number) => h.toFixed(2).replace('.', ',');
const decEn = (h: number) => h.toFixed(2);
const pctDay = (h: number) => Math.round((h / 8) * 100);
const industrieMin = (h: number) => Math.round(h * 100);

// ─── TIME RANGE INTROS ──────────────────────────────────────────────────────
// (start, end) are 24h clock strings ("09:00"); hours is the gross duration.

export const timeRangeIntros_en = [
  (start: string, end: string, hours: number) =>
    `Between <strong>${start}</strong> and <strong>${end}</strong> there are exactly <strong>${hours} hours</strong>. That equals ${hours * 60} minutes or ${hours * 3600} seconds of elapsed time — the gross duration, measured before any break is deducted.`,
  (start: string, end: string, hours: number) =>
    `From ${start} to ${end} is <strong>${hours} hours</strong>. In decimal form — the format payroll and billing systems use — that is <strong>${decEn(hours)} hours</strong>, ready to multiply directly by an hourly rate.`,
  (start: string, end: string, hours: number) =>
    `The span from ${start} to ${end} lasts <strong>${hours} hours</strong>. The duration is the same whether you read the clock in 24-hour or 12-hour (AM/PM) format — to convert a PM time you simply add 12 (1 PM = 13:00).`,
  (start: string, end: string, hours: number) =>
    `${start} to ${end} is <strong>${hours} gross hours</strong>. Treated as a work shift, you subtract the unpaid break: a rest break of at least 20–30 minutes is standard — and legally required in many regions — once a shift passes 6 hours.`,
  (start: string, end: string, hours: number) =>
    `<strong>${hours} hours</strong> separate ${start} from ${end} — roughly ${pctDay(hours)}% of a standard 8-hour workday.`,
  (start: string, end: string, hours: number) =>
    `The <strong>${hours} hours</strong> between ${start} and ${end} break down into ${hours * 2} half-hour blocks or ${hours * 4} fifteen-minute slots — useful when your timesheet is tracked in quarter-hour increments.`,
  (start: string, end: string, hours: number) =>
    `From ${start} to ${end} totals <strong>${hours} hours</strong>. When a span runs past midnight the time is simply carried into the next day — for example, 22:00 to 06:00 is 8 hours, not a negative result.`,
  (start: string, end: string, hours: number) =>
    `There are <strong>${hours} hours</strong> from ${start} to ${end}. After a shift of this length many labour codes require a minimum consecutive rest period — 11 hours in the EU and UK — before the next shift may begin.`,
  (start: string, end: string, hours: number) =>
    `Exactly <strong>${hours} hours</strong> — ${hours * 60} minutes — pass between ${start} and ${end}. To-the-minute accuracy is what makes a timesheet audit-proof and keeps client invoices defensible.`,
  (start: string, end: string, hours: number) =>
    `A daily window of <strong>${hours} hours</strong> (${start}–${end}) sits near the boundary between part-time and full-time work; a regular five-day week of 35–40 hours is the usual full-time threshold.`,
  (start: string, end: string, hours: number) =>
    `Under the US Fair Labor Standards Act (FLSA), the <strong>${hours} hours</strong> from ${start} to ${end} count toward the 40-hour weekly limit — any hours above 40 in a workweek are paid at 1.5× the regular rate.`,
  (start: string, end: string, hours: number) =>
    `The <strong>${hours} hours</strong> from ${start} to ${end} equal ${decEn(hours)} decimal hours. Note that "industrial minutes" are hundredths of an hour, so 30 minutes is 50 industrial minutes (0.50 h), never 30.`,
];

export const timeRangeIntros_de = [
  (start: string, end: string, hours: number) =>
    `Zwischen <strong>${start}</strong> und <strong>${end} Uhr</strong> liegen genau <strong>${hours} Stunden</strong>. Das sind ${hours * 60} Minuten oder exakt ${hours * 3600} Sekunden – gemessen als reine Zeitspanne (Bruttozeit), also noch ohne Abzug von Pausen.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} bis ${end} Uhr vergehen <strong>${hours} Stunden</strong>. Für die Lohnabrechnung entspricht das <strong>${dec(hours)} Dezimalstunden</strong> (Industriezeit), die sich direkt mit dem Stundenlohn multiplizieren lassen.`,
  (start: string, end: string, hours: number) =>
    `Die Zeitspanne von ${start} bis ${end} Uhr beträgt <strong>${hours} Stunden</strong>. Die Dauer bleibt gleich, egal ob im 24-Stunden- oder im 12-Stunden-Format (AM/PM) abgelesen – für PM-Zeiten addiert man einfach 12 (1 PM = 13:00 Uhr).`,
  (start: string, end: string, hours: number) =>
    `${start} bis ${end} Uhr ergibt <strong>${hours} Stunden Bruttozeit</strong>. Als Arbeitsschicht ziehen Sie davon die gesetzliche Pause ab: bei mehr als 6 Stunden mindestens 30 Minuten, bei mehr als 9 Stunden 45 Minuten (§ 4 ArbZG).`,
  (start: string, end: string, hours: number) =>
    `<strong>${hours} Stunden</strong> trennen ${start} von ${end} Uhr – das entspricht rund ${pctDay(hours)}% eines klassischen 8-Stunden-Arbeitstages.`,
  (start: string, end: string, hours: number) =>
    `Die <strong>${hours} Stunden</strong> zwischen ${start} und ${end} Uhr lassen sich in ${hours * 2} halbe Stunden oder ${hours * 4} 15-Minuten-Blöcke einteilen – praktisch für die Zeiterfassung im Viertelstunden-Takt.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} bis ${end} Uhr summieren sich <strong>${hours} Stunden</strong>. Reicht eine Spanne über Mitternacht hinaus, wird die Zeit einfach in den Folgetag weitergezählt – 22:00 bis 06:00 Uhr sind zum Beispiel 8 Stunden, kein negativer Wert.`,
  (start: string, end: string, hours: number) =>
    `Zwischen ${start} und ${end} Uhr liegen <strong>${hours} Stunden</strong>. Nach einer Schicht dieser Länge schreibt § 5 ArbZG eine ununterbrochene Ruhezeit von mindestens 11 Stunden bis zum nächsten Arbeitsbeginn vor.`,
  (start: string, end: string, hours: number) =>
    `Exakt <strong>${hours} Stunden</strong> – also ${hours * 60} Minuten – vergehen zwischen ${start} und ${end} Uhr. Eine minutengenaue Erfassung ist die Grundlage für einen prüfsicheren Stundenzettel.`,
  (start: string, end: string, hours: number) =>
    `Ein tägliches Fenster von <strong>${hours} Stunden</strong> (${start}–${end} Uhr) liegt nahe der Grenze zwischen Teilzeit und Vollzeit; als Vollzeit gilt meist eine 5-Tage-Woche mit 35 bis 40 Wochenstunden.`,
  (start: string, end: string, hours: number) =>
    `Die Zeitspanne von ${start} bis ${end} Uhr beläuft sich auf <strong>${hours} Stunden</strong>. Wichtig für Gleitzeitmodelle: Nach § 3 ArbZG sind werktäglich maximal 8 Stunden erlaubt, ausnahmsweise bis zu 10 Stunden, wenn im Schnitt über 6 Monate 8 Stunden nicht überschritten werden.`,
  (start: string, end: string, hours: number) =>
    `Die <strong>${hours} Stunden</strong> von ${start} bis ${end} Uhr entsprechen ${dec(hours)} Dezimalstunden. Streng genommen sind Industrieminuten Hundertstel einer Stunde: 30 echte Minuten sind also 50 Industrieminuten (0,50 h), nicht 30.`,
];

// ─── USE CASES (chips linking to the FAQ) ────────────────────────────────────

export const useCases_en = [
  ['Payroll processing', 'Shift handover planning', 'Event duration estimates', 'Client billing accuracy'],
  ['Billable-hour tracking', 'Timesheet validation', 'Meeting scheduling', 'Overtime eligibility'],
  ['Logistics routing', 'Flight duration planning', 'Project sprint tracking', 'Study-time management'],
  ['Compliance auditing', 'Shift-work rest checks', 'Resource allocation', 'Service-SLA tracking'],
  ['Daily routine planning', 'Task time-blocking', 'Quarter-hour accuracy', 'Delivery-window tracking'],
  ['Freelance estimating', 'Flex-time tracking', 'Hourly-wage calculation', 'Invoice reconciliation'],
];

export const useCases_de = [
  ['Lohnabrechnung', 'Schichtübergabe-Planung', 'Veranstaltungsdauer', 'Kundenabrechnung'],
  ['Arbeitszeitprüfung', 'Freiberufler-Abrechnung', 'Besprechungsplanung', 'Überstundenkontrolle'],
  ['Logistik-Planung', 'Flugdauer-Berechnung', 'Projekt-Sprint-Tracking', 'Lernzeit-Management'],
  ['Compliance-Prüfung', 'Ruhezeiten-Check', 'Ressourcen-Allokation', 'Service-Level-Tracking'],
  ['Gleitzeit-Erfassung', 'Honorarsatz-Kalkulation', 'Projektzeit-Budgets', 'Stundenzettel-Abgleich'],
];

// ─── COUNTDOWN INTROS ────────────────────────────────────────────────────────
// (name, days) — days is the whole-day count from today to the event.

export const countdownIntros_en = [
  (name: string, days: number) =>
    `There are <strong>${days} days</strong> until ${name} — roughly ${Math.floor(days / 7)} weeks, or ${days * 24} hours.`,
  (name: string, days: number) =>
    `The countdown to ${name} stands at <strong>${days} days</strong>. This counts the full days from today up to the event date; today itself is not included in the total.`,
  (name: string, days: number) =>
    `${name} is <strong>${days} days away</strong>. The count accounts for leap years and daylight-saving changes, so the number of days stays exact.`,
  (name: string, days: number) =>
    `Only <strong>${days} days</strong> remain until ${name}. Divide by 7 for weeks (${Math.floor(days / 7)}) or multiply by 24 for hours (${days * 24}) to plan your preparations.`,
];

export const countdownIntros_de = [
  (name: string, days: number) =>
    `Bis ${name} sind es noch <strong>${days} Tage</strong> – das entspricht etwa ${Math.floor(days / 7)} Wochen oder ${days * 24} Stunden.`,
  (name: string, days: number) =>
    `Der Countdown bis ${name} steht bei <strong>${days} Tagen</strong>. Gezählt werden die vollen Tage ab heute bis zum Ereignistag; der heutige Tag zählt dabei nicht mit.`,
  (name: string, days: number) =>
    `${name} ist noch <strong>${days} Tage entfernt</strong>. Die Berechnung berücksichtigt Schaltjahre sowie die Sommer-/Winterzeit-Umstellung, sodass die Tageszahl stets exakt bleibt.`,
  (name: string, days: number) =>
    `Es verbleiben <strong>${days} Tage</strong> bis ${name}. Geteilt durch 7 ergeben sich rund ${Math.floor(days / 7)} Wochen, mal 24 sind es ${days * 24} Stunden Vorbereitungszeit.`,
];

// ─── UTILITY ─────────────────────────────────────────────────────────────────

// Deterministic index from slug (so the same page always gets the same variant)
export function variantIndex(slug: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

// ─── FAQ SETS — TIME RANGE PAGES ─────────────────────────────────────────────

export const faqSets_en = [
  (start: string, end: string, hours: number) => [
    {
      q: `How many minutes and seconds are between ${start} and ${end}?`,
      a: `Exactly ${hours * 60} minutes, or ${hours * 3600} seconds. This is the gross span between start and end — the raw elapsed time before any unpaid break is deducted.`
    },
    {
      q: `How do I convert ${hours} hours to decimal?`,
      a: `Use the formula decimal hours = hours + (minutes ÷ 60). ${hours} hours is ${decEn(hours)} decimal hours. Payroll systems rely on this format because it multiplies cleanly by an hourly wage, unlike hours-and-minutes.`
    },
    {
      q: `Is a ${hours}-hour day full-time or part-time?`,
      a: `It depends on the weekly total, not a single day. Full-time employment is generally 35–40 hours a week (about 7–8 hours across five days). A regular daily schedule under roughly 6 hours usually indicates part-time work.`
    },
    {
      q: `Does a break have to be deducted from ${hours} hours?`,
      a: `As a raw time span, no. As working time, most labour rules (UK Working Time Regulations, and US FLSA practice for unpaid meal breaks) require a rest break of 20–30 minutes once a shift exceeds 6 hours, and that break is not paid working time.`
    },
    {
      q: `What rest is required after a ${hours}-hour shift?`,
      a: `EU and UK rules require at least 11 consecutive hours of rest in each 24-hour period before the next shift. In the US the FLSA sets no federal minimum rest between shifts, though some states and union contracts do.`
    }
  ],
  (start: string, end: string, hours: number) => [
    {
      q: `What percentage of a workday is ${hours} hours?`,
      a: `About ${pctDay(hours)}% of a standard 8-hour workday. Framing hours as a share of the day helps with capacity planning and project budgeting.`
    },
    {
      q: `What is ${hours} hours in industrial minutes?`,
      a: `${hours} hours equals ${industrieMin(hours)} industrial minutes — hundredths of an hour — which is the same as ${decEn(hours)} decimal hours. Remember that 30 real minutes equal 50 industrial minutes, not 30.`
    },
    {
      q: `How many half-hours are in ${hours} hours?`,
      a: `Exactly ${hours * 2} half-hours, or ${hours * 4} fifteen-minute blocks. This matters when your system rounds and bills in 15- or 30-minute increments.`
    },
    {
      q: `When does a shift count as overtime?`,
      a: `Under the US FLSA, overtime applies to hours worked beyond 40 in a workweek, paid at 1.5× the regular rate. Overtime is a weekly threshold, so ${hours} hours on a single day is not automatically overtime unless the week exceeds 40 hours.`
    },
    {
      q: `Can I print or save this result?`,
      a: `Yes. Below the calculator you'll find buttons to copy the value or print it as a PDF. The print view hides navigation and shows the figures in high contrast, so it works as a simple timesheet record.`
    }
  ]
];

export const faqSets_de = [
  (start: string, end: string, hours: number) => [
    {
      q: `Wie viele Minuten und Sekunden sind ${hours} Stunden (von ${start} bis ${end} Uhr)?`,
      a: `Es sind exakt ${hours * 60} Minuten beziehungsweise ${hours * 3600} Sekunden. Das ist die Bruttozeit – die reine Spanne zwischen Start und Ende, noch ohne Abzug von Pausen.`
    },
    {
      q: `Wie rechne ich ${hours} Stunden in Dezimalstunden um?`,
      a: `Die Formel lautet: Dezimalstunden = Stunden + (Minuten ÷ 60). ${hours} Stunden entsprechen ${dec(hours)} Dezimalstunden. Die Lohnbuchhaltung nutzt diesen Wert, weil er sich – anders als das Format Stunden:Minuten – direkt mit dem Stundenlohn multiplizieren lässt.`
    },
    {
      q: `Gilt eine Zeitspanne von ${hours} Stunden als Vollzeit oder Teilzeit?`,
      a: `Das hängt von der Wochenarbeitszeit ab, nicht von einem einzelnen Tag. In Deutschland gilt eine 5-Tage-Woche mit 35 bis 40 Stunden als Vollzeit (durchschnittlich 7 bis 8 Stunden pro Tag). Eine regelmäßige Tagesarbeitszeit unter rund 6 Stunden deutet meist auf Teilzeit oder einen Minijob hin.`
    },
    {
      q: `Muss bei ${hours} Stunden eine Pause abgezogen werden?`,
      a: `Als reine Zeitspanne nein. Als Arbeitszeit gilt § 4 ArbZG: Bei mehr als 6 Stunden sind mindestens 30 Minuten, bei mehr als 9 Stunden 45 Minuten unbezahlte Pause vorgeschrieben. Die Pause muss die Arbeit unterbrechen und darf nicht an den Anfang oder das Ende gelegt werden.`
    },
    {
      q: `Welche Ruhezeit gilt nach einer Schicht von ${hours} Stunden?`,
      a: `Nach § 5 ArbZG sind mindestens 11 Stunden ununterbrochene Ruhezeit bis zum nächsten Arbeitsbeginn einzuhalten. In Bereichen wie Krankenhäusern, Gaststätten oder der Landwirtschaft ist eine Verkürzung auf 10 Stunden zulässig, sofern ein Ausgleich innerhalb von vier Wochen erfolgt.`
    }
  ],
  (start: string, end: string, hours: number) => [
    {
      q: `Wie viel Prozent eines Arbeitstages sind ${hours} Stunden?`,
      a: `Bei einer Basis von 8 Stunden entspricht das rund ${pctDay(hours)}% eines Standardarbeitstages. Diese Sichtweise hilft bei der Ressourcenplanung und der Budgetierung von Projektstunden.`
    },
    {
      q: `Was sind ${hours} Stunden in Industrieminuten?`,
      a: `${hours} Stunden entsprechen ${industrieMin(hours)} Industrieminuten – also Hundertstel einer Stunde – bzw. ${dec(hours)} Dezimalstunden. Zur Einordnung: 30 echte Minuten sind 50 Industrieminuten, nicht 30.`
    },
    {
      q: `Wie viele halbe Stunden stecken in ${hours} Stunden?`,
      a: `Es sind genau ${hours * 2} halbe Stunden bzw. ${hours * 4} Viertelstunden. Das ist relevant, wenn Ihre Zeiterfassung in 15- oder 30-Minuten-Schritten rundet und abrechnet.`
    },
    {
      q: `Gilt Arbeit zwischen 23 und 6 Uhr als Nachtarbeit?`,
      a: `Ja. Nach § 2 ArbZG ist Arbeit von mehr als 2 Stunden in der Zeit von 23:00 bis 6:00 Uhr Nachtarbeit. Dafür steht ein angemessener Zuschlag auf das Bruttoarbeitsentgelt oder eine entsprechende Zahl bezahlter freier Tage zu (§ 6 ArbZG).`
    },
    {
      q: `Kann ich das Ergebnis dieser Berechnung ausdrucken oder speichern?`,
      a: `Ja. Unter dem Ergebnis finden Sie Schaltflächen zum Kopieren oder zum Drucken als PDF. Die Druckansicht blendet Navigation und Menüs aus und stellt die Werte kontrastreich dar – so eignet sie sich als einfacher Stundenzettel-Beleg.`
    }
  ]
];

// ─── FAQ SETS — WORK HOURS (net-after-break) ─────────────────────────────────

export const workHoursFaqSets_de = [
  (start: string, end: string, netDecimal: string | number) => {
    const netVal = typeof netDecimal === 'string' ? parseFloat(netDecimal) : netDecimal;
    return [
      {
        q: `Was ist der Dezimalwert von ${start} bis ${end} Uhr mit 30 Minuten Pause?`,
        a: `Die Nettoarbeitszeit mit 30 Minuten Pause beträgt ${dec(netVal)} Dezimalstunden (${industrieMin(netVal)} Industrieminuten). Lohnabrechnungssysteme benötigen diesen Dezimalwert, weil er sich direkt mit dem Stundenlohn multiplizieren lässt und so Rundungsfehler vermeidet.`
      },
      {
        q: `Zählt die Pause zur Arbeitszeit bei dieser Arbeitszeitspanne?`,
        a: `Nein. Nach § 4 ArbZG sind Ruhepausen keine Arbeitszeit. Bei einer Gesamtanwesenheit von mehr als 6 Stunden müssen mindestens 30 Minuten Pause genommen und abgezogen werden; ab mehr als 9 Stunden sind es 45 Minuten. Die Pause muss die Arbeitszeit unterbrechen und darf nicht an Anfang oder Ende liegen.`
      },
      {
        q: `Wie berechne ich Überstunden bei einer Schicht von ${start} bis ${end} Uhr?`,
        a: (() => {
          const net = dec(netVal);
          const diff = dec(Math.abs(netVal - 8));
          const base = `Vergleichen Sie Ihre Nettoarbeitszeit (${net} Stunden nach Abzug der Pause) mit Ihrer vertraglichen täglichen Arbeitszeit von beispielsweise 8 Stunden. `;
          if (netVal > 8) return base + `Bei ${net} Stunden Nettoarbeitszeit leisten Sie ${diff} Stunden Mehrarbeit (Überstunden).`;
          if (netVal < 8) return base + `Bei ${net} Stunden Nettoarbeitszeit liegen Sie ${diff} Stunden unter einem 8-Stunden-Tag – es fallen keine Überstunden an.`;
          return base + `Bei ${net} Stunden Nettoarbeitszeit entspricht dies exakt einem regulären 8-Stunden-Tag ohne Überstunden.`;
        })()
      },
      {
        q: `Gilt diese Nettoarbeitszeit als Vollzeit oder Teilzeit?`,
        a: `Eine regelmäßige Nettoarbeitszeit von ${dec(netVal)} Stunden pro Tag ergibt bei einer 5-Tage-Woche rund ${Math.round(netVal * 5)} Wochenstunden und liegt damit im Vollzeitbereich (35 bis 40 Stunden). Arbeitszeiten unter etwa 6 Stunden pro Tag werden meist als Teilzeit oder Minijob eingestuft.`
      },
      {
        q: `Wie erfasse ich diese Zeit korrekt im Stundenzettel?`,
        a: `Tragen Sie ${start} Uhr als Beginn und ${end} Uhr als Ende ein und vermerken Sie die 30-minütige Pflichtpause separat. Die Nettoarbeitszeit beträgt somit ${dec(netVal)} Stunden. Mit unserem Arbeitsstunden-Rechner ermitteln Sie die Nettozeit auch für andere Pausen (45 oder 60 Minuten) exakt.`
      }
    ];
  },
  // Variant 2 — different questions/angles so the merged work-hours FAQ is not identical across pages
  (start: string, end: string, netDecimal: string | number) => {
    const netVal = typeof netDecimal === 'string' ? parseFloat(netDecimal) : netDecimal;
    const net45 = Math.max(0, netVal - 0.25);
    const net60 = Math.max(0, netVal - 0.5);
    return [
      {
        q: `Wie viel Nettoarbeitszeit bleibt von ${start} bis ${end} Uhr bei 45 oder 60 Minuten Pause?`,
        a: `Bei 45 Minuten Pause bleiben ${dec(net45)} Dezimalstunden, bei 60 Minuten Pause ${dec(net60)} Dezimalstunden. Zum Vergleich: Mit der Mindestpause von 30 Minuten sind es ${dec(netVal)} Stunden. Je länger die Pause, desto geringer die bezahlte Nettozeit.`
      },
      {
        q: `Wie rechne ich diese Nettozeit in Industrieminuten um?`,
        a: `${dec(netVal)} Dezimalstunden entsprechen ${industrieMin(netVal)} Industrieminuten (Hundertstel einer Stunde). 30 echte Minuten sind dabei 50 Industrieminuten. Viele Zeiterfassungssysteme und Excel-Vorlagen rechnen intern mit diesem Format.`
      },
      {
        q: `Muss ich bei ${start} bis ${end} Uhr eine Pause machen, auch wenn ich durcharbeiten möchte?`,
        a: `Sofern die Arbeitszeit 6 Stunden überschreitet, ja. Die Ruhepause nach § 4 ArbZG ist Pflicht und dient dem Gesundheitsschutz – auf sie kann nicht freiwillig verzichtet werden, und der Arbeitgeber muss ihre Einhaltung überwachen.`
      },
      {
        q: `Welche Ruhezeit gilt nach dieser Schicht bis zum nächsten Arbeitsbeginn?`,
        a: `Nach § 5 ArbZG müssen zwischen dem Arbeitsende um ${end} Uhr und dem nächsten Arbeitsbeginn mindestens 11 Stunden ununterbrochene Ruhezeit liegen. In einzelnen Branchen (z. B. Krankenhaus, Gastronomie) ist eine Verkürzung auf 10 Stunden mit Ausgleich zulässig.`
      },
      {
        q: `Wie viel verdiene ich brutto für diese Schicht?`,
        a: `Multiplizieren Sie die Nettoarbeitszeit mit Ihrem Stundenlohn: ${dec(netVal)} Stunden × Stundenlohn ergibt den Bruttoverdienst. Bei 15 € Stundenlohn wären das ${(netVal * 15).toFixed(2).replace('.', ',')} €, bei 20 € entsprechend ${(netVal * 20).toFixed(2).replace('.', ',')} €.`
      }
    ];
  }
];

export const workHoursFaqSets_en = [
  (start: string, end: string, netDecimal: string | number) => {
    const netVal = typeof netDecimal === 'string' ? parseFloat(netDecimal) : netDecimal;
    return [
      {
        q: `What is the decimal value of work from ${start} to ${end} with a 30-minute break?`,
        a: `Your net work time with a 30-minute break deducted is ${decEn(netVal)} decimal hours (${industrieMin(netVal)} industrial minutes). Payroll needs decimal format — e.g. 7.50 rather than 7h 30m — so it multiplies cleanly by your hourly pay rate without rounding errors.`
      },
      {
        q: `Does the break count as working time for this shift?`,
        a: `No. Under standard labour rules — the UK Working Time Regulations, and US FLSA practice for unpaid meal breaks — a rest break of 20–30 minutes or more is unpaid and does not count toward active working hours. It must be subtracted from total attendance time.`
      },
      {
        q: `How do I calculate overtime for a shift from ${start} to ${end}?`,
        a: (() => {
          const net = decEn(netVal);
          const diff = decEn(Math.abs(netVal - 8));
          const base = `Compare your net work hours (${net} hours after the break) against your contracted daily hours, e.g. a standard 8-hour day. `;
          if (netVal > 8) return base + `Working ${net} net hours means ${diff} hours over a standard day; under the FLSA, weekly overtime applies once the week passes 40 hours.`;
          if (netVal < 8) return base + `Working ${net} net hours leaves you ${diff} hours short of a standard 8-hour day, so no daily overtime applies.`;
          return base + `Working ${net} net hours is exactly a standard 8-hour day.`;
        })()
      },
      {
        q: `Are the hours between ${start} and ${end} full-time or part-time?`,
        a: `A daily shift of ${decEn(netVal)} net hours is typically full-time on a regular five-day schedule — about ${Math.round(netVal * 5)} hours a week, within the usual 35–40 hour full-time range. Regular days under roughly 6 hours are generally classed as part-time.`
      },
      {
        q: `How do I record this shift on my timesheet?`,
        a: `Log the start at ${start} and the end at ${end}, listing the 30-minute break separately. That yields ${decEn(netVal)} net hours. Use our Work Hours Calculator to adjust start, end and break lengths (45 or 60 minutes) and get the exact decimal total.`
      }
    ];
  },
  // Variant 2 — different questions/angles so the merged work-hours FAQ is not identical across pages
  (start: string, end: string, netDecimal: string | number) => {
    const netVal = typeof netDecimal === 'string' ? parseFloat(netDecimal) : netDecimal;
    const net45 = Math.max(0, netVal - 0.25);
    const net60 = Math.max(0, netVal - 0.5);
    return [
      {
        q: `How much net time is left from ${start} to ${end} with a 45- or 60-minute break?`,
        a: `With a 45-minute break you keep ${decEn(net45)} decimal hours; with a 60-minute break, ${decEn(net60)} decimal hours. For comparison, a 30-minute break leaves ${decEn(netVal)} hours. The longer the break, the lower the paid net time.`
      },
      {
        q: `How do I convert this net time into industrial minutes?`,
        a: `${decEn(netVal)} decimal hours equals ${industrieMin(netVal)} industrial minutes (hundredths of an hour); 30 real minutes are 50 industrial minutes. Many time-tracking systems and spreadsheet templates work in this format internally.`
      },
      {
        q: `Do I have to take a break from ${start} to ${end} even if I want to work straight through?`,
        a: `If the shift exceeds 6 hours, yes. In most jurisdictions an unpaid rest break of 20–30 minutes is mandatory for a shift over 6 hours (e.g. the UK Working Time Regulations), and it cannot be waived to finish earlier.`
      },
      {
        q: `What rest is required after this shift before the next one?`,
        a: `EU and UK rules require at least 11 consecutive hours of rest between the end at ${end} and the next shift. In the US the FLSA sets no federal minimum, though some states and union contracts do.`
      },
      {
        q: `How much do I earn gross for this shift?`,
        a: `Multiply the net hours by your hourly rate: ${decEn(netVal)} hours × rate = gross pay. At $15/hour that is $${(netVal * 15).toFixed(2)}, and at $20/hour, $${(netVal * 20).toFixed(2)}.`
      }
    ];
  }
];

// ─── CONTEXT CLUSTER — shift-specific legal & practical context ───────────────
// Rendered on every time-range page, so each URL carries genuinely unique,
// entity-rich context tied to the actual start time and shift length.

export function getContextClusterDE(start: number, end: number, hours: number): string {
  if (hours >= 4 && hours <= 6) {
    return `Ein tägliches Arbeitszeitfenster von ${hours} Stunden fällt typischerweise in den Bereich der Teilzeitbeschäftigung. Für viele Beschäftigte in Deutschland – etwa im Rahmen von Minijobs oder Gleitzeit-Teilzeitverträgen – ist dies die vertraglich geregelte tägliche Arbeitszeit. Es gelten dieselben Bestimmungen des Arbeitszeitgesetzes (ArbZG) zu Mindestlohn und anteiligem Urlaubsanspruch wie in Vollzeit. Beträgt die Arbeitszeit genau 6 Stunden, ist noch keine Ruhepause vorgeschrieben; erst bei einer Überschreitung von 6 Stunden muss eine 30-minütige Pause eingelegt werden (§ 4 ArbZG).`;
  }
  if ((start >= 5 && start <= 7.5) && (hours >= 6 && hours <= 9)) {
    return `Diese Zeitspanne entspricht einer klassischen Frühschicht, wie sie in Industrie, Logistik, Handwerk und Gesundheitswesen üblich ist. Frühschichten erfordern eine präzise Taktung und haben besondere Rahmenbedingungen: Beginnt die Schicht vor 6:00 Uhr, kann der Teil davor als Nachtarbeit gelten und Schichtzuschläge auslösen. Nach der Schicht ist die ununterbrochene Ruhezeit von mindestens 11 Stunden gemäß § 5 ArbZG einzuhalten, bevor der nächste Einsatz beginnen darf – in einzelnen Branchen auf 10 Stunden verkürzbar, wenn ein Ausgleich innerhalb von vier Wochen erfolgt.`;
  }
  if ((start >= 8 && start <= 9.5) && (hours >= 7 && hours <= 9.5)) {
    return `Dieser Zeitraum repräsentiert die klassische Normal- oder Büroarbeitszeit in Deutschland. Eine 5-Tage-Woche mit 38,5 bis 40 Wochenstunden baut meist auf diesem Tagesrhythmus auf (z. B. 8:00 bis 17:00 Uhr). In Gleitzeitmodellen lassen sich Beginn und Ende flexibel gestalten. Da die Anwesenheit über 6 Stunden liegt, ist nach § 4 ArbZG eine Ruhepause von mindestens 30 Minuten abzuziehen, um die rechtssichere Nettoarbeitszeit zu ermitteln. Die werktägliche Höchstarbeitszeit von 8 Stunden (bis 10 Stunden mit Ausgleich) nach § 3 ArbZG bleibt dabei zu beachten.`;
  }
  if ((start >= 13 && start <= 15.5) && (hours >= 6 && hours <= 9)) {
    return `Diese Arbeitszeit fällt in den Bereich der Spätschicht, häufig im Einzelhandel, in der Gastronomie, im Kundenservice oder im medizinischen Bereich. Da Spätschichten oft bis in die späten Abendstunden reichen, sind sie mit logistischen Fragen wie der Anbindung an den öffentlichen Nahverkehr verbunden. Gesetzlich gilt: Bei mehr als 6 Stunden ist eine Pause von 30 Minuten, bei mehr als 9 Stunden von 45 Minuten einzuplanen und vom Stundenzettel abzuziehen (§ 4 ArbZG).`;
  }
  const crossesMidnight = end < start;
  if (crossesMidnight || (start >= 20 || start < 5)) {
    return `Diese Konstellation umfasst eine klassische Nachtschicht. Nachtarbeit im Sinne des § 2 ArbZG ist Arbeit von mehr als 2 Stunden in der Zeit von 23:00 bis 6:00 Uhr. Sie begründet Anspruch auf einen angemessenen Zuschlag auf das Bruttoarbeitsentgelt oder eine entsprechende Zahl bezahlter freier Tage (§ 6 ArbZG). Wegen der erhöhten Belastung sieht das Gesetz besondere Schutzrechte für Nachtarbeitnehmer vor – darunter regelmäßige arbeitsmedizinische Untersuchungen und die Begrenzung der werktäglichen Arbeitszeit auf 8 Stunden (im Durchschnitt).`;
  }
  return `Die genaue Erfassung dieses Zeitraums von ${hours} Stunden ist für eine transparente Zeitwirtschaft unerlässlich. Ob flexibles Arbeitszeitmodell, Projektzeitbudget oder private Planung – die exakte Berechnung von Stunden und Minuten sorgt für Nachvollziehbarkeit. Beachten Sie bei der Aufzeichnung im Stundenzettel stets die Vorgaben zu Pausen (§ 4 ArbZG) und zur Mindestruhezeit von 11 Stunden (§ 5 ArbZG).`;
}

export function getContextClusterEN(start: number, end: number, hours: number): string {
  if (hours >= 4 && hours <= 6) {
    return `A daily work window of ${hours} hours is typical for part-time roles, flexible schedules or student internships. Under standard labour guidelines — the UK Working Time Regulations or the US FLSA — part-time employees are entitled to proportional benefits and minimum-wage protection. Note that once a shift exceeds 6 hours, UK rules require a 20-minute rest break; a shift of exactly 6 hours does not yet trigger it. Logging these hours accurately prevents compliance issues and ensures correct pay.`;
  }
  if ((start >= 5 && start <= 7.5) && (hours >= 6 && hours <= 9)) {
    return `This span covers a standard early-morning shift, common in manufacturing, logistics, healthcare and construction. Early shifts need precise coordination and carry specific rules: in many jurisdictions work starting before 6:00 AM qualifies for a night-shift premium. After the shift, a minimum consecutive rest period — 11 hours in the EU and UK — must be observed before the next shift begins. Accurate start-and-end logging keeps the record defensible.`;
  }
  if ((start >= 8 && start <= 9.5) && (hours >= 7 && hours <= 9.5)) {
    return `This period is the classic 9-to-5 office pattern used across corporate, financial and administrative sectors, and the basis of a standard 40-hour week. With flex-time policies, employees can shift their exact start and end. Because the shift exceeds 6 hours, labour rules require deducting a rest break (typically 30 minutes) from elapsed time to reach net work hours for payroll. Under the FLSA, remember that overtime is a weekly threshold — hours beyond 40 in a week, not beyond 8 in a day.`;
  }
  if ((start >= 13 && start <= 15.5) && (hours >= 6 && hours <= 9)) {
    return `This duration aligns with a typical afternoon or late shift, standard in retail, hospitality, customer support and healthcare. Late shifts often run into the evening, so break scheduling and transport need planning. Under standard regulations, a rest break of at least 20–30 minutes must be allocated and recorded for any shift exceeding 6 hours, and that break is unpaid.`;
  }
  const crossesMidnight = end < start;
  if (crossesMidnight || (start >= 20 || start < 5)) {
    return `This pattern covers night or overnight work. Under most labour standards — the US FLSA or the UK Working Time Regulations — hours worked between roughly 11:00 PM and 6:00 AM can trigger night-shift differentials, premium pay or compensatory rest. Because overnight work carries health impacts, regulations mandate strict compliance with maximum shift lengths and, in the EU/UK, free health assessments for regular night workers.`;
  }
  return `Accurately tracking this ${hours}-hour duration is essential for billing clients, validating timesheets and scheduling project resources. Whether you run flexible flextime or bill hourly consulting work, an automated calculator removes rounding errors. Always subtract unpaid rest breaks to stay compliant with local labour rules.`;
}
