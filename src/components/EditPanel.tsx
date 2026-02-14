import { useRef, useState } from 'react'
import { MaterialIcon } from './MaterialIcon'

interface EditPanelProps {
  photos: { id: string; url: string }[]
  hasVideo: boolean
  text: string
  onAddPhoto: (file: File) => Promise<void>
  onAddVideo: (file: File) => Promise<void>
  onRemovePhoto: (id: string) => Promise<void>
  onRemoveVideo: () => Promise<void>
  onUpdateText: (text: string) => Promise<void>
  onClose: () => void
}

export function EditPanel({
  photos,
  hasVideo,
  text,
  onAddPhoto,
  onAddVideo,
  onRemovePhoto,
  onRemoveVideo,
  onUpdateText,
  onClose,
}: EditPanelProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [editText, setEditText] = useState(text)
  const [saving, setSaving] = useState(false)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setSaving(true)
    for (const file of Array.from(files)) {
      await onAddPhoto(file)
    }
    setSaving(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    await onAddVideo(file)
    setSaving(false)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleSaveText = async () => {
    setSaving(true)
    await onUpdateText(editText)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-warm-brown">おもいでを ついか</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <MaterialIcon icon="close" className="text-gray-500 text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Photos section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-warm-brown flex items-center gap-1">
                <MaterialIcon icon="photo_camera" className="text-primary text-lg" />
                しゃしん
              </h3>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold active:bg-primary/20 transition-colors"
              >
                <MaterialIcon icon="add" className="text-base" />
                ついか
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => onRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      style={{ opacity: 1 }} // Always visible on touch
                    >
                      <MaterialIcon icon="close" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <MaterialIcon icon="add_photo_alternate" className="text-gray-300 text-4xl" />
                <p className="text-gray-400 text-sm mt-1">しゃしんが まだ ないよ</p>
              </div>
            )}
          </div>

          {/* Video section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-warm-brown flex items-center gap-1">
                <MaterialIcon icon="videocam" className="text-primary text-lg" />
                どうが
              </h3>
              {!hasVideo && (
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold active:bg-primary/20 transition-colors"
                >
                  <MaterialIcon icon="add" className="text-base" />
                  ついか
                </button>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoSelect}
              />
            </div>

            {hasVideo ? (
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                <MaterialIcon icon="check_circle" className="text-green-500 text-2xl" />
                <span className="text-sm font-bold text-green-700 flex-1">どうが とうろくずみ</span>
                <button
                  onClick={onRemoveVideo}
                  className="flex items-center gap-1 bg-red-100 text-red-500 px-3 py-1.5 rounded-full text-sm font-bold"
                >
                  <MaterialIcon icon="delete" className="text-base" />
                  さくじょ
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <MaterialIcon icon="video_call" className="text-gray-300 text-4xl" />
                <p className="text-gray-400 text-sm mt-1">どうがが まだ ないよ</p>
              </div>
            )}
          </div>

          {/* Text section */}
          <div>
            <h3 className="font-bold text-warm-brown flex items-center gap-1 mb-3">
              <MaterialIcon icon="edit_note" className="text-primary text-lg" />
              おはなし
            </h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full h-32 bg-gray-50 rounded-xl p-4 text-warm-brown font-bold text-base leading-relaxed border-2 border-primary/10 focus:border-primary/30 focus:outline-none resize-none"
              placeholder="おはなしを かいてね..."
            />
            <button
              onClick={handleSaveText}
              disabled={saving || editText === text}
              className="mt-2 w-full bg-primary text-white font-bold py-3 rounded-xl disabled:opacity-40 active:bg-primary-hover transition-colors flex items-center justify-center gap-2"
            >
              <MaterialIcon icon="save" className="text-lg" />
              ほぞん
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {saving && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-t-3xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-primary font-bold text-sm">ほぞんちゅう...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
