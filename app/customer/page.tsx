'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Search, Star, MapPin } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { CustomerBusiness, MechanicType } from '@/lib/types'

// ── Demo user ─────────────────────────────────────────────────
const demo        = customers[0]
const firstName   = demo.name.split(' ')[0]
const activeCount = demo.rewards.filter(r => r.status === 'pending').length
const totalPoints = Math.max(0, ...customerBusinesses.flatMap(b => b.mechanics.map(m => m.totalPoints ?? 0)))
const topStreak   = Math.max(0, ...customerBusinesses.flatMap(b => b.mechanics.map(m => m.checkInStreak ?? 0)))

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Campaign card types ────────────────────────────────────────
type HeroCard = {
  bizId: string
  bizName: string
  bizDistance: string
  bizCoverImage: string
  bizCoverFrom: string
  bizCoverTo: string
  mechType: MechanicType
  campaignLabel: string
  prizes: string[]
  prizeHint: string
  statusLine: string
  cta: string
  canPlayNow: boolean
  cardFrom: string
  cardTo: string
  emoji: string
}

type JourneyCard = {
  bizId: string
  bizName: string
  bizDistance: string
  mechType: MechanicType
  campaignLabel: string
  cardFrom: string
  cardTo: string
  emoji: string
  // progress
  stampsCollected?: number
  totalStamps?: number
  checkInStreak?: number
  totalPoints?: number
  userTickets?: number
  drawDate?: string
}

// ── Data builders ─────────────────────────────────────────────
function buildHeroCards(): HeroCard[] {
  const cards: HeroCard[] = []
  for (const biz of customerBusinesses) {
    for (const m of biz.mechanics) {
      if (m.status !== 'active') continue
      const meta   = MECHANIC_META[m.type]
      const prizes = (m as any).prizes as string[] | undefined

      let prizeHint = ''
      if (m.type === 'stamp')   prizeHint = 'Surprise drop on your next visit 🎁'
      if (m.type === 'checkin') prizeHint = '+100 pts every time you check in'
      if (m.type === 'lottery') prizeHint = 'Win the grand prize in the draw'
      if (m.type === 'spin')    prizeHint = 'Spin to win instantly'
      if (m.type === 'shake')   prizeHint = 'Scratch and reveal your reward'
      if (m.type === 'dice')    prizeHint = 'Roll to win a surprise'

      let statusLine = ''
      if (m.type === 'stamp' && (m as any).stampsCollected !== undefined) {
        statusLine = `${(m as any).stampsCollected}/${(m as any).totalStamps} stamps collected`
      } else if (m.type === 'checkin') {
        statusLine = (m as any).checkInStreak ? `🔥 ${(m as any).checkInStreak} day streak` : 'Start your streak today'
      } else if (m.type === 'lottery') {
        const t = (m as any).userTickets ?? 0
        const d = (m as any).drawDate ? ` · Draw ${fmtDate((m as any).drawDate)}` : ''
        statusLine = `${t} ticket${t !== 1 ? 's' : ''} entered${d}`
      } else {
        statusLine = `${(m as any).activeToday ?? 0} playing today`
      }

      let cta = 'Play Now →'
      if (m.type === 'stamp')   cta = 'Visit to Collect →'
      if (m.type === 'checkin') cta = 'Check In →'
      if (m.type === 'lottery') cta = 'Get Ticket →'
      if ((m as any).playedToday) cta = '✓ Come Back Tomorrow'

      cards.push({
        bizId: biz.id, bizName: biz.name, bizDistance: biz.distance,
        bizCoverImage: biz.coverImage, bizCoverFrom: biz.coverFrom, bizCoverTo: biz.coverTo,
        mechType: m.type, campaignLabel: m.label,
        prizes: prizes ?? [],
        prizeHint, statusLine, cta,
        canPlayNow: !(m as any).playedToday,
        cardFrom: meta.cardFrom, cardTo: meta.cardTo, emoji: meta.emoji,
      })
    }
  }
  return cards.sort((a, b) => (b.canPlayNow ? 1 : 0) - (a.canPlayNow ? 1 : 0))
}

