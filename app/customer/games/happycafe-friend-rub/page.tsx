'use client'
import { MECHANIC_META } from '@/lib/utils'
import { RubClaimScreen } from '@/components/customer/rub-claim-screen'

const meta = MECHANIC_META.friend

const BUSINESS_NAME = 'Happy Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = 'Free Pastry'
const MIN_FRIENDS = 2
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-14'

export default function HappyCafeFriendRubPage() {
  return (
    <RubClaimScreen
      meta={meta}
      revealSubtitle="Reveal your friend reward"
      claimedHeadline="Here's Your Reward ✨"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      rewardLabel={REWARD_LABEL}
      rewardTitle={`${REWARD_LABEL} at ${BUSINESS_NAME}`}
      rewardSubtitle={`Unlocked by bringing ${MIN_FRIENDS} friends along`}
      claimBefore={CLAIM_BEFORE}
      redeemBefore={REDEEM_BEFORE}
    />
  )
}
