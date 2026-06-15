'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { campaigns } from '@/lib/mock-data'

const POINTS_PER_CHECKIN = 100
const MAX_CHECKINS_PER_DAY = 1

type State = 'idle' | 'checking' | 'won'

function CheckInInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign')
  const campaign = campaigns.find(c => c.id === campaignId)
  const config = campaign?.config as any
  const color = '#1F2937'

  const [state, setState] = useState<State>('idle')
  const [checkInCount, setCheckInCount] = useState(0)
  const [streak] = useState((config as any)?.currentStreak ?? 5)
  const [totalPoints] = useState((config as any)?.totalPoints ?? 500)

  const handleCheckIn = () => {
    if (state === 'checking') return
    setState('checking')
    setTimeout(() => setState('won'), 800)
  }

  if (state === 'won') {
    return (
      <WinCelebration
        reward={`+${POINTS_PER_CHECKIN} Points`}
        emoji="📍"
        hidePlayAgain
        onClose={() => {
          setCheckInCount(c => c + 1)
          setState('idle')
        }}
      />
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1F2937 0%, #111827 40%, #0F172A 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(31,41,55,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      {/* Campaign Details Card — At Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-5 mb-8 p-4 rounded-2xl relative z-10"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(31,41,55,0.5)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">📍 Daily Check-in</h2>
            <p className="text-xs text-white/60 mt-1">Earn 100 points each day</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#10B981', color: '#fff' }}>
            LIVE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Today</p>
            <p className="text-white font-bold text-sm">+{POINTS_PER_CHECKIN} pts</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">🔥 Streak</p>
            <p className="text-white font-bold text-sm">{streak} days</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">⭐ Total</p>
            <p className="text-white font-bold text-sm">{totalPoints + checkInCount * POINTS_PER_CHECKIN} pts</p>
          </div>
        </div>
      </motion.div>

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-white/50 text-sm hover:text-white/70 transition-colors mb-6 self-start relative z-10 px-5"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Title */}
      <div className="text-center z-10 mb-8">
        <h1 className="text-xl font-extrabold text-white">Check In Today!</h1>
        <p className="text-sm text-white/45 mt-1">Tap below to check in and earn {POINTS_PER_CHECKIN} points</p>
      </div>

      {/* Check-in Card */}
      <div className="flex-1 flex items-center justify-center z-10 px-5 mb-8">
        <motion.button
          onClick={handleCheckIn}
          disabled={state === 'checking'}
          whileHover={state === 'idle' ? { scale: 1.05 } : {}}
          whileTap={state === 'idle' ? { scale: 0.98 } : {}}
          animate={
            state === 'checking'
              ? {
                  boxShadow: [
                    '0 0 0 0 rgba(16, 185, 129, 0.4)',
                    '0 0 0 40px rgba(16, 185, 129, 0)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
          className="w-48 h-48 rounded-3xl flex flex-col items-center justify-center text-6xl font-black transition-all cursor-pointer relative"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
          }}
        >
          {state === 'checking' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              ✓
            </motion.div>
          ) : (
            '📍'
          )}
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="text-center z-10 text-xs text-white/40 px-5">
        <p>You can check in once per day</p>
        <p className="mt-1">Come back tomorrow for more points!</p>
      </div>
    </div>
  )
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <CheckInInner />
    </Suspense>
  )
}
