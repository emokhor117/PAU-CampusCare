import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { StudentSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function StudentAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    api.get('/appointments/student')
      .then(res => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = {
    SCHEDULED: 'bg-green-50 text-green-600 border-green-200',
    COMPLETED: 'bg-blue-50 text-blue-600 border-blue-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const upcoming  = appointments.filter(a => a.status === 'SCHEDULED')
  const past      = appointments.filter(a => a.status !== 'SCHEDULED')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar active="/student/appointments" />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your scheduled and past appointments</p>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#003D8F] text-2xl" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FontAwesomeIcon icon={faCalendarDays} className="text-gray-200 text-4xl mb-3" />
            <p className="text-gray-400">No appointments yet</p>
            <p className="text-sm text-gray-300 mt-1">Book an appointment from an active session</p>
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
                          <FontAwesomeIcon icon={faCalendarDays} className="text-[#003D8F] text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{appt.appointment_type.replace('_', ' ')}</p>
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
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor[appt.status]}`}>
                        {appt.status}
                      </span>
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
                      <div>
                        <p className="text-sm font-medium text-gray-700">{appt.appointment_type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(appt.scheduled_time).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })} · {new Date(appt.scheduled_time).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
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