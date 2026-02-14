import { MaterialIcon } from './MaterialIcon'

export function FloatingDecorations() {
  return (
    <>
      <div className="absolute top-10 left-6 opacity-40 animate-float" style={{ '--rotate': '12deg' } as React.CSSProperties}>
        <MaterialIcon icon="auto_awesome" className="text-primary text-4xl" />
      </div>
      <div className="absolute top-24 right-10 opacity-30 animate-float" style={{ animationDelay: '0.5s', '--rotate': '-12deg' } as React.CSSProperties}>
        <MaterialIcon icon="celebration" className="text-primary text-6xl" />
      </div>
      <div className="absolute bottom-40 left-4 opacity-30 animate-float" style={{ animationDelay: '1s', '--rotate': '45deg' } as React.CSSProperties}>
        <MaterialIcon icon="cake" className="text-primary text-5xl" />
      </div>
      <div className="absolute bottom-48 right-6 opacity-40 animate-sparkle">
        <MaterialIcon icon="star" className="text-primary text-4xl" />
      </div>
    </>
  )
}

export function DotPatternOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 dot-pattern" />
  )
}

export function PageCurl() {
  return (
    <div
      className="absolute bottom-0 right-0 w-12 h-12 bg-white/40 shadow-inner"
      style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
    />
  )
}

export function SeasonalIcon({ icon, className = '' }: { icon: string; className?: string }) {
  return (
    <MaterialIcon icon={icon} className={`text-primary/30 ${className}`} />
  )
}
