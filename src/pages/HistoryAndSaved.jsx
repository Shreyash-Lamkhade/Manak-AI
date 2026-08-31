import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Bookmark, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'

export default function HistoryAndSaved() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('history')
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/history').then(r => r.json()),
      fetch('/api/saved').then(r => r.json())
    ])
    .then(([h, s]) => {
      setHistory(h)
      setSaved(s)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const handleRemove = async (is_number) => {
    try {
      await fetch(`/api/saved/${encodeURIComponent(is_number)}`, { method: 'DELETE' })
      setSaved(s => s.filter(i => i.is_number !== is_number))
      setConfirmId(null)
      setToast({ message: 'Standard removed from saved list.', type: 'info' })
    } catch (err) {
      console.error(err)
    }
  }

  const toRemove = saved.find(s => s.is_number === confirmId)

  if (loading) {
    return (
      <Layout title="History & Saved">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#16294D]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="History & Saved">
      {/* Tabs */}
      <div className="flex border-b border-[#E4E1DA] mb-6">
        {[
          { id: 'history', label: 'Search History', icon: Clock },
          { id: 'saved', label: 'Saved Standards', icon: Bookmark },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#16294D]
              ${tab === t.id
                ? 'border-[#16294D] text-[#16294D]'
                : 'border-transparent text-[#5C5A55] hover:text-[#1A1A1A]'}`}
            aria-selected={tab === t.id}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        history.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No search history"
            description="Your past searches will appear here so you can quickly reopen them."
            actionLabel="Start searching"
            onAction={() => navigate('/search')}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Search history">
                <thead>
                  <tr className="border-b border-[#E4E1DA] bg-[#FAFAF8]">
                    <th className="text-left px-4 py-3 font-medium text-[#5C5A55]">Query</th>
                    <th className="text-left px-4 py-3 font-medium text-[#5C5A55]">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-[#5C5A55]">Top Result</th>
                    <th className="text-left px-4 py-3 font-medium text-[#5C5A55]">Results</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E1DA]">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1A1A1A] max-w-xs">
                        <span className="line-clamp-1">{h.query}</span>
                      </td>
                      <td className="px-4 py-3 text-[#5C5A55] whitespace-nowrap">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono-bis text-xs text-[#2B5C8A]">{h.top_result_is_number}</td>
                      <td className="px-4 py-3 text-[#5C5A55]">{h.result_count}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/results', { state: { query: h.query, reopen: true } })}
                        >
                          <ExternalLink size={13} /> Reopen
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        saved.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved standards"
            description="Save standards from Search results or Standard Detail pages to quickly access them later."
            actionLabel="Search standards"
            onAction={() => navigate('/search')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saved.map(s => (
              <Card key={s.is_number} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-bis text-xs text-[#2B5C8A] mb-1">{s.is_number}</p>
                    <p className="text-sm font-medium text-[#1A1A1A] mb-2 line-clamp-2">{s.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="neutral">{s.category}</Badge>
                      {s.is_qco_mandatory
                        ? <Badge variant="warning">Mandatory cert.</Badge>
                        : <Badge variant="success">No mandatory cert.</Badge>
                      }
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmId(s.is_number)}
                    className="shrink-0 text-[#C8C4BB] hover:text-[#A6362C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A6362C] rounded"
                    aria-label={`Remove ${s.is_number}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E4E1DA]">
                  <span className="text-xs text-[#5C5A55]">Saved {new Date(s.saved_date).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/standard/${encodeURIComponent(s.is_number)}`)}>
                    <ExternalLink size={13} /> View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {confirmId && (
        <ConfirmDialog
          title="Remove saved standard"
          message={`Remove ${toRemove?.is_number} from your saved list? This cannot be undone.`}
          onConfirm={() => handleRemove(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}
