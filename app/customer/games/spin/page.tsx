'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { campaigns } from '@/lib/mock-data'
import type { SpinSegment } from '@/lib/types'

const spinCampaign = campaigns.find(c => c.mechanic === 'spin')!
const segments = (spinCampaign.config as { segments: SpinSegment[] }).segments

type State = 'idle' | 'spinning' | 'result'

export default function SpinWheelPage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [rotation, setRotation] = useState(0)
  const [won, setWon] = useState(false)
  const [wonReward, setWonReward] = useState('')
  const [landedIdx, setLandedIdx] = useState<number | null>(null)

  const segCount = segments.length
  const segAngle = 360 / segCount

  const spin = () => {
    if (state !== 'idle') return
    setState('spinning')

    const winSegs = segments.map((s, i) => ({ ...s, i })).filter(s => s.isWin)
    const noWinSegs = segments.map((s, i) => ({ ...s, i })).filter(s => !s.isWin)
    const didWin = Math.random() < 0.55
    const target = didWin ? winSegs[Math.floor(Math.random() * winSegs.length)] : noWinSegs[Math.floor(Math.random() * noWinSegs.length)]

    const extraSpins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = 360 - (target.i * segAngle + segAngle / 2) + 90
    const finalRotation = rotation + extraSpins * 360 + (targetAngle % 360)

    setRotation(finalRotation)
    setLandedIdx(target.i)

    setTimeout(() => {
      setWon(didWin)
      setWonReward(target.reward || '')
      setState('result')
    }, 4500)
  }

  if (state === 'result' && won) return <WinCelebration reward={wonReward} emoji="🎡" />
  if (state === 'result' && !won) return <NoWin />

  const cx = 150, cy = 150, r = 140

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-white mb-1">Spin the Wheel!</h1>
        <p className="text-sm text-c-text-2">Tap SPIN to test your luck</p>
      </div>

      <div className="relative flex items-center justify-center my-4">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-c-gold" />
        </div>

        {/* Wheel */}
        <motion.div
          className="relative"
          animate={{ rotate: rotation }}
          transition={state === 'spinning' ? { duration: 4, ease: [0.2, 0.8, 0.3, 1] } : { duration: 0 }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300">
            {segments.map((seg, i) => {
              const startAngle = (i * segAngle - 90) * (Math.PI / 180)
              const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180)
              const x1 = cx + r * Math.cos(startAngle)
              const y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle)
              const y2 = cy + r * Math.sin(endAngle)
              const midAngle = (startAngle + endAngle) / 2
              const tx = cx + (r * 0.65) * Math.cos(midAngle)
              const ty = cy + (r * 0.65) * Math.sin(midAngle)
              const isLanded = landedIdx === i
              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    opacity={isLanded ? 1 : 0.9}
                  />
                  <text
                    x={tx} y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="700"
                    transform={`rotate(${i * segAngle + segAngle / 2}, ${tx}, ${ty})`}
                  >
                    {seg.label.length > 10 ? seg.label.slice(0, 9) + '…' : seg.label}
                  </text>
                </g>
              )
            })}
            {/* Center circle */}
            <circle cx={cx} cy={cy} r="24" fill="#08071A" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18">🧞</text>
          </svg>
        </motion.div>

        {/* Glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: state === 'spinning' ? '0 0 60px rgba(139,92,246,0.5)' : '0 0 30px rgba(139,92,246,0.2)' }} />
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={spin}
        disabled={state === 'spinning'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold text-v-bg transition-all disabled:opacity-50"
        style={{
          background: state === 'spinning' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F5C518, #F59E0B)',
          boxShadow: state !== 'spinning' ? '0 8px 32px rgba(245,197,24,0.4)' : 'none',
        }}
      >
        {state === 'spinning' ? '🎡 Spinning…' : '✨ SPIN'}
      </motion.button>

      <button onClick={() => router.push('/customer')} className="text-xs text-white/30 hover:text-white/60 transition-colors">
        ← Back to games
      </button>
    </div>
  )
}
