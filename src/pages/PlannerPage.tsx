import { useState } from 'react';
import type { Subject } from '@/types/curriculum';
import { curriculum } from '@/data/curriculum';
import { usePlanner } from '@/components/planner/usePlanner';
import { SelectBar, TopBar } from '@/components/planner/TopBar';
import { Catalog } from '@/components/planner/Catalog';
import { Timetable } from '@/components/planner/Timetable';
import { PlaceModal } from '@/components/planner/PlaceModal';
import { DetailPanel } from '@/components/planner/DetailPanel';

const CATALOG_MIN_W = 260;
const CATALOG_MAX_W = 560;
const CATALOG_DEFAULT_W = 376;

export function PlannerPage() {
  const subjects = curriculum;
  const planner = usePlanner(subjects);

  const [selected, setSelected] = useState<string | null>(null);
  const [placing, setPlacing] = useState<Subject | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [chosen, setChosen] = useState<Set<string>>(() => new Set());
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [catalogWidth, setCatalogWidth] = useState(CATALOG_DEFAULT_W);

  function onCatalogResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const origWidth = catalogWidth;
    const move = (ev: PointerEvent) => {
      const next = origWidth + (ev.clientX - startX);
      setCatalogWidth(Math.max(CATALOG_MIN_W, Math.min(CATALOG_MAX_W, next)));
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  function toggleChosen(uid: string) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }
  function exitSelect() {
    setSelectMode(false);
    setChosen(new Set());
  }
  function deleteChosen() {
    planner.deleteMany(chosen);
    exitSelect();
  }

  const selectedSubject = selected ? subjects.find((s) => s.id === selected) : null;

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <TopBar
        placedCredits={planner.placedCredits}
        placedCount={planner.placedCount}
        hasPlaced={planner.placed.length > 0}
        selectMode={selectMode}
        onSelectMode={() => setSelectMode(true)}
        onDeleteAll={planner.deleteAll}
        onExportPdf={async () => {
          const { exportTimetablePdf } = await import('@/lib/pdfExport');
          await exportTimetablePdf(planner.placed, subjects, planner.conflicts);
        }}
        catalogOpen={catalogOpen}
        onToggleCatalog={() => setCatalogOpen((o) => !o)}
      />
      {selectMode && (
        <SelectBar count={chosen.size} onCancel={exitSelect} onDelete={deleteChosen} />
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div
          style={{
            position: 'relative',
            width: catalogOpen ? catalogWidth : 0,
            flexShrink: 0,
            overflow: 'hidden',
            visibility: catalogOpen ? 'visible' : 'hidden',
            borderRight: catalogOpen ? '1px solid var(--line)' : 'none',
            transition: catalogOpen
              ? 'width 220ms ease'
              : 'width 220ms ease, visibility 0s linear 220ms',
          }}
        >
          <Catalog
            subjects={subjects}
            placed={planner.placed}
            onSelect={setSelected}
            onPlace={setPlacing}
          />
          {catalogOpen && (
            <div
              onPointerDown={onCatalogResizeStart}
              title="Húzd az átméretezéshez"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 6,
                height: '100%',
                cursor: 'ew-resize',
              }}
            />
          )}
        </div>
        <Timetable
          placed={planner.placed}
          conflicts={planner.conflicts}
          subjects={subjects}
          addToGrid={planner.addToGrid}
          removePlaced={planner.removePlaced}
          movePlaced={planner.movePlaced}
          selectMode={selectMode}
          chosen={chosen}
          toggleChosen={toggleChosen}
        />
      </div>

      {placing && (
        <PlaceModal
          subj={placing}
          onClose={() => setPlacing(null)}
          onPlace={(d, s, dur) => {
            planner.addToGrid(placing, d, s, dur);
            setPlacing(null);
          }}
        />
      )}
      {selectedSubject && (
        <DetailPanel
          subj={selectedSubject}
          subjects={subjects}
          onClose={() => setSelected(null)}
          onPlace={(s) => {
            setPlacing(s);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
