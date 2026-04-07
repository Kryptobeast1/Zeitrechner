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

// FAQ sets for time range pages
export const faqSets_en = [
  (start: string, end: string, hours: number) => [
    { q: `How many minutes are between ${start} and ${end}?`, a: `Exactly ${hours * 60} minutes separate ${start} and ${end}.` },
    { q: `What is the duration in seconds?`, a: `A total of ${hours * 3600} seconds occur between those two times.` },
    { q: `How much of a standard workday is ${hours} hours?`, a: `It accounts for ${Math.round((hours / 8) * 100)}% of a typical 8-hour shift.` },
    { q: `What if a 30-minute break is taken?`, a: `The net duration would drop to ${hours - 0.5} hours.` },
  ],
  (start: string, end: string, hours: number) => [
    { q: `How do I convert ${hours} hours between ${start} and ${end} into decimal?`, a: `The decimal value is simply ${hours.toFixed(2)}.` },
    { q: `Is ${hours} hours considered overtime?`, a: hours > 8 ? `Yes, it exceeds the standard 8-hour shift by ${hours - 8} hour(s).` : `No, it falls within or below the 8-hour standard.` },
    { q: `How many minutes is ${hours} hours?`, a: `${hours * 60} minutes.` },
  ],
];

export const faqSets_de = [
  (start: string, end: string, hours: number) => [
    { q: `Wie viele Minuten sind ${hours} Stunden von ${start} bis ${end} Uhr?`, a: `Es sind exakt ${hours * 60} Minuten.` },
    { q: `Gilt ${hours} Stunden als Überstunden?`, a: hours > 8 ? `Ja, es übersteigt den 8-Stunden-Standard um ${hours - 8} Stunde(n).` : `Nein, es liegt im oder unter dem 8-Stunden-Standard.` },
    { q: `Was sind ${hours} Stunden in Sekunden?`, a: `Das sind insgesamt ${hours * 3600} Sekunden.` },
  ],
  (start: string, end: string, hours: number) => [
    { q: `Wie viel Prozent der Arbeitszeit sind ${hours} Stunden?`, a: `Bei 8 Stunden Basis sind das ${Math.round((hours / 8) * 100)}%.` },
    { q: `Was ist der Dezimalwert von ${hours} Stunden?`, a: `Der Dezimalwert ist ${hours.toFixed(2).replace('.', ',')}.` },
    { q: `Wie viele halbe Stunden stecken in ${hours} Stunden?`, a: `Es sind genau ${hours * 2} halbe Stunden.` },
  ],
];
