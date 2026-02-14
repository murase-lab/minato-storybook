import { useState, useRef, useEffect } from 'react'
import { MaterialIcon } from '../components/MaterialIcon'
import { useMonthData } from '../services/useMonthData'

interface MessagePageProps {
  type: 'papa' | 'mama'
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

const config = {
  papa: {
    title: 'ぱぱの ことば',
    icon: 'flight' as const,
    subIcon: 'train' as const,
    gradient: 'from-blue-50 to-amber-50',
    accentColor: '#4A7FA8',
    placeholder: 'みなとへ、\nおたんじょうび おめでとう！\nいつも たのしい まいにち を\nありがとう。',
    storageKey: 'papa',
  },
  mama: {
    title: 'ままの おいわいの ことば',
    icon: 'favorite' as const,
    subIcon: 'auto_awesome' as const,
    gradient: 'from-pink-50 to-amber-50',
    accentColor: '#D4748A',
    placeholder: 'みなとへ、\nおたんじょうび おめでとう！\nまいにち げんき に\nそだって くれて ありがとう。',
    storageKey: 'mama',
  },
}

export function MessagePage({ type, onNext, onPrev, onClose }: MessagePageProps) {
  const c = config[type]
  const monthData = useMonthData(c.storageKey, '')
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  const handleEdit = () => {
    setEditText(monthData.displayText || '')
    setEditing(true)
  }

  const handleSave = async () => {
    await monthData.updateText(editText)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditing(false)
  }

  const hasMessage = !!monthData.displayText

  return (
    <div className={`relative w-full min-h-screen bg-gradient-to-b ${c.gradient} flex flex-col`}>
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-5 opacity-10">
          <MaterialIcon icon={c.icon} className="text-7xl" style={{ color: c.accentColor }} />
        </div>
        <div className="absolute top-40 right-5 opacity-10">
          <MaterialIcon icon={c.subIcon} className="text-6xl" style={{ color: c.accentColor }} />
        </div>
        <div className="absolute bottom-32 left-10 opacity-10">
          <MaterialIcon icon="star" className="text-5xl" style={{ color: c.accentColor }} />
        </div>
      </div>

      {/* Header */}
      <header className="px-5 pt-6 pb-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${c.accentColor}20` }}
          >
            <MaterialIcon icon={c.icon} className="text-xl" style={{ color: c.accentColor }} />
          </div>
          <h1 className="text-lg font-extrabold text-warm-brown truncate">
            {c.title}
          </h1>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 ml-2"
        >
          <MaterialIcon icon="calendar_month" className="text-xl" />
        </button>
      </header>

      {/* Message area */}
      <main className="flex-1 px-5 py-4 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border-2 border-dashed relative min-h-[300px]"
          style={{ borderColor: `${c.accentColor}30` }}
        >
          {/* Decorative corner */}
          <div className="absolute -top-3 -left-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${c.accentColor}20` }}
            >
              <MaterialIcon icon={c.subIcon} className="text-sm" style={{ color: c.accentColor }} />
            </div>
          </div>
          <div className="absolute -top-3 -right-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${c.accentColor}20` }}
            >
              <MaterialIcon icon={c.icon} className="text-sm" style={{ color: c.accentColor }} />
            </div>
          </div>

          {editing ? (
            /* Edit mode */
            <div className="flex flex-col gap-4">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder={c.placeholder}
                className="w-full min-h-[250px] text-lg font-bold text-warm-brown leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-gray-300"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-full font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: c.accentColor }}
                >
                  <MaterialIcon icon="save" className="text-lg" />
                  <span>ほぞん</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-full font-bold text-gray-500 bg-gray-100 flex items-center justify-center gap-2"
                >
                  <span>やめる</span>
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="flex flex-col gap-4">
              {hasMessage ? (
                <div className="text-xl font-bold text-warm-brown leading-relaxed whitespace-pre-wrap min-h-[200px]">
                  {monthData.displayText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 min-h-[200px] text-center">
                  <MaterialIcon icon={c.icon} className="text-5xl" style={{ color: `${c.accentColor}40` }} />
                  <p className="text-gray-400 font-bold text-base">
                    まだ ことばが ありません
                  </p>
                  <p className="text-gray-300 text-sm">
                    えんぴつボタンで ことばを かこう
                  </p>
                </div>
              )}

              <button
                onClick={handleEdit}
                className="self-center px-6 py-3 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md"
                style={{ backgroundColor: c.accentColor }}
              >
                <MaterialIcon icon="edit" className="text-lg" />
                <span>{hasMessage ? 'ことばを へんしゅう' : 'ことばを かく'}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="shrink-0 h-24 px-5 pb-6 flex items-center justify-between z-10">
        <button onClick={onPrev} className="group">
          <div className="w-14 h-14 bg-white/80 rounded-lg flex items-center justify-center shadow-sm border border-black/5">
            <MaterialIcon icon="chevron_left" className="text-3xl" style={{ color: c.accentColor }} />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <MaterialIcon icon={c.icon} className="text-xl" style={{ color: c.accentColor, opacity: 0.5 }} />
          <span className="text-sm font-bold" style={{ color: `${c.accentColor}80` }}>
            {c.title}
          </span>
          <MaterialIcon icon={c.subIcon} className="text-xl" style={{ color: c.accentColor, opacity: 0.5 }} />
        </div>

        <button onClick={onNext} className="group">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg"
            style={{ backgroundColor: c.accentColor }}
          >
            <MaterialIcon icon="chevron_right" className="text-white text-3xl" />
          </div>
        </button>
      </footer>
    </div>
  )
}
