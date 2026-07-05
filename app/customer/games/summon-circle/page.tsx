'use client'
import { useState, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift } from 'lucide-react'
import Link from 'next/link'

const CONTAINER = 300
const CX = 150
const CY = 150
const RING_R = 112
const RING_CIRC = 2 * Math.PI * RING_R
const SECTORS = 180

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

const ORBIT_PARTICLES = [
  { angle: 0,   dist: 88, delay: 0 },
  { angle: 72,  dist: 93, delay: 0.4 },
  { angle: 144, dist: 86, delay: 0.8 },
  { angle: 216, dist: 91, delay: 1.2 },
  { angle: 288, dist: 88, delay: 1.6 },
]

const BURST_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * 360,
  dist:  85 + Math.random() * 65,
  delay: Math.random() * 0.25,
}))

const CONFETTI_PIECES = Array.from({ length: 55 }, (_, i) => ({
  x:        Math.random() * 100,
  color:    ['#F59E0B', '#FBBF24', '#D97706', '#FDE68A', '#A78BFA', '#8B5CF6', '#EC4899'][i % 7],
  delay:    Math.random() * 0.65,
  duration: 1.9 + Math.random() * 1.3,
  rotate:   Math.random() * 360,
}))

const DEFAULT_REWARD = {
  name: 'Free Croissant',
  subtitle: 'Any flavour · All locations',
  pts: 75,
  available: 12,
  claimBefore: '10 Jul',
  redeemBefore: '10 Jul',
}

type TrailParticle = {
  id: number
  cx: number
  cy: number
  dx: number
  dy: number
}

let trailCounter = 0

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

