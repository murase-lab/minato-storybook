import { useRef } from 'react'
import { MaterialIcon } from '../components/MaterialIcon'
import { FloatingDecorations, DotPatternOverlay, PageCurl } from '../components/DecorativeElements'
import { useMonthData } from '../services/useMonthData'

interface CoverPageProps {
  onStart: () => void
}

export function CoverPage({ onStart }: CoverPageProps) {
  const coverData = useMonthData('cover', '')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hasPhoto = coverData.photos.length > 0

  return (
    <div className="flex flex-col min-h-screen paper-texture relative">
      <FloatingDecorations />

      {/* Header */}
      <header className="pt-14 pb-4 px-8 text-center z-10">
        <div className="inline-block bg-primary/10 px-4 py-1 rounded-full mb-3">
          <p className="text-primary font-bold text-sm tracking-widest">MEMORY STORYBOOK</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-warm-brown leading-tight">
          <span className="block text-primary">みなとくん</span>
          <span className="text-2xl">3さい おたんじょうび</span>
          <span className="block mt-1">おめでとう</span>
        </h1>
      </header>

      {/* Main Photo Frame */}
      <main className="flex-grow flex items-center justify-center px-8 relative z-10">
        <div className="relative w-full max-w-[320px] aspect-square">
          {/* Balloon decorations */}
          <div className="absolute -top-8 -left-6 z-20">
            <span className="text-red-400 text-5xl">&#9679;</span>
          </div>
          <div className="absolute -top-12 -left-2 z-20">
            <span className="text-blue-400 text-6xl">&#9679;</span>
          </div>

          {/* The Main Photo Frame */}
          <div className="w-full h-full bg-white/80 backdrop-blur-sm p-4 sketch-border hand-drawn-shadow transform -rotate-1 relative overflow-hidden">
            <div
              className="w-full h-full rounded-lg overflow-hidden bg-bg-light flex items-center justify-center cursor-pointer"
              onClick={() => !hasPhoto && photoInputRef.current?.click()}
            >
              {hasPhoto ? (
                <img
                  src={coverData.photos[0].url}
                  alt="みなとくん"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-3">
                  <MaterialIcon icon="add_photo_alternate" className="text-primary/40 text-7xl" />
                  <p className="text-primary/50 font-bold text-sm">
                    タップして ひょうしの しゃしんを えらぶ
                  </p>
                </div>
              )}
            </div>
            {/* Decorative tape */}
            <div className="absolute top-0 right-0 w-12 h-6 bg-primary/20 rotate-45 translate-x-3 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-12 h-6 bg-primary/20 rotate-45 -translate-x-3 translate-y-1" />

            {/* Change photo button when photo exists */}
            {hasPhoto && (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
              >
                <MaterialIcon icon="edit" className="text-primary text-sm" />
              </button>
            )}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                // Remove old cover photo if exists
                if (coverData.photos.length > 0) {
                  await coverData.removePhoto(coverData.photos[0].id)
                }
                await coverData.addPhoto(file)
              }
              if (photoInputRef.current) photoInputRef.current.value = ''
            }}
          />

          {/* Cake decoration */}
          <div className="absolute -bottom-6 -right-4 z-20 transform rotate-12">
            <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-primary/20">
              <MaterialIcon icon="cake" className="text-primary text-4xl" />
            </div>
          </div>
          <div className="absolute -bottom-10 left-10 z-20">
            <MaterialIcon icon="star" className="text-yellow-500 text-3xl" filled />
          </div>
        </div>
      </main>

      {/* Start Button */}
      <footer className="pb-14 px-8 flex justify-center z-10">
        <button onClick={onStart} className="relative group w-full max-w-xs h-20">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl translate-y-2 opacity-60" />
          <div className="relative w-full h-full bg-primary hover:bg-primary-hover transition-colors rounded-full flex items-center justify-center gap-3 border-b-8 border-primary-dark active:translate-y-1 active:border-b-4">
            <MaterialIcon icon="auto_stories" className="text-white text-3xl" />
            <span className="text-2xl font-bold text-white tracking-widest">はじめる</span>
            <MaterialIcon icon="play_arrow" className="text-white text-3xl" />
          </div>
          <div className="absolute -top-2 -right-2">
            <MaterialIcon icon="star" className="text-primary text-2xl" filled />
          </div>
        </button>
      </footer>

      <PageCurl />
      <DotPatternOverlay />
    </div>
  )
}
