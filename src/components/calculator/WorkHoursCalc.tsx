import { useState, useCallback } from 'react';
import { calcWorkHours } from '../../lib/timeEngine';
import type { WorkHoursResult } from '../../lib/timeEngine';

interface Props {
  lang?: 'de' | 'en';
  defaultStart?: string;
  defaultEnd?: string;
  defaultBreak?: number;
}

const WORK_EXAMPLES = [
  { label: '9:00–17:00, 30min', start: '09:00', end: '17:00', breakMin: 30 },
  { label: '8:00–17:00, 60min', start: '08:00', end: '17:00', breakMin: 60 },
  { label: '7:00–15:00, 30min', start: '07:00', end: '15:00', breakMin: 30 },
  { label: '10:00–18:00, 45min', start: '10:00', end: '18:00', breakMin: 45 },
];

export default function WorkHoursCalc({ lang = 'de', defaultStart = '09:00', defaultEnd = '17:00', defaultBreak = 30 }: Props) {
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [breakMin, setBreakMin] = useState(defaultBreak);
  const [result, setResult] = useState<WorkHoursResult | null>(null);
  const [copied, setCopied] = useState(false);

  const L = lang === 'de' ? {
    startTime: 'Arbeitsbeginn', endTime: 'Arbeitsende', breakDur: 'Pause (Minuten)',
    calc: 'Berechnen', headline: 'Nettoarbeitszeit', gross: 'Bruttozeit',
    net: 'Nettozeit', overtime: 'Überstunden', decimal: 'Dezimalstunden',
    copy: 'Kopieren', minBreak: 'Min Pause',
  } : {
    startTime: 'Start Time', endTime: 'End Time', breakDur: 'Break (minutes)',
    calc: 'Calculate', headline: 'Net Work Hours', gross: 'Gross Time',
    net: 'Net Time', overtime: 'Overtime', decimal: 'Decimal Hours',
    copy: 'Copy', minBreak: 'min break',
  };

  const handleCalculate = useCallback(() => {
    const r = calcWorkHours(startTime, endTime, breakMin);
    setResult(r);
  }, [startTime, endTime, breakMin]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(`Net: ${result.netHours}h ${result.netMinutes % 60}m (${result.netDecimal}h)`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  // Net % of an 8-hour workday
  const netPercent = result ? Math.min(100, (result.netMinutes / 480) * 100) : 0;

  return (
    <div className="calc-card" id="mode-work">
      <div className="examples-bar">
        <span className="examples-label">{lang === 'de' ? 'Beispiele' : 'Examples'}:</span>
        {WORK_EXAMPLES.map(ex => (
          <button key={ex.label} className="chip"
            onClick={() => { setStartTime(ex.start); setEndTime(ex.end); setBreakMin(ex.breakMin); setResult(null); }}>
            {ex.label}
          </button>
        ))}
      </div>

      <div className="calc-grid calc-grid--3">
        <div className="field">
          <label htmlFor="wh-start">{L.startTime}</label>
          <input id="wh-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="wh-end">{L.endTime}</label>
          <input id="wh-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="wh-break">{L.breakDur}</label>
          <input id="wh-break" type="number" min={0} max={480} value={breakMin}
            onChange={e => setBreakMin(Number(e.target.value))} />
        </div>
      </div>

      <button className="calc-submit" onClick={handleCalculate} id="wh-calc-btn">
        ⚡ {L.calc}
      </button>

      {result && (
        <div className="result-panel" id="wh-result">
          <div className="result-headline">{L.headline}</div>

          <div className="result-primary">
            <span className="result-number">{result.formatted}</span>
            <span className="result-unit">{L.net}</span>
          </div>

          <div className="result-breakdown">
            <div className="result-stat">
              <span className="stat-value">{result.grossHours}h {result.grossMinutes % 60}m</span>
              <span className="stat-label">{L.gross}</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{breakMin}</span>
              <span className="stat-label">{L.minBreak}</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{result.netDecimal}</span>
              <span className="stat-label">{L.decimal}</span>
            </div>
            {result.overtimeHours > 0 && (
              <div className="result-stat">
                <span className="stat-value" style={{ color: '#f59e0b' }}>+{result.overtimeHours.toFixed(2)}h</span>
                <span className="stat-label">{L.overtime}</span>
              </div>
            )}
          </div>

          {/* Timeline: day 0–8h */}
          <div className="timeline">
            <div className="timeline__labels">
              <span>{startTime}</span>
              <span>{endTime}</span>
            </div>
            <div className="timeline__track">
              <div className="timeline__fill" style={{ width: `${netPercent}%` }} />
            </div>
            <div className="timeline__hours">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn--secondary" onClick={handleCopy} id="wh-copy-btn">
              {copied ? (lang === 'de' ? '✓ Kopiert' : '✓ Copied!') : `📋 ${L.copy}`}
            </button>
            <button className="btn btn--ghost" onClick={() => window.print()} id="wh-print-btn">
              🖨️ {lang === 'de' ? 'Drucken' : 'Print'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
