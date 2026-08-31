import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SearchPage from './pages/Search'
import ResultsPage from './pages/Results'
import StandardDetail from './pages/StandardDetail'
import QCOChecker from './pages/QCOChecker'
import HistoryAndSaved from './pages/HistoryAndSaved'
import DocumentAnalysis from './pages/DocumentAnalysis'
import Settings from './pages/Settings'

import { LangProvider } from './context/LangContext'

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/standard/*" element={<StandardDetail />} />
        <Route path="/document-analysis" element={<DocumentAnalysis />} />
        <Route path="/qco-checker" element={<QCOChecker />} />
        <Route path="/history" element={<HistoryAndSaved />} />
        <Route path="/saved" element={<Navigate to="/history" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </LangProvider>
  )
}
