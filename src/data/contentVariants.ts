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

// ─── TIME RANGE VARIANTS ────────────────────────────────────────────────────

export const timeRangeIntros_en = [
  (start: string, end: string, hours: number) =>
    `There are exactly <strong>${hours} hours</strong> between ${start} and ${end}. This is one of the most commonly searched time intervals in work scheduling.`,
  (start: string, end: string, hours: number) =>
    `The time span from ${start} to ${end} covers <strong>${hours} hours</strong> — equivalent to ${hours * 60} minutes or ${hours * 3600} seconds.`,
  (start: string, end: string, hours: number) =>
    `Calculating the hours between ${start} and ${end} gives you <strong>${hours} hours</strong>. Whether you're tracking work time or planning your day, this interval is essential.`,
  (start: string, end: string, hours: number) =>
    `From ${start} to ${end} totals <strong>${hours} hours</strong>. That's ${Math.floor(hours / 8)} full workday${hours >= 8 ? 's' : ''} ${hours % 8 > 0 ? `and ${hours % 8} hour${hours % 8 !== 1 ? 's' : ''}` : ''}.`,
  (start: string, end: string, hours: number) =>
    `The difference between ${start} and ${end} is <strong>${hours} hours</strong>. In decimal form, that's ${hours}.00 hours.`,
  (start: string, end: string, hours: number) =>
    `<strong>${hours} hours</strong> — that's what separates ${start} from ${end}. A span that fits ${Math.floor(hours / 0.5)} half-hour blocks.`,
];

export const timeRangeIntros_de = [
  (start: string, end: string, hours: number) =>
    `Zwischen ${start} und ${end} Uhr liegen genau <strong>${hours} Stunden</strong>. Das entspricht ${hours * 60} Minuten oder ${hours * 3600} Sekunden.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} bis ${end} Uhr beträgt der Zeitunterschied <strong>${hours} Stunden</strong> – eine der meistgesuchten Zeitspannen für Arbeitszeitberechnungen.`,
  (start: string, end: string, hours: number) =>
    `Die Zeitspanne von ${start} bis ${end} Uhr umfasst <strong>${hours} Stunden</strong>. Ob für die Stechuhr oder die Tagesplanung – dieses Intervall ist alltagsrelevant.`,
  (start: string, end: string, hours: number) =>
    `Von ${start} Uhr bis ${end} Uhr vergehen <strong>${hours} Stunden</strong>. In Dezimalform: ${hours},00 Stunden.`,
  (start: string, end: string, hours: number) =>
    `<strong>${hours} Stunden</strong> – so groß ist die Zeitlücke zwischen ${start} und ${end} Uhr. Das entspricht ${hours * 60} Minuten.`,
];

export const contextBlocks_en = [
  (hours: number) =>
    `A ${hours}-hour window is typical in many industries. For standard 8-hour workdays, ${hours} hours represents ${Math.round((hours / 8) * 100)}% of the working day. Shift workers, freelancers, and remote teams all benefit from precise time-interval calculations.`,
  (hours: number) =>
    `In payroll and HR software, ${hours}-hour blocks are a standard billing unit. Whether you're a freelancer invoicing clients or an employer processing timesheets, knowing the exact hours between two timestamps eliminates guesswork.`,
  (hours: number) =>
    `From a productivity standpoint, ${hours} hours offers ${hours >= 4 ? 'substantial deep-work potential' : 'focused sprint time'}. Research shows peak concentration windows average 90–120 minutes — so ${hours} hours gives you ${Math.floor(hours / 1.5)} full focus sprints.`,
  (hours: number) =>
    `Scheduling meetings, deliveries, or events in a ${hours}-hour range requires precise time math. Missing even 15 minutes in a booking system can create cascading errors — hence why exact calculation tools are essential.`,
  (hours: number) =>
    `For shift workers, ${hours} hours is more than a number — it's their livelihood. Overtime rules, break requirements, and minimum rest periods are all calculated from exact shift spans. Get it right every time.`,
];

