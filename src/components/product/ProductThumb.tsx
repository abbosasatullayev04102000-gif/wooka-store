import Image from 'next/image'
import { BLUR_DATA_URL, hasRealImage, imageProps } from '@/lib/utils/image'
import { cn } from '@/lib/utils/cn'

/**
 * Every WOOKA product carries an emoji (`data.e`) that the merchant app uses as
 * its visual identity, and a photo is optional. So the thumbnail falls back to
 * the emoji instead of a grey placeholder — the catalogue never looks broken,
 * even before any images are uploaded.
 */
export function ProductThumb({
  image,
  emoji,
  alt,
  fill = true,
  sizes,
  priority,
  className,
  emojiClassName,
}: {
  image?: string | null
  emoji?: string | null
  alt: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  emojiClassName?: string
}) {
  if (hasRealImage(image)) {
    return (
      <Image
        {...imageProps(image as string)}
        alt={alt}
        fill={fill}
        sizes={sizes ?? '(max-width: 640px) 45vw, 220px'}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        className={cn('object-contain', className)}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 grid select-none place-items-center',
        emojiClassName ?? 'text-5xl',
      )}
    >
      {emoji || '🧸'}
    </span>
  )
}
