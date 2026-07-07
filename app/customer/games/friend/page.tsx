'use client'
import { useState } from 'react'
import { CalendarDays, Users } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'

const BUSINESS_NAME = 'Noir Hair Studio'
const BUSINESS_EMOJI = '✂️'
const REWARD_LABEL = 'Free Hair Wash'
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
      <div className="space-y-3">
        <div className="flex justify-center">
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white">
            <Users className="w-3 h-3" /> {FRIENDS_BROUGHT}/{MIN_FRIENDS} friends brought
            {!metRequirement && ` · ${MIN_FRIENDS - FRIENDS_BROUGHT} more to go`}
          </span>
        </div>
        <div className="rounded-2xl px-4 py-3.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="text-white/70 text-sm font-semibold mb-2 text-center">
            Bring a Friend — {BUSINESS_NAME} {BUSINESS_EMOJI}
          </p>
          <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <span>Claim before <span className="font-bold text-white">{fmtDate(CLAIM_BEFORE)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <CalendarDays className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <span>Redeem before <span className="font-bold text-white">{fmtDate(REDEEM_BEFORE)}</span></span>
          </div>
          <p className="text-xs text-white/40 mt-2 text-center">You will get {REWARD_LABEL}</p>
        </div>
      </div>
    </RubLampClaim>
  )
}
