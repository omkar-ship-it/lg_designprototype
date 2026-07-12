'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

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
 * one flat card + one tap, no rubbing/dragging/summoning animation. Light
 * background (white, tinted with a whisper of the mechanic's own campaign
 * color) rather than a saturated gradient, matching the light theme used
 * everywhere else in the app — the accent color still carries through in
 * the reward card, button, and every child element, just without painting
 * the whole screen in it.
 */
export function ClaimReward({ title, businessName, emoji, rewardLabel, description, accentFrom, accentTo, onClaim, children }: ClaimRewardProps) {
  const router = useRouter()

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, #FFFFFF 0%, ${accentFrom}0F 55%, ${accentFrom}1F 100%)` }}
    >
      <div className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentFrom}18 0%, transparent 70%)` }} />

      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
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
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-500 text-base">{businessName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs rounded-3xl p-6 mb-4"
          style={{ background: `${accentFrom}0D`, border: `1px solid ${accentFrom}30` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accentFrom}99` }}>Your Reward</p>
          <p className="text-3xl font-black mb-2" style={{ color: accentFrom }}>{rewardLabel}</p>
          {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
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
          className="w-full py-5 rounded-2xl text-lg font-extrabold text-center text-white"
          style={{
            background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
            boxShadow: `0 8px 32px ${accentFrom}45`,
          }}
        >
          Claim Reward
        </motion.button>
      </motion.div>
    </div>
  )
}
