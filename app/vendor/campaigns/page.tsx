'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, LayoutList, LayoutGrid, ArrowUpDown,
  CalendarDays, Users, Trophy, TrendingUp, MoreVertical,
  Pause, Copy, StopCircle, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { campaigns } from '@/lib/mock-data'
import { getMechanicEmoji, getMechanicColor, formatDate, capPercent } from '@/lib/utils'
import type { CampaignStatus } from '@/lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TODAY = '2026-06-13'

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - new Date(TODAY).getTime()) / 86400000)
}
function winRate(c: typeof campaigns[0]) {
  return c.participations > 0 ? Math.round((c.rewardsClaimed / c.participations) * 100) : 0
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTERS: { label: string; value: CampaignStatus | 'all' }[] = [
  { label: 'All',    value: 'all'    },
  { label: 'Active', value: 'active' },
  { label: 'Draft',  value: 'draft'  },
  { label: 'Paused', value: 'paused' },
  { label: 'Ended',  value: 'ended'  },
]

const SORTS = [
  { label: 'Newest first',  value: 'newest'  },
  { label: 'Ending soon',   value: 'ending'  },
  { label: 'Most active',   value: 'popular' },
]

type SortKey = 'newest' | 'ending' | 'popular'
type ViewMode = 'list' | 'grid'

const STATUS_BORDER: Record<CampaignStatus, string> = {
  active: 'border-l-[3px] border-l-emerald-500',
  draft:  'border-l-[3px] border-l-amber-400',
  ended:  'border-l-[3px] border-l-v-border',
  paused: 'border-l-[3px] border-l-orange-400',
}

// ── Aggregate stats ───────────────────────────────────────────────────────────
const totalPlayers  = campaigns.reduce((s, c) => s + c.participations, 0)
const totalRewards  = campaigns.reduce((s, c) => s + c.rewardsClaimed, 0)
const avgWinRate    = Math.round(campaigns.filter(c => c.participations > 0).reduce((s, c) => s + winRate(c), 0) / campaigns.filter(c => c.participations > 0).length)
const activeCampaigns = campaigns.filter(c => c.status === 'active').length

// ── Quick actions menu ────────────────────────────────────────────────────────
function QuickMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={e => { e.preventDefault(); setOpen(p => !p) }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-v-text-3 hover:text-v-text hover:bg-v-surface-2 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-20 w-40 bg-white border border-v-border rounded-xl shadow-lg py-1 overflow-hidden"
            onMouseLeave={() => setOpen(false)}
          >
            {[
              { icon: Eye,         label: 'View details', href: `/vendor/campaigns/${id}`, color: 'text-v-text' },
              { icon: Pause,       label: 'Pause',        href: '#', color: 'text-v-text' },
              { icon: Copy,        label: 'Duplicate',    href: '#', color: 'text-v-text' },
              { icon: StopCircle,  label: 'End campaign', href: '#', color: 'text-v-danger' },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link key={label} href={href}
                onClick={e => { if (href === '#') e.preventDefault(); setOpen(false) }}
                className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium hover:bg-v-surface-2 transition-colors ${color}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── List card ─────────────────────────────────────────────────────────────────
function ListCard({ c }: { c: typeof campaigns[0] }) {
  const wr    = winRate(c)
  const dl    = c.status === 'active' ? daysLeft(c.endDate) : null
  const urgent = dl !== null && dl <= 3
  const muted  = c.status === 'ended'
  const color  = getMechanicColor(c.mechanic)

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <div className={`vendor-card vendor-card-hover overflow-hidden ${muted ? 'opacity-60' : ''}`}>
        <div className="flex items-stretch">
          {/* Status stripe */}
          <div className={`w-1 shrink-0 ${STATUS_BORDER[c.status].replace('border-l-[3px] border-l-', 'bg-')}`}
            style={{ background: c.status === 'active' ? '#16A34A' : c.status === 'draft' ? '#F59E0B' : c.status === 'paused' ? '#F97316' : '#C4B8FF' }} />

          <div className="flex-1 px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Mechanic icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 mt-0.5"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                {getMechanicEmoji(c.mechanic)}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                {/* Row 1: name + badges */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Link href={`/vendor/campaigns/${c.id}`} className="text-sm font-bold text-v-text hover:text-v-purple transition-colors">
                    {c.name}
                  </Link>
                  <StatusBadge status={c.status} />
                  <MechanicBadge mechanic={c.mechanic} />
                  {urgent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-v-danger border border-red-200">
                      ⚠ {dl}d left
                    </span>
                  )}
                </div>

                {/* Row 2: dates */}
                <div className="flex items-center gap-1.5 text-xs text-v-text-3 mb-3">
                  <CalendarDays className="w-3 h-3" />
                  <span>{formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
                  {dl !== null && dl > 3 && (
                    <span className="text-v-text-2 font-medium">· {dl} days left</span>
                  )}
                </div>

                {/* Row 3: stats */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-v-text-3" />
                    <span className="text-sm font-bold text-v-text">{c.participations.toLocaleString()}</span>
                    <span className="text-[10px] text-v-text-3">players</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-bold text-v-text">{c.rewardsClaimed.toLocaleString()}</span>
                    <span className="text-[10px] text-v-text-3">rewards</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-v-purple" />
                    <span className="text-sm font-bold text-v-text">{wr}%</span>
                    <span className="text-[10px] text-v-text-3">win rate</span>
                  </div>
                  {/* Cap bar */}
                  <div className="flex items-center gap-2 ml-auto hidden sm:flex">
                    <div className="text-right">
                      <div className="text-[10px] text-v-text-3 mb-1">
                        {c.currentUsers.toLocaleString()} / {c.userCap.toLocaleString()} users
                      </div>
                      <div className="w-28">
                        <ProgressBar
                          value={c.currentUsers}
                          max={c.userCap}
                          color={capPercent(c.currentUsers, c.userCap) > 85 ? '#DC2626' : capPercent(c.currentUsers, c.userCap) > 60 ? '#D97706' : '#7C3AED'}
                        />
                      </div>
                      <div className="text-[10px] text-v-text-3 mt-0.5 text-right">{capPercent(c.currentUsers, c.userCap)}% cap</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <QuickMenu id={c.id} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────
function GridCard({ c }: { c: typeof campaigns[0] }) {
  const wr    = winRate(c)
  const dl    = c.status === 'active' ? daysLeft(c.endDate) : null
  const urgent = dl !== null && dl <= 3
  const muted  = c.status === 'ended'
  const color  = getMechanicColor(c.mechanic)

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <div className={`vendor-card vendor-card-hover overflow-hidden h-full flex flex-col ${muted ? 'opacity-60' : ''}`}>
        {/* Status stripe top */}
        <div className="h-1 w-full"
          style={{ background: c.status === 'active' ? '#16A34A' : c.status === 'draft' ? '#F59E0B' : c.status === 'paused' ? '#F97316' : '#C4B8FF' }} />

        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
              {getMechanicEmoji(c.mechanic)}
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={c.status} />
              <QuickMenu id={c.id} />
            </div>
          </div>

          {/* Name + mechanic */}
          <div>
            <Link href={`/vendor/campaigns/${c.id}`} className="text-sm font-bold text-v-text hover:text-v-purple transition-colors leading-snug block">
              {c.name}
            </Link>
            <div className="mt-1">
              <MechanicBadge mechanic={c.mechanic} />
            </div>
          </div>

          {/* Date + urgency */}
          <div className="flex items-center gap-1.5 text-xs text-v-text-3">
            <CalendarDays className="w-3 h-3 shrink-0" />
            <span className="truncate">{formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
          </div>

          {dl !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold self-start ${urgent ? 'bg-red-50 text-v-danger border border-red-200' : 'bg-v-surface-3 text-v-text-2 border border-v-border'}`}>
              {urgent ? '⚠' : '⏱'} {dl} days left
            </span>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            {[
              { label: 'Players',   value: c.participations, icon: '👥' },
              { label: 'Rewards',   value: c.rewardsClaimed, icon: '🎁' },
              { label: 'Win rate',  value: `${wr}%`,         icon: '🎯' },
            ].map(s => (
              <div key={s.label} className="bg-v-surface-2 border border-v-border rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-v-text">{s.value}</div>
                <div className="text-[9px] text-v-text-3 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cap bar */}
          <div>
            <div className="flex justify-between text-[10px] text-v-text-3 mb-1">
              <span>{c.currentUsers.toLocaleString()} / {c.userCap.toLocaleString()} users</span>
              <span>{capPercent(c.currentUsers, c.userCap)}%</span>
            </div>
            <ProgressBar
              value={c.currentUsers}
              max={c.userCap}
              color={capPercent(c.currentUsers, c.userCap) > 85 ? '#DC2626' : capPercent(c.currentUsers, c.userCap) > 60 ? '#D97706' : '#7C3AED'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const [filter, setFilter] = useState<CampaignStatus | 'all'>('all')
  const [search, setSearch]   = useState('')
  const [sort,   setSort]     = useState<SortKey>('newest')
  const [view,   setView]     = useState<ViewMode>('list')

  const filtered = campaigns
    .filter(c => (filter === 'all' || c.status === filter) && c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'ending')  return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      if (sort === 'popular') return b.participations - a.participations
      return 0
    })

  return (
    <div className="p-8 max-w-6xl">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Campaigns</h1>
          <p className="text-v-text-2 text-sm mt-0.5">{campaigns.length} total · {activeCampaigns} running now</p>
        </div>
        <Link href="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </motion.div>

      {/* ── Aggregate stats ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: '🚀', label: 'Active Now',     value: activeCampaigns, color: '#16A34A' },
          { icon: '👥', label: 'Total Players',  value: totalPlayers.toLocaleString(), color: '#7C3AED' },
          { icon: '🎁', label: 'Rewards Given',  value: totalRewards.toLocaleString(), color: '#D97706' },
          { icon: '🎯', label: 'Avg Win Rate',   value: `${avgWinRate}%`, color: '#EC4899' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}>
            <div className="vendor-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                {s.icon}
              </div>
              <div>
                <div className="text-lg font-bold text-v-text leading-none">{s.value}</div>
                <div className="text-[11px] text-v-text-3 mt-0.5">{s.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Controls row ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex items-center gap-3 mb-5 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
          <input type="text" placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-v-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all" />
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-v-text-3 pointer-events-none" />
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="pl-8 pr-8 py-2.5 bg-white border border-v-border rounded-xl text-sm text-v-text focus:outline-none focus:border-v-purple appearance-none cursor-pointer transition-all">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 bg-v-surface-2 border border-v-border rounded-xl p-1">
          {FILTERS.map(f => {
            const count = f.value === 'all' ? campaigns.length : campaigns.filter(c => c.status === f.value).length
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filter === f.value ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
                {f.label}
                {count > 0 && (
                  <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${filter === f.value ? 'bg-v-purple text-white' : 'bg-v-border text-v-text-3'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-v-surface-2 border border-v-border rounded-xl p-1">
          {([['list', LayoutList], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === v ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-3 hover:text-v-text-2'}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Campaign list / grid ── */}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-sm font-semibold text-v-text-2">No campaigns match</p>
              <p className="text-xs text-v-text-3 mt-1">Try adjusting your search or filter</p>
              {filter !== 'all' && (
                <button onClick={() => { setFilter('all'); setSearch('') }} className="mt-4 text-xs text-v-purple font-semibold hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : view === 'list' ? (
            <div className="space-y-2">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ListCard c={c} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GridCard c={c} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
