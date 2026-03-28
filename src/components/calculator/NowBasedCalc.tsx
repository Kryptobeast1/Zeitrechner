import { useState, useEffect, useCallback } from 'react';
import { calcFromNow } from '../../lib/timeEngine';
import type { NowResult } from '../../lib/timeEngine';

interface Props {
  lang?: 'de' | 'en';
}

const EN_PRESETS = [
  { label: '+3h from now', hours: 3, minutes: 0, days: 0, op: 'add' as const },
  { label: '+30min from now', hours: 0, minutes: 30, days: 0, op: 'add' as const },
  { label: '+8h from now', hours: 8, minutes: 0, days: 0, op: 'add' as const },
  { label: '−2h from now', hours: 2, minutes: 0, days: 0, op: 'subtract' as const },
];

const DE_PRESETS = [
  { label: '+3h ab jetzt', hours: 3, minutes: 0, days: 0, op: 'add' as const },
  { label: '+30min ab jetzt', hours: 0, minutes: 30, days: 0, op: 'add' as const },
  { label: '+8h ab jetzt', hours: 8, minutes: 0, days: 0, op: 'add' as const },
  { label: '−2h ab jetzt', hours: 2, minutes: 0, days: 0, op: 'subtract' as const },
];

export default function NowBasedCalc({ lang = 'de' }: Props) {
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);
  const [days, setDays] = useState(0);
  const [op, setOp] = useState<'add' | 'subtract'>('add');
  const [result, setResult] = useState<NowResult | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [copied, setCopied] = useState(false);

  const PRESETS = lang === 'de' ? DE_PRESETS : EN_PRESETS;

  const L = lang === 'de' ? {
    days: 'Tage', hours: 'Stunden', mins: 'Minuten',
    add: 'Addieren', subtract: 'Subtrahieren',
    calc: 'Jetzt berechnen', headline: 'Ab jetzt',
    currentTime: 'Aktuelle Zeit', resultTime: 'Ergebniszeit',
    copy: 'Kopieren', presets: 'Beispiele',
  } : {
    days: 'Days', hours: 'Hours', mins: 'Minutes',
    add: 'Add', subtract: 'Subtract',
    calc: 'Calculate from Now', headline: 'From Now',
    currentTime: 'Current Time', resultTime: 'Result Time',
    copy: 'Copy', presets: 'Examples',
  };

  // Live current time display
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const handleCalculate = useCallback(() => {
    const r = calcFromNow({ hours, minutes, days, operation: op });
    setResult(r);
  }, [hours, minutes, days, op]);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setHours(p.hours);
    setMinutes(p.minutes);
    setDays(p.days);
    setOp(p.op);
    // Auto-calculate
    const r = calcFromNow({ hours: p.hours, minutes: p.minutes, days: p.days, operation: p.op });
    setResult(r);
  };

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.resultTime24} (${result.resultTime12})`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <div className="calc-card" id="mode-now">
      {/* Live clock */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-text-3)', marginBottom: '4px' }}>
            {L.currentTime}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--clr-accent)', lineHeight: 1 }}>
            {currentTime}
          </div>
        </div>
        <div style={{ fontSize: '2rem' }}>🕐</div>
      </div>

      <div className="examples-bar">
        <span className="examples-label">{L.presets}:</span>
        {PRESETS.map((p, i) => (
          <button key={i} className="chip" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Operation toggle */}
      <div className="op-toggle" style={{ marginBottom: '16px' }}>
        <button className={op === 'add' ? 'active' : ''} onClick={() => setOp('add')} id="now-add-btn">
          ➕ {L.add}
        </button>
        <button className={op === 'subtract' ? 'active' : ''} onClick={() => setOp('subtract')} id="now-sub-btn">
          ➖ {L.subtract}
        </button>
      </div>

      <div className="calc-grid calc-grid--3">
        <div className="field">
          <label htmlFor="now-days">{L.days}</label>
          <input id="now-days" type="number" min={0} max={3650} value={days} onChange={e => setDays(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="now-hours">{L.hours}</label>
          <input id="now-hours" type="number" min={0} max={999} value={hours} onChange={e => setHours(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="now-mins">{L.mins}</label>
          <input id="now-mins" type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
        </div>
      </div>

      <button className="calc-submit" onClick={handleCalculate} id="now-calc-btn">
        ⚡ {L.calc}
      </button>

      {result && (
        <div className="result-panel" id="now-result">
          <div className="result-headline">{L.headline}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {L.currentTime}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--clr-text-2)' }}>
                {result.baseTime24}
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'var(--clr-accent)' }}>
              {op === 'add' ? '→' : '←'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {L.resultTime}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                {result.resultTime24}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="badge badge--accent">🕐 {result.resultTime12}</span>
            <span className="badge badge--violet">📅 {result.resultDate}</span>
          </div>

          <div className="result-actions">
            <button className="btn btn--secondary" onClick={handleCopy} id="now-copy-btn">
              {copied ? '✓ Copied!' : `📋 ${L.copy}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
