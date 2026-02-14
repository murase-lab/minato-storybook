import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { MaterialIcon } from './MaterialIcon'

interface PhotoCarouselProps {
  photos: { id: string; url: string }[]
  video?: { id: string; url: string }
  fallbackIcon: string
  fallbackColor: string
  monthLabel: string
  onPlayVideo?: () => void
}

export function PhotoCarousel({
  photos,
  video,
  fallbackIcon,
  fallbackColor,
  monthLabel,
  onPlayVideo,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Combine: photos first, then video if exists
  const hasVideo = !!video
  const totalSlides = photos.length + (hasVideo ? 1 : 0)
  const isEmpty = totalSlides === 0

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, totalSlides - 1))
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0))

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    preventScrollOnSwipe: true,
  })

  if (isEmpty) {
    return (
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-3">
        <MaterialIcon
          icon={fallbackIcon}
          className="text-6xl"
          style={{ color: fallbackColor, opacity: 0.4 }}
        />
        <p className="text-primary/50 font-bold text-sm">
          しゃしんを いれてね
        </p>
      </div>
    )
  }

  const isOnVideo = hasVideo && currentIndex === photos.length

  return (
    <div className="relative w-full" {...swipeHandlers}>
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm">
        {isOnVideo ? (
          // Video slide
          <div className="w-full h-full bg-black/5 flex items-center justify-center relative">
            <video
              src={video!.url}
              className="w-full h-full object-cover"
              playsInline
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <button
                onClick={onPlayVideo}
                className="w-20 h-20 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <MaterialIcon icon="play_arrow" className="text-5xl ml-1" />
              </button>
            </div>
          </div>
        ) : (
          // Photo slide
          <img
            src={photos[currentIndex]?.url}
            alt={`${monthLabel} しゃしん ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Slide indicator dots */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: totalSlides }).map((_, i) => {
            const isVideo = hasVideo && i === photos.length
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-5 h-2 bg-primary'
                    : 'w-2 h-2 bg-primary/25'
                }`}
              >
                {isVideo && i !== currentIndex && (
                  <MaterialIcon icon="videocam" className="text-[8px] text-primary/40" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Nav arrows for multiple slides */}
      {totalSlides > 1 && currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shadow-sm"
        >
          <MaterialIcon icon="chevron_left" className="text-warm-brown text-xl" />
        </button>
      )}
      {totalSlides > 1 && currentIndex < totalSlides - 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shadow-sm"
        >
          <MaterialIcon icon="chevron_right" className="text-warm-brown text-xl" />
        </button>
      )}
    </div>
  )
}
