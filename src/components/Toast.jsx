import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const config = {
  success: { icon: CheckCircle, color: 'text-[#2F6F5E]', bar: 'bg-[#2F6F5E]' },
  error:   { icon: AlertCircle, color: 'text-[#A6362C]', bar: 'bg-[#A6362C]' },
  info:    { icon: Info,        color: 'text-[#2155A3]', bar: 'bg-[#2155A3]' },
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const { icon: Icon, color, bar } = config[type] || config.info

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-md shadow-modal border border-[#DDD9D0] overflow-hidden">
      <div className={clsx('h-1 w-full', bar)} />
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={17} className={clsx('mt-0.5 shrink-0', color)} />
        <p className="flex-1 text-[14px] text-[#111111] font-medium leading-snug">{message}</p>
        <button onClick={onClose} className="text-[#8A8580] hover:text-[#111111] focus:outline-none mt-0.5" aria-label="Close">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
