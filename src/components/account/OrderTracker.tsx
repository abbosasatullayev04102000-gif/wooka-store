'use client'

import { useState, useTransition } from 'react'
import { lookupOrder } from '@/app/account/actions'
import type { Order } from '@/lib/db/types'
import { formatPhone } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { OrderCard } from './OrderCard'

export function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('+998 ')
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await lookupOrder(orderNumber, phone)
      if (result.ok) {
        setOrder(result.order)
      } else {
        setOrder(null)
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Buyurtmani kuzatish</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Ro‘yxatdan o‘tmasdan buyurtma bergan bo‘lsangiz, raqam va telefon orqali holatini ko‘ring.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Buyurtma raqami"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="W260801-1001"
          />
          <Input
            label="Telefon raqami"
            required
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="+998 90 123 45 67"
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="md" loading={pending} className="mt-4">
          Tekshirish
        </Button>
      </form>

      {order && <OrderCard order={order} />}
    </div>
  )
}
