import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CounsellorSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faComments, faCircleDot } from '@fortawesome/free-solid-svg-icons'

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
  const [pending, setPending]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.get('/sessions/pending')
      .then(res => setPending(res.data))
      .catch(() => setError('Failed to load sessions.'))
      .finally(() => setLoading(false))
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CounsellorSidebar active="/counsellor/sessions" />

      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Session Queue</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pending session requests from students</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1a3a5c] text-2xl" />
          </div>
        ) : pending.length === 0 ? (
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
                    <p className="text-xs text-gray-400">Type: {session.session_type}</p>
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
        )}
      </main>
    </div>
  )
}