'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Phone, ExternalLink, CalendarDays, Gift, Flame, Ticket, Smartphone, Target, ChartPie, Dices, Zap, Lock, ChevronRight, ArrowRightLeft, TicketPercent, UserPlus, Handshake, Package } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/customer/bottom-nav'
import { MechanicPattern } from '@/components/customer/mechanic-pattern'
import { HERO_COVER } from '@/components/customer/hero-cover-data'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType, CustomerBusiness, ClaimableReward } from '@/lib/types'

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
  combo: '/customer/games/combo',
}

const MECHANIC_ICONS = {
  stamp:   Gift,
  shake:   Smartphone,
  checkin: Target,
  spin:    ChartPie,
  dice:    Dices,
  lottery: Ticket,
  buyxgety: ArrowRightLeft,
  coupon:  TicketPercent,
  flash:   Zap,
  friend:  UserPlus,
  groupunlock: Handshake,
  combo:   Package,
} as const

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#D1FAE5', text: '#065F46', label: 'Active'  },
  paused: { bg: '#FEF3C7', text: '#92400E', label: 'Paused'  },
  draft:  { bg: '#E5E7EB', text: '#374151', label: 'Draft'   },
  ended:  { bg: '#EDE9FE', text: '#5B21B6', label: 'Ended'   },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - new Date('2026-06-15').getTime()) / 86400000)
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Cafe:       { bg: '#FEF3C7', text: '#92400E' },
  Salon:      { bg: '#FCE7F3', text: '#9D174D' },
  Gym:        { bg: '#D1FAE5', text: '#065F46' },
  Restaurant: { bg: '#DBEAFE', text: '#1E40AF' },
  Jewellery:  { bg: '#EDE9FE', text: '#5B21B6' },
}

type Mechanic = CustomerBusiness['mechanics'][number]

const CTA_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  'rub-lamp':      { label: 'Rub the Lamp',     emoji: '🪔', color: '#92400E', bg: '#FEF3C7' },
  'summon-circle': { label: 'Draw the Circle',   emoji: '⭕', color: '#5B21B6', bg: '#EDE9FE' },
  'scratch-smoke': { label: 'Scratch the Smoke', emoji: '✦', color: '#065F46', bg: '#D1FAE5' },
}

function RewardCard({ reward }: { reward: ClaimableReward }) {
  const available = reward.totalSlots - reward.slotsClaimed
  const gameRoute = reward.ctaType === 'summon-circle'
    ? '/customer/games/summon-circle'
    : reward.ctaType === 'scratch-smoke'
      ? '/customer/games/scratch-smoke'
      : '/customer/games/rub-lamp'
  const claimUrl  = `${gameRoute}?name=${encodeURIComponent(reward.name)}&subtitle=${encodeURIComponent(reward.subtitle)}&pts=${reward.pointsCost}&avail=${available}&cb=${encodeURIComponent(reward.claimBefore)}&rb=${encodeURIComponent(reward.redeemBefore)}`
  const ctaMeta   = CTA_META[reward.ctaType]

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#FDFAF4', border: '1px solid #F3E8C8' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
          {reward.pointsCost} pts
        </span>
        {reward.isLocked ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#A78BFA', background: '#F5F3FF', borderRadius: 20, padding: '2px 8px' }}>
            <Gift className="w-3 h-3" />
            {reward.pointsNeeded} pts needed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#92400E', background: '#FEF3C7', borderRadius: 20, padding: '2px 8px' }}>
            <Gift className="w-3 h-3" />
            {reward.slotsClaimed}/{reward.totalSlots} Claimed
          </span>
        )}
      </div>

      {/* Reward identity + CTA */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border border-amber-100">
          {reward.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{reward.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{reward.subtitle}</p>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full"
            style={{ background: ctaMeta.bg, color: ctaMeta.color }}
          >
            {ctaMeta.emoji} {ctaMeta.label}
          </span>
        </div>
        {reward.isLocked ? (
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        ) : (
          <Link
            href={claimUrl}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#92400E' }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </Link>
        )}
      </div>

      {/* Dates */}
      <div className="flex items-center gap-3 mt-3 text-[10px]" style={{ color: '#92400E', opacity: 0.7 }}>
        <div className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          <span>Claim Before</span>
          <span className="font-semibold ml-0.5">{reward.claimBefore}</span>
        </div>
        <span className="opacity-40">|</span>
        <div className="flex items-center gap-1">
          <Gift className="w-3 h-3" />
          <span>Redeem Before</span>
          <span className="font-semibold ml-0.5">{reward.redeemBefore}</span>
        </div>
      </div>
    </div>
  )
}

function GroupUnlockCTA({ m, meta, onReserve }: { m: Mechanic; meta: typeof MECHANIC_META[MechanicType]; onReserve: () => void }) {
  const groupFull = (m.groupJoined ?? 0) >= (m.groupTarget ?? Infinity)

  if (m.hasReserved && groupFull) {
    return (
      <Link
        href={`/customer/games/${m.type}`}
        onClick={e => e.stopPropagation()}
        className="block w-full py-2.5 rounded-xl text-xs font-bold text-white text-center transition-all active:scale-95"
        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
      >
        Claim Now
      </Link>
    )
  }
  if (m.hasReserved) {
    return (
      <Link
        href={`/customer/games/${m.type}`}
        onClick={e => e.stopPropagation()}
        className="block w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gray-100 text-gray-500 transition-all active:scale-95"
      >
        ✓ Reserved — View Status
      </Link>
    )
  }
  if (groupFull) {
    return (
      <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gray-100 text-gray-400">
        Group Full
      </div>
    )
  }
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onReserve() }}
      className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
      style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
    >
      Reserve a Spot
    </button>
  )
}

