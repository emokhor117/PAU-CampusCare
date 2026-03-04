import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth()

  if (!token) return <Navigate to="/login" replace />

  // If a roles array is passed, check the user's role
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}