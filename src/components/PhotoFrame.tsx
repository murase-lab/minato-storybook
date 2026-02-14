import { useState } from 'react'

interface PhotoFrameProps {
  src: string
  alt: string
  hasVideo?: boolean
  onPlayVideo?: () => void
  className?: string
}

export function PhotoFrame({ src, alt, hasVideo, onPlayVideo, className = '' }: PhotoFrameProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className={`relative w-full overflow-hidden rounded-xl shadow-sm ${className}`}>
      {imgError ? (
        <div className="w-full aspect-[4/5] bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-primary/40 text-6xl">photo_camera</span>
          <p className="text-primary/50 font-bold text-sm font-[var(--font-family-kids)]">
            しゃしんを いれてね
          </p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full aspect-[4/5] object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {hasVideo && !imgError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <button
            onClick={onPlayVideo}
            className="w-20 h-20 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-5xl ml-1">play_arrow</span>
          </button>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </div>
  )
}
