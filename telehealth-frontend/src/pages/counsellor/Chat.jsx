import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CounsellorSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPaperPlane, faSpinner, faLock, faTriangleExclamation,
  faXmark, faFileLines, faCircleCheck
} from '@fortawesome/free-solid-svg-icons'
import { faVideo, faPhone } from '@fortawesome/free-solid-svg-icons'
function StatusBadge({ status }) {
  const map = {
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

// ── Crisis modal ──────────────────────────────────────────────────────────────
function CrisisModal({ sessionId, onClose, onEscalated }) {
  const [riskReason, setRiskReason]     = useState('')
  const [actionTaken, setActionTaken]   = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  

  const handleSubmit = async () => {
    if (!riskReason.trim() || !actionTaken.trim()) {
      setError('Both fields are required.')
      return
    }
    setLoading(true)
    try {
      await api.post(`/sessions/${sessionId}/crisis`, {
        risk_reason: riskReason,
        action_taken: actionTaken,
      })
      onEscalated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to escalate session.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 text-sm" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Flag Crisis Case</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          This will escalate the session status and create a permanent audit record. Only use this when the student displays signs of serious risk.
        </p>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Risk Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={riskReason}
            onChange={e => setRiskReason(e.target.value)}
            placeholder="Describe the signs of high-risk behaviour observed..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-red-400 resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Action Taken <span className="text-red-400">*</span>
          </label>
          <textarea
            value={actionTaken}
            onChange={e => setActionTaken(e.target.value)}
            placeholder="Describe the immediate action taken or recommended..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-red-400 resize-none"
          />
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
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Escalating...' : 'Confirm Escalation'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Note modal ────────────────────────────────────────────────────────────────
function NoteModal({ sessionId, onClose, onSaved }) {
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async () => {
    if (!noteText.trim()) { setError('Note cannot be empty.'); return }
    setLoading(true)
    try {
      await api.post(`/sessions/${sessionId}/note`, { note_text: noteText })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Add Session Note</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Document your clinical observations..."
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a5c] resize-none mb-4"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 cursor-pointer">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#1a3a5c] text-white text-sm font-semibold hover:bg-[#2a5a8c] transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main counsellor chat ──────────────────────────────────────────────────────
export default function CounsellorChat() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()
  

const [messages, setMessages]         = useState([])
const [session, setSession]           = useState(null)
const [newMessage, setNewMessage]     = useState('')
const [loading, setLoading]           = useState(true)
const [sending, setSending]           = useState(false)
const [closing, setClosing]           = useState(false)
const [incomingCall, setIncomingCall] = useState(null)   // ← add this
const [showCrisis, setShowCrisis]     = useState(false)
const [showNote, setShowNote]         = useState(false)
const [error, setError]               = useState('')
const [success, setSuccess]           = useState('')
  const messagesEndRef = useRef(null)
  const pollRef        = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
  loadMessages()
  startPolling()
  return () => clearInterval(pollRef.current)
}, [sessionId])

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages/${sessionId}`)
      setMessages(res.data)
      // Infer session status from messages if needed
      if (res.data.length >= 0) setLoading(false)
    } catch (err) {
      setError('Failed to load messages.')
      setLoading(false)
    }
  }

const startPolling = () => {
  clearInterval(pollRef.current)
  pollRef.current = setInterval(async () => {
    
    try {
      const [msgRes, sessRes] = await Promise.all([
        api.get(`/messages/${sessionId}`),
        api.get(`/sessions/${sessionId}`),
      ])
      setMessages(msgRes.data)
      const updatedSession = sessRes.data


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
        setSuccess('The student has closed this session.')
        setTimeout(() => navigate('/counsellor/sessions'), 2000)
      }
      if (updatedSession.status === 'ESCALATED') {
        clearInterval(pollRef.current)
      }
    } catch (err) {
      
    }
  }, 4000)
}

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      await api.post(`/messages/${sessionId}`, { content: newMessage.trim() })
      setNewMessage('')
      await loadMessages()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const handleClose = async () => {
    setClosing(true)
    try {
      await api.post(`/sessions/${sessionId}/close`)
      clearInterval(pollRef.current)
      setSuccess('Session closed successfully.')
      setTimeout(() => navigate('/counsellor/sessions'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close session.')
      setClosing(false)
    }
  }

  const handleEscalated = () => {
    setShowCrisis(false)
    clearInterval(pollRef.current)
    setSuccess('Session escalated and crisis case recorded.')
    setTimeout(() => navigate('/counsellor/sessions'), 1500)
  }

  const handleNoteSaved = () => {
    setShowNote(false)
    setSuccess('Note saved successfully.')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CounsellorSidebar active="/counsellor/sessions" />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ height: '100vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div>
            <p className="text-sm font-bold text-gray-800">Session #{sessionId}</p>
            <p className="text-xs text-gray-400">Active counselling session — messages are encrypted</p>
          </div>
          <div className="flex items-center gap-2">
  <button
    onClick={() => navigate(`/call/${sessionId}?type=voice`)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-green-400 hover:text-green-600 transition cursor-pointer"
  >
    <FontAwesomeIcon icon={faPhone} />
    Voice
  </button>
  <button
    onClick={() => navigate(`/call/${sessionId}?type=video`)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition cursor-pointer"
  >
    <FontAwesomeIcon icon={faVideo} />
    Video
  </button>
  <button
    onClick={() => setShowNote(true)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition cursor-pointer"
  >
    <FontAwesomeIcon icon={faFileLines} />
    Add Note
  </button>
  <button
    onClick={() => setShowCrisis(true)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-xs text-red-500 hover:bg-red-50 transition cursor-pointer"
  >
    <FontAwesomeIcon icon={faTriangleExclamation} />
    Flag Crisis
  </button>
  <button
    onClick={handleClose}
    disabled={closing}
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3a5c] text-white text-xs font-semibold hover:bg-[#2a5a8c] transition disabled:opacity-60 cursor-pointer"
  >
    {closing
      ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
      : 'Close Session'
    }
  </button>
</div>
        </div>

        {/* Incoming call banner */}
        {incomingCall && (
          <div className="mx-6 mt-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <FontAwesomeIcon icon={incomingCall === 'voice' ? faPhone : faVideo} className="animate-pulse" />
              <span className="font-semibold">
                {incomingCall === 'voice' ? 'Voice' : 'Video'} call in progress
              </span>
              <span className="text-green-500 text-xs">— your student has started a call</span>
            </div>
            <button
              onClick={() => navigate(`/call/${sessionId}?type=${incomingCall}`)}
              className="px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition cursor-pointer"
            >
              Join Now
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>
        )}
        {success && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-600 text-xs flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleCheck} />
            {success}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-300 text-2xl" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FontAwesomeIcon icon={faLock} className="text-gray-200 text-3xl mb-3" />
              <p className="text-sm text-gray-400">Session accepted — waiting for student to send the first message</p>
            </div>
          ) : (
            messages.map(msg => {
              const isCounsellor = msg.sender_type === 'COUNSELLOR'
              return (
                <div key={msg.message_id} className={`flex ${isCounsellor ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    isCounsellor
                      ? 'bg-[#1a3a5c] text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.message_content}</p>
                    <p className={`text-xs mt-1 ${isCounsellor ? 'text-white/60' : 'text-gray-400'}`}>
                      {new Date(msg.sent_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#1a3a5c] focus:bg-white transition"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#1a3a5c] text-white hover:bg-[#2a5a8c] transition disabled:opacity-40 cursor-pointer shrink-0"
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
      </div>

      {showCrisis && (
        <CrisisModal
          sessionId={sessionId}
          onClose={() => setShowCrisis(false)}
          onEscalated={handleEscalated}
        />
      )}
      {showNote && (
        <NoteModal
          sessionId={sessionId}
          onClose={() => setShowNote(false)}
          onSaved={handleNoteSaved}
        />
      )}
    </div>
  )
}