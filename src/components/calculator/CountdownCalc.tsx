import { useState, useEffect, useRef, useCallback } from 'react';
import { calcCountdown } from '../../lib/timeEngine';
import type { CountdownResult } from '../../lib/timeEngine';

interface Props {
  lang?: 'de' | 'en';
  defaultTarget?: string;
  eventName?: string;
}

function nextChristmas(): string {
  const now = new Date();
  const year = now.getMonth() >= 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-12-25`;
}

const PRESETS = [
  { labelDe: 'Nächste Weihnachten', labelEn: 'Next Christmas', getDate: nextChristmas },
  { labelDe: 'Silvester', labelEn: "New Year's Eve", getDate: () => `${new Date().getFullYear()}-12-31` },
  { labelDe: 'Neujahr', labelEn: 'New Year', getDate: () => `${new Date().getFullYear() + 1}-01-01` },
];

function pad2(n: number): string { return n.toString().padStart(2, '0'); }

export default function CountdownCalc({ lang = 'de', defaultTarget, eventName }: Props) {
  const [targetDate, setTargetDate] = useState(defaultTarget ?? nextChristmas());
  const [result, setResult] = useState<CountdownResult | null>(null);
  const [ticking, setTicking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const L = lang === 'de' ? {
    targetDate: 'Zieldatum', calc: 'Countdown starten', days: 'Tage',
    hours: 'Stunden', mins: 'Minuten', secs: 'Sekunden', stop: 'Stoppen',
    passed: 'Dieses Datum liegt in der Vergangenheit', headline: 'Countdown',
    presets: 'Schnellauswahl',
  } : {
    targetDate: 'Target Date', calc: 'Start Countdown', days: 'Days',
    hours: 'Hours', mins: 'Minutes', secs: 'Seconds', stop: 'Stop',
    passed: 'This date has already passed', headline: 'Countdown',
    presets: 'Quick Select',
  };

  const tick = useCallback(() => {
    if (!targetDate) return;
    const r = calcCountdown(targetDate + 'T00:00:00');
    setResult(r);
  }, [targetDate]);

  const handleStart = () => {
    tick();
    setTicking(true);
    intervalRef.current = setInterval(tick, 1000);
  };

  const handleStop = () => {
    setTicking(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // When defaultTarget provided, auto-start
  useEffect(() => {
    if (defaultTarget) { tick(); setTicking(true); intervalRef.current = setInterval(tick, 1000); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [defaultTarget]);

  const applyPreset = (p: typeof PRESETS[0]) => {
    handleStop();
    const d = p.getDate();
    setTargetDate(d);
    setResult(null);
  };

  return (
    <div className="calc-card" id="mode-countdown">
      <div className="examples-bar">
        <span className="examples-label">{L.presets}:</span>
        {PRESETS.map((p, i) => (
          <button key={i} className="chip" onClick={() => applyPreset(p)}>
            {lang === 'de' ? p.labelDe : p.labelEn}
          </button>
        ))}
      </div>

      <div className="calc-grid calc-grid--full">
        <div className="field">
          <label htmlFor="cd-date">{L.targetDate}</label>
          <input
            id="cd-date"
            type="date"
            value={targetDate}
            onChange={e => { setTargetDate(e.target.value); handleStop(); setResult(null); }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="calc-submit" onClick={handleStart} disabled={ticking} id="cd-start-btn"
          style={{ flex: 1 }}>
          ▶ {L.calc}
        </button>
        {ticking && (
          <button className="btn btn--ghost" onClick={handleStop} id="cd-stop-btn"
            style={{ minWidth: '100px' }}>
            ⏹ {L.stop}
          </button>
        )}
      </div>

      {result && (
        <div className="result-panel" id="cd-result">
          {result.isPast ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'var(--clr-amber)', fontSize: '1.1rem', marginBottom: '16px' }}>
                ⚠ {L.passed} ({result.days} {L.days} ago)
              </p>
              {result.nextOccurrence && (
                <button 
                  className="btn btn--accent" 
                  onClick={() => {
                    const nextDate = result.nextOccurrence?.split('T')[0] ?? '';
                    setTargetDate(nextDate);
                    // Force a tick for the new date
                    const r = calcCountdown(nextDate + 'T00:00:00');
                    setResult(r);
                  }}
                >
                  🔄 {lang === 'de' ? 'Zum nächsten Termin springen' : 'Switch to next occurrence'}
                </button>
              )}
            </div>
          ) : (
            <>
              {eventName && (
                <div className="result-headline">{eventName}</div>
              )}
              <div className="countdown-display">
                <div className="countdown-unit">
                  <span className="countdown-value">{pad2(result.days)}</span>
                  <span className="countdown-label">{L.days}</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-value">{pad2(result.hours)}</span>
                  <span className="countdown-label">{L.hours}</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-value">{pad2(result.minutes)}</span>
                  <span className="countdown-label">{L.mins}</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-value" style={{ color: ticking ? 'var(--clr-accent)' : 'var(--clr-text)' }}>
                    {pad2(result.seconds)}
                  </span>
                  <span className="countdown-label">{L.secs}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge--accent">📅 {result.totalDays.toLocaleString()} {L.days} {lang === 'de' ? 'insgesamt' : 'total'}</span>
                <span className="badge badge--violet">⏰ {result.totalHours.toLocaleString()} {L.hours}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
