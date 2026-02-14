import { useState, useEffect } from 'react'
import { MaterialIcon } from '../components/MaterialIcon'
import { months } from '../data/months'
import { getMediaByMonth } from '../services/storage'

interface CalendarPageProps {
  onSelectMonth: (index: number) => void
  onGoHome: () => void
  onGoStory: () => void
  onGoFinale: () => void
}

export function CalendarPage({ onSelectMonth, onGoHome, onGoStory, onGoFinale }: CalendarPageProps) {
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-soft-cream">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#ee8c2b 0.5px, transparent 0.5px), radial-gradient(#ee8c2b 0.5px, #fdfcf0 0.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 pt-10 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MaterialIcon icon="cloud" className="text-primary text-xl" />
          <h1 className="text-xl font-extrabold text-warm-brown tracking-tight">
            みなとくんの 1ねんかん
          </h1>
          <MaterialIcon icon="auto_awesome" className="text-primary text-xl" />
        </div>
        <p className="text-sm font-bold text-primary/70">おもいでカレンダー</p>
      </header>

      {/* Month Grid */}
      <main className="relative z-10 flex-grow px-4 pb-24 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {months.map((month, index) => (
            <MonthCard
              key={month.month}
              month={month}
              index={index}
              onClick={() => onSelectMonth(index)}
            />
          ))}
        </div>

        {/* Finale card */}
        <button
          onClick={onGoFinale}
          className="w-full mt-4 bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-2xl border-2 border-primary/20 border-dashed flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <MaterialIcon icon="celebration" className="text-primary text-3xl" />
          <span className="text-lg font-bold text-primary">
            3さい おめでとう！
          </span>
          <MaterialIcon icon="arrow_forward" className="text-primary text-2xl" />
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-3 pb-8 flex justify-between items-center z-20">
        <button onClick={onGoHome} className="flex flex-col items-center gap-1">
          <MaterialIcon icon="home" className="text-nav-gray" />
          <span className="text-[10px] font-bold text-nav-gray">ほーむ</span>
        </button>
        <button onClick={onGoStory} className="flex flex-col items-center gap-1">
          <MaterialIcon icon="auto_stories" className="text-nav-gray" />
          <span className="text-[10px] font-bold text-nav-gray">ものがたり</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MaterialIcon icon="calendar_month" className="text-primary" filled />
          <span className="text-[10px] font-bold text-primary">おもいで</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MaterialIcon icon="settings" className="text-nav-gray" />
          <span className="text-[10px] font-bold text-nav-gray">せってい</span>
        </button>
      </nav>

      {/* Background clouds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-[5%] text-primary/10">
          <MaterialIcon icon="cloud" className="text-6xl" />
        </div>
        <div className="absolute top-1/2 right-[5%] text-primary/10">
          <MaterialIcon icon="star" className="text-4xl" />
        </div>
      </div>
    </div>
  )
}

function MonthCard({
  month,
  index,
  onClick,
}: {
  month: (typeof months)[0]
  index: number
  onClick: () => void
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const monthKey = String(month.month).padStart(2, '0')

  const icons = ['train', 'flight', 'star', 'auto_awesome', 'celebration', 'favorite']
  const iconName = icons[index % icons.length]

  useEffect(() => {
    let revoke: (() => void) | null = null
    getMediaByMonth(monthKey).then((items) => {
      const photo = items.find((m) => m.type === 'photo')
      if (photo) {
        // Use thumbnail if available, otherwise full blob
        const blob = photo.thumbnail || photo.blob
        const url = URL.createObjectURL(blob)
        setThumbnailUrl(url)
        revoke = () => URL.revokeObjectURL(url)
      }
    })
    return () => revoke?.()
  }, [monthKey])

  const hasContent = thumbnailUrl !== null

  return (
    <button
      onClick={onClick}
      className="bg-white p-2 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center active:scale-95 transition-transform"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={month.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${month.color}20` }}
          >
            <MaterialIcon icon={month.seasonIcon} className="text-3xl" style={{ color: month.color }} />
          </div>
        )}
        <div className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-primary">
          <MaterialIcon icon={iconName} className="text-xs block" />
        </div>
        {/* Content indicator */}
        {hasContent && (
          <div className="absolute bottom-1 left-1 bg-green-500/80 w-2 h-2 rounded-full" />
        )}
      </div>
      <span className="text-sm font-bold text-gray-700">{month.label}</span>
    </button>
  )
}
