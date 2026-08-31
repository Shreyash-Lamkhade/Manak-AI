import { useParams } from 'react-router-dom'
import { BookmarkPlus, Copy, ArrowRight, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Breadcrumb from '../components/Breadcrumb'
import Toast from '../components/Toast'
import { useState, useEffect } from 'react'

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-[#5C5A55] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function StandardDetail() {
  const params = useParams()
  const id = params['*'] || params.id || ''  // handles both /standard/* and /standard/:id
  const [std, setStd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetch(`/api/standards/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        setStd(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const handleCopy = () => {
    if (!std) return
    const text = `${std.is_number} — ${std.title} (${std.version})`
    navigator.clipboard?.writeText(text)
    setToast({ message: 'Reference text copied to clipboard.', type: 'success' })
  }

  const handleSave = () => {
    if (!std) return
    const text = `${std.is_number} — ${std.title}`
    navigator.clipboard?.writeText(text)
    setToast({ message: `${std.is_number} reference copied. Paste it into your tender document.`, type: 'success' })
  }

  const handleExport = async () => {
    if (!std) return
    try {
      const res = await fetch(`/api/export/${encodeURIComponent(std.is_number)}`, { method: 'POST' })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${std.is_number}.txt`
      a.click()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#16294D]" />
        </div>
      </Layout>
    )
  }

  if (!std) {
    return (
      <Layout>
        <div className="p-8 text-center text-[#A6362C]">Failed to load standard details.</div>
      </Layout>
    )
  }

  return (
    <Layout breadcrumb={
      <Breadcrumb items={[
        { label: 'Search', href: '/search' },
        { label: 'Results', href: '/results' },
        { label: std.is_number },
      ]} />
    }>
      <div className="max-w-3xl">
        {/* Header */}
        <Card className="p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-mono-bis text-sm text-[#2B5C8A] mb-1">{std.is_number}</p>
              <h2 className="text-xl font-medium text-[#1A1A1A] mb-2">{std.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#5C5A55]">
                <span>Version: <span className="font-medium text-[#1A1A1A]">{std.version}</span></span>
                <span className="text-[#E4E1DA]">|</span>
                <span>Last updated: <span className="font-medium text-[#1A1A1A]">{std.last_amended}</span></span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap justify-end">
              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Download size={14} /> Export
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                <Copy size={14} /> Copy
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <BookmarkPlus size={14} /> Save
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content — 2 cols */}
          <div className="md:col-span-2 space-y-0">
            <Card className="p-5 mb-4">
              <Section title="Scope">
                <p className="text-sm text-[#1A1A1A] leading-relaxed">{std.scope}</p>
              </Section>
            </Card>

            {/* Normative References */}
            {std.normative_references_resolved && std.normative_references_resolved.length > 0 && (
              <Card className="p-5 mb-4">
                <Section title="Normative References">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {std.normative_references_resolved.map((ref, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ArrowRight size={12} className="text-[#C8C4BB]" />}
                        <span title={ref.title} className="inline-flex px-2.5 py-1.5 bg-[#F0EEE9] border border-[#E4E1DA] rounded text-xs font-mono-bis text-[#2B5C8A] cursor-help">
                          {ref.is_number}
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1">
                    {std.normative_references_resolved.map((ref, i) => (
                      <div key={i} className="flex gap-2 text-xs text-[#5C5A55]">
                        <span className="font-mono-bis text-[#2B5C8A] shrink-0">{ref.is_number}</span>
                        <span>— {ref.title}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              </Card>
            )}

            {/* Amendments timeline */}
            {std.amendment_history && std.amendment_history.length > 0 && (
              <Card className="p-5">
                <Section title="Amendments & History">
                  <div className="relative pl-4 border-l-2 border-[#E4E1DA] space-y-4">
                    {std.amendment_history.map((a, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-white border-2 border-[#16294D]" />
                        <p className="text-xs font-medium text-[#5C5A55] font-mono-bis mb-0.5">{a.date}</p>
                        <p className="text-xs font-medium text-[#B8862B] mb-0.5">{a.amendment_number}</p>
                        <p className="text-sm text-[#1A1A1A]">{a.description}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </Card>
            )}
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-4">
            {/* QCO Status */}
            <Card className="p-4">
              <p className="text-xs font-medium text-[#5C5A55] uppercase tracking-wider mb-3">QCO Status</p>
              {std.is_qco_mandatory ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-[#B8862B]" />
                    <Badge variant="warning">Mandatory Certification</Badge>
                  </div>
                  <dl className="space-y-2 text-xs">
                    {std.qco_enforcement_date && (
                      <div>
                        <dt className="text-[#5C5A55]">Enforcement Date</dt>
                        <dd className="font-medium text-[#1A1A1A]">{std.qco_enforcement_date}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[#5C5A55]">Certification Body</dt>
                      <dd className="font-medium text-[#1A1A1A]">Bureau of Indian Standards (BIS)</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#2F6F5E]" />
                  <span className="text-sm text-[#2F6F5E]">No mandatory certification</span>
                </div>
              )}
            </Card>

            {/* Related standards */}
            {std.related_standards && std.related_standards.length > 0 && (
              <Card className="p-4">
                <p className="text-xs font-medium text-[#5C5A55] uppercase tracking-wider mb-3">Related Standards</p>
                <div className="space-y-2">
                  {std.related_standards.map((rs, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="font-mono-bis text-[#2B5C8A] shrink-0">{rs.is_number}</span>
                      <span className="text-[#5C5A55]">{rs.title}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}
