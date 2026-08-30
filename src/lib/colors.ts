/** Deterministic soft-pastel color assignment per subject id. */

// ink colors are chosen for >=4.5:1 contrast against their own bg (WCAG AA for small text)
const PALETTE: Array<{ bg: string; ink: string }> = [
  { bg: '#E7E4F5', ink: '#5B4FA8' }, // lavender
  { bg: '#DDEBE2', ink: '#3A7157' }, // sage
  { bg: '#FBE7DC', ink: '#A05431' }, // peach
  { bg: '#DEEBF4', ink: '#3A6E93' }, // sky
  { bg: '#F6EDD3', ink: '#816727' }, // butter
  { bg: '#F6DFE4', ink: '#A24760' }, // rose
];

/** Stable color for a subject, derived from a hash of its id. */
export function colorFor(id: string): { bg: string; ink: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
