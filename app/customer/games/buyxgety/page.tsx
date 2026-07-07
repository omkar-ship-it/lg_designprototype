'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'

const BUSINESS_NAME = 'Amber Cafe'
const BUSINESS_EMOJI = '☕'
const CONDITION: 'quantity' | 'spend' = 'spend'
const TARGET = 1000
const INITIAL_PROGRESS = 850
const INCREMENT = 200
const REWARD_LABEL = '₹150 Off'
const REWARD_EMOJI = '💰'

type State = 'idle' | 'confirming' | 'progress' | 'earned'

function fmt(n: number) {
  return CONDITION === 'spend' ? `₹${n}` : `${n}`
}

export default function BuyXGetYPage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [progress, setProgress] = useState(INITIAL_PROGRESS)

  const handleConfirm = () => {
    if (state !== 'idle') return
    setState('confirming')
    setTimeout(() => {
      const next = progress + INCREMENT
      setProgress(next)
      setState(next >= TARGET ? 'earned' : 'progress')
    }, 900)
  }

  const pct = Math.min(100, Math.round((progress / TARGET) * 100))

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain />
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #7C2D12 0%, #92400E 50%, #451A03 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.3) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', filter: 'blur(48px)' }} />

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          {state !== 'progress' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <p className="text-white/70 text-base font-semibold mb-1">Buy X, Get Y</p>
              <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
                {BUSINESS_NAME} {BUSINESS_EMOJI}
              </h1>

              {/* Progress bar */}
              <div className="w-full max-w-xs mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">
                    {CONDITION === 'spend' ? 'Spent' : 'Purchases'}
                  </span>
                  <span className="text-sm font-bold text-white">{fmt(progress)} / {fmt(TARGET)}</span>
                </div>
                <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>

              {/* Confirm button */}
              <motion.button
                onClick={handleConfirm}
                disabled={state === 'confirming'}
                whileTap={{ scale: 0.94 }}
                className="relative w-36 h-36 rounded-full flex items-center justify-center mb-8 select-none"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '3px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 0 0 8px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.25)',
                }}
                animate={state === 'idle' ? {
                  boxShadow: [
                    '0 0 0 8px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.25)',
                    '0 0 0 16px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.3)',
                    '0 0 0 8px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.25)',
                  ],
                } : {}}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {state === 'confirming' ? (
                  <motion.span
                    className="text-5xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span className="text-6xl">{REWARD_EMOJI}</span>
                )}
              </motion.button>

              <p className="text-sm font-semibold text-white/70 mb-1 text-center">
                Tap once staff confirms your {CONDITION === 'spend' ? 'bill' : 'purchase'}
              </p>
              <p className="text-xs text-white/40">Reach the goal for {REWARD_LABEL}</p>
            </motion.div>
          ) : (
            /* Progress recorded, not yet at goal */
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.1 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.6)' }}
              >
                <span className="text-5xl">✓</span>
              </motion.div>

              <p className="text-white/70 text-sm font-semibold mb-1">Progress recorded at</p>
              <h2 className="text-2xl font-extrabold text-white mb-6">{BUSINESS_NAME} {BUSINESS_EMOJI}</h2>

              <div className="w-full max-w-xs mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">
                    {CONDITION === 'spend' ? 'Spent' : 'Purchases'}
                  </span>
                  <span className="text-sm font-bold text-white">{fmt(progress)} / {fmt(TARGET)}</span>
                </div>
                <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <p className="text-sm text-white/60 mb-8 text-center">
                {fmt(TARGET - progress)} more to unlock {REWARD_LABEL} 🎁
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.back()}
                className="w-full py-4 rounded-2xl font-bold text-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white' }}
              >
                ← Back to {BUSINESS_NAME}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
