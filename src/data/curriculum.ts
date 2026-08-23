import type { Subject } from '@/types/curriculum';
import raw from './curriculum.json';

/**
 * The curriculum, parsed from tantervi_halo_2026-2027_uzemmernok.xlsx (Tanterv sheet).
 * Regenerate with the parser in /scripts when the source spreadsheet changes.
 */
export const curriculum: Subject[] = raw as Subject[];
