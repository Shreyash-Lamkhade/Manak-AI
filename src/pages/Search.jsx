import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Upload, X, FileText, Loader2, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { exampleQueries } from '../data/mockData'
import { useLang } from '../context/LangContext'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('text')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()
  const { t, lang } = useLang()

  const handleSearch = async (q) => {
    const text = q || query
    if (!text.trim() && !file) return
    setLoading(true)
    try {
      if (mode === 'upload' && file) {
        const fd = new FormData()
        fd.append('document', file)
        const res = await fetch('/api/search/document', { method: 'POST', body: fd })
        const data = await res.json()
        navigate('/results', { state: { query: file.name, response: data } })
      } else {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text })
        })
        const data = await res.json()
        navigate('/results', { state: { query: text, response: data } })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={t('searchPageTitle')}>
      <div className="max-w-2xl mx-auto">

        {/* Page heading */}
        <div className="mb-7">
          <h2 className="text-[24px] font-bold text-[#111111] tracking-tight mb-1">{t('searchHeading')}</h2>
          <p className="text-[14px] text-[#4B4845]">{t('searchSubtitle')}</p>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b-2 border-[#DDD9D0] mb-6">
          {[
            { id: 'text',   key: 'describeProduct' },
            { id: 'upload', key: 'uploadDocument'  },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id); setFile(null) }}
              className={`px-5 pb-3 text-[14px] font-semibold border-b-2 -mb-[2px] transition-colors focus:outline-none
                ${mode === tab.id ? 'border-[#16294D] text-[#16294D]' : 'border-transparent text-[#8A8580] hover:text-[#111111]'}`}
              aria-selected={mode === tab.id}
            >
              {t(tab.key)}
            </button>
          ))}
        </div>

        {mode === 'text' ? (
          <div>
            <div className="relative mb-4">
              <SearchIcon size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8580]" />
              <input
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-11 pr-20 py-3.5 text-[15px] border-2 border-[#DDD9D0] rounded-md bg-white focus:outline-none focus:border-[#16294D] placeholder-[#C5C0B6] shadow-card"
                aria-label={t('searchHeading')}
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8A8580] font-mono-bis bg-[#EDEBE5] px-1.5 py-0.5 rounded">{lang}</span>
            </div>

            <Button variant="primary" size="lg" className="w-full mb-8"
              onClick={() => handleSearch()} disabled={!query.trim() || loading}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> {t('matching')}</>
                : <><SearchIcon size={16} /> {t('searchBtn')}</>
              }
            </Button>

            {/* Examples */}
            <div className="bg-white border border-[#DDD9D0] rounded-md p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#F0A500]" />
                <p className="text-[12px] font-bold text-[#4B4845] uppercase tracking-wider">{t('tryExample')}</p>
              </div>
              <div className="flex flex-col gap-2">
                {exampleQueries.map(q => (
                  <button key={q}
                    onClick={() => { setQuery(q); handleSearch(q) }}
                    className="flex items-center gap-3 px-4 py-2.5 text-[14px] bg-[#F4F3EF] border border-[#DDD9D0] rounded text-left text-[#111111] hover:border-[#16294D] hover:bg-[#EDEBE5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16294D]"
                  >
                    <SearchIcon size={13} className="text-[#8A8580] shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {!file ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]) }}
                onClick={() => fileRef.current?.click()}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-md p-16 text-center cursor-pointer transition-all
                  ${dragging ? 'border-[#16294D] bg-[#E4EDF9]' : 'border-[#DDD9D0] hover:border-[#16294D] bg-white hover:bg-[#F4F3EF]'}`}
              >
                <div className="w-16 h-16 rounded-xl bg-[#EDEBE5] flex items-center justify-center mx-auto mb-4">
                  <Upload size={28} className="text-[#8A8580]" />
                </div>
                <p className="text-[16px] font-semibold text-[#111111] mb-1">{t('dropHere')}</p>
                <p className="text-[14px] text-[#8A8580] mb-4">{t('dropFormats')}</p>
                <Button variant="secondary" size="md" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
                  {t('browseFiles')}
                </Button>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                  onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]) }} />
              </div>
            ) : (
              <div className="border-2 border-[#DDD9D0] rounded-md p-5 bg-white shadow-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-md bg-[#E4EDF9] flex items-center justify-center">
                    <FileText size={22} className="text-[#2155A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#111111] truncate">{file.name}</p>
                    <p className="text-[12px] text-[#8A8580]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-[#8A8580] hover:text-[#A6362C] focus:outline-none p-1" aria-label="Remove file">
                    <X size={17} />
                  </button>
                </div>
                <Button variant="primary" size="lg" className="w-full" onClick={() => handleSearch()} disabled={loading}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> {t('analysing')}</>
                    : t('analyseDoc')
                  }
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
