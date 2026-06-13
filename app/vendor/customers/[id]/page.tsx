'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Phone, Mail, TrendingUp, Gift, CheckCircle2, Clock, Trophy, Star, Coffee } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MechanicBadge } from '@/components/ui/badge'
import { customers, campaigns } from '@/lib/mock-data'
import { getMechanicEmoji, getMechanicLabel, formatDate, formatRelativeTime } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

// Derived visit history from game plays + synthetic visits
function buildVisitHistory(customer: typeof customers[0]) {
  type VisitEvent = {
    id: string
    type: 'visit' | 'game_win' | 'game_loss' | 'reward_redeemed'
    label: string
    sub?: string
    mechanic?: MechanicType
    date: string
    icon: string
  }

  const events: VisitEvent[] = []

  // Seed from game history
  customer.gameHistory.forEach(g => {
    events.push({
      id: g.id,
      type: g.won ? 'game_win' : 'game_loss',
      label: g.won ? `Won ${g.reward ?? 'a reward'}` : 'Played — no win this time',
      sub: g.campaignName,
      mechanic: g.mechanic,
      date: g.playedAt,
      icon: g.won ? '🎁' : getMechanicEmoji(g.mechanic),
    })
  })

  // Seed from redeemed rewards
  customer.rewards.filter(r => r.status === 'redeemed' && r.redeemedAt).forEach(r => {
    events.push({
      id: `rd-${r.id}`,
      type: 'reward_redeemed',
      label: `Redeemed "${r.reward}"`,
      sub: r.campaignName,
      mechanic: r.mechanic,
      date: r.redeemedAt!,
      icon: '✅',
    })
  })

  // Synthetic extra visits to fill totalVisits count
  const existingCount = events.filter(e => e.type !== 'reward_redeemed').length
  const extra = Math.max(0, Math.min(customer.totalVisits - existingCount, 8))
  const base = new Date(customer.joinedAt).getTime()
  const now = new Date(customer.lastVisit).getTime()
  for (let i = 0; i < extra; i++) {
    const t = new Date(base + (now - base) * ((i + 1) / (extra + 1)))
    events.push({
      id: `v-${i}`,
      type: 'visit',
      label: 'Visited the café',
      date: t.toISOString(),
      icon: '☕',
    })
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Derive campaigns the customer participated in, split active vs previous
function buildCampaignActivity(customer: typeof customers[0]) {
  const seen = new Map<string, { id: string; name: string; mechanic: MechanicType; plays: number; wins: number; status: string }>()

  customer.gameHistory.forEach(g => {
    const camp = campaigns.find(c => c.id === g.campaignId)
    if (!camp) return
    if (!seen.has(g.campaignId)) {
      seen.set(g.campaignId, { id: g.campaignId, name: g.campaignName, mechanic: g.mechanic, plays: 0, wins: 0, status: camp.status })
    }
    const entry = seen.get(g.campaignId)!
    entry.plays++
    if (g.won) entry.wins++
  })

  const all = Array.from(seen.values())
  return {
    active: all.filter(c => c.status === 'active'),
    previous: all.filter(c => c.status !== 'active'),
  }
}

// Redemption summary
function buildRedemptionSummary(customer: typeof customers[0]) {
  const pending = customer.rewards.filter(r => r.status === 'pending')
  const redeemed = customer.rewards.filter(r => r.status === 'redeemed')
  const total = customer.rewards.length

  const VALUE_MAP: Record<string, number> = {
    'Free Coffee': 120, '₹30 Off': 30, 'Free Breakfast': 450,
    'Free Sandwich': 180, '₹50 Off': 50, 'Free Muffin': 80,
    '20% Off': 60, 'Surprise Drop': 80, 'Free Dessert': 150,
  }
  const totalValue = customer.rewards.reduce((s, r) => s + (VALUE_MAP[r.reward] ?? 50), 0)

  return { pending, redeemed, total, totalValue }
}

const STEP_COLORS = {
  game_win: 'text-amber-600 bg-amber-50 border-amber-200',
  game_loss: 'text-v-text-3 bg-v-surface-2 border-v-border',
  reward_redeemed: 'text-v-success bg-emerald-50 border-emerald-200',
  visit: 'text-v-purple bg-v-surface-2 border-v-border',
}

type Tab = 'overview' | 'visits' | 'campaigns' | 'rewards'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const customer = customers.find(c => c.id === id) ?? customers[0]
  const [tab, setTab] = useState<Tab>('overview')

  const visitHistory = buildVisitHistory(customer)
  const campaignActivity = buildCampaignActivity(customer)
  const redemption = buildRedemptionSummary(customer)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'visits', label: 'Visit History' },
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'rewards', label: 'Rewards & Games' },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link href="/vendor/customers" className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Customers
        </Link>

        {/* Header */}
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-v-surface-3 border border-v-border-b flex items-center justify-center text-2xl font-extrabold text-v-purple shrink-0">
            {customer.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-v-text">{customer.name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${customer.status === 'active' ? 'bg-emerald-50 text-v-success border border-emerald-200' : 'bg-v-surface-2 text-v-text-3 border border-v-border'}`}>
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-5 flex-wrap text-xs text-v-text-3">
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{customer.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{customer.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />DOB: {formatDate(customer.dob)}</span>
              <span className="flex items-center gap-1.5"><Star className="w-3 h-3" />Member since {formatDate(customer.joinedAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Visits', value: customer.totalVisits, icon: '📅', trend: '+3 this month', up: true },
          { label: 'Games Played', value: customer.gamesPlayed, icon: '🎮', trend: `${customer.gameHistory.filter(g => g.won).length} wins`, up: true },
          { label: 'Rewards Earned', value: customer.rewardsEarned, icon: '🎁', trend: `₹${redemption.totalValue} value`, up: true },
          { label: 'Last Seen', value: formatRelativeTime(customer.lastVisit), icon: '⏱️', trend: 'Most recent visit', up: false },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}>
            <Card className="p-4">
              <div className="text-xl mb-2">{s.icon}</div>
              <div className="text-lg font-bold text-v-text">{s.value}</div>
              <div className="text-xs text-v-text-3 mt-0.5">{s.label}</div>
              <div className={`text-[10px] mt-1 font-medium ${s.up ? 'text-v-success' : 'text-v-text-3'}`}>{s.trend}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-v-surface-2 border border-v-border rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-2 hover:text-v-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Redemption summary */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-v-purple" />
                <h3 className="text-sm font-bold text-v-text">Redemption Summary</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Total', value: redemption.total, color: 'text-v-purple', bg: 'bg-v-surface-3 border-v-border-b' },
                  { label: 'Pending', value: redemption.pending.length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                  { label: 'Redeemed', value: redemption.redeemed.length, color: 'text-v-success', bg: 'bg-emerald-50 border-emerald-200' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-3 border text-center ${s.bg}`}>
                    <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-v-text-3 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              {redemption.total > 0 && (
                <div>
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-v-surface-3 gap-px">
                    <div className="h-full bg-v-success rounded-full transition-all" style={{ width: `${(redemption.redeemed.length / redemption.total) * 100}%` }} />
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(redemption.pending.length / redemption.total) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-v-text-3">
                    <span>{Math.round((redemption.redeemed.length / Math.max(1, redemption.total)) * 100)}% redeemed</span>
                    <span>Est. value: ₹{redemption.totalValue}</span>
                  </div>
                </div>
              )}
              {redemption.total === 0 && (
                <p className="text-xs text-v-text-3 text-center py-2">No rewards yet</p>
              )}
            </Card>

            {/* Campaign summary */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-v-purple" />
                <h3 className="text-sm font-bold text-v-text">Campaign Participation</h3>
              </div>
              {campaignActivity.active.length === 0 && campaignActivity.previous.length === 0 ? (
                <p className="text-xs text-v-text-3 text-center py-4">No campaigns yet</p>
              ) : (
                <div className="space-y-2">
                  {[...campaignActivity.active.map(c => ({ ...c, badge: 'Active' })), ...campaignActivity.previous.map(c => ({ ...c, badge: 'Ended' }))].map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2.5 bg-v-surface-2 border border-v-border rounded-xl">
                      <div className="text-xl shrink-0">{getMechanicEmoji(c.mechanic)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-v-text truncate">{c.name}</p>
                        <p className="text-[10px] text-v-text-3">{c.plays} play{c.plays !== 1 ? 's' : ''} · {c.wins} win{c.wins !== 1 ? 's' : ''}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.badge === 'Active' ? 'bg-emerald-50 text-v-success border border-emerald-200' : 'bg-v-surface-3 text-v-text-3 border border-v-border'}`}>
                        {c.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent activity preview */}
            <Card className="p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-v-purple" />
                  <h3 className="text-sm font-bold text-v-text">Recent Activity</h3>
                </div>
                <button onClick={() => setTab('visits')} className="text-xs text-v-purple font-semibold hover:underline">View all</button>
              </div>
              <div className="space-y-2.5">
                {visitHistory.slice(0, 4).map((event, i) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border shrink-0 ${STEP_COLORS[event.type]}`}>
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs font-semibold text-v-text">{event.label}</p>
                      {event.sub && <p className="text-[10px] text-v-text-3">{event.sub}</p>}
                    </div>
                    <span className="text-[10px] text-v-text-3 shrink-0 pt-0.5">{formatRelativeTime(event.date)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* VISIT HISTORY */}
        {tab === 'visits' && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-4 h-4 text-v-purple" />
              <h3 className="text-sm font-bold text-v-text">Visit History</h3>
              <span className="text-xs text-v-text-3 ml-auto">{customer.totalVisits} total visits</span>
            </div>
            {visitHistory.length === 0 ? (
              <p className="text-sm text-v-text-3 text-center py-8">No visit history yet</p>
            ) : (
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-px bg-v-border" />
                <div className="space-y-0">
                  {visitHistory.map((event, i) => (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex gap-4 pb-4 last:pb-0">
                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 shrink-0 ${STEP_COLORS[event.type]}`}>
                        {event.icon}
                      </div>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-v-text">{event.label}</p>
                            {event.sub && <p className="text-xs text-v-text-3 mt-0.5">{event.sub}</p>}
                            {event.mechanic && (
                              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-v-surface-3 border border-v-border rounded-full text-v-text-2 font-medium">
                                {getMechanicEmoji(event.mechanic)} {getMechanicLabel(event.mechanic)}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-v-text-3">{formatRelativeTime(event.date)}</p>
                            <p className="text-[10px] text-v-text-3">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* CAMPAIGNS */}
        {tab === 'campaigns' && (
          <div className="space-y-5">
            {/* Active campaigns */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-v-success animate-pulse" />
                <h3 className="text-sm font-bold text-v-text">Active Campaigns</h3>
                <span className="text-xs text-v-text-3">({campaignActivity.active.length})</span>
              </div>
              {campaignActivity.active.length === 0 ? (
                <Card className="p-5 text-center">
                  <p className="text-sm text-v-text-3">Not participating in any active campaigns</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {campaignActivity.active.map(c => {
                    const camp = campaigns.find(x => x.id === c.id)
                    const winRate = c.plays > 0 ? Math.round((c.wins / c.plays) * 100) : 0
                    return (
                      <Card key={c.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-v-surface-2 border border-v-border flex items-center justify-center text-xl shrink-0">
                            {getMechanicEmoji(c.mechanic)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-v-text leading-tight truncate">{c.name}</p>
                            <p className="text-xs text-v-text-3 mt-0.5">{getMechanicLabel(c.mechanic)}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-v-success border border-emerald-200 shrink-0">Live</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {[
                            { label: 'Plays', value: c.plays },
                            { label: 'Wins', value: c.wins },
                            { label: 'Win rate', value: `${winRate}%` },
                          ].map(s => (
                            <div key={s.label} className="text-center p-2 bg-v-surface-2 rounded-lg border border-v-border">
                              <div className="text-sm font-bold text-v-text">{s.value}</div>
                              <div className="text-[10px] text-v-text-3">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        {camp && (
                          <p className="text-[10px] text-v-text-3 mt-2.5 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            Ends {formatDate(camp.endDate)}
                          </p>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Previous campaigns */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-v-text-3" />
                <h3 className="text-sm font-bold text-v-text">Previous Campaigns</h3>
                <span className="text-xs text-v-text-3">({campaignActivity.previous.length})</span>
              </div>
              {campaignActivity.previous.length === 0 ? (
                <Card className="p-5 text-center">
                  <p className="text-sm text-v-text-3">No previous campaign history</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {campaignActivity.previous.map(c => {
                    const winRate = c.plays > 0 ? Math.round((c.wins / c.plays) * 100) : 0
                    return (
                      <Card key={c.id} className="p-3.5 opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="text-xl shrink-0">{getMechanicEmoji(c.mechanic)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-v-text truncate">{c.name}</p>
                            <p className="text-xs text-v-text-3">{c.plays} plays · {c.wins} wins · {winRate}% win rate</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-v-surface-3 text-v-text-3 border border-v-border shrink-0">Ended</span>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REWARDS & GAMES */}
        {tab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rewards wallet */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-v-text">Rewards Wallet</h3>
              </div>
              {customer.rewards.length === 0 ? (
                <p className="text-sm text-v-text-3 text-center py-8">No rewards yet</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.rewards.map(r => (
                    <div key={r.id} className={`p-3.5 rounded-xl border transition-all ${r.status === 'redeemed' ? 'border-v-border bg-v-surface-2 opacity-60' : 'border-amber-200 bg-amber-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-bold text-v-text">{r.reward}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${r.status === 'redeemed' ? 'bg-v-surface-3 text-v-text-3' : 'bg-emerald-50 text-v-success border border-emerald-200'}`}>
                              {r.status}
                            </span>
                          </div>
                          <p className="text-xs text-v-text-3">{r.campaignName}</p>
                          <p className="text-[10px] text-v-text-3 font-mono mt-1">{r.code}</p>
                          {r.redeemedAt && (
                            <p className="text-[10px] text-v-text-3 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-v-success" />
                              Redeemed {formatRelativeTime(r.redeemedAt)}
                            </p>
                          )}
                        </div>
                        <MechanicBadge mechanic={r.mechanic} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Game history */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-4 h-4 text-v-purple" />
                <h3 className="text-sm font-bold text-v-text">Game History</h3>
                <span className="text-xs text-v-text-3 ml-auto">{customer.gameHistory.length} plays</span>
              </div>
              {customer.gameHistory.length === 0 ? (
                <p className="text-sm text-v-text-3 text-center py-8">No games played yet</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.gameHistory.map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-v-surface-2 border border-transparent hover:border-v-border transition-all">
                      <div className="w-9 h-9 rounded-xl bg-v-surface-3 border border-v-border flex items-center justify-center text-lg shrink-0">
                        {getMechanicEmoji(g.mechanic)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-v-text truncate">{g.campaignName}</p>
                        <p className="text-xs text-v-text-3">{formatRelativeTime(g.playedAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {g.won ? (
                          <div className="text-xs font-bold text-amber-600">🎁 Won</div>
                        ) : (
                          <div className="text-xs text-v-text-3">No win</div>
                        )}
                        {g.reward && <div className="text-[10px] text-v-text-3 mt-0.5">{g.reward}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

      </motion.div>
    </div>
  )
}
