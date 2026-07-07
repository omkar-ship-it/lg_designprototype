'use client'
import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'

const BUSINESS_NAME = 'Amber Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '₹150 Off'
const REWARD_EMOJI = '💰'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'

type State = 'idle' | 'earned'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BuyXGetYPage() {
  const [state, setState] = useState<State>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain />
  }

  return (
    <RubLampClaim
      title={`Rub the lamp to\nclaim ${BUSINESS_NAME}'s reward`}
      onComplete={() => setState('earned')}
    >
      <p className="text-white font-bold text-base text-center mb-4">
        Buy X, Get Y — {BUSINESS_NAME} {BUSINESS_EMOJI}
      </p>
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
