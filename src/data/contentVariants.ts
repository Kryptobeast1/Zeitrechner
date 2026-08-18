// Content Variation Engine
// Ensures no two pages are structurally identical
// Uses a deterministic hash of the slug to pick variation sets

export interface ContentVariant {
  intro: string;
  explanation: string;
  contextBlock: string;
  useCaseTitle: string;
  useCases: string[];
  callToAction: string;
}

/**
 * Categorizes a duration to provide more relevant context.
 */
function getDurationCategory(hours: number): 'micro' | 'short' | 'half' | 'full' | 'long' | 'over' {
  if (hours <= 0.5) return 'micro';
  if (hours <= 3) return 'short';
  if (hours <= 5) return 'half';
  if (hours <= 8.5) return 'full';
  if (hours <= 12) return 'long';
  return 'over';
}

// ─── TIME RANGE VARIANTS ────────────────────────────────────────────────────

export const timeRangeIntros_en = [
  (start: string, end: string, hours: number) =>
    `There are exactly <strong>${hours} hours</strong> between ${start} and ${end}. This duration is a common interval used in both professional scheduling and daily planning.`,
  (start: string, end: string, hours: number) =>
    `The time span from ${start} to ${end} covers <strong>${hours} hours</strong> — which is equivalent to ${hours * 60} minutes or exactly ${hours * 3600} seconds.`,
  (start: string, end: string, hours: number) =>
    `Calculating the hours between ${start} and ${end} results in <strong>${hours} hours</strong>. Tracking these precise intervals is key for accurate timesheets and project management.`,
  (start: string, end: string, hours: number) =>
    `From ${start} to ${end} totals <strong>${hours} hours</strong>. For many, this represents ${Math.floor(hours / 8) >= 1 ? `${Math.floor(hours / 8)} full workday(s)` : 'a significant portion of a standard workday'}.`,
  (start: string, end: string, hours: number) =>
    `The exact difference between ${start} and ${end} is <strong>${hours} hours</strong>. In decimal format, this is recorded as ${hours.toFixed(2)} hours for payroll purposes.`,
  (start: string, end: string, hours: number) =>
    `<strong>${hours} hours</strong> separate ${start} from ${end}. This time block can be divided into ${hours * 2} thirty-minute sessions or ${hours * 4} fifteen-minute sprints.`,
  (start: string, end: string, hours: number) =>
    `Between the timestamps of ${start} and ${end}, a total of <strong>${hours} hours</strong> elapse. Accuracy in these calculations ensures fair billing and efficient time use.`,
  (start: string, end: string, hours: number) =>
    `A period starting at ${start} and ending at ${end} lasts <strong>${hours} hours</strong>. This data point is essential for logistics, shift handovers, and personal time-tracking.`,
  (start: string, end: string, hours: number) =>
    `The duration from ${start} until ${end} is measured at <strong>${hours} hours</strong>. Understanding this gap helps in managing expectations and optimizing daily workflows.`,
  (start: string, end: string, hours: number) =>
    `A span of <strong>${hours} hours</strong> occurs between ${start} and ${end}. Whether it's for a flight, a shift, or a meeting, knowing the exact duration is vital.`,
  // Phase 3 Additions
  (start: string, end: string, hours: number) =>
    `From a start time of ${start} to ${end}, you have a total of <strong>${hours} hours</strong>. This window is often the foundation for standard operating procedures in many business environments.`,
  (start: string, end: string, hours: number) =>
    `The delta between ${start} and ${end} is <strong>${hours} hours</strong>. Precision down to the minute is required when these intervals are used for payroll or billing compliance.`,
  (start: string, end: string, hours: number) =>
    `A total of <strong>${hours} hours</strong> pass between ${start} and ${end}. In today's flex-time world, these specific intervals are increasingly common for shift-based employees.`,
  (start: string, end: string, hours: number) =>
    `From the start point of ${start} to the conclusion at ${end}, the duration is exactly <strong>${hours} hours</strong>. This measurable gap is a fundamental building block for many logistics and time-sensitive operations.`,
  (start: string, end: string, hours: number) =>
    `Exactly <strong>${hours} hours</strong> are contained within the span of ${start} to ${end}. Accurate calculation of these periods is a critical step for maintaining correct digital logs and historical data.`,
  (start: string, end: string, hours: number) =>
    `Spanning from ${start} until ${end}, we find a period of <strong>${hours} hours</strong>. Such precise time-tracking is often mandated by specific industry standards and quality control protocols.`,
];

