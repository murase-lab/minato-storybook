import type { CSSProperties } from 'react'

interface MaterialIconProps {
  icon: string
  className?: string
  filled?: boolean
  style?: CSSProperties
}

export function MaterialIcon({ icon, className = '', filled = false, style }: MaterialIconProps) {
  const mergedStyle: CSSProperties = {
    ...style,
    ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}),
  }

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
    >
      {icon}
    </span>
  )
}
