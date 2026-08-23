import { useMemo, useState } from 'react';
import type { Subject } from '@/types/curriculum';
import { colorFor } from '@/lib/colors';

interface CatalogProps {
  subjects: Subject[];
  placedIds: Set<string>;
  onSelect: (id: string) => void;
  onPlace: (s: Subject) => void;
}

export function Catalog({ subjects, placedIds, onSelect, onPlace }: CatalogProps) {
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const semesters = useMemo(() => {
    const s = new Set<number>();
    subjects.forEach((x) => {
      if (x.semester) s.add(x.semester);
    });
    return [...s].sort((a, b) => a - b);
  }, [subjects]);

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (semFilter !== 'all') {
        if (semFilter === 'opt') {
          if (s.semester) return false;
        } else if (s.semester !== Number(semFilter)) return false;
      }
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      return true;
    });
  }, [subjects, search, semFilter, typeFilter]);

  return (
    <div
      style={{
        width: 376,
        flexShrink: 0,
        background: 'var(--panel)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--line)' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tárgy keresése…"
          style={{
            width: '100%',
            border: '1px solid var(--line2)',
            borderRadius: 10,
            padding: '9px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            background: '#FBFAF7',
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
          <Seg
            opts={[
              ['all', 'Mind'],
              ['kotelezo', 'Kötelező'],
              ['valaszthato', 'Választható'],
            ]}
            val={typeFilter}
            set={setTypeFilter}
          />
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
          <Chip active={semFilter === 'all'} onClick={() => setSemFilter('all')}>
            Összes félév
          </Chip>
          {semesters.map((s) => (
            <Chip key={s} active={semFilter === String(s)} onClick={() => setSemFilter(String(s))}>
              {s}.
            </Chip>
          ))}
          <Chip active={semFilter === 'opt'} onClick={() => setSemFilter('opt')}>
            Szabad
          </Chip>
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 10px' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 6px 8px' }}>
          {filtered.length} tárgy
        </div>
        {filtered.map((s) => (
          <SubjectCard
            key={s.id}
            s={s}
            placed={placedIds.has(s.id)}
            onClick={() => onSelect(s.id)}
            onPlace={() => onPlace(s)}
          />
        ))}
      </div>
    </div>
  );
}

function Seg({
  opts,
  val,
  set,
}: {
  opts: Array<[string, string]>;
  val: string;
  set: (v: string) => void;
}) {
  return (
    <div style={{ display: 'inline-flex', background: '#F0EEE7', borderRadius: 9, padding: 2 }}>
      {opts.map(([v, l]) => (
        <button
          key={v}
          onClick={() => set(v)}
          style={{
            border: 'none',
            borderRadius: 7,
            padding: '5px 11px',
            fontSize: 12,
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: val === v ? '#fff' : 'transparent',
            color: val === v ? 'var(--ink)' : 'var(--muted)',
            fontWeight: val === v ? 600 : 400,
            boxShadow: val === v ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: '1px solid ' + (active ? 'transparent' : 'var(--line2)'),
        borderRadius: 20,
        padding: '4px 11px',
        fontSize: 12,
        fontFamily: 'inherit',
        cursor: 'pointer',
        background: active ? 'var(--accent)' : '#fff',
        color: active ? '#fff' : 'var(--muted)',
      }}
    >
      {children}
    </button>
  );
}

function SubjectCard({
  s,
  placed,
  onClick,
  onPlace,
}: {
  s: Subject;
  placed: boolean;
  onClick: () => void;
  onPlace: () => void;
}) {
  const c = colorFor(s.id);
  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/subject-id', s.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      style={{
        border: '1px solid var(--line)',
        borderRadius: 13,
        padding: '10px 12px',
        marginBottom: 7,
        cursor: 'grab',
        background: placed ? '#FBFAF7' : '#fff',
        position: 'relative',
        transition: 'border-color .15s',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
    >
      <div
        style={{
          width: 4,
          alignSelf: 'stretch',
          borderRadius: 4,
          background: c.ink,
          opacity: 0.55,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 4 }}>
          {s.name}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 20,
              background: c.bg,
              color: c.ink,
              fontWeight: 600,
            }}
          >
            {s.credits.total} kr
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {s.semester ? `${s.semester}. félév` : 'szabadon'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {s.type === 'kotelezo' ? 'kötelező' : 'választható'}
          </span>
        </div>
        {s.prereqRaw && (
          <div style={{ fontSize: 10.5, color: 'var(--peach-ink)', marginTop: 4 }}>
            → {s.prereqRaw}
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlace();
        }}
        title="Tanrendbe"
        style={{
          border: 'none',
          background: placed ? 'var(--sage)' : '#F0EEE7',
          color: placed ? 'var(--sage-ink)' : 'var(--ink)',
          borderRadius: 9,
          width: 30,
          height: 30,
          fontSize: 16,
          cursor: 'pointer',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        {placed ? '✓' : '+'}
      </button>
    </div>
  );
}
