import { useState, useCallback } from 'react';

interface Props { lang?: 'de' | 'en'; defaultStart?: string; defaultEnd?: string; }

const pad = (n: number) => String(n).padStart(2, '0');
function todayStr(): string { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

interface Res { days: number; h: number; m: number; s: number; totalHours: string; totalMin: number; totalSec: number; }

export default function TimeDiffCalc({ lang = 'de' }: Props) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<Res | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const L = lang === 'de' ? {
    start: 'Start', end: 'Ende', time: 'Uhrzeit', date: 'Datum', optional: 'optional', swap: 'Start und Ende tauschen',
    hint: 'Optional — Datum hinzufügen, um über mehrere Tage zu rechnen.',
    note: 'Kein Datum? Das Ende wird als später am selben Tag angenommen und läuft bei Bedarf über Mitternacht.',
    calc: 'Berechnen', duration: 'Dauer', totalHours: 'Stunden gesamt', totalMins: 'Minuten gesamt', totalSecs: 'Sekunden gesamt',
    copy: 'Ergebnis kopieren', copied: 'Kopiert', reset: 'Zurücksetzen', invalid: 'Bitte gültige Uhrzeiten eingeben.',
    d: 'T', h: 'Std', m: 'Min', s: 'Sek',
  } : {
    start: 'Start', end: 'End', time: 'Time', date: 'Date', optional: 'optional', swap: 'Swap start and end',
    hint: 'Optional — add dates to measure across multiple days.',
    note: 'No dates? The end is assumed to be later the same day, rolling past midnight if needed.',
    calc: 'Calculate', duration: 'Duration', totalHours: 'Total hours', totalMins: 'Total minutes', totalSecs: 'Total seconds',
    copy: 'Copy result', copied: 'Copied', reset: 'Reset', invalid: 'Please enter valid times.',
    d: 'd', h: 'h', m: 'm', s: 's',
  };

  const calc = useCallback(() => {
    if (!startTime || !endTime) { setError(L.invalid); setResult(null); return; }
    const sDate = startDate || todayStr();
    const eDate = endDate || startDate || todayStr();
    const start = new Date(`${sDate}T${startTime}:00`);
    const end = new Date(`${eDate}T${endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) { setError(L.invalid); setResult(null); return; }
    // No dates + end not after start → roll end to the next day (past midnight).
    if (!startDate && !endDate && end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
    const ms = Math.abs(end.getTime() - start.getTime());
    const totalSec = Math.floor(ms / 1000);
    setResult({
      days: Math.floor(totalSec / 86400),
      h: Math.floor((totalSec % 86400) / 3600),
      m: Math.floor((totalSec % 3600) / 60),
      s: totalSec % 60,
      totalHours: (ms / 3600000).toFixed(2),
      totalMin: Math.floor(ms / 60000),
      totalSec,
    });
    setError('');
  }, [startTime, endTime, startDate, endDate, L.invalid]);

  const swap = () => { setStartTime(endTime); setEndTime(startTime); setStartDate(endDate); setEndDate(startDate); setResult(null); };
  const reset = () => { setStartTime('09:00'); setEndTime('17:00'); setStartDate(''); setEndDate(''); setResult(null); setError(''); };
  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.h}${L.h} ${result.m}${L.m} ${result.s}${L.s} (${result.totalHours}h)`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const durationText = (result && result.days > 0 ? `${result.days}${L.d} ` : '') +
    (result ? `${result.h}${L.h} ${result.m}${L.m} ${result.s}${L.s}` : '');

  return (
    <div className="calc-card" id="mode-diff">
      <div className="calc-io">
        <div className="io-card">
          <span className="io-badge io-badge--start">{L.start}</span>
          <label className="field"><span>{L.time}</span>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} aria-label={`${L.start} ${L.time}`} />
          </label>
          <label className="field"><span>{L.date} <em>({L.optional})</em></span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} aria-label={`${L.start} ${L.date}`} />
          </label>
        </div>

        <button className="swap-btn" type="button" onClick={swap} aria-label={L.swap} title={L.swap}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 16H21M7 16l3-3M7 16l3 3M17 8H3M17 8l-3-3M17 8l-3 3" /></svg>
        </button>

        <div className="io-card">
          <span className="io-badge io-badge--end">{L.end}</span>
          <label className="field"><span>{L.time}</span>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} aria-label={`${L.end} ${L.time}`} />
          </label>
          <label className="field"><span>{L.date} <em>({L.optional})</em></span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} aria-label={`${L.end} ${L.date}`} />
          </label>
        </div>
      </div>

      <p className="calc-hint">{L.hint}</p>
      <button className="calc-submit" type="button" onClick={calc} id="td-calc-btn">{L.calc}</button>
      {error && <p role="alert" style={{ color: 'var(--warn)', marginTop: '12px', fontWeight: 500, textAlign: 'center' }}>{error}</p>}

      {result && (
        <div className="result-hero" id="td-result">
          <div className="result-hero__label">{L.duration}</div>
          <div className="result-hero__duration">{durationText}</div>
          <div className="result-hero__stats">
            <div><strong>{result.totalHours}</strong><span>{L.totalHours}</span></div>
            <div><strong>{result.totalMin.toLocaleString()}</strong><span>{L.totalMins}</span></div>
            <div><strong>{result.totalSec.toLocaleString()}</strong><span>{L.totalSecs}</span></div>
          </div>
          <div className="result-hero__actions">
            <button type="button" onClick={copy}>{copied ? L.copied : L.copy}</button>
            <button type="button" onClick={reset}>{L.reset}</button>
          </div>
          <p className="result-hero__note">{L.note}</p>
        </div>
      )}
    </div>
  );
}
