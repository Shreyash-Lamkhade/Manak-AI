import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function DocumentAnalysis() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState('idle') // idle | processing | done
  const [extractedSpecs, setExtractedSpecs] = useState([])
  const [resultsData, setResultsData] = useState([])
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setStep('idle')
  }

  const handleAnalyse = async () => {
    setStep('processing')
    try {
      const fd = new FormData()
      fd.append('document', file)
      const res = await fetch('/api/search/document', { method: 'POST', body: fd })
      const data = await res.json()
      setExtractedSpecs(data.results?.[0]?.evidence?.matched_specifications || [])
      setResultsData(data.results || [])
      setStep('done')
    } catch (err) {
      console.error(err)
      setStep('idle')
    }
  }

  const handleSearch = () => {
    navigate('/results', { state: { query: file.name, response: { results: resultsData, request_id: '' } } })
  }

  return (
    <Layout title="Document Analysis">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Analyse a Tender Document</h2>
          <p className="text-sm text-[#5C5A55]">
            Upload a PDF, DOCX, or TXT tender document. We will extract product specifications and match them to applicable Indian Standards.
          </p>
        </div>

        {/* Dropzone */}
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            aria-label="Upload document dropzone"
            className={`border-2 border-dashed rounded-md p-16 text-center cursor-pointer transition-colors
              ${dragging ? 'border-[#16294D] bg-[#EEF2F8]' : 'border-[#E4E1DA] hover:border-[#16294D] bg-white'}`}
          >
            <Upload size={40} className="mx-auto mb-3 text-[#C8C4BB]" />
            <p className="text-[#1A1A1A] font-medium mb-1">Drop your tender document here</p>
            <p className="text-sm text-[#5C5A55] mb-4">Supported formats: PDF, DOCX, TXT</p>
            <Button variant="secondary" size="sm" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
              Browse files
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div>
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#E5EFF7] flex items-center justify-center">
                  <FileText size={20} className="text-[#2B5C8A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{file.name}</p>
                  <p className="text-xs text-[#5C5A55]">{(file.size / 1024).toFixed(1)} KB · Ready to analyse</p>
                </div>
                <button
                  onClick={() => { setFile(null); setStep('idle') }}
                  className="text-[#5C5A55] hover:text-[#A6362C] focus:outline-none"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            </Card>

            {step === 'idle' && (
              <Button variant="primary" size="lg" className="w-full justify-center" onClick={handleAnalyse}>
                Analyse Document
              </Button>
            )}

            {step === 'processing' && (
              <Card className="p-6 text-center">
                <Loader2 size={28} className="animate-spin mx-auto mb-3 text-[#16294D]" />
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">Extracting specifications...</p>
                <p className="text-xs text-[#5C5A55]">Matching product descriptions against Indian Standards database</p>
              </Card>
            )}

            {step === 'done' && (
              <div>
                <Card className="p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={18} className="text-[#2F6F5E]" />
                    <p className="text-sm font-medium text-[#1A1A1A]">Extraction complete — {extractedSpecs.length} specifications identified</p>
                  </div>
                  <div className="space-y-2">
                    {extractedSpecs.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[#1A1A1A]">{typeof item === 'string' ? item : (item.value || item.stored || '')}</span>
                        <Badge variant="success">High</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
                <Button variant="primary" size="lg" className="w-full justify-center" onClick={handleSearch}>
                  View matching standards
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
