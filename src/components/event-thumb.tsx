import { useState, type ReactNode } from 'react'

const safeImage = (value: string) =>
  /^https?:\/\//i.test(value || '') ? value : undefined

export function EventThumb({
  image,
  name,
  className = '',
  children,
}: {
  image: string
  name: string
  className?: string
  children?: ReactNode
}) {
  const src = safeImage(image)
  const [failedSrc, setFailedSrc] = useState<string>()
  const showImage = src && failedSrc !== src
  return (
    <div className={`event-thumb ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="event-thumb-initials" aria-hidden="true">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {children}
    </div>
  )
}
