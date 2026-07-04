'use client'
import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Gift } from 'lucide-react'
import Link from 'next/link'

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

const SMOKE_BLOBS: [number, number, number, string][] = [
  [0.12, 0.22, 0.30, 'rgba(60,30,140,0.9)'],
  [0.68, 0.14, 0.25, 'rgba(50,25,120,0.85)'],
  [0.40, 0.52, 0.35, 'rgba(70,35,160,0.9)'],
  [0.85, 0.42, 0.28, 'rgba(45,22,110,0.8)'],
  [0.20, 0.75, 0.30, 'rgba(55,28,130,0.85)'],
  [0.75, 0.72, 0.28, 'rgba(60,30,140,0.8)'],
  [0.52, 0.28, 0.20, 'rgba(40,20,100,0.75)'],
  [0.08, 0.52, 0.22, 'rgba(50,25,120,0.8)'],
]

const CANVAS_W = 390
const CANVAS_H = 420

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: 10 + (i * 17) % 80,
  delay: (i * 0.07) % 1.2,
  duration: 1.4 + (i * 0.09) % 0.8,
  color: i % 3 === 0 ? '#F59E0B' : i % 3 === 1 ? '#A855F7' : '#EAB308',
  size: 5 + (i * 3) % 7,
  rotate: (i * 37) % 360,
}))

const SPARKLES = [
  { x: -70, y: -20, delay: 0 },
  { x: 70, y: -30, delay: 0.3 },
  { x: -80, y: 40, delay: 0.6 },
  { x: 80, y: 50, delay: 0.15 },
  { x: 0, y: -85, delay: 0.45 },
  { x: -50, y: 75, delay: 0.75 },
  { x: 55, y: 75, delay: 0.2 },
]