function buildJourneyCards(): JourneyCard[] {
  const cards: JourneyCard[] = []
  for (const biz of customerBusinesses) {
    for (const m of biz.mechanics) {
      if (m.status !== 'active') continue
      if (!['stamp', 'checkin', 'lottery'].includes(m.type)) continue
      const a  = m as any
      const meta = MECHANIC_META[m.type]
      // Only include if user has meaningful progress
      const hasProgress =
        (m.type === 'stamp'   && a.stampsCollected > 0) ||
        (m.type === 'checkin' && (a.checkInStreak ?? 0) > 0) ||
        (m.type === 'lottery' && (a.userTickets ?? 0) > 0)
      if (!hasProgress) continue
      cards.push({
        bizId: biz.id, bizName: biz.name, bizDistance: biz.distance,
        mechType: m.type, campaignLabel: m.label,
        cardFrom: meta.cardFrom, cardTo: meta.cardTo, emoji: meta.emoji,
        stampsCollected: a.stampsCollected, totalStamps: a.totalStamps,
        checkInStreak: a.checkInStreak, totalPoints: a.totalPoints,
        userTickets: a.userTickets, drawDate: a.drawDate,
      })
    }
  }
  return cards
}

const heroCards    = buildHeroCards()
const journeyCards = buildJourneyCards()

// ── Category filter ───────────────────────────────────────────
const CATEGORIES = [
  { key: 'All',        emoji: '✨' },
  { key: 'Cafe',       emoji: '☕' },
  { key: 'Salon',      emoji: '✂️' },
  { key: 'Gym',        emoji: '🏋️' },
  { key: 'Restaurant', emoji: '🍽️' },
  { key: 'Jewellery',  emoji: '💎' },
] as const
type CategoryKey = typeof CATEGORIES[number]['key']

