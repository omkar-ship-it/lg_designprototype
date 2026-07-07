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
      <div className="rounded-2xl px-4 py-3.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <p className="text-white/70 text-sm font-semibold mb-2 text-center">
          Buy X, Get Y — {BUSINESS_NAME} {BUSINESS_EMOJI}
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
    </RubLampClaim>
  )
}
