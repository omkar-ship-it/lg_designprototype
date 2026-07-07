'use client'
import { useState } from 'react'
import { CalendarDays, Zap } from 'lucide-react'
import { WinCelebration } from '@/components/customer/win-celebration'
import { RubLampClaim } from '@/components/customer/rub-lamp-claim'

const BUSINESS_NAME = 'Iron Forge'
const BUSINESS_EMOJI = '🏋️'
const REWARD_LABEL = '30% Off'
const REWARD_EMOJI = '⚡'
const CLAIM_BEFORE = '2026-06-15'
const REDEEM_BEFORE = '2026-06-18'
const TOTAL_SLOTS = 50
const CLAIMED = 41
const TERMS = 'Valid today only, while spots last. One redemption per member. Show this screen at the front desk to redeem.'

type State = 'idle' | 'earned'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FlashDealPage() {
  const [state, setState] = useState<State>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain />
  }

  const remaining = TOTAL_SLOTS - CLAIMED

  return (
    <RubLampClaim
      title={`Rub the lamp to\nclaim this spot`}
      onComplete={() => setState('earned')}
    >
      <div className="space-y-3">
        <div className="flex justify-center">
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white">
            <Zap className="w-3 h-3" /> {remaining} spot{remaining !== 1 ? 's' : ''} remaining · {CLAIMED}/{TOTAL_SLOTS} claimed
          </span>
        </div>
        <div className="rounded-2xl px-4 py-3.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="text-white/70 text-sm font-semibold mb-2 text-center">
            Flash Deal — {BUSINESS_NAME} {BUSINESS_EMOJI}
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
        <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.12)' }}>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
          <p className="text-[11px] text-white/60 leading-relaxed">{TERMS}</p>
        </div>
      </div>
    </RubLampClaim>
  )
}
