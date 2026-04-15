import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLock,
  faUser,
  faClipboardList,
  faGraduationCap,
  faUserMd,
  faGear,
  faShieldHalved,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import pauLogo from '../assets/images/pau logo.png'
import pauLogo2 from '../assets/images/Screenshot 2026-03-03 090859.png'


export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { identifier, password })
      const { access_token, role: returnedRole, first_login } = res.data

      login(access_token, { role: returnedRole, first_login })

      if (first_login) {
  navigate('/change-password')
} else if (returnedRole === 'STUDENT') {
  navigate('/student/dashboard')
} else if (returnedRole === 'COUNSELLOR') {
  navigate('/counsellor/dashboard')
} else if (returnedRole === 'ADMIN') {
  navigate('/admin/dashboard')
}
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex">

        {/* ── Left Panel ── */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#003D8F] p-12 relative overflow-hidden">
          {/* Background circles */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#00A878]/10" />

          <div className="relative z-10">
            <img src={pauLogo} alt="PAU" className="w-8" />
            <h1 className="text-white text-4xl font-semibold leading-tight">
              PAU<br />CampusCare
            </h1>
            <p className="text-white/50 text-sm mt-3">
              Pan-Atlantic University · Guidance & Counselling Unit
            </p>
            <p className="text-white text-sm mt-8 leading-relaxed max-w-xs">
              A safe, confidential space to speak freely and get the support you need whenever you're ready.
            </p>

            <div className="flex flex-col gap-4 mt-8">
              {[
                { icon: faLock, text: 'End-to-end encrypted messages' },
                { icon: faUser, text: 'Your identity stays private from peers' },
                { icon: faClipboardList, text: 'Reviewed only by your assigned counsellor' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-white text-sm">
                  <FontAwesomeIcon icon={icon} className="text-white/40 w-4" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-white/70 text-xs">
            © 2026 Pan-Atlantic University · CampusCare v1.0
          </p>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col justify-center w-full md:w-1/2 bg-white px-8 sm:px-16 py-16">
          <div className="max-w-md w-full mx-auto">

            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-3 mb-8">
              <img src={pauLogo2} alt="PAU" className="w-8" />
              <span className="text-[#003D8F] font-semibold text-lg">PAU CampusCare</span>
            </div>

            <h2 className="text-3xl font-semibold text-gray-800">Welcome </h2>
            <p className="text-sm text-gray-400 mt-1 mb-8">
              Sign in to access your counselling portal.
            </p>

            {/* Role tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { key: 'student', label: 'Student', icon: faGraduationCap },
                { key: 'counsellor', label: 'Counsellor', icon: faUserMd },
                { key: 'admin', label: 'Admin', icon: faGear },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    role === key
                      ? 'border-[#003D8F] bg-[#E8F0FC] text-[#003D8F]'
                      : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={icon} />
                  {label}
                </button>
              ))}
            </div>

            {/* Identifier */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                {role === 'student' ? 'Matriculation Number' : 'Staff ID'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={role === 'student' ? 'Enter your matriculation number' : 'Enter your ID'}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F] focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F] focus:bg-white transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In Securely'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} />
              Your session is protected with JWT authentication
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}