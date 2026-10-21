import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ExercisesPage from './pages/ExercisesPage'
import WorkoutsPage from './pages/WorkoutsPage'
import RoutinesPage from './pages/RoutinesPage'

/**
 * Rutas de FitTrack:
 * - /login y /register: públicas.
 * - /: biblioteca de ejercicios, protegida por RequireAuth.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <ExercisesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/workouts"
          element={
            <RequireAuth>
              <WorkoutsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/routines"
          element={
            <RequireAuth>
              <RoutinesPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
