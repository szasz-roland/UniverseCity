# CLAUDE.md

Project context for Claude Code. Read this at the start of every session before making changes.
Keep it current: when a decision, convention, or roadmap item changes, update the relevant
section here in the same session (see "Maintaining this file" at the bottom).

---

## What this project is

An interactive university dashboard for SZTE's *Üzemmérnök informatikus BProf* programme
(2026/2027). Built by a solo student developer, but structured for open source and multiple
future contributors.

The first and only completed feature is a **curriculum browser + timetable planner**. It is one
page of a planned larger dashboard — treat it as the foundation, not the whole product.

## Who I'm working with

- Intermediate developer, background in sysadmin (Linux, Windows Server, Proxmox, networking).
- Comfortable in a terminal and a codebase. Skip beginner-level hand-holding.
- Knows C, Python, C#, PowerShell, Bash; newer to TypeScript/React (chosen deliberately).
- Prefers: the *why* behind decisions, CLI over GUI, security considerations flagged,
  concise answers without padding.

## Tech stack (locked)

- **React 18 + TypeScript** (strict mode)
- **Vite 7** — dev server + build
- **Tailwind CSS 3** — styling; soft pastel theme (MeuHorario-inspired, not a "super AI" look)
- **React Router 6** — app shell, ready for future pages
- Persistence today: **localStorage**, isolated behind `src/lib/storage.ts`
- **xlsx** (SheetJS, `xlsx@latest` tarball from cdn.sheetjs.com — not npm registry) — parses
  Neptun's "felvett kurzusok" export in `src/lib/neptunImport.ts`, loaded lazily
- **@dnd-kit/core + @dnd-kit/utilities** — catalog card → grid drag-to-place (mouse, touch,
  and pen via `PointerSensor`). Placed-block move/resize is separate, hand-rolled Pointer
  Events code in `Timetable.tsx`, already touch-capable — not part of dnd-kit
- Planned backend: **Supabase** (managed cloud first; self-host is an open escape hatch)
- Hosting: **Vercel** (free tier, no custom domain yet); static build is also self-hostable
- Future packaging: **PWA → Capacitor (Android) → Tauri (desktop)**, all from this one codebase

## Architecture rules (do not violate without discussing)

1. **All persistence goes through `src/lib/storage.ts`.** The UI must never touch localStorage
   (or, later, Supabase) directly. This single indirection is what lets the backend swap in
   without rewriting components. This is the most important rule in the project.
2. **Keep logic out of view components.** Pure logic lives in `src/lib/` (grid math, colors,
   conflict detection). Planner state lives in the `usePlanner` hook. Components render.
3. **Data model is designed for features that don't exist yet.** `Subject.completed` and the
   `prereqIds` graph edges are already in the types so progress-tracking and eligibility flags
   slot in later with no migration. Don't strip them.
4. **New dashboard pages are new routes** in `src/App.tsx` + a file in `src/pages/`. Don't
   fold unrelated features into the planner.
5. **TypeScript strict — no `any` escape hatches.** If types fight you, model the data properly.

## Project structure

```
src/
├── App.tsx                 # routes / app shell
├── main.tsx                # entry point
├── index.css               # global styles + CSS variables (theme tokens)
├── types/curriculum.ts     # Subject, PlacedSubject
├── data/
│   ├── curriculum.json     # parsed curriculum (generated, do not hand-edit)
│   └── curriculum.ts       # typed accessor
├── lib/
│   ├── grid.ts             # grid config (Mon–Fri, 06:00–23:00, 30-min slots) + time helpers
│   ├── colors.ts           # deterministic per-subject pastel colors
│   ├── conflicts.ts        # timetable overlap detection
│   ├── pdfExport.ts        # timetable → PDF export
│   ├── neptunImport.ts     # Neptun "felvett kurzusok" .xlsx import — SEE Data source
│   └── storage.ts          # persistence layer — SEE RULE 1
├── components/
│   ├── ui/primitives.tsx   # shared buttons, Overlay, Pill
│   └── planner/
│       ├── usePlanner.ts   # planner state + actions (single source of truth)
│       ├── TopBar.tsx      # header + select-mode bar
│       ├── Catalog.tsx     # searchable subject list, draggable cards
│       ├── Timetable.tsx   # grid, drag/drop, cross-day move, resize, conflicts, select mode
│       ├── PlaceModal.tsx  # manual time-entry dialog
│       └── DetailPanel.tsx # subject detail slide-in with prereq chains
└── pages/PlannerPage.tsx   # composes the planner
```

