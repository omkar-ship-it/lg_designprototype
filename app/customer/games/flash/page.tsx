'use client'
import { useState } from 'react'
import { CalendarDays, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { WinCelebration } from '@/components/customer/win-celebration'
import { ClaimReward } from '@/components/customer/claim-reward'
import { ClaimInfoRow } from '@/components/customer/claim-info-row'
import { MECHANIC_META } from '@/lib/utils'

const meta = MECHANIC_META.flash

const BUSINESS_NAME = 'The Daily Grind'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '30% Off'
const REWARD_EMOJI = '⚡'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-07'
const TOTAL_SLOTS = 50
const CLAIMED = 38
const TERMS = 'Valid 3–5 PM only, while spots last. One redemption per customer. Show this screen at billing to redeem.'

type State = 'idle' | 'earned'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FlashDealPage() {
  const [state, setState] = useState<State>('idle')

  if (state === 'earned') {
    return <WinCelebration reward={REWARD_LABEL} emoji={REWARD_EMOJI} hidePlayAgain accentFrom={meta.cardFrom} accentTo={meta.cardTo} />
  }

  const remaining = TOTAL_SLOTS - CLAIMED

  return (
    <ClaimReward
      title="Flash Deal"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      emoji={REWARD_EMOJI}
      rewardLabel={REWARD_LABEL}
      description="Grab this deal before the spots run out — limited time only."
      accentFrom={meta.cardFrom}
      accentTo={meta.cardTo}
      onClaim={() => setState('earned')}
    >
      <div className="flex justify-center">
        <motion.span
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
          style={{ background: `${meta.cardFrom}15`, color: meta.cardFrom }}
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap className="w-3 h-3" /> {remaining} spot{remaining !== 1 ? 's' : ''} remaining · {CLAIMED}/{TOTAL_SLOTS} claimed
        </motion.span>
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
