'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { customers } from '@/lib/mock-data'
import { formatRelativeTime, getMechanicEmoji } from '@/lib/utils'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Customers</h1>
          <p className="text-v-text-2 text-sm mt-1">{customers.length} registered · {customers.filter(c => c.status === 'active').length} active</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: customers.length, icon: '👥', color: '#7C3AED' },
          { label: 'Games Played', value: customers.reduce((s, c) => s + c.gamesPlayed, 0), icon: '🎮', color: '#EC4899' },
          { label: 'Rewards Earned', value: customers.reduce((s, c) => s + c.rewardsEarned, 0), icon: '🎁', color: '#F5C518' },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-v-text">{s.value}</div>
              <div className="text-xs text-v-text-3">{s.label}</div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-v-text-3" />
        <input type="text" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-v-surface border border-v-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple transition-all max-w-sm" />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={`/vendor/customers/${c.id}`}>
              <Card hover className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-v-purple/20 border border-v-purple/30 flex items-center justify-center text-base font-extrabold text-v-purple shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-v-text">{c.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.status === 'active' ? 'bg-v-success/10 text-v-success' : 'bg-v-text-3/10 text-v-text-3'}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-v-text-3 mt-0.5">{c.phone} · Joined {formatRelativeTime(c.joinedAt)}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-right shrink-0">
                    <div>
                      <div className="text-sm font-bold text-v-text">{c.totalVisits}</div>
                      <div className="text-[10px] text-v-text-3">Visits</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-v-text">{c.gamesPlayed}</div>
                      <div className="text-[10px] text-v-text-3">Games</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-v-gold">{c.rewardsEarned}</div>
                      <div className="text-[10px] text-v-text-3">Rewards</div>
                    </div>
                    <div className="text-xs text-v-text-3">{formatRelativeTime(c.lastVisit)}</div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
