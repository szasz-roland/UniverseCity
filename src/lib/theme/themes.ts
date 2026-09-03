export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeName = 'pastel' | 'ocean';

/** Registry of available named themes. Each entry needs matching
 * `[data-theme="<id>-light"]` / `[data-theme="<id>-dark"]` blocks in index.css. */
export const THEMES: Array<{ id: ThemeName; label: string; swatch: string }> = [
  { id: 'pastel', label: 'Pasztell', swatch: '#6C5CE0' },
  { id: 'ocean', label: 'Óceán', swatch: '#2C86B0' },
];

export const DEFAULT_THEME_NAME: ThemeName = 'pastel';
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

/** localStorage key for the {name, mode} preference. Duplicated as a literal in the
 * no-flash bootstrap script in index.html (which must run before any JS module loads,
 * so it can't import this) — keep the two in sync if this ever changes. */
export const THEME_STORAGE_KEY = 'tanrend.theme.v1';

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'pastel' || value === 'ocean';
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}