export const timeRangeIntros_de = [
  (start: string, end: string, hours: number) =>
    `Zwischen ${start} und ${end} Uhr liegen genau <strong>${hours} Stunden</strong>. Das entspricht ${hours * 60} Minuten oder exakt ${hours * 3600} Sekunden.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} bis ${end} Uhr beträgt der Zeitunterschied <strong>${hours} Stunden</strong> – eine wichtige Kennzahl für die tägliche Zeitplanung und Arbeitszeiterfassung.`,
  (start: string, end: string, hours: number) =>
    `Die Zeitspanne von ${start} bis ${end} Uhr umfasst <strong>${hours} Stunden</strong>. Ob für das Zeit-Management oder die Lohnabrechnung – dieses Intervall ist alltagsrelevant.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} Uhr bis ${end} Uhr vergehen <strong>${hours} Stunden</strong>. In Dezimalform ausgedrückt sind dies ${hours.toFixed(2).replace('.', ',')} Stunden.`,
  (start: string, end: string, hours: number) =>
    `<strong>${hours} Stunden</strong> – so groß ist die Zeitspanne zwischen ${start} und ${end} Uhr. Dies entspricht ${hours * 60} Minuten reiner Zeitdauer.`,
  (start: string, end: string, hours: number) =>
    `Die Zeitdifferenz zwischen ${start} und ${end} beträgt <strong>${hours} Stunden</strong>. In vielen Branchen ist dies ein standardmäßiges Abrechnungsintervall.`,
  (start: string, end: string, hours: number) =>
    `Vom Zeitpunkt ${start} bis zum Ende um ${end} zählen wir <strong>${hours} Stunden</strong>. Präzision bei dieser Berechnung verhindert Fehler in der Dokumentation.`,
  (start: string, end: string, hours: number) =>
    `Zwischen ${start} und ${end} Uhr liegen <strong>${hours} Stunden</strong>. Das entspricht ${Math.floor(hours / 0.5)} halbstündigen Zeitblöcken.`,
  (start: string, end: string, hours: number) =>
    `Ein Zeitraum von ${start} bis ${end} Uhr summiert sich auf <strong>${hours} Stunden</strong>. Perfekt für die Planung von Dienstplänen und Meetings.`,
  (start: string, end: string, hours: number) =>
    `Es sind exakt <strong>${hours} Stunden</strong> von ${start} bis ${end} Uhr. Diese Zeitspanne ist oft entscheidend für die Einhaltung von Ruhezeiten.`,
  // Phase 3 Additions
  (start: string, end: string, hours: number) =>
    `Die Zeitspanne von ${start} bis ${end} Uhr ergibt exakt <strong>${hours} Stunden</strong>. Für Gleitzeitmodelle ist die korrekte Erfassung solcher Zeitfenster unerlässlich.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} bis ${end} Uhr verstreichen insgesamt <strong>${hours} Stunden</strong>. Diese Berechnung hilft Ihnen dabei, den Überblick über Ihre Tageskapazität zu behalten.`,
  (start: string, end: string, hours: number) =>
    `Zwischen dem Beginn um ${start} und dem Ende um ${end} Uhr liegen exakt <strong>${hours} Stunden</strong>. In der modernen Arbeitswelt ist die minutengenaue Erfassung solcher Intervalle für die Fairness am Arbeitsplatz zentral.`,
  (start: string, end: string, hours: number) =>
    `Die Zeitspanne von ${start} bis ${end} Uhr beläuft sich auf <strong>${hours} Stunden</strong>. Ob für Projektphasen oder Dienstübergaben – die genaue Kenntnis dieser Dauer optimiert jeden Prozess.`,
  (start: string, end: string, hours: number) =>
    `Vom Startzeitpunkt ${start} bis zum Ziel um ${end} Uhr messen wir <strong>${hours} Stunden</strong>. Dieser Wert ist ein verlässlicher Ankerpunkt für Ihre persönliche Zeitplanung und Dokumentation.`,
];

export const contextBlocks_en = [
  (hours: number) => {
    const cat = getDurationCategory(hours);
    const textMap: Record<string, string> = {
      micro: `A ${hours}-hour interval is extremely brief, often used for tasks like short breaks, system reboots, or quick transitions.`,
      short: `A span of ${hours} hours is ideal for deep-focus sprints or focused meetings. Productivity techniques like Pomodoro work well within this timeframe.`,
      half: `With ${hours} hours, you have a solid half-day block. This is often the time between a start and a lunch break, or a mid-day to afternoon shift.`,
      full: `A ${hours}-hour window represents a standard full-time shift. In many countries, ${hours} hours is the maximum allowed before a mandatory rest period.`,
      long: `At ${hours} hours, this is a long-duration shift. Proper break management is crucial here to maintain focus and safety.`,
      over: `A duration of ${hours} hours is an extended period, often spanning multiple days or involving overtime. Large-scale logistics and travel often use these blocks.`
    };
    return textMap[cat] + ` For professional use, this represents ${Math.round((hours / 8) * 100)}% of a standard 8-hour workday. Accurate time math here ensures fair pay and efficient resource allocation.`;
  },
  (hours: number) =>
    `In payroll and billing systems, ${hours}-hour blocks are basic units of measure. Whether you are a consultant invoicing a client or a manager approving a timesheet, precise decimal conversions (like ${hours.toFixed(2)}) are necessary for audit-trailed accounting.`,
  (hours: number) =>
    `From a project management view, ${hours} hours provides ${hours >= 4 ? 'substantial time for complex deliverables' : 'a window for tactical execution'}. Using ${hours} hours effectively requires setting clear milestones to avoid Parkinson's Law (work expanding to fill the time).`,
  (hours: number) =>
    `Safety and compliance standards often center on ${hours}-hour durations. Driving limits, pilot rest requirements, and industrial safety protocols all rely on the exact delta between ${hours} or more hours. Accuracy saves more than just money — it saves lives.`,
  (hours: number) =>
    `Modern productivity frameworks often partition the day into ${hours}-hour "buckets" for better task management. If you allot ${hours} hours to a specific goal, tracking the start and end precisely helps you measure your velocity over time.`,
  // Phase 3 Additions
  (hours: number) =>
    `Half-hour accuracy in a ${hours}-hour window is the new standard for modern workplaces. As work becomes more flexible, the ability to calculate ${hours} hours instantly across different start and end times is a key productivity booster.`,
  (hours: number) =>
    `When calculating a span of ${hours} hours, it's important to consider "hidden" time sinks. Even in a ${hours}-hour period, small interruptions can add up, making exact start-to-finish tracking essential for true awareness of your time.`,
];

