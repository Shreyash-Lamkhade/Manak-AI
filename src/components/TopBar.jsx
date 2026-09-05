import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, X, CheckCircle, AlertTriangle, Info, User, Settings, LogOut } from 'lucide-react'
import { mockUser } from '../data/mockData'
import { useLang } from '../context/LangContext'
import { useNavigate } from 'react-router-dom'

const NOTIFICATIONS = [
  { id: 1, type: 'warning', icon: AlertTriangle, color: 'text-[#B8862B]', bg: 'bg-[#FDF2DC]', title: 'QCO Deadline Approaching', body: 'LED Bulbs and Lamps (IS 16102) enforcement date is 15 Sep 2026 — 10 days away.', time: '2 hrs ago', read: false },
  { id: 2, type: 'info', icon: Info, color: 'text-[#2155A3]', bg: 'bg-[#E4EDF9]', title: 'Standard Updated', body: 'IS 10322 (Part 5/Sec 4):2018 was amended — Amendment 2 published.', time: '1 day ago', read: false },
  { id: 3, type: 'success', icon: CheckCircle, color: 'text-[#2F6F5E]', bg: 'bg-[#E4F2EE]', title: 'Search Export Ready', body: 'Your tender reference block for IS 269:2015 was copied to clipboard.', time: '2 days ago', read: true },
]

export default function TopBar({ title, breadcrumb }) {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  const unread = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))
  const dismiss = (id) => setNotifications(n => n.filter(x => x.id !== id))

  return (
    <header className="h-[56px] bg-white border-b border-[#DDD9D0] flex items-center px-7 gap-5 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative z-40">
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
            className={`px-3.5 py-[5px] transition-colors focus:outline-none
              ${lang === l ? 'bg-[#16294D] text-white' : 'bg-white text-[#4B4845] hover:bg-[#F4F3EF]'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* ── Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }}
            className="relative p-2 rounded hover:bg-[#F4F3EF] text-[#4B4845] hover:text-[#111111] transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F0A500] flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#16294D]">{unread}</span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[340px] bg-white border border-[#DDD9D0] rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDEBE5]">
                <p className="text-[14px] font-semibold text-[#111111]">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[12px] text-[#2155A3] hover:underline font-medium">
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-[#8A8580]">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-[#EDEBE5] last:border-0 ${n.read ? 'opacity-60' : 'bg-[#FAFAF8]'}`}>
                      <div className={`w-8 h-8 rounded-full ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <n.icon size={14} className={n.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111111] leading-tight">{n.title}</p>
                        <p className="text-[12px] text-[#4B4845] mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[11px] text-[#8A8580] mt-1">{n.time}</p>
                      </div>
                      <button onClick={() => dismiss(n.id)} className="shrink-0 text-[#C5C0B6] hover:text-[#4B4845] mt-0.5" aria-label="Dismiss">
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[#DDD9D0] mx-1" />

        {/* ── User dropdown ── */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded hover:bg-[#F4F3EF] transition-colors focus:outline-none"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#16294D] flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-[#F0A500]">RK</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-[#111111] leading-tight">{mockUser.name}</p>
              <p className="text-[11px] text-[#8A8580] leading-tight truncate max-w-[160px]">{mockUser.department}</p>
            </div>
            <ChevronDown size={14} className={`text-[#8A8580] transition-transform ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[220px] bg-white border border-[#DDD9D0] rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Profile header */}
              <div className="px-4 py-3 border-b border-[#EDEBE5] bg-[#FAFAF8]">
                <p className="text-[13px] font-semibold text-[#111111]">{mockUser.name}</p>
                <p className="text-[11px] text-[#8A8580] truncate">{mockUser.designation}</p>
                <p className="text-[11px] text-[#8A8580] truncate">{mockUser.department}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {[
                  { icon: User, label: 'My Profile', action: () => { navigate('/settings'); setUserOpen(false) } },
                  { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setUserOpen(false) } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4B4845] hover:bg-[#F4F3EF] hover:text-[#111111] transition-colors text-left"
                  >
                    <item.icon size={15} className="text-[#8A8580]" />
                    {item.label}
                  </button>
                ))}
                <div className="mx-3 my-1 border-t border-[#EDEBE5]" />
                <button
                  onClick={() => setUserOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#A6362C] hover:bg-[#FAEBE9] transition-colors text-left"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
