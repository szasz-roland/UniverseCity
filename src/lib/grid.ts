/** Timetable grid configuration and time helpers. */

export const DAY_START = 6; // 06:00
export const DAY_END = 23; // 23:00
export const SLOT = 30; // minutes per slot
export const ROW_H = 26; // px per slot row

export const DAYS = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'] as const;
export const DAYS_SHORT = ['H', 'K', 'Sze', 'Cs', 'P'] as const;

/** Row start-minutes for every slot in the grid. */
export const ROWS: number[] = (() => {
  const rows: number[] = [];
  for (let m = DAY_START * 60; m < DAY_END * 60; m += SLOT) rows.push(m);
  return rows;
})();

/** Format minutes-since-midnight as HH:MM. */
export function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Snap a pixel offset within a day column to a slot start-minute, clamped to the grid. */
export function yToStart(offsetTop: number, dur: number): number {
  const slot = Math.round(offsetTop / ROW_H);
  const mins = DAY_START * 60 + slot * SLOT;
  return Math.max(DAY_START * 60, Math.min(DAY_END * 60 - dur, mins));
}
