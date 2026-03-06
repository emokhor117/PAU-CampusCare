import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faComments, faCalendarDays, faClipboardList,
  faBookOpen, faClockRotateLeft, faRightFromBracket,
  faTriangleExclamation, faCircleDot, faSpinner,
  faBars, faXmark, faUser
} from '@fortawesome/free-solid-svg-icons'
import pauLogo from '../../assets/images/pau logo.png'

// ── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { label: 'Dashboard',    icon: faHouse,            path: '/student/dashboard' },
  { label: 'My Sessions',  icon: faComments,         path: '/student/chat' },
  { label: 'Appointments', icon: faCalendarDays,     path: '/student/appointments' },
  { label: 'Assessment',   icon: faClipboardList,    path: '/student/assessment' },
  { label: 'Resources',    icon: faBookOpen,         path: '/student/resources' },
  { label: 'History',      icon: faClockRotateLeft,  path: '/student/history' },
]

// ── Shared sidebar component (we'll reuse this across student pages) ─────────
export function StudentSidebar({ active }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className={`hidden md:flex flex-col justify-between bg-[#003D8F] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen p-4`}>
      {/* Top */}
      <div>
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={pauLogo} alt="PAU" className="w-8" />
              <span className="text-white font-semibold text-sm">CampusCare</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/50 hover:text-white transition cursor-pointer ml-auto">
            <FontAwesomeIcon icon={collapsed ? faBars : faXmark} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {NAV.map(({ label, icon, path }) => {
            const isActive = active === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer w-full text-left ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={icon} className="w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Crisis support button */}
        {!collapsed && (
          <div className="mt-6 p-3 rounded-lg bg-red-500/20 border border-red-400/30">
            <div className="flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-300 text-xs" />
              <span className="text-red-300 text-xs font-semibold">Crisis Support</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              If you're in immediate danger, contact PAU Security or call 112.
            </p>
          </div>
        )}
      </div>

      {/* Bottom — user info + logout */}
      <div>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{user?.identifier || 'Student'}</p>
              <p className="text-white/40 text-xs capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition cursor-pointer w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm`}>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Session status badge ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:   'bg-yellow-50 text-yellow-600 border-yellow-200',
    ACTIVE:    'bg-green-50 text-green-600 border-green-200',
    CLOSED:    'bg-gray-100 text-gray-500 border-gray-200',
    ESCALATED: 'bg-red-50 text-red-600 border-red-200',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${map[status] || 'bg-gray-100 text-gray-400'}`}>
      {status}
    </span>
  )
}

// ── Main Dashboard page ──────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions]         = useState([])
  const [assessments, setAssessments]   = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [starting, setStarting]         = useState(false)

  // ── Fetch all dashboard data ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sessRes, assessRes, apptRes] = await Promise.all([
          api.get('/sessions/my'),
          api.get('/assessments/my'),
          api.get('/appointments/student'),
        ])
        setSessions(sessRes.data)
        setAssessments(assessRes.data)
        setAppointments(apptRes.data)
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Start a new session ───────────────────────────────────────────────────
  const handleStartSession = async () => {
    setStarting(true)
    try {
      const res = await api.post('/sessions/start')
      navigate(`/student/chat/${res.data.session_id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start session.')
      setStarting(false)
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeSessions    = sessions.filter(s => s.status === 'ACTIVE').length
  const pendingSessions   = sessions.filter(s => s.status === 'PENDING').length
  const latestAssessment  = assessments[0] ?? null
  const upcomingAppt      = appointments.find(a => a.status === 'SCHEDULED') ?? null
  const recentSessions    = sessions.slice(0, 5)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar active="/student/dashboard" />

      {/* ── Main content ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back, here's your counselling overview
            </p>
          </div>
          <button
            onClick={handleStartSession}
            disabled={starting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003D8F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A5CB8] transition disabled:opacity-60 cursor-pointer"
          >
            {starting
              ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Starting...</>
              : <><FontAwesomeIcon icon={faComments} /> New Session</>
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#003D8F] text-2xl" />
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Active Sessions"
                value={activeSessions}
                sub="Currently in progress"
                color="text-green-600"
              />
              <StatCard
                label="Pending Sessions"
                value={pendingSessions}
                sub="Awaiting counsellor"
                color="text-yellow-500"
              />
              <StatCard
                label="Assessments"
                value={assessments.length}
                sub={latestAssessment ? `Latest: ${latestAssessment.risk_level}` : 'None submitted yet'}
                color="text-[#003D8F]"
              />
              <StatCard
                label="Appointments"
                value={appointments.length}
                sub={upcomingAppt ? `Next: ${new Date(upcomingAppt.scheduled_time).toLocaleDateString()}` : 'No upcoming'}
                color="text-purple-600"
              />
            </div>

            {/* ── Two column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent sessions — 2/3 width */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700">Recent Sessions</h2>
                  <button
                    onClick={() => navigate('/student/chat')}
                    className="text-xs text-[#003D8F] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {recentSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <FontAwesomeIcon icon={faComments} className="text-gray-200 text-4xl mb-3" />
                    <p className="text-sm text-gray-400">No sessions yet</p>
                    <p className="text-xs text-gray-300 mt-1">Start a new session to speak with a counsellor</p>
                    <button
                      onClick={handleStartSession}
                      disabled={starting}
                      className="mt-4 px-4 py-2 bg-[#003D8F] text-white text-xs font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer"
                    >
                      Start your first session
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentSessions.map(session => (
                      <div
                        key={session.session_id}
                        onClick={() => session.status === 'ACTIVE' && navigate(`/student/chat/${session.session_id}`)}
                        className={`flex items-center justify-between px-6 py-4 ${session.status === 'ACTIVE' ? 'hover:bg-gray-50 cursor-pointer' : ''} transition`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            session.status === 'ACTIVE'    ? 'bg-green-400' :
                            session.status === 'PENDING'   ? 'bg-yellow-400' :
                            session.status === 'ESCALATED' ? 'bg-red-400' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="text-sm text-gray-700 font-medium">
                              Session #{session.session_id}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(session.started_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={session.status} />
                          {session.status === 'ACTIVE' && (
                            <span className="text-xs text-[#003D8F] font-medium">Continue →</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column — assessment + appointment */}
              <div className="flex flex-col gap-6">

                {/* Latest assessment */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Latest Assessment</h2>
                    <button
                      onClick={() => navigate('/student/assessment')}
                      className="text-xs text-[#003D8F] hover:underline cursor-pointer"
                    >
                      Take one
                    </button>
                  </div>
                  <div className="px-6 py-5">
                    {latestAssessment ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Risk Level</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            latestAssessment.risk_level === 'HIGH'     ? 'bg-red-50 text-red-600' :
                            latestAssessment.risk_level === 'MODERATE' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {latestAssessment.risk_level}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Score</span>
                          <span className="text-xs font-semibold text-gray-700">{latestAssessment.score}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Type</span>
                          <span className="text-xs text-gray-600">{latestAssessment.assessment_type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Submitted</span>
                          <span className="text-xs text-gray-600">
                            {new Date(latestAssessment.submitted_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center">
                        <FontAwesomeIcon icon={faClipboardList} className="text-gray-200 text-3xl mb-2" />
                        <p className="text-xs text-gray-400">No assessments yet</p>
                        <button
                          onClick={() => navigate('/student/assessment')}
                          className="mt-3 px-3 py-1.5 bg-[#003D8F] text-white text-xs font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer"
                        >
                          Take assessment
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming appointment */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Next Appointment</h2>
                    <button
                      onClick={() => navigate('/student/appointments')}
                      className="text-xs text-[#003D8F] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                  <div className="px-6 py-5">
                    {upcomingAppt ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Type</span>
                          <span className="text-xs font-semibold text-gray-700">{upcomingAppt.appointment_type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Date</span>
                          <span className="text-xs text-gray-600">
                            {new Date(upcomingAppt.scheduled_time).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Time</span>
                          <span className="text-xs text-gray-600">
                            {new Date(upcomingAppt.scheduled_time).toLocaleTimeString('en-GB', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Status</span>
                          <span className="text-xs font-semibold text-green-600">{upcomingAppt.status}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-gray-200 text-3xl mb-2" />
                        <p className="text-xs text-gray-400">No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}