import { useState, useCallback } from 'react';
import { computeShift, type ShiftResult } from '../../lib/shift';

interface Props { lang?: 'de' | 'en'; defaultStart?: string; defaultEnd?: string; defaultBreak?: number; }

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const pad = (n: number) => String(n).padStart(2, '0');

export default function WorkHoursCalc({ lang = 'de', defaultStart = '09:00', defaultEnd = '17:00', defaultBreak = 30 }: Props) {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [brk, setBrk] = useState(defaultBreak);
  const [result, setResult] = useState<ShiftResult | null>(null);
  const [copied, setCopied] = useState(false);

  const L = lang === 'de' ? {
    start: 'Start', end: 'Ende', startTime: 'Arbeitsbeginn', endTime: 'Arbeitsende', break: 'Pause (Minuten)',
    swap: 'Start und Ende tauschen', calc: 'Berechnen', net: 'Nettoarbeitszeit',
    decimal: 'Dezimalstunden', gross: 'Bruttozeit', breakMin: 'Min Pause',
    copy: 'Ergebnis kopieren', copied: 'Kopiert', reset: 'Zurücksetzen',
    note: 'ArbZG: ab 6 Std sind 30 Min, ab 9 Std 45 Min Pause vorgeschrieben.',
    now: 'Jetzt', midnight: 'Mitternacht', noon: 'Mittag',
  } : {
    start: 'Start', end: 'End', startTime: 'Start time', endTime: 'End time', break: 'Break (minutes)',
    swap: 'Swap start and end', calc: 'Calculate', net: 'Net work time',
    decimal: 'Decimal hours', gross: 'Gross time', breakMin: 'min break',
    copy: 'Copy result', copied: 'Copied', reset: 'Reset',
    note: 'A shift over 6 hours usually requires a 20–30 minute unpaid break.',
    now: 'Now', midnight: 'Midnight', noon: 'Noon',
  };

  const nowHHMM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  const calc = useCallback(() => {
    setResult(computeShift({ startMin: toMin(start), endMin: toMin(end), breakMin: Number(brk) || 0 }, lang));
  }, [start, end, brk, lang]);

  const swap = () => { setStart(end); setEnd(start); setResult(null); };
  const reset = () => { setStart('09:00'); setEnd('17:00'); setBrk(30); setResult(null); };
  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.netHHMM} (${result.netDecimalStr}h)`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="calc-card" id="mode-work">
      <div className="calc-io">
        <div className="io-card">
          <span className="io-badge io-badge--start">{L.start}</span>
          <label className="field"><span>{L.startTime}</span>
            <input type="time" value={start} onChange={e => setStart(e.target.value)} aria-label={L.startTime} />
          </label>
          <div className="quick-fill">
            <button type="button" onClick={() => setStart(nowHHMM())}>{L.now}</button>
            <button type="button" onClick={() => setStart('00:00')}>{L.midnight}</button>
            <button type="button" onClick={() => setStart('12:00')}>{L.noon}</button>
          </div>
        </div>

        <button className="swap-btn" type="button" onClick={swap} aria-label={L.swap} title={L.swap}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 16H21M7 16l3-3M7 16l3 3M17 8H3M17 8l-3-3M17 8l-3 3" /></svg>
        </button>

        <div className="io-card">
          <span className="io-badge io-badge--end">{L.end}</span>
          <label className="field"><span>{L.endTime}</span>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)} aria-label={L.endTime} />
          </label>
          <div className="quick-fill">
            <button type="button" onClick={() => setEnd(nowHHMM())}>{L.now}</button>
            <button type="button" onClick={() => setEnd('00:00')}>{L.midnight}</button>
            <button type="button" onClick={() => setEnd('12:00')}>{L.noon}</button>
          </div>
        </div>
      </div>

      <label className="field field--break">
        <span>{L.break}</span>
        <input type="number" min={0} max={480} value={brk} onChange={e => setBrk(Number(e.target.value))} />
      </label>

      <button className="calc-submit" type="button" onClick={calc} id="wh-calc-btn">{L.calc}</button>

      {result && (
        <div className="result-hero" id="wh-result">
          <div className="result-hero__label">{L.net}</div>
          <div className="result-hero__duration">{result.netHHMM}</div>
          <div className="result-hero__stats">
            <div><strong>{result.netDecimalStr}</strong><span>{L.decimal}</span></div>
            <div><strong>{result.grossHHMM}</strong><span>{L.gross}</span></div>
            <div><strong>{brk}</strong><span>{L.breakMin}</span></div>
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
