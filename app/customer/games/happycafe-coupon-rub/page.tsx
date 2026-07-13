'use client'
import { MECHANIC_META } from '@/lib/utils'
import { RubClaimScreen } from '@/components/customer/rub-claim-screen'

const meta = MECHANIC_META.coupon

const BUSINESS_NAME = 'Happy Cafe'
const BUSINESS_EMOJI = '☕'
const REWARD_LABEL = '10% Off'
const COUPON_CODE = 'HAPPY10'
const CLAIM_BEFORE = '2026-08-31'
const REDEEM_BEFORE = '2026-09-15'
const AVAILABLE = 53
const TERMS = 'Valid on bills above ₹300. One coupon per customer. Not valid with other offers. Show coupon at billing to redeem.'

export default function HappyCafeCouponRubPage() {
  return (
    <RubClaimScreen
      meta={meta}
      revealSubtitle="Reveal your surprise discount code"
      claimedHeadline="Here's Your Coupon ✨"
      businessName={`${BUSINESS_NAME} ${BUSINESS_EMOJI}`}
      rewardLabel={REWARD_LABEL}
      rewardTitle={`${REWARD_LABEL} at ${BUSINESS_NAME}`}
      rewardSubtitle={`CODE: ${COUPON_CODE}`}
      rewardSubtitleMono
      claimBefore={CLAIM_BEFORE}
      redeemBefore={REDEEM_BEFORE}
      available={AVAILABLE}
      terms={TERMS}
    />
  )
}
