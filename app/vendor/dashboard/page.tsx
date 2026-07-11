'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, ArrowRight, TrendingUp, TrendingDown, Minus,
  Users, UserCheck, RotateCcw, ShieldCheck, Zap,
} from 'lucide-react'
import { Card, ProgressBar } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MechanicBadge } from '@/components/ui/badge'
import { campaigns, customers } from '@/lib/mock-data'
import { getMechanicEmoji, capPercent } from '@/lib/utils'
import { LivePIN } from '@/components/vendor/live-pin'
import { RedemptionQueue } from '@/components/vendor/redemption-queue'

// ── Helpers ───────────────────────────────────────────────────────────────────
const TODAY_DATE = new Date('2026-06-13')

function daysSince(iso: string) {
  return Math.floor((TODAY_DATE.getTime() - new Date(iso).getTime()) / 86400000)
}

// Synthetic last-month baselines for trend arrows (design prototype — not derived from real history)
const activeCampsForLM = campaigns.filter(c => c.status === 'active')
const LM = {
  totalUsers:   Math.max(0, customers.length - 1),
  currentUsers: Math.round(customers.filter(c => daysSince(c.lastVisit) <= 30).length * 0.88),
  repeatVisitRate: 60,
  retentionRate: 68,
  totalPlayers:     Math.round(activeCampsForLM.reduce((s, c) => s + c.currentUsers, 0) * 0.9),
  totalWins:        Math.round(activeCampsForLM.reduce((s, c) => s + c.rewardsClaimed, 0) * 0.85),
  totalRedemptions: Math.round(activeCampsForLM.reduce((s, c) => s + c.redeemedCount, 0) * 0.9),
}

