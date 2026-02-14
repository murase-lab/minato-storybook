import { useRef, useEffect } from 'react'
import { MaterialIcon } from './MaterialIcon'

interface VideoPlayerProps {
  src: string
  onClose: () => void
}

export function VideoPlayer({ src, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Auto-play when opened
    videoRef.current?.play()
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30 transition-colors"
      >
        <MaterialIcon icon="close" className="text-3xl" />
      </button>

      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[80vh] object-contain rounded-xl"
        controls
        playsInline
        autoPlay
      />

      {/* Hint text */}
      <p className="text-white/50 text-sm mt-4 font-bold">
        タップで そうさ
      </p>
    </div>
  )
}