export const contextBlocks_de = [
  (hours: number) =>
    `Ein Zeitfenster von ${hours} Stunden ist in vielen Branchen Standard. Bei einem 8-Stunden-Arbeitstag entspricht diese Spanne ${Math.round((hours / 8) * 100)}% der Arbeitszeit. Schichtarbeiter, Freiberufler und Remote-Teams profitieren von präzisen Berechnungen.`,
  (hours: number) =>
    `In Lohnabrechnungsprogrammen sind ${hours}-Stunden-Blöcke eine Standardabrechnungseinheit. Ob Freiberufler oder Arbeitgeber – genaue Zeiterfassung verhindert Fehler in der Stundengutschrift.`,
  (hours: number) =>
    `Aus Produktivitätssicht bietet ein ${hours}-Stunden-Fenster ${hours >= 4 ? 'erhebliches Deep-Work-Potenzial' : 'konzentrierte Sprint-Zeit'}. Studien zeigen: Spitzenkonzentrationsphasen dauern 90–120 Minuten – das ergibt ${Math.floor(hours / 1.5)} Fokussitzungen.`,
  (hours: number) =>
    `Terminplanung, Lieferungen oder Veranstaltungen in einem ${hours}-Stunden-Zeitfenster erfordern präzise Zeitrechnung. Schon 15 Minuten Abweichung kann Folgefehler auslösen.`,
];

export const useCases_en = [
  ['Tracking billable freelance hours', 'Employee timesheet validation', 'Scheduling back-to-back meetings', 'Calculating overtime eligibility'],
  ['Payroll processing', 'Shift handover planning', 'Event duration estimation', 'Client billing accuracy'],
  ['Remote team standup scheduling', 'Break-time compliance', 'Project milestone tracking', 'Study session planning'],
  ['Delivery window estimation', 'Hospital shift management', 'Factory production cycle tracking', 'Transportation logistics'],
  ['School timetable design', 'Sports training blocks', 'Restaurant service windows', 'Customer support staffing'],
];

export const useCases_de = [
  ['Abrechnung freiberuflicher Stunden', 'Arbeitszeitprüfung', 'Besprechungsplanung', 'Überstundenberechnung'],
  ['Lohnabrechnung', 'Schichtübergabe', 'Veranstaltungsdauer', 'Kundenabrechnung'],
  ['Remote-Team-Koordination', 'Pausenzeitenregelung', 'Projektmeilensteine', 'Lernplanung'],
  ['Lieferfenster', 'Krankenhaus-Schichtmanagement', 'Produktionszyklus', 'Transportlogistik'],
];

// ─── WORK HOURS VARIANTS ─────────────────────────────────────────────────────

export const workHoursIntros_en = [
  (start: string, end: string, net: number) =>
    `Working from <strong>${start} to ${end}</strong> nets you <strong>${net} hours</strong> after breaks. This is the calculation every timesheet needs to get right.`,
  (start: string, end: string, net: number) =>
    `A shift from ${start} to ${end} delivers <strong>${net} productive hours</strong> — after accounting for mandatory break time. Here's the full breakdown.`,
  (start: string, end: string, net: number) =>
    `From ${start} to ${end}, your net working time is <strong>${net} hours</strong>. Subtract your break and that's exactly what goes on your timesheet.`,
];

export const workHoursIntros_de = [
  (start: string, end: string, net: number) =>
    `Von <strong>${start} bis ${end} Uhr</strong> ergeben sich nach Abzug der Pause <strong>${net} Stunden</strong> Nettoarbeitszeit. So stimmt jeder Stundenzettel.`,
  (start: string, end: string, net: number) =>
    `Eine Schicht von ${start} bis ${end} Uhr liefert <strong>${net} Arbeitsstunden</strong> netto – nach Pausenabzug. Hier ist die vollständige Berechnung.`,
];

// ─── COUNTDOWN VARIANTS ──────────────────────────────────────────────────────

