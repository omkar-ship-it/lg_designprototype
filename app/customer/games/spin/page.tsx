'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { campaigns } from '@/lib/mock-data'
import type { SpinSegment } from '@/lib/types'

const spinCampaign = campaigns.find(c => c.mechanic === 'spin')!
const segments = (spinCampaign.config as { segments: SpinSegment[] }).segments

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

  const segCount = segments.length
  const segAngle = 360 / segCount

  const spin = () => {
    if (state !== 'idle') return
    setState('spinning')
    const winSegs   = segments.map((s, i) => ({ ...s, i })).filter(s => s.isWin)
    const noWinSegs = segments.map((s, i) => ({ ...s, i })).filter(s => !s.isWin)
    const didWin    = Math.random() < 0.55
    const target    = didWin
      ? winSegs[Math.floor(Math.random() * winSegs.length)]
      : noWinSegs[Math.floor(Math.random() * noWinSegs.length)]
    const extraSpins   = 5 + Math.floor(Math.random() * 3)
    const targetAngle  = 360 - (target.i * segAngle + segAngle / 2) + 90
    const finalRotation = rotation + extraSpins * 360 + (targetAngle % 360)
    setRotation(finalRotation)
    setLandedIdx(target.i)
    setTimeout(() => {
      setWon(didWin)
      setWonReward(target.reward || '')
      setState('result')
    }, 4500)
  }

  if (state === 'result' && won)  return <WinCelebration reward={wonReward} emoji="🎡" />
  if (state === 'result' && !won) return <NoWin />

  const cx = 150, cy = 150, r = 140

  // 16 decorative gold stud positions around the outer ring
  const studs = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * (360 / 16) - 90) * (Math.PI / 180)
    return { x: cx + 155 * Math.cos(angle), y: cy + 155 * Math.sin(angle) }
  })

  // 12 tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    return {
      x1: cx + 147 * Math.cos(angle), y1: cy + 147 * Math.sin(angle),
      x2: cx + 134 * Math.cos(angle), y2: cy + 134 * Math.sin(angle),
    }
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-20 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.15) 0%, transparent 70%)', filter: 'blur(56px)' }} />
      <div className="absolute bottom-28 -right-24 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(48px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute text-yellow-300/25 pointer-events-none select-none" style={pos}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.3, 0.8], rotate: [0, 15, 0] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
          ✦
        </motion.div>
      ))}

      {/* Campaign Details Card */}
      <div className="w-full px-5 mb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,197,24,0.3)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white\">🎡 Spin Fiesta</h2>
              <p className="text-xs text-white/50 mt-0.5">Weekend spin to win</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#10B981', color: '#fff' }}>LIVE</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-white/40 mb-1">Win Probability</p>
              <p className="text-white font-bold">55%</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Duration</p>
              <p className="text-white font-medium text-sm">Jun 10–30</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Participants</p>
              <p className="text-white font-medium">312 players</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Back */}
      <div className="w-full flex items-center px-5 mb-2 z-10">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="text-center z-10 mb-3">
        <h1 className="text-xl font-extrabold text-white">Spin the Wheel</h1>
        <p className="text-sm text-white/50 mt-1">
          {state === 'spinning' ? 'Spinning…' : 'Tap SPIN to try your luck!'}
        </p>
      </div>

      {/* Wheel container */}
      <div className="relative flex items-center justify-center my-2 z-10">
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 330, height: 330 }}
          animate={state === 'spinning'
            ? { boxShadow: ['0 0 40px rgba(245,197,24,0.3)', '0 0 90px rgba(245,197,24,0.65)', '0 0 40px rgba(245,197,24,0.3)'] }
            : { boxShadow: '0 0 30px rgba(245,197,24,0.15)' }}
          transition={{ duration: 1.2, repeat: state === 'spinning' ? Infinity : 0, ease: 'easeInOut' }}
        />

        {/* Gold pointer */}
        <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-lg">
          <div className="w-0 h-0" style={{
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '32px solid #F5C518',
            filter: 'drop-shadow(0 3px 6px rgba(245,197,24,0.7))',
          }} />
          <div className="w-5 h-5 rounded-full -mt-1.5" style={{ background: 'linear-gradient(145deg, #FDE68A, #F5C518)' }} />
        </div>

        {/* Spinning wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={state === 'spinning' ? { duration: 4, ease: [0.2, 0.8, 0.3, 1] } : { duration: 0 }}
        >
          <svg width="316" height="316" viewBox="0 0 300 300">
            {/* Segments */}
            {segments.map((seg, i) => {
              const startAngle = (i * segAngle - 90) * (Math.PI / 180)
              const endAngle   = ((i + 1) * segAngle - 90) * (Math.PI / 180)
              const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle)
              const midAngle = (startAngle + endAngle) / 2
              const tx = cx + (r * 0.65) * Math.cos(midAngle)
              const ty = cy + (r * 0.65) * Math.sin(midAngle)
              const label = seg.label.length > 8 ? seg.label.slice(0, 7) + '…' : seg.label
              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="rgba(0,0,0,0.12)"
                    strokeWidth="1.5"
                    opacity={landedIdx === i ? 1 : 0.92}
                  />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="9" fontWeight="700"
                    transform={`rotate(${i * segAngle + segAngle / 2}, ${tx}, ${ty})`}>
                    {label}
                  </text>
                </g>
              )
            })}

            {/* Outer decorative ring */}
            <circle cx={cx} cy={cy} r={148} fill="none" stroke="rgba(245,197,24,0.25)" strokeWidth={5} />

            {/* Tick marks */}
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
            ))}

            {/* Gold studs */}
            {studs.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r="4.5" fill="#F5C518" opacity="0.7"
                stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            ))}

            {/* Center */}
            <circle cx={cx} cy={cy} r="32" fill="#08071A" stroke="#F5C518" strokeWidth="2.5" />
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

      {/* SPIN button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={spin}
        disabled={state === 'spinning'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold transition-all disabled:opacity-50 z-10"
        style={{
          background: state === 'spinning' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #F5C518, #F59E0B)',
          color: state === 'spinning' ? 'white' : '#08071A',
          boxShadow: state !== 'spinning' ? '0 8px 32px rgba(245,197,24,0.45)' : 'none',
        }}
        animate={state === 'idle'
          ? { boxShadow: ['0 8px 32px rgba(245,197,24,0.35)', '0 8px 52px rgba(245,197,24,0.65)', '0 8px 32px rgba(245,197,24,0.35)'] }
          : {}}
        transition={{ duration: 1.8, repeat: state === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
      >
        {state === 'spinning' ? '🎡 Spinning…' : '✨ SPIN'}
      </motion.button>
    </div>
  )
}
