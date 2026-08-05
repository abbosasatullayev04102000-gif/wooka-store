/** Uzbek-locale formatting helpers. Prices are stored in UZS (integer so'm). */

const NBSP = ' '

export function formatPrice(value: number | null | undefined, opts?: { withCurrency?: boolean }): string {
  const withCurrency = opts?.withCurrency ?? true
  const n = Number.isFinite(value as number) ? Math.round(value as number) : 0
  const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return withCurrency ? `${grouped}${NBSP}so'm` : grouped
}

export function discountPercent(price: number, oldPrice: number | null | undefined): number | null {
  if (!oldPrice || oldPrice <= price) return null
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

/** Monthly instalment estimate, the way Uzum shows it. */
export function monthlyInstalment(price: number, months = 12): number {
  return Math.ceil(price / months / 1000) * 1000
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^998/, '')
  const p = digits.slice(0, 9)
  const parts = [p.slice(0, 2), p.slice(2, 5), p.slice(5, 7), p.slice(7, 9)].filter(Boolean)
  if (!parts.length) return '+998 '
  return `+998 ${parts[0]}${parts[1] ? ' ' + parts[1] : ''}${parts[2] ? ' ' + parts[2] : ''}${parts[3] ? ' ' + parts[3] : ''}`
}

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('998') ? digits.slice(3) : digits
  return `+998${local.slice(0, 9)}`
}

export function isValidPhone(raw: string): boolean {
  return /^\+998\d{9}$/.test(normalisePhone(raw))
}

const DATE_FMT = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
const DATETIME_FMT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : DATE_FMT.format(d)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : DATETIME_FMT.format(d)
}

export function pluralise(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}
