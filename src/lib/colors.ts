/** Deterministic soft-pastel color assignment per subject id. */

const PALETTE: Array<{ bg: string; ink: string }> = [
  { bg: '#E7E4F5', ink: '#5B4FA8' }, // lavender
  { bg: '#DDEBE2', ink: '#3E7A5E' }, // sage
  { bg: '#FBE7DC', ink: '#C1663B' }, // peach
  { bg: '#DEEBF4', ink: '#3A6E93' }, // sky
  { bg: '#F6EDD3', ink: '#9A7B2E' }, // butter
  { bg: '#F6DFE4', ink: '#AD4C67' }, // rose
];

/** Stable color for a subject, derived from a hash of its id. */
export function colorFor(id: string): { bg: string; ink: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
