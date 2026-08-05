import type { Metadata } from 'next'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { IconCheck } from '@/components/ui/icons'
import { getContactInfo } from '@/lib/db/content'
import { buildMetadata } from '@/lib/utils/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Buyurtma qabul qilindi',
  path: '/checkout/success',
  noIndex: true,
})

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const [{ orderNumber }, contact] = await Promise.all([params, getContactInfo().catch(() => null)])
  const decoded = decodeURIComponent(orderNumber)

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-success">
          <IconCheck className="h-8 w-8" />
        </span>

        <h1 className="mt-4 text-xl font-bold text-ink">Buyurtmangiz qabul qilindi!</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Buyurtma raqami: <span className="font-semibold text-ink">{decoded}</span>
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          Menejerimiz eng qisqa vaqt ichida siz bilan bog‘lanadi va buyurtmani tasdiqlaydi.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <ButtonLink href="/account/orders" variant="primary" size="lg">
            Buyurtmani kuzatish
          </ButtonLink>
          <ButtonLink href="/catalog" variant="outline" size="lg">
            Xaridni davom ettirish
          </ButtonLink>
        </div>

        {contact?.phone && (
          <p className="mt-6 border-t border-line pt-5 text-xs text-ink-faint">
            Savolingiz bormi?{' '}
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="font-medium text-brand-700 hover:underline">
              {contact.phone}
            </a>{' '}
            yoki{' '}
            <Link href="/contact" className="font-medium text-brand-700 hover:underline">
              aloqa sahifasi
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
