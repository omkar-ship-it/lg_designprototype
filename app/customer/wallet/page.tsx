'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { CustomerReward } from '@/lib/types'

const demo      = customers[0]
const firstName = demo.name.split(' ')[0]

const totalPoints = customerBusinesses
  .flatMap(b => b.mechanics)
  .filter(m => m.type === 'checkin')
  .reduce((sum, m) => sum + ((m as any).totalPoints ?? 0), 0)

const topStreak = Math.max(0, ...customerBusinesses
  .flatMap(b => b.mechanics)
  .filter(m => m.type === 'checkin')
  .map(m => (m as any).checkInStreak ?? 0))

type Tab = 'active' | 'history'

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - new Date('2026-06-15').getTime()) / 86400000)
}

function expiryChip(r: CustomerReward) {
  if (!r.expiresAt) return null
  const d = daysUntil(r.expiresAt)
  if (d <= 0)  return { text: 'Expired',             style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d === 1) return { text: 'Expires tomorrow!',   style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d <= 3)  return { text: `Expires in ${d} days`, style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d <= 7)  return { text: `Expires in ${d} days`, style: { background: '#FEF3C7', color: '#D97706' } }
  const dt = new Date(r.expiresAt)
  return { text: `Expires ${dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, style: { background: '#F3F4F6', color: '#6B7280' } }
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30)  return `${d} days ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Countdown ring SVG ────────────────────────────────────────
function CountdownRing({ seconds, total = 60 }: { seconds: number; total?: number }) {
  const r = 44, stroke = 5
  const circ = 2 * Math.PI * r
  const progress = seconds / total
  const dash = circ * progress
  const urgent = seconds <= 10

  return (
    <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      {/* Progress */}
      <motion.circle
        cx={50} cy={50} r={r} fill="none"
        stroke={urgent ? '#F87171' : 'rgba(255,255,255,0.80)'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        transition={{ duration: 0.9, ease: 'linear' }}
      />
    </svg>
  )
}

// ── Active reward card ────────────────────────────────────────
function ActiveCard({
  reward,
  index,
  countdown,
  redeemedAt,
  onRedeem,
}: {
  reward: CustomerReward
  index: number
  countdown: number | null   // null = not started; 0 = done; 1-60 = ticking
  redeemedAt: string | null  // set when countdown hits 0
  onRedeem: () => void
}) {
  const meta   = MECHANIC_META[reward.mechanic]
  const bgFrom = reward.businessCoverFrom ?? meta.cardFrom
  const bgTo   = reward.businessCoverTo   ?? meta.cardTo
  const chip   = expiryChip(reward)
  const urgent = chip?.style.color === '#DC2626'

  const isRedeeming = countdown !== null && countdown > 0
  const isDone      = redeemedAt !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.07 }}
      layout
    >
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          boxShadow: isDone
            ? '0 4px 20px rgba(34,197,94,0.25)'
            : urgent
              ? '0 8px 32px rgba(239,68,68,0.22)'
              : '0 4px 20px rgba(0,0,0,0.10)',
        }}
      >
        {/* ── Redeemed state ── */}
        {isDone && (
          <>
            <div
              className="relative px-4 pt-4 pb-5 overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #14532D, #065F46)' }}
            >
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="relative flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                    {reward.businessName ?? reward.campaignName}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">{reward.campaignName}</p>
                </div>
                <span className="text-xl">{reward.businessEmoji ?? meta.emoji}</span>
              </div>
              <p className="relative text-white text-lg font-extrabold mb-3">{reward.reward}</p>
              <div className="relative flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                  className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center shrink-0"
                >
                  <span className="text-white font-black text-sm">✓</span>
                </motion.div>
                <div>
                  <p className="text-green-300 text-sm font-extrabold">Redeemed</p>
                  <p className="text-green-400/70 text-[10px] font-medium">{fmtDateTime(redeemedAt!)}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2.5 flex items-center gap-1">
              <span className="text-[11px] text-green-700 font-medium">Thanks for visiting {reward.businessName ?? 'the business'}! 🎉</span>
            </div>
          </>
        )}

        {/* ── Countdown / timer state ── */}
        {isRedeeming && !isDone && (
          <>
            <div
              className="relative px-4 pt-4 pb-5 overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
            >
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

              <div className="relative flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                    {reward.businessName ?? reward.campaignName}
                  </p>
                  <p className="text-white text-base font-extrabold leading-tight mt-0.5">{reward.reward}</p>
                </div>
                <div className="flex items-center gap-1 bg-green-500 rounded-full px-2 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[9px] font-extrabold text-white tracking-wide">LIVE</span>
                </div>
              </div>

              {/* Big timer */}
              <div className="relative flex flex-col items-center py-2">
                <div className="relative">
                  <CountdownRing seconds={countdown!} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={countdown}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-3xl font-black ${countdown! <= 10 ? 'text-red-300' : 'text-white'}`}
                    >
                      {countdown}
                    </motion.span>
                    <span className="text-[9px] text-white/50 font-semibold -mt-1">sec</span>
                  </div>
                </div>
                <p className="text-white/70 text-xs font-semibold mt-2 text-center">
                  Show this to staff at {reward.businessName ?? 'the counter'}
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-2.5 flex items-center justify-center">
              <p className="text-[11px] text-gray-400 font-medium">
                Reward will auto-confirm in {countdown}s
              </p>
            </div>
          </>
        )}

        {/* ── Default state ── */}
        {!isRedeeming && !isDone && (
          <>
            <div
              className="relative px-4 pt-4 pb-5 overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
            >
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

              <div className="relative flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                    {reward.businessName ?? reward.campaignName}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">{reward.campaignName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.9)' }}>
                    {meta.label}
                  </span>
                  <span className="text-xl">{reward.businessEmoji ?? meta.emoji}</span>
                </div>
              </div>

              <p className="relative text-white text-xl font-extrabold leading-tight mb-4">{reward.reward}</p>

              {/* Redeem button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onRedeem}
                className="relative w-full py-3 rounded-2xl text-sm font-extrabold"
                style={{ background: 'rgba(255,255,255,0.95)', color: bgFrom }}
                animate={{ boxShadow: ['0 4px 16px rgba(255,255,255,0.2)', '0 4px 28px rgba(255,255,255,0.45)', '0 4px 16px rgba(255,255,255,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Redeem Now →
              </motion.button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white">
              {chip ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={chip.style}>
                  {chip.text}
                </span>
              ) : <span />}
              <span className="text-[10px] text-gray-400">Won {timeAgo(reward.earnedAt)}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── History card ──────────────────────────────────────────────
function HistoryCard({ reward, index }: { reward: CustomerReward; index: number }) {
  const meta   = MECHANIC_META[reward.mechanic]
  const bgFrom = reward.businessCoverFrom ?? meta.cardFrom
  const bgTo   = reward.businessCoverTo   ?? meta.cardTo

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.06 }}
    >
      <div className="flex gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          {reward.businessEmoji ?? meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
              style={{ background: meta.badgeBg, color: meta.badgeText }}>
              {meta.label}
            </span>
            <span className="text-[9px] text-gray-400">{reward.businessName ?? reward.campaignName}</span>
          </div>
          <p className="text-[13px] font-extrabold text-gray-900 truncate">{reward.reward}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{reward.code}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full block mb-1">
            Redeemed ✓
          </span>
          <p className="text-[9px] text-gray-400">
            {reward.redeemedAt ? timeAgo(reward.redeemedAt) : ''}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('active')

  // Local mutable rewards state
  const [rewards, setRewards] = useState<CustomerReward[]>(demo.rewards)

  // countdowns: rewardId → seconds remaining (null = not started)
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})

  // Session-redeemed: rewardId → ISO timestamp (for showing inline redeemed state)
  const [sessionRedeemed, setSessionRedeemed] = useState<Record<string, string>>({})

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Single interval driving all active countdowns
  useEffect(() => {
    const active = Object.entries(countdowns).filter(([, s]) => s > 0)
    if (active.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setCountdowns(prev => {
        const next = { ...prev }
        const justDone: string[] = []
        for (const id in next) {
          if (next[id] > 0) {
            next[id] -= 1
            if (next[id] === 0) justDone.push(id)
          }
        }
        if (justDone.length > 0) {
          const now = new Date().toISOString()
          justDone.forEach(id => {
            setSessionRedeemed(sr => ({ ...sr, [id]: now }))
          })
          setRewards(rs =>
            rs.map(r =>
              justDone.includes(r.id)
                ? { ...r, status: 'redeemed' as const, redeemedAt: now }
                : r
            )
          )
        }
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [JSON.stringify(Object.keys(countdowns))])

  const startRedeem = (id: string) => {
    setCountdowns(prev => ({ ...prev, [id]: 60 }))
  }

  const pendingRewards = rewards
    .filter(r => r.status === 'pending' || sessionRedeemed[r.id])
    .sort((a, b) => {
      // Session-redeemed cards go to bottom
      if (sessionRedeemed[a.id] && !sessionRedeemed[b.id]) return 1
      if (sessionRedeemed[b.id] && !sessionRedeemed[a.id]) return -1
      // Sort pending by expiry urgency
      const da = a.expiresAt ? daysUntil(a.expiresAt) : 999
      const db = b.expiresAt ? daysUntil(b.expiresAt) : 999
      return da - db
    })

  const historyRewards = rewards
    .filter(r => r.status === 'redeemed' && !sessionRedeemed[r.id])
    .sort((a, b) => new Date(b.redeemedAt ?? b.earnedAt).getTime() - new Date(a.redeemedAt ?? a.earnedAt).getTime())

  const urgentCount = pendingRewards.filter(r =>
    !sessionRedeemed[r.id] && r.expiresAt && daysUntil(r.expiresAt) <= 3
  ).length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-between mb-5"
        >
          <div>
            <p className="text-purple-300 text-xs font-medium tracking-wide">Your Rewards</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5">{firstName}'s Wallet</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
            {urgentCount > 0 && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <span className="text-[9px] font-black text-white">{urgentCount}</span>
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <div className="flex divide-x divide-white/10">
            {[
              { value: pendingRewards.filter(r => !sessionRedeemed[r.id]).length, label: 'To Redeem' },
              { value: topStreak,                                                  label: 'Day Streak 🔥' },
              { value: `${(totalPoints / 1000).toFixed(1)}k`,                    label: 'Points ⭐' },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex-1 text-center py-4 px-2">
                <motion.p className="text-2xl font-black text-white"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.18 + i * 0.05 }}>
                  {value}
                </motion.p>
                <p className="text-[10px] text-purple-300 font-semibold mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Urgent nudge */}
        {urgentCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="relative mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <motion.span className="text-base"
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}>
              ⏰
            </motion.span>
            <p className="text-sm font-semibold text-red-300">
              {urgentCount} reward{urgentCount !== 1 ? 's' : ''} expiring soon — redeem before they're gone!
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="bg-white rounded-t-3xl -mt-3 pt-5 min-h-screen">
        {/* Tabs */}
        <div className="px-5 mb-5">
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {(['active', 'history'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'text-purple-800' : 'text-gray-400'}`}>
                {tab === t && (
                  <motion.div layoutId="wallet-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">
                  {t === 'active'
                    ? `Active (${pendingRewards.filter(r => !sessionRedeemed[r.id]).length})`
                    : `History (${historyRewards.length})`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5">
          <AnimatePresence mode="wait">
            {tab === 'active' ? (
              <motion.div key="active"
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="space-y-4 pb-6">
                {pendingRewards.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">🎮</p>
                    <p className="text-gray-500 font-semibold">No active rewards yet</p>
                    <p className="text-gray-400 text-sm mt-1">Play games at your favourite spots to win!</p>
                    <Link href="/customer/home">
                      <motion.div whileTap={{ scale: 0.97 }}
                        className="mt-5 inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
                        Explore Campaigns →
                      </motion.div>
                    </Link>
                  </div>
                ) : (
                  <>
                    {pendingRewards.map((r, i) => (
                      <ActiveCard
                        key={r.id}
                        reward={r}
                        index={i}
                        countdown={countdowns[r.id] ?? null}
                        redeemedAt={sessionRedeemed[r.id] ?? null}
                        onRedeem={() => startRedeem(r.id)}
                      />
                    ))}
                    <Link href="/customer/home">
                      <div className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                        style={{ background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', border: '1px solid #DDD6FE' }}>
                        <div>
                          <p className="text-sm font-bold text-purple-900">Win more rewards</p>
                          <p className="text-xs text-purple-500 mt-0.5">Campaigns ready to play today</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}>
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </Link>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div key="history"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="space-y-2.5 pb-6">
                {historyRewards.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <p className="text-3xl mb-3">📋</p>
                    No redeemed rewards yet.
                  </div>
                ) : (
                  historyRewards.map((r, i) => <HistoryCard key={r.id} reward={r} index={i} />)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
