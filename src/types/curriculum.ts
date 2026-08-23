/** A single subject from the curriculum (tantervi háló). */
export interface Subject {
  id: string;
  name: string;
  /** Fixed semester (1–6), or null for free-choice electives. */
  semester: number | null;
  semesterLabel: string;
  type: 'kotelezo' | 'valaszthato';
  credits: { ea: number | null; gy: number | null; total: number };
  hours: { ea: number | null; gy: number | null };
  /** Raw prerequisite text as printed in the source table. */
  prereqRaw: string;
  /** Best-effort parsed prerequisite subject names. */
  prereqNames: string[];
  /** Resolved prerequisite subject ids (subset of prereqNames that matched). */
  prereqIds: string[];
  /** Free-text note (megjegyzés). */
  note: string;
  /** User progress flag — designed in from day one, UI wired later. */
  completed: boolean;
}

/** A subject placed onto the timetable grid. */
export interface PlacedSubject {
  uid: string;
  subjectId: string;
  /** Day index, 0 = Monday … 4 = Friday. */
  day: number;
  /** Start time in minutes since midnight. */
  start: number;
  /** Duration in minutes. */
  dur: number;
}
