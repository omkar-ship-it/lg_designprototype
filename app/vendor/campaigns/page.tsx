'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, LayoutList, LayoutGrid, ArrowUpDown,
  Users, Trophy, TrendingUp, MoreVertical, Gift,
  Pause, Copy, StopCircle, Eye, Calendar, Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { campaigns } from '@/lib/mock-data'
import { getMechanicEmoji, getMechanicColor, formatDate } from '@/lib/utils'

import type { CampaignStatus } from '@/lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TODAY = '2026-06-14'
const TODAY_DATE = new Date(TODAY)

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - TODAY_DATE.getTime()) / 86400000)
}


// ── Date-window filter ────────────────────────────────────────────────────────
type DateWindow = 'all' | '7d' | '30d' | '90d' | '1y'
const DATE_WINDOWS: { key: DateWindow; label: string; days: number | null }[] = [
  { key: 'all', label: 'All time',  days: null },
  { key: '7d',  label: '7 Days',    days: 7    },
  { key: '30d', label: 'Month',     days: 30   },
  { key: '90d', label: '3 Months',  days: 90   },
  { key: '1y',  label: 'Year',      days: 365  },
]

function campaignsInWindow(days: number | null) {
  if (days === null) return campaigns
  const windowStart = new Date(TODAY_DATE.getTime() - days * 86400000)
  return campaigns.filter(c =>
    new Date(c.startDate) <= TODAY_DATE && new Date(c.endDate) >= windowStart
  )
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
              { icon: Eye,         label: 'View details', href: `/vendor/campaigns/${id}`,       color: 'text-v-text' },
              { icon: Pause,       label: 'Edit & Pause', href: `/vendor/campaigns/${id}/edit`,  color: 'text-v-text' },
              { icon: Copy,        label: 'Duplicate',    href: '#',                             color: 'text-v-text' },
              { icon: StopCircle,  label: 'End campaign', href: `/vendor/campaigns/${id}/edit`,  color: 'text-v-danger' },
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
  const dl    = c.status === 'active' ? daysLeft(c.endDate) : null
  const urgent = dl !== null && dl <= 3
  const muted  = c.status === 'ended'
  const color  = getMechanicColor(c.mechanic)
  const capPct = c.userCap > 0 ? Math.round((c.currentUsers / c.userCap) * 100) : 0

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
                      ⚠ {dl <= 1 ? 'Last day' : `${dl}d left`}
                    </span>
                  )}
                </div>

                {/* Row 2: date range */}
                <div className="flex items-center gap-1.5 text-xs text-v-text-3 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(c.startDate)} → {formatDate(c.endDate)}
                  {dl !== null && !urgent && <span> · {dl}d left</span>}
                </div>

                {/* Row 3: players / winners / redeems */}
                <div className="flex items-center gap-5 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-v-purple" />
                    <span className="font-bold text-v-purple">{c.currentUsers.toLocaleString()}</span>
                    <span className="text-v-text-3">players</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span className="font-bold text-green-600">{c.rewardsClaimed.toLocaleString()}</span>
                    <span className="text-v-text-3">winners</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-amber-600">{c.redeemedCount.toLocaleString()}</span>
                    <span className="text-v-text-3">redeems</span>
                  </span>
                </div>
              </div>

              {/* Actions + cap progress */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Link href={`/vendor/campaigns/${c.id}`}>
                    <Button variant="secondary" size="sm"><Eye className="w-3.5 h-3.5" /> View</Button>
                  </Link>
                  <Link href={`/vendor/campaigns/${c.id}/edit`}>
                    <Button variant="secondary" size="sm" className="bg-purple-50 text-v-purple border-purple-200 hover:bg-purple-100 shadow-none">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                  <QuickMenu id={c.id} />
                </div>
                <div className="w-40">
                  <p className="text-[11px] text-v-text-3 text-right mb-1">{c.currentUsers.toLocaleString()}/{c.userCap.toLocaleString()} users</p>
                  <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-v-purple rounded-full transition-all duration-500" style={{ width: `${capPct}%` }} />
                  </div>
                  <p className="text-[11px] text-v-text-3 text-right mt-1">{capPct}% cap</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────
function GridCard({ c }: { c: typeof campaigns[0] }) {
  const dl    = c.status === 'active' ? daysLeft(c.endDate) : null
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

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-v-text-3">
            <div className="rounded-2xl bg-v-surface-2 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-v-text-4 mb-2">Status</p>
              <StatusBadge status={c.status} />
            </div>
            <div className="rounded-2xl bg-v-surface-2 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-v-text-4 mb-2">Duration</p>
              <p className="text-sm font-semibold text-v-text">{formatDate(c.startDate)} → {formatDate(c.endDate)}</p>
            </div>
            <div className="rounded-2xl bg-v-surface-2 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-v-text-4 mb-2">Participants</p>
              <p className="text-sm font-semibold text-v-text">{c.currentUsers.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-v-surface-2 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-v-text-4 mb-2">Total Rewards</p>
              <p className="text-sm font-semibold text-v-text">{c.rewardsClaimed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const [filter,      setFilter]      = useState<CampaignStatus | 'all'>('all')
  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState<SortKey>('newest')
  const [view,        setView]        = useState<ViewMode>('list')
  const [dateWindow,  setDateWindow]  = useState<DateWindow>('all')

  // ── Window-scoped metrics ───────────────────────────────────────────────────
  const windowDays = DATE_WINDOWS.find(w => w.key === dateWindow)!.days
  const wCampaigns = campaignsInWindow(windowDays)

  const wPlayers  = wCampaigns.reduce((s, c) => s + c.currentUsers, 0)
  const wRewards  = wCampaigns.reduce((s, c) => s + c.rewardsClaimed, 0)
  const wRedeemed = wCampaigns.reduce((s, c) => s + c.redeemedCount, 0)

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

      {/* ── Date filter ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="inline-flex items-center gap-1 p-1.5 rounded-full bg-v-purple/5 border border-v-purple/10 w-fit mb-5">
        {DATE_WINDOWS.map(w => (
          <button key={w.key} onClick={() => setDateWindow(w.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${dateWindow === w.key ? 'bg-white text-v-text shadow-sm' : 'text-v-purple/50 hover:text-v-purple'}`}>
            {w.label}
          </button>
        ))}
      </motion.div>

      {/* ── Consolidated totals ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

        <Card className="p-5 border border-purple-100 bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-v-purple" />
            </div>
            <span className="text-xs font-semibold text-v-text-2">Total Players</span>
          </div>
          <div className="text-4xl font-black text-v-purple leading-none mb-2">{wPlayers.toLocaleString()}</div>
          <p className="text-xs text-v-text-3">unique players in this window</p>
        </Card>

        <Card className="p-5 border border-green-100 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-v-text-2">Total Winners</span>
          </div>
          <div className="text-4xl font-black text-green-600 leading-none mb-2">{wRewards.toLocaleString()}</div>
          <p className="text-xs text-v-text-3">rewards won</p>
        </Card>

        <Card className="p-5 border border-amber-100 bg-gradient-to-br from-white to-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-v-text-2">Redemptions</span>
          </div>
          <div className="text-4xl font-black text-amber-600 leading-none mb-2">{wRedeemed.toLocaleString()}</div>
          <p className="text-xs text-v-text-3">claimed at the counter</p>
        </Card>

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
