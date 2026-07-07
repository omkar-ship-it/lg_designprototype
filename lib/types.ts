export type MechanicType = 'shake' | 'stamp' | 'spin' | 'dice' | 'lottery' | 'checkin' | 'buyxgety' | 'coupon' | 'flash' | 'friend' | 'groupunlock' | 'combo'
export type CampaignStatus = 'active' | 'draft' | 'ended' | 'paused'
export type RewardType = 'single' | 'range'

// ── Shared reward/expiry typing (introduced for Buy X Get Y, reused by later mechanics) ──
export type RewardKind = 'flat' | 'percent' | 'item' | 'points'
export type RewardExpiryMode = 'fixed' | 'rolling'

export interface Reward {
  id: string
  name: string
  description: string
  value: string
  icon: string
}

export interface Campaign {
  id: string
  name: string
  mechanic: MechanicType
  status: CampaignStatus
  startDate: string
  endDate: string
  userCap: number
  currentUsers: number
  playsPerUser: number
  rewards: Reward[]
  config: ShakeConfig | StampConfig | SpinConfig | DiceConfig | LotteryConfig | CheckinConfig | BuyXGetYConfig | CouponConfig | FlashDealConfig | BringFriendConfig | GroupUnlockConfig | ComboDealConfig
  pin: string
  pinExpiresAt: number
  participations: number
  rewardsClaimed: number
  redeemedCount: number
  createdAt: string
}

export interface ShakeConfig {
  type: 'shake'
  playsPerUser: number
  rewardType: RewardType
  winProbability: number
}

export interface StampConfig {
  type: 'stamp'
  totalStamps: number
  surpriseDropRange: [number, number]
  bigRewardPosition: number
  surpriseReward: Reward
  bigReward: Reward
}

export interface SpinConfig {
  type: 'spin'
  segments: SpinSegment[]
  spinsPerUser: number
}

export interface SpinSegment {
  label: string
  reward: string | null
  probability: number
  color: string
  isWin: boolean
}

export interface DiceConfig {
  type: 'dice'
  rollsPerUser: number
  outcomes: DiceOutcome[]
}

export interface DiceOutcome {
  value: number
  reward: string | null
  isWin: boolean
}

export interface LotteryConfig {
  type: 'lottery'
  ticketLimit: number
  jackpotReward: Reward
  tiers: LotteryTier[]
}

export interface LotteryTier {
  name: string
  reward: string
  probability: number
  color: string
}

export interface CheckinConfig {
  type: 'checkin'
  pointsPerCheckIn: number
  maxCheckInsPerDay: number
  checkInsPerUser: number
}

export type BuyCondition = 'quantity' | 'spend'
export type RollingExpiryUnit = 'days' | 'months'

export interface BuyXGetYConfig {
  type: 'buyxgety'
  condition: BuyCondition
  buyQuantity: number           // used when condition === 'quantity', e.g. 3
  spendAmount: number           // used when condition === 'spend', in ₹

  rewardKind: RewardKind
  rewardValue: string           // flat "50" (₹) / percent "20" / item free-text description / points "100"

  rewardExpiryMode: RewardExpiryMode
  rewardExpiryDate?: string       // ISO date, when mode === 'fixed'
  rewardExpiryValue?: number      // e.g. 4 or 7, when mode === 'rolling'
  rewardExpiryUnit?: RollingExpiryUnit // 'days' | 'months', when mode === 'rolling'
}

export interface CouponConfig {
  type: 'coupon'
  totalCoupons: number          // total coupons available across the campaign (scarcity cap)

  rewardKind: RewardKind        // 'flat' | 'percent' | 'points' for coupons (no 'item')
  rewardValue: string           // flat "50" (₹) / percent "20" / points "100"

  rewardExpiryMode: RewardExpiryMode
  rewardExpiryDate?: string       // ISO date, when mode === 'fixed'
  rewardExpiryValue?: number      // e.g. 4 or 7, when mode === 'rolling'
  rewardExpiryUnit?: RollingExpiryUnit // 'days' | 'months', when mode === 'rolling'

  termsAndConditions: string     // qualifying conditions, redemption instructions, etc.
}

export interface FlashDealConfig {
  type: 'flash'
  totalSlots: number             // limited spots available — first come, first served

  rewardKind: RewardKind        // 'flat' | 'percent' | 'item' | 'points'
  rewardValue: string           // flat "50" (₹) / percent "20" / item free-text description / points "100"

  rewardExpiryMode: RewardExpiryMode
  rewardExpiryDate?: string       // ISO date, when mode === 'fixed'
  rewardExpiryValue?: number      // e.g. 4 or 7, when mode === 'rolling'
  rewardExpiryUnit?: RollingExpiryUnit // 'days' | 'months', when mode === 'rolling'

  termsAndConditions: string     // qualifying conditions, redemption instructions, etc.
}

export interface BringFriendConfig {
  type: 'friend'
  minFriends: number             // minimum number of friends required to unlock the reward

  rewardKind: RewardKind        // 'flat' | 'percent' | 'item' | 'points'
  rewardValue: string           // flat "50" (₹) / percent "20" / item free-text description / points "100"

  rewardExpiryMode: RewardExpiryMode
  rewardExpiryDate?: string       // ISO date, when mode === 'fixed'
  rewardExpiryValue?: number      // e.g. 4 or 7, when mode === 'rolling'
  rewardExpiryUnit?: RollingExpiryUnit // 'days' | 'months', when mode === 'rolling'
}

