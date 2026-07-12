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


function StarField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o, fontSize: s.s, color: 'rgba(124,58,237,0.5)' }}
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

  const [coverage, setCoverage]   = useState(0)
  const [claimed, setClaimed]     = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [flash, setFlash]         = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  const firedRef          = useRef(false)
  const isDownRef         = useRef(false)
  const containerRef      = useRef<HTMLDivElement>(null)
  const milestonesRef     = useRef<Set<number>>(new Set())
  const prevPointerAngle  = useRef(0)   // pointer's raw clockwise angle (0–360)
  const puckTravelRef     = useRef(0)   // cumulative puck travel in degrees (0–340)

  const coveragePct  = Math.round(coverage * 100)
  const orbitVisible = coverage > 0.1

  // Puck position on the ring (SVG coordinates) — always at 12 o'clock + travel
  const puckAngleRad = (-90 + puckTravelRef.current) * (Math.PI / 180)
  const puckX = CX + RING_R * Math.cos(puckAngleRad)
  const puckY = CY + RING_R * Math.sin(puckAngleRad)

  const triggerClaim = useCallback(() => {
    firedRef.current = true
    setIsDragging(false)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([80, 40, 120, 40, 180])
    setFlash(true)
    setTimeout(() => setFlash(false), 450)
    setShowBurst(true)
    setTimeout(() => setClaimed(true), 520)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (firedRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const touchX = e.clientX - rect.left
    const touchY = e.clientY - rect.top
    // Grab anywhere near the ring track — like placing finger on a rotary dial
    const distFromCenter = Math.hypot(touchX - CX, touchY - CY)
    if (Math.abs(distFromCenter - RING_R) > 55) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDownRef.current = true
    setIsDragging(true)
    // Track pointer's angular position (not puck position) — delta drives the puck
    prevPointerAngle.current = (Math.atan2(touchY - CY, touchX - CX) * 180 / Math.PI + 90 + 360) % 360
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDownRef.current || firedRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = e.clientX - rect.left - CX
    const dy = e.clientY - rect.top  - CY
    const cwAngle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360

    // Angular delta of pointer — drives puck travel regardless of grab position
    let delta = cwAngle - prevPointerAngle.current
    if (delta >  180) delta -= 360
    if (delta < -180) delta += 360
    prevPointerAngle.current = cwAngle

    const newTravel = Math.min(340, Math.max(0, puckTravelRef.current + delta))
    puckTravelRef.current = newTravel
    const newCoverage = newTravel / 340
    setCoverage(newCoverage)

    // Haptic at 25 / 50 / 75%
    const hit = [0.25, 0.5, 0.75].find(m => newCoverage >= m && !milestonesRef.current.has(m))
    if (hit) {
      milestonesRef.current.add(hit)
      if (typeof navigator !== 'undefined') navigator.vibrate?.([30, 20, 50])
    }

    if (newTravel >= 340 && !firedRef.current) triggerClaim()
  }

  const onPointerUp = () => {
    isDownRef.current = false
    setIsDragging(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #7C3AED0F 55%, #7C3AED1F 100%)' }}
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
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(168,85,247,0.75) 55%, transparent 100%)' }}
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
                key="claimed"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <p className="text-gray-900 text-[22px] font-bold">★ Your wish was granted! ✨</p>
                <p className="text-gray-500 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            ) : (
              <motion.div key="draw" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-gray-900 text-[22px] font-bold leading-snug">
                  Drag the puck to<br />summon the genie
                </p>
                <p className="text-gray-500 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Circle arena */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center mb-5"
          style={{ width: CONTAINER, height: CONTAINER, touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* SVG layer */}
          <svg
            viewBox={`0 0 ${CONTAINER} ${CONTAINER}`}
            className="absolute inset-0 pointer-events-none"
            style={{ width: CONTAINER, height: CONTAINER, overflow: 'visible' }}
          >
            <defs>
              {/* Ultra-wide atmospheric bloom */}
              <filter id="bloomWide" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="22" result="blur" />
                <feMerge><feMergeNode in="blur" /></feMerge>
              </filter>
              <filter id="bloomMed" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge><feMergeNode in="blur" /></feMerge>
              </filter>
              <filter id="tipGlow" x="-300%" y="-300%" width="700%" height="700%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#A855F7" floodOpacity="1" />
              </filter>
            </defs>

            {/* Guide ring — light neutral dashes for undrawn portion */}
            {!claimed && (
              <>
                <circle cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke="rgba(124,58,237,0.08)" strokeWidth="28" />
                <circle cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke="rgba(124,58,237,0.35)" strokeWidth="1.5"
                  strokeDasharray="8 10"
                />
              </>
            )}

            {/* Tick marks at 12 / 3 / 6 / 9 o'clock */}
            {!claimed && [0, 90, 180, 270].map(deg => {
              const rad = (deg - 90) * Math.PI / 180
              return (
                <line key={deg}
                  x1={CX + (RING_R - 10) * Math.cos(rad)} y1={CY + (RING_R - 10) * Math.sin(rad)}
                  x2={CX + (RING_R + 10) * Math.cos(rad)} y2={CY + (RING_R + 10) * Math.sin(rad)}
                  stroke="rgba(124,58,237,0.4)" strokeWidth="1.5" strokeLinecap="round"
                />
              )
            })}

            {/* Progress arc — 4-layer purple plasma, dashoffset for GPU-smooth animation */}
            {coverage > 0 && !claimed && (
              <>
                <circle
                  cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke={`rgba(168,85,247,${0.08 + coverage * 0.18})`}
                  strokeWidth="46" strokeLinecap="round"
                  strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC * (1 - coverage)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`, transition: 'stroke-dashoffset 0.03s linear' }}
                  filter="url(#bloomWide)"
                />
                <circle
                  cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke={`rgba(192,132,252,${0.28 + coverage * 0.28})`}
                  strokeWidth="22" strokeLinecap="round"
                  strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC * (1 - coverage)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`, transition: 'stroke-dashoffset 0.03s linear' }}
                  filter="url(#bloomMed)"
                />
                <circle
                  cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke={`rgba(167,139,250,${0.86 + coverage * 0.14})`}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC * (1 - coverage)}
                  style={{
                    transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`,
                    filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.80))',
                    transition: 'stroke-dashoffset 0.03s linear',
                  }}
                />
                <circle
                  cx={CX} cy={CY} r={RING_R} fill="none"
                  stroke="rgba(233,213,255,0.92)"
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC * (1 - coverage)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`, transition: 'stroke-dashoffset 0.03s linear' }}
                />
              </>
            )}

            {/* Puck glow halo in SVG (behind the HTML puck) */}
            {!claimed && (
              <>
                <circle cx={puckX} cy={puckY} r={34}
                  fill={`rgba(168,85,247,${0.06 + coverage * 0.18})`}
                  filter="url(#bloomWide)" />
                <circle cx={puckX} cy={puckY} r={18}
                  fill={`rgba(192,132,252,${0.18 + coverage * 0.30})`}
                  filter="url(#bloomMed)" />
              </>
            )}

            {/* Clockwise direction arrow — only before drag starts */}
            {coverage === 0 && !claimed && (
              <path d="M 162 28 A 112 112 0 0 1 234 112"
                fill="none" stroke="rgba(168,85,247,0.45)" strokeWidth="2.5"
                strokeLinecap="round" strokeDasharray="6 5" />
            )}

            {/* Completed ring — purple plasma */}
            {claimed && (
              <>
                <circle cx={CX} cy={CY} r={RING_R}
                  fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="46"
                  filter="url(#bloomWide)" />
                <circle cx={CX} cy={CY} r={RING_R}
                  fill="none" stroke="rgba(192,132,252,0.42)" strokeWidth="22"
                  filter="url(#bloomMed)" />
                <circle cx={CX} cy={CY} r={RING_R}
                  fill="none" stroke="#A855F7" strokeWidth="10"
                  filter="url(#ringGlow)" />
                <circle cx={CX} cy={CY} r={RING_R}
                  fill="none" stroke="rgba(233,213,255,0.92)" strokeWidth="2" />
              </>
            )}
          </svg>

          {/* Guide dot — glowing magic orb that marks current position on the arc */}
          {!claimed && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: 0, top: 0, width: 28, height: 28, zIndex: 20,
                transform: `translate(${puckX - 14}px, ${puckY - 14}px)`,
                willChange: 'transform',
                transition: 'transform 0.03s linear',
              }}
            >
              <motion.div
                style={{ width: 28, height: 28, position: 'relative' }}
                animate={!isDragging && coverage === 0
                  ? { scale: [1, 1.22, 1], opacity: [0.82, 1, 0.82] }
                  : { scale: isDragging ? 1.1 : 1, opacity: 1 }
                }
                transition={!isDragging && coverage === 0
                  ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.1 }
                }
              >
                {/* Soft atmospheric halo */}
                <div style={{
                  position: 'absolute', inset: -10, borderRadius: '50%',
                  background: `rgba(168,85,247,${0.18 + coverage * 0.38})`,
                  filter: 'blur(9px)',
                }} />
                {/* Orb body */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 32%, #fff 0%, rgba(216,180,254,0.95) 42%, rgba(168,85,247,0.85) 100%)',
                  boxShadow: isDragging
                    ? '0 0 0 1.5px rgba(192,132,252,0.95), 0 0 14px 5px rgba(168,85,247,0.65)'
                    : '0 0 0 1px rgba(192,132,252,0.75), 0 0 8px 3px rgba(168,85,247,0.42)',
                }} />
                {/* Bright centre spark */}
                <div style={{
                  position: 'absolute', width: 7, height: 7,
                  top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 0 4px 2px rgba(233,213,255,0.8)',
                }} />
              </motion.div>
            </div>
          )}

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
                  className="absolute w-2.5 h-2.5 rounded-full bg-purple-400"
                  style={{
                    left: CX + p.dist * Math.cos((p.angle * Math.PI) / 180) - 5,
                    top:  CY + p.dist * Math.sin((p.angle * Math.PI) / 180) - 5,
                    boxShadow: '0 0 8px 3px rgba(168,85,247,0.75)',
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
                  style={{ left: CX - 5, top: CY - 5, background: '#A855F7', boxShadow: '0 0 8px 3px rgba(168,85,247,0.85)' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 0.75, delay: p.delay, ease: 'easeOut' }}
                />
              )
            })}
          </AnimatePresence>

          {/* Inner circle — lamp or genie */}
          <motion.div
            className="absolute inset-6 rounded-full flex items-center justify-center overflow-visible"
            style={{
              background: 'radial-gradient(circle at 40% 35%, rgba(110,45,210,0.75) 0%, rgba(18,6,50,0.96) 70%)',
              boxShadow: claimed
              ? '0 0 0 2px rgba(168,85,247,0.70), 0 0 50px 20px rgba(168,85,247,0.38), 0 0 100px 34px rgba(147,51,234,0.22), inset 0 0 60px 20px rgba(192,132,252,0.14)'
              : coverage > 0.03
                ? `0 0 0 ${0.5 + coverage * 2}px rgba(168,85,247,${0.14 + coverage * 0.52}), 0 0 ${14 + coverage * 52}px ${5 + coverage * 22}px rgba(168,85,247,${0.10 + coverage * 0.34}), 0 0 ${30 + coverage * 75}px ${8 + coverage * 28}px rgba(147,51,234,${0.04 + coverage * 0.20}), inset 0 0 ${5 + coverage * 52}px ${1.5 + coverage * 20}px rgba(192,132,252,${0.02 + coverage * 0.16})`
                : '0 0 22px rgba(109,40,217,0.16)',
            }}
          >
            {/* Bokeh light orbs */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,80,40,0.13)', filter: 'blur(24px)', left: '8%', top: '18%' }} />
              <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,165,30,0.11)', filter: 'blur(20px)', right: '12%', bottom: '22%' }} />
              <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: 'rgba(120,40,230,0.20)', filter: 'blur(18px)', right: '22%', top: '12%' }} />
            </div>
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.div
                  key="genie"
                  initial={{ scale: 0, y: 20, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 13, delay: 0.08 }}
                >
                  <img src="/genie.png" alt="Genie" style={{ width: 162, height: 'auto', objectFit: 'contain' }} />
                </motion.div>
              ) : (
                <motion.div
                  key="lamp"
                  animate={isDragging
                    ? { scale: [1, 1.06, 1], rotate: [-3, 3, -3, 0] }
                    : { scale: [1, 1.025, 1] }
                  }
                  transition={isDragging
                    ? { duration: 0.28, repeat: Infinity }
                    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    filter: coverage > 0.6
                      ? `drop-shadow(0 0 ${10 + (coverage - 0.6) * 20}px rgba(168,85,247,0.9)) drop-shadow(0 0 20px rgba(168,85,247,0.5))`
                      : coverage > 0.2
                        ? 'drop-shadow(0 0 8px rgba(168,85,247,0.5))'
                        : 'drop-shadow(0 0 3px rgba(168,85,247,0.2))',
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
                <p className="text-sm font-medium text-gray-500">
                  Circle progress
                </p>
                <motion.p
                  key={coveragePct}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: coveragePct > 60 ? '#A855F7' : coveragePct > 25 ? '#7C3AED' : '#9CA3AF' }}
                  animate={{ scale: [1.15, 1] }}
                  transition={{ duration: 0.15 }}
                >
                  {coveragePct}%
                </motion.p>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #C084FC, #A855F7, #7C3AED)',
                    boxShadow: coveragePct > 0 ? `0 0 ${8 + coveragePct / 10}px rgba(168,85,247,0.75)` : 'none',
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
                  <p className="text-sm font-semibold" style={{ color: '#7C3AED' }}>
                    Grab the puck and drag clockwise ↻
                  </p>
                  <p className="text-xs mt-0.5 text-gray-400">
                    Take it all the way around the ring
                  </p>
                </motion.div>
              )}
              {coverage > 0 && coverage < 0.85 && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-xs mt-2"
                  style={{ color: coverage > 0.6 ? '#7C3AED' : '#9CA3AF' }}
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
              className="text-gray-900 font-bold text-lg mb-4"
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
            background: '#7C3AED0D',
            border: '1px solid #7C3AED30',
            boxShadow: '0 8px 32px rgba(124,58,237,0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(234,179,8,0.15)', color: '#B45309', border: '1px solid rgba(234,179,8,0.3)' }}>
              {pts} pts
            </span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Gift className="w-3 h-3" />
              <span>{claimed ? available - 1 : available} Available</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
              🎁
            </div>
            <div>
              <p className="text-gray-900 font-bold text-[15px] leading-tight">{name}</p>
              <p className="text-[11px] mt-0.5 text-gray-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] flex-wrap text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>Claim Before</span>
            </div>
            <span className="font-semibold text-gray-700">{claimBefore}</span>
            <span className="opacity-30 mx-0.5">|</span>
            <div className="flex items-center gap-1">
              <Gift className="w-3 h-3" />
              <span>Redeem Before</span>
            </div>
            <span className="font-semibold text-gray-700">{redeemBefore}</span>
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
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
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
