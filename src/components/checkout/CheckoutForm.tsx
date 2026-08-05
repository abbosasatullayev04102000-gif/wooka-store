'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { submitCheckout, type CheckoutPayload } from '@/app/checkout/actions'
import { useHydrated } from '@/hooks/useHydrated'
import { REGIONS, districtsOf, supportsExpress } from '@/lib/constants/regions'
import { PAYMENT_OPTIONS } from '@/lib/payments'
import { cartSubtotal, useCart } from '@/lib/store/cart'
import type { DeliveryMethod, PaymentMethod } from '@/lib/db/types'
import { formatPhone, formatPrice, normalisePhone } from '@/lib/utils/format'
import { ProductThumb } from '@/components/product/ProductThumb'
import { cn } from '@/lib/utils/cn'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { IconBox, IconCheck, IconTruck } from '@/components/ui/icons'

interface Props {
  freeDeliveryFrom: number
  deliveryFee: number
  pickupAddress: string
}

const DELIVERY_OPTIONS: Array<{
  id: DeliveryMethod
  label: string
  description: string
  Icon: typeof IconTruck
}> = [
  { id: 'courier', label: 'Kuryer orqali', description: 'Toshkentda 2 soat, viloyatlarga 1–3 kun', Icon: IconTruck },
  { id: 'express', label: 'Ekspress (2 soat)', description: 'Faqat Toshkent shahri bo‘ylab', Icon: IconTruck },
  { id: 'pickup', label: 'Do‘kondan olib ketish', description: 'Bepul, buyurtma tayyor bo‘lgach', Icon: IconBox },
]

