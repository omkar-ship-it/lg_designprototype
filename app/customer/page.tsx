'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Search, Star } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { CustomerBusiness, MechanicType } from '@/lib/types'

const demo        = customers[0]
const firstName   = demo.name.split(' ')[0]
const activeCount = demo.rewards.filter(r => r.status === 'pending').length

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Active campaign summary items ─────────────────────────────
type CampaignItem = {
  bizId: string
  bizName: string
  mechType: MechanicType
  label: string
  metric: string
  subMetric: string
  canPlay: boolean
  from: string
  to: string
  emoji: string
}

function buildActiveCampaigns(): CampaignItem[] {
  const items: CampaignItem[] = []
  for (const biz of customerBusinesses) {
    for (const m of biz.mechanics) {
      if (m.status !== 'active') continue
      const meta = MECHANIC_META[m.type]
      let metric = '', subMetric = ''
      if (m.type === 'stamp' && m.stampsCollected !== undefined && m.totalStamps) {
        metric    = `${m.stampsCollected}/${m.totalStamps} stamps`
        subMetric = m.playedToday ? 'Visited today ✓' : 'Visit to collect'
      } else if (m.type === 'checkin') {
        metric    = `🔥 ${m.checkInStreak ?? 0} day streak`
        subMetric = m.playedToday ? 'Come back tomorrow' : 'Check in today'
      } else if (m.type === 'lottery') {
        metric    = `🎟️ ${m.userTickets ?? 0} tickets`
        subMetric = m.drawDate ? `Draw ${fmtDate(m.drawDate)}` : 'Enter now'
      } else {
        metric    = m.playedToday ? 'Played today ✓' : 'Play now!'
        subMetric = m.playedToday ? 'Come back tomorrow' : `${m.activeToday ?? 0} playing today`
      }
      items.push({
        bizId: biz.id, bizName: biz.name,
        mechType: m.type, label: m.label,
        metric, subMetric, canPlay: !m.playedToday,
        from: meta.cardFrom, to: meta.cardTo, emoji: meta.emoji,
      })
    }
  }
  // Playable today first
  return items.sort((a, b) => (b.canPlay ? 1 : 0) - (a.canPlay ? 1 : 0))
}

const activeCampaigns = buildActiveCampaigns()

// Top loyalty stats
const totalPoints = Math.max(0, ...customerBusinesses.flatMap(b => b.mechanics.map(m => m.totalPoints ?? 0)))
const topStreak   = Math.max(0, ...customerBusinesses.flatMap(b => b.mechanics.map(m => m.checkInStreak ?? 0)))

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

