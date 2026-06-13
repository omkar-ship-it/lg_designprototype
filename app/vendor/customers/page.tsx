'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Crown, TrendingUp, Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { customers } from '@/lib/mock-data'
import { formatRelativeTime } from '@/lib/utils'
import type { Customer } from '@/lib/types'

// ── Segment logic ─────────────────────────────────────────────────────────────
const TODAY_DATE = new Date('2026-06-13')
function daysSince(iso: string) {
  return Math.floor((TODAY_DATE.getTime() - new Date(iso).getTime()) / 86400000)
}

type Segment = 'loyalist' | 'regular' | 'at-risk' | 'inactive'

function getSegment(c: Customer): Segment {
  const days  = daysSince(c.lastVisit)
  const visits = c.totalVisits
  if (days > 45)  return 'inactive'
  if (days > 14)  return 'at-risk'
  if (visits >= 15) return 'loyalist'
  return 'regular'
}

const SEGMENTS: { key: Segment | 'all'; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  { key: 'all',      label: 'All',      icon: <Users className="w-3.5 h-3.5" />,     color: '#6B68A8', bg: 'bg-v-surface-2',   border: 'border-v-border' },
  { key: 'loyalist', label: 'Loyalists', icon: <Crown className="w-3.5 h-3.5" />,     color: '#B45309', bg: 'bg-amber-50',       border: 'border-amber-200' },
  { key: 'regular',  label: 'Regulars',  icon: <TrendingUp className="w-3.5 h-3.5" />, color: '#1D4ED8', bg: 'bg-blue-50',        border: 'border-blue-200' },
  { key: 'at-risk',  label: 'At-Risk',   icon: <Clock className="w-3.5 h-3.5" />,      color: '#C2410C', bg: 'bg-orange-50',      border: 'border-orange-200' },
  { key: 'inactive', label: 'Inactive',  icon: null,                                    color: '#6B7280', bg: 'bg-gray-50',        border: 'border-gray-200' },
]

const BADGE: Record<Segment, { label: string; className: string }> = {
  loyalist: { label: 'Loyalist', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  regular:  { label: 'Regular',  className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  'at-risk':{ label: 'At-Risk',  className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

// ── Visit-window filter ───────────────────────────────────────────────────────
type VisitWindow = 'all' | '7d' | '30d' | '3m' | '1y'

const VISIT_WINDOWS: { key: VisitWindow; label: string; days: number | null }[] = [
  { key: 'all', label: 'All time',  days: null },
  { key: '7d',  label: '7 Days',    days: 7    },
  { key: '30d', label: 'Month',     days: 30   },
  { key: '3m',  label: '3 Months',  days: 90   },
  { key: '1y',  label: 'Year',      days: 365  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [search,      setSearch]      = useState('')
  const [segment,     setSegment]     = useState<Segment | 'all'>('all')
  const [visitWindow, setVisitWindow] = useState<VisitWindow>('all')

  const withSegments = customers.map(c => ({ ...c, segment: getSegment(c) }))

  // Segment counts are always based on full data (not affected by visit window)
  const counts: Record<Segment | 'all', number> = {
    all:      withSegments.length,
    loyalist: withSegments.filter(c => c.segment === 'loyalist').length,
    regular:  withSegments.filter(c => c.segment === 'regular').length,
    'at-risk':withSegments.filter(c => c.segment === 'at-risk').length,
    inactive: withSegments.filter(c => c.segment === 'inactive').length,
  }

  const windowDays = VISIT_WINDOWS.find(w => w.key === visitWindow)?.days ?? null

  const filtered = withSegments.filter(c => {
    const matchSeg    = segment === 'all' || c.segment === segment
    const q           = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
    const matchVisit  = windowDays === null || daysSince(c.lastVisit) <= windowDays
    return matchSeg && matchSearch && matchVisit
  })

  const isFiltered = segment !== 'all' || visitWindow !== 'all' || search.length > 0

  const winRate = (c: Customer) =>
    c.gamesPlayed > 0 ? Math.round((c.rewardsEarned / c.gamesPlayed) * 100) : 0

  return (
    <div className="p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-extrabold text-v-text">Customers</h1>
        <p className="text-v-text-2 text-sm mt-1">
          {isFiltered ? `${filtered.length} of ${customers.length}` : customers.length} registered
        </p>
      </motion.div>

      {/* Segment filter tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2 mb-6">
        {SEGMENTS.map(seg => {
          const active = segment === seg.key
          return (
            <button
              key={seg.key}
              onClick={() => setSegment(seg.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                active
                  ? `${seg.bg} ${seg.border} border-2`
                  : 'bg-white border-v-border text-v-text-3 hover:border-v-border-b hover:text-v-text-2'
              }`}
              style={active ? { color: seg.color } : {}}
            >
              {seg.icon}
              {seg.label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? '' : 'bg-v-surface-2 text-v-text-3'}`}
                style={active ? { background: `${seg.color}18`, color: seg.color } : {}}>
                {counts[seg.key]}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Search + visit filter on one row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-v-surface border border-v-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all"
          />
        </div>

        {/* Visit-window filter */}
        <div className="flex items-center gap-1 bg-v-surface-2 border border-v-border rounded-xl p-1 shrink-0">
          <span className="text-[10px] text-v-text-3 font-semibold px-2 hidden sm:block">Visited in</span>
          {VISIT_WINDOWS.map(w => (
            <button key={w.key} onClick={() => setVisitWindow(w.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${visitWindow === w.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
              {w.label}
            </button>
          ))}
        </div>

        {/* Clear all filters */}
        {isFiltered && (
          <button onClick={() => { setSegment('all'); setVisitWindow('all'); setSearch('') }}
            className="text-xs text-v-purple font-semibold hover:underline shrink-0">
            Clear filters
          </button>
        )}
      </motion.div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-semibold text-v-text-2">No customers match</p>
            <p className="text-xs text-v-text-3 mt-1">Try a different segment or visit window</p>
            {isFiltered && (
              <button onClick={() => { setSegment('all'); setVisitWindow('all'); setSearch('') }}
                className="mt-3 text-xs text-v-purple font-semibold hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        )}
        {filtered.map((c, i) => {
          const badge = BADGE[c.segment]
          const days  = daysSince(c.lastVisit)
          const rate  = winRate(c)
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/vendor/customers/${c.id}`}>
                <Card hover className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-v-purple/20 border border-v-purple/30 flex items-center justify-center text-base font-extrabold text-v-purple shrink-0">
                      {c.name[0]}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-v-text">{c.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-v-text-3 mt-0.5">{c.phone} · Joined {formatRelativeTime(c.joinedAt)}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-7 text-right shrink-0">
                      <div>
                        <div className="text-sm font-bold text-v-text">{c.totalVisits}</div>
                        <div className="text-[10px] text-v-text-3">Visits</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-v-text">{c.gamesPlayed}</div>
                        <div className="text-[10px] text-v-text-3">Games</div>
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${rate >= 50 ? 'text-v-success' : rate > 0 ? 'text-v-gold' : 'text-v-text-3'}`}>{rate}%</div>
                        <div className="text-[10px] text-v-text-3">Win rate</div>
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${days > 45 ? 'text-gray-400' : days > 14 ? 'text-orange-500' : 'text-v-text'}`}>
                          {days === 0 ? 'Today' : `${days}d ago`}
                        </div>
                        <div className="text-[10px] text-v-text-3">Last visit</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
