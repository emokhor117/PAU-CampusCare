import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth()

  // No token at all → go to login
  if (!token) return <Navigate to="/login" replace />

  // Token exists but role not allowed → go to login
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}