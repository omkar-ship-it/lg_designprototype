'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

type State = 'idle' | 'rolling' | 'result'

const OUTCOMES: Record<number, string | null> = {
  1: null, 2: null, 3: 'Free Dessert 🍰', 4: '₹50 Off 🏷️', 5: null, 6: 'Free Dessert 🍰',
}

const SPARKLE_POS = [
  { top: '10%', left: '9%' }, { top: '18%', right: '10%' },
  { top: '42%', left: '4%' }, { top: '55%', right: '5%' },
  { bottom: '32%', left: '7%' }, { bottom: '24%', right: '9%' },
  { top: '72%', left: '13%' }, { top: '62%', right: '12%' },
]

// Ghost dice floating in background
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
  const [state, setState]         = useState<State>('idle')
  const [displayValue, setDisplayValue] = useState(1)
  const [won, setWon]             = useState(false)
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
        setDisplayValue(final)
        const reward = OUTCOMES[final]
        setWon(!!reward)
        setWonReward(reward || '')
        setTimeout(() => setState('result'), 800)
      }
    }, 120)
  }

  if (state === 'result' && won)  return <WinCelebration reward={wonReward} emoji="🎲" />
  if (state === 'result' && !won) return <NoWin />

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #071A0D 0%, #0A2614 40%, #0D0B1E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-16 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)', filter: 'blur(56px)' }} />
      <div className="absolute bottom-32 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(48px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Ghost dice in background */}
      {GHOST_DICE.map((g, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-xl bg-white"
          style={{ ...(g.top ? { top: g.top } : { bottom: (g as { bottom: string }).bottom }),
                   ...(g.left ? { left: g.left } : { right: (g as { right: string }).right }),
                   width: g.size, height: g.size, opacity: g.opacity, rotate: g.rotate }}
          animate={{ y: [0, -8, 0], rotate: [g.rotate, g.rotate + 6, g.rotate] }}
          transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        >
          <DiceFaceSVG value={(i % 6) + 1} fillColor="rgba(34,197,94,0.8)" />
        </motion.div>
      ))}

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute text-green-300/20 pointer-events-none select-none" style={pos}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}>
          ✦
        </motion.div>
      ))}

      {/* Campaign Details Card */}
      <div className="w-full px-5 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">🎲 Lucky Dice</h2>
              <p className="text-xs text-white/50 mt-0.5">Roll and match to win</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#10B981', color: '#fff' }}>LIVE</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-white/40 mb-1">Win Rate</p>
              <p className="text-white font-bold">50% chance</p>
            </div>
            <div>
              <p className="text-white/40 mb-1\">Duration</p>
              <p className="text-white font-medium text-sm\">Jul 1–31</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Joined</p>
              <p className="text-white font-medium\">328 players</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Back */}
      <div className="w-full flex items-center px-5 mb-2 z-10">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="text-center z-10 mb-4">
        <h1 className="text-xl font-extrabold text-white">Roll the Dice</h1>
        <p className="text-sm text-white/50 mt-1">
          {state === 'rolling' ? '🎲 Rolling…' : 'Roll 3, 4, or 6 to win a reward'}
        </p>
      </div>

      {/* Dice */}
      <div className="relative flex flex-col items-center justify-center z-10" style={{ perspective: 600 }}>
        {/* Floor shadow */}
        <motion.div
          className="absolute -bottom-6 rounded-full pointer-events-none"
          style={{ background: 'rgba(34,197,94,0.12)', filter: 'blur(20px)' }}
          animate={state === 'rolling'
            ? { width: ['8rem', '5rem', '8rem'], height: ['1.5rem', '0.8rem', '1.5rem'] }
            : { width: '8rem', height: '1.5rem' }}
          transition={state === 'rolling' ? { duration: 0.4, repeat: 4, ease: 'easeInOut' } : {}}
        />

        {/* Glow ring around dice */}
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
          disabled={state === 'rolling'}
          animate={state === 'rolling'
            ? { rotateX: [0, 360, 720, 1080], rotateY: [0, 270, 540, 810] }
            : {}}
          transition={state === 'rolling' ? { duration: 1.8, ease: 'easeOut' } : {}}
          whileTap={state === 'idle' ? { scale: 0.92 } : {}}
          className="w-48 h-48 rounded-3xl bg-white flex items-center justify-center cursor-pointer select-none"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: state === 'rolling'
              ? '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 40px rgba(34,197,94,0.4)'
              : '0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 20px rgba(34,197,94,0.15)',
          }}
        >
          <div className="w-32 h-32">
            <DiceFaceSVG value={displayValue} />
          </div>
        </motion.button>
      </div>

      {/* Prize chart */}
      <div className="w-full rounded-2xl p-4 z-10"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
        <p className="text-xs text-white/40 font-semibold mb-3 text-center uppercase tracking-wide">Prize Chart</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { faces: [1, 2, 5], label: 'No win', isWin: false },
            { faces: [3, 4],    label: '3 & 4 Win!', isWin: true },
            { faces: [6],       label: '6 Wins!',  isWin: true },
          ].map((group, gi) => (
            <div key={gi}
              className="rounded-xl p-3 text-center"
              style={{ background: group.isWin ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                       border: group.isWin ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent' }}>
              <div className="flex gap-1 justify-center mb-2 flex-wrap">
                {group.faces.map(n => (
                  <div key={n} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <div className="w-6 h-6"><DiceFaceSVG value={n} /></div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold leading-tight"
                style={{ color: group.isWin ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
                {group.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={roll}
        disabled={state === 'rolling'}
        className="w-full py-5 rounded-2xl text-xl font-extrabold transition-all disabled:opacity-50 z-10"
        style={{
          background: state === 'rolling' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #22C55E, #16A34A)',
          color: state === 'rolling' ? 'white' : '#071A0D',
          boxShadow: state !== 'rolling' ? '0 8px 32px rgba(34,197,94,0.4)' : 'none',
        }}
        animate={state === 'idle'
          ? { boxShadow: ['0 8px 32px rgba(34,197,94,0.3)', '0 8px 52px rgba(34,197,94,0.6)', '0 8px 32px rgba(34,197,94,0.3)'] }
          : {}}
        transition={{ duration: 1.8, repeat: state === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
      >
        {state === 'rolling' ? '🎲 Rolling…' : '🎲 Roll the Dice'}
      </motion.button>
    </div>
  )
}
