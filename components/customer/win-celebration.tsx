'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const CONFETTI_COLORS = ['#7C3AED', '#F5C518', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#A78BFA', '#FDE68A']

type ConfettiShape = { w: number; h: number }

function getShape(i: number): ConfettiShape {
  if (i % 3 === 0) return { w: 6, h: 4 }   // small rectangle
  if (i % 3 === 1) return { w: 5, h: 5 }   // tiny square
  return { w: 10, h: 2 }                    // thin strip
}

function Confetti() {
  const wave1 = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.4,
    duration: 2 + Math.random() * 2,
    rotate: Math.random() * 360,
    shape: getShape(i),
  }))

  const wave2 = Array.from({ length: 40 }, (_, i) => ({
    id: i + 40,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[(i + 3) % CONFETTI_COLORS.length],
    delay: 0.5 + Math.random() * 0.4,
    duration: 2 + Math.random() * 2,
    rotate: Math.random() * 360,
    shape: getShape(i + 1),
  }))

  const pieces = [...wave1, ...wave2]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: p.rotate }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute"
          style={{ width: p.shape.w, height: p.shape.h, background: p.color, borderRadius: 1 }}
        />
      ))}
    </div>
  )
}

interface WinCelebrationProps {
  reward: string
  emoji?: string
  /** Image path shown instead of the emoji, e.g. "/spin-wheel-icon.png" */
  iconSrc?: string
  code?: string
  businessName?: string
  hidePlayAgain?: boolean
  onClose?: () => void
  /** Mechanic brand color pair (e.g. MECHANIC_META[type]) — tints the gradient backdrop and every highlight. Omit to fall back to the default purple. */
  accentFrom?: string
  accentTo?: string
}

export function WinCelebration({ reward, emoji = '🎁', iconSrc, code, hidePlayAgain, onClose, accentFrom, accentTo }: WinCelebrationProps) {
  const router = useRouter()
  const displayCode = code ?? `LG-WIN7`
  const accent = accentFrom ?? '#7C3AED'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, #FFFFFF 0%, ${accent}0F 55%, ${accent}1F 100%)` }}
    >
      <Confetti />
      <div className="relative z-10 text-center px-8 w-full max-w-sm mx-auto">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-xs font-bold tracking-widest uppercase mb-5"
          style={{ color: accent }}
        >
          🎉 YOU WON!
        </motion.p>

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.15, 1], rotate: [-20, 0] }}
          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
          className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-5 select-none"
          style={{ background: `${accent}12`, border: `2.5px solid ${accent}30` }}
        >
          {iconSrc ? (
            <img src={iconSrc} alt="" className="w-20 h-20" style={{ objectFit: 'contain' }} />
          ) : (
            <span className="text-6xl">{emoji}</span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 leading-tight">{reward}</h2>
          <p className="text-sm text-gray-500 mb-5">Added to your wallet</p>

          {/* Reward code box */}
          <div className="rounded-xl px-5 py-3 mb-3" style={{ background: `${accent}0D`, border: `1px solid ${accent}30` }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: `${accent}99` }}>Reward Code</p>
            <p className="font-mono text-xl font-black tracking-wider" style={{ color: accent }}>{displayCode}</p>
          </div>
          <p className="text-xs text-gray-400 mb-6">Show this code to the staff at the counter to redeem</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Link
            href="/customer/wallet"
            className="block w-full py-4 rounded-2xl font-bold text-base text-center text-white"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accentTo ?? accent})` }}
          >
            View in Wallet →
          </Link>
          <button
            className="block w-full py-3 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 text-sm text-center"
            onClick={() => router.back()}
          >
            ← Back to Business
          </button>
          {!hidePlayAgain && (
            <button
              className="block w-full py-2 text-gray-400 text-sm text-center"
              onClick={onClose}
            >
              Play Again
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export function NoWin({ onClose, accentTo }: { onClose?: () => void; accentTo?: string }) {
  const router = useRouter()
  const accent = accentTo ?? '#7C3AED'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, #FFFFFF 0%, ${accent}0F 55%, ${accent}1F 100%)` }}
    >
      <div className="text-center px-8 w-full max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 0.9, 1] }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className="text-6xl mb-5 select-none"
        >
          😔
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Not this time…</h2>
          <p className="text-sm text-gray-500 mb-2">Better luck on your next visit!</p>
          <p className="text-xs text-gray-400 mb-8">Every visit gives you a new chance to win 🍀</p>

          <button
            className="block w-full py-4 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 font-bold text-base text-center mb-3"
            onClick={() => { onClose?.(); router.back() }}
          >
            ← Back to Business
          </button>
          <Link
            href="/customer/home"
            className="block w-full py-2 text-sm text-center font-semibold"
            style={{ color: accent }}
          >
            See other campaigns
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
