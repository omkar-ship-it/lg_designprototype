'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

type State = 'idle' | 'rolling' | 'result'

const OUTCOMES: Record<number, string | null> = {
  1: null, 2: null, 3: 'Free Dessert 🍰', 4: '₹50 Off 🏷️', 5: null, 6: 'Free Dessert 🍰',
}

function DiceFaceSVG({ value }: { value: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {(dots[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#1A1840" />
      ))}
    </svg>
  )
}

export default function DicePage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [value, setValue] = useState(1)
  const [displayValue, setDisplayValue] = useState(1)
  const [won, setWon] = useState(false)
  const [wonReward, setWonReward] = useState('')

  const roll = () => {
    if (state !== 'idle') return
    setState('rolling')

    let count = 0
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(1 + Math.random() * 6))
      count++
      if (count > 14) {
        clearInterval(interval)
        const final = Math.floor(1 + Math.random() * 6)
        setValue(final)
        setDisplayValue(final)
        const reward = OUTCOMES[final]
        setWon(!!reward)
        setWonReward(reward || '')
        setTimeout(() => setState('result'), 800)
      }
    }, 120)
  }

  if (state === 'result' && won) return <WinCelebration reward={wonReward} emoji="🎲" />
  if (state === 'result' && !won) return <NoWin />

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-white mb-1">Roll a Dice!</h1>
        <p className="text-sm text-c-text-2">Roll 3, 4, or 6 to win a reward</p>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Shadow */}
        <div className="absolute -bottom-4 w-32 h-8 bg-black/30 blur-xl rounded-full" />

        <motion.button
          onClick={roll}
          disabled={state === 'rolling'}
          animate={state === 'rolling' ? {
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 180, 360, 540],
            rotateZ: [0, 45, -45, 90, 0],
          } : {}}
          transition={state === 'rolling' ? { duration: 1.8, ease: 'easeOut' } : {}}
          whileTap={state === 'idle' ? { scale: 0.92 } : {}}
          className="w-40 h-40 rounded-3xl bg-white flex items-center justify-center cursor-pointer select-none"
          style={{
            boxShadow: state === 'rolling'
              ? '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 40px rgba(139,92,246,0.5)'
              : '0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          <div className="w-28 h-28">
            <DiceFaceSVG value={displayValue} />
          </div>
        </motion.button>
      </div>

      {/* Win chart */}
      <div className="w-full glass rounded-2xl p-4">
        <p className="text-xs text-c-text-2 font-semibold mb-3 text-center">Prize Chart</p>
        <div className="grid grid-cols-6 gap-1.5">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className={`rounded-xl p-2 text-center ${OUTCOMES[n] ? 'bg-c-gold/10 border border-c-gold/25' : 'bg-white/5'}`}>
              <div className="w-8 h-8 mx-auto rounded-lg bg-white flex items-center justify-center mb-1">
                <div className="w-6 h-6"><DiceFaceSVG value={n} /></div>
              </div>
              <p className="text-[8px] text-center leading-tight" style={{ color: OUTCOMES[n] ? '#F5C518' : 'rgba(255,255,255,0.3)' }}>
                {OUTCOMES[n] ? '🎁 Win' : 'No win'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={roll}
        disabled={state === 'rolling'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold text-v-bg disabled:opacity-50 transition-all"
        style={{
          background: state === 'rolling' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #22C55E, #16A34A)',
          boxShadow: state !== 'rolling' ? '0 8px 32px rgba(34,197,94,0.35)' : 'none',
          color: state === 'rolling' ? 'white' : '#08071A',
        }}
      >
        {state === 'rolling' ? '🎲 Rolling…' : '🎲 Roll the Dice'}
      </motion.button>

      <button onClick={() => router.push('/customer')} className="text-xs text-white/30 hover:text-white/60 transition-colors">
        ← Back to games
      </button>
    </div>
  )
}