export const contextBlocks_de = [
  (hours: number) => {
    const cat = getDurationCategory(hours);
    const textMap: Record<string, string> = {
      micro: `Ein Intervall von ${hours} Stunden ist sehr kurz und wird oft für kurze Pausen, Systemneustarts oder schnelle Übergaben genutzt.`,
      short: `Eine Zeitspanne von ${hours} Stunden eignet sich hervorragend für konzentrierte Sprints oder produktive Besprechungen.`,
      half: `Mit ${hours} Stunden haben Sie einen soliden halbtägigen Arbeitsblock. Dies entspricht oft der Zeit bis zur Mittagspause.`,
      full: `Ein ${hours}-Stunden-Fenster repräsentiert eine klassische Ganztagsschicht. In vielen Ländern ist dies die Grenze vor einer längeren Ruhepause.`,
      long: `Bei ${hours} Stunden handelt es sich um eine Langschicht. Hier ist ein gutes Pausenmanagement entscheidend für die Sicherheit.`,
      over: `Eine Dauer von ${hours} Stunden ist ein ausgedehnter Zeitraum, der oft Überstunden oder mehrtägige Einsätze umfasst.`
    };
    return textMap[cat] + ` Fachlich gesehen entspricht dies ${Math.round((hours / 8) * 100)}% eines Standard-8-Stunden-Arbeitstages. Präzise Zeitrechnung sichert faire Bezahlung.`;
  },
  (hours: number) =>
    `In der Lohnabrechnung sind ${hours}-Stunden-Einheiten das Fundament der Kalkulation. Ob Freiberufler mit Stundensatz oder Angestellter mit Zeiterfassungsbogen – die Umrechnung in Dezimalstunden (hier: ${hours.toFixed(2).replace('.', ',')}) ist Standard.`,
  (hours: number) =>
    `Aus Sicht des Projektmanagements bieten ${hours} Stunden ${hours >= 4 ? 'viel Raum für komplexe Aufgaben' : 'ein Fenster für operative Aufgaben'}. Eine klare Strukturierung dieses ${hours}-Stunden-Blocks verhindert Zeitverluste.`,
  (hours: number) =>
    `Compliance-Regeln und gesetzliche Ruhezeiten basieren oft auf exakten ${hours}-Stunden-Vorgaben. Die Einhaltung dieser Grenzen ist für Arbeitgeber und Arbeitnehmer gleichermaßen wichtig.`,
  // Phase 3 Additions
  (hours: number) =>
    `Die Genauigkeit auf die halbe Stunde genau ist bei einem ${hours}-Stunden-FENSTER heute die Norm. Flexible Arbeitszeiten erfordern Tools, die ${hours} Stunden schnell und fehlerfrei über verschiedene Start- und Endzeiten hinweg berechnen.`,
];

export const useCases_en = [
  ['Payroll processing', 'Shift turnover planning', 'Event duration estimation', 'Client billing accuracy'],
  ['Tracking billable hours', 'Timesheet validation', 'Meeting scheduling', 'Overtime eligibility check'],
  ['Logistics routing', 'Flight duration planning', 'Project sprint tracking', 'Study time management'],
  ['Compliance auditing', 'Shift-work safety check', 'Resource allocation', 'Service SLA tracking'],
  ['Daily routine planning', 'Task partitioning', 'Time-blocking accuracy', 'Delivery window tracking'],
  ['Freelance project estimation', 'Flex-time tracking', 'Hourly wage calculation', 'Billable time auditing'],
];

export const useCases_de = [
  ['Lohnabrechnung', 'Schichtübergabe-Planung', 'Veranstaltungsdauer', 'Kundenabrechnung'],
  ['Arbeitszeitprüfung', 'Freiberufler-Abrechnung', 'Besprechungsplanung', 'Überstundenkontrolle'],
  ['Logistik-Planung', 'Flugdauer-Berechnung', 'Projekt-Sprint-Tracking', 'Lernzeit-Management'],
  ['Compliance-Prüfung', 'Arbeitsschutz-Check', 'Ressourcen-Allokation', 'Service-Level-Tracking'],
  ['Gleitzeit-Erfassung', 'Kalkulation von Honorarsätzen', 'Projektzeit-Budgets', 'Stundenzettel-Abgleich'],
];

