'use client'
import { useState } from 'react'
import { CalendarDays, Users } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'
import { ClaimInfoRow } from '@/components/customer/claim-info-row'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.friend

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
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain accentFrom={meta.cardFrom} accentTo={meta.cardTo} />
  }

  const metRequirement = FRIENDS_BROUGHT >= MIN_FRIENDS

  return (
    <RubLampClaim
      title={`Claim your reward`}
      onComplete={() => setState('earned')}
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
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
        <ClaimInfoRow icon={CalendarDays} label="Claim Before" value={fmtDate(CLAIM_BEFORE)} accent={meta.cardFrom} />
        <ClaimInfoRow icon={CalendarDays} label="Redeem Before" value={fmtDate(REDEEM_BEFORE)} accent={meta.cardFrom} />
      </div>
    </RubLampClaim>
  )
}
