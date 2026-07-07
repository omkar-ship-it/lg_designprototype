'use client'
import { useId } from 'react'

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

function burstPath(cx: number, cy: number, rOuter: number, rInner: number, points: number) {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const angle = (i * Math.PI) / points
    pts.push(`${cx + r * Math.sin(angle)},${cy - r * Math.cos(angle)}`)
  }
  return `M ${pts.join(' L ')} Z`
}

const WHEEL_SLICES = ['☕', '🏷️', '🧁', '⭐', '🏷️', '🧁']

export function SpinWheelArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `sw-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const cx = 60, cy = 56, r = 42

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${gid}-hub`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4C1D95" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* pedestal */}
      <rect x="46" y="100" width="28" height="7" rx="3.5" fill="#4C1D95" opacity="0.55" />
      <rect x="55" y="94" width="10" height="10" rx="2" fill="#4C1D95" opacity="0.55" />

      {/* wheel */}
      <g filter={`url(#${gid}-shadow)`}>
        <circle cx={cx} cy={cy} r={r + 4} fill="#4C1D95" />
        {WHEEL_SLICES.map((emoji, i) => {
          const startAngle = i * 60
          const endAngle = startAngle + 60
          const mid = (startAngle + endAngle) / 2
          const labelPos = polarToCartesian(cx, cy, r * 0.62, mid)
          const isPurple = i % 2 === 0
          return (
            <g key={i}>
              <path d={wedgePath(cx, cy, r, startAngle, endAngle)} fill={isPurple ? '#7C3AED' : '#FFFFFF'} />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {emoji}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#4C1D95" strokeWidth="2.5" />
        {/* rim bulbs */}
        {Array.from({ length: 12 }, (_, i) => {
          const p = polarToCartesian(cx, cy, r + 4, i * 30)
          return <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#FFFFFF" />
        })}
      </g>

      {/* pointer */}
      <path d={`M ${cx} 6 L ${cx - 6} 16 L ${cx + 6} 16 Z`} fill="#F59E0B" stroke="#B45309" strokeWidth="1" />

      {/* hub */}
      <circle cx={cx} cy={cy} r="9" fill={`url(#${gid}-hub)`} stroke="#B45309" strokeWidth="1" />
      <circle cx={cx - 2.5} cy={cy - 2.5} r="2.2" fill="#FFFBEB" opacity="0.8" />
    </svg>
  )
}

export function RollDiceArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `rd-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  // isometric cube: top / left / right faces
  const top: [number, number][] = [[60, 14], [96, 34], [60, 54], [24, 34]]
  const left: [number, number][] = [[24, 34], [60, 54], [60, 96], [24, 76]]
  const right: [number, number][] = [[96, 34], [60, 54], [60, 96], [96, 76]]
  const pts = (a: [number, number][]) => a.map(p => p.join(',')).join(' ')

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#831843" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* sparkle rays */}
      <path d="M14,20 L17,27 L14,34 L11,27 Z" fill="#FBCFE8" opacity="0.9" />
      <path d="M104,66 L107,73 L104,80 L101,73 Z" fill="#FBCFE8" opacity="0.9" />
      <path d="M96,12 L98,17 L96,22 L94,17 Z" fill="#FBCFE8" opacity="0.8" />
      <circle cx="18" cy="90" r="2" fill="#FBCFE8" opacity="0.8" />

      {/* ground shadow */}
      <ellipse cx="60" cy="99" rx="26" ry="5" fill="#831843" opacity="0.18" />

      <g filter={`url(#${gid}-shadow)`}>
        <polygon points={pts(top)} fill="#FFFFFF" stroke="#831843" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={pts(left)} fill="#F4D9E4" stroke="#831843" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={pts(right)} fill="#FBE7EF" stroke="#831843" strokeWidth="2" strokeLinejoin="round" />

        {/* pips: top face shows 2 */}
        <circle cx="52" cy="28" r="3" fill="#831843" />
        <circle cx="72" cy="40" r="3" fill="#831843" />

        {/* pips: right face shows 3 */}
        <circle cx="70" cy="48" r="3" fill="#9D174D" />
        <circle cx="80" cy="58" r="3" fill="#9D174D" />
        <circle cx="90" cy="68" r="3" fill="#9D174D" />

        {/* pips: left face shows 1 */}
        <circle cx="42" cy="65" r="3" fill="#9D174D" />
      </g>
    </svg>
  )
}

export function CouponTicketArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `ct-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const perfX = 108
  const holes = Array.from({ length: 6 }, (_, i) => 22 + i * 10)

  return (
    <svg viewBox="0 0 170 100" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#92400E" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#${gid}-shadow)`}>
        <rect x="10" y="14" width="140" height="72" rx="10" fill="#FFFBEB" />
        {/* perforation notches */}
        <circle cx={perfX} cy="14" r="6" fill="#F59E0B" />
        <circle cx={perfX} cy="86" r="6" fill="#F59E0B" />
        <line x1={perfX} y1="24" x2={perfX} y2="76" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />

        {/* left zone: tag icon + code lines */}
        <rect x="28" y="34" width="16" height="12" rx="2" fill="none" stroke="#D97706" strokeWidth="2.5" transform="rotate(-8 36 40)" />
        <circle cx="32" cy="38" r="1.4" fill="#D97706" transform="rotate(-8 36 40)" />
        <rect x="50" y="38" width="42" height="4" rx="2" fill="#FDBA74" />
        <rect x="50" y="48" width="30" height="4" rx="2" fill="#FDE68A" />

        {/* barcode */}
        {holes.map((y, i) => (
          <rect key={i} x={120 + (i % 3) * 6} y="30" width={i % 2 === 0 ? 2.5 : 1.5} height="40" fill="#78350F" opacity="0.85" />
        ))}
      </g>

      {/* percent starburst badge */}
      <g filter={`url(#${gid}-shadow)`}>
        <path d={burstPath(148, 82, 20, 15, 10)} fill="#EA580C" />
        <text x="148" y="82" fontSize="15" fontWeight="700" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">%</text>
      </g>
    </svg>
  )
}

