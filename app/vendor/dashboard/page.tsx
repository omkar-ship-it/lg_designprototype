'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { StatCard, Card, ProgressBar } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { campaigns, redemptionQueue } from '@/lib/mock-data'
import { getMechanicEmoji, formatRelativeTime, capPercent } from '@/lib/utils'
import { LivePIN } from '@/components/vendor/live-pin'
import { RedemptionQueue } from '@/components/vendor/redemption-queue'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
}

export default function DashboardPage() {
  const active = campaigns.filter(c => c.status === 'active')
  const totalParticipations = campaigns.reduce((s, c) => s + c.participations, 0)
  const totalRewards = campaigns.reduce((s, c) => s + c.rewardsClaimed, 0)

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Good morning, Brew & Bite ☕</h1>
          <p className="text-v-text-2 text-sm mt-1">Friday, 13 June 2026 · {active.length} campaigns running</p>
        </div>
        <Button variant="primary" size="md" className="gap-2">
          <Link href="/vendor/campaigns/create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Campaigns', value: active.length, icon: '🚀', color: '#7C3AED', trend: { value: '2 new', up: true } },
          { label: 'Total Players Today', value: totalParticipations, icon: '🎮', color: '#EC4899', trend: { value: '+23%', up: true } },
          { label: 'Rewards Claimed', value: totalRewards, icon: '🎁', color: '#F5C518', trend: { value: '+18%', up: true } },
          { label: 'Pending Redemptions', value: redemptionQueue.length, icon: '⏳', color: '#F59E0B', sub: 'Waiting for staff action' },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" animate="show">
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Campaigns */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-v-text">Active Campaigns</h2>
            <Link href="/vendor/campaigns" className="text-xs text-v-purple hover:text-v-purple-l flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {active.map((c, i) => (
              <motion.div key={c.id} custom={i + 4} variants={fadeUp} initial="hidden" animate="show">
                <Link href={`/vendor/campaigns/${c.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-v-surface-3 flex items-center justify-center text-2xl shrink-0">
                        {getMechanicEmoji(c.mechanic)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-v-text truncate">{c.name}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-v-text-3 mb-3">
                          <MechanicBadge mechanic={c.mechanic} />
                          <span>{c.participations} players</span>
                          <span>{c.rewardsClaimed} rewards</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProgressBar value={c.currentUsers} max={c.userCap} />
                          <span className="text-xs text-v-text-3 shrink-0">
                            {capPercent(c.currentUsers, c.userCap)}% cap
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <LivePIN campaign={c} compact />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Redemption queue */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <RedemptionQueue />
        </motion.div>
      </div>
    </div>
  )
}
