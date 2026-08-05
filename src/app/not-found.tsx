import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md text-center">
        <p className="text-6xl" aria-hidden>
          🧩
        </p>
        <h1 className="mt-4 text-2xl font-bold text-ink">Sahifa topilmadi</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Siz qidirgan sahifa o‘chirilgan yoki manzili o‘zgargan bo‘lishi mumkin.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <ButtonLink href="/" variant="primary" size="lg">
            Bosh sahifaga
          </ButtonLink>
          <ButtonLink href="/catalog" variant="outline" size="lg">
            Katalogga
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
