import { useState, useEffect, useRef } from 'react'
import { AdminSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserPlus, faUsers, faUserGraduate, faUserTie,
  faXmark, faEye, faEyeSlash, faCircleCheck,
  faCircleXmark, faMagnifyingGlass, faShieldHalved,
  faEllipsisVertical, faTrash, faBan, faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import api from '../../api/axios'

const DEPARTMENTS = [
  'Computer Science', 'Business Administration', 'Mass Communication',
  'Economics', 'Finance', 'Mechanical Engineering', 'Electrical Engineering',
]
const LEVELS = ['100', '200', '300', '400', '500']
const defaultStudentForm = { matric_number: '', email: '', password: '', department: '', level: '' }
const defaultCounsellorForm = { staff_number: '', email: '', password: '', department: '' }

export default function AdminUsers() {
  const [activeTab, setActiveTab]           = useState('students')
  const [students, setStudents]             = useState([])
  const [counsellors, setCounsellors]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [modalOpen, setModalOpen]           = useState(false)
  const [modalRole, setModalRole]           = useState('student')
  const [studentForm, setStudentForm]       = useState(defaultStudentForm)
  const [counsellorForm, setCounsellorForm] = useState(defaultCounsellorForm)
  const [showPassword, setShowPassword]     = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [formError, setFormError]           = useState('')
  const [formSuccess, setFormSuccess]       = useState('')
  const [pageError, setPageError]           = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/users/students'),
        api.get('/users/counsellors'),
      ])
      setStudents(sRes.data)
      setCounsellors(cRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openModal = (role) => {
    setModalRole(role)
    setStudentForm(defaultStudentForm)
    setCounsellorForm(defaultCounsellorForm)
    setFormError('')
    setFormSuccess('')
    setShowPassword(false)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      if (modalRole === 'student') {
        const { matric_number, email, password, department, level } = studentForm
        if (!matric_number || !email || !password || !department || !level) {
          setFormError('All fields are required.')
          setSubmitting(false)
          return
        }
        await api.post('/users/student', studentForm)
        setFormSuccess('Student account created successfully.')
      } else {
        const { staff_number, email, password, department } = counsellorForm
        if (!staff_number || !email || !password || !department) {
          setFormError('All fields are required.')
          setSubmitting(false)
          return
        }
        await api.post('/users/counsellor', counsellorForm)
        setFormSuccess('Counsellor account created successfully.')
      }
      fetchUsers()
      setTimeout(() => { setModalOpen(false); setFormSuccess('') }, 1500)
    } catch (e) {
      setFormError(e?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (user_id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      await api.patch(`/users/${user_id}/status`, { status: newStatus })
      fetchUsers()
    } catch (e) { console.error(e) }
  }

  const handleDeleteUser = async (user_id) => {
    if (!window.confirm('Are you sure? This will permanently delete the user and all their data. This cannot be undone.')) return
    try {
      setPageError('')
      await api.delete(`/users/${user_id}`)
      fetchUsers()
    } catch (e) {
      setPageError(e?.response?.data?.message || 'Failed to delete user.')
    }
  }

  const filteredStudents = students.filter((s) =>
    s.matric_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredCounsellors = counsellors.filter((c) =>
    c.staff_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  )

  const allUsers = [...students, ...counsellors]
  const statsCards = [
    { label: 'Total Students',    value: students.length,    icon: faUserGraduate, bg: 'bg-blue-50',    color: 'text-blue-500',    border: 'border-blue-100' },
    { label: 'Total Counsellors', value: counsellors.length, icon: faUserTie,      bg: 'bg-emerald-50', color: 'text-emerald-500', border: 'border-emerald-100' },
    { label: 'Active Accounts',   value: allUsers.filter(u => (u.user?.account_status ?? u.account_status) === 'ACTIVE').length, icon: faCircleCheck, bg: 'bg-green-50', color: 'text-green-500', border: 'border-green-100' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="/admin/users" />
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage student and counsellor accounts</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => openModal('student')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <FontAwesomeIcon icon={faUserPlus} className="text-xs" /> Add Student
            </button>
            <button onClick={() => openModal('counsellor')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              <FontAwesomeIcon icon={faUserPlus} className="text-xs" /> Add Counsellor
            </button>
          </div>
        </div>

        {pageError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleXmark} className="text-xs shrink-0" />
            {pageError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statsCards.map((card) => (
            <div key={card.label} className={`bg-white rounded-xl border ${card.border} shadow-sm p-5 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center`}>
                <FontAwesomeIcon icon={card.icon} className={`${card.color} text-sm`} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{card.label}</p>
                <p className="text-xl font-bold text-gray-800">{loading ? '—' : card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {['students', 'counsellors'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search by ID, email, or department..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'students' ? (
            <StudentTable students={filteredStudents} onToggleStatus={handleToggleStatus} onDelete={handleDeleteUser} />
          ) : (
            <CounsellorTable counsellors={filteredCounsellors} onToggleStatus={handleToggleStatus} onDelete={handleDeleteUser} />
          )}
        </div>
      </main>

      {modalOpen && (
        <AddUserModal role={modalRole}
          studentForm={studentForm} setStudentForm={setStudentForm}
          counsellorForm={counsellorForm} setCounsellorForm={setCounsellorForm}
          showPassword={showPassword} setShowPassword={setShowPassword}
          onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
          submitting={submitting} error={formError} success={formSuccess} />
      )}
    </div>
  )
}

// ── Action Menu ───────────────────────────────────────────────────────────────
function ActionMenu({ status, onToggleStatus, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isActive = status === 'ACTIVE'

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
          <button
            onClick={() => { onToggleStatus(); setOpen(false) }}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition cursor-pointer ${
              isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
            }`}
          >
            <FontAwesomeIcon icon={isActive ? faBan : faCheckCircle} className="text-xs" />
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
            Delete User
          </button>
        </div>
      )}
    </div>
  )
}

// ── Tables ────────────────────────────────────────────────────────────────────
function StudentTable({ students, onToggleStatus, onDelete }) {
  if (students.length === 0) return <EmptyState message="No students found." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Matric No.', 'Email', 'Department', 'Level', 'Anon ID', 'Status', ''].map((h, i) => (
              <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {students.map((s) => (
            <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-gray-800">{s.matric_number}</td>
              <td className="px-5 py-3.5 text-gray-600">{s.email}</td>
              <td className="px-5 py-3.5 text-gray-600">{s.department}</td>
              <td className="px-5 py-3.5 text-gray-600">{s.level}L</td>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-full border border-violet-100">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                  {s.user?.anonymousProfile?.display_name ?? s.display_name ?? '—'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={s.user?.account_status ?? s.account_status} />
              </td>
              <td className="px-5 py-3.5">
                <ActionMenu
                  status={s.user?.account_status ?? s.account_status}
                  onToggleStatus={() => onToggleStatus(s.user?.user_id ?? s.user_id, s.user?.account_status ?? s.account_status)}
                  onDelete={() => onDelete(s.user?.user_id ?? s.user_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CounsellorTable({ counsellors, onToggleStatus, onDelete }) {
  if (counsellors.length === 0) return <EmptyState message="No counsellors found." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Staff No.', 'Email', 'Department', 'Status', ''].map((h, i) => (
              <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {counsellors.map((c) => (
            <tr key={c.staff_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-gray-800">{c.staff_number}</td>
              <td className="px-5 py-3.5 text-gray-600">{c.email}</td>
              <td className="px-5 py-3.5 text-gray-600">{c.department}</td>
              <td className="px-5 py-3.5">
                <StatusBadge status={c.user?.account_status ?? c.account_status} />
              </td>
              <td className="px-5 py-3.5">
                <ActionMenu
                  status={c.user?.account_status ?? c.account_status}
                  onToggleStatus={() => onToggleStatus(c.user?.user_id ?? c.user_id, c.user?.account_status ?? c.account_status)}
                  onDelete={() => onDelete(c.user?.user_id ?? c.user_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
      <FontAwesomeIcon icon={isActive ? faCircleCheck : faCircleXmark} className="text-[10px]" />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function EmptyState({ message }) {
  return (
    <div className="p-16 flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

function AddUserModal({ role, studentForm, setStudentForm, counsellorForm, setCounsellorForm, showPassword, setShowPassword, onClose, onSubmit, submitting, error, success }) {
  const isStudent = role === 'student'
  const sField = (field) => (e) => setStudentForm((p) => ({ ...p, [field]: e.target.value }))
  const cField = (field) => (e) => setCounsellorForm((p) => ({ ...p, [field]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isStudent ? 'bg-blue-50' : 'bg-emerald-50'}`}>
              <FontAwesomeIcon icon={isStudent ? faUserGraduate : faUserTie} className={`text-sm ${isStudent ? 'text-blue-500' : 'text-emerald-500'}`} />
            </div>
            <h2 className="text-base font-semibold text-gray-800">{isStudent ? 'Add New Student' : 'Add New Counsellor'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {isStudent ? (
            <>
              <InputField label="Matriculation Number" placeholder="e.g. 21120612457" value={studentForm.matric_number} onChange={sField('matric_number')} />
              <InputField label="Email Address" type="email" placeholder="student@pau.edu.ng" value={studentForm.email} onChange={sField('email')} />
              <PasswordField label="Temporary Password" value={studentForm.password} onChange={sField('password')} show={showPassword} onToggle={() => setShowPassword(p => !p)} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Department" value={studentForm.department} onChange={sField('department')} options={DEPARTMENTS} />
                <SelectField label="Level" value={studentForm.level} onChange={sField('level')} options={LEVELS} display={(l) => `${l}L`} />
              </div>
            </>
          ) : (
            <>
              <InputField label="Staff Number" placeholder="e.g. STF/2024/001" value={counsellorForm.staff_number} onChange={cField('staff_number')} />
              <InputField label="Email Address" type="email" placeholder="counsellor@pau.edu.ng" value={counsellorForm.email} onChange={cField('email')} />
              <PasswordField label="Temporary Password" value={counsellorForm.password} onChange={cField('password')} show={showPassword} onToggle={() => setShowPassword(p => !p)} />
              <SelectField label="Department" value={counsellorForm.department} onChange={cField('department')} options={DEPARTMENTS} />
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              <FontAwesomeIcon icon={faCircleXmark} className="text-xs shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm text-green-600">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs shrink-0" />{success}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onSubmit} disabled={submitting}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${isStudent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-60 disabled:cursor-not-allowed`}>
            {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? 'Creating...' : `Create ${isStudent ? 'Student' : 'Counsellor'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, type = 'text', placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-300" />
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} placeholder="Minimum 8 characters" value={value} onChange={onChange}
          className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-300" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="text-xs" />
        </button>
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, display }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 bg-white">
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{display ? display(o) : o}</option>)}
      </select>
    </div>
  )
}
