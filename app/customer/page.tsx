'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Search, Star } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, customerBusinesses } from '@/lib/mock-data'
import type { CustomerBusiness } from '@/lib/types'

const demo = customers[0]
const firstName = demo.name.split(' ')[0]
const activeCount   = demo.rewards.filter(r => r.status === 'pending').length
const redeemedCount = demo.rewards.filter(r => r.status === 'redeemed').length
const stampCount    = demo.rewards.filter(r => r.mechanic === 'stamp').length
const cardCount     = demo.rewards.filter(r => r.mechanic === 'spin' || r.mechanic === 'shake').length
const mysteryCount  = demo.rewards.filter(r => r.mechanic === 'dice').length
const spinCount     = demo.rewards.filter(r => r.mechanic === 'spin').length
const lotteryCount  = demo.rewards.filter(r => r.mechanic === 'lottery').length

const REWARD_ICONS = [
  { emoji: '🧾', label: 'Stamps',  count: stampCount },
  { emoji: '🎴', label: 'Cards',   count: cardCount },
  { emoji: '📦', label: 'Mystery', count: mysteryCount },
  { emoji: '🎡', label: 'Spins',   count: spinCount },
  { emoji: '🎟️', label: 'Lottery', count: lotteryCount },
]

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
          {/* Cover — real photo + brand gradient overlay */}
          <div className="relative h-[200px] overflow-hidden">
            <img
              src={biz.coverImage}
              alt={biz.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${biz.coverFrom}99 0%, ${biz.coverTo}EE 100%)` }}
            />

            {/* Rating */}
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 shadow">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">{biz.rating.toFixed(1)}</span>
            </div>

            {/* Bottom row: distance left, mechanic pills right */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <span className="text-white/80 text-[11px] font-semibold drop-shadow">{biz.distance}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {biz.mechanics.map(m => (
                  <span
                    key={m.type}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.50)', color: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
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
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />

        {/* Top row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-between mb-5"
        >
          <div>
            <p className="text-purple-300 text-xs font-medium tracking-wide">Welcome back</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5">Hello, {firstName} 👋</h1>
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

        {/* Rewards wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative rounded-2xl p-4 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide">Your Wallet</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-white font-bold">{activeCount} <span className="text-purple-300 font-normal">active</span></span>
              <span className="text-purple-400">·</span>
              <span className="text-white font-bold">{redeemedCount} <span className="text-purple-300 font-normal">redeemed</span></span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {REWARD_ICONS.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 + i * 0.06 }}
                className="flex flex-col items-center gap-0.5"
              >
                <motion.span
                  className="text-[22px] leading-none"
                  animate={r.count > 0 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                >
                  {r.emoji}
                </motion.span>
                <span className="text-sm font-extrabold text-white leading-none mt-1">{r.count}</span>
                <span className="text-[9px] text-purple-300/80 leading-none">{r.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