export function CheckoutForm({ freeDeliveryFrom, deliveryFee, pickupAddress }: Props) {
  const router = useRouter()
  const hydrated = useHydrated()
  const lines = useCart((s) => s.lines)
  const clear = useCart((s) => s.clear)
  const [pending, startTransition] = useTransition()

  const [form, setForm] = useState({
    customerName: '',
    phone: '+998 ',
    email: '',
    region: 'Toshkent shahri',
    district: '',
    address: '',
    comment: '',
  })
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('courier')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const districts = useMemo(() => districtsOf(form.region), [form.region])
  const subtotal = cartSubtotal(lines)

  const shipping =
    deliveryMethod === 'pickup' ? 0 : subtotal >= freeDeliveryFrom ? 0 : deliveryMethod === 'express' ? deliveryFee * 2 : deliveryFee
  const total = subtotal + shipping

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  if (!hydrated) {
    return <div className="skeleton h-96 rounded-2xl" />
  }

  if (!lines.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
        <p className="text-4xl" aria-hidden>
          🛒
        </p>
        <p className="mt-3 text-lg font-semibold text-ink">Savat bo‘sh</p>
        <p className="mt-1 text-sm text-ink-muted">Buyurtma rasmiylashtirish uchun avval mahsulot tanlang.</p>
        <ButtonLink href="/catalog" variant="primary" size="lg" className="mt-5">
          Katalogga o‘tish
        </ButtonLink>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    const payload: CheckoutPayload = {
      customerName: form.customerName,
      phone: normalisePhone(form.phone),
      email: form.email,
      region: form.region,
      district: form.district || districts[0] || '',
      address: form.address,
      deliveryMethod,
      paymentMethod,
      comment: form.comment,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    }

    startTransition(async () => {
      const result = await submitCheckout(payload)
      if (!result.ok) {
        setError(result.error)
        setFieldError(result.field ?? null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      clear()

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
        return
      }
      router.push(`/checkout/success/${encodeURIComponent(result.orderNumber)}`)
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* 1. Contact */}
        <fieldset className="rounded-2xl border border-line bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-ink">1. Aloqa ma’lumotlari</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              label="Ism va familiya"
              required
              autoComplete="name"
              value={form.customerName}
              error={fieldError === 'customerName' ? ' ' : undefined}
              onChange={(e) => set('customerName', e.target.value)}
              placeholder="Alisher Karimov"
            />
            <Input
              label="Telefon raqami"
              required
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              error={fieldError === 'phone' ? ' ' : undefined}
              onChange={(e) => set('phone', formatPhone(e.target.value))}
              placeholder="+998 90 123 45 67"
            />
            <Input
              label="Email (ixtiyoriy)"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="siz@email.com"
              className="sm:col-span-2"
              hint="Buyurtma holati haqida xabar yuborish uchun"
            />
          </div>
        </fieldset>

        {/* 2. Delivery */}
        <fieldset className="rounded-2xl border border-line bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-ink">2. Yetkazib berish</legend>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {DELIVERY_OPTIONS.map((opt) => {
              const disabled = opt.id === 'express' && !supportsExpress(form.region)
              const active = deliveryMethod === opt.id
              return (
                <button
                  type="button"
                  key={opt.id}
                  disabled={disabled}
                  onClick={() => setDeliveryMethod(opt.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors',
                    active ? 'border-brand-500 bg-brand-50' : 'border-line-strong hover:border-brand-300',
                    disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <opt.Icon className="h-4 w-4 text-brand-600" />
                    {opt.label}
                  </span>
                  <span className="text-xs text-ink-muted">{opt.description}</span>
                </button>
              )
            })}
          </div>

          {deliveryMethod === 'pickup' ? (
            <p className="mt-4 rounded-xl bg-surface-soft p-3 text-sm text-ink-muted">
              Olib ketish manzili: <span className="font-medium text-ink">{pickupAddress}</span>
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select
                label="Viloyat / shahar"
                required
                value={form.region}
                error={fieldError === 'region' ? ' ' : undefined}
                onChange={(e) => {
                  set('region', e.target.value)
                  set('district', '')
                  if (!supportsExpress(e.target.value) && deliveryMethod === 'express') setDeliveryMethod('courier')
                }}
                options={REGIONS.map((r) => ({ value: r.name, label: r.name }))}
              />
              <Select
                label="Tuman"
                required
                value={form.district}
                error={fieldError === 'district' ? ' ' : undefined}
                onChange={(e) => set('district', e.target.value)}
                placeholder="Tumanni tanlang"
                options={districts.map((d) => ({ value: d, label: d }))}
              />
              <Input
                label="Manzil"
                required
                autoComplete="street-address"
                value={form.address}
                error={fieldError === 'address' ? ' ' : undefined}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Ko‘cha, uy, xonadon"
                className="sm:col-span-2"
              />
            </div>
          )}

          <Textarea
            label="Izoh (ixtiyoriy)"
            value={form.comment}
            onChange={(e) => set('comment', e.target.value)}
            placeholder="Kuryer uchun qo‘shimcha ma’lumot"
            className="mt-4"
          />
        </fieldset>

        {/* 3. Payment */}
        <fieldset className="rounded-2xl border border-line bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-ink">3. To‘lov usuli</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const active = paymentMethod === opt.id
              return (
                <button
                  type="button"
                  key={opt.id}
                  disabled={!opt.enabled}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                    active ? 'border-brand-500 bg-brand-50' : 'border-line-strong hover:border-brand-300',
                    !opt.enabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2',
                      active ? 'border-brand-600 bg-brand-600' : 'border-line-strong',
                    )}
                  >
                    {active && <IconCheck className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink">{opt.label}</span>
                    <span className="block text-xs text-ink-muted">{opt.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
          {paymentMethod !== 'cod' && (
            <p className="mt-3 rounded-lg bg-surface-soft px-3 py-2 text-xs text-ink-muted">
              Buyurtma tasdiqlangandan so‘ng siz to‘lov tizimi sahifasiga yo‘naltirilasiz.
            </p>
          )}
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-[140px]">
        <h2 className="text-base font-semibold text-ink">Buyurtmangiz</h2>

        <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
          {lines.map((l) => (
            <li key={l.productId} className="flex gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                <ProductThumb image={l.image} emoji={l.emoji} alt={l.name} sizes="48px" className="p-1" emojiClassName="text-xl" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2-safe block text-xs text-ink">{l.name}</span>
                <span className="block text-xs text-ink-faint">
                  {l.quantity} × {formatPrice(l.price)}
                </span>
              </span>
              <span className="text-xs font-semibold text-ink">{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Mahsulotlar</dt>
            <dd className="font-medium">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Yetkazib berish</dt>
            <dd className="font-medium">{shipping === 0 ? 'Bepul' : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2.5 text-base">
            <dt className="font-semibold">Jami</dt>
            <dd className="font-bold text-ink">{formatPrice(total)}</dd>
          </div>
        </dl>

        <Button type="submit" variant="accent" size="lg" fullWidth loading={pending} className="mt-4">
          Buyurtmani tasdiqlash
        </Button>

        <p className="mt-3 text-center text-xs text-ink-faint">
          Ro‘yxatdan o‘tmasdan ham buyurtma berishingiz mumkin.{' '}
          <Link href="/contact#terms" className="underline hover:text-brand-700">
            Shartlar
          </Link>
        </p>
      </aside>
    </form>
  )
}
