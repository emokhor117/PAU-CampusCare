import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { StudentSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays, faSpinner, faPhone, faVideo,
  faPlus, faTimes, faComments
} from '@fortawesome/free-solid-svg-icons'

// ── Book Appointment Modal ────────────────────────────────────────────────────
function BookAppointmentModal({ onClose, onBooked }) {
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [sessionId, setSessionId] = useState('')
  const [type, setType]           = useState('VOICE')
  const [date, setDate]           = useState('')
  const [time, setTime]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.get('/sessions/my')
      .then(res => {
        const active = res.data.filter(s => s.status === 'ACTIVE')
        setSessions(active)
        if (active.length > 0) setSessionId(String(active[0].session_id))
      })
      .catch(() => setError('Failed to load sessions.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!sessionId) { setError('Please select a session.'); return }
    if (!date || !time) { setError('Please select a date and time.'); return }
    setSubmitting(true)
    setError('')
    try {
      const scheduled_time = new Date(`${date}T${time}`).toISOString()
      await api.post(`/appointments/${sessionId}`, { type, scheduled_time })
      onBooked()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Book an Appointment</h3>
            <p className="text-xs text-gray-400 mt-0.5">Schedule a voice, video, or in-person meeting</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#003D8F] text-xl" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <FontAwesomeIcon icon={faComments} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600">No active sessions</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                You need an active counselling session to book an appointment. Start a session first.
              </p>
            </div>
          ) : (
            <>
              {/* Session picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Session
                </label>
                <select
                  value={sessionId}
                  onChange={e => setSessionId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#003D8F] cursor-pointer"
                >
                  {sessions.map(s => (
                    <option key={s.session_id} value={s.session_id}>
                      Session #{s.session_id} — Active
                    </option>
                  ))}
                </select>
              </div>

              {/* Type picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Appointment Type
                </label>
                <div className="flex gap-2">
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
              </div>

              {/* Date + Time */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#003D8F]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#003D8F]"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          {sessions.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Appointments page ────────────────────────────────────────────────────
export default function StudentAppointments() {
  const navigate                          = useNavigate()
  const [appointments, setAppointments]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [showModal, setShowModal]         = useState(false)
  const [successMsg, setSuccessMsg]       = useState('')

  const fetchAppointments = () => {
    setLoading(true)
    api.get('/appointments/student')
      .then(res => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleBooked = () => {
    setShowModal(false)
    setSuccessMsg('Appointment booked successfully.')
    setTimeout(() => setSuccessMsg(''), 3000)
    fetchAppointments()
  }

  const statusColor = {
    SCHEDULED: 'bg-green-50 text-green-600 border-green-200',
    COMPLETED: 'bg-blue-50 text-blue-600 border-blue-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const upcoming = appointments.filter(a => a.status === 'SCHEDULED')
  const past     = appointments.filter(a => a.status !== 'SCHEDULED')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar active="/student/appointments" />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="md:hidden h-[52px]" />

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your scheduled and past appointments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003D8F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            Book Appointment
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">{successMsg}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#003D8F] text-2xl" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FontAwesomeIcon icon={faCalendarDays} className="text-gray-200 text-4xl mb-3" />
            <p className="text-gray-400">No appointments yet</p>
            <p className="text-sm text-gray-300 mt-1">Click "Book Appointment" to schedule one</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-[#003D8F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Upcoming</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {upcoming.map(appt => (
                    <div key={appt.appointment_id} className="flex items-center justify-between px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E8F0FC] flex items-center justify-center shrink-0">
                          <FontAwesomeIcon
                            icon={appt.appointment_type === 'VOICE' ? faPhone : appt.appointment_type === 'VIDEO' ? faVideo : faCalendarDays}
                            className="text-[#003D8F] text-sm"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {appt.appointment_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(appt.scheduled_time).toLocaleDateString('en-GB', {
                              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(appt.scheduled_time).toLocaleTimeString('en-GB', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(appt.appointment_type === 'VOICE' || appt.appointment_type === 'VIDEO') && (
                          <button
                            onClick={() => navigate(`/call/${appt.session_id}?type=${appt.appointment_type.toLowerCase()}`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#003D8F] text-white text-xs font-semibold hover:bg-[#1A5CB8] transition cursor-pointer"
                          >
                            <FontAwesomeIcon icon={appt.appointment_type === 'VOICE' ? faPhone : faVideo} />
                            Join Call
                          </button>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor[appt.status]}`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Past</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {past.map(appt => (
                    <div key={appt.appointment_id} className="flex items-center justify-between px-6 py-4 opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <FontAwesomeIcon
                            icon={appt.appointment_type === 'VOICE' ? faPhone : appt.appointment_type === 'VIDEO' ? faVideo : faCalendarDays}
                            className="text-gray-400 text-sm"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {appt.appointment_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(appt.scheduled_time).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })} · {new Date(appt.scheduled_time).toLocaleTimeString('en-GB', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor[appt.status]}`}>
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {showModal && (
        <BookAppointmentModal
          onClose={() => setShowModal(false)}
          onBooked={handleBooked}
        />
      )}
    </div>
  )
}
