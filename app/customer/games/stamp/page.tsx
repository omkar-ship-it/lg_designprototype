'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'

const TOTAL = 8
const CURRENT_STAMPS = 2
const SURPRISE_POSITIONS = [3, 6]
const BIG_REWARD_POS = 8
const REWARDS: Record<number, { reward: string; emoji: string }> = {
  3: { reward: 'Free Coffee',           emoji: '⭐' },
  6: { reward: '20% Off Your Bill',     emoji: '⭐' },
  8: { reward: 'Free Signature Breakfast', emoji: '🏆' },
}

type State = 'card' | 'entering-code' | 'surprise' | 'big-win'

export default function StampCardPage() {
  const router = useRouter()
  const [stamps, setStamps]         = useState(CURRENT_STAMPS)
  const [state, setState]           = useState<State>('card')
  const [lastStamp, setLastStamp]   = useState<number | null>(null)
  const [surpriseReward, setSurpriseReward] = useState<{ reward: string; emoji: string } | null>(null)
  const [code, setCode]             = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const openCodeModal = () => {
    if (stamps >= TOTAL) return
    setState('entering-code')
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const redeemCode = () => {
    if (code.replace(/[^a-zA-Z0-9]/g, '').length < 4) return
    const newCount = stamps + 1
    setStamps(newCount)
    setLastStamp(newCount)
    setCode('')
    setState('card') // close sheet immediately — stamp animates in

    if (newCount === BIG_REWARD_POS) {
      setTimeout(() => setState('big-win'), 950)
    } else if (SURPRISE_POSITIONS.includes(newCount)) {
      setSurpriseReward(REWARDS[newCount] ?? { reward: 'Mystery Treat', emoji: '🎁' })
      setTimeout(() => setState('surprise'), 950)
    }
    setTimeout(() => setLastStamp(null), 1400)
  }

  if (state === 'big-win') {
    return <WinCelebration reward={REWARDS[BIG_REWARD_POS].reward} emoji={REWARDS[BIG_REWARD_POS].emoji} />
  }
  if (state === 'surprise' && surpriseReward) {
    return <WinCelebration reward={surpriseReward.reward} emoji={surpriseReward.emoji} onClose={() => setState('card')} />
  }

  const pct = (stamps / TOTAL) * 100
  const codeValid = code.replace(/[^a-zA-Z0-9]/g, '').length >= 4

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm mb-8 self-start"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Stamp Card</h1>
        <p className="text-sm text-white/40">Visit. Stamp. Discover what you've unlocked.</p>
      </div>

      {/* ── Physical card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 28px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,158,11,0.25)' }}
      >
        {/* Amber header */}
        <div
          className="relative px-5 py-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' }}
        >
          {/* Watermark */}
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[80px] opacity-[0.10] select-none pointer-events-none leading-none">
            ☕
          </span>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] mb-0.5">Loyalty Card</p>
              <p className="text-xl font-extrabold text-black/75">Amber Cafe</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-black/35 font-bold uppercase tracking-wide mb-0.5">Stamps</p>
              <p className="text-4xl font-black text-black/65 leading-none">
                {stamps}
                <span className="text-base font-semibold text-black/30">/{TOTAL}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Perforated separator */}
        <div
          className="h-0 mx-0 relative"
          style={{ borderTop: '2px dashed rgba(245,158,11,0.35)' }}
        />

        {/* White stamp area */}
        <div className="bg-white px-5 pt-6 pb-5">
          <div className="grid grid-cols-4 gap-3 mb-5">
            {Array.from({ length: TOTAL }, (_, i) => {
              const n = i + 1
              const isFilled  = n <= stamps
              const isNew     = n === lastStamp

              return (
                <div key={n} className="flex items-center justify-center">
                  <div className="relative w-[58px] h-[58px]">

                    {/* Ink ripple ring on new stamp */}
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
                          className="absolute inset-0 rounded-full flex items-center justify-center text-2xl select-none"
                          style={{
                            background: 'linear-gradient(145deg, #F59E0B, #B45309)',
                            boxShadow: '0 4px 14px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                          }}
                          initial={isNew ? { scale: 0, rotate: -18 } : false}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={
                            isNew
                              ? { type: 'spring', stiffness: 320, damping: 11 }
                              : { duration: 0 }
                          }
                        >
                          ☕
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`off-${n}`}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: '#F9FAFB',
                            border: '2px dashed #E5E7EB',
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F59E0B, #B45309)' }}
              initial={{ width: `${(CURRENT_STAMPS / TOTAL) * 100}%` }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
            />
          </div>
          <p className="text-[11px] text-center text-gray-400">
            {stamps === TOTAL ? 'Card complete! 🎉' : `${TOTAL - stamps} more stamp${TOTAL - stamps !== 1 ? 's' : ''} to your next surprise`}
          </p>
        </div>

        {/* Card footer */}
        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}
        >
          <span className="font-mono text-[9px] text-gray-300 tracking-wider">LG-AMBER-2026</span>
          <span className="text-[9px] text-gray-300">Collect · Redeem · Repeat</span>
        </div>
      </motion.div>

      <div className="flex-1" />

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={stamps >= TOTAL ? undefined : openCodeModal}
        disabled={stamps >= TOTAL}
        className="w-full py-5 rounded-2xl text-base font-bold transition-all disabled:opacity-50 mt-8"
        style={{
          background: stamps >= TOTAL ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #F5C518, #F59E0B)',
          color: stamps >= TOTAL ? 'white' : '#08071A',
          boxShadow: stamps >= TOTAL ? 'none' : '0 8px 32px rgba(245,197,24,0.35)',
        }}
        animate={
          stamps < TOTAL
            ? { boxShadow: ['0 8px 32px rgba(245,197,24,0.3)', '0 8px 52px rgba(245,197,24,0.6)', '0 8px 32px rgba(245,197,24,0.3)'] }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {stamps >= TOTAL ? 'Card Complete! 🎉' : '✦ Get Stamp'}
      </motion.button>

      {/* ── Code entry sheet ───────────────────────────────────── */}
      <AnimatePresence>
        {state === 'entering-code' && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setState('card')}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto z-50 rounded-t-3xl overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #1E0A5C 0%, #0D0B1E 100%)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="px-6 pt-5 pb-10">
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🧾</div>
                  <h3 className="text-lg font-extrabold text-white mb-1">Enter Visit Code</h3>
                  <p className="text-sm text-white/35">Ask the staff for today's code</p>
                </div>

                <input
                  ref={inputRef}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && redeemCode()}
                  maxLength={10}
                  placeholder="ABC-123"
                  className="w-full rounded-2xl px-4 py-4 text-center text-2xl font-mono font-black text-white placeholder:text-white/15 outline-none mb-4 tracking-widest"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: codeValid
                      ? '1.5px solid rgba(245,158,11,0.7)'
                      : '1.5px solid rgba(255,255,255,0.1)',
                    transition: 'border-color 0.2s ease',
                  }}
                />

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={redeemCode}
                  disabled={!codeValid}
                  className="w-full py-4 rounded-2xl font-bold text-sm disabled:opacity-30 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #F5C518, #F59E0B)',
                    color: '#08071A',
                    boxShadow: codeValid ? '0 6px 24px rgba(245,197,24,0.35)' : 'none',
                  }}
                >
                  Stamp It ✦
                </motion.button>

                <button
                  onClick={() => setState('card')}
                  className="w-full mt-3 py-3 text-white/30 text-sm hover:text-white/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
