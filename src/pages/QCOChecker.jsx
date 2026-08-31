import { useState } from 'react'
import { ShieldCheck, ShieldX, Search, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

import { useLang } from '../context/LangContext'

export default function QCOChecker() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sampleProducts] = useState(['LED Street Light', 'OPC Cement', 'Pressure Cooker', 'Seat Belt', 'TMT Steel Bar', 'Water Thinned Emulsion Paint'])
  const { t } = useLang()

  const handleCheck = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch('/api/qco-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: query })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      setResult(null)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <Layout title={t('qcoCheckerTitle')}>
      <div className="max-w-xl">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">{t('qcoHeading')}</h2>
          <p className="text-sm text-[#5C5A55]">{t('qcoSubtitle')}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5A55]" />
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder={t('qcoPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 text-base border border-[#E4E1DA] rounded-[6px] bg-white focus:outline-none focus:ring-2 focus:ring-[#16294D] focus:border-transparent placeholder-[#C8C4BB]"
              aria-label={t('qcoHeading')} autoFocus
            />
          </div>
          <Button variant="primary" onClick={handleCheck} disabled={!query.trim() || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : t('checkBtn')}
          </Button>
        </div>

        {searched && (
          <Card className="p-5">
            {result && result.found && result.is_qco_mandatory ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDF3E0] flex items-center justify-center">
                    <ShieldX size={20} className="text-[#B8862B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{t('mandatoryRequired')}</p>
                    <p className="text-sm text-[#5C5A55]">{t('mandatoryCoveredUnder')}</p>
                  </div>
                </div>
                <dl className="space-y-3 border-t border-[#E4E1DA] pt-4">
                  <div className="flex justify-between text-sm"><dt className="text-[#5C5A55]">{t('product')}</dt><dd className="font-medium text-[#1A1A1A]">{result.product_name}</dd></div>
                  <div className="flex justify-between text-sm"><dt className="text-[#5C5A55]">{t('applicableStandard')}</dt><dd className="font-medium font-mono-bis text-[#2B5C8A]">{result.applicable_is_number}</dd></div>
                  <div className="flex justify-between text-sm"><dt className="text-[#5C5A55]">{t('enforcementDate')}</dt><dd className="font-medium text-[#1A1A1A]">{result.enforcement_date}</dd></div>
                </dl>
              </div>
            ) : result && result.found && !result.is_qco_mandatory ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E6F2EF] flex items-center justify-center">
                  <ShieldCheck size={20} className="text-[#2F6F5E]" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">{t('noMandatoryCert')}</p>
                  <p className="text-sm text-[#5C5A55]">{result.product_name}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F0EEE9] flex items-center justify-center">
                  <Search size={20} className="text-[#5C5A55]" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">{t('noMatchProduct')}</p>
                  <p className="text-sm text-[#5C5A55]">{t('noMatchProductDesc')}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        <p className="mt-4 text-xs text-[#5C5A55] border border-[#E4E1DA] rounded-[6px] px-3 py-2 bg-white">
          {t('qcoDisclaimer')}
        </p>

        <div className="mt-6">
          <p className="text-xs font-medium text-[#5C5A55] uppercase tracking-wider mb-2">{t('sampleProducts')}</p>
          <div className="flex flex-wrap gap-2">
            {sampleProducts.map((p, i) => (
              <button
                key={i}
                onClick={() => { setQuery(p); }}
                className="px-3 py-1.5 text-xs bg-white border border-[#E4E1DA] rounded-[6px] text-[#5C5A55] hover:border-[#16294D] hover:text-[#16294D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#16294D]"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
