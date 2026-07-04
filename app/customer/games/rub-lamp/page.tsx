'use client'
import { useState, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift, Lock } from 'lucide-react'
import Link from 'next/link'

// ~700px total finger travel = 100%
const PX_PER_PERCENT = 7

// SVG ring: viewBox 220×220, circle r=95 centered at (110,110)
const R    = 95
const CX   = 110
const CY   = 110
const CIRC = 2 * Math.PI * R  // ≈ 596.9

// Container on screen: 240×240px, center at (120,120)
const CONTAINER = 240
const SCREEN_R  = (R / 220) * CONTAINER   // ≈ 103.6
const SCREEN_CX = CONTAINER / 2
const SCREEN_CY = CONTAINER / 2

// Fixed star positions to avoid flicker on re-render
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

function StarField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o, fontSize: s.s }}
          animate={{ opacity: [s.o, s.o * 0.35, s.o], scale: [1, 1.25, 1] }}
          transition={{ duration: 2.2 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  )
}

const DEFAULT_REWARD = {
  name: 'Free Coffee',
  subtitle: 'Any size · All locations',
  pts: 50,
  available: 18,
  claimBefore: '7 Jul',
  redeemBefore: '7 Jul',
}

function RubLampContent() {
  const router = useRouter()
  const params = useSearchParams()

  const name         = params.get('name')         ?? DEFAULT_REWARD.name
  const subtitle     = params.get('subtitle')     ?? DEFAULT_REWARD.subtitle
  const pts          = Number(params.get('pts'))  || DEFAULT_REWARD.pts
  const available    = Number(params.get('avail'))|| DEFAULT_REWARD.available
  const claimBefore  = params.get('cb')           ?? DEFAULT_REWARD.claimBefore
  const redeemBefore = params.get('rb')           ?? DEFAULT_REWARD.redeemBefore

  const [charge, setCharge]       = useState(0)
  const [claimed, setClaimed]     = useState(false)
  const [isRubbing, setIsRubbing] = useState(false)

  const chargeRef  = useRef(0)
  const firedRef   = useRef(false)
  const isDownRef  = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const triggerClaim = useCallback(() => {
    firedRef.current  = true
    chargeRef.current = 100
    setCharge(100)
    setIsRubbing(false)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([80, 40, 120])
    setTimeout(() => setClaimed(true), 500)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (firedRef.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDownRef.current    = true
    lastPosRef.current   = { x: e.clientX, y: e.clientY }
    setIsRubbing(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDownRef.current || firedRef.current) return
    const dx   = e.clientX - lastPosRef.current.x
    const dy   = e.clientY - lastPosRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    lastPosRef.current = { x: e.clientX, y: e.clientY }

    chargeRef.current = Math.min(100, chargeRef.current + dist / PX_PER_PERCENT)
    const rounded = Math.round(chargeRef.current)
    setCharge(rounded)

    if (chargeRef.current >= 100) triggerClaim()
  }

  const onPointerUp = () => {
    isDownRef.current = false
    setIsRubbing(false)
  }

  // Golden dot position: screen angle 0° = 12 o'clock, clockwise
  const screenAngle = ((charge / 100) * 360 - 90) * (Math.PI / 180)
  const dotX        = SCREEN_CX + SCREEN_R * Math.cos(screenAngle)
  const dotY        = SCREEN_CY + SCREEN_R * Math.sin(screenAngle)

  const ringFilled = (charge / 100) * CIRC

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #2D0A6B 0%, #1A0D3A 45%, #0E060C 78%, #1C0410 100%)' }}
    >
      <StarField />

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-5 pt-20 pb-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-7 min-h-[60px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {claimed ? (
              <motion.div
                key="claimed-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <p className="text-white text-[21px] font-bold leading-snug">
                  ★ Successfully claimed<br />Your Reward
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            ) : (
              <motion.div key="rub-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-white text-[21px] font-bold leading-snug">
                  Rub the lamp to claim<br />your reward
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ring + Lamp — rub target */}
        <div
          className="relative flex items-center justify-center mb-5"
          style={{
            width: CONTAINER,
            height: CONTAINER,
            touchAction: 'none',
            cursor: claimed ? 'default' : isRubbing ? 'grabbing' : 'grab',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* SVG rings */}
          <svg
            viewBox="0 0 220 220"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Outer soft glow when claimed */}
            {claimed && (
              <circle cx={CX} cy={CY} r={R + 8} fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="16" />
            )}
            {/* Track ring */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="4"
            />
            {/* Progress fill */}
            {charge > 0 && (
              <circle
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke="url(#lampGold)"
                strokeWidth={claimed ? 6 : 5}
                strokeLinecap="round"
                strokeDasharray={`${ringFilled} ${CIRC}`}
                style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.7))' }}
              />
            )}
            <defs>
              <linearGradient id="lampGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>

          {/* Golden progress dot (absolute positioned in screen coords) */}
          {charge > 1 && !claimed && (
            <div
              className="absolute w-4 h-4 rounded-full pointer-events-none"
              style={{
                left: dotX - 8,
                top:  dotY - 8,
                background: '#F59E0B',
                boxShadow: '0 0 8px 2px rgba(245,158,11,0.7)',
              }}
            />
          )}

          {/* Inner circle */}
          <motion.div
            className="absolute inset-4 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 38% 32%, rgba(100,40,200,0.72) 0%, rgba(18,6,50,0.96) 70%)',
              boxShadow: isRubbing && !claimed
                ? '0 0 44px rgba(245,158,11,0.28), 0 0 80px rgba(109,40,217,0.22)'
                : claimed
                  ? '0 0 60px rgba(245,158,11,0.4), 0 0 100px rgba(109,40,217,0.28)'
                  : '0 0 20px rgba(109,40,217,0.16)',
            }}
            animate={isRubbing && !claimed ? { rotate: [-1.5, 1.5, -1.5, 1.5, 0] } : {}}
            transition={{ duration: 0.22, repeat: isRubbing && !claimed ? Infinity : 0 }}
          >
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.div
                  key="genie"
                  initial={{ scale: 0, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.1 }}
                  className="text-7xl leading-none"
                >
                  🧞
                </motion.div>
              ) : (
                <motion.div
                  key="lamp"
                  animate={isRubbing
                    ? { scale: [1, 1.06, 1], rotate: [-3, 3, -3, 0] }
                    : { scale: [1, 1.025, 1] }
                  }
                  transition={isRubbing
                    ? { duration: 0.28, repeat: Infinity }
                    : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="text-7xl leading-none"
                  style={{
                    filter: charge > 60
                      ? `drop-shadow(0 0 ${8 + (charge - 60) / 4}px rgba(245,158,11,0.8))`
                      : charge > 20
                        ? 'drop-shadow(0 0 4px rgba(245,158,11,0.4))'
                        : 'none',
                  }}
                >
                  🪔
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress meter (hidden after claim) */}
        <AnimatePresence>
          {!claimed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full max-w-xs mb-5"
            >
              <p className="text-white text-center text-[17px] font-medium mb-2.5">
                Progress : {charge}%
              </p>
              <div
                className="w-full h-[3px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FBBF24, #D97706)' }}
                  animate={{ width: `${charge}%` }}
                  transition={{ duration: 0.08 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Here is Your Reward" — success only */}
        <AnimatePresence>
          {claimed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-white font-bold text-lg mb-4"
            >
              Here is Your Reward
            </motion.p>
          )}
        </AnimatePresence>

        {/* Reward card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-xs rounded-2xl p-4"
          style={{
            background: 'rgba(28,14,55,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(234,179,8,0.18)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)' }}
            >
              {pts} pts
            </span>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <Gift className="w-3 h-3" />
              <span>{claimed ? available - 1 : available} Available</span>
            </div>
          </div>

          {/* Reward identity */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
              🎁
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight">{name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>
            </div>
          </div>

          {/* Date row */}
          <div className="flex items-center gap-2 text-[10px] flex-wrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>Claim Before</span>
            </div>
            <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{claimBefore}</span>
            <span className="opacity-30 mx-0.5">|</span>
            <div className="flex items-center gap-1">
              <Gift className="w-3 h-3" />
              <span>Redeem Before</span>
            </div>
            <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{redeemBefore}</span>
          </div>
        </motion.div>

        {/* View in Wallet CTA — success only */}
        <AnimatePresence>
          {claimed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full max-w-xs mt-4"
            >
              <Link
                href="/customer/wallet"
                className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-base text-white"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                View in Wallet →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint text */}
        {!claimed && charge === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs mt-4"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            Rub the lamp to reveal your reward
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default function RubLampPage() {
  return (
    <Suspense>
      <RubLampContent />
    </Suspense>
  )
}