export function BundleGiftArt({ className = '' }: { className?: string }) {
  const rawId = useId()
  const gid = `bg-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg viewBox="0 0 170 130" className={className} aria-hidden="true">
      <defs>
        <filter id={`${gid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3730A3" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="82" cy="122" rx="60" ry="6" fill="#3730A3" opacity="0.15" />

      <g filter={`url(#${gid}-shadow)`}>
        {/* back bag (tan) */}
        <path d="M62,52 L108,52 L114,116 L56,116 Z" fill="#E9D5A1" stroke="#3730A3" strokeWidth="2" strokeLinejoin="round" />
        <path d="M72,52 C72,40 98,40 98,52" fill="none" stroke="#3730A3" strokeWidth="3" strokeLinecap="round" />

        {/* front bag (purple) */}
        <path d="M18,60 L64,60 L70,120 L12,120 Z" fill="#8B5CF6" stroke="#3730A3" strokeWidth="2" strokeLinejoin="round" />
        <path d="M28,60 C28,49 54,49 54,60" fill="none" stroke="#3730A3" strokeWidth="3" strokeLinecap="round" />
        {/* tag on front bag */}
        <rect x="26" y="80" width="18" height="13" rx="2" fill="#FDE68A" stroke="#3730A3" strokeWidth="1.5" transform="rotate(-10 35 86)" />
        <circle cx="30" cy="84" r="1.6" fill="#3730A3" transform="rotate(-10 35 86)" />

        {/* gift box */}
        <rect x="112" y="82" width="42" height="36" rx="3" fill="#7C3AED" stroke="#3730A3" strokeWidth="2" />
        <rect x="112" y="82" width="42" height="10" fill="#6D28D9" stroke="#3730A3" strokeWidth="2" />
        <rect x="129" y="82" width="8" height="36" fill="#FDE68A" />
        <path d="M124,82 C118,70 128,66 133,78 C138,66 148,70 142,82 Z" fill="#FDE68A" stroke="#3730A3" strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      {/* best-value starburst */}
      <g filter={`url(#${gid}-shadow)`}>
        <path d={burstPath(78, 70, 19, 14, 10)} fill="#F59E0B" />
        <path d="M78,63 L80.5,68.5 L86,70 L80.5,71.5 L78,77 L75.5,71.5 L70,70 L75.5,68.5 Z" fill="#FFFFFF" />
      </g>
    </svg>
  )
}