// ─── WORK HOURS VARIANTS ─────────────────────────────────────────────────────

export const workHoursIntros_en = [
  (start: string, end: string, net: number) =>
    `Working from <strong>${start} to ${end}</strong> results in <strong>${net} hours</strong> of net billable work time. Our calculator automatically handles mandatory break deductions, ensuring your timesheet complies with standard labor regulations.`,
  (start: string, end: string, net: number) =>
    `A total of <strong>${net} productive hours</strong> are earned between ${start} and ${end}. By subtracting statutory rest periods, this result provides an audit-proof decimal figure ready for HR and payroll processing.`,
  (start: string, end: string, net: number) =>
    `Your net working time from ${start} until ${end} equals exactly <strong>${net} hours</strong>. Maintaining to-the-minute precision in this calculation helps you avoid FLSA overtime disputes and ensures fair compensation.`,
];

export const workHoursIntros_de = [
  (start: string, end: string, net: number) =>
    `Die Arbeitsschicht von <strong>${start} bis ${end} Uhr</strong> ergibt exakt <strong>${net} Stunden</strong> Nettoabrechnungszeit. Gesetzliche Pausenabzüge gemäß Arbeitszeitgesetz (ArbZG) lassen sich hierbei direkt berücksichtigen.`,
  (start: string, end: string, net: number) =>
    `Zwischen ${start} und ${end} Uhr erreichen Sie <strong>${net} fakturierbare Stunden</strong> – nach Abzug der vorgeschriebenen Ruhepausen. Dieser manipulationssichere Wert ist ideal für Ihren Stundenzettel.`,
  (start: string, end: string, net: number) =>
    `Ihre Netto-Arbeitszeit von ${start} bis ${end} Uhr beträgt exakt <strong>${net} Industriestunden (Dezimal)</strong>. Diese Genauigkeit ist essenziell für die Lohnbuchhaltung und schützt vor Compliance-Verstößen.`,
];

// ─── COUNTDOWN VARIANTS ──────────────────────────────────────────────────────

export const countdownIntros_en = [
  (name: string, days: number) =>
    `There are <strong>${days} days</strong> remaining until ${name}. That represents approximately ${Math.floor(days / 7)} weeks of anticipation.`,
  (name: string, days: number) =>
    `The countdown for ${name} is currently at <strong>${days} days</strong>. In terms of hours, that is ${days * 24} hours until the event begins.`,
  (name: string, days: number) =>
    `${name} is exactly <strong>${days} days away</strong>. Track the time to ensure your preparations are finished before the deadline.`,
];

export const countdownIntros_de = [
  (name: string, days: number) =>
    `Es verbleiben noch <strong>${days} Tage</strong> bis ${name}. Das entspricht in etwa ${Math.floor(days / 7)} Wochen voller Vorfreude.`,
  (name: string, days: number) =>
    `Der Countdown für ${name} steht aktuell bei <strong>${days} Tagen</strong>. Umgerechnet sind dies ${days * 24} Stunden bis zum Ereignis.`,
  (name: string, days: number) =>
    `${name} ist noch genau <strong>${days} Tage entfernt</strong>. Behalten Sie die Zeit im Auge, um optimal vorbereitet zu sein.`,
];

// ─── UTILITY ─────────────────────────────────────────────────────────────────

