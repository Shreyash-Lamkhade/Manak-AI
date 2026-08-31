import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} className="text-[#C8C4BB]" />}
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="text-[#5C5A55] hover:text-[#16294D] transition-colors">{item.label}</Link>
          ) : (
            <span className="text-[#1A1A1A] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
