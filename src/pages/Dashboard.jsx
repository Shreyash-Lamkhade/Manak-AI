import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Clock, AlertTriangle, Bookmark,
  FileCheck, ArrowRight, TrendingUp, Loader2, Database
} from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { mockUser } from '../data/mockData'
import { useLang } from '../context/LangContext'

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, bg, iconColor, textColor, delta }) {
  return (
    <div className={`rounded-md p-5 flex flex-col gap-3 ${bg}`}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded flex items-center justify-center bg-white/20">
          <Icon size={18} className={iconColor} />
        </div>
        {delta && (
          <span className="text-[11px] font-semibold bg-white/20 text-white rounded px-1.5 py-0.5 flex items-center gap-0.5">
            <TrendingUp size={10} /> {delta}
          </span>
        )}
      </div>
      <div>
        <p className={`text-[32px] font-bold leading-none mb-1 ${textColor}`}>{value}</p>
        <p className={`text-[13px] font-medium ${textColor} opacity-80`}>{label}</p>
      </div>
    </div>
  )
}

const qcoStatusBadge = {
  urgent:   <Badge variant="error">Urgent</Badge>,
  upcoming: <Badge variant="warning">Upcoming</Badge>,
  passed:   <Badge variant="success">Passed</Badge>,
}

// Static mock recent searches — always shown
const RECENT_SEARCHES = [
  { id: 1, query: 'LED street light 100W IP65 outdoor', timestamp: '2026-08-29T10:23:00', topResult: 'IS 10322 (Part 5/Sec 4):2018' },
  { id: 2, query: 'Portland cement OPC 53 grade', timestamp: '2026-08-28T14:05:00', topResult: 'IS 269:2015' },
  { id: 3, query: 'Mild steel ERW pipes water supply', timestamp: '2026-08-27T09:45:00', topResult: 'IS 1239 (Part 1):2004' },
  { id: 4, query: 'Fire detection and alarm system building', timestamp: '2026-08-26T16:30:00', topResult: 'IS 2189:2008' },
  { id: 5, query: 'PVC insulated cables 1100V wiring', timestamp: '2026-08-25T11:10:00', topResult: 'IS 694:2010' },
]

// Static QCO deadlines — always shown
const QCO_DEADLINES = [
  { product_name: 'LED Bulbs and Lamps', applicable_is_number: 'IS 16102 (Part 1):2012', enforcement_date: '2026-09-15', status: 'urgent' },
  { product_name: 'LED Street Lights', applicable_is_number: 'IS 10322 (Part 5/Sec 4):2018', enforcement_date: '2026-10-01', status: 'upcoming' },
  { product_name: 'Fire Safety Sprinklers', applicable_is_number: 'IS 15105:2002', enforcement_date: '2026-11-01', status: 'upcoming' },
  { product_name: 'Portland Pozzolana Cement', applicable_is_number: 'IS 1489 (Part 1):2015', enforcement_date: '2026-11-01', status: 'upcoming' },
  { product_name: 'Mild Steel ERW Pipes', applicable_is_number: 'IS 1239 (Part 1):2004', enforcement_date: '2023-04-01', status: 'passed' },
]

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#16294D]" />
        </div>
      </Layout>
    )
  }

  const statSearches = stats?.searchesThisMonth ?? 47
  const statStandards = stats?.total_standards ?? 63
  const statQco = stats?.qcoDeadlines ?? 5

  return (
    <Layout title="Dashboard">

      {/* ── Welcome banner ── */}
      <div className="rounded-md bg-[#16294D] px-7 py-5 mb-7 flex items-center justify-between gap-4"
        style={{ backgroundImage: 'radial-gradient(ellipse at 90% 50%, #1E3761 0%, #16294D 70%)' }}>
        <div>
          <p className="text-[#F0A500] text-[12px] font-semibold uppercase tracking-widest mb-1">{t('welcomeSubtitle')}</p>
          <h2 className="text-[26px] font-bold text-white leading-tight tracking-tight">
            {t('welcomeBack')}, {mockUser.name.split(' ')[0]}
          </h2>
          <p className="text-white/55 text-[14px] mt-1">
            {mockUser.designation} · {mockUser.department}
          </p>
        </div>
        <Button variant="accent" size="lg" onClick={() => navigate('/search')} className="shrink-0">
          <Search size={16} /> {t('newSearch')}
        </Button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard icon={Search} label={t('searchesMonth')} value={statSearches}
          bg="bg-[#16294D]" iconColor="text-[#F0A500]" textColor="text-white" delta="+12%" />
        <StatCard icon={Database} label={t('standardsDb')} value={statStandards}
          bg="bg-[#2155A3]" iconColor="text-white" textColor="text-white" />
        <StatCard icon={AlertTriangle} label={t('qcoDeadlines30')} value={statQco}
          bg="bg-[#B8862B]" iconColor="text-white" textColor="text-white" delta="2 urgent" />
        <StatCard icon={FileCheck} label={t('activeQco')} value={31}
          bg="bg-[#2F6F5E]" iconColor="text-white" textColor="text-white" />
      </div>

      {/* ── Two column body ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Recent searches — 3 cols */}
        <div className="xl:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-semibold text-[#111111]">{t('recentSearches')}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              {t('viewAll')} <ArrowRight size={13} />
            </Button>
          </div>
          <Card>
            {RECENT_SEARCHES.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-5 py-3.5 ${i < RECENT_SEARCHES.length - 1 ? 'border-b border-[#EDEBE5]' : ''}`}
              >
                <div className="w-8 h-8 rounded bg-[#EDEBE5] flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-[#8A8580]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111111] truncate">{s.query}</p>
                  <p className="text-[12px] text-[#8A8580]">
                    Top: <span className="font-mono-bis text-[#2155A3]">{s.topResult}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[12px] text-[#8A8580]">{formatDate(s.timestamp)}</span>
                  <Button variant="secondary" size="sm"
                    onClick={() => navigate('/results', { state: { query: s.query, reopen: true } })}>
                    {t('reopen')}
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* QCO Deadlines — 2 cols */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-semibold text-[#111111]">{t('qcoDeadlines')}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/qco-checker')}>
              {t('checker')} <ArrowRight size={13} />
            </Button>
          </div>
          <Card>
            {QCO_DEADLINES.map((q, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-5 py-3.5 ${i < QCO_DEADLINES.length - 1 ? 'border-b border-[#EDEBE5]' : ''}`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  q.status === 'urgent' ? 'bg-[#A6362C]' :
                  q.status === 'upcoming' ? 'bg-[#B8862B]' : 'bg-[#2F6F5E]'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#111111] truncate">{q.product_name}</p>
                  <p className="text-[11px] font-mono-bis text-[#8A8580]">{q.applicable_is_number}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {qcoStatusBadge[q.status]}
                  {q.status !== 'passed' && (
                    <span className="text-[11px] text-[#8A8580]">{q.enforcement_date}</span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

    </Layout>
  )
}
