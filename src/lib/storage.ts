import type { PlacedSubject } from '@/types/curriculum';

/**
 * Storage layer. Everything that persists user data goes through here.
 *
 * Right now it uses localStorage (device-local, no backend). When the app
 * gains a backend, only this file changes — swap the body of each function
 * for Supabase calls and the rest of the app is untouched. That is the whole
 * point of routing persistence through one module.
 */

const KEY = 'tanrend.placed.v1';

export function loadPlaced(): PlacedSubject[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlacedSubject[]) : [];
  } catch {
    return [];
  }
}

export function savePlaced(placed: PlacedSubject[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(placed));
  } catch {
    // Storage full or blocked — fail silently for now; surface to user later.
  }
}
