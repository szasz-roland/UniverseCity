import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Subject } from '@/types/curriculum';
import { loadSubjects, saveSubjects } from '@/lib/storage';
import { colorFor } from '@/lib/colors';
import { supabase } from '@/lib/supabaseClient';
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
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
  const [importError, setImportError] = useState<string | null>(null);
  const planner = usePlanner(subjects);

  // Persist through the storage layer whenever the imported subject list changes.
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  async function handleImportFile(file: File) {
    setImportError(null);
    try {
      const { parseNeptunFile } = await import('@/lib/neptunImport');
      const { subjects: imported, placements } = await parseNeptunFile(file);
      if (imported.length === 0) {
        setImportError(
          'Nem sikerült tárgyakat kiolvasni ebből a fájlból. Ellenőrizd, hogy a Neptun "felvett kurzusok" exportját töltötted-e fel — a jelenlegi tanrended változatlan maradt.',
        );
        return;
      }
      const byId = new Map(imported.map((s) => [s.id, s]));
      setSubjects(imported);
      planner.deleteAll();
      placements.forEach((p) => {
        const subj = byId.get(p.subjectId);
        if (subj) planner.addToGrid(subj, p.day, p.start, p.dur);
      });
    } catch {
      setImportError(
        'Hiba történt a fájl feldolgozása közben. Ellenőrizd, hogy érvényes .xlsx fájlt választottál-e — a jelenlegi tanrended változatlan maradt.',
      );
    }
  }

  const [selected, setSelected] = useState<string | null>(null);
  const [placing, setPlacing] = useState<Subject | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [chosen, setChosen] = useState<Set<string>>(() => new Set());
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [catalogWidth, setCatalogWidth] = useState(CATALOG_DEFAULT_W);
  const [dragSubjectId, setDragSubjectId] = useState<string | null>(null);
  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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
  const dragSubject = dragSubjectId ? subjects.find((s) => s.id === dragSubjectId) : null;

  return (
    <DndContext
      sensors={dragSensors}
      onDragStart={(e: DragStartEvent) => setDragSubjectId(String(e.active.id))}
      onDragEnd={() => setDragSubjectId(null)}
      onDragCancel={() => setDragSubjectId(null)}
    >
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
        onImportFile={handleImportFile}
        onLogout={() => supabase.auth.signOut()}
        catalogOpen={catalogOpen}
        onToggleCatalog={() => setCatalogOpen((o) => !o)}
      />
      {selectMode && (
        <SelectBar count={chosen.size} onCancel={exitSelect} onDelete={deleteChosen} />
      )}
      {importError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '9px 22px',
            background: '#FBE7DC',
            color: '#C1663B',
            fontSize: 12.5,
            borderBottom: '1px solid var(--line2)',
          }}
        >
          <span>{importError}</span>
          <button
            onClick={() => setImportError(null)}
            aria-label="Üzenet bezárása"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#C1663B',
              cursor: 'pointer',
              fontSize: 15,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div
          style={{
            position: 'relative',
            width: catalogOpen ? `min(${catalogWidth}px, 100vw)` : 0,
            maxWidth: '100vw',
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
    <DragOverlay dropAnimation={null}>
      {dragSubject && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 10,
            background: '#fff',
            border: '1.5px solid ' + colorFor(dragSubject.id).ink,
            boxShadow: '0 6px 18px rgba(0,0,0,.18)',
            fontSize: 12.5,
            fontWeight: 500,
            maxWidth: 240,
            cursor: 'grabbing',
          }}
        >
          <div
            style={{
              width: 4,
              alignSelf: 'stretch',
              borderRadius: 4,
              background: colorFor(dragSubject.id).ink,
              flexShrink: 0,
            }}
          />
          {dragSubject.name}
        </div>
      )}
    </DragOverlay>
    </DndContext>
  );
}
