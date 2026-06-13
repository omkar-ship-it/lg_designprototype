'use client'
import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Trophy, TrendingUp, Calendar } from 'lucide-react'
import { Card, StatCard, ProgressBar } from '@/components/ui/card'
import { MechanicBadge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LivePIN } from '@/components/vendor/live-pin'
import { RedemptionQueue } from '@/components/vendor/redemption-queue'
import { campaigns, customers } from '@/lib/mock-data'
import { getMechanicEmoji, formatDate, formatRelativeTime, capPercent } from '@/lib/utils'

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const campaign = campaigns.find(c => c.id === id) ?? campaigns[0]
  const campaignCustomers = customers.filter(c =>
    c.gameHistory.some(g => g.campaignId === campaign.id)
  )
  const redemptionRate = campaign.participations
    ? Math.round((campaign.rewardsClaimed / campaign.participations) * 100)
    : 0

  return (
    <div className="p-8 max-w-7xl">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link href="/vendor/campaigns" className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Campaigns
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-v-surface-3 flex items-center justify-center text-3xl">
              {getMechanicEmoji(campaign.mechanic)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-v-text">{campaign.name}</h1>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="flex items-center gap-2">
                <MechanicBadge mechanic={campaign.mechanic} />
                <span className="text-xs text-v-text-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                </span>
              </div>
            </div>
          </div>
          {campaign.status === 'active' && (
            <Button variant="danger" size="sm">Pause Campaign</Button>
          )}
          {campaign.status === 'draft' && (
            <Button variant="gold" size="sm">Launch Campaign</Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Players" value={campaign.participations} icon="🎮" color="#7C3AED" />
              <StatCard label="Rewards Given" value={campaign.rewardsClaimed} icon="🎁" color="#F5C518" />
              <StatCard label="Redemption Rate" value={`${redemptionRate}%`} icon="✅" color="#22C55E" />
              <StatCard label="Cap Used" value={`${capPercent(campaign.currentUsers, campaign.userCap)}%`} icon="📊" color="#EC4899" sub={`${campaign.currentUsers} / ${campaign.userCap}`} />
            </div>
          </motion.div>

          {/* Cap progress */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-v-text">User Cap Progress</h3>
                <span className="text-xs text-v-text-3">{campaign.currentUsers} / {campaign.userCap} users</span>
              </div>
              <ProgressBar value={campaign.currentUsers} max={campaign.userCap} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-v-text-3">
                <span>{campaign.userCap - campaign.currentUsers} spots remaining</span>
                <span>{capPercent(campaign.currentUsers, campaign.userCap)}% full</span>
              </div>
            </Card>
          </motion.div>

          {/* Participants */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5">
              <h3 className="text-sm font-bold text-v-text mb-4">Recent Participants</h3>
              {campaignCustomers.length === 0 ? (
                <p className="text-sm text-v-text-3 text-center py-6">No participants yet</p>
              ) : (
                <div className="space-y-2">
                  {campaignCustomers.map(c => {
                    const gameEntry = c.gameHistory.find(g => g.campaignId === campaign.id)
                    return (
                      <Link href={`/vendor/customers/${c.id}`} key={c.id}>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-v-surface-2 transition-colors cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-v-purple/20 flex items-center justify-center text-sm font-bold text-v-purple">
                            {c.name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-v-text">{c.name}</div>
                            <div className="text-xs text-v-text-3">{c.phone}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-semibold ${gameEntry?.won ? 'text-v-success' : 'text-v-text-3'}`}>
                              {gameEntry?.won ? `Won: ${gameEntry.reward}` : 'No win'}
                            </div>
                            <div className="text-[10px] text-v-text-3">{gameEntry ? formatRelativeTime(gameEntry.playedAt) : ''}</div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right col — PIN + Queue */}
        <div className="space-y-6">
          {/* Live PIN */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className={`p-6 text-center ${campaign.status !== 'active' ? 'opacity-50' : ''}`}>
              <h3 className="text-sm font-bold text-v-text mb-1">Live Staff PIN</h3>
              <p className="text-xs text-v-text-3 mb-5">Share this with customers at the counter</p>
              {campaign.status === 'active' ? (
                <LivePIN campaign={campaign} />
              ) : (
                <div className="py-4">
                  <div className="text-3xl font-black text-v-text-3 tracking-widest">– – –</div>
                  <p className="text-xs text-v-text-3 mt-2">PIN inactive — campaign not running</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Redemption queue */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5">
              <RedemptionQueue />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
