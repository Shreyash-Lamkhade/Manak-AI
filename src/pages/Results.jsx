import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Search, Check, X, Flag, ArrowRight, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Toast from '../components/Toast'
import Breadcrumb from '../components/Breadcrumb'
import clsx from 'clsx'

function SubScoreBar({ label, score }) {
  const width = Math.max(0, Math.min(100, score || 0))
  const colorClass = width >= 60 ? 'bg-[#2F6F5E]' : width >= 40 ? 'bg-[#B8862B]' : 'bg-[#C8C4BB]'
  return (
    <div className="flex items-center gap-3 text-xs mb-1.5">
      <div className="w-24 text-[#5C5A55]">{label}</div>
      <div className="flex-1 h-1.5 bg-[#E4E1DA] rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
      <div className="w-9 text-right font-medium text-[#1A1A1A]">{Math.round(width)}%</div>
    </div>
  )
}

function ReviewControls({ requestId, isNumber, onReviewed }) {
  const [decision, setDecision] = useState(null)
  const [sending, setSending] = useState(false)

  const submit = async (d) => {
    setSending(true)
    setDecision(d)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, is_number: isNumber, decision: d })
      })
      if (res.ok) onReviewed?.(d)
    } catch (err) {
      console.error(err)
      setDecision(null)
    } finally {
      setSending(false)
    }
  }

  const btn = (value, label, icon, activeCls) => (
    <button
      onClick={() => submit(value)}
      disabled={sending || (decision && decision !== value)}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors focus:outline-none',
        decision === value
          ? activeCls
          : 'bg-white border-[#E4E1DA] text-[#4B4845] hover:border-[#16294D]'
      )}
    >
      {icon}{label}
    </button>
  )

  return (
    <div className="flex items-center gap-2">
      {btn('accept', 'Accept', <Check size={13} />, 'bg-[#E6F2EF] border-[#2F6F5E] text-[#2F6F5E]')}
      {btn('reject', 'Reject', <X size={13} />, 'bg-[#FBE9E7] border-[#A6362C] text-[#A6362C]')}
      {btn('flag', 'Flag', <Flag size={13} />, 'bg-[#FDF3E0] border-[#B8862B] text-[#B8862B]')}
      {decision === 'accept' && <span className="text-[11px] text-[#2F6F5E] font-medium">Recorded</span>}
      {decision === 'reject' && <span className="text-[11px] text-[#A6362C] font-medium">Recorded</span>}
      {decision === 'flag' && <span className="text-[11px] text-[#B8862B] font-medium">Recorded</span>}
    </div>
  )
}

