'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Star } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { CustomerBusiness } from '@/lib/types'

const demo = customers[0]
const firstName = demo.name.split(' ')[0]
const activeCount = demo.rewards.filter(r => r.status === 'pending').length
const redeemedCount = demo.rewards.filter(r => r.status === 'redeemed').length

const stampCount   = demo.rewards.filter(r => r.mechanic === 'stamp').length
const cardCount    = demo.rewards.filter(r => r.mechanic === 'spin' || r.mechanic === 'shake').length
const mysteryCount = demo.rewards.filter(r => r.mechanic === 'dice').length
const spinCount    = demo.rewards.filter(r => r.mechanic === 'spin').length
const lotteryCount = demo.rewards.filter(r => r.mechanic === 'lottery').length

const REWARD_ICONS = [
  { emoji: '🧾', label: 'Stamps',   count: stampCount },
  { emoji: '🎴', label: 'Cards',    count: cardCount },
  { emoji: '📦', label: 'Mystery',  count: mysteryCount },
  { emoji: '🎡', label: 'Spins',    count: spinCount },
  { emoji: '🎟️', label: 'Lottery', count: lotteryCount },
]

const CATEGORIES = ['All', 'Cafe', 'Salon', 'Gym', 'Restaurant', 'Jewellery'] as const
type Category = typeof CATEGORIES[number]

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </span>
  )
}

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
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/60 transition-shadow"
        >
          {/* Cover area */}
          <div
            className="relative h-[180px] flex items-end p-3"
            style={{ background: `linear-gradient(135deg, ${biz.coverFrom}, ${biz.coverTo})` }}
          >
            {/* Floating emoji */}
            <motion.span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-25 select-none pointer-events-none"
              animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {biz.coverEmoji}
            </motion.span>
            {/* Rating badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-800">{biz.rating.toFixed(1)}</span>
            </div>
            {/* Mechanic pills */}
            <div className="flex flex-wrap gap-1 z-10 relative">
              {biz.mechanics.map(m => {
                const meta = MECHANIC_META[m.type]
                return (
                  <span key={m.type} className="text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm"
                    style={{ background: 'rgba(0,0,0,0.45)', color: 'white' }}>
                    {m.label}
                  </span>
                )
              })}
            </div>
          </div>
          {/* Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{biz.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{biz.tagline}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 mt-1">{biz.distance}</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <StarRating rating={biz.rating} />
              <span className="text-xs text-gray-400">({biz.reviews})</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-400">{biz.location.split(',')[0]}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function CustomerHomePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [focused, setFocused] = useState(false)

  const filtered = customerBusinesses.filter(b => {
    const matchCat = category === 'All' || b.category === category
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Purple header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #4C1D95, #5B21B6)' }}
      >
        {/* Top row */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <p className="text-purple-300 text-xs font-medium">Welcome Back</p>
            <h1 className="text-white text-xl font-extrabold">Hello, {firstName} 👋</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
            <motion.div
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </button>
        </motion.div>

        {/* Rewards summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 rounded-2xl p-4 mb-4"
        >
          <p className="text-purple-200 text-xs mb-1">Your Rewards</p>
          <p className="text-white font-semibold text-sm">
            {activeCount} active · {redeemedCount} redeemed
          </p>
          {/* Icon row */}
          <div className="flex items-center gap-4 mt-3">
            {REWARD_ICONS.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="flex flex-col items-center gap-0.5"
              >
                <motion.span
                  className="text-xl"
                  animate={r.count > 0 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                >
                  {r.emoji}
                </motion.span>
                <span className="text-sm font-bold text-white">{r.count}</span>
                <span className="text-[9px] text-purple-300">{r.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* White body */}
      <div className="px-5 pt-4">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search cafes, salons, gyms…"
            className={`w-full pl-9 pr-4 py-3 rounded-xl bg-gray-50 border text-sm text-gray-800 placeholder-gray-400 outline-none transition-all ${
              focused
                ? 'border-purple-400 ring-2 ring-purple-100'
                : 'border-gray-200'
            }`}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setCategory(cat)}
              whileTap={{ scale: 0.93 }}
              className={`relative shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors overflow-hidden ${
                category === cat ? 'text-white border-purple-800' : 'text-gray-500 bg-white border-gray-200'
              }`}
            >
              {category === cat && (
                <motion.div
                  layoutId="cat-pill"
                  className="absolute inset-0 bg-purple-800 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {cat}
            </motion.button>
          ))}
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
