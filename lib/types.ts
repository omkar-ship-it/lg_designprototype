export type MechanicType = 'shake' | 'stamp' | 'spin' | 'dice' | 'lottery' | 'checkin'
export type CampaignStatus = 'active' | 'draft' | 'ended' | 'paused'
export type RewardType = 'single' | 'range'

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
  config: ShakeConfig | StampConfig | SpinConfig | DiceConfig | LotteryConfig | CheckinConfig
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
  }[]
}
