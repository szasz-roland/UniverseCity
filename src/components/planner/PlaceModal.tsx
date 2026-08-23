import { useState } from 'react';
import type { Subject } from '@/types/curriculum';
import { colorFor } from '@/lib/colors';
import { DAYS, DAYS_SHORT } from '@/lib/grid';
import { Overlay, btn } from '@/components/ui/primitives';

interface PlaceModalProps {
  subj: Subject;
  onClose: () => void;
  onPlace: (day: number, start: number, dur: number) => void;
}

export function PlaceModal({ subj, onClose, onPlace }: PlaceModalProps) {
  const [day, setDay] = useState(0);
  const [time, setTime] = useState('10:00');
  const [dur, setDur] = useState(90);
  const c = colorFor(subj.id);

  function submit() {
    const [hh, mm] = time.split(':').map(Number);
    onPlace(day, hh * 60 + mm, dur);
  }

  const inp: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--line2)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    background: '#FBFAF7',
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 360 }}>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 5, height: 34, borderRadius: 4, background: c.ink, opacity: 0.6 }} />
          <div>
            <div className="disp" style={{ fontSize: 17, fontWeight: 600 }}>
              {subj.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {subj.credits.total} kredit · {subj.type === 'kotelezo' ? 'kötelező' : 'választható'}
            </div>
          </div>
        </div>

        <Field label="Nap">
          <div style={{ display: 'flex', gap: 5 }}>
            {DAYS.map((_, i) => (
              <button
                key={i}
                onClick={() => setDay(i)}
                style={{
                  flex: 1,
                  border: '1px solid ' + (day === i ? 'transparent' : 'var(--line2)'),
                  borderRadius: 8,
                  padding: '8px 0',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  background: day === i ? 'var(--accent)' : '#fff',
                  color: day === i ? '#fff' : 'var(--ink)',
                }}
              >
                {DAYS_SHORT[i]}
              </button>
            ))}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Kezdés" flex>
            <input
              type="time"
              value={time}
              min="06:00"
              max="23:00"
              step={1800}
              onChange={(e) => setTime(e.target.value)}
              style={inp}
            />
          </Field>
          <Field label="Hossz (perc)" flex>
            <select value={dur} onChange={(e) => setDur(Number(e.target.value))} style={inp}>
              {[45, 60, 90, 120, 150, 180].map((d) => (
                <option key={d} value={d}>
                  {d} perc
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 20 }}>
          <button onClick={onClose} style={{ ...btn(), flex: 1 }}>
            Mégse
          </button>
          <button onClick={submit} style={{ ...btn(true), flex: 2 }}>
            Hozzáadás a tanrendhez
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Field({
  label,
  children,
  flex,
}: {
  label: string;
  children: React.ReactNode;
  flex?: boolean;
}) {
  return (
    <div style={{ marginBottom: 13, flex: flex ? 1 : 'none' }}>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
