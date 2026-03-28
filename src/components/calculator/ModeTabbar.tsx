import { useState } from 'react';
import TimeDiffCalc from './TimeDiffCalc';
import AddSubtractCalc from './AddSubtractCalc';
import WorkHoursCalc from './WorkHoursCalc';
import CountdownCalc from './CountdownCalc';
import NowBasedCalc from './NowBasedCalc';

interface Props {
  lang?: 'de' | 'en';
  defaultMode?: string;
}

type Mode = 'diff' | 'add' | 'work' | 'countdown' | 'now';

const MODES: { id: Mode; icon: string; deLabel: string; enLabel: string }[] = [
  { id: 'diff', icon: '⏱', deLabel: 'Differenz', enLabel: 'Difference' },
  { id: 'add', icon: '➕', deLabel: 'Addieren', enLabel: 'Add/Subtract' },
  { id: 'work', icon: '💼', deLabel: 'Arbeitsstunden', enLabel: 'Work Hours' },
  { id: 'countdown', icon: '⏳', deLabel: 'Countdown', enLabel: 'Countdown' },
  { id: 'now', icon: '🕐', deLabel: 'Ab jetzt', enLabel: 'From Now' },
];

export default function ModeTabbar({ lang = 'de', defaultMode = 'diff' }: Props) {
  const [activeMode, setActiveMode] = useState<Mode>(defaultMode as Mode);

  return (
    <div>
      {/* Tab bar */}
      <div className="mode-tabbar" role="tablist" aria-label={lang === 'de' ? 'Rechner-Modi' : 'Calculator Modes'}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            role="tab"
            aria-selected={activeMode === mode.id}
            aria-controls={`mode-${mode.id}`}
            className={`mode-tab${activeMode === mode.id ? ' active' : ''}`}
            onClick={() => setActiveMode(mode.id)}
            id={`tab-${mode.id}`}
          >
            <span className="tab-icon">{mode.icon}</span>
            {lang === 'de' ? mode.deLabel : mode.enLabel}
          </button>
        ))}
      </div>

      {/* Calculator panels */}
      <div style={{ marginTop: '16px' }}>
        {activeMode === 'diff' && <TimeDiffCalc lang={lang} />}
        {activeMode === 'add' && <AddSubtractCalc lang={lang} />}
        {activeMode === 'work' && <WorkHoursCalc lang={lang} />}
        {activeMode === 'countdown' && <CountdownCalc lang={lang} />}
        {activeMode === 'now' && <NowBasedCalc lang={lang} />}
      </div>

      {/* Related query suggestions */}
      <div className="suggestion-row" style={{ marginTop: '20px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginRight: '4px' }}>
          {lang === 'de' ? 'Häufig gesucht:' : 'Popular queries:'}
        </span>
        {lang === 'de' ? [
          'Wie viele Stunden von 9 bis 17?',
          '3 Stunden ab jetzt',
          'Arbeitsstunden Rechner',
          'Countdown Weihnachten',
        ].map(q => (
          <span key={q} className="chip">{q}</span>
        )) : [
          'Hours between 9 and 5',
          '3 hours from now',
          'Work hours calculator',
          'Days until Christmas',
        ].map(q => (
          <span key={q} className="chip">{q}</span>
        ))}
      </div>
    </div>
  );
}
