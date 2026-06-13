'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WinCelebration } from '@/components/customer/win-celebration'

const TOTAL = 10
const SURPRISE_RANGE = [4, 6]
const BIG_REWARD_POS = 10
const CURRENT_STAMPS = 3 // user already has 3 stamps

type State = 'card' | 'stamped' | 'surprise' | 'big-win'

export default function StampCardPage() {
  const router = useRouter()
  const [stamps, setStamps] = useState(CURRENT_STAMPS)
  const [state, setState] = useState<State>('card')
  const [lastStamp, setLastStamp] = useState<number | null>(null)
  const [surpriseReward, setSurpriseReward] = useState('')

  const addStamp = () => {
    if (state !== 'card' && state !== 'stamped') return
    const newCount = stamps + 1
    setStamps(newCount)
    setLastStamp(newCount)

    if (newCount === BIG_REWARD_POS) {
      setTimeout(() => setState('big-win'), 800)
    } else if (newCount >= SURPRISE_RANGE[0] && newCount <= SURPRISE_RANGE[1] && Math.random() > 0.4) {
      setSurpriseReward('Mystery Treat 🎁')
      setTimeout(() => setState('surprise'), 600)
    } else {
      setState('stamped')
      setTimeout(() => setState('card'), 1500)
    }
  }

  if (state === 'big-win') return <WinCelebration reward="Free Breakfast Combo 🍳" emoji="🏆" />
  if (state === 'surprise') return <WinCelebration reward={surpriseReward} emoji="🎁" />

  return (
    <div className="min-h-screen flex flex-col px-5 pt-12 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Loyalty Stamp Card</h1>
        <p className="text-sm text-c-text-2">Collect all {TOTAL} stamps for the big reward!</p>
      </div>

      {/* Progress */}
      <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div>
          <div className="text-2xl font-black text-white">{stamps}<span className="text-c-text-2 text-base font-medium">/{TOTAL}</span></div>
          <p className="text-xs text-c-text-2 mt-0.5">stamps collected</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-c-text-2">Next reward at</p>
          <p className="text-sm font-bold text-c-gold">stamp {stamps < SURPRISE_RANGE[0] ? `${SURPRISE_RANGE[0]}–${SURPRISE_RANGE[1]}` : BIG_REWARD_POS} 🎯</p>
        </div>
      </div>

      {/* Stamp grid */}
      <div className="grid grid-cols-5 gap-2.5 mb-8">
        {Array.from({ length: TOTAL }, (_, i) => {
          const n = i + 1
          const isFilled = n <= stamps
          const isSurpriseRange = n >= SURPRISE_RANGE[0] && n <= SURPRISE_RANGE[1]
          const isBig = n === BIG_REWARD_POS
          const isJustStamped = n === lastStamp && state === 'stamped'

          return (
            <motion.div
              key={n}
              className={`aspect-square rounded-2xl flex items-center justify-center text-xl border-2 transition-all ${
                isBig
                  ? isFilled ? 'border-c-gold bg-c-gold/20' : 'border-c-gold/40 bg-c-gold/8'
                  : isSurpriseRange
                  ? isFilled ? 'border-c-purple bg-c-purple/20' : 'border-c-purple/40 bg-c-purple/8'
                  : isFilled ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <AnimatePresence mode="wait">
                {isFilled ? (
                  <motion.span
                    key={`filled-${n}`}
                    className={isJustStamped ? 'stamp-animate' : ''}
                    initial={isJustStamped ? { scale: 0 } : { scale: 1 }}
                    animate={{ scale: 1 }}
                  >
                    {isBig ? '🏆' : isSurpriseRange ? '⭐' : '✓'}
                  </motion.span>
                ) : (
                  <motion.span key={`empty-${n}`} className="text-white/20 text-sm font-bold">
                    {isBig ? '🏆' : isSurpriseRange ? '?' : n}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-8 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-c-purple/50 inline-block bg-c-purple/10" />
          Surprise drop (stamps {SURPRISE_RANGE[0]}–{SURPRISE_RANGE[1]})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-c-gold/50 inline-block bg-c-gold/10" />
          Big reward
        </span>
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={addStamp}
        disabled={stamps >= TOTAL || (state !== 'card' && state !== 'stamped')}
        className="w-full py-5 rounded-2xl text-base font-bold text-white transition-all disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
        }}
      >
        {stamps >= TOTAL ? '🎉 Card Complete!' : `Get Stamp #${stamps + 1} 🎯`}
      </motion.button>

      <p className="text-center text-xs text-white/25 mt-4">Enter staff PIN to earn each stamp</p>

      <button onClick={() => router.push('/customer')} className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors mx-auto block">
        ← Back to games
      </button>
    </div>
  )
}
