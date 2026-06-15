'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, MapPin, Star } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import type { CustomerBusiness } from '@/lib/types'

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: index * 0.06 }}
    >
      <Link href={`/customer/business/${biz.id}`}>
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.97 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-shadow border border-gray-100/80"
        >
          {/* Cover */}
          <div className="relative h-[180px] overflow-hidden">
            <img src={biz.coverImage} alt={biz.name} className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${biz.coverFrom}99 0%, ${biz.coverTo}EE 100%)` }}
            />
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">{biz.rating.toFixed(1)}</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <div className="flex items-center gap-1 text-white/75 text-[11px] font-medium">
                <MapPin className="w-3 h-3" />
                <span>{biz.location.split(',')[0]}</span>
              </div>
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
              <h3 className="text-sm font-extrabold text-gray-900 truncate flex-1">{biz.name}</h3>
              <span className="text-xs text-gray-400 font-medium shrink-0">{biz.distance}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{biz.tagline}</p>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{biz.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({biz.reviews})</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function DiscoverPage() {
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

      {/* Header — purple gradient matching home */}
      <div
        className="relative px-5 pt-12 pb-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <p className="text-purple-300 text-xs font-medium tracking-wide">Nearby</p>
          <h1 className="text-white text-xl font-extrabold mt-0.5">Discover</h1>
        </motion.div>
      </div>

      {/* White body */}
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
                  layoutId="discover-cat-pill"
                  className="absolute inset-0 bg-purple-800 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span>{emoji}</span>
              <span>{key}</span>
            </motion.button>
          ))}
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-gray-900">
            {category === 'All' ? 'All Businesses' : category}
            <span className="ml-2 text-xs font-semibold text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        {/* List */}
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
