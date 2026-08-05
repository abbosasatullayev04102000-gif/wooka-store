'use client'

import { useEffect } from 'react'
import { Button, ButtonLink } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the digest so it can be matched against server logs.
    console.error('[wooka] render error', error.digest ?? error.message)
  }, [error])

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md text-center">
        <p className="text-6xl" aria-hidden>
          ⚠️
        </p>
        <h1 className="mt-4 text-2xl font-bold text-ink">Nimadir noto‘g‘ri ketdi</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sahifani yuklashda xatolik yuz berdi. Qayta urinib ko‘ring — muammo takrorlansa, biz bilan bog‘laning.
        </p>
        {error.digest && <p className="mt-2 text-xs text-ink-faint">Xato kodi: {error.digest}</p>}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="primary" size="lg" onClick={reset}>
            Qayta urinish
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            Bosh sahifaga
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
