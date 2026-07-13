'use client'
import { MECHANIC_META } from '@/lib/utils'
import { RubClaimScreen } from '@/components/customer/rub-claim-screen'

const meta = MECHANIC_META.buyxgety

const BUSINESS_NAME = 'Happy Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '₹100 Off'
const MIN_SPEND = 800
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'

export default function HappyCafeBuyXGetYRubPage() {
  return (
    <RubClaimScreen
      meta={meta}
      revealSubtitle="Reveal your spend & save reward"
      claimedHeadline="Here's Your Reward ✨"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      rewardLabel={REWARD_LABEL}
      rewardTitle={`${REWARD_LABEL} at ${BUSINESS_NAME}`}
      rewardSubtitle={`Spend ₹${MIN_SPEND} or more in a single visit`}
      claimBefore={CLAIM_BEFORE}
      redeemBefore={REDEEM_BEFORE}
    />
  )
}
