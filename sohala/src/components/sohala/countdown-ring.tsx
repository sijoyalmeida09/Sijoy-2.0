'use client'

import { useEffect, useState } from 'react'

interface CountdownRingProps {
  seconds: number
  onExpire?: () => void
  size?: number
  strokeWidth?: number
}

export function CountdownRing({
  seconds,
  onExpire,
  size = 120,
  strokeWidth = 6,
}: CountdownRingProps) {
  const [remaining, setRemaining] = useState(seconds)
  const total = seconds
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (remaining / total) * circumference
  const center = size / 2

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.()
      return
    }
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer)
          onExpire?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isUrgent = remaining <= 15
  const color = isUrgent ? '#E50914' : remaining <= 30 ? '#FFD700' : '#00C853'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {remaining}
        </span>
        <span className="text-xs text-text-muted">sec</span>
      </div>
    </div>
  )
}
