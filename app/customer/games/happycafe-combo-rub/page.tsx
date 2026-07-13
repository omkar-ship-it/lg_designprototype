'use client'
import { MECHANIC_META } from '@/lib/utils'
import { RubClaimScreen } from '@/components/customer/rub-claim-screen'

const meta = MECHANIC_META.combo

const BUSINESS_NAME = 'Happy Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = 'Free Coffee'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'
const TERMS = 'Dine-in or takeaway. All 3 coffees must be the same size. Valid once per visit.'

export default function HappyCafeComboRubPage() {
  return (
    <RubClaimScreen
      meta={meta}
      revealSubtitle="Reveal your bundle reward"
      claimedHeadline="Here's Your Bundle Reward ✨"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      rewardLabel={REWARD_LABEL}
      rewardTitle={`${REWARD_LABEL} at ${BUSINESS_NAME}`}
      rewardSubtitle="3 Coffees + 1 Free"
      claimBefore={CLAIM_BEFORE}
      redeemBefore={REDEEM_BEFORE}
      terms={TERMS}
    />
  )
}
