import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CounsellorSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner, faComments, faCircleDot, faInbox,
  faNoteSticky, faXmark
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

// ── Notes Modal ───────────────────────────────────────────────────────────────
function NotesModal({ sessionId, onClose }) {
  const [notes, setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get(`/sessions/${sessionId}/notes`)
      .then(res => setNotes(res.data))
      .catch(() => setError('Failed to load notes.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F0FC] flex items-center justify-center">
              <FontAwesomeIcon icon={faNoteSticky} className="text-[#1a3a5c] text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Session Notes</h3>
              <p className="text-xs text-gray-400">Session #{sessionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1a3a5c] text-xl" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-8">{error}</p>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FontAwesomeIcon icon={faNoteSticky} className="text-gray-200 text-3xl mb-3" />
              <p className="text-sm text-gray-400">No notes recorded for this session</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notes.map((note, i) => (
                <div key={note.note_id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#1a3a5c]">Note {i + 1}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(note.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })} · {new Date(note.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{note.note_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CounsellorSessions() {
  const navigate = useNavigate()

  const [tab, setTab]               = useState('queue')
  const [pending, setPending]       = useState([])
  const [mySessions, setMySessions] = useState([])
  const [loading, setLoading]       = useState(true)
  const [accepting, setAccepting]   = useState(null)
  const [error, setError]           = useState('')
  const [notesSession, setNotesSession] = useState(null) // session_id to show notes for

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

  const Section = ({ title, items, emptyMsg, clickable = true, showNotes = false }) => (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-300 px-1">{emptyMsg}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {items.map(session => (
            <div
              key={session.session_id}
              className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
            >
              <div
                className={`flex items-center gap-3 flex-1 min-w-0 ${clickable ? 'cursor-pointer' : ''}`}
                onClick={() => clickable && navigate(`/counsellor/chat/${session.session_id}`)}
              >
                <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faComments} className="text-gray-400 text-xs" />
                </div>
                <div className="min-w-0">
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
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <StatusBadge status={session.status} />
                {showNotes && (
                  <button
                    onClick={() => setNotesSession(session.session_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faNoteSticky} className="text-xs" />
                    Notes
                  </button>
                )}
              </div>
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
        <div className="md:hidden h-[52px]" />
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
          mySessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FontAwesomeIcon icon={faComments} className="text-gray-200 text-4xl mb-3" />
              <p className="text-gray-400">No sessions yet</p>
            </div>
          ) : (
            <>
              <Section title="Active"    items={active}    emptyMsg="No active sessions"     clickable={true}  showNotes={false} />
              <Section title="Escalated" items={escalated} emptyMsg="No escalated sessions"  clickable={false} showNotes={true}  />
              <Section title="Closed"    items={closed}    emptyMsg="No closed sessions yet"  clickable={false} showNotes={true}  />
            </>
          )
        )}
      </main>

      {notesSession && (
        <NotesModal
          sessionId={notesSession}
          onClose={() => setNotesSession(null)}
        />
      )}
    </div>
  )
}
