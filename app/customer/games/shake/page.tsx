'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

type State = 'idle' | 'shaking' | 'result'

export default function ShakeWinPage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [won, setWon] = useState(false)
  const [shakeCount, setShakeCount] = useState(0)

  const handleShake = () => {
    if (state !== 'idle') return
    setState('shaking')
    setShakeCount(0)

    const interval = setInterval(() => {
      setShakeCount(c => c + 1)
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      const didWin = Math.random() > 0.35
      setWon(didWin)
      setState('result')
    }, 2500)
  }

  if (state === 'result' && won) return <WinCelebration reward="Free Coffee ☕" emoji="☕" />
  if (state === 'result' && !won) return <NoWin />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-2xl font-extrabold text-white mb-2">Shake & Win!</h1>
        <p className="text-sm text-c-text-2">
          {state === 'idle' ? 'Tap the phone to shake and reveal your reward' : 'Keep shaking…'}
        </p>
      </motion.div>

      {/* Phone illustration */}
      <div className="relative mb-12">
        {/* Ripple rings */}
        {state === 'shaking' && [0.4, 0.7, 1].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-3xl border-2 border-c-purple/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, delay, repeat: Infinity }}
          />
        ))}

        <motion.button
          onClick={handleShake}
          disabled={state === 'shaking'}
          animate={state === 'shaking' ? {
            x: [0, -12, 14, -10, 12, -8, 10, 0],
            y: [0, 8, -6, 10, -8, 6, -4, 0],
            rotate: [0, -8, 10, -6, 8, -4, 6, 0],
          } : {}}
          transition={state === 'shaking' ? { duration: 0.4, repeat: Infinity } : {}}
          whileTap={state === 'idle' ? { scale: 0.94 } : {}}
          className="relative w-44 h-72 rounded-3xl glass-purple border border-c-purple/40 flex flex-col items-center justify-center gap-4"
          style={{ boxShadow: state === 'shaking' ? '0 0 60px rgba(139,92,246,0.5)' : '0 0 30px rgba(139,92,246,0.2)' }}
        >
          {/* Phone notch */}
          <div className="absolute top-4 w-20 h-1.5 bg-white/20 rounded-full" />

          <AnimatePresence mode="wait">
            {state === 'idle' ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-6xl">🤳</div>
                <p className="text-xs text-c-text-2 mt-3 font-medium">Tap to shake</p>
              </motion.div>
            ) : (
              <motion.div key="shaking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="text-5xl"
                >
                  🎁
                </motion.div>
                <div className="flex gap-1 mt-2">
                  {[0,1,2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-c-purple-l"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.4, delay: i * 0.13, repeat: Infinity }}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/60 mt-1">Revealing…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {state === 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-xs text-white/30">Win probability: 65% · 2 plays per user</p>
        </motion.div>
      )}

      <button onClick={() => router.push('/customer')} className="mt-8 text-xs text-white/30 hover:text-white/60 transition-colors">
        ← Back to games
      </button>
    </div>
  )
}
