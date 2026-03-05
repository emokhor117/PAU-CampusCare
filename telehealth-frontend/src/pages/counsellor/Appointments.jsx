import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CounsellorSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner, faCalendarDays, faPhone, faVideo
} from '@fortawesome/free-solid-svg-icons'

export default function CounsellorAppointments() {
  const navigate                          = useNavigate()
  const [appointments, setAppointments]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [updating, setUpdating]           = useState(null)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState('')

  useEffect(() => {
    api.get('/appointments/counsellor')
      .then(res => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      setAppointments(prev =>
        prev.map(a => a.appointment_id === id ? { ...a, status } : a)
      )
      setSuccess(`Appointment marked as ${status}.`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment.')
    } finally {
      setUpdating(null)
    }
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
      <CounsellorSidebar active="/counsellor/appointments" />

      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your scheduled appointments</p>
        </div>

        {error   && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">{success}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1a3a5c] text-2xl" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FontAwesomeIcon icon={faCalendarDays} className="text-gray-200 text-4xl mb-3" />
            <p className="text-gray-400">No appointments yet</p>
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
                            className="text-[#1a3a5c] text-sm"
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
                          <p className="text-xs text-gray-400">Session #{appt.session_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(appt.appointment_type === 'VOICE' || appt.appointment_type === 'VIDEO') && (
                          <button
                            onClick={() => navigate(`/call/${appt.session_id}?type=${appt.appointment_type.toLowerCase()}`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a3a5c] text-white text-xs font-semibold hover:bg-[#2a5a8c] transition cursor-pointer"
                          >
                            <FontAwesomeIcon icon={appt.appointment_type === 'VOICE' ? faPhone : faVideo} />
                            Join Call
                          </button>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor[appt.status]}`}>
                          {appt.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(appt.appointment_id, 'COMPLETED')}
                            disabled={updating === appt.appointment_id}
                            className="px-3 py-1.5 bg-[#1a3a5c] text-white text-xs font-semibold rounded-lg hover:bg-[#2a5a8c] transition disabled:opacity-60 cursor-pointer"
                          >
                            {updating === appt.appointment_id
                              ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                              : 'Complete'
                            }
                          </button>
                          <button
                            onClick={() => handleStatus(appt.appointment_id, 'CANCELLED')}
                            disabled={updating === appt.appointment_id}
                            className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:border-red-300 hover:text-red-500 transition disabled:opacity-60 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
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
                          <p className="text-xs text-gray-400">Session #{appt.session_id}</p>
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
    </div>
  )
}