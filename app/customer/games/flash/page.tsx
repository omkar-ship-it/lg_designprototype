'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Zap } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'

const BUSINESS_NAME = 'Iron Forge'
const BUSINESS_EMOJI = '🏋️'
const REWARD_LABEL = '30% Off'
const REWARD_EMOJI = '⚡'
const CLAIM_BEFORE = '2026-06-15'
const REDEEM_BEFORE = '2026-06-18'
const TOTAL_SLOTS = 50
const CLAIMED = 41
const TERMS = 'Valid today only, while spots last. One redemption per member. Show this screen at the front desk to redeem.'

type State = 'idle' | 'confirming' | 'earned'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FlashDealPage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')

  const handleClaim = () => {
    if (state !== 'idle') return
    setState('confirming')
    setTimeout(() => setState('earned'), 900)
  }

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain />
  }

  const remaining = TOTAL_SLOTS - CLAIMED

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1E3A8A 0%, #2563EB 50%, #1E1B4B 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.35) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)', filter: 'blur(48px)' }} />

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
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center"
          >
            <span className="flex items-center gap-1.5 text-white/70 text-base font-semibold mb-1">
              <Zap className="w-4 h-4" /> Flash Deal
            </span>
            <h1 className="text-3xl font-extrabold text-white mb-3 text-center drop-shadow-lg">
              {BUSINESS_NAME} {BUSINESS_EMOJI}
            </h1>

            {/* Urgency chip */}
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white mb-4">
              {remaining} spot{remaining !== 1 ? 's' : ''} remaining · {CLAIMED}/{TOTAL_SLOTS} claimed
            </span>

            {/* Claim / redeem window */}
            <div className="w-full max-w-xs mb-4 rounded-2xl px-4 py-3.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                <CalendarDays className="w-3.5 h-3.5 text-white/50 shrink-0" />
                <span>Claim before <span className="font-bold text-white">{fmtDate(CLAIM_BEFORE)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <CalendarDays className="w-3.5 h-3.5 text-white/50 shrink-0" />
                <span>Redeem before <span className="font-bold text-white">{fmtDate(REDEEM_BEFORE)}</span></span>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="w-full max-w-xs mb-8 rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.12)' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
              <p className="text-[11px] text-white/60 leading-relaxed">{TERMS}</p>
            </div>

            {/* Claim button */}
            <motion.button
              onClick={handleClaim}
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
              Tap to claim this spot
            </p>
            <p className="text-xs text-white/40">You will get {REWARD_LABEL}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
