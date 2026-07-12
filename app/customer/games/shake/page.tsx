'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'
import { MECHANIC_META, hexToRgb, hexMix } from '@/lib/utils'

const meta = MECHANIC_META.shake
const accentRgb = hexToRgb(meta.cardFrom).join(',')
const lightAccent = hexMix(meta.cardFrom, '#FFFFFF', 0.35)
const lightAccentRgb = hexToRgb(lightAccent).join(',')

const WIN_RATE    = 0.8
const MAX_PLAYS   = 10
const PLAYS_DONE  = 7
const MIN_DELTA   = 5    // m/s² acceleration threshold
const CHARGE_RATE = 2.4  // % per animation frame while shaking
const DRAIN_RATE  = 1.5  // % per animation frame while still

const PRIZES = ['Free Coffee ☕', 'Free Pastry 🥐', '₹50 Off 🏷️', 'Free Latte ☕']

type State = 'idle' | 'result'

// Inline shake phone SVG
function ShakeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M2 7.5l2 2-2 2" />
      <path d="M22 7.5l-2 2 2 2" />
    </svg>
  )
}

export default function ShakeWinPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<State>('idle')
  const [won, setWon]             = useState(false)
  const [prize, setPrize]         = useState('')
  const [charge, setCharge]       = useState(0)
  const [isActive, setIsActive]   = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)

  // Refs (survive re-renders without causing them)
  const chargeRef       = useRef(0)
  const firedRef        = useRef(false)
  const isHoldingRef    = useRef(false)
  const lastMotionAtRef = useRef(0)
  const prevAccRef      = useRef({ x: 0, y: 0, z: 0 })
  const rafRef          = useRef<number>(0)
  const motionCleanup   = useRef<(() => void) | null>(null)

  const triggerResult = useCallback(() => {
    firedRef.current = true
    const didWin = Math.random() < WIN_RATE
    setPrize(didWin ? PRIZES[Math.floor(Math.random() * PRIZES.length)] : '')
    setWon(didWin)
    setCharge(100)
    setTimeout(() => setGameState('result'), 500)
  }, [])

  // rAF charge loop
  useEffect(() => {
    let running = true

    const loop = () => {
      if (!running) return

      if (!firedRef.current) {
        const shaking = isHoldingRef.current || (Date.now() - lastMotionAtRef.current) < 160

        chargeRef.current = shaking
          ? Math.min(100, chargeRef.current + CHARGE_RATE)
          : Math.max(0, chargeRef.current - DRAIN_RATE)

        setCharge(Math.round(chargeRef.current))
        setIsActive(shaking)

        if (chargeRef.current >= 100) {
          triggerResult()
          return
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [triggerResult])

  // Wire up DeviceMotion
  function attachMotionListener() {
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const x = acc.x ?? 0, y = acc.y ?? 0, z = acc.z ?? 0
      const delta = Math.abs(x - prevAccRef.current.x)
                  + Math.abs(y - prevAccRef.current.y)
                  + Math.abs(z - prevAccRef.current.z)
      prevAccRef.current = { x, y, z }
      if (delta > MIN_DELTA) lastMotionAtRef.current = Date.now()
    }
    window.addEventListener('devicemotion', handler)
    motionCleanup.current = () => window.removeEventListener('devicemotion', handler)
  }

  useEffect(() => {
    // iOS 13+ requires explicit permission
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      setNeedsPermission(true)
      return
    }
    // Android / desktop: auto-granted
    attachMotionListener()
    return () => motionCleanup.current?.()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const requestPermission = async () => {
    try {
      const req = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission
      const result = await req?.()
      if (result === 'granted') {
        setNeedsPermission(false)
        attachMotionListener()
      }
    } catch {
      // denied — tap fallback still works
      setNeedsPermission(false)
    }
  }

  // Pointer hold (desktop / touch fallback)
  const startHold = () => { isHoldingRef.current = true }
  const stopHold  = () => { isHoldingRef.current = false }

  const handlePlayAgain = () => {
    chargeRef.current    = 0
    firedRef.current     = false
    isHoldingRef.current = false
    lastMotionAtRef.current = 0
    setCharge(0)
    setIsActive(false)
    setWon(false)
    setPrize('')
    setGameState('idle')
  }

  if (gameState === 'result' && won)  return <WinCelebration reward={prize} emoji={meta.emoji} accentFrom={meta.cardFrom} accentTo={meta.cardTo} onClose={handlePlayAgain} />
  if (gameState === 'result' && !won) return <NoWin accentTo={meta.cardFrom} onClose={handlePlayAgain} />

  // Circumference of the SVG ring (r=47): 2π×47 ≈ 295.3
  const CIRC = 295.3

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(145deg, #050B1F 0%, ${meta.cardTo} 50%, #03050F 100%)` }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-16 -right-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${accentRgb},0.28) 0%, transparent 70%)`, filter: 'blur(52px)' }} />
      <div className="absolute bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${lightAccentRgb},0.22) 0%, transparent 70%)`, filter: 'blur(44px)' }} />

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <p className="text-white/55 text-base font-medium">Shake Your Phone,</p>
          <h1 className="text-[28px] font-black text-white tracking-tight leading-tight">WIN A REWARD</h1>
        </motion.div>

        {/* Entries */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white/35 text-sm mb-10"
        >
          {PLAYS_DONE}/{MAX_PLAYS} Entries done
        </motion.p>

        {/* Shake circle */}
        <motion.div
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="relative w-56 h-56 rounded-full flex items-center justify-center cursor-pointer select-none mb-8"
          style={{
            background: `radial-gradient(circle at 40% 35%, rgba(${accentRgb},0.55) 0%, rgba(5,10,40,0.92) 70%)`,
          }}
          animate={isActive ? {
            scale: [1, 1.04, 0.97, 1.03, 1],
            boxShadow: [
              `0 0 0 14px rgba(${accentRgb},0.12), 0 0 0 28px rgba(${accentRgb},0.06)`,
              `0 0 0 22px rgba(${accentRgb},0.18), 0 0 0 44px rgba(${accentRgb},0.08)`,
              `0 0 0 16px rgba(${accentRgb},0.14), 0 0 0 32px rgba(${accentRgb},0.07)`,
            ],
          } : {
            scale: [1, 1.02, 1],
            boxShadow: [
              `0 0 0 10px rgba(${accentRgb},0.1), 0 0 0 20px rgba(${accentRgb},0.05)`,
              `0 0 0 16px rgba(${accentRgb},0.13), 0 0 0 32px rgba(${accentRgb},0.06)`,
              `0 0 0 10px rgba(${accentRgb},0.1), 0 0 0 20px rgba(${accentRgb},0.05)`,
            ],
          }}
          transition={isActive
            ? { duration: 0.28, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 2.6,  repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Charge ring */}
          {charge > 0 && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50" cy="50" r="47"
                fill="none"
                stroke={`rgba(${lightAccentRgb},0.55)`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(charge / 100) * CIRC} ${CIRC}`}
              />
            </svg>
          )}

          {/* Shake icon */}
          <motion.div
            animate={isActive
              ? { rotate: [-10, 10, -10, 10, 0], x: [-2, 2, -2, 2, 0] }
              : { rotate: [0, 6, -6, 0] }
            }
            transition={isActive
              ? { duration: 0.22, repeat: Infinity }
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <ShakeIcon className="w-20 h-20 text-white" />
          </motion.div>
        </motion.div>

        {/* iOS permission button */}
        {needsPermission && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={requestPermission}
            className="mb-5 px-6 py-2.5 rounded-2xl text-sm font-bold border"
            style={{ color: lightAccent, borderColor: `rgba(${lightAccentRgb},0.35)`, background: `rgba(${accentRgb},0.15)` }}
          >
            Enable Shake Detection
          </motion.button>
        )}

        {/* Win rate pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style={{ background: `rgba(${accentRgb},0.18)`, border: `1px solid rgba(${accentRgb},0.35)` }}
        >
          <span>🎁</span>
          <span className="text-sm font-bold" style={{ color: lightAccent }}>
            {Math.round(WIN_RATE * 100)}% Chances to win
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/30 text-xs text-center"
        >
          {needsPermission
            ? 'Tap above to enable motion, then shake!'
            : 'Shake your phone or hold the circle to win'}
        </motion.p>
      </div>
    </div>
  )
}
