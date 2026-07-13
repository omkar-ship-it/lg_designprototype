'use client'
import { MECHANIC_META } from '@/lib/utils'
import { RubClaimScreen } from '@/components/customer/rub-claim-screen'

const meta = MECHANIC_META.flash

const BUSINESS_NAME = 'Happy Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '25% Off'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-07'
const TOTAL_SLOTS = 40
const CLAIMED = 29
const TERMS = 'Valid 3–5 PM only, while spots last. One redemption per customer. Show this screen at billing to redeem.'

export default function HappyCafeFlashRubPage() {
  return (
    <RubClaimScreen
      meta={meta}
      revealSubtitle="Reveal your flash deal"
      claimedHeadline="Here's Your Deal ✨"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      rewardLabel={REWARD_LABEL}
      rewardTitle={`${REWARD_LABEL} at ${BUSINESS_NAME}`}
      rewardSubtitle="3–5 PM only, while spots last"
      claimBefore={CLAIM_BEFORE}
      redeemBefore={REDEEM_BEFORE}
      available={TOTAL_SLOTS - CLAIMED}
      terms={TERMS}
    />
  )
}
