import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PlannerPage } from '@/pages/PlannerPage';

/**
 * App shell. Routing is set up now so the future dashboard pages
 * (curriculum graph, notes, calendar, stats) slot in as new <Route>s
 * without restructuring anything.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/planner" replace />} />
        <Route path="/planner" element={<PlannerPage />} />
        {/* Future: <Route path="/curriculum" element={<CurriculumPage />} /> */}
        {/* Future: <Route path="/notes" element={<NotesPage />} /> */}
        <Route path="*" element={<Navigate to="/planner" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
