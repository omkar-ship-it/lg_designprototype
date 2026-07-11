'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Handshake } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'
import { ClaimInfoRow } from '@/components/customer/claim-info-row'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.groupunlock

const BUSINESS_NAME = 'The Daily Grind'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '25% Off'
const REWARD_EMOJI = '🤝'
const RESERVE_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'
const GROUP_TARGET = 30
const GROUP_JOINED = 18

const R = 80
const CIRC = 2 * Math.PI * R

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function WaitingRoom() {
  const router = useRouter()
  const pct = Math.min(100, Math.round((GROUP_JOINED / GROUP_TARGET) * 100))
  const remaining = Math.max(0, GROUP_TARGET - GROUP_JOINED)
  const filled = (pct / 100) * CIRC

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #115E59 0%, #0D9488 55%, #042F2E 100%)' }}
    >
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10">
        <p className="text-white/70 text-base font-semibold mb-1 text-center">Community Offer — {BUSINESS_NAME} {BUSINESS_EMOJI}</p>
        <h1 className="text-2xl font-extrabold text-white mb-8 text-center">You&apos;re in! ✓</h1>

        {/* Static progress ring */}
        <div className="relative flex items-center justify-center mb-6" style={{ width: 200, height: 200 }}>
          <svg viewBox="0 0 180 180" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={90} cy={90} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
            <motion.circle
              cx={90} cy={90} r={R} fill="none"
              stroke="#5EEAD4" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${CIRC} ${CIRC}`}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: CIRC - filled }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <Handshake className="w-7 h-7 text-white/70 mb-1" />
            <p className="text-3xl font-black text-white leading-none">{GROUP_JOINED}<span className="text-base font-semibold text-white/40">/{GROUP_TARGET}</span></p>
            <p className="text-[11px] text-white/50 mt-1">joined</p>
          </div>
        </div>

        <p className="text-sm font-semibold text-white/80 mb-1 text-center">
          {remaining} more {remaining === 1 ? 'person' : 'people'} needed to unlock this reward
        </p>
        <p className="text-xs text-white/40 mb-8 text-center">We&apos;ll let you know right here once the group is complete</p>

        <div className="w-full max-w-xs rounded-2xl px-4 py-3.5" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <span>Reserve before <span className="font-bold text-white">{fmtDate(RESERVE_BEFORE)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <CalendarDays className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <span>Redeem before <span className="font-bold text-white">{fmtDate(REDEEM_BEFORE)}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GroupUnlockPage() {
  const [state, setState] = useState<'idle' | 'earned'>('idle')
  const groupFull = GROUP_JOINED >= GROUP_TARGET

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain accentFrom={meta.cardFrom} accentTo={meta.cardTo} />
  }

  if (!groupFull) {
    return <WaitingRoom />
  }

  return (
    <RubLampClaim
      title={`Rub the lamp to\nclaim your reward`}
      onComplete={() => setState('earned')}
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
    >
      <p className="text-white font-bold text-base text-center mb-2">
        Community Offer — {BUSINESS_NAME} {BUSINESS_EMOJI}
      </p>
      <div className="flex justify-center mb-4">
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white">
          <Handshake className="w-3 h-3" /> {GROUP_JOINED}/{GROUP_TARGET} joined — group complete!
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ClaimInfoRow icon={CalendarDays} label="Reserved By" value={fmtDate(RESERVE_BEFORE)} accent={meta.cardFrom} />
        <ClaimInfoRow icon={CalendarDays} label="Redeem Before" value={fmtDate(REDEEM_BEFORE)} accent={meta.cardFrom} />
      </div>
    </RubLampClaim>
  )
}
