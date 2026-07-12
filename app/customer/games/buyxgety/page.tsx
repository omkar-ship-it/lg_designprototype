'use client'
import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { ClaimReward } from '@/components/customer/claim-reward'
import { ClaimInfoRow } from '@/components/customer/claim-info-row'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.buyxgety

const BUSINESS_NAME = 'The Daily Grind'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '₹150 Off'
const REWARD_EMOJI = '💰'
const MIN_SPEND = 500
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'

type State = 'idle' | 'earned'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BuyXGetYPage() {
  const [state, setState] = useState<State>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain accentFrom={meta.cardFrom} accentTo={meta.cardTo} />
  }

  return (
    <ClaimReward
      title="Buy X Get Y"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      emoji={REWARD_EMOJI}
      rewardLabel={REWARD_LABEL}
      description={`Spend ₹${MIN_SPEND} or more in a single visit and get ${REWARD_LABEL}.`}
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
      onClaim={() => setState('earned')}
    >
      <div className="grid grid-cols-2 gap-3">
        <ClaimInfoRow icon={CalendarDays} label="Claim Before" value={fmtDate(CLAIM_BEFORE)} accent={meta.cardFrom} />
        <ClaimInfoRow icon={CalendarDays} label="Redeem Before" value={fmtDate(REDEEM_BEFORE)} accent={meta.cardFrom} />
      </div>
    </ClaimReward>
  )
}
