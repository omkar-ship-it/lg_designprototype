'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface WinCelebrationProps {
  reward: string
  emoji?: string
  onClose?: () => void
}

const CONFETTI_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B']

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1,
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size * 0.6, background: p.color }}
        />
      ))}
    </div>
  )
}

export function WinCelebration({ reward, emoji = '🎁', onClose }: WinCelebrationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center customer-bg">
      <Confetti />
      <div className="relative z-10 text-center px-8">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
          className="text-8xl mb-6"
        >
          {emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-c-text-2 text-sm font-medium mb-2">You won!</p>
          <h2 className="text-3xl font-extrabold text-white mb-2 text-glow-gold">{reward}</h2>
          <p className="text-sm text-c-text-2 mb-8">Added to your wallet 🎉</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Link href="/customer/wallet" className="block w-full py-4 rounded-2xl bg-c-gold text-v-bg font-bold text-base text-center">
            View in Wallet →
          </Link>
          <Link href="/customer" className="block w-full py-3 rounded-2xl glass text-white text-sm text-center" onClick={onClose}>
            Back to Games
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export function NoWin({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center customer-bg">
      <div className="text-center px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className="text-7xl mb-6"
        >
          😔
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-extrabold text-white mb-2">Better luck next time!</h2>
          <p className="text-sm text-c-text-2 mb-8">Come back and try again</p>
          <Link href="/customer" className="block w-full py-4 rounded-2xl bg-c-purple text-white font-bold text-base text-center" onClick={onClose}>
            Back to Games
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
