'use client'
import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.checkin

const POINTS_PER_CHECKIN = 100
const INITIAL_STREAK     = 5
const INITIAL_POINTS     = 500
const BUSINESS_NAME      = 'Amber Cafe'
const BUSINESS_EMOJI     = '☕'
const ACTIVE_TODAY       = 67

type State = 'idle' | 'checking' | 'confirmed'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning!'
  if (h < 17) return 'Good afternoon!'
  return 'Good evening!'
}

function CheckInInner() {
  const router = useRouter()
  const [state, setState]       = useState<State>('idle')
  const [streak, setStreak]     = useState(INITIAL_STREAK)
  const [points, setPoints]     = useState(INITIAL_POINTS)

  const handleCheckIn = () => {
    if (state !== 'idle') return
    setState('checking')
    setTimeout(() => {
      setStreak(s => s + 1)
      setPoints(p => p + POINTS_PER_CHECKIN)
      setState('confirmed')
    }, 900)
  }

  const today = new Date('2026-06-15').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, #FFFFFF 0%, ${meta.cardFrom}0F 55%, ${meta.cardFrom}1F 100%)` }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${meta.cardFrom}18 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${meta.cardFrom}14 0%, transparent 70%)`, filter: 'blur(48px)' }} />

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>

      {/* Date */}
      <p className="absolute top-14 right-4 text-[11px] font-semibold text-gray-400 z-20">{today}</p>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">

        <AnimatePresence mode="wait">
          {state !== 'confirmed' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              {/* Greeting */}
              <p className="text-gray-500 text-base font-semibold mb-1">{getGreeting()}</p>

              {/* Business name */}
              <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {BUSINESS_NAME} {BUSINESS_EMOJI}
              </h1>

              {/* Streak */}
              <div className="flex flex-col items-center mb-10">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-7xl font-black leading-none"
                  style={{ color: meta.cardFrom }}
                >
                  {streak}
                </motion.div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-bold text-gray-700">day streak</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Keep it going — don't break it!</p>
              </div>

              {/* Check-in stamp button */}
              <motion.button
                onClick={handleCheckIn}
                disabled={state === 'checking'}
                whileTap={{ scale: 0.94 }}
                className="relative w-36 h-36 rounded-full flex items-center justify-center mb-8 select-none"
                style={{
                  background: `${meta.cardFrom}12`,
                  border: `3px solid ${meta.cardFrom}40`,
                  boxShadow: `0 0 0 8px ${meta.cardFrom}0D, 0 20px 60px rgba(0,0,0,0.08)`,
                }}
                animate={state === 'idle' ? {
                  boxShadow: [
                    `0 0 0 8px ${meta.cardFrom}0D, 0 20px 60px rgba(0,0,0,0.08)`,
                    `0 0 0 16px ${meta.cardFrom}14, 0 20px 60px rgba(0,0,0,0.1)`,
                    `0 0 0 8px ${meta.cardFrom}0D, 0 20px 60px rgba(0,0,0,0.08)`,
                  ],
                } : {}}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {state === 'checking' ? (
                  <motion.span
                    className="text-5xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ color: meta.cardFrom }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span className="text-6xl">{BUSINESS_EMOJI}</span>
                )}
              </motion.button>

              {/* Points + social */}
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Tap to earn <span className="font-bold" style={{ color: meta.cardFrom }}>+{POINTS_PER_CHECKIN} pts</span>
              </p>
              <p className="text-xs text-gray-400">{ACTIVE_TODAY} others checked in today</p>
            </motion.div>
          ) : (
            /* Confirmed state */
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="w-full flex flex-col items-center"
            >
              {/* Big checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.1 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: `${meta.cardFrom}12`, border: `3px solid ${meta.cardFrom}40` }}
              >
                <span className="text-5xl" style={{ color: meta.cardFrom }}>✓</span>
              </motion.div>

              <p className="text-gray-500 text-sm font-semibold mb-1">Checked in at</p>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">{BUSINESS_NAME} {BUSINESS_EMOJI}</h2>

              {/* Updated streak */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.2 }}
                  className="text-7xl font-black leading-none"
                  style={{ color: meta.cardFrom }}
                >
                  {streak}
                </motion.div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-bold text-gray-700">day streak!</span>
                </div>
              </div>

              {/* Points earned */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-3 rounded-2xl px-6 py-3 mb-4"
                style={{ background: `${meta.cardFrom}0D`, border: `1px solid ${meta.cardFrom}30` }}
              >
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Earned today</p>
                  <p className="text-xl font-black text-gray-900">+{POINTS_PER_CHECKIN} pts</p>
                </div>
                <div className="w-px h-8" style={{ background: `${meta.cardFrom}30` }} />
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                  <p className="text-xl font-black text-gray-900">⭐ {points}</p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mb-8 text-center"
              >
                See you tomorrow for Day {streak + 1}! ⭐
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.back()}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 border border-gray-200 text-gray-700"
              >
                ← Back to {BUSINESS_NAME}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckInInner />
    </Suspense>
  )
}
