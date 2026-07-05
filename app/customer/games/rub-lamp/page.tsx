'use client'
import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift } from 'lucide-react'
import Link from 'next/link'

const R    = 95
const CX   = 110
const CY   = 110
const CIRC = 2 * Math.PI * R

const CONTAINER = 260
const SCREEN_R  = (R / 220) * CONTAINER
const SCREEN_CX = CONTAINER / 2
const SCREEN_CY = CONTAINER / 2

const TOTAL_RUB_PX = 480
const MAX_PARTICLES = 32

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

const CONFETTI_COLORS = ['#F5C518', '#A78BFA', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B', '#FBBF24']

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

function StarField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o, fontSize: s.s }}
          animate={{ opacity: [s.o, s.o * 0.3, s.o], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.2 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  )
}

function ConfettiLayer({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  useEffect(() => {
    if (!show) return
    setPieces(Array.from({ length: 65 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationEnd: Math.random() * 720 - 360,
      duration: 1.8 + Math.random() * 1.6,
      delay: Math.random() * 0.7,
      isStrip: Math.random() > 0.55,
      size: 5 + Math.floor(Math.random() * 9),
    })))
  }, [show])
  if (!show || pieces.length === 0) return null
  return (
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

let particleCounter = 0

function RubLampContent() {
  const router = useRouter()
  const params = useSearchParams()

  const name         = params.get('name')          ?? DEFAULT_REWARD.name
  const subtitle     = params.get('subtitle')      ?? DEFAULT_REWARD.subtitle
  const pts          = Number(params.get('pts'))   || DEFAULT_REWARD.pts
  const available    = Number(params.get('avail')) || DEFAULT_REWARD.available
  const claimBefore  = params.get('cb')            ?? DEFAULT_REWARD.claimBefore
  const redeemBefore = params.get('rb')            ?? DEFAULT_REWARD.redeemBefore

  const [charge, setCharge]             = useState(0)
  const [claimed, setClaimed]           = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showReward, setShowReward]     = useState(false)
  const [isRubbing, setIsRubbing]       = useState(false)
  const [particles, setParticles]       = useState<SmokeParticle[]>([])
  const [lampShakeKey, setLampShakeKey] = useState(0)
  const [genieVisible, setGenieVisible] = useState(false)
  const [ringClaimed, setRingClaimed]   = useState(false)

  const rubPxRef       = useRef(0)
  const firedRef       = useRef(false)
  const isDownRef      = useRef(false)
  const lastXRef       = useRef(0)
  const lastEmitPxRef  = useRef(0)
  const lastShakePxRef = useRef(0)

  const ringFilled  = (charge / 100) * CIRC
  const screenAngle = ((charge / 100) * 360 - 90) * (Math.PI / 180)
  const dotX        = SCREEN_CX + SCREEN_R * Math.cos(screenAngle)
  const dotY        = SCREEN_CY + SCREEN_R * Math.sin(screenAngle)

  const emitSmoke = useCallback((count: number, intensity: number) => {
    const smokeColors = [
      'rgba(168,85,247,0.75)',
      'rgba(192,132,252,0.70)',
      'rgba(233,213,255,0.65)',
      'rgba(255,255,255,0.72)',
      'rgba(147,51,234,0.55)',
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
        color:    isBright ? 'rgba(216,180,254,0.7)' : smokeColors[Math.floor(Math.random() * smokeColors.length)],
      }
    })
    setParticles(prev => [...prev, ...newParticles].slice(-MAX_PARTICLES))
  }, [])

  const triggerClaim = useCallback(() => {
    firedRef.current = true
    emitSmoke(24, 100)
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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (firedRef.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDownRef.current   = true
    lastXRef.current    = e.clientX
    setIsRubbing(true)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDownRef.current || firedRef.current) return

    const x  = e.clientX
    const dx = Math.abs(x - lastXRef.current)
    lastXRef.current = x
    if (dx < 0.5) return

    const prev = rubPxRef.current
    rubPxRef.current = Math.min(TOTAL_RUB_PX, prev + dx)
    const newCharge = (rubPxRef.current / TOTAL_RUB_PX) * 100

    // Shake lamp every 22px
    if (rubPxRef.current - lastShakePxRef.current >= 22) {
      lastShakePxRef.current = rubPxRef.current
      setLampShakeKey(k => k + 1)
    }

    // Smoke: gets denser at higher charge
    const emitEvery = newCharge > 80 ? 6 : newCharge > 55 ? 10 : newCharge > 30 ? 15 : 22
    if (rubPxRef.current - lastEmitPxRef.current >= emitEvery) {
      lastEmitPxRef.current = rubPxRef.current
      const count = newCharge > 80 ? 4 : newCharge > 55 ? 3 : newCharge > 30 ? 2 : 1
      emitSmoke(count, newCharge)
    }

    // Haptic every ~50px
    if (Math.floor(rubPxRef.current / 50) > Math.floor(prev / 50)) {
      if (typeof navigator !== 'undefined') navigator.vibrate?.(10)
    }

    setCharge(newCharge)

    if (newCharge >= 100 && !firedRef.current) {
      triggerClaim()
    }
  }, [emitSmoke, triggerClaim])

  const onPointerUp = useCallback(() => {
    isDownRef.current = false
    setIsRubbing(false)
  }, [])

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }, [])

  const glowIntensity = Math.max(0, charge - 20) / 80

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #2D0A6B 0%, #1A0D3A 45%, #0E060C 78%, #1C0410 100%)' }}
    >
      <StarField />
      <ConfettiLayer show={showConfetti} />

      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
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
                <p className="text-white text-[22px] font-bold leading-snug">★ Your wish is granted!</p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            ) : (
              <motion.div key="rub-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-white text-[22px] font-bold leading-snug">
                  Rub the lamp to<br />claim your reward
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ring + Lamp */}
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
          {/* Progress ring SVG */}
          <svg
            viewBox="0 0 220 220"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
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
                <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#A855F7" floodOpacity="1" />
              </filter>
            </defs>

            {/* Guide ring — light neutral dashes */}
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke="rgba(120,60,240,0.07)" strokeWidth="22" />
            <circle cx={CX} cy={CY} r={R} fill="none"
              stroke="rgba(215,195,255,0.13)" strokeWidth="1.5" strokeDasharray="7 9" />

            {/* Progress arc — 4-layer soft warm amber */}
            {charge > 0 && !ringClaimed && (
              <>
                <circle
                  cx={CX} cy={CY} r={R} fill="none"
                  stroke={`rgba(168,85,247,${0.08 + glowIntensity * 0.18})`}
                  strokeWidth="36" strokeLinecap="round"
                  strokeDasharray={`${ringFilled} ${CIRC}`}
                  filter="url(#lampBloomWide)"
                />
                <circle
                  cx={CX} cy={CY} r={R} fill="none"
                  stroke={`rgba(192,132,252,${0.28 + glowIntensity * 0.28})`}
                  strokeWidth="18" strokeLinecap="round"
                  strokeDasharray={`${ringFilled} ${CIRC}`}
                  filter="url(#lampBloomMed)"
                />
                <circle
                  cx={CX} cy={CY} r={R} fill="none"
                  stroke={`rgba(167,139,250,${0.86 + glowIntensity * 0.14})`}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${ringFilled} ${CIRC}`}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.80))' }}
                />
                <circle
                  cx={CX} cy={CY} r={R} fill="none"
                  stroke="rgba(233,213,255,0.92)"
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${ringFilled} ${CIRC}`}
                />
              </>
            )}

            {/* Claimed full ring — soft warm glow */}
            {ringClaimed && (
              <>
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="36"
                  filter="url(#lampBloomWide)" />
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(192,132,252,0.42)" strokeWidth="18"
                  filter="url(#lampBloomMed)" />
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="#A855F7" strokeWidth="7"
                  filter="url(#lampRingGlow)" />
                <circle cx={CX} cy={CY} r={R}
                  fill="none" stroke="rgba(233,213,255,0.92)" strokeWidth="2" />
              </>
            )}
          </svg>

          {/* Tip dot — warm amber sunburst */}
          {charge > 1 && !ringClaimed && (
            <>
              <div className="absolute rounded-full pointer-events-none" style={{
                width: 64, height: 64,
                left: dotX - 32, top: dotY - 32,
                background: 'rgba(168,85,247,0.14)',
                filter: 'blur(18px)',
              }} />
              <div className="absolute rounded-full pointer-events-none" style={{
                width: 38, height: 38,
                left: dotX - 19, top: dotY - 19,
                background: 'rgba(192,132,252,0.48)',
                filter: 'blur(8px)',
              }} />
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 20, height: 20,
                  left: dotX - 10, top: dotY - 10,
                  background: '#A855F7',
                  boxShadow: `0 0 ${12 + glowIntensity * 16}px 4px rgba(168,85,247,${0.65 + glowIntensity * 0.30})`,
                }}
                animate={{ scale: [1, 1.28, 1] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
              <div className="absolute rounded-full pointer-events-none" style={{
                width: 8, height: 8,
                left: dotX - 4, top: dotY - 4,
                background: 'rgba(233,213,255,0.94)',
              }} />
            </>
          )}

          {/* Inner circle */}
          <motion.div
            className="absolute inset-3 rounded-full flex items-center justify-center overflow-visible"
            style={{
              background: 'radial-gradient(circle at 40% 35%, rgba(110,45,210,0.75) 0%, rgba(18,6,50,0.96) 70%)',
              boxShadow: ringClaimed
                ? '0 0 0 2px rgba(168,85,247,0.70), 0 0 50px 20px rgba(168,85,247,0.38), 0 0 100px 34px rgba(147,51,234,0.22), inset 0 0 60px 20px rgba(192,132,252,0.14)'
                : charge > 3
                  ? `0 0 0 ${0.5 + glowIntensity * 2}px rgba(168,85,247,${0.14 + glowIntensity * 0.52}), 0 0 ${14 + glowIntensity * 52}px ${5 + glowIntensity * 22}px rgba(168,85,247,${0.10 + glowIntensity * 0.34}), 0 0 ${30 + glowIntensity * 75}px ${8 + glowIntensity * 28}px rgba(147,51,234,${0.04 + glowIntensity * 0.20}), inset 0 0 ${5 + glowIntensity * 52}px ${1.5 + glowIntensity * 20}px rgba(192,132,252,${0.02 + glowIntensity * 0.16})`
                  : '0 0 20px rgba(109,40,217,0.14)',
            }}
          >
            {/* Bokeh light orbs */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,80,40,0.13)', filter: 'blur(24px)', left: '8%', top: '18%' }} />
              <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,165,30,0.11)', filter: 'blur(20px)', right: '12%', bottom: '22%' }} />
              <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: 'rgba(120,40,230,0.20)', filter: 'blur(18px)', right: '22%', top: '12%' }} />
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
                  key={`lamp-${lampShakeKey}`}
                  animate={lampShakeKey > 0
                    ? { rotate: [-9, 9, -7, 7, -4, 4, 0], scale: [1, 1.04, 1] }
                    : { scale: [1, 1.02, 1] }
                  }
                  transition={lampShakeKey > 0
                    ? { duration: 0.35, ease: 'easeInOut' }
                    : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    filter: charge > 55
                      ? `drop-shadow(0 0 ${10 + (charge - 55) / 3}px rgba(168,85,247,0.95)) drop-shadow(0 0 ${22 + (charge - 55) / 2}px rgba(168,85,247,0.55))`
                      : charge > 20
                        ? 'drop-shadow(0 0 8px rgba(168,85,247,0.55))'
                        : 'drop-shadow(0 0 3px rgba(168,85,247,0.2))',
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

            {/* Smoke particles — origin at lamp spout/nozzle tip (left side) */}
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

        {/* Progress bar */}
        <AnimatePresence>
          {!claimed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xs mb-5"
            >
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.09)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #C084FC, #A855F7, #7C3AED)',
                    boxShadow: charge > 0 ? `0 0 ${8 + glowIntensity * 10}px rgba(168,85,247,${0.6 + glowIntensity * 0.4})` : 'none',
                  }}
                  animate={{ width: `${charge}%` }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={charge < 30 ? 'hint1' : charge < 60 ? 'hint2' : charge < 90 ? 'hint3' : 'hint4'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.32)' }}
                  >
                    {charge === 0
                      ? '← Rub the lamp →'
                      : charge < 30
                      ? 'Keep rubbing...'
                      : charge < 60
                      ? 'The genie is stirring... ✨'
                      : charge < 90
                      ? 'Almost there! The magic is building 🔥'
                      : ''}
                  </motion.p>
                </AnimatePresence>
                {charge > 0 && (
                  <motion.p
                    className="text-xs font-bold tabular-nums ml-2 flex-shrink-0"
                    style={{ color: 'rgba(168,85,247,0.85)' }}
                  >
                    {Math.round(charge)}%
                  </motion.p>
                )}
              </div>
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
              className="text-white font-bold text-lg mb-4"
            >
              Here is Your Reward ✨
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
                background: 'rgba(28,14,55,0.90)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(234,179,8,0.18)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)' }}
                >
                  {pts} pts
                </span>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <Gift className="w-3 h-3" />
                  <span>{available - 1} Available</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  🎁
                </div>
                <div>
                  <p className="text-white font-bold text-[15px] leading-tight">{name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>
                </div>
              </div>
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
                style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)' }}
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

export default function RubLampPage() {
  return (
    <Suspense>
      <RubLampContent />
    </Suspense>
  )
}
