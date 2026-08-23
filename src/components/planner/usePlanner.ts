import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PlacedSubject, Subject } from '@/types/curriculum';
import { findConflicts } from '@/lib/conflicts';
import { loadPlaced, savePlaced } from '@/lib/storage';

let uidCounter = 0;
function makeUid(): string {
  uidCounter += 1;
  return `${Date.now().toString(36)}-${uidCounter}`;
}

/** All planner state and actions, kept out of the view components. */
export function usePlanner(subjects: Subject[]) {
  const [placed, setPlaced] = useState<PlacedSubject[]>(() => loadPlaced());

  // Persist through the storage layer whenever placement changes.
  useEffect(() => {
    savePlaced(placed);
  }, [placed]);

  const addToGrid = useCallback((subj: Subject, day: number, start: number, dur: number) => {
    setPlaced((p) => [...p, { uid: makeUid(), subjectId: subj.id, day, start, dur }]);
  }, []);

  const removePlaced = useCallback((uid: string) => {
    setPlaced((p) => p.filter((x) => x.uid !== uid));
  }, []);

  const deleteAll = useCallback(() => setPlaced([]), []);

  const deleteMany = useCallback((uids: Set<string>) => {
    setPlaced((p) => p.filter((x) => !uids.has(x.uid)));
  }, []);

  const movePlaced = useCallback((uid: string, patch: Partial<PlacedSubject>) => {
    setPlaced((prev) => prev.map((x) => (x.uid === uid ? { ...x, ...patch } : x)));
  }, []);

  const conflicts = useMemo(() => findConflicts(placed), [placed]);

  const placedCredits = useMemo(() => {
    const ids = new Set(placed.map((p) => p.subjectId));
    let total = 0;
    ids.forEach((id) => {
      const s = subjects.find((x) => x.id === id);
      if (s) total += s.credits.total;
    });
    return total;
  }, [placed, subjects]);

  const placedCount = useMemo(() => new Set(placed.map((p) => p.subjectId)).size, [placed]);

  return {
    placed,
    conflicts,
    placedCredits,
    placedCount,
    addToGrid,
    removePlaced,
    deleteAll,
    deleteMany,
    movePlaced,
  };
}
