import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-[#EDEBE5] flex items-center justify-center mb-4 shadow-card">
          <Icon size={26} className="text-[#8A8580]" />
        </div>
      )}
      <h3 className="text-[17px] font-semibold text-[#111111] mb-2">{title}</h3>
      <p className="text-[14px] text-[#4B4845] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
