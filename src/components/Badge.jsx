import clsx from 'clsx'

const variants = {
  success: 'bg-[#E4F2EE] text-[#1F5C4D] border border-[#A8D5C9] font-semibold',
  warning: 'bg-[#FDF2DC] text-[#8A5E0E] border border-[#EDD087] font-semibold',
  error:   'bg-[#FAEBE9] text-[#8C2B22] border border-[#E8AFAA] font-semibold',
  info:    'bg-[#E4EDF9] text-[#1A4490] border border-[#A8C2E8] font-semibold',
  indigo:  'bg-[#ECEAF8] text-[#2E2B75] border border-[#B8B4E0] font-semibold',
  accent:  'bg-[#FFF4D6] text-[#7A5500] border border-[#F0D080] font-semibold',
  neutral: 'bg-[#EDEBE5] text-[#4B4845] border border-[#DDD9D0]',
}

const sizes = {
  sm: 'px-1.5 py-0 text-[10px]',
  md: 'px-2 py-0.5 text-[11px]',
}

export default function Badge({ variant = 'neutral', size = 'md', children, className }) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded gap-1 leading-5',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}
