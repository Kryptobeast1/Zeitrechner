import { useState, useCallback } from 'react';
import { calcAddSubtract } from '../../lib/timeEngine';
import type { AddSubtractResult } from '../../lib/timeEngine';

interface Props {
  lang?: 'de' | 'en';
}

const pad = (n: number) => String(n).padStart(2, '0');

function nowISO(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ExampleEntry {
  label: string;
  baseH: number;
  baseM: number;
  days: number;
  hours: number;
  minutes: number;
  op: 'add' | 'subtract';
}

const EN_EXAMPLES: ExampleEntry[] = [
  { label: '+3h 45m from 14:30', baseH: 14, baseM: 30, days: 0, hours: 3, minutes: 45, op: 'add' },
  { label: '+8h from 09:00', baseH: 9, baseM: 0, days: 0, hours: 8, minutes: 0, op: 'add' },
  { label: '−2h 30m from 17:00', baseH: 17, baseM: 0, days: 0, hours: 2, minutes: 30, op: 'subtract' },
  { label: '+1 day from now', baseH: -1, baseM: -1, days: 1, hours: 0, minutes: 0, op: 'add' },
];

const DE_EXAMPLES: ExampleEntry[] = [
  { label: '+3h 45m ab 14:30', baseH: 14, baseM: 30, days: 0, hours: 3, minutes: 45, op: 'add' },
  { label: '+8h ab 09:00', baseH: 9, baseM: 0, days: 0, hours: 8, minutes: 0, op: 'add' },
  { label: '−2h 30m ab 17:00', baseH: 17, baseM: 0, days: 0, hours: 2, minutes: 30, op: 'subtract' },
  { label: '+1 Tag ab jetzt', baseH: -1, baseM: -1, days: 1, hours: 0, minutes: 0, op: 'add' },
];

function makeBase(h: number, m: number): string {
  if (h === -1) return nowISO();
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AddSubtractCalc({ lang = 'de' }: Props) {
  const [base, setBase] = useState(nowISO());
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);
  const [op, setOp] = useState<'add' | 'subtract'>('add');
  const [result, setResult] = useState<AddSubtractResult | null>(null);
  const [copied, setCopied] = useState(false);

  const EXAMPLES = lang === 'de' ? DE_EXAMPLES : EN_EXAMPLES;

  const L = lang === 'de' ? {
    badge: 'Basis', baseTime: 'Basisdatum & Uhrzeit', days: 'Tage', hours: 'Stunden', mins: 'Minuten',
    add: 'Addieren', subtract: 'Subtrahieren', calc: 'Berechnen', now: 'Jetzt',
    result: 'Ergebniszeit', copy: 'Ergebnis kopieren', copied: 'Kopiert', reset: 'Zurücksetzen',
    examples: 'Beispiele', date: 'Datum', time12: '12-Stunden', offset: 'Verschiebung',
    note: 'Ergebnis rollt automatisch über Mitternacht und Datumsgrenzen.',
  } : {
    badge: 'Base', baseTime: 'Base date & time', days: 'Days', hours: 'Hours', mins: 'Minutes',
    add: 'Add', subtract: 'Subtract', calc: 'Calculate', now: 'Now',
    result: 'Result time', copy: 'Copy result', copied: 'Copied', reset: 'Reset',
    examples: 'Examples', date: 'Date', time12: '12-hour', offset: 'Offset',
    note: 'The result rolls across midnight and date boundaries automatically.',
  };

  const handleCalculate = useCallback(() => {
    const r = calcAddSubtract({ baseISO: base, days, hours, minutes, operation: op });
    setResult(r);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'add');
    url.searchParams.set('base', base);
    url.searchParams.set('op', op);
    url.searchParams.set('d', days.toString());
    url.searchParams.set('h', hours.toString());
    url.searchParams.set('m', minutes.toString());
    window.history.replaceState({}, '', url.toString());
  }, [base, days, hours, minutes, op]);

  const applyExample = (ex: ExampleEntry) => {
    setBase(makeBase(ex.baseH, ex.baseM));
    setDays(ex.days);
    setHours(ex.hours);
    setMinutes(ex.minutes);
    setOp(ex.op);
    setResult(null);
  };

  const reset = () => {
    setBase(nowISO()); setDays(0); setHours(3); setMinutes(0); setOp('add'); setResult(null);
  };

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.resultFormatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <div className="calc-card" id="mode-add">
      <div className="examples-bar">
        <span className="examples-label">{L.examples}:</span>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="chip" onClick={() => applyExample(ex)}>
            {ex.label}
          </button>
        ))}
      </div>

      <div className="io-card io-card--wide">
        <span className="io-badge io-badge--start">{L.badge}</span>
        <label className="field"><span>{L.baseTime}</span>
          <input type="datetime-local" value={base} onChange={e => setBase(e.target.value)} aria-label={L.baseTime} />
        </label>
        <div className="quick-fill">
          <button type="button" onClick={() => setBase(nowISO())}>{L.now}</button>
        </div>
      </div>

      <div className="op-toggle" style={{ marginTop: '16px' }}>
        <button className={op === 'add' ? 'active' : ''} onClick={() => setOp('add')} id="as-add-btn">
          + {L.add}
        </button>
        <button className={op === 'subtract' ? 'active' : ''} onClick={() => setOp('subtract')} id="as-sub-btn">
          − {L.subtract}
        </button>
      </div>

      <div className="io-card io-card--wide" style={{ marginTop: '16px' }}>
        <div className="calc-grid calc-grid--3">
          <label className="field"><span>{L.days}</span>
            <input type="number" min={0} max={3650} value={days} onChange={e => setDays(Number(e.target.value))} />
          </label>
          <label className="field"><span>{L.hours}</span>
            <input type="number" min={0} max={999} value={hours} onChange={e => setHours(Number(e.target.value))} />
          </label>
          <label className="field"><span>{L.mins}</span>
            <input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <button className="calc-submit" onClick={handleCalculate} id="as-calc-btn" style={{ marginTop: '16px' }}>
        {L.calc}
      </button>

      {result && (
        <div className="result-hero" id="as-result">
          <div className="result-hero__label">{L.result}</div>
          <div className="result-hero__duration">{result.resultTime24}</div>
          <div className="result-hero__stats">
            <div><strong>{result.resultDate}</strong><span>{L.date}</span></div>
            <div><strong>{result.resultTime12}</strong><span>{L.time12}</span></div>
            <div><strong>{result.resultFormatted}</strong><span>{L.offset}</span></div>
          </div>
          <div className="result-hero__actions">
            <button type="button" onClick={handleCopy} id="as-copy-btn">{copied ? L.copied : L.copy}</button>
            <button type="button" onClick={reset}>{L.reset}</button>
          </div>
          <p className="result-hero__note">{L.note}</p>
        </div>
      )}
    </div>
  );
}
