import clsx from 'clsx'

export default function Card({ children, className, accent, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white border border-[#DDD9D0] rounded-md shadow-card',
        accent && 'border-l-4',
        accent === 'warning'  && 'border-l-[#B8862B]',
        accent === 'success'  && 'border-l-[#2F6F5E]',
        accent === 'error'    && 'border-l-[#A6362C]',
        accent === 'info'     && 'border-l-[#2155A3]',
        accent === 'primary'  && 'border-l-[#16294D]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
