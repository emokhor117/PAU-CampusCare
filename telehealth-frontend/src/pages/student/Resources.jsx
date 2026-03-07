import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { StudentSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faSpinner, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

const CATEGORY_COLORS = {
  'Anxiety':    'bg-purple-50 text-purple-600 border-purple-200',
  'Depression': 'bg-blue-50 text-blue-600 border-blue-200',
  'Stress':     'bg-orange-50 text-orange-600 border-orange-200',
  'Crisis':     'bg-red-50 text-red-600 border-red-200',
  'General':    'bg-gray-100 text-gray-600 border-gray-200',
}

export default function StudentResources() {
  const [resources, setResources]   = useState([])
  const [filtered, setFiltered]     = useState([])
  const [categories, setCategories] = useState([])
  const [active, setActive]         = useState('All')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    api.get('/resources')
      .then(res => {
        setResources(res.data)
        setFiltered(res.data)
        const cats = ['All', ...new Set(res.data.map(r => r.category))]
        setCategories(cats)
      })
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoading(false))
  }, [])

  const handleFilter = (cat) => {
    setActive(cat)
    setFiltered(cat === 'All' ? resources : resources.filter(r => r.category === cat))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar active="/student/resources" />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="md:hidden h-[52px]" />
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mental health resources and reading materials</p>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                  active === cat
                    ? 'bg-[#003D8F] text-white border-[#003D8F]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#003D8F] hover:text-[#003D8F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#003D8F] text-2xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FontAwesomeIcon icon={faBookOpen} className="text-gray-200 text-4xl mb-3" />
            <p className="text-gray-400">No resources available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(resource => (
              <div key={resource.resource_id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug">{resource.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${CATEGORY_COLORS[resource.category] || CATEGORY_COLORS['General']}`}>
                      {resource.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Added {new Date(resource.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                
                <a
                  href={resource.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-[#003D8F] text-[#003D8F] text-xs font-semibold hover:bg-[#E8F0FC] transition"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  Open Resource
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}