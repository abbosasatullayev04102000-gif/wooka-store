import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label="WOOKA — bosh sahifa" className={cn('inline-flex shrink-0 flex-col leading-none', className)}>
      <span className="text-[26px] font-extrabold tracking-tight text-brand-600 sm:text-[28px]">
        WO<span className="text-accent-500">O</span>KA
      </span>
      {!compact && (
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Bolalar o‘yinchoq do‘koni
        </span>
      )}
    </Link>
  )
}
