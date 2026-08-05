'use client'

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils/cn'

const CONTROL =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors ' +
  'focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-surface-sunken'

interface Wrapper {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: Wrapper & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink-muted">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  label,
  hint,
  error,
  className,
  required,
  ...rest
}: Wrapper & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL, 'h-12', error ? 'border-danger' : 'border-line-strong')}
        required={required}
        {...rest}
      />
    </FieldShell>
  )
}

export function Textarea({
  label,
  hint,
  error,
  className,
  required,
  ...rest
}: Wrapper & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL, 'py-3 resize-y', error ? 'border-danger' : 'border-line-strong')}
        required={required}
        {...rest}
      />
    </FieldShell>
  )
}

export function Select({
  label,
  hint,
  error,
  className,
  required,
  options,
  placeholder,
  ...rest
}: Wrapper &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>
    placeholder?: string
  }) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL, 'h-12 appearance-none pr-9', error ? 'border-danger' : 'border-line-strong')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6880' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m5 9 7 7 7-7'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
        required={required}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
