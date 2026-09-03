import type { PlacedSubject, Subject } from '@/types/curriculum';
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_NAME,
  THEME_STORAGE_KEY,
  isThemeMode,
  isThemeName,
  type ThemeMode,
  type ThemeName,
} from '@/lib/theme/themes';

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

export interface ThemePreference {
  name: ThemeName;
  mode: ThemeMode;
}

export function loadThemePreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return { name: DEFAULT_THEME_NAME, mode: DEFAULT_THEME_MODE };
    const parsed = JSON.parse(raw) as Partial<ThemePreference>;
    return {
      name: isThemeName(parsed.name) ? parsed.name : DEFAULT_THEME_NAME,
      mode: isThemeMode(parsed.mode) ? parsed.mode : DEFAULT_THEME_MODE,
    };
  } catch {
    return { name: DEFAULT_THEME_NAME, mode: DEFAULT_THEME_MODE };
  }
}

export function saveThemePreference(pref: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(pref));
  } catch {
    // Storage full or blocked — theme just won't persist across reloads.
  }
}
