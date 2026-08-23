import type { PlacedSubject } from '@/types/curriculum';

/** Returns the set of placed-subject uids that overlap another on the same day. */
export function findConflicts(placed: PlacedSubject[]): Set<string> {
  const conflicts = new Set<string>();
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i];
      const b = placed[j];
      if (a.day === b.day && a.start < b.start + b.dur && b.start < a.start + a.dur) {
        conflicts.add(a.uid);
        conflicts.add(b.uid);
      }
    }
  }
  return conflicts;
}
