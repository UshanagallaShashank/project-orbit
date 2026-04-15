// App.tsx - Routing
//
// Public routes:  /login, /register
// Protected routes (require auth): /dashboard, /chat, /tasks, /tracker, /memories
// Default:  / redirects to /dashboard (or /login if not authed)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage }     from '@/pages/LoginPage'
import { RegisterPage }  from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ChatPage }      from '@/pages/ChatPage'
import { TasksPage }     from '@/pages/TasksPage'
import { TrackerPage }   from '@/pages/TrackerPage'
import { MemoriesPage }  from '@/pages/MemoriesPage'
import { UploadPage }    from '@/pages/UploadPage'
import { IncomePage }   from '@/pages/IncomePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Navigate to="/dashboard" replace />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout><ChatPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout><TasksPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <AppLayout><TrackerPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/memories"
          element={
            <ProtectedRoute>
              <AppLayout><MemoriesPage /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <AppLayout><UploadPage /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/income"
          element={
            <ProtectedRoute>
              <AppLayout><IncomePage /></AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
