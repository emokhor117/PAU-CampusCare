import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(localStorage.getItem('token'))
  const [user, setUser]     = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [ready, setReady]   = useState(false)

  // On mount, verify the token is still valid with the backend
  useEffect(() => {
    const verify = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setReady(true)
        return
      }
      try {
        // Any protected endpoint works — we just need a 200 back
        await api.get('/auth/me')
        setReady(true)
      } catch (err) {
        // Token is invalid or expired — clear everything
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        setReady(true)
      }
    }
    verify()
  }, [])

  const login = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Don't render anything until we've verified the token
  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#003D8F] border-t-transparent animate-spin" />
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    </div>
  )

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}