// Mechanics with a "claim" CTA (deterministic reward, not a game of chance) — they share one
// compact info-box layout instead of each having a bespoke, more cluttered block.
const CLAIM_STYLE_TYPES: MechanicType[] = ['buyxgety', 'coupon', 'flash', 'friend', 'groupunlock', 'combo']

// Mechanics whose info box already embeds "playing today" + campaign duration,
// so the standalone social-proof row underneath would just repeat it.
const BOXED_ACTIVITY_TYPES: MechanicType[] = [...CLAIM_STYLE_TYPES, 'spin', 'dice', 'shake', 'lottery']

function ClaimInfoBox({
  meta, reward, progress, claimBefore, redeemBefore, extra,
}: {
  meta: typeof MECHANIC_META[MechanicType]
  reward?: string
  progress?: { current: number; total: number; label: string }
  claimBefore: string
  redeemBefore?: string
  extra?: React.ReactNode
}) {
  const pct = progress ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0
  return (
    <div className="mb-2.5 rounded-xl p-3" style={{ background: `${meta.cardFrom}0C`, border: `1px solid ${meta.cardFrom}22` }}>
      {(reward || progress) && (
        <div className="flex items-center justify-between mb-1.5">
          {reward && <span className="text-sm font-bold" style={{ color: meta.cardFrom }}>{reward}</span>}
          {progress && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white shrink-0 ml-auto" style={{ color: meta.cardFrom }}>
              {progress.current}/{progress.total} {progress.label}
            </span>
          )}
        </div>
      )}
      {progress && (
        <div className="h-1.5 rounded-full bg-white overflow-hidden mb-2">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.cardFrom}, ${meta.cardTo})` }} />
        </div>
      )}
      {extra}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
        <CalendarDays className="w-3 h-3 text-gray-400 shrink-0" />
        <span>
          Claim by <span className="font-semibold text-gray-700">{fmtDate(claimBefore)}</span>
          {redeemBefore && <> · Redeem by <span className="font-semibold text-gray-700">{fmtDate(redeemBefore)}</span></>}
        </span>
      </div>
    </div>
  )
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const biz = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]
  const catColor = CATEGORY_COLORS[biz.category] ?? { bg: '#F3F4F6', text: '#374151' }

  const [activeTab, setActiveTab] = useState<'campaigns' | 'rewards'>('campaigns')

  // Code entry state
  const [activeCampaign, setActiveCampaign] = useState<Mechanic | null>(null)
  const [digits, setDigits] = useState(['', '', ''])
  const ref0 = useRef<HTMLInputElement>(null)
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const digitRefs = [ref0, ref1, ref2]

  const openCampaign = (m: Mechanic) => {
    setActiveCampaign(m)
    setDigits(['', '', ''])
    setTimeout(() => ref0.current?.focus(), 350)
  }

  const closeCampaign = () => {
    setActiveCampaign(null)
    setDigits(['', '', ''])
  }

  const handleDigitChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = clean
    setDigits(next)
    if (clean && i < 2) digitRefs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digitRefs[i - 1].current?.focus()
    }
  }

  const joinCampaign = () => {
    if (!activeCampaign || digits.some(d => !d)) return
    closeCampaign()
    const base = MECHANIC_GAME_LINKS[activeCampaign.type]
    // Stamp: code is the participation code — auto-apply on landing
    router.push(activeCampaign.type === 'stamp' ? `${base}?stamp=1` : base)
  }

  const activeMeta = activeCampaign ? MECHANIC_META[activeCampaign.type] : null
  const codeComplete = digits.every(d => !!d)

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* ── Cover ───────────────────────────────────────────────── */}
      <div className="relative h-[280px] overflow-hidden">
        <img src={biz.coverImage} alt={biz.name} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)' }}
        />

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Rating */}
        <div className="absolute top-12 right-4 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-white">{biz.rating.toFixed(1)}</span>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          <div className="w-4 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Scallop */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem] z-10" />
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="px-5 pt-4">

        {/* Category pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: catColor.bg, color: catColor.text }}>
            {biz.category}
          </span>
        </motion.div>

        {/* Business name — hero in the white card */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="text-2xl font-black text-gray-900 leading-tight mb-3"
        >
          {biz.name}
        </motion.h1>

        {/* Mechanic filter pills — horizontal scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.06 }}
          className="flex gap-2 overflow-x-auto mb-3 pb-1 -mx-5 px-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {biz.mechanics.map(m => (
            <span
              key={m.type}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1 rounded-full border"
              style={{ background: '#F8F4FF', color: '#6D28D9', borderColor: '#E9D5FF' }}
            >
              {MECHANIC_META[m.type].label.toUpperCase()}
            </span>
          ))}
        </motion.div>

        {/* Location + distance */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
          className="flex items-center gap-2 mb-2 text-xs text-gray-500"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{biz.location}</span>
          <span className="text-gray-300">·</span>
          <span className="font-medium text-gray-400">{biz.distance}</span>
        </motion.div>

        {/* Open + phone */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-3 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-green-600 font-semibold">{biz.openUntil}</span>
          </div>
          <span className="text-gray-300">·</span>
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="w-3 h-3" />
            <span>{biz.phone}</span>
          </div>
          <a href="#" className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            <span className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] font-black"
              style={{ background: 'linear-gradient(135deg, #4285F4, #0F9D58)' }}>G</span>
            Google Reviews
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
          className="text-sm text-gray-400 mb-6 leading-relaxed italic"
        >
          {biz.tagline}
        </motion.p>

        {/* ── Campaigns / Rewards Tab Switcher ─────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.13 }}
          className="flex gap-0 mb-5 border-b border-gray-100"
        >
          {(['campaigns', 'rewards'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-1 pb-2.5 mr-6 text-sm font-bold capitalize relative"
              style={{ color: activeTab === tab ? '#7C3AED' : '#9CA3AF' }}
            >
              {tab === 'campaigns'
                ? <Zap className="w-3.5 h-3.5" />
                : <Gift className="w-3.5 h-3.5" />
              }
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#7C3AED' }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Campaigns tab ─────────────────────────────────────── */}
        {activeTab === 'campaigns' && (
          <>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-gray-400 mb-4"
            >
              Ask the staff for a code and tap a campaign to participate
            </motion.p>
        <div className="space-y-4 mb-4">
          {biz.mechanics.map((m, i) => {
            const meta = MECHANIC_META[m.type]
            return (
              <motion.div
                key={m.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.17 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
              >
                <Link
                  href={`/customer/business/${biz.id}/campaign/${m.type}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.18 } }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-shadow"
                  >
                    {/* Cover */}
                    {(() => {
                      const hero = HERO_COVER[m.type]
                      const Art = hero?.art

                      if (hero && hero.layout === 'side') {
                        return (
                          <div
                            className={`relative overflow-hidden ${hero.features ? 'h-64' : 'h-40'}`}
                            style={{ background: `linear-gradient(135deg, ${hero.bgFrom}, ${hero.bgTo})` }}
                          >
                            <span className="absolute top-6 right-24 w-1.5 h-1.5 rounded-full" style={{ background: hero.textColor, opacity: 0.25 }} />
                            <span className="absolute bottom-10 left-32 w-1 h-1 rounded-full" style={{ background: hero.textColor, opacity: 0.3 }} />
                            <span className="absolute top-10 left-40 w-1 h-1 rounded-full" style={{ background: hero.textColor, opacity: 0.2 }} />

                            <span
                              className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70"
                              style={{ color: hero.textColor }}
                            >
                              {meta.label}
                            </span>
                            <span
                              className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                              style={{ background: STATUS_STYLES[m.status]?.bg, color: STATUS_STYLES[m.status]?.text }}
                            >
                              {STATUS_STYLES[m.status]?.label}
                            </span>

                            <div className={`flex items-center justify-between w-full pl-4 pr-6 pt-4 ${hero.features ? '' : 'h-full'}`}>
                              <div className="max-w-[52%]">
                                <p className="text-lg font-extrabold leading-tight" style={{ color: hero.textColor }}>
                                  {hero.headline}
                                </p>
                                {hero.headlineAccent && (
                                  <p className="text-lg font-extrabold leading-tight mb-1" style={{ color: hero.accentColor ?? hero.textColor }}>
                                    {hero.headlineAccent}
                                  </p>
                                )}
                                {!hero.headlineAccent && <div className="mb-1" />}
                                <p className="text-[11px] leading-snug opacity-80" style={{ color: hero.textColor }}>
                                  {hero.tagline}
                                </p>
                              </div>
                              {Art && (
                                <motion.div
                                  className="w-28 h-28 shrink-0"
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                  <Art className="w-full h-full" />
                                </motion.div>
                              )}
                            </div>

                            {hero.features && (
                              <div className="absolute bottom-3 left-4 right-4 rounded-xl bg-white/40 backdrop-blur-sm px-2 py-2 flex items-center justify-center gap-1">
                                {hero.features.map((f, fi) => (
                                  <div key={fi} className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: hero.accentColor ?? hero.textColor }}>
                                      <f.icon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-[9px] leading-tight font-medium" style={{ color: hero.textColor }}>
                                      {f.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      }

                      if (hero && hero.layout === 'center') {
                        return (
                          <div
                            className="relative h-56 overflow-hidden"
                            style={{ background: `linear-gradient(160deg, ${hero.bgFrom}, ${hero.bgTo})` }}
                          >
                            {/* decorative dot grid + sparkles */}
                            <div className="absolute top-4 left-4 grid grid-cols-4 gap-1 opacity-25">
                              {Array.from({ length: 12 }, (_, d) => (
                                <span key={d} className="w-1 h-1 rounded-full bg-white" />
                              ))}
                            </div>
                            <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1 opacity-20">
                              {Array.from({ length: 12 }, (_, d) => (
                                <span key={d} className="w-1 h-1 rounded-full bg-white" />
                              ))}
                            </div>
                            <span className="absolute top-8 right-10 w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                            <span className="absolute bottom-16 left-8 w-2 h-2 rounded-full border border-white opacity-25" />
                            <span className="absolute top-20 right-6 text-white opacity-30 text-xs">✦</span>

                            <span
                              className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                              style={{ background: hero.badgeBg, color: hero.bgTo }}
                            >
                              {meta.label}
                            </span>
                            <span
                              className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                              style={{ background: STATUS_STYLES[m.status]?.bg, color: STATUS_STYLES[m.status]?.text }}
                            >
                              {STATUS_STYLES[m.status]?.label}
                            </span>

                            <div className="relative h-full flex flex-col items-center justify-center pt-8 pb-3 px-4">
                              <p className="text-xl font-extrabold text-center leading-tight" style={{ color: hero.textColor }}>
                                {hero.headline}
                              </p>
                              <p className="text-[11px] text-center leading-snug opacity-90 mt-1 mb-2" style={{ color: hero.textColor }}>
                                {hero.tagline}
                              </p>

                              {Art && (
                                <motion.div
                                  className="w-32 h-24 shrink-0"
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                  <Art className="w-full h-full" />
                                </motion.div>
                              )}

                              {hero.features && (
                                <div className="flex items-center justify-center gap-2.5 mt-auto pt-2">
                                  {hero.features.map((f, fi) => (
                                    <div key={fi} className="flex flex-col items-center gap-1 w-14">
                                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <f.icon className="w-3 h-3" style={{ color: hero.textColor }} />
                                      </div>
                                      <span className="text-[8px] leading-tight text-center opacity-85" style={{ color: hero.textColor }}>
                                        {f.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          className="relative h-32 overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                        >
                          <MechanicPattern type={m.type} />
                          <motion.span
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-20 select-none pointer-events-none"
                            animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                            transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {meta.emoji}
                          </motion.span>
                          <span
                            className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: meta.badgeBg, color: meta.badgeText }}
                          >
                            {meta.label}
                          </span>
                          <span
                            className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: STATUS_STYLES[m.status]?.bg, color: STATUS_STYLES[m.status]?.text }}
                          >
                            {STATUS_STYLES[m.status]?.label}
                          </span>
                        </div>
                      )
                    })()}

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{m.label}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Urgency chip */}
                          {m.status === 'active' && daysUntil(m.endDate) <= 7 && daysUntil(m.endDate) > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                              Ends in {daysUntil(m.endDate)}d
                            </span>
                          )}
                          {m.type === 'checkin' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              +100 pts
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2.5 leading-relaxed">{m.description}</p>

                      {/* Stamp: sealed mini dot grid */}
                      {m.type === 'stamp' && m.stampsCollected !== undefined && m.totalStamps && (
                        <div className="mb-2.5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-400 font-medium">Stamps</span>
                            <span className="text-[11px] font-bold" style={{ color: meta.cardFrom }}>
                              {m.stampsCollected}/{m.totalStamps}
                            </span>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {Array.from({ length: m.totalStamps }, (_, i) => {
                              const filled = i < m.stampsCollected!
                              return (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full"
                                  style={filled
                                    ? { background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }
                                    : { background: '#D1D5DB' }
                                  }
                                />
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Spin / dice / shake: possible rewards */}
                      {(m.type === 'spin' || m.type === 'dice' || m.type === 'shake') && m.prizes && m.prizes.length > 0 && (
                        <div className="mb-2.5 rounded-xl p-3" style={{ background: `${meta.cardFrom}0C`, border: `1px solid ${meta.cardFrom}22` }}>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Possible Rewards</p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.prizes.slice(0, 3).map(p => (
                              <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white" style={{ color: meta.cardFrom }}>{p}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-2 pt-2 border-t" style={{ borderColor: `${meta.cardFrom}22` }}>
                            {(m.activeToday ?? 0) > 0 && (
                              <>
                                <span className="font-semibold" style={{ color: meta.cardFrom }}>{m.activeToday} playing today</span>
                                <span className="text-gray-300">·</span>
                              </>
                            )}
                            <span>{fmtDate(m.startDate)} – {fmtDate(m.endDate)}</span>
                          </div>
                        </div>
                      )}

                      {/* Lottery: draw date + tickets */}
                      {m.type === 'lottery' && (
                        <div className="mb-2.5 rounded-xl p-3" style={{ background: `${meta.cardFrom}0C`, border: `1px solid ${meta.cardFrom}22` }}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700">
                              <CalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: meta.cardFrom }} />
                              <span>Draw on <span className="font-bold" style={{ color: meta.cardFrom }}>{fmtDate(m.drawDate ?? m.endDate)}</span></span>
                            </div>
                            {(m.userTickets ?? 0) > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white shrink-0" style={{ color: meta.cardFrom }}>
                                {m.userTickets} ticket{m.userTickets !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-2 pt-2 border-t" style={{ borderColor: `${meta.cardFrom}22` }}>
                            {(m.activeToday ?? 0) > 0 && (
                              <>
                                <span className="font-semibold" style={{ color: meta.cardFrom }}>{m.activeToday} playing today</span>
                                <span className="text-gray-300">·</span>
                              </>
                            )}
                            <span>{fmtDate(m.startDate)} – {fmtDate(m.endDate)}</span>
                          </div>
                        </div>
                      )}

                      {/* Check-in: streak + points */}
                      {m.type === 'checkin' && (m.checkInStreak || m.totalPoints) && (
                        <div className="flex items-center gap-3 mb-2.5">
                          {m.checkInStreak && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                              <Flame className="w-3 h-3" />
                              <span>{m.checkInStreak} day streak</span>
                            </div>
                          )}
                          {m.totalPoints !== undefined && (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                              <span>⭐ {m.totalPoints} pts total</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Buy X Get Y */}
                      {m.type === 'buyxgety' && (
                        <ClaimInfoBox
                          meta={meta}
                          reward={m.buyReward}
                          progress={m.buyTotalSlots !== undefined && m.buyClaimed !== undefined ? { current: m.buyClaimed, total: m.buyTotalSlots, label: 'claimed' } : undefined}
                          claimBefore={m.endDate}
                          redeemBefore={m.buyRedeemBefore}
                        />
                      )}

                      {/* Coupon Codes */}
                      {m.type === 'coupon' && (
                        <ClaimInfoBox
                          meta={meta}
                          reward={m.couponReward}
                          progress={m.couponTotalSlots !== undefined && m.couponClaimed !== undefined ? { current: m.couponClaimed, total: m.couponTotalSlots, label: 'claimed' } : undefined}
                          claimBefore={m.endDate}
                          redeemBefore={m.couponRedeemBefore}
                        />
                      )}

                      {/* Flash Sale */}
                      {m.type === 'flash' && (
                        <ClaimInfoBox
                          meta={meta}
                          reward={m.flashReward}
                          progress={m.flashTotalSlots !== undefined && m.flashClaimed !== undefined ? { current: m.flashClaimed, total: m.flashTotalSlots, label: 'claimed' } : undefined}
                          claimBefore={m.endDate}
                          redeemBefore={m.flashRedeemBefore}
                        />
                      )}

                      {/* Bring Your Friend */}
                      {m.type === 'friend' && (
                        <ClaimInfoBox
                          meta={meta}
                          reward={m.friendReward}
                          progress={m.friendMinFriends !== undefined ? { current: m.friendsBrought ?? 0, total: m.friendMinFriends, label: 'friends' } : undefined}
                          claimBefore={m.endDate}
                          redeemBefore={m.friendRedeemBefore}
                        />
                      )}

                      {/* Community Offer - Group Unlock */}
                      {m.type === 'groupunlock' && (
                        <ClaimInfoBox
                          meta={meta}
                          reward={m.groupReward}
                          progress={m.groupTarget !== undefined ? { current: m.groupJoined ?? 0, total: m.groupTarget, label: 'joined' } : undefined}
                          claimBefore={m.endDate}
                          redeemBefore={m.groupRedeemBefore}
                        />
                      )}

                      {/* Bundle/Combo Offers */}
                      {m.type === 'combo' && (
                        <ClaimInfoBox
                          meta={meta}
                          progress={m.comboTotalSpots !== undefined ? { current: m.comboClaimed ?? 0, total: m.comboTotalSpots, label: 'claimed' } : undefined}
                          claimBefore={m.endDate}
                          redeemBefore={m.comboRedeemBefore}
                          extra={
                            m.comboVariant === 'freeitem' ? (
                              <div className="flex items-center flex-wrap gap-1.5 mb-2">
                                {(m.comboPaidItems ?? []).map((it, idx) => (
                                  <span key={idx} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-gray-600">{it}</span>
                                ))}
                                <span className="text-xs text-gray-400 font-bold">+</span>
                                {(m.comboFreeItems ?? []).map((it, idx) => (
                                  <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}>
                                    {it} FREE
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-baseline gap-1.5">
                                  {m.comboOriginalPrice !== undefined && (
                                    <span className="text-xs text-gray-400 line-through">₹{m.comboOriginalPrice}</span>
                                  )}
                                  {m.comboBundlePrice !== undefined && (
                                    <span className="text-sm font-bold" style={{ color: meta.cardFrom }}>₹{m.comboBundlePrice}</span>
                                  )}
                                </div>
                                {m.comboOriginalPrice !== undefined && m.comboBundlePrice !== undefined && m.comboOriginalPrice > m.comboBundlePrice && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white" style={{ color: meta.cardFrom }}>
                                    Save {Math.round(((m.comboOriginalPrice - m.comboBundlePrice) / m.comboOriginalPrice) * 100)}%
                                  </span>
                                )}
                              </div>
                            )
                          }
                        />
                      )}

                      {/* Social proof + date row — several mechanics already show this in their info box above */}
                      {!BOXED_ACTIVITY_TYPES.includes(m.type) && (
                        <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-400">
                          {(m.activeToday ?? 0) > 0 && (
                            <>
                              <span className="font-semibold text-gray-500">{m.activeToday} playing today</span>
                              <span className="text-gray-200">·</span>
                            </>
                          )}
                          <span>{fmtDate(m.startDate)} – {fmtDate(m.endDate)}</span>
                        </div>
                      )}

                      {/* Play Now / Claim Now / Played Today */}
                      {m.type === 'groupunlock' ? (
                        <GroupUnlockCTA m={m} meta={meta} onReserve={() => openCampaign(m)} />
                      ) : m.playedToday ? (
                        <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gray-100 text-gray-400">
                          ✓ {CLAIM_STYLE_TYPES.includes(m.type) ? 'Claimed today' : 'Played today'} · Come back tomorrow
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); openCampaign(m) }}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                        >
                          {CLAIM_STYLE_TYPES.includes(m.type) ? 'Claim Now' : 'Play Now'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>
          </>
        )}

        {/* ── Rewards tab ───────────────────────────────────────── */}
        {activeTab === 'rewards' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-4">

            {/* Claimable rewards */}
            {(() => {
              const claimable = (biz.claimableRewards ?? []).filter(r => !r.isLocked)
              return claimable.length > 0 ? (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-gray-900">Rewards to claim</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                      {claimable.length} available
                    </span>
                  </div>
                  <div className="space-y-3">
                    {claimable.map(r => (
                      <RewardCard key={r.id} reward={r} />
                    ))}
                  </div>
                </div>
              ) : null
            })()}

            {/* Locked rewards */}
            {(() => {
              const locked = (biz.claimableRewards ?? []).filter(r => r.isLocked)
              return locked.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-gray-900">Locked Rewards</h3>
                    <button className="text-[11px] font-bold text-purple-600">See all</button>
                  </div>
                  <div className="space-y-3">
                    {locked.map(r => (
                      <RewardCard key={r.id} reward={r} />
                    ))}
                  </div>
                </div>
              ) : null
            })()}

            {!(biz.claimableRewards?.length) && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🎁</p>
                <p className="text-sm">No rewards available right now</p>
              </div>
            )}
          </motion.div>
        )}

      </div>

      <BottomNav />

      {/* ── 3-digit code entry sheet ───────────────────────────── */}
      <AnimatePresence>
        {activeCampaign && activeMeta && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCampaign}
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
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                {/* Campaign identity */}
                <div className="text-center mb-7">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${activeMeta.cardFrom}, ${activeMeta.cardTo})` }}
                  >
                    {(() => {
                      const Icon = MECHANIC_ICONS[activeCampaign.type]
                      return <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                    })()}
                  </motion.div>
                  <h3 className="text-lg font-extrabold text-white mb-1">{activeCampaign.label}</h3>
                  <p className="text-sm text-white/40 leading-snug">
                    Enter the 3-digit code<br />from the Staff to Participate
                  </p>
                </div>

                {/* OTP boxes */}
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
                        border: digits[i]
                          ? '2px solid rgba(167,139,250,0.8)'
                          : '2px solid rgba(255,255,255,0.12)',
                        transition: 'border-color 0.15s ease',
                        boxShadow: digits[i] ? '0 0 0 4px rgba(139,92,246,0.15)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={joinCampaign}
                  disabled={!codeComplete}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: codeComplete
                      ? `linear-gradient(135deg, ${activeMeta.cardFrom}, ${activeMeta.cardTo})`
                      : 'rgba(255,255,255,0.08)',
                    color: codeComplete ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: codeComplete ? `0 8px 28px ${activeMeta.cardFrom}55` : 'none',
                  }}
                >
                  {codeComplete ? 'Verify' : 'Enter 3 Digit Pin'}
                </motion.button>

                <button
                  onClick={closeCampaign}
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
