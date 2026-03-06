import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { StudentSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faComments, faPaperPlane, faSpinner, faPlus,
  faCircleDot, faLock, faCalendarDays
} from '@fortawesome/free-solid-svg-icons'
import { faVideo, faPhone } from '@fortawesome/free-solid-svg-icons'
// ── Status badge ─────────────────────────────────────────────────────────────
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

// ── Feedback modal ────────────────────────────────────────────────────────────
function FeedbackModal({ sessionId, onClose, onSubmitted }) {
  const [rating, setRating]     = useState(0)
  const [comments, setComments] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    setLoading(true)
    try {
      await api.post(`/feedback/${sessionId}`, { rating, comments })
      onSubmitted()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Session Feedback</h3>
        <p className="text-sm text-gray-400 mb-6">How was your counselling session?</p>

        {/* Star rating */}
        <div className="flex gap-2 mb-5">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-full text-lg transition cursor-pointer ${
                n <= rating ? 'bg-[#003D8F] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          placeholder="Any additional comments? (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F] resize-none mb-4"
        />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition cursor-pointer"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Appointment modal ─────────────────────────────────────────────────────────
function AppointmentModal({ sessionId, onClose, onBooked }) {
  const [type, setType]   = useState('VOICE')
  const [date, setDate]   = useState('')
  const [time, setTime]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!date || !time) { setError('Please select a date and time.'); return }
    setLoading(true)
    try {
      const scheduled_time = new Date(`${date}T${time}`).toISOString()
      await api.post(`/appointments/${sessionId}`, { type, scheduled_time })
      onBooked()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Book an Appointment</h3>
        <p className="text-sm text-gray-400 mb-6">Escalate this session to a voice, video, or in-person meeting.</p>

        <div className="flex gap-2 mb-5">
          {['VOICE', 'VIDEO', 'IN_PERSON'].map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                type === t
                  ? 'border-[#003D8F] bg-[#E8F0FC] text-[#003D8F]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F]"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Chat page ────────────────────────────────────────────────────────────
export default function StudentChat() {
  const { user }                          = useAuth()
  const navigate                          = useNavigate()
  const { sessionId }                     = useParams()

  const [sessions, setSessions]                   = useState([])
  const [activeSession, setActiveSession]         = useState(null)
  const [messages, setMessages]                   = useState([])
  const [newMessage, setNewMessage]               = useState('')
  const [loadingSessions, setLoadingSessions]     = useState(true)
  const [loadingMessages, setLoadingMessages]     = useState(false)
  const [sending, setSending]                     = useState(false)
  const [starting, setStarting]                   = useState(false)
  const [closing, setClosing]                     = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const [error, setError]                         = useState('')
  const [showFeedback, setShowFeedback]           = useState(false)
  const [showAppointment, setShowAppointment]     = useState(false)
  const [feedbackSessionId, setFeedbackSessionId] = useState(null)

  const messagesEndRef = useRef(null)
  const pollRef        = useRef(null)

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Fetch sessions on mount ───────────────────────────────────────────────
  useEffect(() => {
    fetchSessions()
    return () => clearInterval(pollRef.current)
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions/my')
      setSessions(res.data)
      return res.data
    } catch {
      setError('Failed to load sessions.')
    } finally {
      setLoadingSessions(false)
    }
  }

  // ── Auto-select from URL param ────────────────────────────────────────────
  useEffect(() => {
  if (sessionId && sessions.length > 0) {
    // Only auto-select from URL param on first load, not on every sessions update
    if (!activeSession) {
      const found = sessions.find(s => s.session_id === Number(sessionId))
      if (found) selectSession(found)
    }
  }
}, [sessionId, sessions])

  // ── Select session ────────────────────────────────────────────────────────
  const selectSession = async (session) => {
    clearInterval(pollRef.current)
    setActiveSession(session)
    setMessages([])
    setError('')
    if (['ACTIVE', 'CLOSED', 'ESCALATED'].includes(session.status)) {
      await loadMessages(session.session_id)
      if (session.status === 'ACTIVE') startPolling(session.session_id)
    }
  }

  // ── Load messages ─────────────────────────────────────────────────────────
  const loadMessages = async (sid) => {
    setLoadingMessages(true)
    try {
      const res = await api.get(`/messages/${sid}`)
      setMessages(res.data)
    } catch {
      setError('Failed to load messages.')
    } finally {
      setLoadingMessages(false)
    }
  }

  // ── Polling ───────────────────────────────────────────────────────────────
const startPolling = (sid) => {
  clearInterval(pollRef.current)
  pollRef.current = setInterval(async () => {
    try {
      // Fetch messages and session status together
      const [msgRes, sessRes] = await Promise.all([
        api.get(`/messages/${sid}`),
        api.get('/sessions/my'),
      ])
      setMessages(msgRes.data)
      const updatedSession = sessRes.data.find(s => s.session_id === sid)
      console.log('Poll - session_type:', updatedSession?.session_type, 'status:', updatedSession?.status)
      if (updatedSession) {
  setSessions(sessRes.data)
  // Only update active session data if it's still the same session
  setActiveSession(prev => 
    prev?.session_id === updatedSession.session_id ? updatedSession : prev
  )
        // Detect if other party started a call
if (
  updatedSession.status === 'ACTIVE' &&
  (updatedSession.session_type === 'VOICE' || updatedSession.session_type === 'VIDEO')
) {
  setIncomingCall(updatedSession.session_type.toLowerCase())
}
// Reset if call ended
if (updatedSession.session_type === 'TEXT') {
  setIncomingCall(null)
}
        if (updatedSession.status === 'CLOSED') {
          clearInterval(pollRef.current)
          setFeedbackSessionId(sid)
          setShowFeedback(true)
        }
        if (updatedSession.status === 'ESCALATED') {
          clearInterval(pollRef.current)
        }
      }
    } catch {}
  }, 4000)
}

  // ── Start new session ─────────────────────────────────────────────────────
  const handleStartSession = async () => {
    setStarting(true)
    setError('')
    try {
      const res = await api.post('/sessions/start')
      const updated = await fetchSessions()
      const newSession = updated?.find(s => s.session_id === res.data.session_id)
      if (newSession) selectSession(newSession)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start session.')
    } finally {
      setStarting(false)
    }
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !activeSession) return
    setSending(true)
    try {
      await api.post(`/messages/${activeSession.session_id}`, { content: newMessage.trim() })
      setNewMessage('')
      await loadMessages(activeSession.session_id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  // ── Close session ─────────────────────────────────────────────────────────
  const handleCloseSession = async () => {
    setClosing(true)
    setError('')
    try {
      await api.post(`/sessions/${activeSession.session_id}/close`)
      clearInterval(pollRef.current)
      // Update locally
      const updated = { ...activeSession, status: 'CLOSED' }
      setActiveSession(updated)
      setSessions(prev =>
        prev.map(s => s.session_id === activeSession.session_id ? updated : s)
      )
      // Prompt feedback immediately
      setFeedbackSessionId(activeSession.session_id)
      setShowFeedback(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close session.')
    } finally {
      setClosing(false)
    }
  }

  // ── Feedback submitted ────────────────────────────────────────────────────
  const handleFeedbackSubmitted = () => {
    setShowFeedback(false)
    setFeedbackSessionId(null)
    navigate('/student/dashboard')
  }

  // ── Appointment booked ────────────────────────────────────────────────────
  const handleAppointmentBooked = () => {
    setShowAppointment(false)
    setError('✓ Appointment booked successfully.')
    setTimeout(() => setError(''), 3000)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar active="/student/chat" />

      <div className="flex-1 flex overflow-hidden" style={{ height: '100vh' }}>

        {/* ── Sessions list ── */}
        <div className="w-72 bg-white border-r border-gray-100 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">My Sessions</h2>
            <button
              onClick={handleStartSession}
              disabled={starting}
              title="Start new session"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#003D8F] text-white hover:bg-[#1A5CB8] transition cursor-pointer disabled:opacity-60"
            >
              {starting
                ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                : <FontAwesomeIcon icon={faPlus} className="text-xs" />
              }
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingSessions ? (
              <div className="flex items-center justify-center h-32">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-300 text-xl" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 px-5 text-center">
                <FontAwesomeIcon icon={faComments} className="text-gray-200 text-3xl mb-2" />
                <p className="text-xs text-gray-400">No sessions yet</p>
                <button
                  onClick={handleStartSession}
                  className="mt-3 px-3 py-1.5 bg-[#003D8F] text-white text-xs font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer"
                >
                  Start session
                </button>
              </div>
            ) : (
              sessions.map(session => (
                <button
                  key={session.session_id}
                  onClick={() => selectSession(session)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 text-left transition cursor-pointer ${
                    activeSession?.session_id === session.session_id
                      ? 'bg-[#E8F0FC]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    session.status === 'ACTIVE'    ? 'bg-green-400' :
                    session.status === 'PENDING'   ? 'bg-yellow-400' :
                    session.status === 'ESCALATED' ? 'bg-red-400' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Session #{session.session_id}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {new Date(session.started_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <StatusBadge status={session.status} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <FontAwesomeIcon icon={faComments} className="text-gray-200 text-5xl mb-4" />
              <p className="text-gray-500 font-medium">Select a session to view messages</p>
              <p className="text-sm text-gray-400 mt-1">Or start a new session to speak with a counsellor</p>
              <button
                onClick={handleStartSession}
                disabled={starting}
                className="mt-5 px-5 py-2.5 bg-[#003D8F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer disabled:opacity-60"
              >
                {starting ? 'Starting...' : 'Start New Session'}
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    activeSession.status === 'ACTIVE'    ? 'bg-green-400' :
                    activeSession.status === 'PENDING'   ? 'bg-yellow-400' :
                    activeSession.status === 'ESCALATED' ? 'bg-red-400' : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Session #{activeSession.session_id}</p>
                    <p className="text-xs text-gray-400">
                      {activeSession.status === 'PENDING'   ? 'Waiting for a counsellor to accept...' :
                       activeSession.status === 'ACTIVE'    ? 'Session in progress' :
                       activeSession.status === 'CLOSED'    ? 'Session closed' :
                                                              'Session escalated'}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
              {/* Action buttons */}
<div className="flex items-center gap-2">
  {activeSession.status === 'ACTIVE' && (
  <button
    onClick={async () => {
  try {
    await api.post(`/sessions/${activeSession.session_id}/type`, { session_type: 'VOICE' })
    // Small delay so the other person's poll catches the update
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch {}
  navigate(`/call/${activeSession.session_id}?type=voice`)
}}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-green-400 hover:text-green-600 transition cursor-pointer"
  >
    <FontAwesomeIcon icon={faPhone} />
    Voice
  </button>
)}
{activeSession.status === 'ACTIVE' && (
  <button
    onClick={async () => {
  try {
    await api.post(`/sessions/${activeSession.session_id}/type`, { session_type: 'VOICE' })
    // Small delay so the other person's poll catches the update
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch {}
  navigate(`/call/${activeSession.session_id}?type=voice`)
}}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-[#003D8F] hover:text-[#003D8F] transition cursor-pointer"
  >
    <FontAwesomeIcon icon={faVideo} />
    Video
  </button>
)}
  {activeSession.status === 'ACTIVE' && (
    <button
      onClick={() => setShowAppointment(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-[#003D8F] hover:text-[#003D8F] transition cursor-pointer"
    >
      <FontAwesomeIcon icon={faCalendarDays} />
      Book Appointment
    </button>
  )}
  {activeSession.status === 'ACTIVE' && (
    <button
      onClick={handleCloseSession}
      disabled={closing}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-red-300 hover:text-red-500 transition cursor-pointer disabled:opacity-60"
    >
      {closing
        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
        : 'Close Session'
      }
    </button>
  )}
                  {activeSession.status === 'CLOSED' && (
                    <button
                      onClick={() => {
                        setFeedbackSessionId(activeSession.session_id)
                        setShowFeedback(true)
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#003D8F] text-white text-xs font-semibold hover:bg-[#1A5CB8] transition cursor-pointer"
                    >
                      Leave Feedback
                    </button>
                  )}
                  <StatusBadge status={activeSession.status} />
                </div>
              </div>

              {/* Error / success bar */}
               {/* Incoming call banner */}
            {incomingCall && (
              <div className="mx-6 mt-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <FontAwesomeIcon icon={incomingCall === 'voice' ? faPhone : faVideo} className="animate-pulse" />
                  <span className="font-semibold">
                    {incomingCall === 'voice' ? 'Voice' : 'Video'} call in progress
                  </span>
                  <span className="text-green-500 text-xs">— your counsellor has started a call</span>
                </div>
                <button
                  onClick={() => navigate(`/call/${activeSession.session_id}?type=${incomingCall}`)}
                  className="px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition cursor-pointer"
                >
                  Join Now
                </button>
              </div>
            )}

            {/* Error / success bar */}
            {error && (
              <div className={`mx-6 mt-3 px-4 py-2.5 rounded-lg text-xs ${
                error.startsWith('✓')
                  ? 'bg-green-50 border border-green-200 text-green-600'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {error}
              </div>
            )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">

                {activeSession.status === 'PENDING' && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mb-3">
                      <FontAwesomeIcon icon={faCircleDot} className="text-yellow-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Waiting for a counsellor</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Your session request has been submitted. A counsellor will accept it shortly.
                    </p>
                  </div>
                )}

                {loadingMessages && (
                  <div className="flex items-center justify-center h-32">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-300 text-xl" />
                  </div>
                )}

                {!loadingMessages && messages.map(msg => {
                  const isStudent = msg.sender_type === 'STUDENT'
                  return (
                    <div key={msg.message_id} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isStudent
                          ? 'bg-[#003D8F] text-white rounded-br-sm'
                          : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                      }`}>
                        <p className="leading-relaxed">{msg.message_content}</p>
                        <p className={`text-xs mt-1 ${isStudent ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(msg.sent_at).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {!loadingMessages && messages.length === 0 && activeSession.status === 'ACTIVE' && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FontAwesomeIcon icon={faLock} className="text-gray-200 text-3xl mb-3" />
                    <p className="text-sm text-gray-400">Session accepted — start the conversation</p>
                    <p className="text-xs text-gray-300 mt-1">Messages are end-to-end encrypted</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              {activeSession.status === 'ACTIVE' && (
                <div className="px-6 py-4 bg-white border-t border-gray-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F] focus:bg-white transition"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#003D8F] text-white hover:bg-[#1A5CB8] transition disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {sending
                        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                        : <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                      }
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faLock} />
                    Messages are encrypted with AES-256
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFeedback && (
        <FeedbackModal
          sessionId={feedbackSessionId}
          onClose={() => setShowFeedback(false)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
      {showAppointment && (
        <AppointmentModal
          sessionId={activeSession?.session_id}
          onClose={() => setShowAppointment(false)}
          onBooked={handleAppointmentBooked}
        />
      )}
    </div>
  )
}