export interface GroupUnlockConfig {
  type: 'groupunlock'
  targetParticipants: number      // pre-determined group size needed to unlock the offer

  rewardKind: RewardKind        // 'flat' | 'percent' | 'item' | 'points'
  rewardValue: string           // flat "50" (₹) / percent "20" / item free-text description / points "100"

  rewardExpiryMode: RewardExpiryMode
  rewardExpiryDate?: string       // ISO date, when mode === 'fixed'
  rewardExpiryValue?: number      // e.g. 4 or 7, when mode === 'rolling'
  rewardExpiryUnit?: RollingExpiryUnit // 'days' | 'months', when mode === 'rolling'
}

export type ComboVariant = 'discount' | 'freeitem'

export interface ComboDealConfig {
  type: 'combo'
  variant: ComboVariant

  // variant === 'discount' — bundle a set of items at one discounted price
  items: string[]                // bundle item/service names, e.g. ["Coffee", "Croissant", "Fruit Bowl"]
  originalPrice: number          // ₹, sum value of items bought individually (shown struck-through)
  bundlePrice: number            // ₹, discounted price customer pays for the bundle

  // variant === 'freeitem' — take items 1-3, get item 4 free
  paidItems: string[]             // items the customer pays for, e.g. ["Coffee", "Coffee", "Coffee"]
  freeItems: string[]             // items given free with the paid items, e.g. ["Coffee"]

  totalSpots: number             // limited quantity available

  rewardExpiryMode: RewardExpiryMode
  rewardExpiryDate?: string       // ISO date, when mode === 'fixed'
  rewardExpiryValue?: number      // e.g. 4 or 7, when mode === 'rolling'
  rewardExpiryUnit?: RollingExpiryUnit // 'days' | 'months', when mode === 'rolling'

  termsAndConditions: string     // qualifying conditions, redemption instructions, etc.
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  dob: string
  joinedAt: string
  lastVisit: string
  totalVisits: number
  gamesPlayed: number
  rewardsEarned: number
  status: 'active' | 'inactive'
  rewards: CustomerReward[]
  gameHistory: GameHistoryItem[]
}

export interface CustomerReward {
  id: string
  campaignId: string
  campaignName: string
  mechanic: MechanicType
  reward: string
  earnedAt: string
  expiresAt?: string
  status: 'pending' | 'redeemed'
  redeemedAt?: string
  code: string
  businessId?: string
  businessName?: string
  businessEmoji?: string
  businessCoverFrom?: string
  businessCoverTo?: string
}

export interface GameHistoryItem {
  id: string
  campaignId: string
  campaignName: string
  mechanic: MechanicType
  playedAt: string
  won: boolean
  reward?: string
}

export interface RedemptionQueueItem {
  id: string
  customerId: string
  customerName: string
  phone: string
  reward: string
  campaignName: string
  mechanic: MechanicType
  earnedAt: string
  code: string
}

export interface BusinessProfile {
  id: string
  name: string
  category: string
  tagline: string
  description: string
  logo: string
  address: string
  city: string
  phone: string
  email: string
  hours: string
  website: string
  qrCode: string
}

export type RewardCtaType = 'rub-lamp' | 'summon-circle' | 'scratch-smoke'

export interface ClaimableReward {
  id: string
  name: string
  subtitle: string
  pointsCost: number
  totalSlots: number
  slotsClaimed: number
  claimBefore: string
  redeemBefore: string
  icon: string
  isLocked: boolean
  pointsNeeded?: number
  ctaType: RewardCtaType
}

export interface CustomerBusiness {
  id: string
  name: string
  category: 'Cafe' | 'Salon' | 'Gym' | 'Restaurant' | 'Jewellery'
  tagline: string
  rating: number
  reviews: number
  distance: string
  location: string
  phone: string
  openUntil: string
  coverImage: string
  coverFrom: string
  coverTo: string
  coverEmoji: string
  userPoints?: number
  claimableRewards?: ClaimableReward[]
  mechanics: {
    type: MechanicType
    label: string
    description: string
    status: CampaignStatus
    startDate: string
    endDate: string
    participants: number
    totalRewards: number
    activeToday?: number
    playedToday?: boolean
    // stamp
    stampsCollected?: number
    totalStamps?: number
    finalReward?: string
    // spin / dice / shake
    prizes?: string[]
    // checkin
    checkInStreak?: number
    totalPoints?: number
    // lottery
    drawDate?: string
    userTickets?: number
    // buyxgety
    buyReward?: string
    buyTotalSlots?: number
    buyClaimed?: number
    buyRedeemBefore?: string
    // coupon
    couponReward?: string
    couponTotalSlots?: number
    couponClaimed?: number
    couponRedeemBefore?: string
    couponTerms?: string
    // flash
    flashReward?: string
    flashTotalSlots?: number
    flashClaimed?: number
    flashRedeemBefore?: string
    flashTerms?: string
    // friend (bring a friend)
    friendReward?: string
    friendMinFriends?: number
    friendsBrought?: number
    friendRedeemBefore?: string
    // groupunlock (community offer — group unlock)
    groupReward?: string
    groupTarget?: number
    groupJoined?: number
    groupRedeemBefore?: string
    hasReserved?: boolean
    // combo (package/combo deal)
    comboVariant?: ComboVariant
    comboItems?: string[]
    comboOriginalPrice?: number
    comboBundlePrice?: number
    comboPaidItems?: string[]
    comboFreeItems?: string[]
    comboTotalSpots?: number
    comboClaimed?: number
    comboRedeemBefore?: string
    comboTerms?: string
  }[]
}
