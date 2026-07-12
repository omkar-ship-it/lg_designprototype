'use client'
import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'
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
    <RubLampClaim
      title={`Claim your combo`}
      onComplete={() => setState('earned')}
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
    >
      <p className="text-white font-bold text-base text-center mb-3">
        Package/Combo Deal — {BUSINESS_NAME} {BUSINESS_EMOJI}
      </p>
      <div className="flex items-center justify-center flex-wrap gap-1.5 mb-4">
        {PAID_ITEMS.map((it, i) => (
          <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80">{it}</span>
        ))}
        <span className="text-white/40 font-bold text-xs">+</span>
        {FREE_ITEMS.map((it, i) => (
          <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #4F46E5, #3730A3)' }}>
            {it} FREE
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <ClaimInfoRow icon={CalendarDays} label="Claim Before" value={fmtDate(CLAIM_BEFORE)} accent={meta.cardFrom} />
        <ClaimInfoRow icon={CalendarDays} label="Redeem Before" value={fmtDate(REDEEM_BEFORE)} accent={meta.cardFrom} />
      </div>
      <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
        <p className="text-[11px] text-white/60 leading-relaxed">{TERMS}</p>
      </div>
    </RubLampClaim>
  )
}
