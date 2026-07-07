'use client'
import { useId } from 'react'
import type { MechanicType } from '@/lib/types'

interface Tile {
  width: number
  height: number
  content: React.ReactNode
}

const TILES: Record<MechanicType, Tile> = {
  // Spin a Wheel — radiating wedge, like a wheel segment
  spin: {
    width: 56, height: 56,
    content: <path d="M28,28 L28,4 A24,24 0 0,1 45,11 Z" fill="white" />,
  },
  // Roll a Dice — five pips, arranged like a die face
  dice: {
    width: 44, height: 44,
    content: (
      <>
        <circle cx="10" cy="10" r="2.5" fill="white" />
        <circle cx="34" cy="10" r="2.5" fill="white" />
        <circle cx="22" cy="22" r="2.5" fill="white" />
        <circle cx="10" cy="34" r="2.5" fill="white" />
        <circle cx="34" cy="34" r="2.5" fill="white" />
      </>
    ),
  },
  // Jackpot Draw — diagonal ticket stripe + sparkle
  lottery: {
    width: 48, height: 48,
    content: (
      <>
        <rect x="-6" y="20" width="60" height="5" fill="white" transform="rotate(-25 24 24)" />
        <path d="M38,6 L39.5,10.5 L44,12 L39.5,13.5 L38,18 L36.5,13.5 L32,12 L36.5,10.5 Z" fill="white" />
      </>
    ),
  },
  // Spend X, Get Y — forward chevrons (progression / exchange)
  buyxgety: {
    width: 40, height: 40,
    content: <path d="M9,7 L20,20 L9,33" stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  },
  // Coupon Codes — perforated tear-line with a punch hole
  coupon: {
    width: 40, height: 40,
    content: (
      <>
        <circle cx="20" cy="20" r="3.5" fill="white" />
        <rect x="18.25" y="0" width="3.5" height="10" fill="white" />
        <rect x="18.25" y="30" width="3.5" height="10" fill="white" />
      </>
    ),
  },
  // Flash Sale — lightning bolt
  flash: {
    width: 44, height: 44,
    content: <path d="M24,2 L11,24 L20,24 L16,42 L33,18 L23,18 Z" fill="white" />,
  },
  // Bring Your Friend — two overlapping circles
  friend: {
    width: 48, height: 40,
    content: (
      <>
        <circle cx="16" cy="20" r="9" fill="none" stroke="white" strokeWidth="2.25" />
        <circle cx="30" cy="20" r="9" fill="none" stroke="white" strokeWidth="2.25" />
      </>
    ),
  },
  // Community Offer - Group Unlock — connected network nodes
  groupunlock: {
    width: 44, height: 40,
    content: (
      <>
        <line x1="10" y1="10" x2="32" y2="10" stroke="white" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="21" y2="28" stroke="white" strokeWidth="1.5" />
        <line x1="32" y1="10" x2="21" y2="28" stroke="white" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.75" fill="white" />
        <circle cx="32" cy="10" r="2.75" fill="white" />
        <circle cx="21" cy="28" r="2.75" fill="white" />
      </>
    ),
  },
  // Bundle/Combo Offers — gift box outline with ribbon cross
  combo: {
    width: 40, height: 40,
    content: (
      <>
        <rect x="8" y="8" width="20" height="20" rx="2" fill="none" stroke="white" strokeWidth="2.25" />
        <line x1="8" y1="18" x2="28" y2="18" stroke="white" strokeWidth="2.25" />
        <line x1="18" y1="8" x2="18" y2="28" stroke="white" strokeWidth="2.25" />
      </>
    ),
  },
  // Stamp Card — perforated stamp ring
  stamp: {
    width: 40, height: 40,
    content: <circle cx="20" cy="20" r="9" fill="none" stroke="white" strokeWidth="2" strokeDasharray="3.2 2.6" />,
  },
  // Shake & Win / Scratch — sparkle burst
  shake: {
    width: 40, height: 40,
    content: <path d="M20,6 L22.5,17.5 L34,20 L22.5,22.5 L20,34 L17.5,22.5 L6,20 L17.5,17.5 Z" fill="white" />,
  },
  // Daily Check-in — checkmark tick
  checkin: {
    width: 44, height: 36,
    content: <path d="M8,19 L16,27 L36,7" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  },
}

interface MechanicPatternProps {
  type: MechanicType
  /** Overall opacity of the pattern layer against the cover gradient */
  opacity?: number
  /** Rotates the tile grid for extra visual variety (degrees) */
  rotate?: number
  className?: string
}

export function MechanicPattern({ type, opacity = 0.16, rotate = 0, className = 'absolute inset-0' }: MechanicPatternProps) {
  const rawId = useId()
  const patternId = `mp-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const tile = TILES[type]

  return (
    <svg
      className={`${className} pointer-events-none select-none`}
      style={{ opacity }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={patternId}
          width={tile.width}
          height={tile.height}
          patternUnits="userSpaceOnUse"
          patternTransform={rotate ? `rotate(${rotate})` : undefined}
        >
          {tile.content}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