// ── Trend chip ────────────────────────────────────────────────────────────────
function Trend({ now, prev, unit = 'pp', invert = false, suffix = '' }: {
  now: number; prev: number; unit?: string; invert?: boolean; suffix?: string
}) {
  const diff = now - prev
  const isUp = invert ? diff < 0 : diff > 0
  if (diff === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-v-text-3 font-medium">
      <Minus className="w-2.5 h-2.5" /> No change vs last month
    </span>
  )
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? 'text-v-success' : 'text-v-danger'}`}>
      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {diff > 0 ? '+' : ''}{diff}{unit}{suffix} vs last month
    </span>
  )
}

const fadeUp = (i: number) => ({ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } })

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {

  const n = customers.length
  const visitedLast30 = customers.filter(c => daysSince(c.lastVisit) <= 30)
  const repeatVisitRate = Math.round((visitedLast30.length / n) * 100)
  const retentionRate = 71   // synthetic — design prototype

  // Campaign rollups (active only)
  const activeCamps = campaigns.filter(c => c.status === 'active')
  const totalPlayers     = activeCamps.reduce((s, c) => s + c.currentUsers, 0)
  const totalWins        = activeCamps.reduce((s, c) => s + c.rewardsClaimed, 0)
  const totalRedemptions = activeCamps.reduce((s, c) => s + c.redeemedCount, 0)

  return (
    <div className="p-8 max-w-7xl space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-v-text">Good morning, Brew & Bite ☕</h1>
          <p className="text-v-text-2 text-sm mt-1">Friday, 13 June 2026 · {activeCamps.length} campaigns running</p>
        </div>
        <Link href="/vendor/campaigns/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> New Campaign</Button>
        </Link>
      </motion.div>

      {/* ── Hero: Total Users, Current Users, Repeat Visit Rate, Retention ── */}
      <motion.div variants={fadeUp(1)} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Users */}
        <Card className="p-5 bg-gradient-to-br from-v-surface to-indigo-50 border-indigo-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-indigo-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-v-text-2">Total Users</span>
            </div>
            <div className="text-4xl font-black text-indigo-600 leading-none mb-2">{n}</div>
            <Trend now={n} prev={LM.totalUsers} unit="" />
            <p className="text-xs text-v-text-3 mt-2">customers who've ever played a campaign</p>
          </div>
        </Card>

        {/* Current Users */}
        <Card className="p-5 bg-gradient-to-br from-v-surface to-blue-50 border-blue-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-blue-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-v-text-2">Current Users</span>
            </div>
            <div className="text-4xl font-black text-blue-600 leading-none mb-2">{visitedLast30.length}</div>
            <Trend now={visitedLast30.length} prev={LM.currentUsers} unit="" />
            <p className="text-xs text-v-text-3 mt-2">active in the last 30 days</p>
          </div>
        </Card>

        {/* Repeat Visit Rate */}
        <Card className="p-5 bg-gradient-to-br from-v-surface to-purple-50 border-purple-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-v-purple/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-v-purple" />
              <span className="text-sm font-semibold text-v-text-2">Repeat Visits</span>
            </div>
            <div className="text-4xl font-black text-v-purple leading-none mb-2">{repeatVisitRate}%</div>
            <Trend now={repeatVisitRate} prev={LM.repeatVisitRate} />
            <p className="text-xs text-v-text-3 mt-2">{visitedLast30.length} of {n} visited in last 30 days</p>
          </div>
        </Card>

        {/* Retention */}
        <Card className="p-5 bg-gradient-to-br from-v-surface to-green-50 border-green-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-green-500/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-v-text-2">Retention</span>
            </div>
            <div className="text-4xl font-black text-green-600 leading-none mb-2">{retentionRate}%</div>
            <Trend now={retentionRate} prev={LM.retentionRate} />
            <p className="text-xs text-v-text-3 mt-2">of last month's customers came back</p>
          </div>
        </Card>

      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left 2/3 */}
        <div className="xl:col-span-2 space-y-6">

          {/* Consolidated Campaigns View */}
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text flex items-center gap-2">
                <Zap className="w-4 h-4 text-v-purple" /> All Campaigns, Consolidated
              </h2>
              <span className="text-[11px] text-v-text-3">Across {activeCamps.length} active campaigns</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Players',     value: totalPlayers,     prev: LM.totalPlayers,     sub: 'unique players (this cycle)', color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200' },
                { label: 'Total Wins',         value: totalWins,        prev: LM.totalWins,        sub: 'rewards won',                  color: '#16A34A', bg: 'bg-green-50',  border: 'border-green-200'  },
                { label: 'Total Redemptions',  value: totalRedemptions, prev: LM.totalRedemptions, sub: 'claimed at the counter',       color: '#D97706', bg: 'bg-amber-50',  border: 'border-amber-200'  },
              ].map((m, i) => (
                <motion.div key={m.label} variants={fadeUp(3 + i)} initial="hidden" animate="show">
                  <div className={`vendor-card p-5 ${m.bg} border ${m.border}`}>
                    <div className="text-3xl font-black leading-none mb-2" style={{ color: m.color }}>{m.value.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-v-text mb-0.5">{m.label}</div>
                    <div className="text-[10px] text-v-text-3 mb-2">{m.sub}</div>
                    <Trend now={m.value} prev={m.prev} unit="" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Campaigns */}
          <motion.div variants={fadeUp(6)} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-v-text">Active Campaigns</h2>
              <Link href="/vendor/campaigns" className="text-xs text-v-purple hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {activeCamps.map((c, i) => (
                <Link href={`/vendor/campaigns/${c.id}`} key={c.id}>
                  <motion.div variants={fadeUp(7 + i)} initial="hidden" animate="show"
                    className="vendor-card vendor-card-hover p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-v-surface-3 flex items-center justify-center text-xl shrink-0">
                        {getMechanicEmoji(c.mechanic)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-v-text truncate">{c.name}</span>
                          <MechanicBadge mechanic={c.mechanic} />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-v-purple font-bold">{c.currentUsers.toLocaleString()} players</span>
                          <span className="text-xs text-emerald-600 font-bold">{c.rewardsClaimed.toLocaleString()} wins</span>
                          <span className="text-xs text-amber-600 font-bold">{c.redeemedCount.toLocaleString()} redeemed</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <ProgressBar value={c.currentUsers} max={c.userCap} className="flex-1" />
                          <span className="text-[10px] text-v-text-3 shrink-0">{capPercent(c.currentUsers, c.userCap)}% cap</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <LivePIN campaign={c} compact />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">

          {/* Redemption queue */}
          <motion.div variants={fadeUp(2)} initial="hidden" animate="show">
            <Card className="p-5">
              <RedemptionQueue />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
