import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CounsellorSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner, faComments, faCircleDot, faInbox
} from '@fortawesome/free-solid-svg-icons'

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

export default function CounsellorSessions() {
  const navigate = useNavigate()

  const [tab, setTab]             = useState('queue')
  const [pending, setPending]     = useState([])
  const [mySessions, setMySessions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [error, setError]         = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pendRes, myRes] = await Promise.all([
          api.get('/sessions/pending'),
          api.get('/sessions/mine'),
        ])
        setPending(pendRes.data)
        setMySessions(myRes.data)
      } catch {
        setError('Failed to load sessions.')
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

  const active    = mySessions.filter(s => s.status === 'ACTIVE')
  const closed    = mySessions.filter(s => s.status === 'CLOSED')
  const escalated = mySessions.filter(s => s.status === 'ESCALATED')

  const Section = ({ title, items, emptyMsg, clickable = true }) => (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-300 px-1">{emptyMsg}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {items.map(session => (
            <div
              key={session.session_id}
              onClick={() => clickable && navigate(`/counsellor/chat/${session.session_id}`)}
              className={`flex items-center justify-between px-6 py-4 ${clickable ? 'hover:bg-gray-50 cursor-pointer' : ''} transition`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faComments} className="text-gray-400 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Session #{session.session_id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Started: {new Date(session.started_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                    {session.ended_at && ` · Ended: ${new Date(session.ended_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}`}
                  </p>
                </div>
              </div>
              <StatusBadge status={session.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CounsellorSidebar active="/counsellor/sessions" />

      <main className="flex-1 p-6 md:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage session requests and your session history</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
              tab === 'queue'
                ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#1a3a5c]'
            }`}
          >
            <FontAwesomeIcon icon={faInbox} />
            Queue
            {pending.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-400 text-white text-xs font-bold">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('my')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
              tab === 'my'
                ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#1a3a5c]'
            }`}
          >
            <FontAwesomeIcon icon={faComments} />
            My Sessions
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1a3a5c] text-2xl" />
          </div>
        ) : tab === 'queue' ? (
          // ── Pending queue ──
          pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FontAwesomeIcon icon={faCircleDot} className="text-gray-200 text-4xl mb-3" />
              <p className="text-gray-400">No pending sessions</p>
              <p className="text-sm text-gray-300 mt-1">New student requests will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {pending.map(session => (
                <div key={session.session_id} className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E8F0FC] flex items-center justify-center">
                      <FontAwesomeIcon icon={faComments} className="text-[#1a3a5c] text-sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">Session #{session.session_id}</p>
                        {session.is_priority && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Requested: {new Date(session.started_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={session.status} />
                    <button
                      onClick={() => handleAccept(session.session_id)}
                      disabled={accepting === session.session_id}
                      className="px-5 py-2 bg-[#1a3a5c] text-white text-xs font-semibold rounded-lg hover:bg-[#2a5a8c] transition disabled:opacity-60 cursor-pointer"
                    >
                      {accepting === session.session_id
                        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        : 'Accept Session'
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // ── My sessions ──
          mySessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FontAwesomeIcon icon={faComments} className="text-gray-200 text-4xl mb-3" />
              <p className="text-gray-400">No sessions yet</p>
            </div>
          ) : (
            <>
              <Section title="Active"    items={active}    emptyMsg="No active sessions"    />
              <Section title="Escalated" items={escalated} emptyMsg="No escalated sessions" />
              <Section title="Closed"    items={closed}    emptyMsg="No closed sessions yet" />
            </>
          )
        )}
      </main>
    </div>
  )
}