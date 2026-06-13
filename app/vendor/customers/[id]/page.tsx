'use client'
import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Phone, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MechanicBadge } from '@/components/ui/badge'
import { customers } from '@/lib/mock-data'
import { getMechanicEmoji, formatDate, formatRelativeTime } from '@/lib/utils'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const customer = customers.find(c => c.id === id) ?? customers[0]

  return (
    <div className="p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link href="/vendor/customers" className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Customers
        </Link>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-v-purple/20 border border-v-purple/30 flex items-center justify-center text-2xl font-extrabold text-v-purple">
            {customer.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-v-text">{customer.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${customer.status === 'active' ? 'bg-v-success/10 text-v-success' : 'bg-v-text-3/10 text-v-text-3'}`}>
                {customer.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-v-text-3">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />DOB: {formatDate(customer.dob)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Visits', value: customer.totalVisits, icon: '📅', color: '#7C3AED' },
          { label: 'Games Played', value: customer.gamesPlayed, icon: '🎮', color: '#EC4899' },
          { label: 'Rewards Earned', value: customer.rewardsEarned, icon: '🎁', color: '#F5C518' },
          { label: 'Last Visit', value: formatRelativeTime(customer.lastVisit), icon: '⏱️', color: '#06B6D4' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-lg font-bold text-v-text">{s.value}</div>
            <div className="text-xs text-v-text-3">{s.label}</div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rewards wallet */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-4">Rewards</h3>
            {customer.rewards.length === 0 ? (
              <p className="text-sm text-v-text-3 text-center py-6">No rewards yet</p>
            ) : (
              <div className="space-y-2.5">
                {customer.rewards.map(r => (
                  <div key={r.id} className={`p-3 rounded-xl border ${r.status === 'redeemed' ? 'border-v-border opacity-50' : 'border-v-gold/30 bg-v-gold/5'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-v-text">{r.reward}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${r.status === 'redeemed' ? 'bg-v-text-3/20 text-v-text-3' : 'bg-v-success/15 text-v-success'}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-v-text-3">{r.campaignName}</p>
                        <p className="text-[10px] text-v-text-3 font-mono mt-0.5">{r.code}</p>
                      </div>
                      <MechanicBadge mechanic={r.mechanic} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Game history */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-v-text mb-4">Game History</h3>
            {customer.gameHistory.length === 0 ? (
              <p className="text-sm text-v-text-3 text-center py-6">No games played yet</p>
            ) : (
              <div className="space-y-2.5">
                {customer.gameHistory.map(g => (
                  <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-v-surface-2 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-v-surface-3 flex items-center justify-center text-lg shrink-0">
                      {getMechanicEmoji(g.mechanic)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-v-text truncate">{g.campaignName}</p>
                      <p className="text-xs text-v-text-3">{formatRelativeTime(g.playedAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {g.won ? (
                        <div className="text-xs font-semibold text-v-success">Won</div>
                      ) : (
                        <div className="text-xs text-v-text-3">No win</div>
                      )}
                      {g.reward && <div className="text-[10px] text-v-gold">{g.reward}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
