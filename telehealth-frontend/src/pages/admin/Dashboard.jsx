import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faUsers, faBookOpen, faClipboardList,
  faRightFromBracket, faBars, faXmark, faUser,
  faSpinner, faComments, faTriangleExclamation,
  faCircleCheck, faStar
} from '@fortawesome/free-solid-svg-icons'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import pauLogo from '../../assets/images/pau logo.png'

const NAV = [
  { label: 'Dashboard',  icon: faHouse,         path: '/admin/dashboard' },
  { label: 'Users',      icon: faUsers,         path: '/admin/users' },
  { label: 'Resources',  icon: faBookOpen,      path: '/admin/resources' },
  { label: 'Audit Logs', icon: faClipboardList, path: '/admin/audit-logs' },
]

export function AdminSidebar({ active }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = ({ onNav }) => (
    <>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, icon, path }) => (
          <button
            key={path}
            onClick={() => { navigate(path); onNav?.() }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition cursor-pointer w-full text-left ${
              active === path
                ? 'bg-white/15 text-white font-semibold'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={icon} className="w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0f2744] px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>
        <div className="flex items-center gap-2">
          <img src={pauLogo} alt="PAU" className="w-7" />
          <span className="text-white font-semibold text-sm">CampusCare</span>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed top-0 left-0 z-50 w-72 h-full bg-[#0f2744] flex flex-col p-4 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <img src={pauLogo} alt="PAU" className="w-8" />
                <span className="text-white font-semibold text-sm">CampusCare</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/50 hover:text-white transition cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="mb-6 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Portal</p>
              <p className="text-white text-xs font-semibold">Administrator</p>
            </div>

            <NavLinks onNav={() => setMobileOpen(false)} />

            <div className="mt-auto">
              <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-semibold truncate">{user?.identifier || 'Admin'}</p>
                  <p className="text-white/40 text-xs">Administrator</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition cursor-pointer w-full"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Desktop sidebar ────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col justify-between bg-[#0f2744] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen p-4`}>
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

          {!collapsed && (
            <div className="mb-6 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Portal</p>
              <p className="text-white text-xs font-semibold">Administrator</p>
            </div>
          )}

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
                <p className="text-white text-xs font-semibold truncate">{user?.identifier || 'Admin'}</p>
                <p className="text-white/40 text-xs">Administrator</p>
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
    </>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '50').replace('500', '50')}`}>
          <FontAwesomeIcon icon={icon} className={`text-sm ${color}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const PIE_COLORS = ['#003D8F', '#00A878', '#F59E0B', '#EF4444']

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null)
  const [apptTypes, setApptTypes] = useState([])
  const [workload, setWorkload]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, apptRes, workRes] = await Promise.all([
          api.get('/analytics/system'),
          api.get('/analytics/appointments'),
          api.get('/analytics/workload'),
        ])
        setStats(statsRes.data)
        setApptTypes(apptRes.data.map(a => ({
          name: a.appointment_type.replace('_', ' '),
          value: a._count,
        })))
        setWorkload(workRes.data.map((w) => ({
          name: `Counsellor ${w.counsellor_id ?? 'Unassigned'}`,
          sessions: w._count,
        })))
      } catch {
        setError('Failed to load analytics data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="/admin/dashboard" />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="md:hidden h-[52px]" />
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">System overview and analytics</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#0f2744] text-2xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard label="Total Sessions"  value={stats?.totalSessions}  sub="All time"           color="text-[#003D8F]"  icon={faComments} />
              <StatCard label="Active Sessions" value={stats?.activeSessions} sub="Currently open"     color="text-green-600"  icon={faCircleCheck} />
              <StatCard label="Closed Sessions" value={stats?.closedSessions} sub="Completed"          color="text-gray-500"   icon={faCircleCheck} />
              <StatCard label="Crisis Cases"    value={stats?.highRiskCases}  sub="Escalated"          color="text-red-500"    icon={faTriangleExclamation} />
              <StatCard label="Avg. Rating"     value={stats?.averageRating ? `${Number(stats.averageRating).toFixed(1)}/5` : '—'} sub="Session feedback" color="text-yellow-500" icon={faStar} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-6">Appointments by Type</h2>
                {apptTypes.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No appointment data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={apptTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {apptTypes.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-6">Counsellor Session Workload</h2>
                {workload.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No workload data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={workload} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#003D8F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