## Grid configuration

Mon–Fri, 06:00–23:00, 30-minute slots (see `src/lib/grid.ts`). Placement is by manual
time entry (PlaceModal) OR drag: catalog card → grid drops a 90-min block; placed blocks
drag in 2D (day + time) and resize from the bottom edge. Overlaps flag as "ütközés".

## Data source

Subjects are parsed from `tantervi_halo_2026-2027_uzemmernok.xlsx` (sheet `Tanterv`) into
`src/data/curriculum.json` via `scripts/parse_curriculum.py`. 84 subjects. Prerequisite text
is messy free-text; the parser splits prereqs vs. notes best-effort and resolves ~28/84
prereq links to ids. Regenerate the JSON with the script; don't hand-edit it.

The planner starts empty — a student imports their own schedule via the "Importálás" button
in `TopBar`, which uploads a Neptun "felvett kurzusok" export (.xlsx, downloaded manually by
the user from Neptun's Tárgyfelvétel page; no credential handling). `src/lib/neptunImport.ts`
parses it into `Subject`s (one per ea/gy/szeminárium row) and grid placements. That export has
no credit column, so credit is looked up in `curriculum.json` by normalized subject name —
accurate for real tanterv courses, `0` for general electives outside the tanterv sheet (e.g. a
university-wide "Karrierépítés" course). A more accurate credit source (Neptun's separate
"felvett tárgyak" export, joined by course code) was prototyped and rolled back for now — see
git history around 2026-08-29 if revisiting.

## Known issues / caveats

- `public/manifest.webmanifest` references `icon-192.png` / `icon-512.png` that don't exist
  yet — real PNG app icons still need to be made. SVG favicon works meanwhile.
- Prereq resolution is incomplete (see Data source) — needs a verification pass.
- Imported non-tanterv electives (e.g. Karrierépítés) show 0 credit — no credit source for
  them yet (see Data source).

## Roadmap

- [x] Curriculum browser + timetable planner (local-only)
- [x] Neptun "felvett kurzusok" .xlsx import → populates catalog + grid (see Data source)
- [ ] Persistence via Supabase (change only `src/lib/storage.ts` + add auth)
- [ ] Prerequisite graph view + "eligible now" flags (uses existing `prereqIds` + `completed`)
- [ ] Progress tracking + statistics
- [ ] Notes upload (needs backend storage)
- [ ] Calendar sync via Neptun ICS import + reminders (needs backend for cross-device/notifs) —
      distinct from the xlsx import above; this is external-calendar sync, not yet built
- [ ] PWA install → Android (Capacitor) → desktop (Tauri)

Integration boundaries decided during planning: **Neptun = file export import only** (manual
.xlsx/.ics upload by the user, no credential handling — security), **MarkMyProfessor =
link-out only** (robots-disallowed, no scraping).

## Commands

```bash
npm run dev          # dev server, http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run preview      # preview production build
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
```

Before any commit/PR: `npm run type-check && npm run lint && npm run build` must pass (CI enforces).

---

## Maintaining this file

At the end of any session where something structural changed, update the affected section
above so the next session starts accurate. Specifically update this file when:

- a dependency or tool is added/removed/upgraded (→ Tech stack, Commands)
- a new page, route, lib module, or component is added (→ Project structure)
- an architecture rule or convention is established or changed (→ Architecture rules)
- a roadmap item is started or completed (→ Roadmap checkboxes)
- a bug/caveat is found or fixed (→ Known issues)

Keep edits terse and factual. This file is context, not a changelog — state the current
truth, don't accumulate history. Do not record secrets, keys, or credentials here.