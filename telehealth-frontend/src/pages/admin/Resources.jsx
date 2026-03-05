import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { AdminSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookOpen, faSpinner, faPlus, faXmark, faCircleCheck
} from '@fortawesome/free-solid-svg-icons'

function AddResourceModal({ onClose, onAdded }) {
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('')
  const [url, setUrl]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async () => {
    if (!title.trim() || !category.trim() || !url.trim()) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    try {
      await api.post('/resources', { title, category, content_url: url })
      onAdded()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resource.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">Add Resource</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Understanding Anxiety"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#0f2744]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#0f2744]"
            >
              <option value="">Select a category</option>
              {['Anxiety', 'Depression', 'Stress', 'Crisis', 'General'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Content URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#0f2744]"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#0f2744] text-white text-sm font-semibold hover:bg-[#1a3a5c] transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Adding...' : 'Add Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')

  const fetchResources = () => {
    api.get('/resources')
      .then(res => setResources(res.data))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchResources() }, [])

  const handleAdded = () => {
    setShowModal(false)
    setSuccess('Resource added successfully.')
    setTimeout(() => setSuccess(''), 3000)
    fetchResources()
  }

  const CATEGORY_COLORS = {
    'Anxiety':    'bg-purple-50 text-purple-600 border-purple-200',
    'Depression': 'bg-blue-50 text-blue-600 border-blue-200',
    'Stress':     'bg-orange-50 text-orange-600 border-orange-200',
    'Crisis':     'bg-red-50 text-red-600 border-red-200',
    'General':    'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="/admin/resources" />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage mental health resources for students</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0f2744] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3a5c] transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Resource
          </button>
        </div>

        {error   && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleCheck} /> {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#0f2744] text-2xl" />
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FontAwesomeIcon icon={faBookOpen} className="text-gray-200 text-4xl mb-3" />
            <p className="text-gray-400">No resources yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 px-4 py-2 bg-[#0f2744] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Add first resource
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {resources.map(resource => (
              <div key={resource.resource_id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faBookOpen} className="text-gray-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{resource.title}</p>
                    <a
                      href={resource.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#003D8F] hover:underline truncate max-w-xs block"
                    >
                      {resource.content_url}
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Added {new Date(resource.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[resource.category] || CATEGORY_COLORS['General']}`}>
                  {resource.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      

      {showModal && (
        <AddResourceModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  )
}