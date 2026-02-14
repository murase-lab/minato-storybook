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

      {/* Mickey balloons */}
      <div className="absolute top-2 left-4 rotate-[-15deg] z-0">
        <MickeyShape className="opacity-60 scale-75" />
        <div className="h-8 w-0.5 bg-gray-400 mx-auto -mt-1" />
      </div>
      <div className="absolute top-4 right-8 rotate-[10deg] z-0">
        <MickeyShape className="opacity-40 scale-75" />
        <div className="h-6 w-0.5 bg-gray-400 mx-auto -mt-1" />
      </div>

      {/* Banner */}
      <div className="w-full flex items-center justify-center pt-6 pb-2 z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border-2 border-primary/30 shadow-sm">
          <MaterialIcon icon="celebration" className="text-primary text-lg" />
          <span className="font-extrabold text-primary text-lg">3さい おめでとう！</span>
          <MaterialIcon icon="celebration" className="text-primary text-lg" />
        </div>
      </div>

      {/* Photo Frame - compact */}
      <div className="relative flex items-center justify-center w-full px-10 py-2 z-10">
        <div className="bg-white p-3 rounded-xl shadow-2xl border-4 border-primary rotate-[-2deg] relative">
          <div
            className="overflow-hidden rounded-lg w-48 h-48 bg-gray-100 flex items-center justify-center cursor-pointer"
            onClick={() => !hasPhoto && photoInputRef.current?.click()}
          >
            {hasPhoto ? (
              <img
                src={finaleData.photos[0].url}
                alt="3さいの みなとくん"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-2">
                <MaterialIcon icon="add_photo_alternate" className="text-primary/40 text-5xl" />
                <p className="text-primary/50 font-bold text-xs">タップして えらぶ</p>
              </div>
            )}
          </div>

          {/* Date stamp */}
          <div className="absolute bottom-5 right-5 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
            <p className="text-[9px] font-bold text-gray-500">2026.02.17</p>
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

        {/* Change / Delete photo buttons - outside image */}
        {hasPhoto && (
          <div className="absolute -bottom-3 right-8 flex gap-2 z-30">
            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200"
            >
              <MaterialIcon icon="edit" className="text-primary text-xs" />
            </button>
            <button
              onClick={() => finaleData.removePhoto(finaleData.photos[0].id)}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200"
            >
              <MaterialIcon icon="delete" className="text-red-400 text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* Birthday message */}
      <div className="w-full text-center px-6 py-2 z-10">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight leading-snug">
          みなとくん<br />
          3さいの おたんじょうび<br />
          おめでとう！
        </h1>
        <p className="text-base font-bold text-gray-700 mt-2 leading-relaxed">
          これからも たくさん あそぼうね。
        </p>
      </div>

      {/* Action buttons */}
      <div className="w-full px-6 pt-2 pb-6 z-10 space-y-2">
        <button
          onClick={onRestart}
          className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-4 rounded-full shadow-[0_6px_0_0_var(--color-primary-dark)] active:translate-y-1 active:shadow-[0_3px_0_0_var(--color-primary-dark)] transition-all flex items-center justify-center gap-3 text-lg"
        >
          <MaterialIcon icon="auto_stories" />
          <span>もういちど よむ</span>
        </button>
        <button
          onClick={onGoCalendar}
          className="w-full bg-white/80 text-primary font-bold py-3 rounded-full border-2 border-primary/30 flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform"
        >
          <MaterialIcon icon="calendar_month" />
          <span>おもいでカレンダー</span>
        </button>
      </div>

      {/* Confetti sprinkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-5 w-2.5 h-2.5 bg-red-400 rounded-full opacity-40" />
        <div className="absolute top-1/2 right-8 w-3 h-3 bg-blue-400 rotate-45 opacity-40" />
        <div className="absolute bottom-1/4 left-8 w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-40" />
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