const DEFAULT_REWARD = {
  name: 'Free Coffee',
  subtitle: 'Any size · All locations',
  pts: 50,
  available: 18,
  claimBefore: '7 Jul',
  redeemBefore: '7 Jul',
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

function drawSmoke(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height

  ctx.fillStyle = '#100520'
  ctx.fillRect(0, 0, W, H)

  for (const [fx, fy, fr, color] of SMOKE_BLOBS) {
    const cx = fx * W
    const cy = fy * H
    const r = fr * Math.max(W, H)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  const midX = W / 2
  const midY = H / 2
  ctx.strokeStyle = 'rgba(100,60,200,0.3)'
  ctx.lineWidth = 10
  for (const radius of [45, 80, 115, 150]) {
    ctx.beginPath()
    ctx.arc(midX, midY, radius, -0.4, Math.PI * 1.3)
    ctx.stroke()
  }

  ctx.font = 'bold 15px system-ui'
  ctx.fillStyle = 'rgba(180,150,255,0.55)'
  ctx.textAlign = 'center'
  ctx.fillText('Scratch to reveal', midX, midY + 8)
}

function ScratchSmokeContent() {
  const router = useRouter()
  const params = useSearchParams()

  const name         = params.get('name')          ?? DEFAULT_REWARD.name
  const subtitle     = params.get('subtitle')      ?? DEFAULT_REWARD.subtitle
  const pts          = Number(params.get('pts'))   || DEFAULT_REWARD.pts
  const available    = Number(params.get('avail')) || DEFAULT_REWARD.available
  const claimBefore  = params.get('cb')            ?? DEFAULT_REWARD.claimBefore
  const redeemBefore = params.get('rb')            ?? DEFAULT_REWARD.redeemBefore

  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const isDrawing    = useRef(false)
  const firedRef     = useRef(false)
  const checkTimer   = useRef<ReturnType<typeof setInterval> | null>(null)

  const [coverage, setCoverage]   = useState(0)
  const [completed, setCompleted] = useState(false)
  const [smokeOpacity, setSmokeOpacity] = useState(1)

  const getCoverage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let transparent = 0
    let total = 0
    for (let i = 3; i < data.length; i += 5 * 4) {
      total++
      if (data[i] < 15) transparent++
    }
    return total > 0 ? transparent / total : 0
  }, [])

  const triggerComplete = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true
    if (checkTimer.current) clearInterval(checkTimer.current)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([60, 30, 100])
    setSmokeOpacity(0)
    setTimeout(() => setCompleted(true), 650)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = CANVAS_W
    canvas.height = CANVAS_H
    drawSmoke(canvas)

    checkTimer.current = setInterval(() => {
      if (firedRef.current) return
      const pct = getCoverage()
      setCoverage(Math.round(pct * 100))
      if (pct >= 0.62) triggerComplete()
    }, 150)

    return () => {
      if (checkTimer.current) clearInterval(checkTimer.current)
    }
  }, [getCoverage, triggerComplete])

  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || firedRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left)  * scaleX
    const y = (clientY - rect.top)   * scaleY
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (firedRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawing.current = true
    scratch(e.clientX, e.clientY)
  }, [scratch])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || firedRef.current) return
    scratch(e.clientX, e.clientY)
  }, [scratch])

  const onPointerUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #2D0A6B 0%, #1A0D3A 45%, #0E060C 78%, #1C0410 100%)' }}
    >
      <StarField />

      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-30"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center px-5 pt-20 pb-8 relative z-10">

        <div className="text-center mb-6 min-h-[60px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="done-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <p className="text-white text-[21px] font-bold leading-snug">
                  ★ The smoke has cleared<br />Your reward is revealed
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            ) : (
              <motion.div key="scratch-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-white text-[21px] font-bold leading-snug">
                  Scratch the smoke to claim<br />your reward
                </p>
                <p className="text-white/50 text-sm mt-1.5">The Magic is in your hand</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scratch zone */}
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl mb-4"
          style={{ height: CANVAS_H }}
        >
          {/* Layer 1: Revealed scene */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            animate={completed ? { scale: 1 } : { scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Sparkles around genie */}
            {completed && SPARKLES.map((sp, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-300 text-lg pointer-events-none"
                style={{ left: '50%', top: '42%' }}
                initial={{ opacity: 0, x: sp.x * 0.4, y: sp.y * 0.4, scale: 0 }}
                animate={{ opacity: [0, 1, 0.7, 0], x: sp.x, y: sp.y, scale: [0, 1.4, 1, 0] }}
                transition={{ delay: sp.delay + 0.2, duration: 1.1, ease: 'easeOut' }}
              >
                ✦
              </motion.div>
            ))}

            {/* Genie in golden circle */}
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(80,30,160,0.85) 0%, rgba(14,5,32,0.98) 70%)',
                boxShadow: completed
                  ? '0 0 0 3px #F59E0B, 0 0 32px rgba(245,158,11,0.55), 0 0 80px rgba(109,40,217,0.35)'
                  : '0 0 0 2px rgba(245,158,11,0.3)',
              }}
            >
              <motion.span
                className="text-8xl leading-none"
                animate={completed ? { scale: [0.8, 1.12, 1], rotate: [0, -8, 4, 0] } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
              >
                🧞
              </motion.span>
            </div>
            <p
              className="text-base font-semibold tracking-wide"
              style={{ color: 'rgba(245,200,120,0.9)', textShadow: '0 0 12px rgba(245,158,11,0.6)' }}
            >
              Your reward awaits
            </p>
          </motion.div>

          {/* Layer 2: Canvas smoke */}
          <motion.div
            className="absolute inset-0 z-10"
            animate={{ opacity: smokeOpacity }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ pointerEvents: completed ? 'none' : 'auto' }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                touchAction: 'none',
                cursor: completed ? 'default' : 'crosshair',
                display: 'block',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </motion.div>

          {/* Layer 3: Confetti */}
          <AnimatePresence>
            {completed && (
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                {CONFETTI_PIECES.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{
                      left: `${p.x}%`,
                      top: -10,
                      width: p.size,
                      height: p.size * 0.6,
                      background: p.color,
                      rotate: p.rotate,
                    }}
                    initial={{ y: 0, opacity: 1, rotate: p.rotate }}
                    animate={{ y: CANVAS_H + 20, opacity: [1, 1, 0], rotate: p.rotate + 360 }}
                    transition={{ delay: p.delay, duration: p.duration, ease: 'easeIn' }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {!completed && (
            <motion.div
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full max-w-sm mb-5"
            >
              <p className="text-white/60 text-center text-xs mb-2">
                {coverage}% revealed
              </p>
              <div
                className="w-full h-[3px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #A855F7, #FBBF24)' }}
                  animate={{ width: `${Math.min(coverage / 0.62, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success label */}
        <AnimatePresence>
          {completed && (
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
          className="w-full max-w-sm rounded-2xl p-4"
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
              <span>{completed ? available - 1 : available} Available</span>
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

        {/* View in Wallet */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full max-w-sm mt-4"
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
        {!completed && coverage < 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs mt-4"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            Scratch away the smoke to find your reward
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default function ScratchSmokePage() {
  return (
    <Suspense>
      <ScratchSmokeContent />
    </Suspense>
  )
}
