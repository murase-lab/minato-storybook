import { useState, useRef, useEffect } from 'react'
import { MaterialIcon } from '../components/MaterialIcon'
import { VideoPlayer } from '../components/VideoPlayer'
import { useMonthData } from '../services/useMonthData'

interface MessagePageProps {
  type: 'papa' | 'mama'
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

const config = {
  papa: {
    title: 'ぱぱの おいわいの ことば',
    icon: 'flight' as const,
    subIcon: 'train' as const,
    gradient: 'from-blue-50 to-amber-50',
    accentColor: '#4A7FA8',
    placeholder: 'みなとへ、\nおたんじょうび おめでとう！\nいつも たのしい まいにち を\nありがとう。',
    storageKey: 'papa',
    photoLabel: 'ぱぱと みなとの さいこうの いちまい',
  },
  mama: {
    title: 'ままの おいわいの ことば',
    icon: 'favorite' as const,
    subIcon: 'auto_awesome' as const,
    gradient: 'from-pink-50 to-amber-50',
    accentColor: '#D4748A',
    placeholder: 'みなとへ、\nおたんじょうび おめでとう！\nまいにち げんき に\nそだって くれて ありがとう。',
    storageKey: 'mama',
    photoLabel: 'ままと みなとの さいこうの いちまい',
  },
}

export function MessagePage({ type, onNext, onPrev, onClose }: MessagePageProps) {
  const c = config[type]
  const monthData = useMonthData(c.storageKey, '')
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [showVideo, setShowVideo] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const hasPhoto = monthData.photos.length > 0
  const hasVideo = !!monthData.video

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
        <div className="absolute top-16 left-5 opacity-10">
          <MaterialIcon icon={c.icon} className="text-6xl" style={{ color: c.accentColor }} />
        </div>
        <div className="absolute top-36 right-5 opacity-10">
          <MaterialIcon icon={c.subIcon} className="text-5xl" style={{ color: c.accentColor }} />
        </div>
      </div>

      {/* Header */}
      <header className="px-5 pt-4 pb-2 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${c.accentColor}20` }}
          >
            <MaterialIcon icon={c.icon} className="text-lg" style={{ color: c.accentColor }} />
          </div>
          <h1 className="text-base font-extrabold text-warm-brown truncate">
            {c.title}
          </h1>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 ml-2"
        >
          <MaterialIcon icon="calendar_month" className="text-lg" />
        </button>
      </header>

      {/* Photo section */}
      <div className="px-5 py-2 z-10">
        <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm">
          {hasPhoto ? (
            <>
              <img
                src={monthData.photos[0].url}
                alt={c.photoLabel}
                className="w-full h-full object-cover"
              />
              {/* Photo action buttons */}
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                >
                  <MaterialIcon icon="edit" className="text-xs" style={{ color: c.accentColor }} />
                </button>
                <button
                  onClick={() => monthData.removePhoto(monthData.photos[0].id)}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                >
                  <MaterialIcon icon="delete" className="text-red-400 text-xs" />
                </button>
              </div>
            </>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: `${c.accentColor}10` }}
              onClick={() => photoInputRef.current?.click()}
            >
              <MaterialIcon icon="add_photo_alternate" className="text-4xl" style={{ color: `${c.accentColor}40` }} />
              <p className="text-xs font-bold" style={{ color: `${c.accentColor}50` }}>
                {c.photoLabel}
              </p>
            </div>
          )}

        </div>

        {/* Video section */}
        <div className="flex justify-center gap-2 mt-3">
          {hasVideo ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-white shadow-md text-sm"
                style={{ backgroundColor: c.accentColor }}
              >
                <MaterialIcon icon="play_circle" className="text-lg" />
                <span>どうがを みる</span>
              </button>
              <button
                onClick={monthData.removeVideo}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-red-200"
              >
                <MaterialIcon icon="delete" className="text-red-400 text-sm" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{ color: c.accentColor, borderColor: `${c.accentColor}40` }}
            >
              <MaterialIcon icon="videocam" className="text-sm" />
              <span>どうがを ついか</span>
            </button>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              if (monthData.photos.length > 0) {
                await monthData.removePhoto(monthData.photos[0].id)
              }
              await monthData.addPhoto(file)
            }
            if (photoInputRef.current) photoInputRef.current.value = ''
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) await monthData.addVideo(file)
            if (videoInputRef.current) videoInputRef.current.value = ''
          }}
        />
      </div>

      {/* Message area */}
      <main className="flex-1 px-5 pb-2 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border-2 border-dashed relative"
          style={{ borderColor: `${c.accentColor}30` }}
        >
          {editing ? (
            /* Edit mode */
            <div className="flex flex-col gap-3">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder={c.placeholder}
                className="w-full min-h-[120px] text-base font-bold text-warm-brown leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-gray-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-full font-bold text-white flex items-center justify-center gap-2 text-sm"
                  style={{ backgroundColor: c.accentColor }}
                >
                  <MaterialIcon icon="save" className="text-base" />
                  <span>ほぞん</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-full font-bold text-gray-500 bg-gray-100 flex items-center justify-center text-sm"
                >
                  <span>やめる</span>
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="flex flex-col gap-3">
              {hasMessage ? (
                <div className="text-lg font-bold text-warm-brown leading-relaxed whitespace-pre-wrap">
                  {monthData.displayText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                  <MaterialIcon icon={c.icon} className="text-4xl" style={{ color: `${c.accentColor}40` }} />
                  <p className="text-gray-400 font-bold text-sm">まだ ことばが ありません</p>
                </div>
              )}

              <button
                onClick={handleEdit}
                className="self-center px-5 py-2.5 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-md text-sm"
                style={{ backgroundColor: c.accentColor }}
              >
                <MaterialIcon icon="edit" className="text-base" />
                <span>{hasMessage ? 'ことばを へんしゅう' : 'ことばを かく'}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Spacer for fixed footer */}
      <div className="h-24 shrink-0" />

      {/* Footer Navigation - fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto h-24 px-5 pb-6 flex items-center justify-between z-30 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <button onClick={onPrev} className="group">
          <div className="w-14 h-14 bg-white/80 rounded-lg flex items-center justify-center shadow-sm border border-black/5">
            <MaterialIcon icon="chevron_left" className="text-3xl" style={{ color: c.accentColor }} />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <MaterialIcon icon={c.icon} className="text-lg" style={{ color: c.accentColor, opacity: 0.5 }} />
          <span className="text-xs font-bold" style={{ color: `${c.accentColor}80` }}>
            {c.title}
          </span>
          <MaterialIcon icon={c.subIcon} className="text-lg" style={{ color: c.accentColor, opacity: 0.5 }} />
        </div>

        <button onClick={onNext} className="group">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg"
            style={{ backgroundColor: c.accentColor }}
          >
            <MaterialIcon icon="chevron_right" className="text-white text-3xl" />
          </div>
        </button>
      </footer>

      {/* Video player modal */}
      {showVideo && monthData.video && (
        <VideoPlayer src={monthData.video.url} onClose={() => setShowVideo(false)} />
      )}
    </div>
  )
}
