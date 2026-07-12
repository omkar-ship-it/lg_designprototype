'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { hexMix } from '@/lib/utils'

interface ClaimRewardProps {
  /** Mechanic title shown large, e.g. "Buy X Get Y" */
  title: string
  /** Business name (with emoji already composed in, e.g. "The Daily Grind ☕") */
  businessName: string
  /** Large hero emoji — the reward/mechanic emoji */
  emoji: string
  rewardLabel: string
  description?: string
  accentFrom: string
  accentTo: string
  onClaim: () => void
  /** Extra info shown between the reward card and the claim button — dates, spots, terms, etc. */
  children?: ReactNode
}

/**
 * The single "claim your reward" screen every campaign mechanic uses —
 * one flat card + one tap, no rubbing/dragging/summoning animation. The
 * whole screen (background, reward card, button) is tinted from the
 * mechanic's own campaign color so it stays visually tied to the rest
 * of that campaign's screens.
 */
export function ClaimReward({ title, businessName, emoji, rewardLabel, description, accentFrom, accentTo, onClaim, children }: ClaimRewardProps) {
  const router = useRouter()
  const glow = hexMix(accentFrom, '#FFFFFF', 0.25)
  const deep = hexMix(accentTo, '#000000', 0.35)
  const buttonFrom = hexMix(accentFrom, '#FFFFFF', 0.2)

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 55%, ${deep} 100%)` }}
    >
      <div className="absolute inset-x-0 top-0 h-96 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${glow}77 0%, transparent 70%)` }} />

      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-6 relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="text-7xl mb-4 select-none"
        >
          {emoji}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">{title}</h1>
          <p className="text-white/60 text-base">{businessName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs rounded-3xl p-6 mb-4"
          style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">Your Reward</p>
          <p className="text-3xl font-black text-white mb-2">{rewardLabel}</p>
          {description && <p className="text-sm text-white/75 leading-relaxed">{description}</p>}
        </motion.div>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs space-y-3"
          >
            {children}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-10 relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onClaim}
          className="w-full py-5 rounded-2xl text-lg font-extrabold text-center"
          style={{
            background: `linear-gradient(135deg, ${buttonFrom}, ${accentFrom})`,
            color: '#08071A',
            boxShadow: `0 8px 32px ${accentFrom}55`,
          }}
        >
          Claim Reward
        </motion.button>
      </motion.div>
    </div>
  )
}
