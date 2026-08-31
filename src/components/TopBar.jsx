import { Bell, ChevronDown } from 'lucide-react'
import { mockUser } from '../data/mockData'
import { useLang } from '../context/LangContext'

export default function TopBar({ title, breadcrumb }) {
  const { lang, setLang } = useLang()

  return (
    <header className="h-[56px] bg-white border-b border-[#DDD9D0] flex items-center px-7 gap-5 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Left */}
      <div className="flex-1 min-w-0">
        {breadcrumb || (
          <h1 className="text-[17px] font-semibold text-[#111111] tracking-tight truncate">{title}</h1>
        )}
      </div>

      {/* Centre: lang toggle */}
      <div className="flex items-center border border-[#DDD9D0] rounded overflow-hidden text-[13px] font-semibold">
        {['EN', 'HI'].map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            aria-label={l === 'EN' ? 'English' : 'Hindi'}
            className={`px-3.5 py-[5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16294D]
              ${lang === l ? 'bg-[#16294D] text-white' : 'bg-white text-[#4B4845] hover:bg-[#F4F3EF]'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button
          className="relative p-2 rounded hover:bg-[#F4F3EF] text-[#4B4845] hover:text-[#111111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16294D]"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F0A500] flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#16294D]">3</span>
          </span>
        </button>
        <div className="w-px h-5 bg-[#DDD9D0] mx-1" />
        <button
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded hover:bg-[#F4F3EF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16294D]"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-[#16294D] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-bold text-[#F0A500]">RK</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-semibold text-[#111111] leading-tight">{mockUser.name}</p>
            <p className="text-[11px] text-[#8A8580] leading-tight truncate max-w-[160px]">{mockUser.department}</p>
          </div>
          <ChevronDown size={14} className="text-[#8A8580]" />
        </button>
      </div>
    </header>
  )
}
