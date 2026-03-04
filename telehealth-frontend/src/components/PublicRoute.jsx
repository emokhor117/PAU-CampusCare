import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute({ children }) {
  const { token, user } = useAuth()

  if (token && user?.role) {
    // If first_login is still true, always go to change-password
    if (user.first_login) return <Navigate to="/change-password" replace />

    if (user.role === 'STUDENT')    return <Navigate to="/student/dashboard" replace />
    if (user.role === 'COUNSELLOR') return <Navigate to="/counsellor/dashboard" replace />
    if (user.role === 'ADMIN')      return <Navigate to="/admin/dashboard" replace />
  }

  return children
}