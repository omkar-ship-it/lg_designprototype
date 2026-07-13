'use client'
import { MECHANIC_META } from '@/lib/utils'
import { RubClaimScreen } from '@/components/customer/rub-claim-screen'

const meta = MECHANIC_META.groupunlock

const BUSINESS_NAME = 'Happy Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '20% Off'
const GROUP_TARGET = 25
const RESERVE_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-30'

export default function HappyCafeGroupUnlockRubPage() {
  return (
    <RubClaimScreen
      meta={meta}
      revealSubtitle="Reveal your group reward"
      claimedHeadline="Here's Your Group Reward ✨"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      rewardLabel={REWARD_LABEL}
      rewardTitle={`${REWARD_LABEL} at ${BUSINESS_NAME}`}
      rewardSubtitle={`Unlocked by ${GROUP_TARGET} people joining`}
      claimBefore={RESERVE_BEFORE}
      redeemBefore={REDEEM_BEFORE}
    />
  )
}
