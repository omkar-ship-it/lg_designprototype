'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift } from 'lucide-react'
import Link from 'next/link'
import { hexToRgb, hexMix } from '@/lib/utils'

interface RubMeta {
  cardFrom: string
  cardTo: string
  badgeBg: string
  badgeText: string
  emoji: string
}

export interface RubClaimScreenProps {
  meta: RubMeta
  /** Shown under "Rub the lamp" before claiming, e.g. "Reveal your surprise discount code" */
  revealSubtitle: string
  /** Shown just above the reward card once claimed, e.g. "Here's Your Discount ✨" */
  claimedHeadline: string
  /** Business name with emoji composed in, e.g. "Happy Cafe ☕" */
  businessName: string
  /** Small pill inside the reward card, e.g. "10% Off" */
  rewardLabel: string
  /** Bold headline inside the reward card, e.g. "10% Off at Happy Cafe" */
  rewardTitle: string
  /** Small line under rewardTitle — a code, a condition, whatever the mechanic needs */
  rewardSubtitle?: string
  /** Render rewardSubtitle in a monospace/tracked style, for literal codes */
  rewardSubtitleMono?: boolean
  claimBefore: string
  redeemBefore: string
  available?: number
  terms?: string
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const R    = 95
const CX   = 110
const CY   = 110
const CONTAINER = 260

const STARS = [
  { x:  8, y: 10, s: 14, o: 0.38 },
  { x: 83, y:  8, s:  9, o: 0.26 },
  { x: 13, y: 35, s:  8, o: 0.20 },
  { x: 91, y: 29, s: 13, o: 0.30 },
  { x:  5, y: 61, s: 16, o: 0.24 },
  { x: 88, y: 52, s:  9, o: 0.18 },
  { x: 26, y: 79, s: 11, o: 0.15 },
  { x: 74, y: 77, s:  7, o: 0.20 },
  { x: 44, y:  8, s:  8, o: 0.15 },
  { x: 61, y: 16, s:  6, o: 0.17 },
  { x: 33, y: 52, s: 10, o: 0.18 },
  { x: 77, y: 43, s:  8, o: 0.14 },
  { x: 50, y: 88, s: 10, o: 0.16 },
  { x: 19, y: 69, s:  6, o: 0.14 },
  { x: 57, y: 62, s:  5, o: 0.12 },
]

type SmokeParticle = {
  id: number
  xOff: number
  xDrift: number
  yDrift: number
  size: number
  duration: number
  opacity: number
  color: string
}

type ConfettiPiece = {
  id: number
  x: number
  color: string
  rotation: number
  rotationEnd: number
  duration: number
  delay: number
  isStrip: boolean
  size: number
}

let particleCounter = 0

/**
 * The "rub the lamp" claim experience — a genie reveal in place of the plain
 * "Claim Reward" button. Shared across every claim-style mechanic (buyxgety,
 * coupon, flash, friend, groupunlock, combo) so each business/mechanic pairing
 * that opts into it is a thin wrapper supplying its own copy and reward data,
 * the same way ClaimReward's callers work.
 */
export function RubClaimScreen({
  meta, revealSubtitle, claimedHeadline, businessName, rewardLabel, rewardTitle,
  rewardSubtitle, rewardSubtitleMono, claimBefore, redeemBefore, available, terms,
}: RubClaimScreenProps) {
  const router = useRouter()
  const accentRgb = hexToRgb(meta.cardFrom).join(',')
  const deepRgb = hexToRgb(meta.cardTo).join(',')
  const lightAccent = hexMix(meta.cardFrom, '#FFFFFF', 0.45)
  const lightAccentRgb = hexToRgb(lightAccent).join(',')
  const confettiColors = [meta.cardFrom, meta.cardTo, '#67E8F9', '#A5F3FC', '#FBBF24', '#FFFFFF']

  const [claiming, setClaiming]         = useState(false)
  const [claimed, setClaimed]           = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showReward, setShowReward]     = useState(false)
  const [particles, setParticles]       = useState<SmokeParticle[]>([])
  const [genieVisible, setGenieVisible] = useState(false)
  const [ringClaimed, setRingClaimed]   = useState(false)
  const [pieces, setPieces]             = useState<ConfettiPiece[]>([])

  const firedRef = useRef(false)

