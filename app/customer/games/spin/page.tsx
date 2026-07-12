'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { campaigns } from '@/lib/mock-data'
import { MECHANIC_META, hexToRgb, hexMix } from '@/lib/utils'
import type { SpinSegment } from '@/lib/types'

const spinCampaign = campaigns.find(c => c.mechanic === 'spin')!
const segments = (spinCampaign.config as { segments: SpinSegment[] }).segments
const meta = MECHANIC_META.spin
const accentRgb = hexToRgb(meta.cardFrom).join(',')
const lightAccent = hexMix(meta.cardFrom, '#FFFFFF', 0.35)

type State = 'idle' | 'spinning' | 'result'

const SPARKLE_POS = [
  { top: '14%', left: '10%' }, { top: '22%', right: '8%' },
  { top: '48%', left: '3%' }, { top: '52%', right: '5%' },
  { bottom: '30%', left: '8%' }, { bottom: '22%', right: '9%' },
  { top: '70%', left: '14%' }, { top: '60%', right: '12%' },
]

export default function SpinWheelPage() {
  const router = useRouter()
  const [state, setState]         = useState<State>('idle')
  const [rotation, setRotation]   = useState(0)
  const [won, setWon]             = useState(false)
  const [wonReward, setWonReward] = useState('')
  const [landedIdx, setLandedIdx] = useState<number | null>(null)
  // Idle drift: separate angle so it doesn't collide with spin destination
  const [idleAngle, setIdleAngle] = useState(0)
  const idleRef = useRef<number>(0)
  const rafRef  = useRef<number | null>(null)

  // Gentle idle rotation via rAF
  useEffect(() => {
    if (state !== 'idle') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      last = now
      idleRef.current += dt * 0.012 // ~4.3 deg/sec
      setIdleAngle(idleRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [state])

  const segCount = segments.length
  const segAngle = 360 / segCount

  const spin = () => {
    if (state !== 'idle') return
    setState('spinning')
    // Snap from idle angle into spin destination
    const baseRotation  = idleRef.current
    const winSegs       = segments.map((s, i) => ({ ...s, i })).filter(s => s.isWin)
    const noWinSegs     = segments.map((s, i) => ({ ...s, i })).filter(s => !s.isWin)
    const didWin        = Math.random() < 0.55
    const target        = didWin
      ? winSegs[Math.floor(Math.random() * winSegs.length)]
      : noWinSegs[Math.floor(Math.random() * noWinSegs.length)]
    const extraSpins    = 6 + Math.floor(Math.random() * 3)
    const targetAngle   = 360 - (target.i * segAngle + segAngle / 2) + 90
    const finalRotation = baseRotation + extraSpins * 360 + (targetAngle % 360)
    setRotation(finalRotation)
    setLandedIdx(target.i)
    setTimeout(() => {
      setWon(didWin)
      setWonReward(target.reward || '')
      setState('result')
    }, 5500)
  }

  if (state === 'result' && won)
    return (
      <WinCelebration
        reward={wonReward} emoji={meta.emoji} hidePlayAgain
        accentFrom={meta.cardFrom} accentTo={meta.cardTo}
        onClose={() => { setRotation(0); idleRef.current = 0; setState('idle') }}
      />
    )
  if (state === 'result' && !won)
    return <NoWin accentTo={meta.cardFrom} onClose={() => { setRotation(0); idleRef.current = 0; setState('idle') }} />

  const cx = 150, cy = 150, r = 140

  const studs = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * (360 / 16) - 90) * (Math.PI / 180)
    return { x: cx + 155 * Math.cos(angle), y: cy + 155 * Math.sin(angle) }
  })

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    return {
      x1: cx + 147 * Math.cos(angle), y1: cy + 147 * Math.sin(angle),
      x2: cx + 134 * Math.cos(angle), y2: cy + 134 * Math.sin(angle),
    }
  })

  const currentAngle = state === 'idle' ? idleAngle : rotation

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden bg-white"
    >
      {/* Ambient orbs */}
      <div className="absolute top-20 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${accentRgb},0.12) 0%, transparent 70%)`, filter: 'blur(56px)' }} />
      <div className="absolute bottom-28 -right-24 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${meta.cardFrom}18 0%, transparent 70%)`, filter: 'blur(48px)' }} />

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>
      <p className="absolute top-14 right-4 text-[10px] text-gray-400 z-20">Spin the Wheel</p>

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute pointer-events-none select-none" style={{ ...pos, color: `rgba(${accentRgb},0.4)` }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.3, 0.8], rotate: [0, 15, 0] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
          ✦
        </motion.div>
      ))}

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <div className="text-center mb-4">
          <h1 className="text-xl font-extrabold text-gray-900">Spin the Wheel</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state === 'spinning' ? 'Spinning…' : 'Tap SPIN to try your luck!'}
          </p>
        </div>

        {/* Wheel */}
        <div className="relative flex items-center justify-center my-2">
          {/* Outer glow ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 330, height: 330 }}
            animate={state === 'spinning'
              ? { boxShadow: [`0 0 40px rgba(${accentRgb},0.3)`, `0 0 90px rgba(${accentRgb},0.65)`, `0 0 40px rgba(${accentRgb},0.3)`] }
              : { boxShadow: `0 0 30px rgba(${accentRgb},0.15)` }}
            transition={{ duration: 1.2, repeat: state === 'spinning' ? Infinity : 0, ease: 'easeInOut' }}
          />

          {/* Pointer */}
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-lg">
            <div className="w-0 h-0" style={{
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderTop: `36px solid ${meta.cardFrom}`,
              filter: `drop-shadow(0 3px 8px rgba(${accentRgb},0.8))`,
            }} />
            <div className="w-6 h-6 rounded-full -mt-1.5" style={{ background: `linear-gradient(145deg, ${lightAccent}, ${meta.cardFrom})` }} />
          </div>

          {/* Wheel — uses idleAngle when idle, rotation when spinning */}
          <motion.div
            animate={{ rotate: currentAngle }}
            transition={state === 'spinning'
              ? { duration: 5, ease: [0.05, 0.95, 0.15, 1] }
              : { duration: 0 }}
          >
            <svg width="316" height="316" viewBox="0 0 300 300">
              {segments.map((seg, i) => {
                const startAngle = (i * segAngle - 90) * (Math.PI / 180)
                const endAngle   = ((i + 1) * segAngle - 90) * (Math.PI / 180)
                const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
                const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle)
                const midAngle = (startAngle + endAngle) / 2
                const tx = cx + (r * 0.65) * Math.cos(midAngle)
                const ty = cy + (r * 0.65) * Math.sin(midAngle)
                const isLanded = landedIdx === i && state === 'result'

                // Wrap onto two short lines instead of truncating mid-word
                const words = seg.label.split(' ')
                const lines = words.length > 1
                  ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
                  : [seg.label.length > 8 ? seg.label.slice(0, 7) + '…' : seg.label]

                // Keep labels upright — flip 180° on the left half so nothing reads upside down
                let labelRotation = i * segAngle + segAngle / 2
                if (labelRotation > 90 && labelRotation < 270) labelRotation += 180

                return (
                  <g key={i}>
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      stroke="rgba(0,0,0,0.12)"
                      strokeWidth="1.5"
                      opacity={isLanded ? 1 : landedIdx !== null ? 0.5 : 0.92}
                    />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="9.5" fontWeight="700"
                      transform={`rotate(${labelRotation}, ${tx}, ${ty})`}>
                      {lines.map((line, li) => (
                        <tspan key={li} x={tx} dy={lines.length === 1 ? 0 : li === 0 ? -6 : 12}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                )
              })}

              <circle cx={cx} cy={cy} r={148} fill="none" stroke={`rgba(${accentRgb},0.25)`} strokeWidth={5} />

              {ticks.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                  stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
              ))}

              {studs.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r="4.5" fill={meta.cardFrom} opacity="0.7"
                  stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
              ))}

              <circle cx={cx} cy={cy} r="32" fill="#08071A" stroke={meta.cardFrom} strokeWidth="2.5" />
              <circle cx={cx} cy={cy} r="26" fill="url(#centerGrad)" />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18">🧞</text>

              <defs>
                <radialGradient id="centerGrad" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#2D1B69" />
                  <stop offset="100%" stopColor="#08071A" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Prizes strip */}
      <div className="w-full flex gap-2 justify-center flex-wrap mb-4 z-10">
        {segments.filter(s => s.isWin).map((s, i) => (
          <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${s.color}30`, color: s.color, border: `1px solid ${s.color}50` }}>
            {s.label}
          </span>
        ))}
      </div>

      {/* SPIN button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={spin}
        disabled={state === 'spinning'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold transition-all disabled:opacity-50 z-10"
        style={{
          background: state === 'spinning' ? '#F3F4F6' : `linear-gradient(135deg, ${lightAccent}, ${meta.cardFrom})`,
          color: state === 'spinning' ? '#9CA3AF' : 'white',
          boxShadow: state !== 'spinning' ? `0 8px 32px rgba(${accentRgb},0.45)` : 'none',
        }}
        animate={state === 'idle'
          ? { boxShadow: [`0 8px 32px rgba(${accentRgb},0.35)`, `0 8px 52px rgba(${accentRgb},0.65)`, `0 8px 32px rgba(${accentRgb},0.35)`] }
          : {}}
        transition={{ duration: 1.8, repeat: state === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
      >
        {state === 'spinning' ? `${meta.emoji} Spinning…` : '✨ SPIN'}
      </motion.button>
    </div>
  )
}
