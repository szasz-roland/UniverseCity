import type { PlacedSubject, Subject } from '@/types/curriculum';
import { curriculum } from '@/data/curriculum';

const DAY_CODE: Record<string, number> = { H: 0, K: 1, SZE: 2, CS: 3, P: 4 };
const ROMAN: Record<string, string> = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI' };

/**
 * curriculum.json tracks a subject as one entry with combined ea/gy credit ("... I.", no
 * component suffix). Neptun's kurzusok export names each component row separately
 * ("... gy.", "... 1. ea."). Stripping the suffix and converting a trailing arab numeral to
 * roman recovers the name curriculum.json uses, so its ea/gy credit split can be looked up —
 * the kurzusok export itself carries no credit column at all.
 */
function normalizeSubjectName(raw: string): string {
  let n = raw.trim().replace(/\s+(ea|gy)\.?$/i, '');
  n = n.replace(/(\d)\.\s*$/, (_, d: string) => `${ROMAN[d] ?? d}.`);
  return n.trim();
}

const curriculumByName = new Map(curriculum.map((s) => [s.name.trim(), s]));

interface NeptunKurzusRow {
  kod: string;
  kurzuskod: string;
  targynev: string;
  tipus: string;
  oraszam: number;
  orarend: string;
  oktato: string;
}

export interface NeptunImportResult {
  subjects: Subject[];
  placements: Array<Omit<PlacedSubject, 'uid'>>;
}

function parseSchedule(orarend: string): Array<{ day: number; start: number; dur: number }> {
  const out: Array<{ day: number; start: number; dur: number }> = [];
  const re = /([A-ZÉÁŐŰÚÖÜÓÍ]+):(\d{2}):(\d{2})-(\d{2}):(\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(orarend))) {
    const day = DAY_CODE[m[1]];
    if (day === undefined) continue;
    const start = Number(m[2]) * 60 + Number(m[3]);
    const end = Number(m[4]) * 60 + Number(m[5]);
    if (end > start) out.push({ day, start, dur: end - start });
  }
  return out;
}

/**
 * Each kurzus row (ea/gy/szeminárium) stays its own Subject — Neptun's own credit tally
 * sums per component row, not once per subject. Credit comes from curriculum.json's ea/gy
 * split matched by normalized name; subjects outside the parsed tanterv (general electives
 * like "Karrierépítés alapozó kurzus") have no credit source here and show 0.
 */
function buildSubjects(rows: NeptunKurzusRow[]): NeptunImportResult {
  const subjects: Subject[] = [];
  const placements: Array<Omit<PlacedSubject, 'uid'>> = [];

  rows.forEach((row) => {
    const matched = curriculumByName.get(normalizeSubjectName(row.targynev));
    const isEa = row.tipus === 'Előadás';
    const kredit = (isEa ? matched?.credits.ea : matched?.credits.gy) ?? 0;
    const isCoursera = row.kurzuskod.toLowerCase().includes('coursera');

    const noteParts = [
      isCoursera && 'Coursera online kurzus, órarend nélkül',
      row.oktato && `Oktató: ${row.oktato}`,
    ].filter((p): p is string => Boolean(p));

    subjects.push({
      id: row.kod || row.kurzuskod,
      name: row.targynev,
      semester: matched?.semester ?? null,
      semesterLabel: matched?.semesterLabel ?? '',
      type: matched?.type ?? 'valaszthato',
      credits: { ea: isEa ? kredit : null, gy: isEa ? null : kredit, total: kredit },
      hours: { ea: isEa ? row.oraszam : null, gy: isEa ? null : row.oraszam },
      prereqRaw: matched?.prereqRaw ?? '',
      prereqNames: matched?.prereqNames ?? [],
      prereqIds: matched?.prereqIds ?? [],
      note: noteParts.length ? noteParts.join(' · ') : (matched?.note ?? ''),
      online: isCoursera,
      completed: false,
    });

    parseSchedule(row.orarend).forEach((slot) => {
      placements.push({ subjectId: row.kod || row.kurzuskod, ...slot });
    });
  });

  return { subjects, placements };
}

/** Parses a Neptun "felvett kurzusok" .xlsx export. Loads the xlsx library lazily. */
export async function parseNeptunFile(file: File): Promise<NeptunImportResult> {
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const rows: NeptunKurzusRow[] = raw
    .map((r) => ({
      kod: String(r['Tantárgy kód'] ?? '').trim(),
      kurzuskod: String(r['Kurzuskód'] ?? '').trim(),
      targynev: String(r['Tárgynév'] ?? '').trim(),
      tipus: String(r['Típus'] ?? '').trim(),
      oraszam: Number(r['Óraszám']) || 0,
      orarend: String(r['Órarend'] ?? '').trim(),
      oktato: String(r['Oktató'] ?? '').trim(),
    }))
    .filter((r) => r.kurzuskod);

  return buildSubjects(rows);
}
