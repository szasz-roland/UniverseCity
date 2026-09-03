import { useRef, useState } from 'react';
import { useDndMonitor, type DragEndEvent, type DragMoveEvent } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import type { PlacedSubject, Subject } from '@/types/curriculum';
import { colorFor } from '@/lib/colors';
import { DAY_END, DAY_START, DAYS, fmt, ROW_H, ROWS, SLOT } from '@/lib/grid';

interface TimetableProps {
  placed: PlacedSubject[];
  conflicts: Set<string>;
  subjects: Subject[];
  addToGrid: (s: Subject, day: number, start: number, dur: number) => void;
  removePlaced: (uid: string) => void;
  movePlaced: (uid: string, patch: Partial<PlacedSubject>) => void;
  selectMode: boolean;
  chosen: Set<string>;
  toggleChosen: (uid: string) => void;
}

const DEFAULT_DUR = 90;

export function Timetable({
  placed,
  conflicts,
  subjects,
  addToGrid,
  removePlaced,
  movePlaced,
  selectMode,
  chosen,
  toggleChosen,
}: TimetableProps) {
  const colRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [dropHint, setDropHint] = useState<{ day: number; start: number } | null>(null);

  function yToStartInCol(colEl: HTMLElement, clientY: number, dur: number): number {
    const rect = colEl.getBoundingClientRect();
    const slot = Math.round((clientY - rect.top) / ROW_H);
    const mins = DAY_START * 60 + slot * SLOT;
    return Math.max(DAY_START * 60, Math.min(DAY_END * 60 - dur, mins));
  }

  /** Which day column (if any) a viewport X falls within. */
  function dayAtX(clientX: number): number | null {
    let hit: number | null = null;
    colRefs.current.forEach((el, idx) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX < r.right) hit = idx;
    });
    return hit;
  }

  // Catalog card → grid drag (dnd-kit; works for mouse, touch, and pen alike).
  // The activatorEvent + delta gives the live pointer position without needing
  // per-column droppable zones — same day/time math as the existing block-move drag.
  useDndMonitor({
    onDragMove(event: DragMoveEvent) {
      const coords = getEventCoordinates(event.activatorEvent);
      if (!coords) return;
      const clientX = coords.x + event.delta.x;
      const clientY = coords.y + event.delta.y;
      const day = dayAtX(clientX);
      const el = day === null ? null : colRefs.current[day];
      setDropHint(el ? { day: day as number, start: yToStartInCol(el, clientY, DEFAULT_DUR) } : null);
    },
    onDragEnd(event: DragEndEvent) {
      setDropHint(null);
      const coords = getEventCoordinates(event.activatorEvent);
      if (!coords) return;
      const clientX = coords.x + event.delta.x;
      const clientY = coords.y + event.delta.y;
      const day = dayAtX(clientX);
      const el = day === null ? null : colRefs.current[day];
      if (day === null || !el) return;
      const subj = subjects.find((x) => x.id === String(event.active.id));
      if (!subj) return;
      addToGrid(subj, day, yToStartInCol(el, clientY, DEFAULT_DUR), DEFAULT_DUR);
    },
    onDragCancel() {
      setDropHint(null);
    },
  });

  function onBlockPointerDown(e: React.PointerEvent, p: PlacedSubject) {
    if (selectMode) return;
    e.preventDefault();
    const startY = e.clientY;
    const origStart = p.start;
    const origDay = p.day;
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      let ns = origStart + Math.round(dy / ROW_H) * SLOT;
      ns = Math.max(DAY_START * 60, Math.min(DAY_END * 60 - p.dur, ns));
      let nd = origDay;
      colRefs.current.forEach((el, idx) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX < r.right) nd = idx;
      });
      movePlaced(p.uid, { start: ns, day: nd });
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  function onResize(e: React.PointerEvent, p: PlacedSubject) {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const orig = p.dur;
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      let nd = orig + Math.round(dy / ROW_H) * SLOT;
      nd = Math.max(SLOT, Math.min(DAY_END * 60 - p.start, nd));
      movePlaced(p.uid, { dur: nd });
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(5,1fr)', minWidth: 640 }}>
        <div />
        {DAYS.map((d) => (
          <div
            key={d}
            style={{ textAlign: 'center', paddingBottom: 10, fontSize: 13, fontWeight: 600 }}
          >
            {d}
          </div>
        ))}

        {/* time gutter */}
        <div style={{ position: 'relative' }}>
          {ROWS.map((m) => (
            <div
              key={m}
              style={{
                height: ROW_H,
                textAlign: 'right',
                paddingRight: 8,
                fontSize: 10.5,
                color: 'var(--muted)',
                transform: 'translateY(-6px)',
              }}
            >
              {m % 60 === 0 ? fmt(m) : ''}
            </div>
          ))}
        </div>

        {/* day columns */}
        {DAYS.map((_, di) => (
          <div
            key={di}
            ref={(el) => {
              colRefs.current[di] = el;
            }}
            style={{ position: 'relative', borderLeft: '1px solid var(--line)' }}
          >
            {ROWS.map((m, i) => (
              <div
                key={m}
                style={{
                  height: ROW_H,
                  borderTop: '1px solid ' + (m % 60 === 0 ? 'var(--line2)' : 'var(--line)'),
                  background: i % 2 ? 'transparent' : 'rgba(0,0,0,0.008)',
                }}
              />
            ))}

            {dropHint && dropHint.day === di && (
              <div
                style={{
                  position: 'absolute',
                  left: 3,
                  right: 3,
                  top: ((dropHint.start - DAY_START * 60) / SLOT) * ROW_H,
                  height: (DEFAULT_DUR / SLOT) * ROW_H - 3,
                  borderRadius: 9,
                  border: '2px dashed var(--accent)',
                  background: 'rgba(108,92,224,.07)',
                  pointerEvents: 'none',
                }}
              />
            )}

            {placed
              .filter((p) => p.day === di)
              .map((p) => {
                const s = subjects.find((x) => x.id === p.subjectId);
                if (!s) return null;
                const c = colorFor(p.subjectId);
                const top = ((p.start - DAY_START * 60) / SLOT) * ROW_H;
                const h = (p.dur / SLOT) * ROW_H;
                const bad = conflicts.has(p.uid);
                const isChosen = chosen.has(p.uid);
                return (
                  <div
                    key={p.uid}
                    onPointerDown={(e) => onBlockPointerDown(e, p)}
                    onClick={(e) => {
                      if (selectMode) {
                        e.stopPropagation();
                        toggleChosen(p.uid);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top,
                      left: 3,
                      right: 3,
                      height: h - 3,
                      background: c.bg,
                      borderRadius: 9,
                      padding: '5px 8px',
                      cursor: selectMode ? 'pointer' : 'grab',
                      border: '1.5px solid ' + (isChosen ? 'var(--accent)' : bad ? '#D9534F' : c.ink),
                      outline: isChosen ? '2px solid var(--accent)' : 'none',
                      outlineOffset: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
                      overflow: 'hidden',
                      userSelect: 'none',
                      opacity: selectMode && !isChosen ? 0.7 : 1,
                    }}
                  >
                    {selectMode && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          border: '1.5px solid ' + (isChosen ? 'var(--accent)' : c.ink),
                          background: isChosen ? 'var(--accent)' : 'rgba(255,255,255,.7)',
                          color: '#fff',
                          fontSize: 11,
                          lineHeight: '14px',
                          textAlign: 'center',
                        }}
                      >
                        {isChosen ? '✓' : ''}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: c.ink,
                        lineHeight: 1.2,
                        paddingLeft: selectMode ? 18 : 0,
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 10, color: c.ink, opacity: 0.8 }}>
                      {fmt(p.start)}–{fmt(p.start + p.dur)}
                    </div>
                    {bad && (
                      <div style={{ fontSize: 9.5, color: '#B8322E', fontWeight: 600, marginTop: 1 }}>
                        ütközés
                      </div>
                    )}
                    {!selectMode && (
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlaced(p.uid);
                        }}
                        aria-label={`${s.name} eltávolítása`}
                        title="Eltávolítás"
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          border: 'none',
                          background: 'rgba(255,255,255,.6)',
                          borderRadius: 6,
                          width: 17,
                          height: 17,
                          fontSize: 11,
                          cursor: 'pointer',
                          lineHeight: 1,
                          color: c.ink,
                        }}
                      >
                        ×
                      </button>
                    )}
                    {!selectMode && (
                      <div
                        onPointerDown={(e) => onResize(e, p)}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 7,
                          cursor: 'ns-resize',
                        }}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
