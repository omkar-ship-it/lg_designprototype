'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, ProgressBar } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { campaigns } from '@/lib/mock-data'
import { getMechanicEmoji, formatDate, capPercent } from '@/lib/utils'
import type { CampaignStatus } from '@/lib/types'

const FILTERS: { label: string; value: CampaignStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Ended', value: 'ended' },
]

export default function CampaignsPage() {
  const [filter, setFilter] = useState<CampaignStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = campaigns.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Campaigns</h1>
          <p className="text-v-text-2 text-sm mt-1">{campaigns.length} total · {campaigns.filter(c => c.status === 'active').length} running</p>
        </div>
        <Link href="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
          <input
            type="text"
            placeholder="Search campaigns…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-v-surface border border-v-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-v-surface border border-v-border rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f.value ? 'bg-v-purple text-white' : 'text-v-text-2 hover:text-v-text'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/vendor/campaigns/${c.id}`}>
                <Card hover className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-v-surface-3 flex items-center justify-center text-2xl shrink-0">
                      {getMechanicEmoji(c.mechanic)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-v-text">{c.name}</span>
                        <StatusBadge status={c.status} />
                        <MechanicBadge mechanic={c.mechanic} />
                      </div>
                      <div className="text-xs text-v-text-3">
                        {formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-right shrink-0">
                      <div>
                        <div className="text-sm font-bold text-v-text">{c.participations}</div>
                        <div className="text-[10px] text-v-text-3">Players</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-v-gold">{c.rewardsClaimed}</div>
                        <div className="text-[10px] text-v-text-3">Rewards</div>
                      </div>
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] text-v-text-3 mb-1">
                          <span>Cap</span>
                          <span>{capPercent(c.currentUsers, c.userCap)}%</span>
                        </div>
                        <ProgressBar value={c.currentUsers} max={c.userCap} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-v-text-3">
            <div className="text-4xl mb-3">🔍</div>
            <p>No campaigns match your filters</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