  useEffect(() => {
    if (!showConfetti) return
    setPieces(Array.from({ length: 65 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      rotationEnd: Math.random() * 720 - 360,
      duration: 1.8 + Math.random() * 1.6,
      delay: Math.random() * 0.7,
      isStrip: Math.random() > 0.55,
      size: 5 + Math.floor(Math.random() * 9),
    })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfetti])

  const emitSmoke = useCallback((count: number, intensity: number) => {
    const smokeColors = [
      `rgba(${accentRgb},0.75)`,
      `rgba(${lightAccentRgb},0.70)`,
      'rgba(255,255,255,0.65)',
      'rgba(255,255,255,0.72)',
      `rgba(${deepRgb},0.55)`,
    ]
    const newParticles: SmokeParticle[] = Array.from({ length: count }, () => {
      particleCounter += 1
      const isBright = intensity > 70 && Math.random() > 0.5
      return {
        id:       particleCounter,
        xOff:     (Math.random() - 0.5) * 10,
        xDrift:   (Math.random() - 0.5) * 45,
        yDrift:   -(60 + Math.random() * 50),
        size:     (intensity > 60 ? 18 : 12) + Math.random() * 22,
        duration: 0.8 + Math.random() * 0.9,
        opacity:  0.5 + Math.random() * 0.38,
        color:    isBright ? `rgba(${lightAccentRgb},0.8)` : smokeColors[Math.floor(Math.random() * smokeColors.length)],
      }
    })
    setParticles(prev => [...prev, ...newParticles].slice(-32))
  }, [accentRgb, deepRgb, lightAccentRgb])

  const handleClaim = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true
    setClaiming(true)
    emitSmoke(28, 100)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([60, 30, 80, 30, 120, 30, 160])
    setTimeout(() => {
      setClaimed(true)
      setGenieVisible(true)
      setRingClaimed(true)
    }, 380)
    setTimeout(() => {
      setShowConfetti(true)
      setShowReward(true)
    }, 680)
  }, [emitSmoke])

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: `linear-gradient(160deg, #FFFFFF 0%, ${meta.cardFrom}0F 55%, ${meta.cardFrom}1F 100%)` }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o, fontSize: s.s, color: `rgba(${accentRgb},0.5)` }}
            animate={{ opacity: [s.o, s.o * 0.3, s.o], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.2 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      {showConfetti && pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`, top: '-20px',
                width: p.isStrip ? p.size / 2 : p.size,
                height: p.isStrip ? p.size * 3 : p.size,
                background: p.color, rotate: p.rotation,
                borderRadius: p.isStrip ? 1 : 2,
              }}
              animate={{ y: '110vh', rotate: p.rotationEnd }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>

      <div className="flex-1 flex flex-col items-center px-5 pt-20 pb-8 relative z-10">

        {/* Title */}
        <div className="text-center mb-6 min-h-[60px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {claimed ? (
              <motion.div
                key="claimed-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <p className="text-gray-900 text-[22px] font-bold leading-snug">🎉 Your reward is unlocked!</p>
                <p className="text-gray-500 text-sm mt-1.5">{businessName}</p>
              </motion.div>
            ) : (
              <motion.div key="claim-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-gray-900 text-[22px] font-bold leading-snug">
                  Rub the lamp
                </p>
                <p className="text-gray-500 text-sm mt-1.5">{revealSubtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lamp */}
        <div
          className="relative flex items-center justify-center mb-6"
          style={{ width: CONTAINER, height: CONTAINER }}
        >
          {/* Guide ring */}
          <svg
            viewBox="0 0 220 220"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="lampBloomWide" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="18" result="blur" />
                <feMerge><feMergeNode in="blur" /></feMerge>
              </filter>
              <filter id="lampBloomMed" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge><feMergeNode in="blur" /></feMerge>
              </filter>
              <filter id="lampRingGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor={meta.cardFrom} floodOpacity="1" />
              </filter>
            </defs>

            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={`rgba(${accentRgb},0.08)`} strokeWidth="22" />
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke={`rgba(${accentRgb},0.35)`} strokeWidth="1.5" strokeDasharray="7 9" />

            {ringClaimed && (
              <>
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(253,186,116,0.14)" strokeWidth="36"
                  filter="url(#lampBloomWide)" />
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(253,186,116,0.42)" strokeWidth="18"
                  filter="url(#lampBloomMed)" />
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke={meta.cardFrom} strokeWidth="7"
                  filter="url(#lampRingGlow)" />
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(254,215,170,0.92)" strokeWidth="2" />
              </>
            )}
          </svg>

          {/* Inner circle */}
          <motion.div
            className="absolute inset-3 rounded-full flex items-center justify-center overflow-visible"
            style={{
              background: `radial-gradient(circle at 40% 35%, rgba(${accentRgb},0.55) 0%, rgba(${deepRgb},0.85) 70%)`,
              boxShadow: ringClaimed
                ? `0 0 0 2px rgba(${accentRgb},0.70), 0 0 50px 20px rgba(${accentRgb},0.38), 0 0 100px 34px rgba(${deepRgb},0.22), inset 0 0 60px 20px rgba(253,186,116,0.14)`
                : claiming
                  ? `0 0 0 3px rgba(${accentRgb},0.5), 0 0 60px 22px rgba(${accentRgb},0.32), inset 0 0 40px 14px rgba(253,186,116,0.12)`
                  : `0 0 20px rgba(${deepRgb},0.14)`,
            }}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,80,40,0.13)', filter: 'blur(24px)', left: '8%', top: '18%' }} />
              <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,165,30,0.11)', filter: 'blur(20px)', right: '12%', bottom: '22%' }} />
              <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: 'rgba(253,186,116,0.22)', filter: 'blur(18px)', right: '22%', top: '12%' }} />
            </div>
            <AnimatePresence mode="wait">
              {genieVisible ? (
                <motion.div
                  key="genie"
                  initial={{ scale: 0, y: 30, opacity: 0 }}
                  animate={{ scale: [0, 1.18, 1], y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.05 }}
                >
                  <img
                    src="/genie.png"
                    alt="Genie"
                    style={{ width: 165, height: 'auto', objectFit: 'contain' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="lamp"
                  animate={claiming
                    ? { rotate: [-9, 9, -7, 7, -4, 4, 0], scale: [1, 1.06, 1] }
                    : { scale: [1, 1.02, 1] }
                  }
                  transition={claiming
                    ? { duration: 0.4, ease: 'easeInOut' }
                    : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    filter: claiming
                      ? `drop-shadow(0 0 14px rgba(${accentRgb},0.9)) drop-shadow(0 0 26px rgba(${accentRgb},0.5))`
                      : `drop-shadow(0 0 6px rgba(${accentRgb},0.35))`,
                  }}
                >
                  <img
                    src="/genie-lamp.png"
                    alt="Lamp"
                    style={{ width: 130, height: 'auto', objectFit: 'contain' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="absolute pointer-events-none overflow-visible"
              style={{ left: '20%', top: '42%' }}
            >
              <AnimatePresence>
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      background: p.color,
                      filter: 'blur(5px)',
                      marginLeft: -p.size / 2,
                      marginTop:  -p.size / 2,
                    }}
                    initial={{ x: p.xOff, y: 0, opacity: p.opacity, scale: 0.35 }}
                    animate={{ x: p.xOff + p.xDrift, y: p.yDrift, opacity: 0, scale: 2.6 }}
                    transition={{ duration: p.duration, ease: [0.15, 0, 0.4, 1] }}
                    onAnimationComplete={() => removeParticle(p.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Claim button */}
        <AnimatePresence>
          {!claimed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xs mb-5"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleClaim}
                disabled={claiming}
                className="w-full py-4 rounded-2xl text-base font-extrabold text-white disabled:opacity-70"
                style={{
                  background: `linear-gradient(135deg, ${lightAccent}, ${meta.cardFrom}, ${meta.cardTo})`,
                  boxShadow: `0 8px 32px rgba(${accentRgb},0.4)`,
                }}
                animate={!claiming
                  ? { boxShadow: [`0 8px 32px rgba(${accentRgb},0.3)`, `0 8px 48px rgba(${accentRgb},0.6)`, `0 8px 32px rgba(${accentRgb},0.3)`] }
                  : {}}
                transition={{ duration: 1.8, repeat: !claiming ? Infinity : 0, ease: 'easeInOut' }}
              >
                {claiming ? '✨ Claiming your reward…' : '🪔 Rub to Claim'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claimed headline */}
        <AnimatePresence>
          {claimed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-900 font-bold text-lg mb-4"
            >
              {claimedHeadline}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Reward card */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="w-full max-w-xs rounded-2xl p-4"
              style={{
                background: `${meta.cardFrom}0D`,
                border: `1px solid ${meta.cardFrom}30`,
                boxShadow: `0 8px 32px rgba(${accentRgb},0.12)`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: meta.badgeBg, color: meta.badgeText }}
                >
                  {rewardLabel}
                </span>
                {available !== undefined && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Gift className="w-3 h-3" />
                    <span>{available} Available</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  {meta.emoji}
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-[15px] leading-tight">{rewardTitle}</p>
                  {rewardSubtitle && (
                    <p className={`text-[11px] mt-0.5 text-gray-400 ${rewardSubtitleMono ? 'font-mono tracking-wider' : ''}`}>
                      {rewardSubtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] flex-wrap text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  <span>Claim Before</span>
                </div>
                <span className="font-semibold text-gray-700">{fmtDate(claimBefore)}</span>
                <span className="opacity-30 mx-0.5">|</span>
                <div className="flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  <span>Redeem Before</span>
                </div>
                <span className="font-semibold text-gray-700">{fmtDate(redeemBefore)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms */}
        <AnimatePresence>
          {showReward && terms && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="w-full max-w-xs mt-3 rounded-2xl px-4 py-3 bg-gray-50 border border-gray-200"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">{terms}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet CTA */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full max-w-xs mt-4"
            >
              <Link
                href="/customer/wallet"
                className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-base text-white"
                style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
              >
                View in Wallet →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
