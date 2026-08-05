import type { PaymentMethod } from '@/lib/db/types'

export interface PaymentOption {
  id: PaymentMethod
  label: string
  description: string
  /** Set false until the merchant contract is signed — the UI greys it out. */
  enabled: boolean
  logo: string
}

const flag = (name: string) => process.env[name as keyof NodeJS.ProcessEnv] !== undefined

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cod',
    label: 'Yetkazib berishda naqd',
    description: 'Kuryerga naqd yoki karta orqali to‘lang',
    enabled: true,
    logo: '/img/pay/cash.svg',
  },
  {
    id: 'payme',
    label: 'Payme',
    description: 'Payme ilovasi orqali onlayn to‘lov',
    enabled: true,
    logo: '/img/pay/payme.svg',
  },
  {
    id: 'click',
    label: 'Click',
    description: 'Click Up yoki Click orqali to‘lov',
    enabled: true,
    logo: '/img/pay/click.svg',
  },
  {
    id: 'uzum',
    label: 'Uzum Bank',
    description: 'Uzum Bank kartasi yoki nasiya',
    enabled: true,
    logo: '/img/pay/uzum.svg',
  },
]

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method
}

/** Prices are stored in so'm; Payme and Click transact in tiyin. */
const toTiyin = (sum: number) => Math.round(sum * 100)

export interface CheckoutRedirectInput {
  orderId: string
  orderNumber: string
  amount: number
  returnUrl: string
}

/**
 * Builds the provider hand-off URL. Nothing here is a secret — merchant ids are
 * public. Amount and status are always re-verified server-side by the matching
 * Edge Function before an order is marked paid, so a tampered URL cannot
 * settle an order.
 */
export function buildPaymentRedirect(method: PaymentMethod, input: CheckoutRedirectInput): string | null {
  switch (method) {
    case 'payme': {
      const merchantId = process.env.NEXT_PUBLIC_PAYME_MERCHANT_ID
      if (!merchantId) return null
      const params = [
        `m=${merchantId}`,
        `ac.order_id=${input.orderId}`,
        `a=${toTiyin(input.amount)}`,
        `c=${input.returnUrl}`,
        'l=uz',
        'cr=UZS',
      ].join(';')
      const encoded = typeof window === 'undefined' ? Buffer.from(params).toString('base64') : btoa(params)
      return `https://checkout.paycom.uz/${encoded}`
    }

    case 'click': {
      const serviceId = process.env.NEXT_PUBLIC_CLICK_SERVICE_ID
      const merchantId = process.env.NEXT_PUBLIC_CLICK_MERCHANT_ID
      if (!serviceId || !merchantId) return null
      const qs = new URLSearchParams({
        service_id: serviceId,
        merchant_id: merchantId,
        amount: String(input.amount),
        transaction_param: input.orderId,
        return_url: input.returnUrl,
      })
      return `https://my.click.uz/services/pay?${qs.toString()}`
    }

    case 'uzum': {
      const base = process.env.NEXT_PUBLIC_UZUM_CHECKOUT_URL
      const merchantId = process.env.NEXT_PUBLIC_UZUM_MERCHANT_ID
      if (!base || !merchantId) return null
      const qs = new URLSearchParams({
        merchant_id: merchantId,
        order_id: input.orderId,
        amount: String(input.amount),
        redirect_url: input.returnUrl,
      })
      return `${base}?${qs.toString()}`
    }

    case 'cod':
    default:
      return null
  }
}

/** True when the method needs a redirect before the order is considered done. */
export function requiresRedirect(method: PaymentMethod): boolean {
  return method !== 'cod'
}

export { flag }
