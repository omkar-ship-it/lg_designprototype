'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Phone, ExternalLink, CalendarDays, Gift, Flame, Ticket, Smartphone, Target, Sparkles, Dices, Zap, Lock, ChevronRight, Wallet } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/customer/bottom-nav'
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
}

const MECHANIC_ICONS = {
  stamp:   Gift,
  shake:   Smartphone,
  checkin: Target,
  spin:    Sparkles,
  dice:    Dices,
  lottery: Ticket,
  buyxgety: Wallet,
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
                    <div
                      className="relative h-32 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                    >
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                      />
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
                      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-sm">
                        {meta.emoji}
                      </div>
                    </div>

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

                      {/* Spin / dice / shake: prize preview */}
                      {(m.type === 'spin' || m.type === 'dice' || m.type === 'shake') && m.prizes && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {m.prizes.slice(0, 3).map(p => (
                            <span key={p} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p}</span>
                          ))}
                        </div>
                      )}

                      {/* Lottery: draw date + tickets */}
                      {m.type === 'lottery' && (
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="flex items-center gap-1 text-[11px] text-gray-600 font-medium">
                            <CalendarDays className="w-3 h-3 text-gray-400" />
                            <span>Draw: {fmtDate(m.drawDate ?? m.endDate)}</span>
                          </div>
                          {(m.userTickets ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: meta.cardFrom }}>
                              <Ticket className="w-3 h-3" />
                              <span>{m.userTickets} ticket{m.userTickets !== 1 ? 's' : ''}</span>
                            </div>
                          )}
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

                      {/* Buy X Get Y: progress toward reward */}
                      {m.type === 'buyxgety' && m.buyProgress !== undefined && m.buyTarget && (
                        <div className="mb-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {m.buyCondition === 'spend' ? 'Spend Progress' : 'Purchase Progress'}
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: meta.cardFrom }}>
                              {m.buyCondition === 'spend' ? `₹${m.buyProgress} / ₹${m.buyTarget}` : `${m.buyProgress} / ${m.buyTarget}`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.round((m.buyProgress / m.buyTarget) * 100))}%`, background: `linear-gradient(90deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                            />
                          </div>
                          {m.buyReward && (
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              Reach the goal for <span className="font-semibold" style={{ color: meta.cardFrom }}>{m.buyReward}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Social proof + date row */}
                      <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-400">
                        {(m.activeToday ?? 0) > 0 && (
                          <span className="font-semibold text-gray-500">{m.activeToday} playing today</span>
                        )}
                        {(m.activeToday ?? 0) > 0 && <span className="text-gray-200">·</span>}
                        <span>{fmtDate(m.startDate)} – {fmtDate(m.endDate)}</span>
                      </div>

                      {/* Play Now / Played Today */}
                      {m.playedToday ? (
                        <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gray-100 text-gray-400">
                          ✓ Played today · Come back tomorrow
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); openCampaign(m) }}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                        >
                          Play Now
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
