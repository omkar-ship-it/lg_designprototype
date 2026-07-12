'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

type State = 'idle' | 'rolling' | 'announcing' | 'result'

const OUTCOMES: Record<number, string | null> = {
  1: null, 2: null, 3: 'Free Dessert 🍰', 4: '₹50 Off 🏷️', 5: null, 6: 'Free Dessert 🍰',
}

const SPARKLE_POS = [
  { top: '10%', left: '9%' }, { top: '18%', right: '10%' },
  { top: '42%', left: '4%' }, { top: '55%', right: '5%' },
  { bottom: '32%', left: '7%' }, { bottom: '24%', right: '9%' },
  { top: '72%', left: '13%' }, { top: '62%', right: '12%' },
]

const GHOST_DICE = [
  { top: '8%',  left: '5%',  size: 48, rotate: 15,  opacity: 0.06 },
  { top: '14%', right: '6%', size: 56, rotate: -20, opacity: 0.05 },
  { top: '36%', left: '2%',  size: 36, rotate: 35,  opacity: 0.04 },
  { top: '55%', right: '3%', size: 44, rotate: -10, opacity: 0.05 },
  { bottom: '28%', left: '6%',  size: 52, rotate: 25,  opacity: 0.06 },
  { bottom: '14%', right: '8%', size: 40, rotate: -30, opacity: 0.04 },
]

function DiceFaceSVG({ value, fillColor = '#0D0B1E' }: { value: number; fillColor?: string }) {
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
        <circle key={i} cx={cx} cy={cy} r="9" fill={fillColor} />
      ))}
    </svg>
  )
}

export default function DicePage() {
  const router = useRouter()
  const [state, setState]             = useState<State>('idle')
  const [displayValue, setDisplayValue] = useState(1)
  const [finalValue, setFinalValue]   = useState<number | null>(null)
  const [won, setWon]                 = useState(false)
  const [wonReward, setWonReward]     = useState('')

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
        setDisplayValue(final)
        setFinalValue(final)
        const reward = OUTCOMES[final]
        setWon(!!reward)
        setWonReward(reward || '')
        // Brief announce before full-screen result
        setTimeout(() => setState('announcing'), 600)
        setTimeout(() => setState('result'), 2000)
      }
    }, 120)
  }

  if (state === 'result' && won)
    return (
      <WinCelebration
        reward={wonReward} emoji="🎲" hidePlayAgain
        accentFrom="#16A34A" accentTo="#15803D"
        onClose={() => { setFinalValue(null); setState('idle') }}
      />
    )
  if (state === 'result' && !won)
    return <NoWin accentTo="#16A34A" onClose={() => { setFinalValue(null); setState('idle') }} />

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden bg-white"
    >
      {/* Ambient orbs */}
      <div className="absolute top-16 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)', filter: 'blur(56px)' }} />
      <div className="absolute bottom-32 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(48px)' }} />

      {/* Ghost dice */}
      {GHOST_DICE.map((g, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-xl bg-green-50 border border-green-100"
          style={{ ...(g.top ? { top: g.top } : { bottom: (g as { bottom: string }).bottom }),
                   ...(g.left ? { left: g.left } : { right: (g as { right: string }).right }),
                   width: g.size, height: g.size, opacity: g.opacity * 3, rotate: g.rotate }}
          animate={{ y: [0, -8, 0], rotate: [g.rotate, g.rotate + 6, g.rotate] }}
          transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        >
          <DiceFaceSVG value={(i % 6) + 1} fillColor="rgba(34,197,94,0.55)" />
        </motion.div>
      ))}

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute text-green-400/40 pointer-events-none select-none" style={pos}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}>
          ✦
        </motion.div>
      ))}

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>
      <p className="absolute top-14 right-4 text-[10px] text-gray-400 z-20">Roll the Dice</p>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-6">
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-gray-900">Roll the Dice</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state === 'rolling' || state === 'announcing' ? '🎲 Rolling…' : 'Tap the dice to roll'}
          </p>
        </div>

        {/* Dice — tap to roll */}
        <div className="relative flex flex-col items-center justify-center" style={{ perspective: 600 }}>
          {/* Floor shadow */}
          <motion.div
            className="absolute -bottom-6 rounded-full pointer-events-none"
            style={{ background: 'rgba(34,197,94,0.12)', filter: 'blur(20px)' }}
            animate={state === 'rolling'
              ? { width: ['8rem', '5rem', '8rem'], height: ['1.5rem', '0.8rem', '1.5rem'] }
              : { width: '8rem', height: '1.5rem' }}
            transition={state === 'rolling' ? { duration: 0.4, repeat: 4, ease: 'easeInOut' } : {}}
          />

          {state === 'rolling' && (
            <motion.div
              className="absolute rounded-3xl pointer-events-none"
              style={{ width: 204, height: 204 }}
              animate={{ boxShadow: ['0 0 30px rgba(34,197,94,0.25)', '0 0 70px rgba(34,197,94,0.55)', '0 0 30px rgba(34,197,94,0.25)'] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <motion.button
            onClick={roll}
            disabled={state !== 'idle'}
            animate={state === 'rolling'
              ? { rotateX: [0, 360, 720, 1080], rotateY: [0, 270, 540, 810] }
              : {}}
            transition={state === 'rolling' ? { duration: 1.8, ease: 'easeOut' } : {}}
            whileTap={state === 'idle' ? { scale: 0.92 } : {}}
            className="w-48 h-48 rounded-3xl bg-white border border-gray-100 flex items-center justify-center cursor-pointer select-none"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: state === 'rolling'
                ? '0 24px 64px rgba(0,0,0,0.18), 0 0 40px rgba(34,197,94,0.3)'
                : '0 16px 48px rgba(0,0,0,0.12), 0 0 20px rgba(34,197,94,0.1)',
            }}
          >
            <div className="w-32 h-32">
              <DiceFaceSVG value={displayValue} />
            </div>
          </motion.button>
        </div>

        {/* Roll result announcement */}
        <AnimatePresence>
          {state === 'announcing' && finalValue !== null && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-5xl font-black text-gray-900 mb-1">{finalValue}</p>
              <p className="text-base font-bold" style={{ color: OUTCOMES[finalValue] ? '#16A34A' : '#9CA3AF' }}>
                {OUTCOMES[finalValue] ? `${OUTCOMES[finalValue]}! 🎉` : 'Not this time…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {state === 'idle' && (
          <p className="text-xs text-gray-400 text-center">Tap the dice to roll</p>
        )}
      </div>

      {/* Per-face prize chart */}
      <div className="w-full rounded-2xl p-4 z-10 bg-gray-50 border border-gray-200">
        <p className="text-xs text-gray-400 font-semibold mb-3 text-center uppercase tracking-wide">What each face wins</p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(n => {
            const reward = OUTCOMES[n]
            return (
              <div key={n}
                className="rounded-xl p-2.5 flex flex-col items-center gap-1.5"
                style={{
                  background: reward ? 'rgba(34,197,94,0.08)' : 'white',
                  border: reward ? '1px solid rgba(34,197,94,0.3)' : '1px solid #E5E7EB',
                }}>
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                  <div className="w-6 h-6"><DiceFaceSVG value={n} /></div>
                </div>
                <p className="text-[9px] font-bold text-center leading-tight"
                  style={{ color: reward ? '#16A34A' : '#9CA3AF' }}>
                  {reward ? reward.split(' ')[0] : 'No win'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
