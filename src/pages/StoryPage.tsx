import { useCallback, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { MaterialIcon } from '../components/MaterialIcon'
import { PhotoCarousel } from '../components/PhotoCarousel'
import { VideoPlayer } from '../components/VideoPlayer'
import { EditPanel } from '../components/EditPanel'
import { useMonthData } from '../services/useMonthData'
import { months } from '../data/months'

interface StoryPageProps {
  monthIndex: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

export function StoryPage({ monthIndex, onNext, onPrev, onClose }: StoryPageProps) {
  const data = months[monthIndex]
  const monthKey = String(data.month).padStart(2, '0')
  const monthData = useMonthData(monthKey, data.defaultText)

  const [slideDirection, setSlideDirection] = useState<'none' | 'left' | 'right'>('none')
  const [showVideo, setShowVideo] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const totalPages = months.length + 1
  const currentPage = monthIndex + 1

  const handleNext = useCallback(() => {
    setSlideDirection('left')
    setTimeout(() => {
      onNext()
      setSlideDirection('none')
    }, 250)
  }, [onNext])

  const handlePrev = useCallback(() => {
    setSlideDirection('right')
    setTimeout(() => {
      onPrev()
      setSlideDirection('none')
    }, 250)
  }, [onPrev])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  const slideClass = slideDirection === 'left'
    ? 'translate-x-[-100%] opacity-0'
    : slideDirection === 'right'
    ? 'translate-x-[100%] opacity-0'
    : 'translate-x-0 opacity-100'

  const textLines = monthData.displayText.split('\n')

  return (
    <div
      {...swipeHandlers}
      className={`relative w-full min-h-screen bg-gradient-to-b ${data.bgGradient} flex flex-col`}
    >
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <MaterialIcon icon="auto_stories" className="text-primary text-sm" />
          </div>
          <h1 className="text-base font-bold text-warm-brown truncate">
            {data.label}の みなとくんの おもいで
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={() => setShowEdit(true)}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <MaterialIcon icon="edit" className="text-xl" />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <MaterialIcon icon="calendar_month" className="text-xl" />
          </button>
        </div>
      </header>

      {/* Content area with slide animation */}
      <main className={`flex-1 px-4 flex flex-col gap-3 transition-all duration-250 ease-in-out ${slideClass}`}>
        {/* Season decoration */}
        <div className="absolute top-16 left-8 z-10">
          <MaterialIcon icon={data.seasonIcon} className="text-4xl" style={{ color: data.color, opacity: 0.4 }} />
        </div>

        {/* Photo carousel */}
        <PhotoCarousel
          key={monthKey}
          photos={monthData.photos}
          video={monthData.video}
          fallbackIcon={data.seasonIcon}
          fallbackColor={data.color}
          monthLabel={data.label}
          onPlayVideo={() => setShowVideo(true)}
        />

        {/* Season decoration right */}
        <div className="absolute top-1/2 -right-2 z-10 transform -translate-y-1/2">
          <MaterialIcon icon={data.seasonIcon} className="text-5xl" style={{ color: data.color, opacity: 0.25 }} />
        </div>

        {/* Story text */}
        <div className="flex-1 bg-primary/5 rounded-xl p-5 relative border-2 border-primary/10 border-dashed">
          <div className="absolute -top-8 -right-2 transform rotate-12 drop-shadow-md">
            <MaterialIcon icon={data.seasonIcon} className="text-5xl text-primary" />
          </div>

          <div className="text-[1.5rem] font-bold text-warm-brown leading-relaxed">
            {textLines.map((line, i) => (
              <p key={i} className={`mb-1 ${i === textLines.length - 1 ? 'text-primary' : ''}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </main>

      {/* Spacer for fixed footer */}
      <div className="h-24 shrink-0" />

      {/* Footer Navigation - fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto h-24 px-5 pb-6 flex items-center justify-between z-30 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <button onClick={handlePrev} className="group flex items-center gap-2">
          <div className="w-14 h-14 bg-white/80 rounded-lg flex items-center justify-center shadow-sm border border-black/5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-primary/20 rounded-tr-lg" />
            <MaterialIcon icon="chevron_left" className="text-primary text-3xl" />
          </div>
        </button>

        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === monthIndex ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-primary/20'
              }`}
            />
          ))}
        </div>

        <button onClick={handleNext} className="group flex items-center gap-2">
          <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-white/30 rounded-tl-lg" />
            <MaterialIcon icon="chevron_right" className="text-white text-3xl" />
          </div>
        </button>
      </footer>

      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary/40 font-bold z-30">
        {currentPage} / {totalPages}
      </div>

      {/* Video player modal */}
      {showVideo && monthData.video && (
        <VideoPlayer src={monthData.video.url} onClose={() => setShowVideo(false)} />
      )}

      {/* Edit panel */}
      {showEdit && (
        <EditPanel
          photos={monthData.photos}
          hasVideo={!!monthData.video}
          text={monthData.displayText}
          onAddPhoto={monthData.addPhoto}
          onAddVideo={monthData.addVideo}
          onRemovePhoto={monthData.removePhoto}
          onRemoveVideo={monthData.removeVideo}
          onUpdateText={monthData.updateText}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
