import { AdminSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

export default function AdminAuditLogs() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="/admin/audit-logs" />
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-sm text-gray-400 mt-0.5">System activity and security audit trail</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-700 mb-2">Endpoint Not Yet Available</h2>
          <p className="text-sm text-gray-400 max-w-sm">
            An audit log endpoint has not been implemented on the backend yet. Once <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">GET /audit-logs</code> is available, this page will display a full chronological audit trail of all system actions.
          </p>
        </div>
      </main>
    </div>
  )
}