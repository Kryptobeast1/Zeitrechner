import { useState, useCallback } from 'react';
import { calcAddSubtract } from '../../lib/timeEngine';
import type { AddSubtractResult } from '../../lib/timeEngine';

interface Props {
  lang?: 'de' | 'en';
}

function nowISO(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
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
  return d.toISOString().slice(0, 16);
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
    baseTime: 'Basiszeit', days: 'Tage', hours: 'Stunden', mins: 'Minuten',
    add: 'Addieren', subtract: 'Subtrahieren', calc: 'Berechnen',
    result: 'Ergebnis', copy: 'Kopieren', examples: 'Beispiele',
  } : {
    baseTime: 'Base Date & Time', days: 'Days', hours: 'Hours', mins: 'Minutes',
    add: 'Add', subtract: 'Subtract', calc: 'Calculate',
    result: 'Result', copy: 'Copy', examples: 'Examples',
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

      <div className="calc-grid calc-grid--full" style={{ marginBottom: '16px' }}>
        <div className="field">
          <label htmlFor="as-base">{L.baseTime}</label>
          <input id="as-base" type="datetime-local" value={base} onChange={e => setBase(e.target.value)} />
        </div>
      </div>

      <div className="op-toggle" style={{ marginBottom: '16px' }}>
        <button className={op === 'add' ? 'active' : ''} onClick={() => setOp('add')} id="as-add-btn">
          ➕ {L.add}
        </button>
        <button className={op === 'subtract' ? 'active' : ''} onClick={() => setOp('subtract')} id="as-sub-btn">
          ➖ {L.subtract}
        </button>
      </div>

      <div className="calc-grid calc-grid--3">
        <div className="field">
          <label htmlFor="as-days">{L.days}</label>
          <input id="as-days" type="number" min={0} max={3650} value={days} onChange={e => setDays(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="as-hours">{L.hours}</label>
          <input id="as-hours" type="number" min={0} max={999} value={hours} onChange={e => setHours(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="as-mins">{L.mins}</label>
          <input id="as-mins" type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
        </div>
      </div>

      <button className="calc-submit" onClick={handleCalculate} id="as-calc-btn">
        ⚡ {L.calc}
      </button>

      {result && (
        <div className="result-panel" id="as-result">
          <div className="result-headline">{L.result}</div>

          <div className="result-primary">
            <span className="result-number" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              {result.resultTime24}
            </span>
            <span className="result-unit">{result.resultDate}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="badge badge--accent">🕐 {result.resultTime12}</span>
            <span className="badge badge--violet">📅 {result.resultFormatted}</span>
          </div>

          <div className="result-actions">
            <button className="btn btn--secondary" onClick={handleCopy} id="as-copy-btn">
              {copied ? (lang === 'de' ? '✓ Kopiert' : '✓ Copied!') : `📋 ${L.copy}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
