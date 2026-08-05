import type { Metadata } from 'next'
import { OrderTracker } from '@/components/account/OrderTracker'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { buildMetadata } from '@/lib/utils/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Shaxsiy kabinet',
  path: '/account',
  noIndex: true,
})

async function getUser() {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export default async function AccountPage() {
  const user = await getUser()

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Hisob</h2>
        {user ? (
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Telefon</dt>
              <dd className="font-medium text-ink">{user.phone ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Email</dt>
              <dd className="font-medium text-ink">{user.email ?? '—'}</dd>
            </div>
          </dl>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-muted">
              Hozircha WOOKA’da ro‘yxatdan o‘tmasdan ham buyurtma berish mumkin. Telefon raqami orqali kirish tez orada
              ishga tushadi — shundan so‘ng barcha buyurtmalaringiz shu yerda saqlanadi.
            </p>
            <p className="mt-3 inline-flex rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              SMS orqali kirish — tez kunda
            </p>
          </>
        )}
      </section>

      <OrderTracker />
    </div>
  )
}
