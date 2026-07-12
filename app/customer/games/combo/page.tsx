'use client'
import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { ClaimReward } from '@/components/customer/claim-reward'
import { ClaimInfoRow } from '@/components/customer/claim-info-row'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.combo

const BUSINESS_NAME = 'The Daily Grind'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = 'Free Coffee'
const REWARD_EMOJI = '🛍️'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'
const PAID_ITEMS = ['Coffee', 'Coffee', 'Coffee']
const FREE_ITEMS = ['Coffee']
const TERMS = 'Dine-in or takeaway. All 3 coffees must be the same size. Valid once per visit.'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ComboDealPage() {
  const [state, setState] = useState<'idle' | 'earned'>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain accentFrom={meta.cardFrom} accentTo={meta.cardTo} />
  }

  return (
    <ClaimReward
      title="Combo Deal"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      emoji={REWARD_EMOJI}
      rewardLabel={REWARD_LABEL}
      description="Buy the bundle and get an extra one on us."
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
      onClaim={() => setState('earned')}
    >
      <div className="flex items-center justify-center flex-wrap gap-1.5">
        {PAID_ITEMS.map((it, i) => (
          <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{it}</span>
        ))}
        <span className="text-gray-400 font-bold text-xs">+</span>
        {FREE_ITEMS.map((it, i) => (
          <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}>
            {it} FREE
          </span>
        ))}
      </div>
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
