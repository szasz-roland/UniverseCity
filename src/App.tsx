import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PlannerPage } from '@/pages/PlannerPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { RequireAuth } from '@/lib/auth/RequireAuth';

/**
 * App shell. Routing is set up now so the future dashboard pages
 * (curriculum graph, notes, calendar, stats) slot in as new <Route>s
 * without restructuring anything.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/planner" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/planner"
            element={
              <RequireAuth>
                <PlannerPage />
              </RequireAuth>
            }
          />
          {/* Future: <Route path="/curriculum" element={<CurriculumPage />} /> */}
          {/* Future: <Route path="/notes" element={<NotesPage />} /> */}
          <Route path="*" element={<Navigate to="/planner" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
