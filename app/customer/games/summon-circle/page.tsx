'use client'
import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift } from 'lucide-react'
import Link from 'next/link'

const CONTAINER = 300
const CX = 150
const CY = 150
const RING_R = 110
const RING_CIRC = 2 * Math.PI * RING_R
const SECTORS = 72

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
  { angle: 0,   dist: 90, delay: 0 },
  { angle: 72,  dist: 95, delay: 0.4 },
  { angle: 144, dist: 88, delay: 0.8 },
  { angle: 216, dist: 93, delay: 1.2 },
  { angle: 288, dist: 90, delay: 1.6 },
]

const BURST_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  angle: (i / 15) * 360,
  dist: 80 + Math.random() * 60,
  delay: Math.random() * 0.2,
}))

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 100,
  color: ['#F59E0B', '#FBBF24', '#D97706', '#FDE68A', '#A78BFA', '#8B5CF6'][i % 6],
  delay: Math.random() * 0.6,
  duration: 1.8 + Math.random() * 1.2,
  rotate: Math.random() * 360,
}))

const DEFAULT_REWARD = {
  name: 'Free Coffee',
  subtitle: 'Any size · All locations',
  pts: 50,
  available: 18,
  claimBefore: '7 Jul',
  redeemBefore: '7 Jul',
}

function CuteGenie() {
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
      <path d="M32 92 C26 76 34 64 28 52 C24 44 29 36 37 32"
        stroke="rgba(139,92,246,0.45)" strokeWidth="13" strokeLinecap="round"/>
      <path d="M60 92 C66 76 58 64 64 52 C68 44 63 36 55 32"
        stroke="rgba(139,92,246,0.45)" strokeWidth="13" strokeLinecap="round"/>
      <ellipse cx="46" cy="56" rx="18" ry="14" fill="#60A5FA"/>
      <path d="M28 52 Q17 41 22 31" stroke="#60A5FA" strokeWidth="9" strokeLinecap="round"/>
      <path d="M64 52 Q75 41 70 31" stroke="#60A5FA" strokeWidth="9" strokeLinecap="round"/>
      <circle cx="46" cy="25" r="23" fill="#60A5FA"/>
      <circle cx="23" cy="27" r="5.5" fill="#3B82F6"/>
      <circle cx="69" cy="27" r="5.5" fill="#3B82F6"/>
      <circle cx="20" cy="31" r="2.8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <ellipse cx="36" cy="21" rx="7.5" ry="8.5" fill="white"/>
      <ellipse cx="56" cy="21" rx="7.5" ry="8.5" fill="white"/>
      <circle cx="37.5" cy="22" r="5" fill="#1E3A8A"/>
      <circle cx="54.5" cy="22" r="5" fill="#1E3A8A"/>
      <circle cx="39.5" cy="19.5" r="1.8" fill="white"/>
      <circle cx="56.5" cy="19.5" r="1.8" fill="white"/>
      <ellipse cx="24" cy="34" rx="5" ry="3" fill="rgba(244,114,182,0.4)"/>
      <ellipse cx="68" cy="34" rx="5" ry="3" fill="rgba(244,114,182,0.4)"/>
      <ellipse cx="46" cy="31" rx="3" ry="2.5" fill="#3B82F6"/>
      <path d="M35 40 Q46 51 57 40" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
      <text x="1" y="14" fontSize="11" fill="#FBBF24" opacity="0.9">✦</text>
      <text x="72" y="10" fontSize="9" fill="#FBBF24" opacity="0.7">✦</text>
      <text x="76" y="50" fontSize="7" fill="#A78BFA" opacity="0.6">✦</text>
    </svg>
  )
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