// ── Hero campaign card ────────────────────────────────────────
function HeroCampaignCard({ c, index }: { c: HeroCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
      className="shrink-0 snap-center"
      style={{ width: 'min(82vw, 340px)' }}
    >
      <Link href={`/customer/business/${c.bizId}/campaign/${c.mechType}`}>
        <div
          className="relative rounded-3xl overflow-hidden select-none"
          style={{
            height: 300,
            boxShadow: c.canPlayNow
              ? `0 20px 56px ${c.cardFrom}44, 0 4px 16px rgba(0,0,0,0.18)`
              : '0 8px 32px rgba(0,0,0,0.16)',
          }}
        >
          {/* Business cover photo */}
          <img
            src={c.bizCoverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay — stronger at bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${c.bizCoverFrom}22 0%, ${c.bizCoverTo}EE 65%, ${c.bizCoverTo}FF 100%)`,
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col p-4 gap-0">

            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-white/80 uppercase tracking-wide">
                  {c.bizName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-white/40" />
                  <p className="text-[10px] text-white/45">{c.bizDistance}</p>
                </div>
              </div>

              {c.canPlayNow ? (
                <div className="flex items-center gap-1.5 bg-green-500 rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[9px] font-extrabold text-white tracking-wider">LIVE</span>
                </div>
              ) : (
                <div className="rounded-full px-2.5 py-1 bg-black/25 backdrop-blur-sm">
                  <span className="text-[9px] font-semibold text-white/50">Played today ✓</span>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Campaign identity */}
            <div className="mb-3">
              <div className="flex items-end gap-3 mb-1.5">
                <span className="text-4xl drop-shadow-lg leading-none">{c.emoji}</span>
                <div>
                  <p className="text-[18px] font-extrabold text-white leading-tight">{c.campaignLabel}</p>
                  <p className="text-[11px] text-white/55 font-medium mt-0.5">{c.prizeHint}</p>
                </div>
              </div>

              {/* Prize chips (game types) */}
              {c.prizes.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2 mb-1">
                  {c.prizes.slice(0, 4).map((p, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)' }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Status line (progress types) */}
              {c.prizes.length === 0 && (
                <p className="text-[11px] text-white/55 mt-1">{c.statusLine}</p>
              )}
            </div>

            {/* CTA button */}
            <div
              className="w-full py-3 rounded-2xl text-center text-[13px] font-extrabold"
              style={c.canPlayNow ? {
                background: 'rgba(255,255,255,0.95)',
                color: c.cardFrom,
              } : {
                background: 'rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {c.cta}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Journey (progress) card ───────────────────────────────────
function JourneyCard({ c, index }: { c: JourneyCard; index: number }) {
  const daysUntilDraw = c.drawDate
    ? Math.max(0, Math.ceil((new Date(c.drawDate).getTime() - new Date('2026-06-15').getTime()) / 86400000))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 + index * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
      className="shrink-0 snap-center"
      style={{ width: 'min(68vw, 260px)' }}
    >
      <Link href={`/customer/business/${c.bizId}/campaign/${c.mechType}`}>
        <div
          className="relative rounded-2xl overflow-hidden select-none"
          style={{
            height: 160,
            background: `linear-gradient(145deg, ${c.cardFrom}DD, ${c.cardTo})`,
            boxShadow: `0 10px 30px ${c.cardFrom}55`,
          }}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />

          <div className="absolute inset-0 flex flex-col p-3.5">
            {/* Top */}
            <div className="flex items-start justify-between mb-auto">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[9px] font-extrabold text-white/60 uppercase tracking-widest truncate">
                  {c.bizName} · {c.bizDistance}
                </p>
                <p className="text-[14px] font-extrabold text-white mt-0.5 leading-tight">{c.campaignLabel}</p>
              </div>
              <span className="text-2xl leading-none shrink-0">{c.emoji}</span>
            </div>

            {/* Progress metric */}
            {c.mechType === 'stamp' && c.stampsCollected !== undefined && c.totalStamps && (
              <div>
                {/* Mini dot row */}
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: c.totalStamps }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full"
                      style={{ background: i < c.stampsCollected! ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)' }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-bold text-white/75">
                  {c.stampsCollected}/{c.totalStamps} stamps · {c.totalStamps - c.stampsCollected} more to unlock
                </p>
              </div>
            )}

            {c.mechType === 'checkin' && (
              <div>
                <p className="text-2xl font-black text-white leading-none mb-0.5">
                  🔥 {c.checkInStreak ?? 0}
                </p>
                <p className="text-[11px] font-semibold text-white/65">
                  day streak · {(c.totalPoints ?? 0).toLocaleString()} pts total
                </p>
              </div>
            )}

            {c.mechType === 'lottery' && (
              <div>
                <p className="text-2xl font-black text-white leading-none mb-0.5">
                  🎟️ {c.userTickets ?? 0}
                </p>
                <p className="text-[11px] font-semibold text-white/65">
                  {c.userTickets === 1 ? 'ticket' : 'tickets'} entered
                  {daysUntilDraw !== null ? ` · Draw in ${daysUntilDraw}d` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Business card ─────────────────────────────────────────────
function BusinessCard({ biz, index }: { biz: CustomerBusiness; index: number }) {
  const activeMechs = biz.mechanics.filter(m => m.status === 'active')
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.06 }}
    >
      <Link href={`/customer/business/${biz.id}`}>
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="flex gap-3 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm items-center"
        >
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
            <img src={biz.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${biz.coverFrom}99, ${biz.coverTo}CC)` }} />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">{biz.coverEmoji}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-extrabold text-gray-900 truncate">{biz.name}</p>
            </div>
            <div className="flex items-center gap-1 mb-1.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
              <span className="text-xs font-bold text-gray-600">{biz.rating.toFixed(1)}</span>
              <span className="text-gray-300 text-xs">·</span>
              <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-400 truncate">{biz.distance}</span>
            </div>
            {/* Active campaign pills */}
            <div className="flex gap-1 flex-wrap">
              {activeMechs.slice(0, 3).map(m => {
                const meta = MECHANIC_META[m.type]
                return (
                  <span
                    key={m.type}
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${meta.cardFrom}18`, color: meta.cardFrom }}
                  >
                    {meta.emoji} {m.label}
                  </span>
                )
              })}
              {activeMechs.length > 3 && (
                <span className="text-[9px] font-semibold text-gray-400 px-1.5 py-0.5">+{activeMechs.length - 3}</span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M4 2L7 5L4 8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function CustomerHomePage() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState<CategoryKey>('All')
  const [focused,  setFocused]  = useState(false)

  const filtered = customerBusinesses.filter(b => {
    const matchCat    = category === 'All' || b.category === category
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                        b.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Compact purple header ──────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-start justify-between"
        >
          <div>
            <p className="text-purple-300 text-xs font-medium tracking-wide">Welcome back</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5">Hello, {firstName} 👋</h1>
            {/* Points + streak — one compact line */}
            {(totalPoints > 0 || topStreak > 0) && (
              <div className="flex items-center gap-3 mt-1.5">
                {totalPoints > 0 && (
                  <span className="text-sm font-semibold text-white/80">⭐ {totalPoints.toLocaleString()} pts</span>
                )}
                {totalPoints > 0 && topStreak > 0 && <span className="text-purple-400 text-xs">·</span>}
                {topStreak > 0 && (
                  <span className="text-sm font-semibold text-white/80">🔥 {topStreak} day streak</span>
                )}
              </div>
            )}
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
            <motion.div
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400"
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </button>
        </motion.div>

        {/* Redeem nudge */}
        {activeCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative mt-3">
            <Link href="/customer/wallet">
              <div
                className="flex items-center justify-between rounded-xl px-3.5 py-2"
                style={{ background: 'rgba(245,197,24,0.13)', border: '1px solid rgba(245,197,24,0.30)' }}
              >
                <p className="text-sm font-semibold text-yellow-300">
                  💳 {activeCount} reward{activeCount !== 1 ? 's' : ''} ready to redeem
                </p>
                <span className="text-yellow-400 text-sm font-bold">→</span>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      {/* ── White body ────────────────────────────────────── */}
      <div className="bg-white rounded-t-3xl -mt-3 pt-6 min-h-screen">

        {/* ── Carousel 1: Live Near You ───────────────────── */}
        <section className="mb-7">
          <div className="flex items-center justify-between px-5 mb-3">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-1.5">
                Live Near You
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Campaigns you can play right now</p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600">{heroCards.filter(c => c.canPlayNow).length} active</span>
          </div>

          <div
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pl-5 pr-5 pb-2"
            style={{ scrollPaddingLeft: '20px' }}
          >
            {heroCards.map((c, i) => (
              <HeroCampaignCard key={`${c.bizId}-${c.mechType}`} c={c} index={i} />
            ))}
          </div>
        </section>

        {/* ── Carousel 2: Your Loyalty Journey ───────────── */}
        {journeyCards.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center justify-between px-5 mb-3">
              <div>
                <h2 className="text-[15px] font-extrabold text-gray-900">Your Loyalty Journey</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Progress across your favourite spots</p>
              </div>
            </div>

            <div
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pl-5 pr-5 pb-2"
              style={{ scrollPaddingLeft: '20px' }}
            >
              {journeyCards.map((c, i) => (
                <JourneyCard key={`${c.bizId}-${c.mechType}`} c={c} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Browse by Place ─────────────────────────────── */}
        <section className="px-5">
          <h2 className="text-[15px] font-extrabold text-gray-900 mb-3">Browse by Place</h2>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search cafes, salons, gyms…"
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all ${
                focused ? 'border-purple-400 ring-2 ring-purple-100 bg-white' : 'border-gray-100'
              }`}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-5 px-5">
            {CATEGORIES.map(({ key, emoji }) => (
              <motion.button
                key={key}
                onClick={() => setCategory(key)}
                whileTap={{ scale: 0.91 }}
                className={`relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border overflow-hidden transition-colors ${
                  category === key ? 'text-white border-transparent' : 'text-gray-500 bg-white border-gray-200'
                }`}
              >
                {category === key && (
                  <motion.div
                    layoutId="cat-bg"
                    className="absolute inset-0 bg-purple-800 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span>{emoji}</span>
                <span>{key}</span>
              </motion.button>
            ))}
          </div>

          {/* Business list — compact rows */}
          <div className="space-y-2.5 pb-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No businesses found.</div>
            ) : (
              filtered.map((biz, i) => <BusinessCard key={biz.id} biz={biz} index={i} />)
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