function ResultCard({ result, requestId, onReviewed }) {
  const [expanded, setExpanded] = useState(false)
  const reviewData = result.certification || {}

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#16294D] focus:ring-inset"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="font-mono-bis text-sm font-medium text-[#16294D]">{result.is_number}</span>
              <span className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                result.relevance_score >= 60 ? 'text-[#2F6F5E] bg-[#E6F2EF]'
                  : result.relevance_score >= 40 ? 'text-[#B8862B] bg-[#FDF3E0]'
                  : 'text-[#5C5A55] bg-[#F0EEE9]'
              )}>
                {Math.round(result.relevance_score)}% match
              </span>
              {result.is_qco_mandatory
                ? <Badge variant="warning">Mandatory Certification</Badge>
                : <Badge variant="neutral">No Mandatory Certification</Badge>
              }
            </div>
            <p className="text-base font-medium text-[#1A1A1A] mb-1">{result.title}</p>
            <p className="text-sm text-[#5C5A55] line-clamp-2">{result.scope}</p>
          </div>
          <div className="shrink-0 text-[#5C5A55] mt-1">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#E4E1DA] px-5 py-4 bg-[#FAFAF8]">
          {/* Explanation + sub scores */}
          <div className="mb-4 bg-white p-4 rounded-md border border-[#E4E1DA] shadow-sm">
            <p className="text-sm text-[#4B4845] leading-relaxed mb-3">{result.explanation}</p>
            <p className="text-[11px] font-semibold text-[#5C5A55] uppercase mb-2">Scoring breakdown</p>
            <SubScoreBar label="Keyword overlap"       score={result.sub_scores?.keyword_score        ?? result.keyword_score        ?? 0} />
            <SubScoreBar label="Title / category"      score={result.sub_scores?.title_category_score ?? result.similarity_score      ?? 0} />
            <SubScoreBar label="Specification match"   score={result.sub_scores?.specification_score  ?? result.specification_score   ?? 0} />
            <SubScoreBar label="Authority score"       score={result.sub_scores?.authority_score      ?? 0} />
          </div>

          {/* Evidence */}
          {result.evidence && (
            <div className="mb-4 bg-white p-4 rounded-md border border-[#E4E1DA] shadow-sm">
              <p className="text-[11px] font-semibold text-[#5C5A55] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Search size={13} className="text-[#2B5C8A]" /> Evidence
              </p>
              {result.evidence.source_excerpt && (
                <blockquote className="border-l-2 border-[#16294D] pl-3 italic text-sm text-[#4B4845] mb-2">
                  {result.evidence.source_excerpt}
                </blockquote>
              )}
              {result.evidence.matched_specifications?.length > 0 && (
                <div className="mb-1">
                  <p className="text-[11px] text-[#5C5A55] mb-1">Matched specifications:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.evidence.matched_specifications.map((m, i) => (
                      <span key={i} className="inline-flex px-2 py-0.5 bg-[#E6F2EF] text-[#2F6F5E] rounded text-xs font-medium">
                        {typeof m === 'string' ? m : (m.value || m.stored || '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.evidence.overlapping_keywords?.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#5C5A55] mb-1">Overlapping keywords:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.evidence.overlapping_keywords.map((k, i) => (
                      <span key={i} className="inline-flex px-2 py-0.5 bg-[#EDEBE5] text-[#4B4845] rounded text-xs">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Version info */}
          {result.version_info && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#5C5A55] uppercase tracking-wider mb-2">Version & Amendments</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#1A1A1A] mb-1">
                <span>Version: <span className="font-medium">{result.version_info.version || 'N/A'}</span></span>
                <span>Last amended: <span className="font-medium">{result.version_info.last_amended || 'N/A'}</span></span>
              </div>
              {(result.version_info.amendment_history || []).length > 0 && (
                <ul className="list-disc list-inside text-xs text-[#5C5A55] space-y-0.5">
                  {result.version_info.amendment_history.slice(0, 4).map((a, i) => (
                    <li key={i}>{a.amendment_number} ({a.date}): {a.description}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Normative references */}
          {result.normative_references?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#5C5A55] uppercase tracking-wider mb-2">Normative References</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {result.normative_references.map((ref, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ArrowRight size={12} className="text-[#C8C4BB]" />}
                    <span title={ref.title} className="inline-flex px-2 py-1 bg-white border border-[#E4E1DA] rounded text-xs font-mono-bis text-[#2B5C8A]">
                      {ref.is_number}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related standards */}
          {result.related_standards?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#5C5A55] uppercase tracking-wider mb-2">Related Standards</p>
              <div className="space-y-1">
                {result.related_standards.map((rs, i) => (
                  <div key={i} className="flex gap-2 text-xs text-[#5C5A55]">
                    <span className="font-mono-bis text-[#2B5C8A] shrink-0">{rs.is_number}</span>
                    <span>— {rs.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certification */}
          {reviewData && (
            <div className="mb-4 bg-[#F0EEE9] p-3 rounded border border-[#E4E1DA]">
              <p className="text-xs font-semibold text-[#5C5A55] uppercase tracking-wider mb-1">Certification</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {reviewData.is_qco_mandatory
                  ? <Badge variant="warning">BIS Certification Required</Badge>
                  : <Badge variant="neutral">No mandatory certification identified</Badge>
                }
                {reviewData.enforcement_date && (
                  <span className="text-xs text-[#5C5A55]">Enforcement: {reviewData.enforcement_date}</span>
                )}
                {reviewData.scheme && (
                  <span className="text-xs text-[#5C5A55]">Scheme: {reviewData.scheme}</span>
                )}
              </div>
            </div>
          )}

          {/* Actions + review */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4E1DA]">
            <div className="flex gap-2 flex-wrap">
              <Link to={`/standard/${encodeURIComponent(result.is_number)}`}>
                <Button variant="primary" size="sm">Open Full Standard</Button>
              </Link>
            </div>
            <ReviewControls requestId={requestId} isNumber={result.is_number} onReviewed={onReviewed} />
          </div>
        </div>
      )}
    </Card>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = location.state?.query || ''
  const response = location.state?.response || null
  const isReopen = location.state?.reopen || false

  const [results, setResults] = useState(response?.results || [])
  const [requestId, setRequestId] = useState(response?.request_id || '')
  const [abstained, setAbstained] = useState(response?.abstained || false)
  const [abstentionReason, setAbstentionReason] = useState(response?.abstention_reason || null)
  const [loading, setLoading] = useState(!response)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!response && query) {
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, reopen: isReopen })
      })
      .then(res => res.json())
      .then(data => {
        setResults(data.results || [])
        setRequestId(data.request_id || '')
        setAbstained(data.abstained)
        setAbstentionReason(data.abstention_reason)
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [query, response])

  const handleReview = async (decision) => {
    setToast({ message: 'Review decision saved.', type: 'success' })
    window.setTimeout(() => setToast(null), 2500)
  }

  if (loading) {
    return (
      <Layout title="Results">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#16294D]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout breadcrumb={
      <Breadcrumb items={[
        { label: 'Search', href: '/search' },
        { label: 'Results' },
      ]} />
    }>
      {/* Query chip */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-xs text-[#5C5A55]">Results for</span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E4E1DA] rounded-[6px] text-sm font-medium text-[#1A1A1A]">
          <Search size={13} className="text-[#5C5A55]" />
          {query}
        </span>
        {requestId && (
          <span className="text-[11px] font-mono-bis text-[#8A8580]">ref: {requestId}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>New search</Button>
      </div>

      {/* Abstention */}
      {abstained && (
        <Card className="p-8 text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#F0EEE9] flex items-center justify-center mx-auto mb-4">
            <Search size={22} className="text-[#B8862B]" />
          </div>
          <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No confident match found</h3>
          <p className="text-sm text-[#5C5A55] max-w-lg mx-auto">
            {abstentionReason || 'No sufficiently reliable standard could be identified from the available corpus. Manual research is recommended.'}
          </p>
          <div className="mt-5">
            <Button variant="primary" size="md" onClick={() => navigate('/search')}>Try another search</Button>
          </div>
        </Card>
      )}

      {!abstained && (
        <>
          <p className="text-sm text-[#5C5A55] mb-4">{results.length} standard{results.length !== 1 ? 's' : ''} found</p>
          {results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No strong matches found"
              description="Try rephrasing your product description or uploading a tender document for a more accurate match."
              actionLabel="Try another search"
              onAction={() => navigate('/search')}
            />
          ) : (
            <div className="space-y-3">
              {results.map(r => (
                <ResultCard key={r.is_number} result={r} requestId={requestId} onReviewed={handleReview} />
              ))}
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}
