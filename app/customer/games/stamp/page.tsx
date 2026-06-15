'use client'
import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'

const TOTAL            = 10
const CURRENT_STAMPS   = 3
const REWARD_POSITIONS = [4, 6, 8, 10]
const BIG_REWARD_POS   = 10
const REWARDS = {
  4:  { reward: 'Free Espresso',         emoji: '☕', type: 'surprise' },
  6:  { reward: '15% Off Next Visit',    emoji: '🏷️', type: 'surprise' },
  8:  { reward: 'Free Croissant',        emoji: '🥐', type: 'surprise' },
  10: { reward: 'Free Breakfast Combo',  emoji: '🍳', type: 'grand'    },
} as const

type State = 'card' | 'surprise' | 'big-win'

function StampCardInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [stamps, setStamps]                 = useState(CURRENT_STAMPS)
  const [state, setState]                   = useState<State>('card')
  const [lastStamp, setLastStamp]           = useState<number | null>(null)
  const [surpriseReward, setSurpriseReward] = useState<{ reward: string; emoji: string } | null>(null)
  const didAutoStamp = useRef(false)

  useEffect(() => {
    if (searchParams.get('stamp') !== '1' || didAutoStamp.current || CURRENT_STAMPS >= TOTAL) return
    didAutoStamp.current = true
    const newCount = CURRENT_STAMPS + 1
    setStamps(newCount)
    setLastStamp(newCount)
    if (newCount === BIG_REWARD_POS) {
      setTimeout(() => setState('big-win'), 950)
    } else if ((REWARD_POSITIONS as readonly number[]).includes(newCount)) {
      setSurpriseReward(REWARDS[newCount as keyof typeof REWARDS] ?? { reward: 'Mystery Treat', emoji: '🎁' })
      setTimeout(() => setState('surprise'), 950)
    }
    setTimeout(() => setLastStamp(null), 1400)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'big-win')
    return <WinCelebration reward={REWARDS[10].reward} emoji={REWARDS[10].emoji} hidePlayAgain onClose={() => setState('card')} />
  if (state === 'surprise' && surpriseReward)
    return <WinCelebration reward={surpriseReward.reward} emoji={surpriseReward.emoji} hidePlayAgain onClose={() => setState('card')} />

  const justStamped = searchParams.get('stamp') === '1'

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-24 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)', filter: 'blur(48px)' }} />
      <div className="absolute bottom-40 -left-20 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Back — top-left overlay */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      {/* Ambient label */}
      <p className="absolute top-14 right-4 text-[10px] text-white/30 z-20">Amber Cafe · Stamp Card</p>

      <div className="flex-1 flex flex-col justify-center relative z-10 mt-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-1">☕ Stamp Card</h1>
          <p className="text-sm text-white/40">
            {justStamped ? '✓ Stamp collected! More surprises await.' : 'Visit and collect stamps to unlock surprises'}
          </p>
        </div>

        {/* Physical card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 28px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,158,11,0.25)' }}
        >
          {/* Amber header */}
          <div className="relative px-5 py-5 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' }}>
            <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[80px] opacity-[0.10] select-none pointer-events-none leading-none">☕</span>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] mb-0.5">Loyalty Card</p>
                <p className="text-xl font-extrabold text-black/75">Amber Cafe</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-black/35 font-bold uppercase tracking-wide mb-0.5">Stamps</p>
                <p className="text-4xl font-black text-black/65 leading-none">
                  {stamps}<span className="text-base font-semibold text-black/30">/{TOTAL}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Perforated separator */}
          <div className="h-0" style={{ borderTop: '2px dashed rgba(245,158,11,0.35)' }} />

          {/* Stamp grid */}
          <div className="bg-white px-5 pt-6 pb-5">
            <div className="grid grid-cols-5 gap-2.5 mb-5">
              {Array.from({ length: TOTAL }, (_, i) => {
                const n           = i + 1
                const isFilled    = n <= stamps
                const isNew       = n === lastStamp
                const isReward    = (REWARD_POSITIONS as readonly number[]).includes(n)
                const isBigReward = n === BIG_REWARD_POS
                return (
                  <div key={n} className="flex flex-col items-center justify-center relative">
                    <div className="relative w-[48px] h-[48px] mb-1">
                      {isNew && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none"
                          initial={{ scale: 1, opacity: 0.9 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.65, ease: 'easeOut' }}
                        />
                      )}
                      <AnimatePresence mode="wait">
                        {isFilled ? (
                          <motion.div
                            key={`on-${n}`}
                            className="absolute inset-0 rounded-full flex items-center justify-center text-xl select-none"
                            style={{
                              background: isBigReward
                                ? 'linear-gradient(145deg, #F59E0B, #D97706)'
                                : 'linear-gradient(145deg, #F59E0B, #B45309)',
                              boxShadow: isBigReward
                                ? '0 6px 20px rgba(245,158,11,0.6)'
                                : '0 4px 14px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                              border: isBigReward ? '2px solid #F59E0B' : 'none',
                            }}
                            initial={isNew ? { scale: 0, rotate: -18 } : false}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={isNew ? { type: 'spring', stiffness: 320, damping: 11 } : { duration: 0 }}
                          >
                            {isBigReward ? '🏆' : '☕'}
                          </motion.div>
                        ) : (
                          /* Sealed stamp — mystery */
                          <motion.div
                            key={`off-${n}`}
                            className="absolute inset-0 rounded-full flex items-center justify-center"
                            style={{ background: '#E5E7EB' }}
                          >
                            <span className="text-[13px] font-bold text-gray-400 select-none">?</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="text-[10px] font-bold text-gray-600">{n}</div>
                    {/* Green dot on collected reward stamps */}
                    {isReward && isFilled && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                        style={{ background: '#10B981' }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-center text-gray-500">
              {stamps === TOTAL
                ? '🎉 Card complete! Redeem your grand reward!'
                : `${stamps} collected · ${TOTAL - stamps} more surprises await 🎁`}
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 flex items-center justify-between"
            style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
            <span className="font-mono text-[9px] text-gray-300 tracking-wider">LG-AMBER-2026</span>
            <span className="text-[9px] text-gray-300">Collect · Surprise · Repeat</span>
          </div>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-white/25 mt-6"
        >
          Visit the business and ask the staff for a code to earn stamps
        </motion.p>
      </div>
    </div>
  )
}

export default function StampCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <StampCardInner />
    </Suspense>
  )
}
