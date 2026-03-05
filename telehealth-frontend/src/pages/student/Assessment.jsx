import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { StudentSidebar } from './Dashboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClipboardList, faSpinner, faCircleCheck,
  faTriangleExclamation, faChevronRight, faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

// ── PHQ-9 questions ───────────────────────────────────────────────────────────
const QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed — or the opposite, being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
]

const OPTIONS = [
  { label: 'Not at all',        value: 0 },
  { label: 'Several days',      value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day',  value: 3 },
]

function getRiskInfo(score) {
  if (score <= 4)  return { level: 'LOW',      color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200', label: 'Minimal or no depression' }
  if (score <= 9)  return { level: 'MODERATE', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Mild to moderate depression' }
  return            { level: 'HIGH',     color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Moderately severe to severe depression' }
}

export default function StudentAssessment() {
  const navigate = useNavigate()

  const [step, setStep]             = useState('intro')   // intro | questions | result
  const [current, setCurrent]       = useState(0)
  const [responses, setResponses]   = useState(Array(9).fill(null))
  const [result, setResult]         = useState(null)
  const [history, setHistory]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    api.get('/assessments/my')
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (value) => {
    const updated = [...responses]
    updated[current] = value
    setResponses(updated)
    // Auto-advance after short delay
    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300)
    }
  }

  const handleSubmit = async () => {
    if (responses.some(r => r === null)) {
      setError('Please answer all questions before submitting.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/assessments', {
        assessment_type: 'PHQ-9',
        responses,
      })
      setResult(res.data)
      setStep('result')
      // Refresh history
      const histRes = await api.get('/assessments/my')
      setHistory(histRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = responses.filter(r => r !== null).length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar active="/student/assessment" />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* ── Intro ── */}
        {step === 'intro' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Self-Assessment</h1>
              <p className="text-sm text-gray-400 mt-0.5">PHQ-9 Depression Screening</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Start card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#E8F0FC] flex items-center justify-center">
                      <FontAwesomeIcon icon={faClipboardList} className="text-[#003D8F]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800">PHQ-9 Questionnaire</h2>
                      <p className="text-xs text-gray-400">Patient Health Questionnaire · 9 questions · ~2 minutes</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the following problems? Answer honestly — your responses are confidential and reviewed only by your assigned counsellor.
                  </p>

                  <div className="flex flex-col gap-3 mb-8">
                    {[
                      { score: '0–4',   level: 'Low',      desc: 'Minimal or no depression',               color: 'bg-green-50 border-green-200 text-green-700' },
                      { score: '5–9',   level: 'Moderate', desc: 'Mild to moderate depression',            color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                      { score: '10+',   level: 'High',     desc: 'Moderately severe to severe depression', color: 'bg-red-50 border-red-200 text-red-700' },
                    ].map(({ score, level, desc, color }) => (
                      <div key={level} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${color}`}>
                        <span className="text-xs font-bold w-10 shrink-0">{score}</span>
                        <span className="text-xs font-semibold w-20 shrink-0">{level}</span>
                        <span className="text-xs">{desc}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('questions')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#003D8F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A5CB8] transition cursor-pointer"
                  >
                    Start Assessment
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700">Assessment History</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-300" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                      <p className="text-xs text-gray-400">No assessments yet</p>
                    </div>
                  ) : (
                    history.map(a => {
                      const risk = getRiskInfo(a.score)
                      return (
                        <div key={a.assessment_id} className="px-5 py-3.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(a.submitted_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${risk.bg} ${risk.border} ${risk.color}`}>
                              {a.risk_level}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Score: {a.score} · {a.assessment_type}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Questions ── */}
        {step === 'questions' && (
          <div className="max-w-2xl mx-auto">

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">Question {current + 1} of {QUESTIONS.length}</p>
                <p className="text-xs text-gray-400">{progress} answered</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#003D8F] rounded-full transition-all duration-300"
                  style={{ width: `${(progress / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
              <p className="text-xs font-semibold text-[#003D8F] uppercase tracking-widest mb-4">
                Over the last 2 weeks...
              </p>
              <h2 className="text-lg font-semibold text-gray-800 leading-snug mb-8">
                {QUESTIONS[current]}
              </h2>

              <div className="flex flex-col gap-3">
                {OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handleSelect(value)}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl border text-sm transition cursor-pointer ${
                      responses[current] === value
                        ? 'border-[#003D8F] bg-[#E8F0FC] text-[#003D8F] font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-[#003D8F] hover:bg-gray-50'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      responses[current] === value
                        ? 'bg-[#003D8F] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => current > 0 ? setCurrent(current - 1) : setStep('intro')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                Back
              </button>

              {current < QUESTIONS.length - 1 ? (
                <button
                  onClick={() => responses[current] !== null && setCurrent(current + 1)}
                  disabled={responses[current] === null}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition disabled:opacity-40 cursor-pointer"
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || responses.some(r => r === null)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition disabled:opacity-40 cursor-pointer"
                >
                  {submitting
                    ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Submitting...</>
                    : <><FontAwesomeIcon icon={faCircleCheck} /> Submit Assessment</>
                  }
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Result ── */}
        {step === 'result' && result && (() => {
          const risk = getRiskInfo(result.score)
          return (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">

                <div className={`w-16 h-16 rounded-full ${risk.bg} border ${risk.border} flex items-center justify-center mx-auto mb-4`}>
                  {result.risk_level === 'HIGH'
                    ? <FontAwesomeIcon icon={faTriangleExclamation} className={`text-2xl ${risk.color}`} />
                    : <FontAwesomeIcon icon={faCircleCheck} className={`text-2xl ${risk.color}`} />
                  }
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-1">Assessment Complete</h2>
                <p className="text-sm text-gray-400 mb-6">PHQ-9 · {new Date(result.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <div className={`px-6 py-5 rounded-xl border ${risk.bg} ${risk.border} mb-6`}>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Score</p>
                  <p className={`text-5xl font-bold ${risk.color} mb-2`}>{result.score}</p>
                  <p className={`text-sm font-semibold ${risk.color}`}>{risk.level} RISK</p>
                  <p className={`text-xs ${risk.color} mt-1`}>{risk.label}</p>
                </div>

                {result.risk_level === 'HIGH' && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-left mb-6">
                    <p className="font-semibold mb-1">A priority counselling session has been created for you.</p>
                    <p>A counsellor will be assigned to your session shortly. Please check your Sessions page.</p>
                  </div>
                )}

                {result.risk_level === 'MODERATE' && (
                  <div className="px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs text-left mb-6">
                    <p className="font-semibold mb-1">We recommend speaking with a counsellor.</p>
                    <p>Consider starting a counselling session or browsing our mental health resources.</p>
                  </div>
                )}

                {result.risk_level === 'LOW' && (
                  <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs text-left mb-6">
                    <p className="font-semibold mb-1">Your results look good.</p>
                    <p>Continue to check in regularly. Our resources are always available if you need support.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('intro'); setResponses(Array(9).fill(null)); setCurrent(0); setResult(null) }}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition cursor-pointer"
                  >
                    Take Again
                  </button>
                  {result.risk_level === 'HIGH' ? (
                    <button
                      onClick={() => navigate('/student/chat')}
                      className="flex-1 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition cursor-pointer"
                    >
                      View My Sessions
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/student/resources')}
                      className="flex-1 py-2.5 rounded-lg bg-[#003D8F] text-white text-sm font-semibold hover:bg-[#1A5CB8] transition cursor-pointer"
                    >
                      Browse Resources
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

      </main>
    </div>
  )
}