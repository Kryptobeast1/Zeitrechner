// i18n translations for German and English

export type Lang = 'de' | 'en';

export const translations = {
  de: {
    // Navigation
    nav: {
      home: 'Startseite',
      calculator: 'Zeitrechner',
      timeDiff: 'Zeitdifferenz',
      addSubtract: 'Zeit addieren',
      workHours: 'Arbeitsstunden',
      countdown: 'Countdown',
      fromNow: 'Ab jetzt',
    },
    // Calculator modes
    modes: {
      diff: 'Differenz',
      add: 'Addieren/Subtrahieren',
      work: 'Arbeitsstunden',
      countdown: 'Countdown',
      now: 'Ab jetzt',
    },
    // Labels
    labels: {
      startDate: 'Startdatum',
      endDate: 'Enddatum',
      startTime: 'Startzeit',
      endTime: 'Endzeit',
      breakDuration: 'Pausendauer',
      targetDate: 'Zieldatum',
      duration: 'Dauer',
      hours: 'Stunden',
      minutes: 'Minuten',
      days: 'Tage',
      seconds: 'Sekunden',
      add: 'Addieren',
      subtract: 'Subtrahieren',
      calculate: 'Berechnen',
      result: 'Ergebnis',
      copy: 'Kopieren',
      share: 'Teilen',
      reset: 'Zurücksetzen',
      minuteBreak: 'Minuten Pause',
    },
    // Results
    results: {
      timeDiff: 'Zeitdifferenz',
      workNet: 'Nettoarbeitszeit',
      overtime: 'Überstunden',
      totalMinutes: 'Gesamt in Minuten',
      totalSeconds: 'Gesamt in Sekunden',
      decimalHours: 'Dezimalstunden',
      countdown: 'Countdown',
      timeRemaining: 'Verbleibende Zeit',
      eventPassed: 'Das Ereignis ist bereits vergangen',
      fromNow: 'Ab jetzt',
      currentTime: 'Aktuelle Zeit',
      resultTime: 'Ergebniszeit',
    },
    // SEO content
    seo: {
      hubTitle: 'Zeitrechner — Stunden, Arbeitszeit & Countdown',
      hubDesc: 'Kostenloser Online-Zeitrechner. Berechne Zeitdifferenzen, addiere Stunden, ermittle Arbeitszeiten.',
      featuredSnippet: 'Sofortige Antwort',
      relatedQueries: 'Ähnliche Zeitspannen',
      tryCalculator: 'Selbst berechnen',
      lastUpdated: 'Zuletzt aktualisiert',
      methodology: 'Berechnungsmethode',
    },
    // Common phrases
    phrases: {
      hoursUnit: 'Stunden',
      minutesUnit: 'Minuten',
      secondsUnit: 'Sekunden',
      daysUnit: 'Tage',
      between: 'zwischen',
      and: 'und',
      oclock: 'Uhr',
      net: 'netto',
      gross: 'brutto',
    },
  },
  en: {
    nav: {
      home: 'Home',
      calculator: 'Time Calculator',
      timeDiff: 'Time Difference',
      addSubtract: 'Add/Subtract Time',
      workHours: 'Work Hours',
      countdown: 'Countdown',
      fromNow: 'From Now',
    },
    modes: {
      diff: 'Difference',
      add: 'Add/Subtract',
      work: 'Work Hours',
      countdown: 'Countdown',
      now: 'From Now',
    },
    labels: {
      startDate: 'Start Date',
      endDate: 'End Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      breakDuration: 'Break Duration',
      targetDate: 'Target Date',
      duration: 'Duration',
      hours: 'Hours',
      minutes: 'Minutes',
      days: 'Days',
      seconds: 'Seconds',
      add: 'Add',
      subtract: 'Subtract',
      calculate: 'Calculate',
      result: 'Result',
      copy: 'Copy',
      share: 'Share',
      reset: 'Reset',
      minuteBreak: 'Minute Break',
    },
    results: {
      timeDiff: 'Time Difference',
      workNet: 'Net Work Time',
      overtime: 'Overtime',
      totalMinutes: 'Total in Minutes',
      totalSeconds: 'Total in Seconds',
      decimalHours: 'Decimal Hours',
      countdown: 'Countdown',
      timeRemaining: 'Time Remaining',
      eventPassed: 'This event has already passed',
      fromNow: 'From Now',
      currentTime: 'Current Time',
      resultTime: 'Result Time',
    },
    seo: {
      hubTitle: 'Time Calculator — Hours, Work Hours & Countdown',
      hubDesc: 'Free online time calculator. Calculate time differences, add hours, track work time.',
      featuredSnippet: 'Quick Answer',
      relatedQueries: 'Related Time Ranges',
      tryCalculator: 'Try the Calculator',
      lastUpdated: 'Last updated',
      methodology: 'Methodology',
    },
    phrases: {
      hoursUnit: 'hours',
      minutesUnit: 'minutes',
      secondsUnit: 'seconds',
      daysUnit: 'days',
      between: 'between',
      and: 'and',
      oclock: '',
      net: 'net',
      gross: 'gross',
    },
  },
} as const;

export type Translations = typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(lang: Lang, section: keyof typeof translations.en, key: string): string {
  const sectionData = translations[lang][section] as Record<string, string>;
  return sectionData[key] ?? key;
}

export function getLangAlternate(lang: Lang): Lang {
  return lang === 'de' ? 'en' : 'de';
}
