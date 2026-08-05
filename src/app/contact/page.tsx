import type { Metadata } from 'next'
import { getContactInfo } from '@/lib/db/content'
import { formatPrice } from '@/lib/utils/format'
import { buildMetadata } from '@/lib/utils/seo'
import { IconMail, IconPhone, IconPin } from '@/components/ui/icons'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Aloqa va yordam',
  description: 'WOOKA bilan bog‘lanish, yetkazib berish, to‘lov va qaytarish shartlari.',
  path: '/contact',
})

export default async function ContactPage() {
  const contact = await getContactInfo().catch(() => null)

  return (
    <div className="container-page py-6">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">Aloqa va yordam</h1>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Bog‘lanish</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {contact?.phone && (
              <li className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-ink hover:text-brand-700">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact?.email && (
              <li className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <a href={`mailto:${contact.email}`} className="text-ink hover:text-brand-700">
                  {contact.email}
                </a>
              </li>
            )}
            {contact?.address && (
              <li className="flex items-start gap-2.5">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span className="text-ink">{contact.address}</span>
              </li>
            )}
          </ul>
          {contact?.workingHours && <p className="mt-4 text-xs text-ink-faint">Ish vaqti: {contact.workingHours}</p>}

          <div className="mt-4 flex gap-2">
            {contact?.telegram && (
              <a
                href={contact.telegram}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                Telegram
              </a>
            )}
            {contact?.instagram && (
              <a
                href={contact.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                Instagram
              </a>
            )}
          </div>
        </section>

        <section id="delivery" className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Yetkazib berish</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>• Toshkent shahri — 2 soat ichida (ekspress) yoki kun davomida.</li>
            <li>• Viloyatlar — 1–3 ish kuni.</li>
            <li>
              • {formatPrice(contact?.freeDeliveryFrom ?? 300000)} dan yuqori buyurtmalarda yetkazib berish{' '}
              <b className="text-success">bepul</b>.
            </li>
            <li>• Standart yetkazib berish narxi — {formatPrice(contact?.deliveryFee ?? 25000)}.</li>
            <li>• Do‘kondan olib ketish — bepul.</li>
          </ul>
        </section>

        <section id="payment" className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">To‘lov</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>• Yetkazib berishda naqd yoki karta orqali.</li>
            <li>• Payme, Click, Uzum Bank orqali onlayn to‘lov.</li>
            <li>• Barcha to‘lovlar to‘lov tizimlari tomonidan himoyalangan.</li>
            <li>• Onlayn to‘lov muvaffaqiyatsiz bo‘lsa, mahsulot omborga qaytariladi.</li>
          </ul>
        </section>

        <section id="returns" className="rounded-2xl border border-line bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-ink">Qaytarish va almashtirish</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>• Mahsulotni olganingizdan keyin 14 kun ichida qaytarishingiz mumkin.</li>
            <li>• Mahsulot ishlatilmagan, tovar ko‘rinishi va qadoqlari saqlangan bo‘lishi kerak.</li>
            <li>• Nuqsonli mahsulot aniqlansa, yetkazib berish xarajatlarini biz qoplaymiz.</li>
            <li>• Qaytarish uchun buyurtma raqami bilan biz bilan bog‘laning.</li>
          </ul>
        </section>

        <section id="terms" className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Ommaviy oferta</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Saytda buyurtma berish orqali siz WOOKA ommaviy oferta shartlariga rozilik bildirasiz: buyurtma
            ma’lumotlarining to‘g‘riligi, yetkazib berish shartlari va shaxsiy ma’lumotlarni qayta ishlashga rozilik.
          </p>
        </section>
      </div>
    </div>
  )
}
