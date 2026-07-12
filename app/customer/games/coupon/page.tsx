'use client'
import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { ClaimReward } from '@/components/customer/claim-reward'
import { ClaimInfoRow } from '@/components/customer/claim-info-row'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.coupon

const BUSINESS_NAME = 'The Daily Grind'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '20% Off'
const REWARD_EMOJI = '🎫'
const CLAIM_BEFORE = '2026-07-15'
const REDEEM_BEFORE = '2026-08-15'
const TERMS = 'Valid on bills above ₹500. One coupon per customer. Not valid with other offers. Show coupon at billing to redeem.'

type State = 'idle' | 'earned'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CouponPage() {
  const [state, setState] = useState<State>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain accentFrom={meta.cardFrom} accentTo={meta.cardTo} />
  }

  return (
    <ClaimReward
      title="Coupon Codes"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      emoji={REWARD_EMOJI}
      rewardLabel={REWARD_LABEL}
      description="Apply your code at checkout and save more."
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
      onClaim={() => setState('earned')}
    >
      <div className="grid grid-cols-2 gap-3">
        <ClaimInfoRow icon={CalendarDays} label="Claim Before" value={fmtDate(CLAIM_BEFORE)} accent={meta.cardFrom} />
        <ClaimInfoRow icon={CalendarDays} label="Redeem Before" value={fmtDate(REDEEM_BEFORE)} accent={meta.cardFrom} />
      </div>
      <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
        <p className="text-[11px] text-gray-500 leading-relaxed">{TERMS}</p>
      </div>
    </ClaimReward>
  )
}
