import { cn } from '@/lib/utils/cn'

interface Props {
  value: number
  count?: number
  size?: 'xs' | 'sm' | 'md'
  showValue?: boolean
  className?: string
}

const SIZES = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-[18px] w-[18px]' }

function Star({ fill, className }: { fill: number; className?: string }) {
  const id = `star-${Math.round(fill * 100)}`
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#FFC400" />
          <stop offset={`${fill * 100}%`} stopColor="#DAD5E8" />
        </linearGradient>
      </defs>
      <path
        d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2 6.6 20.1l1-6.1-4.4-4.3 6.1-.9Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}

export function Rating({ value, count, size = 'sm', showValue = true, className }: Props) {
  const safe = Math.max(0, Math.min(5, value || 0))
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-[1px]" aria-label={`Reyting ${safe.toFixed(1)} / 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, safe - i))} className={SIZES[size]} />
        ))}
      </div>
      {showValue && safe > 0 && (
        <span className={cn('font-medium text-ink', size === 'xs' ? 'text-[11px]' : 'text-xs')}>
          {safe.toFixed(1)}
        </span>
      )}
      {typeof count === 'number' && count > 0 && (
        <span className={cn('text-ink-faint', size === 'xs' ? 'text-[11px]' : 'text-xs')}>({count})</span>
      )}
    </div>
  )
}
