import { IconBox, IconHeadset, IconRefresh, IconShield, IconTruck } from '@/components/ui/icons'

const ITEMS = [
  { Icon: IconTruck, title: 'Tez yetkazib berish', text: 'Toshkentda 2 soat ichida' },
  { Icon: IconBox, title: 'Butun O‘zbekistonga', text: '1–3 kun ichida yetkazib berish' },
  { Icon: IconShield, title: 'Xavfsiz to‘lov', text: 'Payme, Click, Uzum, Humo' },
  { Icon: IconRefresh, title: '14 kun qaytarish', text: 'Muammo bo‘lsa, qaytaring' },
  { Icon: IconHeadset, title: '24/7 qo‘llab-quvvatlash', text: 'Biz har doim siz bilan' },
]

export function Advantages() {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-4 lg:mt-10 lg:p-5">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ITEMS.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[13px] font-semibold text-brand-700">{title}</span>
              <span className="block text-xs text-ink-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