function SummonCircleContent() {
  const router = useRouter()
  const params = useSearchParams()

  const name         = params.get('name')          ?? DEFAULT_REWARD.name
  const subtitle     = params.get('subtitle')      ?? DEFAULT_REWARD.subtitle
  const pts          = Number(params.get('pts'))   || DEFAULT_REWARD.pts
  const available    = Number(params.get('avail')) || DEFAULT_REWARD.available
  const claimBefore  = params.get('cb')            ?? DEFAULT_REWARD.claimBefore
  const redeemBefore = params.get('rb')            ?? DEFAULT_REWARD.redeemBefore

  const [coverage, setCoverage]           = useState(0)
  const [claimed, setClaimed]             = useState(false)
  const [isDrawing, setIsDrawing]         = useState(false)
  const [flash, setFlash]                 = useState(false)
  const [showBurst, setShowBurst]         = useState(false)
  const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([])

  const visitedRef    = useRef<Set<number>>(new Set())
  const firedRef      = useRef(false)
  const isDownRef     = useRef(false)
  const containerRef  = useRef<HTMLDivElement>(null)
  const lastTipRef    = useRef({ x: 0, y: 0 })
  const milestonesRef = useRef<Set<number>>(new Set())

  const coveragePct   = Math.round(coverage * 100)
  const orbitVisible  = coverage > 0.1

  const getSector = (angle: number) => {
    const deg = ((angle * 180) / Math.PI + 360) % 360
    return Math.floor(deg / 2) % SECTORS
  }

  const triggerClaim = useCallback(() => {
    firedRef.current = true
    setIsDrawing(false)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([80, 40, 120, 40, 180])
    setFlash(true)
    setTimeout(() => setFlash(false), 450)
    setShowBurst(true)
    setTimeout(() => setClaimed(true), 520)
  }, [])

  const getCenter = useCallback(() => {
    if (!containerRef.current) return { x: CX, y: CY }
    const r = containerRef.current.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (firedRef.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDownRef.current = true
    setIsDrawing(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDownRef.current || firedRef.current) return
    const center = getCenter()
    const dx = e.clientX - center.x
    const dy = e.clientY - center.y
    const angle = Math.atan2(dy, dx)
    visitedRef.current.add(getSector(angle))

    // Tip position in container SVG coords
    const tipX = CX + RING_R * Math.cos(angle)
    const tipY = CY + RING_R * Math.sin(angle)

    // Emit sparkle trail particle every ~8px of tip movement
    const moved = Math.hypot(tipX - lastTipRef.current.x, tipY - lastTipRef.current.y)
    if (moved > 8) {
      lastTipRef.current = { x: tipX, y: tipY }
      const driftAngle = Math.atan2(tipY - CY, tipX - CX)
      const dist = 12 + Math.random() * 14
      setTrailParticles(prev => {
        const p: TrailParticle = {
          id: ++trailCounter,
          cx: tipX,
          cy: tipY,
          dx: Math.cos(driftAngle) * dist,
          dy: Math.sin(driftAngle) * dist,
        }
        return [...prev.slice(-22), p]
      })
    }

    const cov = visitedRef.current.size / SECTORS
    setCoverage(cov)

    // Haptic pulse at 25 / 50 / 75% milestones
    const milestoneHit = [0.25, 0.5, 0.75].find(m => cov >= m && !milestonesRef.current.has(m))
    if (milestoneHit) {
      milestonesRef.current.add(milestoneHit)
      if (typeof navigator !== 'undefined') navigator.vibrate?.([30, 20, 50])
    }

    if (cov >= 0.85 && !firedRef.current) triggerClaim()
  }

  const onPointerUp = () => {
    isDownRef.current = false
    setIsDrawing(false)
  }

  const removeTrail = useCallback((id: number) => {
    setTrailParticles(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #2D0A6B 0%, #1A0D3A 45%, #0E060C 78%, #1C0410 100%)' }}
    >
      <StarField />

      {/* Flash on completion */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, times: [0, 0.35, 1] }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(245,158,11,0.75) 55%, transparent 100%)' }}
          />
        )}
      </AnimatePresence>

      {/* Confetti */}
      <AnimatePresence>
        {claimed && (
          <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
            {CONFETTI_PIECES.map((c, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-sm"
                style={{ left: `${c.x}%`, top: '-8px', background: c.color }}
                initial={{ y: 0, opacity: 1, rotate: c.rotate }}
                animate={{ y: '108vh', opacity: [1, 1, 0], rotate: c.rotate + 720 }}
                transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

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
                key="claimed"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <p className="text-white text-[22px] font-bold">★ Your wish was granted! ✨</p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            ) : (
              <motion.div key="draw" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-white text-[22px] font-bold leading-snug">
                  Draw a circle to<br />summon the genie
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Circle arena */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center mb-5"
          style={{ width: CONTAINER, height: CONTAINER, touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* SVG layer */}
          <svg
            viewBox={`0 0 ${CONTAINER} ${CONTAINER}`}
            className="absolute inset-0 pointer-events-none"
            style={{ width: CONTAINER, height: CONTAINER }}
          >
            <defs>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.9" />
              </filter>
              <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#F59E0B" floodOpacity="1" />
              </filter>
              <filter id="guideGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#C4B5FD" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Guide ring — bright and clearly visible */}
            {!claimed && (
              <>
                {/* Soft violet outer glow halo */}
                <circle cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke="rgba(167,139,250,0.18)" strokeWidth="18" />
                {/* Main violet dashed guide — clearly visible, on-theme */}
                <circle cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke="rgba(196,181,253,0.75)" strokeWidth="2.5"
                  strokeDasharray="12 7"
                  filter="url(#guideGlow)"
                />
              </>
            )}

            {/* Tick marks at 12 / 3 / 6 / 9 o'clock */}
            {!claimed && [0, 90, 180, 270].map(deg => {
              const rad = (deg - 90) * Math.PI / 180
              return (
                <line key={deg}
                  x1={CX + (RING_R - 14) * Math.cos(rad)} y1={CY + (RING_R - 14) * Math.sin(rad)}
                  x2={CX + (RING_R + 14) * Math.cos(rad)} y2={CY + (RING_R + 14) * Math.sin(rad)}
                  stroke="rgba(196,181,253,0.85)" strokeWidth="2.5" strokeLinecap="round"
                />
              )
            })}

            {/* Progress arc — thick gold fill from 12 o'clock */}
            {coverage > 0 && !claimed && (
              <circle
                cx={CX} cy={CY} r={RING_R}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${coverage * RING_CIRC} ${RING_CIRC}`}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: `${CX}px ${CY}px`,
                  filter: `drop-shadow(0 0 ${6 + coverage * 10}px rgba(245,158,11,${0.8 + coverage * 0.2}))`,
                }}
              />
            )}

            {/* Moving tip dot */}
            {coverage > 0 && !claimed && (() => {
              const a = (-90 + coverage * 360) * (Math.PI / 180)
              return (
                <circle
                  cx={CX + RING_R * Math.cos(a)}
                  cy={CY + RING_R * Math.sin(a)}
                  r={7} fill="#FBBF24" filter="url(#goldGlow)"
                />
              )
            })()}

            {/* START label + clockwise hint — before user draws */}
            {coverage === 0 && !claimed && (
              <>
                <text x={CX} y={CY - RING_R - 24}
                  textAnchor="middle" fontSize="12" fontWeight="bold"
                  fill="rgba(245,158,11,0.95)"
                  fontFamily="system-ui,-apple-system">
                  START
                </text>
                {/* Clockwise arc arrow */}
                <path d="M 150 38 A 112 112 0 0 1 222 112"
                  fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray="8 5" />
                <polygon points="222,112 210,100 225,98" fill="rgba(245,158,11,0.7)" />
              </>
            )}

            {/* Completed ring */}
            {claimed && (
              <circle cx={CX} cy={CY} r={RING_R}
                fill="none" stroke="#F59E0B" strokeWidth="5"
                filter="url(#ringGlow)" />
            )}
          </svg>

          {/* Pulsing start dot at 12 o'clock */}
          {coverage === 0 && !claimed && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 18, height: 18,
                left: CX - 9,
                top: CY - RING_R - 9,
                background: '#F59E0B',
                boxShadow: '0 0 16px 5px rgba(245,158,11,0.8)',
              }}
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Orbiting demo dot — shows clockwise direction before drawing */}
          {coverage === 0 && !isDrawing && !claimed && (
            <motion.div
              className="absolute pointer-events-none"
              style={{ width: CONTAINER, height: CONTAINER, top: 0, left: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 11, height: 11,
                  left: CX - 5.5,
                  top:  CY - RING_R - 5.5,
                  background: 'rgba(245,158,11,0.6)',
                  boxShadow: '0 0 10px 3px rgba(245,158,11,0.4)',
                }}
              />
            </motion.div>
          )}

          {/* Sparkle trail particles at arc tip */}
          {trailParticles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 7, height: 7,
                left: p.cx - 3.5,
                top:  p.cy - 3.5,
                background: '#FBBF24',
                boxShadow: '0 0 6px 2px rgba(245,158,11,0.7)',
              }}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.2, x: p.dx, y: p.dy }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onAnimationComplete={() => removeTrail(p.id)}
            />
          ))}

          {/* Orbit particles (appear as coverage grows) */}
          <AnimatePresence>
            {orbitVisible && !claimed && ORBIT_PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{ width: CONTAINER, height: CONTAINER, top: 0, left: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'linear', delay: p.delay }}
              >
                <motion.div
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-400"
                  style={{
                    left: CX + p.dist * Math.cos((p.angle * Math.PI) / 180) - 5,
                    top:  CY + p.dist * Math.sin((p.angle * Math.PI) / 180) - 5,
                    boxShadow: '0 0 8px 3px rgba(245,158,11,0.75)',
                    opacity: Math.min(1, coverage * 3.5),
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Burst particles on completion */}
          <AnimatePresence>
            {showBurst && BURST_PARTICLES.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180
              return (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
                  style={{ left: CX - 5, top: CY - 5, background: '#F59E0B', boxShadow: '0 0 8px 3px rgba(245,158,11,0.85)' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 0.75, delay: p.delay, ease: 'easeOut' }}
                />
              )
            })}
          </AnimatePresence>

          {/* Inner circle — lamp or genie */}
          <motion.div
            className="absolute inset-6 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 40% 35%, rgba(110,45,210,0.75) 0%, rgba(18,6,50,0.96) 70%)',
              boxShadow: claimed
                ? '0 0 65px rgba(245,158,11,0.45), 0 0 110px rgba(109,40,217,0.32)'
                : isDrawing
                  ? `0 0 ${30 + coverage * 40}px rgba(245,158,11,${0.1 + coverage * 0.28}), 0 0 80px rgba(109,40,217,0.2)`
                  : '0 0 22px rgba(109,40,217,0.16)',
            }}
          >
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.div
                  key="genie"
                  initial={{ scale: 0, y: 20, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 13, delay: 0.08 }}
                >
                  <img src="/genie.png" alt="Genie" style={{ width: 100, height: 'auto', objectFit: 'contain' }} />
                </motion.div>
              ) : (
                <motion.div
                  key="lamp"
                  animate={isDrawing
                    ? { scale: [1, 1.06, 1], rotate: [-3, 3, -3, 0] }
                    : { scale: [1, 1.025, 1] }
                  }
                  transition={isDrawing
                    ? { duration: 0.28, repeat: Infinity }
                    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    filter: coverage > 0.6
                      ? `drop-shadow(0 0 ${10 + (coverage - 0.6) * 20}px rgba(245,158,11,0.9)) drop-shadow(0 0 20px rgba(245,158,11,0.5))`
                      : coverage > 0.2
                        ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))'
                        : 'drop-shadow(0 0 3px rgba(245,158,11,0.2))',
                  }}
                >
                  <img src="/genie-lamp.png" alt="Lamp" style={{ width: 95, height: 'auto', objectFit: 'contain' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {!claimed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full max-w-xs mb-5"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  Circle progress
                </p>
                <motion.p
                  key={coveragePct}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: coveragePct > 60 ? '#FBBF24' : coveragePct > 25 ? '#FCD34D' : 'rgba(255,255,255,0.65)' }}
                  animate={{ scale: [1.15, 1] }}
                  transition={{ duration: 0.15 }}
                >
                  {coveragePct}%
                </motion.p>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.09)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #FBBF24, #F59E0B, #D97706)',
                    boxShadow: coveragePct > 0 ? `0 0 ${8 + coveragePct / 10}px rgba(245,158,11,0.75)` : 'none',
                  }}
                  animate={{ width: `${Math.min(100, coveragePct)}%` }}
                  transition={{ duration: 0.08 }}
                />
              </div>
              {coverage === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-center mt-3"
                >
                  <p className="text-sm font-semibold" style={{ color: 'rgba(245,158,11,0.85)' }}>
                    Start at the gold dot ↑
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                    Draw a full circle clockwise ↻
                  </p>
                </motion.div>
              )}
              {coverage > 0 && coverage < 0.85 && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-xs mt-2"
                  style={{ color: coverage > 0.6 ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.28)' }}
                >
                  {coverage < 0.4 ? 'Keep going ↻' : coverage < 0.7 ? 'The genie is rising... ✨' : 'Almost there! 🔥'}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claimed headline */}
        <AnimatePresence>
          {claimed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-white font-bold text-lg mb-4"
            >
              Here is Your Reward ✨
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
            background: 'rgba(28,14,55,0.90)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(234,179,8,0.18)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)' }}>
              {pts} pts
            </span>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <Gift className="w-3 h-3" />
              <span>{claimed ? available - 1 : available} Available</span>
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

        {/* Wallet CTA */}
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

export default function SummonCirclePage() {
  return (
    <Suspense>
      <SummonCircleContent />
    </Suspense>
  )
}