function SummonCircleContent() {
  const router = useRouter()
  const params = useSearchParams()

  const name         = params.get('name')          ?? DEFAULT_REWARD.name
  const subtitle     = params.get('subtitle')      ?? DEFAULT_REWARD.subtitle
  const pts          = Number(params.get('pts'))   || DEFAULT_REWARD.pts
  const available    = Number(params.get('avail')) || DEFAULT_REWARD.available
  const claimBefore  = params.get('cb')            ?? DEFAULT_REWARD.claimBefore
  const redeemBefore = params.get('rb')            ?? DEFAULT_REWARD.redeemBefore

  const [coverage, setCoverage]     = useState(0)
  const [claimed, setClaimed]       = useState(false)
  const [isDrawing, setIsDrawing]   = useState(false)
  const [flash, setFlash]           = useState(false)
  const [showBurst, setShowBurst]   = useState(false)

  const visitedRef  = useRef<Set<number>>(new Set())
  const firedRef    = useRef(false)
  const isDownRef   = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const getSectorFromAngle = (angle: number) => {
    const normalized = ((angle * 180) / Math.PI + 360) % 360
    return Math.floor(normalized / 5) % SECTORS
  }

  const triggerClaim = useCallback(() => {
    firedRef.current = true
    setIsDrawing(false)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([80, 40, 120])
    setFlash(true)
    setTimeout(() => setFlash(false), 400)
    setShowBurst(true)
    setTimeout(() => setClaimed(true), 500)
  }, [])

  const getContainerCenter = useCallback(() => {
    if (!containerRef.current) return { x: CX, y: CY }
    const rect = containerRef.current.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (firedRef.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDownRef.current = true
    setIsDrawing(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDownRef.current || firedRef.current) return
    const center = getContainerCenter()
    const dx = e.clientX - center.x
    const dy = e.clientY - center.y
    const angle = Math.atan2(dy, dx)
    const sector = getSectorFromAngle(angle)
    visitedRef.current.add(sector)

    const cov = visitedRef.current.size / SECTORS
    setCoverage(cov)
    if (cov >= 0.85) triggerClaim()
  }

  const onPointerUp = () => {
    isDownRef.current = false
    setIsDrawing(false)
  }

  const coveragePct = Math.round(coverage * 100)
  const orbitVisible = coverage > 0.1

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #2D0A6B 0%, #1A0D3A 45%, #0E060C 78%, #1C0410 100%)' }}
    >
      <StarField />

      <AnimatePresence>
        {flash && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, times: [0, 0.4, 1] }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(245,158,11,0.7) 60%, transparent 100%)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {claimed && (
          <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
            {CONFETTI_PIECES.map((c, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-1.5 rounded-sm"
                style={{ left: `${c.x}%`, top: '-8px', background: c.color }}
                initial={{ y: 0, opacity: 1, rotate: c.rotate }}
                animate={{ y: '105vh', opacity: [1, 1, 0], rotate: c.rotate + 360 * 2 }}
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
                  ★ Your wish was granted! ✨
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            ) : (
              <motion.div key="summon-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-white text-[21px] font-bold leading-snug">
                  Summon the genie to claim<br />your reward
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          ref={containerRef}
          className="relative flex items-center justify-center mb-5"
          style={{
            width: CONTAINER,
            height: CONTAINER,
            touchAction: 'none',
            cursor: claimed ? 'default' : isDrawing ? 'crosshair' : 'crosshair',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <svg
            viewBox={`0 0 ${CONTAINER} ${CONTAINER}`}
            className="absolute inset-0 pointer-events-none"
            style={{ width: CONTAINER, height: CONTAINER }}
          >
            <defs>
              <filter id="goldGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.8" />
              </filter>
              <filter id="ringGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Guide ring — visible dashed track */}
            {!claimed && (
              <circle
                cx={CX} cy={CY} r={RING_R}
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="3"
                strokeDasharray="10 6"
              />
            )}

            {/* Tick marks at 12 / 3 / 6 / 9 o'clock */}
            {!claimed && [0, 90, 180, 270].map(deg => {
              const rad = (deg - 90) * Math.PI / 180
              return (
                <line
                  key={deg}
                  x1={CX + (RING_R - 12) * Math.cos(rad)}
                  y1={CY + (RING_R - 12) * Math.sin(rad)}
                  x2={CX + (RING_R + 12) * Math.cos(rad)}
                  y2={CY + (RING_R + 12) * Math.sin(rad)}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )
            })}

            {/* Progress arc — fills clockwise from 12 o'clock */}
            {coverage > 0 && !claimed && (
              <circle
                cx={CX} cy={CY} r={RING_R}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${coverage * RING_CIRC} ${RING_CIRC}`}
                style={{
                  transform: `rotate(-90deg)`,
                  transformOrigin: `${CX}px ${CY}px`,
                  filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.85))',
                }}
              />
            )}

            {/* Moving tip dot at arc head */}
            {coverage > 0 && !claimed && (() => {
              const a = (-90 + coverage * 360) * (Math.PI / 180)
              return (
                <circle
                  cx={CX + RING_R * Math.cos(a)}
                  cy={CY + RING_R * Math.sin(a)}
                  r={6}
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                />
              )
            })()}

            {/* Start-here arrow at 12 o'clock — shown before drawing begins */}
            {coverage === 0 && !claimed && (
              <>
                {/* Arrow shaft curving clockwise */}
                <path
                  d="M 150 40 A 110 110 0 0 1 195 55"
                  fill="none"
                  stroke="rgba(245,158,11,0.7)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
                {/* Arrowhead at tip */}
                <polygon
                  points="195,55 183,46 198,42"
                  fill="rgba(245,158,11,0.8)"
                />
              </>
            )}

            {/* Completed ring */}
            {claimed && (
              <circle
                cx={CX} cy={CY} r={RING_R}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                filter="url(#ringGlow)"
              />
            )}
          </svg>

          {/* Pulsing start dot at 12 o'clock */}
          {coverage === 0 && !claimed && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 14,
                height: 14,
                left: CX - 7,
                top: CY - RING_R - 7,
                background: '#F59E0B',
                boxShadow: '0 0 10px 3px rgba(245,158,11,0.7)',
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <AnimatePresence>
            {orbitVisible && !claimed && (
              <>
                {ORBIT_PARTICLES.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute pointer-events-none"
                    style={{ width: CONTAINER, height: CONTAINER, top: 0, left: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'linear', delay: p.delay }}
                  >
                    <motion.div
                      className="absolute w-2 h-2 rounded-full bg-amber-400"
                      style={{
                        left: CX + p.dist * Math.cos((p.angle * Math.PI) / 180) - 4,
                        top: CY + p.dist * Math.sin((p.angle * Math.PI) / 180) - 4,
                        boxShadow: '0 0 6px 2px rgba(245,158,11,0.7)',
                        opacity: Math.min(1, coverage * 3),
                      }}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showBurst && (
              <>
                {BURST_PARTICLES.map((p, i) => {
                  const rad = (p.angle * Math.PI) / 180
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full pointer-events-none"
                      style={{
                        left: CX - 4,
                        top: CY - 4,
                        background: '#F59E0B',
                        boxShadow: '0 0 6px 2px rgba(245,158,11,0.8)',
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos(rad) * p.dist,
                        y: Math.sin(rad) * p.dist,
                        opacity: 0,
                        scale: 0.2,
                      }}
                      transition={{ duration: 0.7, delay: p.delay, ease: 'easeOut' }}
                    />
                  )
                })}
              </>
            )}
          </AnimatePresence>

          <motion.div
            className="absolute inset-6 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 38% 32%, rgba(100,40,200,0.72) 0%, rgba(18,6,50,0.96) 70%)',
              boxShadow: isDrawing && !claimed
                ? '0 0 44px rgba(245,158,11,0.28), 0 0 80px rgba(109,40,217,0.22)'
                : claimed
                  ? '0 0 60px rgba(245,158,11,0.4), 0 0 100px rgba(109,40,217,0.28)'
                  : '0 0 20px rgba(109,40,217,0.16)',
            }}
          >
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.div
                  key="genie"
                  initial={{ scale: 0, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.1 }}
                >
                  <CuteGenie />
                </motion.div>
              ) : (
                <motion.div
                  key="lamp"
                  animate={isDrawing
                    ? { scale: [1, 1.05, 1], rotate: [-2, 2, -2, 0] }
                    : { scale: [1, 1.025, 1] }
                  }
                  transition={isDrawing
                    ? { duration: 0.3, repeat: Infinity }
                    : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="text-7xl leading-none"
                  style={{
                    filter: coverage > 0.6
                      ? `drop-shadow(0 0 ${8 + (coverage - 0.6) * 20}px rgba(245,158,11,0.8))`
                      : coverage > 0.2
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

        <AnimatePresence>
          {!claimed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full max-w-xs mb-5"
            >
              <p className="text-white text-center text-[17px] font-medium mb-2.5">
                {coveragePct}% complete
              </p>
              <div
                className="w-full h-[3px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FBBF24, #D97706)' }}
                  animate={{ width: `${Math.min(100, coveragePct)}%` }}
                  transition={{ duration: 0.08 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {!claimed && coverage === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-4"
          >
            <p className="text-sm font-semibold" style={{ color: 'rgba(245,158,11,0.9)' }}>
              Start at the gold dot ↑
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Draw a full circle clockwise ↻
            </p>
          </motion.div>
        )}
        {!claimed && coverage > 0 && coverage < 0.85 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs mt-2"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            Keep going ↻
          </motion.p>
        )}
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
