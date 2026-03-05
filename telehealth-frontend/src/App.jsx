import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

// Eagerly loaded (always needed)
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'

// Lazy loaded (only when visited)
const StudentDashboard     = lazy(() => import('./pages/student/Dashboard'))
const StudentChat          = lazy(() => import('./pages/student/Chat'))
const StudentAppointments  = lazy(() => import('./pages/student/Appointments'))
const StudentAssessment    = lazy(() => import('./pages/student/Assessment'))
const StudentResources     = lazy(() => import('./pages/student/Resources'))
const StudentHistory       = lazy(() => import('./pages/student/History'))

const Call = lazy(() => import('./pages/Call'))
const CounsellorDashboard    = lazy(() => import('./pages/counsellor/Dashboard'))
const CounsellorSessions     = lazy(() => import('./pages/counsellor/Sessions'))
const CounsellorChat         = lazy(() => import('./pages/counsellor/Chat'))
const CounsellorAppointments = lazy(() => import('./pages/counsellor/Appointments'))

const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers      = lazy(() => import('./pages/admin/Users'))
const AdminResources  = lazy(() => import('./pages/admin/Resources'))
const AdminAuditLogs  = lazy(() => import('./pages/admin/AuditLogs'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#003D8F] border-t-transparent animate-spin" />
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* Public */}
            <Route path="/login" element={
  <PublicRoute>
    <Login />
  </PublicRoute>
} />
<Route path="/change-password" element={<ChangePassword />} />
{/* add this route for only counsellor and student */}
<Route path="/call/:sessionId" element={
  <ProtectedRoute roles={['STUDENT', 'COUNSELLOR']}>
    <Call />
  </ProtectedRoute>
} />


            {/* Student */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/chat" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentChat />
              </ProtectedRoute>
            } />
            <Route path="/student/chat/:sessionId" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentChat />
              </ProtectedRoute>
            } />
            <Route path="/student/appointments" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentAppointments />
              </ProtectedRoute>
            } />
            <Route path="/student/assessment" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentAssessment />
              </ProtectedRoute>
            } />
            <Route path="/student/resources" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentResources />
              </ProtectedRoute>
            } />
            <Route path="/student/history" element={
              <ProtectedRoute roles={['STUDENT']}>
                <StudentHistory />
              </ProtectedRoute>
            } />

            {/* Counsellor */}
            <Route path="/counsellor/dashboard" element={
              <ProtectedRoute roles={['COUNSELLOR']}>
                <CounsellorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/counsellor/sessions" element={
              <ProtectedRoute roles={['COUNSELLOR']}>
                <CounsellorSessions />
              </ProtectedRoute>
            } />
            <Route path="/counsellor/chat/:sessionId" element={
              <ProtectedRoute roles={['COUNSELLOR']}>
                <CounsellorChat />
              </ProtectedRoute>
            } />
            <Route path="/counsellor/appointments" element={
              <ProtectedRoute roles={['COUNSELLOR']}>
                <CounsellorAppointments />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/resources" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminResources />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}