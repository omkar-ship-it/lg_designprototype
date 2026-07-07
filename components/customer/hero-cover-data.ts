import type { ComponentType } from 'react'
import {
  Tag, ShoppingCart, Clock, ShieldCheck, ShoppingBag, Star, Zap, Gift,
  TicketPercent, Wallet, ThumbsUp, Ticket, CalendarDays, UserPlus,
  type LucideIcon,
} from 'lucide-react'
import {
  SpinWheelArt, RollDiceArt, CouponTicketArt, BundleGiftArt, FlashClockArt,
  LotteryDrawArt, SpendGetArt, FriendHeartArt, GroupUnlockArt,
} from '@/components/customer/mechanic-cover-art'
import type { MechanicType } from '@/lib/types'

export interface HeroCover {
  headline: string
  headlineAccent?: string
  accentColor?: string
  tagline: string
  bgFrom: string
  bgTo: string
  textColor: string
  layout: 'side' | 'center'
  badgeBg?: string
  art?: ComponentType<{ className?: string }>
  features?: { icon: LucideIcon; label: string }[]
}

export const HERO_COVER: Partial<Record<MechanicType, HeroCover>> = {
  spin: {
    headline: 'Spin & Win', tagline: 'Spin the wheel for exciting rewards every time!',
    bgFrom: '#EDE9FE', bgTo: '#DDD6FE', textColor: '#4C1D95', layout: 'side', art: SpinWheelArt,
  },
  dice: {
    headline: 'Roll & Win', tagline: 'Roll the dice and get rewarded instantly!',
    bgFrom: '#FCE7F3', bgTo: '#FBCFE8', textColor: '#831843', layout: 'side', art: RollDiceArt,
  },
  coupon: {
    headline: 'Exclusive Savings', tagline: 'Apply your code at checkout and save more.',
    bgFrom: '#F59E0B', bgTo: '#92400E', textColor: '#FFFFFF', layout: 'center', badgeBg: '#FFFBEB', art: CouponTicketArt,
    features: [
      { icon: Tag, label: 'Extra Savings' },
      { icon: ShoppingCart, label: 'Easy to Use' },
      { icon: Clock, label: 'Limited Time' },
      { icon: ShieldCheck, label: 'All Orders' },
    ],
  },
  combo: {
    headline: 'Bundle & Save', tagline: 'The more you buy, the more you save!',
    bgFrom: '#6D28D9', bgTo: '#3B0764', textColor: '#FFFFFF', layout: 'center', badgeBg: '#F5F3FF', art: BundleGiftArt,
    features: [
      { icon: ShoppingBag, label: 'Buy More' },
      { icon: Tag, label: 'Extra Rewards' },
      { icon: Gift, label: 'Exclusive' },
      { icon: Star, label: 'Best Value' },
    ],
  },
  flash: {
    headline: 'Flash Sale', tagline: "Amazing offers, limited time — don't miss out!",
    bgFrom: '#1E3A8A', bgTo: '#172554', textColor: '#FFFFFF', layout: 'center', badgeBg: '#EFF6FF', art: FlashClockArt,
    features: [
      { icon: Tag, label: 'Exciting Deals' },
      { icon: ShoppingBag, label: 'Limited Stock' },
      { icon: Zap, label: 'Hurry Up' },
      { icon: ShieldCheck, label: 'Secure Checkout' },
    ],
  },
  lottery: {
    headline: 'Play & Win Big Prizes!', tagline: 'Join the draw with every visit — you could be next!',
    bgFrom: '#422006', bgTo: '#1C1917', textColor: '#FDE68A', layout: 'center', badgeBg: '#FEF3C7', art: LotteryDrawArt,
    features: [
      { icon: Ticket, label: 'Earn Tickets' },
      { icon: CalendarDays, label: 'Monthly Draw' },
      { icon: Gift, label: 'Big Prizes' },
      { icon: Star, label: 'Lucky Winner' },
    ],
  },
  buyxgety: {
    headline: 'Spend X, Get Y', tagline: 'Spend or buy a minimum amount and get exciting rewards!',
    bgFrom: '#4338CA', bgTo: '#1E1B4B', textColor: '#FFFFFF', layout: 'center', badgeBg: '#EEF2FF', art: SpendGetArt,
    features: [
      { icon: Wallet, label: 'More You Spend' },
      { icon: Gift, label: 'Exciting Rewards' },
      { icon: TicketPercent, label: 'Great Benefits' },
      { icon: ThumbsUp, label: 'Instant Reward' },
    ],
  },
  friend: {
    headline: 'Better Together', tagline: 'Invite a friend along — you both get rewarded!',
    bgFrom: '#FFE4E9', bgTo: '#FFC1CC', textColor: '#9F1239', layout: 'side', art: FriendHeartArt,
  },
  groupunlock: {
    headline: 'Stronger Together,', headlineAccent: 'Better Rewards!', accentColor: '#059669',
    tagline: 'Enjoy exclusive rewards as a valued community member.',
    bgFrom: '#ECFDF5', bgTo: '#D1FAE5', textColor: '#064E3B', layout: 'side', art: GroupUnlockArt,
    features: [
      { icon: UserPlus, label: 'Be Part of the Community' },
      { icon: Gift, label: 'Exclusive Rewards' },
      { icon: TicketPercent, label: 'Special Offers' },
    ],
  },
}
