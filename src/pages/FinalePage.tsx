import { useRef } from 'react'
import { MaterialIcon } from '../components/MaterialIcon'
import { useMonthData } from '../services/useMonthData'

interface FinalePageProps {
  onRestart: () => void
  onGoCalendar: () => void
}

export function FinalePage({ onRestart, onGoCalendar }: FinalePageProps) {
  const finaleData = useMonthData('finale', '')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hasPhoto = finaleData.photos.length > 0

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-sky-100 to-amber-50 flex flex-col items-center">
      {/* Sparkle background */}
      <div className="absolute inset-0 sparkle-bg pointer-events-none" />

      {/* Confetti decorations */}
      <div className="absolute top-10 left-10 text-primary opacity-60">
        <MaterialIcon icon="celebration" className="text-3xl" />
      </div>
      <div className="absolute top-20 right-8 text-primary opacity-60 animate-sparkle">
        <MaterialIcon icon="star" className="text-2xl" />
      </div>

      {/* Mickey balloons */}
      <div className="absolute top-4 left-6 rotate-[-15deg]">
        <MickeyShape className="opacity-80" />
        <div className="h-12 w-0.5 bg-gray-400 mx-auto -mt-1" />
      </div>
      <div className="absolute top-8 right-10 rotate-[10deg]">
        <MickeyShape className="opacity-60 bg-primary/40" />
        <div className="h-10 w-0.5 bg-gray-400 mx-auto -mt-1" />
      </div>

      {/* Banner */}
      <div className="relative w-full flex flex-col items-center justify-center pt-12 mb-4 z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-primary/30 shadow-sm">
          <MaterialIcon icon="flight" className="text-primary" />
          <span className="font-extrabold text-primary text-xl">3さい おめでとう！</span>
          <MaterialIcon icon="train" className="text-primary" />
        </div>
        <div className="flex justify-between w-full mt-4 px-8">
          <MaterialIcon icon="train" className="text-5xl text-primary/60" />
          <MaterialIcon icon="flight" className="text-4xl text-primary/60" />
        </div>
      </div>

      {/* Central Photo Frame */}
      <div className="relative flex items-center justify-center w-full px-8 my-2 flex-grow z-10">
        <div className="absolute -top-4 -left-4 text-primary animate-sparkle">
          <MaterialIcon icon="auto_awesome" className="text-3xl" />
        </div>
        <div className="absolute -bottom-2 -right-2 text-primary">
          <MaterialIcon icon="favorite" className="text-4xl" filled />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-2xl border-[6px] border-primary rotate-[-2deg] relative">
          <div
            className="overflow-hidden rounded-lg w-64 h-72 bg-gray-100 flex items-center justify-center cursor-pointer"
            onClick={() => !hasPhoto && photoInputRef.current?.click()}
          >
            {hasPhoto ? (
              <img
                src={finaleData.photos[0].url}
                alt="3さいの みなとくん"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-3">
                <MaterialIcon icon="add_photo_alternate" className="text-primary/40 text-7xl" />
                <p className="text-primary/50 font-bold text-sm">
                  タップして しゃしんを えらぶ
                </p>
              </div>
            )}
          </div>

          {/* Change photo button */}
          {hasPhoto && (
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
            >
              <MaterialIcon icon="edit" className="text-primary text-sm" />
            </button>
          )}

          {/* Date stamp */}
          <div className="absolute bottom-6 right-6 bg-white/90 px-3 py-1 rounded-full shadow-sm">
            <p className="text-[10px] font-bold text-gray-500">2026.02.17</p>
          </div>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              if (finaleData.photos.length > 0) {
                await finaleData.removePhoto(finaleData.photos[0].id)
              }
              await finaleData.addPhoto(file)
            }
            if (photoInputRef.current) photoInputRef.current.value = ''
          }}
        />
      </div>

      {/* Birthday message */}
      <div className="w-full text-center px-6 mt-4 space-y-2 z-10">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight leading-tight">
          みなとくん<br />
          3さいの おたんじょうび<br />
          おめでとう！
        </h1>
        <p className="text-lg font-bold text-gray-700 mt-3 leading-relaxed">
          これからも たくさん<br />あそぼうね。
        </p>
      </div>

      {/* Action buttons */}
      <div className="w-full px-6 mt-6 pb-8 z-10 space-y-3">
        <button
          onClick={onRestart}
          className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-5 rounded-full shadow-[0_8px_0_0_var(--color-primary-dark)] active:translate-y-1 active:shadow-[0_4px_0_0_var(--color-primary-dark)] transition-all flex items-center justify-center gap-3 text-xl"
        >
          <MaterialIcon icon="auto_stories" />
          <span>もういちど よむ</span>
        </button>
        <button
          onClick={onGoCalendar}
          className="w-full bg-white/80 text-primary font-bold py-3 rounded-full border-2 border-primary/30 flex items-center justify-center gap-2 text-base active:scale-[0.98] transition-transform"
        >
          <MaterialIcon icon="calendar_month" />
          <span>おもいでカレンダー</span>
        </button>
      </div>

      {/* Confetti sprinkles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-5 w-3 h-3 bg-red-400 rounded-full opacity-40" />
        <div className="absolute top-1/2 right-10 w-4 h-4 bg-blue-400 rotate-45 opacity-40" />
        <div className="absolute bottom-1/4 left-10 w-3 h-3 bg-yellow-400 rounded-full opacity-40" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-400 rounded-full opacity-40" />
      </div>
    </div>
  )
}

function MickeyShape({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-10 h-10 bg-primary rounded-full ${className}`}>
      <div className="absolute w-6 h-6 bg-primary rounded-full -top-3 -left-2" />
      <div className="absolute w-6 h-6 bg-primary rounded-full -top-3 -right-2" />
    </div>
  )
}