function BusinessCard({ biz, index }: { biz: CustomerBusiness; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.07 }}
    >
      <Link href={`/customer/business/${biz.id}`}>
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.97 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-shadow border border-gray-100/80"
        >
          <div className="relative h-[200px] overflow-hidden">
            <img src={biz.coverImage} alt={biz.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${biz.coverFrom}99 0%, ${biz.coverTo}EE 100%)` }} />
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 shadow">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">{biz.rating.toFixed(1)}</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <span className="text-white/80 text-[11px] font-semibold drop-shadow">{biz.distance}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {biz.mechanics.map(m => (
                  <span key={m.type} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.50)', color: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-gray-900 truncate">{biz.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-1">{biz.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{biz.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({biz.reviews})</span>
              <span className="text-gray-200 mx-0.5">·</span>
              <span className="text-xs text-gray-400 truncate">{biz.location.split(',')[0]}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function CustomerHomePage() {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState<CategoryKey>('All')
  const [focused, setFocused]   = useState(false)

  const filtered = customerBusinesses.filter(b => {
    const matchCat    = category === 'All' || b.category === category
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                        b.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

        {/* Greeting row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-start justify-between mb-4"
        >
          <div>
            <p className="text-purple-300 text-xs font-medium tracking-wide">Welcome back</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5">Hello, {firstName} 👋</h1>
            {/* Points + streak inline */}
            <div className="flex items-center gap-3 mt-2">
              {totalPoints > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-base leading-none">⭐</span>
                  <span className="text-sm font-bold text-white">{totalPoints.toLocaleString()} pts</span>
                </div>
              )}
              {totalPoints > 0 && topStreak > 0 && <span className="text-purple-400 text-xs">·</span>}
              {topStreak > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-base leading-none">🔥</span>
                  <span className="text-sm font-bold text-white">{topStreak} day streak</span>
                </div>
              )}
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm mt-0.5">
            <Bell className="w-5 h-5 text-white" />
            <motion.div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400"
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
          </button>
        </motion.div>

        {/* ── Active campaigns strip ───────────────────────── */}
        {activeCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-purple-300/80 text-[10px] font-semibold uppercase tracking-widest mb-2 relative">
              Your active campaigns
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none relative">
              {activeCampaigns.map((item, i) => (
                <motion.div
                  key={`${item.bizId}-${item.mechType}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                >
                  <Link href={`/customer/business/${item.bizId}/campaign/${item.mechType}`}>
                    <div
                      className="w-[148px] shrink-0 rounded-2xl overflow-hidden"
                      style={{
                        background: `linear-gradient(145deg, ${item.from}CC, ${item.to})`,
                        boxShadow: `0 4px 20px ${item.from}44`,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {/* Card header */}
                      <div className="px-3 pt-3 pb-1 flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-extrabold text-white/90 uppercase tracking-wide truncate">
                            {item.bizName}
                          </p>
                          <p className="text-[9px] text-white/55 truncate">{item.label}</p>
                        </div>
                        <span className="text-lg leading-none ml-1 shrink-0">{item.emoji}</span>
                      </div>
                      {/* Metric */}
                      <div className="px-3 pb-3 pt-1">
                        <p className="text-sm font-extrabold text-white leading-tight">{item.metric}</p>
                        <p className={`text-[10px] mt-0.5 font-semibold ${item.canPlay ? 'text-white/80' : 'text-white/40'}`}>
                          {item.subMetric}
                        </p>
                        {/* Playable indicator */}
                        {item.canPlay && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[9px] font-bold text-green-300">Play today</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Redeem nudge ─────────────────────────────────── */}
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mt-3"
          >
            <Link href="/customer/wallet">
              <div
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                style={{ background: 'rgba(245,197,24,0.13)', border: '1px solid rgba(245,197,24,0.32)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💳</span>
                  <p className="text-sm font-semibold text-yellow-300">
                    {activeCount} reward{activeCount !== 1 ? 's' : ''} ready to redeem
                  </p>
                </div>
                <span className="text-yellow-400 font-bold text-sm">→</span>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      {/* ── White body ───────────────────────────────────────── */}
      <div className="bg-white rounded-t-3xl -mt-3 px-5 pt-5 min-h-screen">

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search cafes, salons, gyms…"
            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all ${
              focused ? 'border-purple-400 ring-2 ring-purple-100 bg-white' : 'border-gray-200'
            }`}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {CATEGORIES.map(({ key, emoji }) => (
            <motion.button
              key={key}
              onClick={() => setCategory(key)}
              whileTap={{ scale: 0.91 }}
              className={`relative shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors overflow-hidden ${
                category === key ? 'text-white border-transparent' : 'text-gray-500 bg-white border-gray-200'
              }`}
            >
              {category === key && (
                <motion.div
                  layoutId="cat-pill"
                  className="absolute inset-0 bg-purple-800 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span>{emoji}</span>
              <span>{key}</span>
            </motion.button>
          ))}
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-gray-900">
            {category === 'All' ? 'All Businesses' : category}
            <span className="ml-2 text-xs font-semibold text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        {/* Business list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No businesses found.</div>
          ) : (
            filtered.map((biz, i) => <BusinessCard key={biz.id} biz={biz} index={i} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
