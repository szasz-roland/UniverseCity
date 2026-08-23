import { useMemo, useState } from 'react';
import type { Subject } from '@/types/curriculum';
import { curriculum } from '@/data/curriculum';
import { usePlanner } from '@/components/planner/usePlanner';
import { SelectBar, TopBar } from '@/components/planner/TopBar';
import { Catalog } from '@/components/planner/Catalog';
import { Timetable } from '@/components/planner/Timetable';
import { PlaceModal } from '@/components/planner/PlaceModal';
import { DetailPanel } from '@/components/planner/DetailPanel';

export function PlannerPage() {
  const subjects = curriculum;
  const planner = usePlanner(subjects);

  const [selected, setSelected] = useState<string | null>(null);
  const [placing, setPlacing] = useState<Subject | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [chosen, setChosen] = useState<Set<string>>(() => new Set());

  const placedIds = useMemo(
    () => new Set(planner.placed.map((p) => p.subjectId)),
    [planner.placed],
  );

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
      />
      {selectMode && (
        <SelectBar count={chosen.size} onCancel={exitSelect} onDelete={deleteChosen} />
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Catalog
          subjects={subjects}
          placedIds={placedIds}
          onSelect={setSelected}
          onPlace={setPlacing}
        />
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
