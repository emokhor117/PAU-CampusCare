import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { StudentSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockRotateLeft, faSpinner, faComments } from '@fortawesome/free-solid-svg-icons'

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

export default function StudentHistory() {
  const navigate                  = useNavigate()
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.get('/sessions/my')
      .then(res => setSessions(res.data))
      .catch(() => setError('Failed to load session history.'))
      .finally(() => setLoading(false))
  }, [])

  const closed    = sessions.filter(s => s.status === 'CLOSED')
  const escalated = sessions.filter(s => s.status === 'ESCALATED')
  const active    = sessions.filter(s => ['ACTIVE', 'PENDING'].includes(s.status))

  const Section = ({ title, items, emptyMsg }) => (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-300 px-1">{emptyMsg}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {items.map(session => (
            <div
              key={session.session_id}
              onClick={() => navigate(`/student/chat/${session.session_id}`)}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faComments} className="text-gray-400 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Session #{session.session_id}</p>
                  <p className="text-xs text-gray-400">
                    Started: {new Date(session.started_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                    {session.ended_at && ` · Ended: ${new Date(session.ended_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}`}
                  </p>
                  <p className="text-xs text-gray-400">Type: {session.session_type}</p>
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
      <StudentSidebar active="/student/history" />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Session History</h1>
          <p className="text-sm text-gray-400 mt-0.5">All your past and current sessions</p>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#003D8F] text-2xl" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-gray-200 text-4xl mb-3" />
            <p className="text-gray-400">No session history yet</p>
          </div>
        ) : (
          <>
            <Section title="Active & Pending"  items={active}    emptyMsg="No active sessions" />
            <Section title="Closed Sessions"   items={closed}    emptyMsg="No closed sessions yet" />
            <Section title="Escalated Cases"   items={escalated} emptyMsg="No escalated sessions" />
          </>
        )}
      </main>
    </div>
  )
}