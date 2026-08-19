// Gleitzeitkonto (Phase 7.3): flexitime balance with carry-over. Component state
// only — nothing is persisted.
import { useState } from 'react';
import { formatDecimal } from '../../lib/shift';

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
const parse = (s: string) => parseFloat(s.replace(',', '.')) || 0;
const fmt = (n: number) => (n >= 0 ? '+' : '−') + formatDecimal(Math.abs(n), 'de');

export default function GleitzeitTool() {
  const [carry, setCarry] = useState('0,0');
  const [soll, setSoll] = useState('8,0');
  const [ist, setIst] = useState<string[]>(['8,5', '8,0', '9,0', '7,5', '6,0']);

  const daily = ist.map(parse);
  const sollDay = parse(soll);
  const weekBalance = daily.reduce((s, h) => s + (h - sollDay), 0);
  const newBalance = parse(carry) + weekBalance;

  return (
    <div className="tool">
      <div className="field-row">
        <label className="field">Übertrag (Std)
          <input type="text" inputMode="decimal" value={carry} onChange={e => setCarry(e.target.value)} />
        </label>
        <label className="field">Soll / Tag (Std)
          <input type="text" inputMode="decimal" value={soll} onChange={e => setSoll(e.target.value)} />
        </label>
      </div>
      <div className="field-row" style={{ flexWrap: 'wrap' }}>
        {DAYS.map((d, i) => (
          <label className="field" key={d} style={{ flex: '1 1 90px' }}>{d} (Std)
            <input type="text" inputMode="decimal" value={ist[i]}
              onChange={e => { const n = [...ist]; n[i] = e.target.value; setIst(n); }} />
          </label>
        ))}
      </div>
      <div className="result-panel">
        <p><strong>Woche:</strong> {formatDecimal(daily.reduce((a, b) => a + b, 0), 'de')} Std gearbeitet ·
          Saldo diese Woche <span className="tabular">{fmt(weekBalance)}</span> Std</p>
        <p><strong>Neuer Gleitzeitsaldo (inkl. Übertrag):</strong>{' '}
          <span className="tabular" style={{ color: newBalance >= 0 ? 'var(--success)' : 'var(--warn)' }}>{fmt(newBalance)} Std</span></p>
      </div>
    </div>
  );
}
