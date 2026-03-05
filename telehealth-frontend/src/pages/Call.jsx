import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner, faPhone, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons'

export default function Call() {
  const { sessionId }         = useParams()
  const [searchParams]        = useSearchParams()
  const callType              = searchParams.get('type') || 'video' // 'video' or 'voice'
  const { user }              = useAuth()
  const navigate              = useNavigate()

  const [roomUrl, setRoomUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const iframeRef             = useRef(null)

  useEffect(() => {
    const initCall = async () => {
      try {
        // Try to create room (idempotent — returns existing if already created)
        const res = await api.post(`/calls/${sessionId}/create`)
        setRoomUrl(res.data.url)
      } catch (err) {
        // If room already exists, fetch it
        try {
          const res = await api.get(`/calls/${sessionId}`)
          setRoomUrl(res.data.url)
        } catch {
          setError(err.response?.data?.message || 'Could not connect to call room.')
        }
      } finally {
        setLoading(false)
      }
    }
    initCall()
  }, [sessionId])

  // Build iframe URL with Daily.co params
  const buildIframeUrl = (url) => {
    const params = new URLSearchParams({
      // Hide Daily.co UI elements we don't want
      showLeaveButton: 'true',
      showFullscreenButton: 'true',
      // Voice only — disable camera if type is voice
      ...(callType === 'voice' ? { video: 'false' } : {}),
    })
    return `${url}?${params.toString()}`
  }

  const handleLeave = () => {
    const role = user?.role
    if (role === 'STUDENT')    navigate(`/student/chat/${sessionId}`)
    if (role === 'COUNSELLOR') navigate(`/counsellor/chat/${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a] border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/src/assets/images/pau logo.png" alt="PAU" className="w-7 opacity-80" />
          <div>
            <p className="text-white text-sm font-semibold">PAU CampusCare</p>
            <p className="text-white/40 text-xs">
              {callType === 'voice' ? 'Voice Call' : 'Video Call'} · Session #{sessionId}
            </p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition cursor-pointer"
        >
          <FontAwesomeIcon icon={faPhone} className="rotate-[135deg]" />
          Leave Call
        </button>
      </div>

      {/* Call area */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-xl" />
            </div>
            <p className="text-white/60 text-sm">Connecting to call room...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-400 text-xl" />
            </div>
            <p className="text-white font-semibold">Could not connect</p>
            <p className="text-white/50 text-sm">{error}</p>
            <button
              onClick={handleLeave}
              className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition cursor-pointer"
            >
              Go back to session
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={buildIframeUrl(roomUrl)}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="w-full h-full"
            style={{ height: 'calc(100vh - 65px)', border: 'none' }}
            title="CampusCare Video Call"
          />
        )}
      </div>
    </div>
  )
}