import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconSpinner } from './icons'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  accent: 'bg-accent-500 text-ink hover:bg-accent-400 active:bg-accent-600 shadow-sm font-semibold',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  ghost: 'text-ink hover:bg-surface-sunken active:bg-line',
  outline: 'border border-line-strong bg-white text-ink hover:border-brand-300 hover:text-brand-700',
  danger: 'bg-danger text-white hover:brightness-95',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-[15px] rounded-xl gap-2 h-[52px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  children?: ReactNode
  className?: string
}

export function buttonClass({ variant = 'primary', size = 'md', fullWidth, className }: CommonProps) {
  return cn(
    'inline-flex items-center justify-center font-medium transition-colors duration-150 select-none',
    'disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  children,
  className,
  disabled,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={buttonClass({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <IconSpinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant,
  size,
  fullWidth,
  children,
  className,
  prefetch,
}: CommonProps & { href: string; prefetch?: boolean }) {
  return (
    <Link href={href} prefetch={prefetch} className={buttonClass({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  )
}
