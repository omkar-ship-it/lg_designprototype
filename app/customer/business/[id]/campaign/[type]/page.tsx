'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Users, Gift, Smartphone, Target, Sparkles, Dices, Ticket, Wallet, Tag, Zap, Handshake } from 'lucide-react'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

const MECHANIC_GAME_LINKS: Record<MechanicType, string> = {
  stamp:   '/customer/games/stamp',
  spin:    '/customer/games/spin',
  shake:   '/customer/games/shake',
  dice:    '/customer/games/dice',
  lottery: '/customer/games/lottery',
  checkin: '/customer/games/checkin',
  buyxgety: '/customer/games/buyxgety',
  coupon: '/customer/games/coupon',
  flash: '/customer/games/flash',
  friend: '/customer/games/friend',
  groupunlock: '/customer/games/groupunlock',
}

const MECHANIC_ICONS = {
  stamp:   Gift,
  shake:   Smartphone,
  checkin: Target,
  spin:    Sparkles,
  dice:    Dices,
  lottery: Ticket,
  buyxgety: Wallet,
  coupon:  Tag,
  flash:   Zap,
  friend:  Users,
  groupunlock: Handshake,
} as const

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#D1FAE5', text: '#065F46', label: 'Active'  },
  paused: { bg: '#FEF3C7', text: '#92400E', label: 'Paused'  },
  draft:  { bg: '#E5E7EB', text: '#374151', label: 'Draft'   },
  ended:  { bg: '#EDE9FE', text: '#5B21B6', label: 'Ended'   },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string; type: string }> }) {
  const { id, type } = use(params)
  const router = useRouter()

  const biz      = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]
  const mechanic = biz.mechanics.find(m => m.type === type) ?? biz.mechanics[0]
  const meta     = MECHANIC_META[mechanic.type as MechanicType]

  // OTP state
  const [showOTP, setShowOTP] = useState(false)
  const [digits, setDigits]   = useState(['', '', ''])
  const ref0 = useRef<HTMLInputElement>(null)
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const digitRefs = [ref0, ref1, ref2]

  const openOTP = () => {
    setDigits(['', '', ''])
    setShowOTP(true)
    setTimeout(() => ref0.current?.focus(), 350)
  }

  const closeOTP = () => {
    setShowOTP(false)
    setDigits(['', '', ''])
  }

  const handleDigitChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next  = [...digits]
    next[i]     = clean
    setDigits(next)
    if (clean && i < 2) digitRefs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) digitRefs[i - 1].current?.focus()
  }

  const joinCampaign = () => {
    if (digits.some(d => !d)) return
    closeOTP()
    const base = MECHANIC_GAME_LINKS[mechanic.type as MechanicType]
    router.push(mechanic.type === 'stamp' ? `${base}?stamp=1` : base)
  }

  const codeComplete = digits.every(d => !!d)

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* Cover */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <motion.span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-15 select-none pointer-events-none"
          animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {meta.emoji}
        </motion.span>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Mechanic badge */}
        <span
          className="absolute top-12 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10"
          style={{ background: meta.badgeBg, color: meta.badgeText }}
        >
          {meta.label}
        </span>

        {/* Status badge */}
        <span
          className="absolute bottom-6 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: STATUS_STYLES[mechanic.status]?.bg, color: STATUS_STYLES[mechanic.status]?.text }}
        >
          {STATUS_STYLES[mechanic.status]?.label}
        </span>

        {/* Scallop */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem]" />
      </div>

      {/* Body */}
      <div className="px-5 pt-3">

        {/* Title + points badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">{mechanic.label}</h1>
          {mechanic.type === 'checkin' && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 shrink-0 mt-0.5">
              +100 pts / visit
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{mechanic.description}</p>

        {/* Stamp card layout */}
        {mechanic.type === 'stamp' && mechanic.stampsCollected !== undefined && mechanic.totalStamps ? (
          (() => {
            const collected   = mechanic.stampsCollected!
            const total       = mechanic.totalStamps
            const rewardPos   = [4, 6, 8, 10]
            const pct         = Math.round((collected / total) * 100)
            const stampHistory = [
              { n: collected,     date: 'Today',   item: 'Latte at ' + biz.name },
              { n: collected - 2, date: '16th Jun', item: 'Cappuccino' },
            ].filter(h => h.n > 0)

            return (
              <div className="mb-6">
                {/* Loyalty card */}
                <div
                  className="rounded-3xl overflow-hidden mb-4"
                  style={{ boxShadow: '0 16px 48px rgba(91,33,182,0.2), 0 0 0 1px rgba(109,40,217,0.2)' }}
                >
                  {/* Purple header */}
                  <div
                    className="relative px-5 py-4 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #6D28D9, #4C1D95)' }}
                  >
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[80px] opacity-10 select-none pointer-events-none leading-none">🎁</span>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Loyalty Card</p>
                        <p className="text-lg font-extrabold text-white/90">{biz.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-wide mb-0.5">Stamps</p>
                        <p className="text-4xl font-black text-white leading-none">
                          {collected}
                          <span className="text-base font-semibold text-white/40">/{total}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-0" style={{ borderTop: '2px dashed rgba(109,40,217,0.25)' }} />

                  {/* Stamp grid */}
                  <div className="bg-white px-5 pt-5 pb-4">
                    <div className="grid grid-cols-5 gap-2.5 mb-3">
                      {Array.from({ length: total }, (_, i) => {
                        const n         = i + 1
                        const isFilled  = n <= collected
                        const isReward  = rewardPos.includes(n)
                        const isFinal   = n === total
                        const isLatest  = n === collected
                        return (
                          <div key={n} className="flex flex-col items-center relative">
                            <div className="relative w-12 h-12 mb-1">
                              {isLatest && isFilled && (
                                <motion.div
                                  className="absolute inset-0 rounded-full pointer-events-none"
                                  style={{ boxShadow: '0 0 0 3px rgba(109,40,217,0.5), 0 0 0 6px rgba(109,40,217,0.15)' }}
                                  animate={{ opacity: [0.6, 1, 0.6] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              {isFilled ? (
                                <div
                                  className="absolute inset-0 rounded-full flex items-center justify-center text-lg"
                                  style={
                                    isFinal
                                      ? { background: 'linear-gradient(145deg, #F59E0B, #D97706)', boxShadow: '0 4px 14px rgba(245,158,11,0.5)' }
                                      : isReward
                                        ? { background: 'linear-gradient(145deg, #7C3AED, #5B21B6)', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }
                                        : { background: 'linear-gradient(145deg, #6B7280, #4B5563)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                                  }
                                >
                                  {isFinal ? '🏆' : isReward ? '🎁' : '✓'}
                                </div>
                              ) : (
                                <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: '#E5E7EB' }}>
                                  <span className="text-[13px] font-bold text-gray-400 select-none">{n}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <p className="text-[11px] text-center text-gray-500 mb-1">
                      <span className="font-bold text-purple-700">{collected}</span> collected · {total - collected} more surprises await 🎁
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-semibold text-gray-500 shrink-0">Progress</p>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #7C3AED, #5B21B6)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                  <p className="text-xs font-bold text-purple-700 shrink-0">{pct}% complete</p>
                </div>

                {/* Activity log */}
                <div className="space-y-3 mb-4">
                  {stampHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
                        style={{ background: 'linear-gradient(145deg, #7C3AED, #5B21B6)' }}
                      >
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Stamp #{h.n} earned</p>
                        <p className="text-[11px] text-gray-400">{h.date} · {h.item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()
        ) : (
          <>
            {/* Prizes — spin / dice / shake */}
            {(mechanic.type === 'spin' || mechanic.type === 'dice' || mechanic.type === 'shake') && mechanic.prizes && mechanic.prizes.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-3">What you could win</p>
                <div className="flex flex-wrap gap-2">
                  {mechanic.prizes.map((p, i) => (
                    <span
                      key={i}
                      className="text-sm font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: `${meta.cardFrom}18`, color: meta.cardFrom }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lottery — draw date + tickets */}
            {mechanic.type === 'lottery' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Draw Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {mechanic.drawDate ? fmtDate(mechanic.drawDate) : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Your Tickets</p>
                  <p className="text-2xl font-black" style={{ color: meta.cardFrom }}>
                    {mechanic.userTickets ?? 0}
                    <span className="text-xs font-semibold text-gray-400 ml-1">tickets</span>
                  </p>
                </div>
              </div>
            )}

            {/* Check-in — streak + points */}
            {mechanic.type === 'checkin' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-2xl mb-0.5">🔥</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Streak</p>
                  <p className="text-2xl font-black text-gray-900">
                    {mechanic.checkInStreak ?? 0}
                    <span className="text-xs font-semibold text-gray-400 ml-1">days</span>
                  </p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-2xl mb-0.5">⭐</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Points</p>
                  <p className="text-2xl font-black text-gray-900">
                    {mechanic.totalPoints ?? 0}
                    <span className="text-xs font-semibold text-gray-400 ml-1">pts</span>
                  </p>
                </div>
              </div>
            )}

            {/* Buy X Get Y — claim window, spots, redeem window */}
            {mechanic.type === 'buyxgety' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Claim Before</p>
                  <p className="text-sm font-bold text-gray-900">{fmtDate(mechanic.endDate)}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Redeem Before</p>
                  <p className="text-sm font-bold text-gray-900">
                    {mechanic.buyRedeemBefore ? fmtDate(mechanic.buyRedeemBefore) : '—'}
                  </p>
                </div>
                {mechanic.buyTotalSlots !== undefined && mechanic.buyClaimed !== undefined && (
                  <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: `${meta.cardFrom}12` }}>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Spots Claimed</p>
                      <p className="text-sm font-bold text-gray-900">{mechanic.buyClaimed} / {mechanic.buyTotalSlots}</p>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: meta.cardFrom }}>
                      {mechanic.buyTotalSlots - mechanic.buyClaimed} remaining
                    </p>
                  </div>
                )}
                {mechanic.buyReward && (
                  <div className="col-span-2 rounded-2xl p-4 text-center" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reward</p>
                    <p className="text-sm font-bold" style={{ color: meta.cardFrom }}>{mechanic.buyReward}</p>
                  </div>
                )}
              </div>
            )}

            {/* Coupon Codes — claim window, spots, redeem window, terms */}
            {mechanic.type === 'coupon' && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Claim Before</p>
                    <p className="text-sm font-bold text-gray-900">{fmtDate(mechanic.endDate)}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Redeem Before</p>
                    <p className="text-sm font-bold text-gray-900">
                      {mechanic.couponRedeemBefore ? fmtDate(mechanic.couponRedeemBefore) : '—'}
                    </p>
                  </div>
                  {mechanic.couponTotalSlots !== undefined && mechanic.couponClaimed !== undefined && (
                    <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: `${meta.cardFrom}12` }}>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Coupons Claimed</p>
                        <p className="text-sm font-bold text-gray-900">{mechanic.couponClaimed} / {mechanic.couponTotalSlots}</p>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: meta.cardFrom }}>
                        {mechanic.couponTotalSlots - mechanic.couponClaimed} remaining
                      </p>
                    </div>
                  )}
                  {mechanic.couponReward && (
                    <div className="col-span-2 rounded-2xl p-4 text-center" style={{ background: `${meta.cardFrom}12` }}>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reward</p>
                      <p className="text-sm font-bold" style={{ color: meta.cardFrom }}>{mechanic.couponReward}</p>
                    </div>
                  )}
                </div>
                {mechanic.couponTerms && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">Terms &amp; Conditions</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{mechanic.couponTerms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Flash Deal — claim window, spots, redeem window, terms */}
            {mechanic.type === 'flash' && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Claim Before</p>
                    <p className="text-sm font-bold text-gray-900">{fmtDate(mechanic.endDate)}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Redeem Before</p>
                    <p className="text-sm font-bold text-gray-900">
                      {mechanic.flashRedeemBefore ? fmtDate(mechanic.flashRedeemBefore) : '—'}
                    </p>
                  </div>
                  {mechanic.flashTotalSlots !== undefined && mechanic.flashClaimed !== undefined && (
                    <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: `${meta.cardFrom}12` }}>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Spots Claimed</p>
                        <p className="text-sm font-bold text-gray-900">{mechanic.flashClaimed} / {mechanic.flashTotalSlots}</p>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: meta.cardFrom }}>
                        {mechanic.flashTotalSlots - mechanic.flashClaimed} remaining
                      </p>
                    </div>
                  )}
                  {mechanic.flashReward && (
                    <div className="col-span-2 rounded-2xl p-4 text-center" style={{ background: `${meta.cardFrom}12` }}>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reward</p>
                      <p className="text-sm font-bold" style={{ color: meta.cardFrom }}>{mechanic.flashReward}</p>
                    </div>
                  )}
                </div>
                {mechanic.flashTerms && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">Terms &amp; Conditions</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{mechanic.flashTerms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bring a Friend — friend progress, claim window, redeem window, reward */}
            {mechanic.type === 'friend' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Claim Before</p>
                  <p className="text-sm font-bold text-gray-900">{fmtDate(mechanic.endDate)}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Redeem Before</p>
                  <p className="text-sm font-bold text-gray-900">
                    {mechanic.friendRedeemBefore ? fmtDate(mechanic.friendRedeemBefore) : '—'}
                  </p>
                </div>
                {mechanic.friendMinFriends !== undefined && (
                  <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: `${meta.cardFrom}12` }}>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Friends Brought</p>
                      <p className="text-sm font-bold text-gray-900">{mechanic.friendsBrought ?? 0} / {mechanic.friendMinFriends}</p>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: meta.cardFrom }}>
                      {Math.max(0, mechanic.friendMinFriends - (mechanic.friendsBrought ?? 0))} more to go
                    </p>
                  </div>
                )}
                {mechanic.friendReward && (
                  <div className="col-span-2 rounded-2xl p-4 text-center" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reward</p>
                    <p className="text-sm font-bold" style={{ color: meta.cardFrom }}>{mechanic.friendReward}</p>
                  </div>
                )}
              </div>
            )}

            {/* Community Offer — Group Unlock: shared group progress, reserve/redeem window, reward */}
            {mechanic.type === 'groupunlock' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reserve Before</p>
                  <p className="text-sm font-bold text-gray-900">{fmtDate(mechanic.endDate)}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Redeem Before</p>
                  <p className="text-sm font-bold text-gray-900">
                    {mechanic.groupRedeemBefore ? fmtDate(mechanic.groupRedeemBefore) : '—'}
                  </p>
                </div>
                {mechanic.groupTarget !== undefined && (
                  <div className="col-span-2 rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">People Joined</p>
                      <p className="text-xs font-semibold" style={{ color: meta.cardFrom }}>
                        {Math.max(0, mechanic.groupTarget - (mechanic.groupJoined ?? 0))} more to unlock
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-2">{mechanic.groupJoined ?? 0} / {mechanic.groupTarget}</p>
                    <div className="h-1.5 rounded-full bg-white overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round(((mechanic.groupJoined ?? 0) / mechanic.groupTarget) * 100))}%`, background: `linear-gradient(90deg, ${meta.cardFrom}, ${meta.cardTo})` }} />
                    </div>
                  </div>
                )}
                {mechanic.groupReward && (
                  <div className="col-span-2 rounded-2xl p-4 text-center" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reward</p>
                    <p className="text-sm font-bold" style={{ color: meta.cardFrom }}>{mechanic.groupReward}</p>
                  </div>
                )}
              </div>
            )}

            {/* Duration + players */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{mechanic.participants.toLocaleString()} players</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {fmtDate(mechanic.startDate)} → {fmtDate(mechanic.endDate)}
              </p>
            </div>
          </>
        )}

        {/* Business name */}
        <p className="text-xs text-gray-400 mb-1">Offered by</p>
        <p className="text-sm font-bold text-gray-800 mb-8">{biz.name}</p>

        {/* PLAY / CLAIM CTA */}
        {mechanic.type === 'groupunlock' ? (
          (() => {
            const groupFull = (mechanic.groupJoined ?? 0) >= (mechanic.groupTarget ?? Infinity)
            if (mechanic.hasReserved && groupFull) {
              return (
                <Link
                  href={`/customer/games/${mechanic.type}`}
                  className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-base text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`, boxShadow: `0 8px 28px ${meta.cardFrom}55` }}
                >
                  Claim Now {meta.emoji}
                </Link>
              )
            }
            if (mechanic.hasReserved) {
              return (
                <Link
                  href={`/customer/games/${mechanic.type}`}
                  className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-500 bg-gray-100"
                >
                  ✓ Reserved — View Status
                </Link>
              )
            }
            if (groupFull) {
              return (
                <div className="w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-400 bg-gray-100">
                  Group Full
                </div>
              )
            }
            return (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={openOTP}
                className="w-full py-4 rounded-2xl font-bold text-base text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`, boxShadow: `0 8px 28px ${meta.cardFrom}55` }}
              >
                Reserve a Spot {meta.emoji}
              </motion.button>
            )
          })()
        ) : mechanic.playedToday ? (
          <div className="w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-400 bg-gray-100 flex items-center justify-center gap-2">
            <span>✓</span> {mechanic.type === 'buyxgety' || mechanic.type === 'coupon' || mechanic.type === 'flash' || mechanic.type === 'friend' ? 'Claimed today' : 'Played today'} · Come back tomorrow
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openOTP}
            className="w-full py-4 rounded-2xl font-bold text-base text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`,
              boxShadow: `0 8px 28px ${meta.cardFrom}55`,
            }}
          >
            {mechanic.type === 'buyxgety' || mechanic.type === 'coupon' || mechanic.type === 'flash' || mechanic.type === 'friend' ? 'Claim Now' : 'Play Now'} {meta.emoji}
          </motion.button>
        )}
      </div>

      {/* OTP bottom sheet */}
      <AnimatePresence>
        {showOTP && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOTP}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto z-50 rounded-t-3xl overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #1E0A5C 0%, #0D0B1E 100%)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="px-6 pt-5 pb-10">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <div className="text-center mb-7">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                  >
                    {(() => {
                      const Icon = MECHANIC_ICONS[mechanic.type as keyof typeof MECHANIC_ICONS]
                      return <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                    })()}
                  </motion.div>
                  <h3 className="text-lg font-extrabold text-white mb-1">{mechanic.label}</h3>
                  <p className="text-sm text-white/40 leading-snug">
                    Enter the 3-digit code<br />from the Staff to Participate
                  </p>
                </div>

                <div className="flex gap-3 justify-center mb-7">
                  {[0, 1, 2].map(i => (
                    <input
                      key={i}
                      ref={digitRefs[i]}
                      value={digits[i]}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-[72px] h-[80px] text-center text-4xl font-black text-white outline-none rounded-2xl tracking-widest"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: digits[i] ? '2px solid rgba(167,139,250,0.8)' : '2px solid rgba(255,255,255,0.12)',
                        transition: 'border-color 0.15s ease',
                        boxShadow: digits[i] ? '0 0 0 4px rgba(139,92,246,0.15)' : 'none',
                      }}
                    />
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={joinCampaign}
                  disabled={!codeComplete}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: codeComplete
                      ? `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`
                      : 'rgba(255,255,255,0.08)',
                    color: codeComplete ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: codeComplete ? `0 8px 28px ${meta.cardFrom}55` : 'none',
                  }}
                >
                  {codeComplete ? 'Verify' : 'Enter 3 Digit Pin'}
                </motion.button>

                <button
                  onClick={closeOTP}
                  className="w-full mt-3 py-3 text-white/30 text-sm hover:text-white/50 transition-colors"
                >
                  Cancel
                </button>

                <p className="text-center text-[11px] text-white/20 mt-3">PIN Expires in 2 mins</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
