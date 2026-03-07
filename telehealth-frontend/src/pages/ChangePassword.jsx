import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLock,
  faEye,
  faEyeSlash,
  faShieldHalved,
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'

export default function ChangePassword() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Password strength rules ──────────────────────────────────────
  const rules = [
    { label: 'At least 8 characters', pass: newPassword.length >= 8 },
    { label: 'At least one uppercase letter', pass: /[A-Z]/.test(newPassword) },
    { label: 'At least one number', pass: /[0-9]/.test(newPassword) },
    { label: 'At least one special character', pass: /[^A-Za-z0-9]/.test(newPassword) },
  ]
  const allRulesPassed = rules.every(r => r.pass)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async () => {
    setError('')

    if (!allRulesPassed) {
      setError('Please make sure your password meets all the requirements below.')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/change-password', { newPassword })

      // Update user in localStorage so first_login is now false
      const updatedUser = { ...user, first_login: false }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // Redirect to correct dashboard based on role
      if (user?.role === 'STUDENT') navigate('/student/dashboard')
      else if (user?.role === 'COUNSELLOR') navigate('/counsellor/dashboard')
      else if (user?.role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/login')

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#003D8F] p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#00A878]/10" />

        <div className="relative z-10">
          <img src="/src/assets/images/pau logo.png" alt="PAU Logo" className="w-20 mb-8" />
          <h1 className="text-white text-4xl font-semibold leading-tight">
            Secure Your<br />Account
          </h1>
          <p className="text-white/50 text-sm mt-3">
            Pan-Atlantic University · Guidance & Counselling Unit
          </p>
          <p className="text-white text-sm mt-8 leading-relaxed max-w-xs">
            You are logging in for the first time, so you would need to set a new password to protect your account before continuing.
          </p>

          <div className="flex flex-col gap-4 mt-8">
            {[
              { icon: faShieldHalved, text: 'Your password is encrypted with Bcrypt' },
              { icon: faLock, text: 'Never share your password with anyone' },
              { icon: faCircleCheck, text: 'You only need to do this once' },
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
            <img src="/src/assets/images/pau logo2.png" alt="PAU Logo" className="w-10" />
            <span className="text-[#003D8F] font-semibold text-lg">PAU CampusCare</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#003D8F] bg-[#E8F0FC] px-3 py-1 rounded-full">
              First Login
            </span>
            <h2 className="text-3xl font-semibold text-gray-800 mt-4">Set your password</h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose a strong password to secure your CampusCare account.
            </p>
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F] focus:bg-white transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Password rules */}
          {newPassword.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100 flex flex-col gap-1.5">
              {rules.map(({ label, pass }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <FontAwesomeIcon
                    icon={pass ? faCircleCheck : faCircleXmark}
                    className={pass ? 'text-[#00A878]' : 'text-gray-300'}
                  />
                  <span className={pass ? 'text-gray-600' : 'text-gray-400'}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password */}
          <div className="mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className={`w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm text-gray-800 focus:outline-none focus:bg-white transition-all pr-11 ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-[#00A878] focus:border-[#00A878]'
                      : 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-[#003D8F]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
              </button>
            </div>
            {/* Inline match feedback */}
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1.5 flex items-center gap-1.5 ${passwordsMatch ? 'text-[#00A878]' : 'text-red-400'}`}>
                <FontAwesomeIcon icon={passwordsMatch ? faCircleCheck : faCircleXmark} />
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
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
            disabled={loading || !allRulesPassed || !passwordsMatch}
            className="mt-6 w-full py-3 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Saving...' : 'Set Password & Continue'}
          </button>

          {/* Sign out option */}
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 text-gray-400 text-sm hover:border-gray-300 hover:text-gray-500 transition-all cursor-pointer"
          >
            Sign out and go back
          </button>

          <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faShieldHalved} />
            Your password is hashed and never stored in plain text
          </p>

        </div>
      </div>

    </div>
  )
}