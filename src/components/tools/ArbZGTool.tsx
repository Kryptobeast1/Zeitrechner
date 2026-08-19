// German-law tools (Phase 7.3): Pausenrechner, Ruhezeit-Checker, Nachtzuschlag.
// All enforce real ArbZG thresholds via the single-source computeShift engine.
import { useState } from 'react';
import { computeShift, formatClockTime, formatDecimal } from '../../lib/shift';

type Mode = 'pause' | 'ruhezeit' | 'nachtzuschlag';
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export default function ArbZGTool({ mode }: { mode: Mode }) {
  const [start, setStart] = useState(mode === 'ruhezeit' ? '18:00' : '08:00');
  const [end, setEnd] = useState(mode === 'ruhezeit' ? '18:00' : mode === 'nachtzuschlag' ? '06:00' : '17:00');
  const [wage, setWage] = useState('15,00');
  const [premium, setPremium] = useState('25');

  const startMin = toMin(mode === 'ruhezeit' ? '00:00' : start);
  const r = computeShift({ startMin, endMin: toMin(end), breakMin: 0 }, 'de');

  return (
    <div className="tool">
      <div className="field-row">
        {mode !== 'ruhezeit' && (
          <label className="field">Beginn
            <input type="time" value={start} onChange={e => setStart(e.target.value)} />
          </label>
        )}
        <label className="field">{mode === 'ruhezeit' ? 'Arbeitsende' : 'Ende'}
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
        </label>
        {mode === 'nachtzuschlag' && (
          <>
            <label className="field">Stundenlohn (€)
              <input type="text" inputMode="decimal" value={wage} onChange={e => setWage(e.target.value)} />
            </label>
            <label className="field">Zuschlag (%)
              <input type="number" value={premium} onChange={e => setPremium(e.target.value)} />
            </label>
          </>
        )}
      </div>

      {mode === 'pause' && (() => {
        const req = r.grossMin > 9 * 60 ? 45 : r.grossMin > 6 * 60 ? 30 : 0;
        const net = Math.max(0, r.grossMin - req);
        return (
          <div className="result-panel">
            <p><strong>Anwesenheit:</strong> {r.grossHHMM} Std</p>
            <p><strong>Gesetzliche Pflichtpause (§ 4 ArbZG):</strong> {req} Minuten
              {req === 0 && ' — bei bis zu 6 Std keine Pflichtpause'}</p>
            <p><strong>Korrigierte Nettoarbeitszeit:</strong> <span className="tabular">{hhmm(net)}</span> ({formatDecimal(net / 60, 'de')} Std)</p>
          </div>
        );
      })()}

      {mode === 'ruhezeit' && (() => {
        const endMin = toMin(end);
        const next = (endMin + 11 * 60) % 1440;
        return (
          <div className="result-panel">
            <p><strong>Ruhezeit (§ 5 ArbZG):</strong> mindestens 11 Stunden ununterbrochen.</p>
            <p>Nach Arbeitsende um {formatClockTime(endMin)} Uhr darfst du frühestens um
              <strong> {formatClockTime(next)} Uhr</strong> wieder mit der Arbeit beginnen.</p>
          </div>
        );
      })()}

      {mode === 'nachtzuschlag' && (() => {
        const nightH = r.nightMinutes / 60;
        const w = parseFloat(wage.replace(',', '.')) || 0;
        const p = parseFloat(premium) || 0;
        const extra = nightH * w * (p / 100);
        return (
          <div className="result-panel">
            <p><strong>Nachtarbeit (23:00–06:00 Uhr):</strong> {r.nightMinutes} Minuten ({formatDecimal(nightH, 'de')} Std)</p>
            <p><strong>Zuschlag bei {p}%:</strong> {formatDecimal(extra, 'de')} € zusätzlich
              ({formatDecimal(w * (p / 100), 'de')} € pro Nachtstunde)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
              Ein Zuschlag von ~25 % gilt als üblich; § 6 ArbZG verlangt einen „angemessenen“ Ausgleich, ohne feste Prozentzahl.</p>
          </div>
        );
      })()}
    </div>
  );
}
