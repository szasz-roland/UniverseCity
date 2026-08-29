# Tanrend — Üzemmérnök informatikus dashboard

**Live:** [universe-city.vercel.app](https://universe-city.vercel.app/planner)

An interactive university dashboard for SZTE's *Üzemmérnök informatikus BProf* programme.
The first feature is a **curriculum browser + timetable planner**: browse all subjects from
the tantervi háló, see prerequisites, and drag subjects into a weekly timetable.

Built to grow — planned pages include a prerequisite graph, progress/statistics, notes upload,
and a synced calendar with reminders.

## Tech stack

- **React 18 + TypeScript** — typed, maintainable UI
- **Vite 7** — dev server and build
- **Tailwind CSS** — styling (soft pastel theme)
- **React Router** — multi-page shell, ready for future pages
- Persistence today is **device-local** (`localStorage`), isolated behind `src/lib/storage.ts`
  so a backend (Supabase is the planned choice) can be dropped in without touching the UI.

## Requirements

- Node.js **20.19+** or **22.12+**
- npm (bundled with Node)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build        # type-check + production build into dist/
npm run preview      # preview the production build locally
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
```

## Project structure

```
src/
├── App.tsx                 # routes / app shell
├── main.tsx                # entry point
├── index.css              # global styles + CSS variables (theme)
├── types/
│   └── curriculum.ts       # Subject, PlacedSubject types
├── data/
│   ├── curriculum.json     # parsed curriculum (generated — see scripts/)
│   └── curriculum.ts       # typed accessor
├── lib/
│   ├── grid.ts             # timetable grid config + time helpers
│   ├── colors.ts           # per-subject pastel color assignment
│   ├── conflicts.ts        # timetable overlap detection
│   └── storage.ts          # persistence layer (swap for a backend here)
├── components/
│   ├── ui/                 # shared primitives (buttons, overlay, pill)
│   └── planner/            # planner feature
│       ├── usePlanner.ts   # planner state + actions (hook)
│       ├── TopBar.tsx      # header + select-mode bar
│       ├── Catalog.tsx     # searchable subject list (draggable cards)
│       ├── Timetable.tsx   # Mon–Fri grid, drag/drop, resize, conflicts
│       ├── PlaceModal.tsx  # manual time-entry dialog
│       └── DetailPanel.tsx # subject detail slide-in
└── pages/
    └── PlannerPage.tsx     # composes the planner
```

## Regenerating curriculum data

The subject data is parsed from the source spreadsheet
`tantervi_halo_2026-2027_uzemmernok.xlsx` (sheet `Tanterv`).

```bash
pip install openpyxl
python scripts/parse_curriculum.py   # writes src/data/curriculum.json
```

Adjust the path at the top of the script to point at the spreadsheet.

## Deployment

The app is a static SPA — the `npm run build` output in `dist/` can be served by any static host.
See the deploy walkthrough for Vercel (recommended, free) or self-hosting with nginx/Caddy.
`vercel.json` contains the SPA rewrite so client-side routes survive a page refresh.

## Roadmap

- [x] Curriculum browser + timetable planner (local-only)
- [ ] Persistence via a managed backend (Supabase)
- [ ] Prerequisite graph view + eligibility flags
- [ ] Progress tracking + statistics
- [ ] Notes upload
- [ ] Calendar sync (Neptun ICS import) + reminders
- [ ] PWA install → Android (Capacitor) → desktop (Tauri)

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch/deploy workflow —
`main` auto-deploys to production on every push, so changes go through a branch and a preview
deployment first.

## License

MIT — see [LICENSE](./LICENSE).