export const countdownIntros_en = [
  (name: string, days: number) =>
    `<strong>${days} days</strong> until ${name}. That's ${Math.floor(days / 7)} weeks and ${days % 7} days — plan accordingly.`,
  (name: string, days: number) =>
    `The countdown to ${name} stands at <strong>${days} days</strong> from today. In hours, that's ${days * 24} hours of waiting.`,
  (name: string, days: number) =>
    `${name} is <strong>${days} days away</strong>. Here's a live countdown so you never lose track.`,
];

export const countdownIntros_de = [
  (name: string, days: number) =>
    `Noch <strong>${days} Tage</strong> bis ${name}. Das sind ${Math.floor(days / 7)} Wochen und ${days % 7} Tage – plane rechtzeitig.`,
  (name: string, days: number) =>
    `Der Countdown zu ${name} zeigt <strong>${days} Tage</strong> ab heute. In Stunden: ${days * 24} Stunden.`,
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
    { q: `How many minutes are between ${start} and ${end}?`, a: `There are ${hours * 60} minutes between ${start} and ${end}.` },
    { q: `How many seconds are between ${start} and ${end}?`, a: `The total is ${hours * 3600} seconds between ${start} and ${end}.` },
    { q: `What if I have a 30-minute break?`, a: `With a 30-minute break, your net working time is ${hours - 0.5} hours (${(hours - 0.5) * 60} minutes).` },
    { q: `What if I have a 1-hour break?`, a: `Subtracting a 1-hour break leaves you with ${hours - 1} net hours.` },
    { q: `Is ${hours} hours a full workday?`, a: hours === 8 ? `Yes — ${hours} hours is the standard full workday in most countries.` : hours > 8 ? `${hours} hours exceeds a standard 8-hour workday by ${hours - 8} hour${hours - 8 !== 1 ? 's' : ''}.` : `No — ${hours} hours is shorter than the standard 8-hour workday.` },
  ],
  (start: string, end: string, hours: number) => [
    { q: `How do I calculate hours between ${start} and ${end}?`, a: `Simply subtract the start time from the end time: ${end} − ${start} = ${hours} hours.` },
    { q: `How many half-hours are in ${hours} hours?`, a: `There are ${hours * 2} half-hour intervals in ${hours} hours.` },
    { q: `What is ${hours} hours in decimal?`, a: `${hours} hours is ${hours}.00 in decimal notation.` },
    { q: `What if I start at ${start} and finish later?`, a: `Use our calculator above to enter any end time and get the exact hours instantly.` },
  ],
];

export const faqSets_de = [
  (start: string, end: string, hours: number) => [
    { q: `Wie viele Minuten liegen zwischen ${start} und ${end} Uhr?`, a: `Zwischen ${start} und ${end} Uhr liegen ${hours * 60} Minuten.` },
    { q: `Wie viele Sekunden liegen zwischen ${start} und ${end} Uhr?`, a: `Insgesamt ${hours * 3600} Sekunden liegen zwischen ${start} und ${end} Uhr.` },
    { q: `Was gilt bei 30 Minuten Pause?`, a: `Mit 30 Minuten Pause verbleiben ${hours - 0.5} Nettoarbeitsstunden (${(hours - 0.5) * 60} Minuten).` },
    { q: `Was gilt bei 1 Stunde Pause?`, a: `Nach Abzug von 1 Stunde Pause bleiben ${hours - 1} Nettostunden übrig.` },
    { q: `Sind ${hours} Stunden ein voller Arbeitstag?`, a: hours === 8 ? `Ja – ${hours} Stunden ist der Standard-Arbeitstag in den meisten Ländern.` : hours > 8 ? `${hours} Stunden übersteigen den 8-Stunden-Standard um ${hours - 8} Stunde${hours - 8 !== 1 ? 'n' : ''}.` : `Nein – ${hours} Stunden sind kürzer als der Standard-Arbeitstag.` },
  ],
];
