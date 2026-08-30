import type { Subject } from '@/types/curriculum';
import { colorFor } from '@/lib/colors';
import { Overlay } from '@/components/ui/primitives';
import { btn } from '@/components/ui/buttonStyles';

interface DetailPanelProps {
  subj: Subject;
  subjects: Subject[];
  onClose: () => void;
  onPlace: (s: Subject) => void;
}

export function DetailPanel({ subj, subjects, onClose, onPlace }: DetailPanelProps) {
  const c = colorFor(subj.id);
  const prereqs = subj.prereqIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is Subject => Boolean(s));
  const unlocks = subjects.filter((s) => s.prereqIds.includes(subj.id));

  return (
    <Overlay onClose={onClose} right>
      <div style={{ width: 'min(360px, calc(100vw - 48px))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div
            style={{ width: 6, height: 40, borderRadius: 4, background: c.ink, opacity: 0.6, marginBottom: 12 }}
          />
          <button
            onClick={onClose}
            aria-label="Bezárás"
            title="Bezárás"
            style={{
              border: 'none',
              background: '#F0EEE7',
              color: 'var(--ink)',
              borderRadius: 8,
              width: 28,
              height: 28,
              fontSize: 14,
              cursor: 'pointer',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        <div className="disp" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, marginBottom: 6 }}>
          {subj.name}
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          <Tag bg={c.bg} ink={c.ink}>
            {subj.credits.total} kredit
          </Tag>
          <Tag>{subj.type === 'kotelezo' ? 'kötelező' : 'választható'}</Tag>
          <Tag>{subj.semester ? `${subj.semester}. félév` : subj.semesterLabel}</Tag>
        </div>

        <Row k="Előadás" v={`${subj.credits.ea ?? '–'} kr · ${subj.hours.ea ?? '–'} óra`} />
        <Row k="Gyakorlat" v={`${subj.credits.gy ?? '–'} kr · ${subj.hours.gy ?? '–'} óra`} />
        {subj.prereqRaw && <Row k="Előfeltétel" v={subj.prereqRaw} peach />}
        {subj.note && <Row k="Megjegyzés" v={subj.note} muted />}

        {prereqs.length > 0 && (
          <Block title="Ehhez kell előbb">
            {prereqs.map((p) => (
              <MiniCard key={p.id} s={p} />
            ))}
          </Block>
        )}
        {unlocks.length > 0 && (
          <Block title="Ezt nyitja meg">
            {unlocks.map((p) => (
              <MiniCard key={p.id} s={p} />
            ))}
          </Block>
        )}

        <button onClick={() => onPlace(subj)} style={{ ...btn(true), width: '100%', marginTop: 18 }}>
          Tanrendbe helyezés
        </button>
      </div>
    </Overlay>
  );
}

function MiniCard({ s }: { s: Subject }) {
  const c = colorFor(s.id);
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '6px 9px',
        border: '1px solid var(--line)',
        borderRadius: 9,
        marginBottom: 5,
      }}
    >
      <div style={{ width: 3, height: 20, background: c.ink, opacity: 0.5, borderRadius: 3 }} />
      <span style={{ fontSize: 12 }}>{s.name}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '.05em',
          color: 'var(--muted)',
          marginBottom: 7,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v, peach, muted }: { k: string; v: string; peach?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '7px 0', borderTop: '1px solid var(--line)' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', width: 88, flexShrink: 0 }}>{k}</span>
      <span
        style={{
          fontSize: 12.5,
          color: peach ? 'var(--peach-ink)' : muted ? 'var(--muted)' : 'var(--ink)',
        }}
      >
        {v}
      </span>
    </div>
  );
}

function Tag({ children, bg, ink }: { children: React.ReactNode; bg?: string; ink?: string }) {
  return (
    <span
      style={{
        fontSize: 11.5,
        padding: '3px 10px',
        borderRadius: 20,
        fontWeight: 600,
        background: bg || '#F0EEE7',
        color: ink || 'var(--ink)',
      }}
    >
      {children}
    </span>
  );
}
