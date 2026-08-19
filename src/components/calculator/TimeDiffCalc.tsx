import { useState, useCallback } from 'react';
import { calcTimeDiff } from '../../lib/timeEngine';
import type { TimeDiffResult } from '../../lib/timeEngine';

interface Props {
  lang?: 'de' | 'en';
  defaultStart?: string;
  defaultEnd?: string;
}

function now(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

function laterToday(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

const EXAMPLES = [
  { label: '9:00 → 17:00', getStart: () => { const d = new Date(); d.setHours(9,0,0,0); return d.toISOString().slice(0,16); }, getEnd: () => { const d = new Date(); d.setHours(17,0,0,0); return d.toISOString().slice(0,16); } },
  { label: '8:00 → 16:00', getStart: () => { const d = new Date(); d.setHours(8,0,0,0); return d.toISOString().slice(0,16); }, getEnd: () => { const d = new Date(); d.setHours(16,0,0,0); return d.toISOString().slice(0,16); } },
  { label: '+8h from now', getStart: () => now(), getEnd: () => laterToday(8) },
];

export default function TimeDiffCalc({ lang = 'de', defaultStart, defaultEnd }: Props) {
  const [start, setStart] = useState(defaultStart ?? now());
  const [end, setEnd] = useState(defaultEnd ?? laterToday(8));
  const [result, setResult] = useState<TimeDiffResult | null>(null);
  const [copied, setCopied] = useState(false);

  const labels = lang === 'de' ? {
    startDate: 'Startdatum & Zeit',
    endDate: 'Enddatum & Zeit',
    calc: 'Berechnen',
    result: 'Zeitdifferenz',
    days: 'Tage', hours: 'Stunden', mins: 'Minuten', secs: 'Sekunden',
    totalMins: 'Total Minuten', totalSecs: 'Total Sekunden', decimal: 'Dezimalstunden',
    copy: 'Kopieren', share: 'Teilen', examples: 'Beispiele',
  } : {
    startDate: 'Start Date & Time',
    endDate: 'End Date & Time',
    calc: 'Calculate',
    result: 'Time Difference',
    days: 'Days', hours: 'Hours', mins: 'Minutes', secs: 'Seconds',
    totalMins: 'Total Minutes', totalSecs: 'Total Seconds', decimal: 'Decimal Hours',
    copy: 'Copy', share: 'Share', examples: 'Examples',
  };

  const handleCalculate = useCallback(() => {
    if (!start || !end) return;
    const r = calcTimeDiff(start, end);
    setResult(r);
    // Update URL params
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'diff');
    url.searchParams.set('start', start);
    url.searchParams.set('end', end);
    window.history.replaceState({}, '', url.toString());
  }, [start, end]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    const text = `${result.days}d ${result.hours}h ${result.minutes}m ${result.seconds}s (${result.decimalHours}h)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const applyExample = (ex: typeof EXAMPLES[0]) => {
    setStart(ex.getStart());
    setEnd(ex.getEnd());
    setResult(null);
  };

  // Timeline % — cap at 24h for display
  const timelinePercent = result ? Math.min(100, (result.totalHours / 24) * 100) : 0;

  return (
    <div className="calc-card" id="mode-diff">
      {/* Example chips */}
      <div className="examples-bar">
        <span className="examples-label">{labels.examples}:</span>
        {EXAMPLES.map(ex => (
          <button key={ex.label} className="chip" onClick={() => applyExample(ex)}>
            {ex.label}
          </button>
        ))}
      </div>

      <div className="calc-grid">
        <div className="field">
          <label htmlFor="td-start">{labels.startDate}</label>
          <input
            id="td-start"
            type="datetime-local"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="td-end">{labels.endDate}</label>
          <input
            id="td-end"
            type="datetime-local"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
        </div>
      </div>

      <button className="calc-submit" onClick={handleCalculate} id="td-calc-btn">
        {labels.calc}
      </button>

      {result && (
        <div className="result-panel" id="td-result">
          <div className="result-headline">{labels.result}</div>

          <div className="result-primary">
            <span className="result-number">{result.decimalHours}</span>
            <span className="result-unit">{labels.hours}</span>
          </div>

          <div className="result-breakdown">
            {result.days > 0 && (
              <div className="result-stat">
                <span className="stat-value">{result.days}</span>
                <span className="stat-label">{labels.days}</span>
              </div>
            )}
            <div className="result-stat">
              <span className="stat-value">{result.hours}</span>
              <span className="stat-label">{labels.hours}</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{result.minutes}</span>
              <span className="stat-label">{labels.mins}</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{result.seconds}</span>
              <span className="stat-label">{labels.secs}</span>
            </div>
          </div>

          {/* Extra stats */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="badge badge--accent">{result.totalMinutes.toLocaleString()} {labels.totalMins}</span>
            <span className="badge badge--violet">{result.totalSeconds.toLocaleString()} {labels.totalSecs}</span>
          </div>

          {/* Timeline bar */}
          <div className="timeline">
            <div className="timeline__track">
              <div className="timeline__fill" style={{ width: `${timelinePercent}%` }} />
            </div>
            <div className="timeline__hours">
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn--secondary" onClick={handleCopy} id="td-copy-btn">
              {copied ? (lang === 'de' ? 'Kopiert' : 'Copied!') : `${labels.copy}`}
            </button>
            <button className="btn btn--ghost" onClick={() => window.print()} id="td-print-btn">
              {lang === 'de' ? 'Drucken' : 'Print'}
            </button>
            <button className="btn btn--ghost" onClick={() => navigator.share?.({ title: 'Zeitrechner', url: window.location.href })} id="td-share-btn">
              {labels.share}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
