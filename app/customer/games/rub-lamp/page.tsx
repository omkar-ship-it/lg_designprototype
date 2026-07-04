'use client'
import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift } from 'lucide-react'
import Link from 'next/link'

const R    = 95
const CX   = 110
const CY   = 110
const CIRC = 2 * Math.PI * R

const CONTAINER = 240
const SCREEN_R  = (R / 220) * CONTAINER
const SCREEN_CX = CONTAINER / 2
const SCREEN_CY = CONTAINER / 2

const STROKES_NEEDED = 6
const MIN_STROKE_PX  = 20
const MAX_PARTICLES  = 20

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

const CONFETTI_COLORS = ['#F5C518', '#A78BFA', '#EC4899', '#06B6D4', '#22C55E', '#F59E0B']

type SmokeParticle = {
  id: number
  xOff: number
  xDrift: number
  size: number
  duration: number
  opacity: number
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
          animate={{ opacity: [s.o, s.o * 0.35, s.o], scale: [1, 1.25, 1] }}
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
    const generated: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationEnd: Math.random() * 720 - 360,
      duration: 2 + Math.random() * 1,
      delay: Math.random() * 0.5,
      isStrip: Math.random() > 0.6,
      size: 4 + Math.floor(Math.random() * 8),
    }))
    setPieces(generated)
  }, [show])

  if (!show || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.isStrip ? p.size / 2 : p.size,
            height: p.isStrip ? p.size * 3 : p.size,
            background: p.color,
            rotate: p.rotation,
            borderRadius: p.isStrip ? 1 : 2,
          }}
          animate={{ y: '110vh', rotate: p.rotationEnd }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

function CuteGenie() {
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
      {/* Wispy smoke tail — no legs */}
      <path d="M32 92 C26 76 34 64 28 52 C24 44 29 36 37 32"
        stroke="rgba(139,92,246,0.45)" strokeWidth="13" strokeLinecap="round"/>
      <path d="M60 92 C66 76 58 64 64 52 C68 44 63 36 55 32"
        stroke="rgba(139,92,246,0.45)" strokeWidth="13" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="46" cy="56" rx="18" ry="14" fill="#60A5FA"/>
      {/* Arms raised (excited) */}
      <path d="M28 52 Q17 41 22 31" stroke="#60A5FA" strokeWidth="9" strokeLinecap="round"/>
      <path d="M64 52 Q75 41 70 31" stroke="#60A5FA" strokeWidth="9" strokeLinecap="round"/>
      {/* Bald head */}
      <circle cx="46" cy="25" r="23" fill="#60A5FA"/>
      {/* Ears */}
      <circle cx="23" cy="27" r="5.5" fill="#3B82F6"/>
      <circle cx="69" cy="27" r="5.5" fill="#3B82F6"/>
      {/* Gold earring on left ear */}
      <circle cx="20" cy="31" r="2.8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      {/* Eye whites */}
      <ellipse cx="36" cy="21" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="56" cy="21" rx="7.5" ry="8.5" fill="white"/>
      {/* Pupils */}
      <circle cx="37.5" cy="22" r="5" fill="#1E3A8A"/>
      <circle cx="54.5" cy="22" r="5" fill="#1E3A8A"/>
      {/* Eye shine */}
      <circle cx="39.5" cy="19.5" r="1.8" fill="white"/>
      <circle cx="56.5" cy="19.5" r="1.8" fill="white"/>
      {/* Blush */}
      <ellipse cx="24" cy="34" rx="5" ry="3" fill="rgba(244,114,182,0.4)"/>
      <ellipse cx="68" cy="34" rx="5" ry="3" fill="rgba(244,114,182,0.4)"/>
      {/* Nose */}
      <ellipse cx="46" cy="31" rx="3" ry="2.5" fill="#3B82F6"/>
      {/* Big happy smile */}
      <path d="M35 40 Q46 51 57 40" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
      {/* Sparkle stars */}
      <text x="1" y="14" fontSize="11" fill="#FBBF24" opacity="0.9">✦</text>
      <text x="72" y="10" fontSize="9" fill="#FBBF24" opacity="0.7">✦</text>
      <text x="76" y="50" fontSize="7" fill="#A78BFA" opacity="0.6">✦</text>
    </svg>
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

  const [strokes, setStrokes]             = useState(0)
  const [claimed, setClaimed]             = useState(false)
  const [showConfetti, setShowConfetti]   = useState(false)
  const [showReward, setShowReward]       = useState(false)
  const [isRubbing, setIsRubbing]         = useState(false)
  const [particles, setParticles]         = useState<SmokeParticle[]>([])
  const [lampShakeKey, setLampShakeKey]   = useState(0)
  const [genieVisible, setGenieVisible]   = useState(false)
  const [ringClaimed, setRingClaimed]     = useState(false)

  const strokesRef  = useRef(0)
  const firedRef    = useRef(false)
  const isDownRef   = useRef(false)
  const lastXRef    = useRef(0)
  const dirRef      = useRef<'left' | 'right' | null>(null)
  const strokeStartXRef = useRef(0)

  const lampX = useMotionValue(0)
  const lampSpring = useSpring(lampX, { stiffness: 300, damping: 28, mass: 0.6 })

  const charge = Math.min(100, (strokes / STROKES_NEEDED) * 100)
  const ringFilled = (charge / 100) * CIRC

  const screenAngle = ((charge / 100) * 360 - 90) * (Math.PI / 180)
  const dotX = SCREEN_CX + SCREEN_R * Math.cos(screenAngle)
  const dotY = SCREEN_CY + SCREEN_R * Math.sin(screenAngle)

  const emitSmoke = useCallback((_strokeNum: number, count: number) => {
    const newParticles: SmokeParticle[] = Array.from({ length: count }, () => {
      particleCounter += 1
      return {
        id: particleCounter,
        xOff: (Math.random() - 0.5) * 40,
        xDrift: (Math.random() - 0.5) * 28,
        size: 16 + Math.random() * 20,
        duration: 0.9 + Math.random() * 0.5,
        opacity: 0.55 + Math.random() * 0.3,
      }
    })
    setParticles(prev => {
      const combined = [...prev, ...newParticles]
      return combined.slice(-MAX_PARTICLES)
    })
  }, [])

  const triggerClaim = useCallback(() => {
    firedRef.current = true
    emitSmoke(6, 15)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([60, 30, 80, 30, 120])
    setTimeout(() => {
      setClaimed(true)
      setGenieVisible(true)
      setRingClaimed(true)
    }, 400)
    setTimeout(() => {
      setShowConfetti(true)
      setShowReward(true)
    }, 700)
  }, [emitSmoke])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (firedRef.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDownRef.current   = true
    lastXRef.current    = e.clientX
    strokeStartXRef.current = e.clientX
    dirRef.current      = null
    setIsRubbing(true)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDownRef.current || firedRef.current) return

    const x = e.clientX
    const dx = x - lastXRef.current
    lastXRef.current = x

    const clamped = Math.max(-35, Math.min(35, x - strokeStartXRef.current))
    lampX.set(clamped)

    if (Math.abs(dx) < 1) return

    const movingRight = dx > 0
    const newDir: 'left' | 'right' = movingRight ? 'right' : 'left'

    if (dirRef.current !== null && dirRef.current !== newDir) {
      const strokeDist = Math.abs(x - strokeStartXRef.current)
      strokeStartXRef.current = x  // always reset on reversal so each segment is independent

      if (strokeDist >= MIN_STROKE_PX) {
        const next = strokesRef.current + 1
        strokesRef.current = next
        setStrokes(next)
        setLampShakeKey(k => k + 1)
        emitSmoke(next, 2 + next)
        if (typeof navigator !== 'undefined') navigator.vibrate?.(18)

        if (next >= STROKES_NEEDED) {
          triggerClaim()
          return
        }
      }
    }

    dirRef.current = newDir
  }, [lampX, emitSmoke, triggerClaim])

  const onPointerUp = useCallback(() => {
    isDownRef.current = false
    lampX.set(0)
    setIsRubbing(false)
  }, [lampX])

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }, [])

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
          <svg
            viewBox="0 0 220 220"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {ringClaimed && (
              <circle
                cx={CX} cy={CY} r={R + 8}
                fill="none"
                stroke="rgba(245,158,11,0.22)"
                strokeWidth="16"
              />
            )}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="4"
            />
            {charge > 0 && (
              <circle
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke="url(#lampGold)"
                strokeWidth={ringClaimed ? 7 : 5}
                strokeLinecap="round"
                strokeDasharray={`${ringFilled} ${CIRC}`}
                style={{
                  filter: ringClaimed
                    ? 'drop-shadow(0 0 8px rgba(245,158,11,0.9))'
                    : 'drop-shadow(0 0 5px rgba(245,158,11,0.7))',
                }}
              />
            )}
            <defs>
              <linearGradient id="lampGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>

          {charge > 1 && !ringClaimed && (
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

          <motion.div
            className="absolute inset-4 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 38% 32%, rgba(100,40,200,0.72) 0%, rgba(18,6,50,0.96) 70%)',
              boxShadow: isRubbing && !claimed
                ? '0 0 44px rgba(245,158,11,0.28), 0 0 80px rgba(109,40,217,0.22)'
                : ringClaimed
                  ? '0 0 60px rgba(245,158,11,0.45), 0 0 110px rgba(109,40,217,0.30)'
                  : '0 0 20px rgba(109,40,217,0.16)',
            }}
          >
            <AnimatePresence mode="wait">
              {genieVisible ? (
                <motion.div
                  key="genie"
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: [0, 1.25, 1], rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.05 }}
                >
                  <CuteGenie />
                </motion.div>
              ) : (
                <motion.div
                  key={`lamp-${lampShakeKey}`}
                  animate={lampShakeKey > 0
                    ? { rotate: [-8, 8, -8, 8, 0] }
                    : { scale: [1, 1.025, 1] }
                  }
                  transition={lampShakeKey > 0
                    ? { duration: 0.32, ease: 'easeInOut' }
                    : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="text-7xl leading-none"
                  style={{
                    x: lampSpring,
                    filter: charge > 60
                      ? `drop-shadow(0 0 ${8 + (charge - 60) / 4}px rgba(245,158,11,0.85))`
                      : charge > 20
                        ? 'drop-shadow(0 0 4px rgba(245,158,11,0.4))'
                        : 'none',
                  }}
                >
                  🪔
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="absolute pointer-events-none overflow-visible"
              style={{ bottom: '55%', left: '50%', transform: 'translateX(-50%)' }}
            >
              <AnimatePresence>
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      background: Math.random() > 0.5
                        ? 'rgba(168,85,247,0.7)'
                        : 'rgba(255,255,255,0.75)',
                      filter: 'blur(4px)',
                      x: p.xOff,
                      marginLeft: -p.size / 2,
                      marginTop: -p.size / 2,
                    }}
                    initial={{ y: 0, opacity: p.opacity, scale: 0.4 }}
                    animate={{ y: -90, x: p.xOff + p.xDrift, opacity: 0, scale: 2.8 }}
                    transition={{ duration: p.duration, ease: [0.2, 0, 0.4, 1] }}
                    onAnimationComplete={() => removeParticle(p.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {!claimed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-xs mb-5"
            >
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #FBBF24, #F59E0B, #D97706)',
                    boxShadow: charge > 0 ? '0 0 12px rgba(245,158,11,0.75)' : 'none',
                  }}
                  animate={{ width: `${charge}%` }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  {charge === 0
                    ? '← Rub the lamp →'
                    : charge < 50
                    ? 'Keep rubbing...'
                    : charge < 100
                    ? 'Almost there! ✨'
                    : ''}
                </p>
                {charge > 0 && (
                  <p className="text-xs font-bold" style={{ color: 'rgba(245,158,11,0.85)' }}>
                    {Math.round(charge)}%
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {claimed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white font-bold text-lg mb-4"
            >
              Here is Your Reward
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-xs rounded-2xl p-4"
              style={{
                background: 'rgba(28,14,55,0.88)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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


        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
