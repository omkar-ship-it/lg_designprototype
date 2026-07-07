'use client'
import { useState } from 'react'
import { CalendarDays, Users } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'

const BUSINESS_NAME = 'The Daily Grind'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = 'Free Pastry'
const REWARD_EMOJI = '👫'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-14'
const MIN_FRIENDS = 2
const FRIENDS_BROUGHT = 1

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BringFriendPage() {
  const [state, setState] = useState<'idle' | 'earned'>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain />
  }

  const metRequirement = FRIENDS_BROUGHT >= MIN_FRIENDS

  return (
    <RubLampClaim
      title={`Rub the lamp to\nclaim your reward`}
      onComplete={() => setState('earned')}
    >
      <p className="text-white font-bold text-base text-center mb-2">
        Bring a Friend — {BUSINESS_NAME} {BUSINESS_EMOJI}
      </p>
      <div className="flex justify-center mb-4">
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white">
          <Users className="w-3 h-3" /> {FRIENDS_BROUGHT}/{MIN_FRIENDS} friends brought
          {!metRequirement && ` · ${MIN_FRIENDS - FRIENDS_BROUGHT} more to go`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Claim Before
          </p>
          <p className="text-sm font-bold text-white">{fmtDate(CLAIM_BEFORE)}</p>
        </div>
        <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Redeem Before
          </p>
          <p className="text-sm font-bold text-white">{fmtDate(REDEEM_BEFORE)}</p>
        </div>
      </div>
    </RubLampClaim>
  )
}
