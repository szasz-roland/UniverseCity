import type { PlacedSubject, Subject } from '@/types/curriculum';

/**
 * Storage layer. Everything that persists user data goes through here.
 *
 * Right now it uses localStorage (device-local, no backend). When the app
 * gains a backend, only this file changes — swap the body of each function
 * for Supabase calls and the rest of the app is untouched. That is the whole
 * point of routing persistence through one module.
 */

const PLACED_KEY = 'tanrend.placed.v1';
const SUBJECTS_KEY = 'tanrend.subjects.v1';

export function loadPlaced(): PlacedSubject[] {
  try {
    const raw = localStorage.getItem(PLACED_KEY);
    return raw ? (JSON.parse(raw) as PlacedSubject[]) : [];
  } catch {
    return [];
  }
}

export function savePlaced(placed: PlacedSubject[]): void {
  try {
    localStorage.setItem(PLACED_KEY, JSON.stringify(placed));
  } catch {
    // Storage full or blocked — fail silently for now; surface to user later.
  }
}

/** Imported subjects (Neptun import) — kept separate so placements never outlive their subjects. */
export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    return raw ? (JSON.parse(raw) as Subject[]) : [];
  } catch {
    return [];
  }
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch {
    // Storage full or blocked — fail silently for now; surface to user later.
  }
}
