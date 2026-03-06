import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faComments, faCalendarDays, faRightFromBracket,
  faSpinner, faBars, faXmark, faUser, faCircleDot,
  faTriangleExclamation, faChartBar
} from '@fortawesome/free-solid-svg-icons'
import pauLogo from '../../assets/images/pau logo.png'

const NAV = [
  { label: 'Dashboard',    icon: faHouse,         path: '/counsellor/dashboard' },
  { label: 'Sessions',     icon: faComments,      path: '/counsellor/sessions' },
  { label: 'Appointments', icon: faCalendarDays,  path: '/counsellor/appointments' },
]

export function CounsellorSidebar({ active }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`hidden md:flex flex-col justify-between bg-[#1a3a5c] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen p-4`}>
      <div>
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

        <nav className="flex flex-col gap-1">
          {NAV.map(({ label, icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition cursor-pointer w-full text-left ${
                active === path
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={icon} className="w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{user?.identifier || 'Counsellor'}</p>
              <p className="text-white/40 text-xs">Counsellor</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition cursor-pointer w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

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

export default function CounsellorDashboard() {
  const navigate = useNavigate()
  const [pending, setPending]         = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [accepting, setAccepting]     = useState(null)
  const [error, setError]             = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pendRes, apptRes] = await Promise.all([
          api.get('/sessions/pending'),
          api.get('/appointments/counsellor'),
        ])
        setPending(pendRes.data)
        setAppointments(apptRes.data)
      } catch (err) {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleAccept = async (sessionId) => {
    setAccepting(sessionId)
    try {
      await api.post(`/sessions/${sessionId}/accept`)
      setPending(prev => prev.filter(s => s.session_id !== sessionId))
      navigate(`/counsellor/chat/${sessionId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept session.')
      setAccepting(null)
    }
  }

  const upcomingAppts = appointments.filter(a => a.status === 'SCHEDULED')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CounsellorSidebar active="/counsellor/dashboard" />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Counsellor overview</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1a3a5c] text-2xl" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard label="Pending Queue"    value={pending.length}      sub="Awaiting acceptance"    color="text-yellow-500" />
              <StatCard label="Upcoming Appts"   value={upcomingAppts.length} sub="Scheduled appointments" color="text-[#1a3a5c]"  />
              <StatCard label="Total Appts"      value={appointments.length} sub="All time"               color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Pending sessions */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700">Pending Session Requests</h2>
                  <button
                    onClick={() => navigate('/counsellor/sessions')}
                    className="text-xs text-[#1a3a5c] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {pending.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <FontAwesomeIcon icon={faCircleDot} className="text-gray-200 text-3xl mb-2" />
                    <p className="text-sm text-gray-400">No pending sessions</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pending.map(session => (
                      <div key={session.session_id} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Session #{session.session_id}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={session.status} />
                            {session.is_priority && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
                                HIGH PRIORITY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(session.started_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAccept(session.session_id)}
                          disabled={accepting === session.session_id}
                          className="px-4 py-2 bg-[#1a3a5c] text-white text-xs font-semibold rounded-lg hover:bg-[#2a5a8c] transition disabled:opacity-60 cursor-pointer"
                        >
                          {accepting === session.session_id
                            ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            : 'Accept'
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming appointments */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700">Upcoming Appointments</h2>
                  <button
                    onClick={() => navigate('/counsellor/appointments')}
                    className="text-xs text-[#1a3a5c] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {upcomingAppts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-gray-200 text-3xl mb-2" />
                    <p className="text-sm text-gray-400">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {upcomingAppts.slice(0, 5).map(appt => (
                      <div key={appt.appointment_id} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{appt.appointment_type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(appt.scheduled_time).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })} at {new Date(appt.scheduled_time).toLocaleTimeString('en-GB', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}