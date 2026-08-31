import clsx from 'clsx'

const variants = {
  primary:   'bg-[#16294D] hover:bg-[#1E3761] text-white border-transparent shadow-sm',
  accent:    'bg-[#F0A500] hover:bg-[#D99200] text-[#16294D] border-transparent font-bold shadow-sm',
  secondary: 'bg-white hover:bg-[#F4F3EF] text-[#16294D] border-[#DDD9D0] shadow-sm',
  ghost:     'bg-transparent hover:bg-[#EDEBE5] text-[#4B4845] border-transparent',
  danger:    'bg-white hover:bg-[#FAEBE9] text-[#A6362C] border-[#E8AFAA]',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-[14px] gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
}

export default function Button({ variant = 'secondary', size = 'md', children, className, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold border rounded transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16294D] focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