// Deterministic index from slug (so same page always gets same variant)
export function variantIndex(slug: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

// FAQ sets for time range pages (Stunden)
export const faqSets_en = [
  (start: string, end: string, hours: number) => [
    {
      q: `How many minutes and seconds are between ${start} and ${end}?`,
      a: `Exactly ${hours * 60} minutes or ${hours * 3600} seconds elapse during a ${hours}-hour time block. This high-precision calculation is critical for shift logging, airline schedules, and server synchronization across international network configurations.`
    },
    {
      q: `Is a ${hours}-hour shift considered full-time or part-time work?`,
      a: `A daily duration of ${hours} hours can represent either full-time or part-time work depending on your weekly contract. Typically, full-time employment ranges from 35 to 40 hours per week (averaging 7 to 8 hours daily). Daily shifts shorter than 6 hours are generally classified as part-time.`
    },
    {
      q: `How do I calculate overtime for a ${hours}-hour duration?`,
      a: `Overtime is determined by comparing your actual working hours against your contract. If your contract defines a standard 8-hour workday, working ${hours} hours results in ${hours > 8 ? (hours - 8).toFixed(2) : 0} hours of potential overtime. Remember that unpaid rest breaks must be deducted to find your true working hours.`
    },
    {
      q: `Does a break count as working time during a ${hours}-hour shift?`,
      a: `No, standard labor regulations (such as the UK Working Time Regulations or US FLSA) state that rest breaks do not count as paid working hours. If your shift exceeds 6 hours, a minimum rest break of 20 to 30 minutes is legally required and must be subtracted from the total elapsed hours.`
    },
    {
      q: `How should I log ${hours} hours on my timesheet?`,
      a: `Record your starting time at ${start} and your ending time at ${end}. If you took any breaks during this time, enter them separately to calculate your net decimal hours. Use our online Time Calculator to automate the conversion of hours and minutes for billing.`
    }
  ],
  (start: string, end: string, hours: number) => [
    {
      q: `How do I convert ${hours} hours between ${start} and ${end} into decimal?`,
      a: `The decimal value is simply ${hours.toFixed(2)} hours. Converting to decimal format (like multiplying by an hourly wage) is the standard method for billing and payroll processing to prevent rounding discrepancies.`
    },
    {
      q: `Is ${hours} hours considered overtime?`,
      a: hours > 8 ? `Yes, it exceeds the standard 8-hour shift by ${(hours - 8).toFixed(2)} hour(s). Most employment agreements require overtime pay or comp time for hours worked beyond 8 hours a day.` : `No, it falls within or below the standard 8-hour workday, meaning it is usually logged as standard operating hours.`
    },
    {
      q: `How many minutes is ${hours} hours?`,
      a: `It is exactly ${hours * 60} minutes. Knowing the minutes breakdown is useful for tracking shorter billable increments or logging client consulting calls.`
    },
    {
      q: `What is the rest requirement after a ${hours}-hour shift?`,
      a: `Generally, labor laws dictate a minimum of 11 consecutive hours of rest in any 24-hour period. If you complete a ${hours}-hour shift, you must ensure this mandatory rest period is taken before starting your next shift.`
    },
    {
      q: `Can I automate my timesheet for ${hours} hours?`,
      a: `Yes, you can use our built-in timesheet calculator to enter your exact start, end, and break times. It will output your total gross hours, net hours, and decimal values, which you can easily copy or print.`
    }
  ]
];

export const faqSets_de = [
  (start: string, end: string, hours: number) => [
    {
      q: `Wie viele Minuten sind ${hours} Stunden von ${start} bis ${end} Uhr?`,
      a: `Es sind exakt ${hours * 60} Minuten beziehungsweise ${hours * 3600} Sekunden. Diese präzise Umrechnung ist besonders in der industriellen Fertigung und Logistik wichtig, wo Zeitspannen minutengenau dokumentiert werden müssen.`
    },
    {
      q: `Gilt eine Zeitspanne von ${hours} Stunden als Vollzeit oder Teilzeit?`,
      a: `Eine tägliche Arbeitszeit von ${hours} Stunden kann je nach wöchentlicher Vereinbarung Teilzeit oder Vollzeit sein. In Deutschland gilt eine 5-Tage-Woche mit 35 bis 40 Stunden als Vollzeit (durchschnittlich 7 bis 8 Stunden pro Tag). Kürzere tägliche Arbeitszeiten deuten meist auf ein Teilzeitverhältnis hin.`
    },
    {
      q: `Wie berechne ich Überstunden für eine Schicht von ${hours} Stunden?`,
      a: `Überstunden hängen von Ihrer vertraglichen Arbeitszeit ab. Wenn Ihr Arbeitsvertrag beispielsweise 8 Stunden pro Tag vorsieht und Sie regulär arbeiten, haben Sie bei ${hours} Stunden Anwesenheit eventuell Mehrarbeit geleistet. Bitte beachten Sie, dass gesetzliche Pausenzeiten nach dem Arbeitszeitgesetz (ArbZG) von der reinen Arbeitszeit abgezogen werden müssen.`
    },
    {
      q: `Zählt die Pause bei einer Schicht von ${hours} Stunden zur Arbeitszeit?`,
      a: `Nein, gemäß § 4 des deutschen Arbeitszeitgesetzes (ArbZG) zählen Ruhepausen nicht zur Arbeitszeit und werden daher nicht bezahlt. Bei einer Gesamtdauer von mehr als 6 Stunden ist eine Pause von mindestens 30 Minuten gesetzlich vorgeschrieben. Bei mehr als 9 Stunden Arbeit erhöht sich die Pflichtpause auf 45 Minuten.`
    },
    {
      q: `Wie trage ich ${hours} Stunden in meinen Stundenzettel oder die Zeiterfassung ein?`,
      a: `Sie tragen die Startzeit um ${start} Uhr und die Endzeit um ${end} Uhr in Ihren Stundenzettel ein. Sollten Sie in dieser Zeit gearbeitet und Pausen gemacht haben, müssen Sie die Pausenzeit abziehen. Nutzen Sie unseren kostenlosen Arbeitsstunden-Rechner, um die Nettoarbeitszeit exakt in Dezimalstunden für die Lohnabrechnung umzurechnen.`
    }
  ],
  (start: string, end: string, hours: number) => [
    {
      q: `Wie viel Prozent der Arbeitszeit sind ${hours} Stunden?`,
      a: `Bei einer Basis von 8 Stunden Arbeitszeit entspricht das ${Math.round((hours / 8) * 100)}% des Standardarbeitstages. Dies hilft Projektmanagern bei der Ressourcenallokation und Budgetierung von Projektstunden.`
    },
    {
      q: `Was ist der Dezimalwert von ${hours} Stunden?`,
      a: `Der Dezimalwert ist ${hours.toFixed(2).replace('.', ',')} Stunden. Die Lohnbuchhaltung benötigt diesen Wert zur direkten Multiplikation mit dem Stundenlohn.`
    },
    {
      q: `Wie viele halbe Stunden stecken in ${hours} Stunden?`,
      a: `Es sind genau ${hours * 2} halbe Stunden. Dies ist nützlich, wenn Ihre Zeiterfassung in 30-Minuten-Schritten abrechnet.`
    },
    {
      q: `Welche Ruhezeiten gelten nach einer Schicht von ${hours} Stunden?`,
      a: `Nach Beendigung der täglichen Arbeitszeit müssen Arbeitnehmer in Deutschland eine ununterbrochene Ruhezeit von mindestens 11 Stunden einhalten (§ 5 ArbZG). Bei Krankenhäusern, Gaststätten oder Verkehrsbetrieben gibt es gesetzliche Ausnahmen.`
    },
    {
      q: `Kann ich das Ergebnis dieser Berechnung ausdrucken oder speichern?`,
      a: `Ja. Unter dem Ergebnis der Berechnung finden Sie eine Schaltfläche zum Ausdrucken oder Speichern als PDF. Die Druckansicht blendet Navigation und Werbung aus und stellt die Ergebnisse kontrastreich dar.`
    }
  ]
];

// Dedicated FAQ sets for Work Hours (Arbeitsstunden) pages, resolving the accuracy bug
export const workHoursFaqSets_de = [
  (start: string, end: string, netDecimal: string | number) => {
    const netVal = typeof netDecimal === 'string' ? parseFloat(netDecimal) : netDecimal;
    return [
      {
        q: `Was ist der Dezimalwert von ${start} bis ${end} Uhr mit 30 Minuten Pause?`,
        a: `Der Dezimalwert der Nettoarbeitszeit (mit 30 Minuten Pause) beträgt ${netVal.toFixed(2).replace('.', ',')} Dezimalstunden. Lohnabrechnungssysteme benötigen diesen Dezimalwert, da er direkt mit dem Stundenlohn multipliziert werden kann, um den Bruttoverdienst ohne Rundungsfehler zu ermitteln.`
      },
      {
        q: `Zählt die Pause zur Arbeitszeit bei dieser Arbeitszeitspanne?`,
        a: `Nein, laut § 4 des Arbeitszeitgesetzes (ArbZG) in Deutschland sind Ruhepausen keine Arbeitszeit. Bei einer Gesamtanwesenheit von über 6 Stunden müssen mindestens 30 Minuten Pause genommen und abgezogen werden. Diese Pause darf nicht am Anfang oder Ende der Arbeitszeit liegen, sondern muss die Arbeitszeit unterbrechen.`
      },
      {
        q: `Wie berechne ich Überstunden bei einer Schicht von ${start} bis ${end} Uhr?`,
        a: (() => {
          const net = netVal.toFixed(2).replace('.', ',');
          const diff = Math.abs(netVal - 8).toFixed(2).replace('.', ',');
          const base = `Vergleichen Sie Ihre Nettoarbeitszeit (${net} Stunden nach Abzug der Pause) mit Ihrer vertraglichen täglichen Arbeitszeit von beispielsweise 8 Stunden. `;
          if (netVal > 8) return base + `Bei ${net} Stunden Nettoarbeitszeit leisten Sie ${diff} Stunden Mehrarbeit (Überstunden).`;
          if (netVal < 8) return base + `Bei ${net} Stunden Nettoarbeitszeit liegen Sie ${diff} Stunden unter einem 8-Stunden-Tag – es fallen keine Überstunden an.`;
          return base + `Bei ${net} Stunden Nettoarbeitszeit entspricht dies exakt einem regulären 8-Stunden-Tag ohne Überstunden.`;
        })()
      },
      {
        q: `Gilt diese Nettoarbeitszeit als Vollzeit oder Teilzeit?`,
        a: `Eine regelmäßige Nettoarbeitszeit von ${netVal.toFixed(2).replace('.', ',')} Stunden pro Tag liegt bei einer 5-Tage-Woche (ca. ${Math.round(netVal * 5)} Wochenstunden) im Vollzeitbereich. Arbeitszeiten unter 6 Stunden pro Tag werden meist als Teilzeit oder Minijob eingestuft.`
      },
      {
        q: `Wie erfasse ich diese Zeit korrekt im Stundenzettel?`,
        a: `Tragen Sie ${start} Uhr als Beginn und ${end} Uhr als Ende ein. Vermerken Sie die 30-minütige Pflichtpause separat. Die Nettoarbeitszeit beträgt somit ${netVal.toFixed(2).replace('.', ',')} Stunden. Nutzen Sie unseren Arbeitsstunden-Rechner, um die genaue Nettoarbeitszeit auch für andere Pausenzeiten (wie 45 oder 60 Minuten) präzise zu ermitteln.`
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
        a: `The decimal value of your net work hours (with a 30-minute break deducted) is ${netVal.toFixed(2)} decimal hours. Payroll departments require decimal format (e.g., 7.50 instead of 7h 30m) to multiply directly by your hourly pay rate for error-free wage calculation.`
      },
      {
        q: `Does the break count as working time for this shift?`,
        a: `No, standard labor laws like the UK Working Time Regulations or the US Fair Labor Standards Act (FLSA) specify that rest breaks of 30 minutes or more are unpaid and do not count toward your active working hours. They must be deducted from your total attendance time.`
      },
      {
        q: `How do I calculate overtime for a shift from ${start} to ${end}?`,
        a: (() => {
          const net = netVal.toFixed(2);
          const diff = Math.abs(netVal - 8).toFixed(2);
          const base = `Compare your net work hours (${net} hours after break deduction) against your contracted daily hours, e.g. a standard 8-hour workday. `;
          if (netVal > 8) return base + `Working ${net} net hours means ${diff} hours of overtime.`;
          if (netVal < 8) return base + `Working ${net} net hours leaves you ${diff} hours short of a standard 8-hour day, so no overtime applies.`;
          return base + `Working ${net} net hours is exactly a standard 8-hour day with no overtime.`;
        })()
      },
      {
        q: `Are the hours between ${start} and ${end} considered full-time or part-time?`,
        a: `A daily shift yielding ${netVal.toFixed(2)} net hours is generally considered a full-time workday when performed on a regular 5-day schedule. Weekly hours totaling 35 to 40 hours represent standard full-time employment in most English-speaking markets.`
      },
      {
        q: `How do I record this shift on my daily timesheet?`,
        a: `Log your start time at ${start} and your end time at ${end}, listing the 30-minute break separately. This yields a net total of ${netVal.toFixed(2)} hours. Use our online Work Hours Calculator to easily adjust start, end, and break durations.`
      }
    ];
  }
];

export function getContextClusterDE(start: number, end: number, hours: number): string {
  if (hours >= 4 && hours <= 6) {
    return `Ein tägliches Arbeitszeitfenster von ${hours} Stunden fällt typischerweise in den Bereich der Teilzeitbeschäftigung. Für viele Arbeitnehmer in Deutschland, insbesondere im Rahmen von Minijobs oder Gleitzeit-Teilzeitverträgen, ist dies die vertraglich geregelte tägliche Arbeitszeit. Bei solchen Modellen gelten dieselben gesetzlichen Bestimmungen des Arbeitszeitgesetzes (ArbZG) bezüglich Mindestlohn und anteiligen Urlaubsansprüchen. Beträgt die Arbeitszeit exakt 6 Stunden, ist gesetzlich noch keine Ruhepause vorgeschrieben; erst ab einer Überschreitung von 6 Stunden muss eine 30-minütige Pause eingelegt werden.`;
  }
  if ((start >= 5 && start <= 7.5) && (hours >= 6 && hours <= 9)) {
    return `Diese Zeitspanne entspricht einer klassischen Frühschicht, wie sie in der Industrie, Logistik, im Handwerk oder im Gesundheitswesen üblich ist. Frühschichten erfordern eine präzise Taktung und haben besondere gesetzliche Rahmenbedingungen: Falls die Schicht vor 6:00 Uhr beginnt, gilt der Teil davor gesetzlich als Nachtarbeit, wofür ggf. Schichtzuschläge anfallen. Nach Beendigung dieser Frühschicht müssen Arbeitgeber die gesetzlich vorgeschriebene ununterbrochene Ruhezeit von 11 Stunden gemäß § 5 des Arbeitszeitgesetzes (ArbZG) strikt einhalten, bevor der Arbeitnehmer wieder eingesetzt werden darf.`;
  }
  if ((start >= 8 && start <= 9.5) && (hours >= 7 && hours <= 9.5)) {
    return `Dieser Zeitraum repräsentiert die klassische Normalarbeitszeit oder Büroarbeitszeit in Deutschland. Eine typische 5-Tage-Woche mit wöchentlich 38,5 bis 40 Stunden basiert meist auf diesem Tagesrhythmus (z. B. von 8:00 bis 17:00 Uhr). Im Rahmen von modernen Gleitzeitmodellen (Gleitzeit) können Arbeitnehmer Beginn und Ende flexibel gestalten. Da die Anwesenheit hierbei über 6 Stunden liegt, ist gemäß § 4 ArbZG ein Abzug einer Ruhepause von mindestens 30 Minuten zwingend vorgeschrieben, um die rechtssichere Nettoarbeitszeit zu ermitteln.`;
  }
  if ((start >= 13 && start <= 15.5) && (hours >= 6 && hours <= 9)) {
    return `Diese Arbeitszeit fällt in den Bereich der Spätschicht, welche häufig im Einzelhandel, in der Gastronomie, im Kundenservice oder im medizinischen Bereich anzutreffen ist. Da Spätschichten oft bis in die späten Abendstunden hineinreichen, sind sie mit logistischen Herausforderungen wie der Nutzung des öffentlichen Nahverkehrs verbunden. Gesetzlich ist darauf zu achten, dass bei einer Arbeitszeit von mehr als 6 Stunden eine Pause von 30 Minuten und bei mehr als 9 Stunden eine Pause von 45 Minuten eingeplant und vom Stundenzettel abgezogen werden muss.`;
  }
  const crossesMidnight = end < start;
  if (crossesMidnight || (start >= 20 || start < 5)) {
    return `Diese Konstellation umfasst eine klassische Nachtschicht oder Nachtarbeit nach deutschem Recht (§ 2 ArbZG). Arbeit zwischen 23:00 und 6:00 Uhr gilt als Nachtarbeit und begründet für Arbeitnehmer Anspruch auf einen angemessenen finanziellen Ausgleich (Nachtschichtzuschlag) oder entsprechenden Freizeitausgleich. Aufgrund der erhöhten körperlichen Belastung sieht das Arbeitszeitgesetz für Nachtarbeiter besondere Schutzrechte vor, einschließlich des Rechts auf regelmäßige arbeitsmedizinische Untersuchungen und strengerer Höchstarbeitszeitgrenzen.`;
  }
  return `Die Erfassung und Berechnung dieses spezifischen Zeitraums von ${hours} Stunden ist für eine transparente Zeitwirtschaft unerlässlich. Unabhängig davon, ob es sich um ein flexibles Arbeitszeitmodell, ein Projektzeitbudget oder eine private Planung handelt, sorgt die exakte Berechnung der Stunden und Minuten für maximale Nachvollziehbarkeit. Bitte beachten Sie bei der Aufzeichnung in Ihrem Stundenzettel stets die gesetzlichen Vorgaben zur Pausenregelung und Mindestruhezeit nach dem Arbeitszeitgesetz (ArbZG).`;
}

export function getContextClusterEN(start: number, end: number, hours: number): string {
  if (hours >= 4 && hours <= 6) {
    return `A daily work window of ${hours} hours is typical for part-time employment, flexible schedules, or student internships. Under standard labor guidelines (such as the UK Working Time Regulations or US FLSA), part-time employees are entitled to proportional benefits and minimum wage protections. If your shift is exactly 6 hours, note that UK regulations require a mandatory 20-minute rest break once a shift exceeds 6 hours. Logging these hours accurately on your timesheet prevents compliance issues and ensures correct compensation.`;
  }
  if ((start >= 5 && start <= 7.5) && (hours >= 6 && hours <= 9)) {
    return `This time span covers a standard early morning shift, commonly scheduled in manufacturing, logistics, healthcare, and construction sectors. Early shifts require precise coordination and have unique compliance rules: in many jurisdictions, work starting before 6:00 AM qualifies for night shift premiums or special transport provisions. Furthermore, after completing this shift, a minimum consecutive rest period (e.g., 11 hours in the EU/UK) must be observed before the employee can safely return to work.`;
  }
  if ((start >= 8 && start <= 9.5) && (hours >= 7 && hours <= 9.5)) {
    return `This period represents the classic 9-to-5 office hours pattern widely adopted across corporate, financial, and administrative sectors. A standard 40-hour workweek is built on this daily schedule. With modern flex-time policies, employees can adjust their exact start and end times. Since this shift exceeds 6 hours, labor regulations require deducting a rest break (typically 30 minutes) from total elapsed hours to calculate net work hours for payroll processing.`;
  }
  if ((start >= 13 && start <= 15.5) && (hours >= 6 && hours <= 9)) {
    return `This duration aligns with a typical afternoon or late shift, standard in retail, hospitality, customer support, and medical fields. Late shifts often run into the evening, requiring careful coordination around break schedules and transportation. Under standard employment regulations, a rest break of at least 20 to 30 minutes must be allocated and recorded on timesheets for any shift exceeding 6 hours to ensure compliance.`;
  }
  const crossesMidnight = end < start;
  if (crossesMidnight || (start >= 20 || start < 5)) {
    return `This shift pattern covers night work or overnight shifts. Under most international labor standards (such as the US FLSA or UK Working Time Regulations), hours worked between 11:00 PM and 6:00 AM trigger night shift differentials, premium pay rates, or compensatory rest requirements. Due to the health impacts of overnight labor, regulations mandate strict compliance with maximum shift lengths and regular medical assessments.`;
  }
  return `Accurately tracking this duration of ${hours} hours is essential for billing clients, validating employee timesheets, and project resource scheduling. Whether managing flexible flextime systems or billing hourly consulting contracts, using an automated calculator ensures zero rounding errors. Always remember to subtract unpaid rest breaks to remain compliant with local labor guidelines.`;
}

