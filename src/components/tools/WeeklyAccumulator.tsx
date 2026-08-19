// Weekly accumulator (Phase 7.1): add each day, see week total + daily average.
// State lives only in the component — nothing is persisted.
import { useState } from 'react';
import { formatDecimal } from '../../lib/shift';

const parse = (s: string) => parseFloat(s.replace(',', '.')) || 0;

export default function WeeklyAccumulator({ lang = 'de' }: { lang?: 'de' | 'en' }) {
  const [days, setDays] = useState<number[]>([]);
  const [entry, setEntry] = useState('8,0');

  const t = lang === 'de'
    ? { add: 'Tag hinzufügen', total: 'Wochensumme', avg: 'Ø pro Tag', clear: 'Zurücksetzen', hours: 'Std', none: 'Noch keine Tage erfasst.', day: 'Tag' }
    : { add: 'Add day', total: 'Week total', avg: 'Avg / day', clear: 'Reset', hours: 'h', none: 'No days added yet.', day: 'Day' };

  const total = days.reduce((a, b) => a + b, 0);
  const avg = days.length ? total / days.length : 0;

  return (
    <div className="tool">
      <div className="field-row">
        <label className="field" style={{ flex: '1 1 160px' }}>{t.day} ({t.hours})
          <input type="text" inputMode="decimal" value={entry} onChange={e => setEntry(e.target.value)} />
        </label>
        <button className="calc-submit" style={{ flex: '0 0 auto', width: 'auto', padding: '0 20px' }}
          onClick={() => { setDays([...days, parse(entry)]); }}>{t.add}</button>
      </div>

      {days.length === 0 ? (
        <p style={{ color: 'var(--ink-3)' }}>{t.none}</p>
      ) : (
        <div className="acc-list">
          {days.map((h, i) => (
            <span key={i} className="chip">
              {t.day} {i + 1}: <strong className="tabular">{formatDecimal(h, lang)}</strong>{' '}{t.hours}
              <button aria-label="remove" onClick={() => setDays(days.filter((_, j) => j !== i))} style={{ marginLeft: 6, border: 0, background: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>×</button>
            </span>
          ))}
        </div>
      )}

      <div className="result-panel" style={{ marginTop: 16 }}>
        <p><strong>{t.total}:</strong> <span className="tabular">{formatDecimal(total, lang)}</span> {t.hours}
          {days.length > 0 && <> · <strong>{t.avg}:</strong> <span className="tabular">{formatDecimal(avg, lang)}</span> {t.hours}</>}</p>
        {days.length > 0 && <button className="chip" onClick={() => setDays([])}>{t.clear}</button>}
      </div>
    </div>
  );
}
