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

      {/* Header - shrink-0 to keep fixed size */}
      <header className="shrink-0 pt-10 pb-2 px-8 text-center z-10">
        <div className="inline-block bg-primary/10 px-4 py-1 rounded-full mb-2">
          <p className="text-primary font-bold text-sm tracking-widest">MEMORY STORYBOOK</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-warm-brown leading-tight">
          <span className="block text-primary">みなとくん</span>
          <span className="text-xl">3さい おたんじょうび</span>
          <span className="block mt-1">おめでとう</span>
        </h1>
      </header>

      {/* Main Photo Frame */}
      <main className="flex items-center justify-center px-8 py-4 relative z-10">
        <div className="relative w-full max-w-[280px] aspect-square">
          {/* Balloon decorations */}
          <div className="absolute -top-6 -left-5 z-20">
            <span className="text-red-400 text-4xl">&#9679;</span>
          </div>
          <div className="absolute -top-10 -left-1 z-20">
            <span className="text-blue-400 text-5xl">&#9679;</span>
          </div>

          {/* The Main Photo Frame */}
          <div className="w-full h-full bg-white/80 backdrop-blur-sm p-3 sketch-border hand-drawn-shadow transform -rotate-1 relative overflow-hidden">
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
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-2">
                  <MaterialIcon icon="add_photo_alternate" className="text-primary/40 text-6xl" />
                  <p className="text-primary/50 font-bold text-xs">
                    タップして しゃしんを えらぶ
                  </p>
                </div>
              )}
            </div>
            {/* Decorative tape */}
            <div className="absolute top-0 right-0 w-10 h-5 bg-primary/20 rotate-45 translate-x-3 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-10 h-5 bg-primary/20 rotate-45 -translate-x-3 translate-y-1" />

            {/* Change / Delete photo buttons - moved outside */}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                if (coverData.photos.length > 0) {
                  await coverData.removePhoto(coverData.photos[0].id)
                }
                await coverData.addPhoto(file)
              }
              if (photoInputRef.current) photoInputRef.current.value = ''
            }}
          />

          {/* Change / Delete photo buttons - outside image */}
          {hasPhoto && (
            <div className="absolute -top-3 -right-3 flex gap-2 z-30">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200"
              >
                <MaterialIcon icon="edit" className="text-primary text-sm" />
              </button>
              <button
                onClick={() => coverData.removePhoto(coverData.photos[0].id)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200"
              >
                <MaterialIcon icon="delete" className="text-red-400 text-sm" />
              </button>
            </div>
          )}

          {/* Cake decoration */}
          <div className="absolute -bottom-5 -right-3 z-20 transform rotate-12">
            <div className="bg-white p-1.5 rounded-xl shadow-lg border-2 border-primary/20">
              <MaterialIcon icon="cake" className="text-primary text-3xl" />
            </div>
          </div>
          <div className="absolute -bottom-8 left-8 z-20">
            <MaterialIcon icon="star" className="text-yellow-500 text-2xl" filled />
          </div>
        </div>
      </main>

      {/* Start Button - shrink-0 to always stay visible */}
      <footer className="shrink-0 pb-10 pt-4 px-8 flex justify-center z-10">
        <button onClick={onStart} className="relative group w-full max-w-xs h-18">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl translate-y-2 opacity-60" />
          <div className="relative w-full h-full bg-primary hover:bg-primary-hover transition-colors rounded-full flex items-center justify-center gap-3 border-b-8 border-primary-dark active:translate-y-1 active:border-b-4 py-4">
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
