'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Copy, Check, ChevronRight } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { CustomerReward } from '@/lib/types'

const demo      = customers[0]
const firstName = demo.name.split(' ')[0]

// ── Points from check-in mechanics ───────────────────────────
const totalPoints = customerBusinesses
  .flatMap(b => b.mechanics)
  .filter(m => m.type === 'checkin')
  .reduce((sum, m) => sum + ((m as any).totalPoints ?? 0), 0)

const topStreak = Math.max(0, ...customerBusinesses
  .flatMap(b => b.mechanics)
  .filter(m => m.type === 'checkin')
  .map(m => (m as any).checkInStreak ?? 0))

type Tab = 'active' | 'history'

// ── Helpers ───────────────────────────────────────────────────
function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - new Date('2026-06-15').getTime()) / 86400000)
}

function expiryLabel(r: CustomerReward): { text: string; urgent: boolean; warning: boolean } {
  if (!r.expiresAt) return { text: '', urgent: false, warning: false }
  const days = daysUntil(r.expiresAt)
  if (days <= 0) return { text: 'Expired', urgent: true, warning: false }
  if (days === 1) return { text: 'Expires tomorrow!', urgent: true, warning: false }
  if (days <= 3) return { text: `Expires in ${days} days`, urgent: true, warning: false }
  if (days <= 7) return { text: `Expires in ${days} days`, urgent: false, warning: true }
  const d = new Date(r.expiresAt)
  return {
    text: `Expires ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    urgent: false, warning: false,
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d} days ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Code pill with copy ───────────────────────────────────────
function CodePill({ code, dark = false }: { code: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 rounded-xl px-3 py-2 w-full"
      style={dark
        ? { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)' }
        : { background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}
    >
      <span className={`font-mono text-[13px] font-bold tracking-widest flex-1 text-left ${dark ? 'text-white' : 'text-gray-800'}`}>
        {code}
      </span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check className={`w-3.5 h-3.5 ${dark ? 'text-green-400' : 'text-green-600'}`} />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy className={`w-3.5 h-3.5 ${dark ? 'text-white/40' : 'text-gray-400'}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

// ── Active reward card ────────────────────────────────────────
function ActiveCard({ reward, index }: { reward: CustomerReward; index: number }) {
  const meta   = MECHANIC_META[reward.mechanic]
  const expiry = expiryLabel(reward)
  const bgFrom = reward.businessCoverFrom ?? meta.cardFrom
  const bgTo   = reward.businessCoverTo   ?? meta.cardTo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.07 }}
    >
      <Link href={reward.businessId ? `/customer/business/${reward.businessId}` : '#'}>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            boxShadow: expiry.urgent
              ? '0 8px 32px rgba(239,68,68,0.22), 0 2px 8px rgba(0,0,0,0.10)'
              : '0 4px 20px rgba(0,0,0,0.10)',
          }}
        >
          {/* Card header — business gradient */}
          <div
            className="relative px-4 pt-4 pb-5 overflow-hidden"
            style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
          >
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />

            {/* Top row */}
            <div className="relative flex items-start justify-between mb-3">
              <div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                  {reward.businessName ?? reward.campaignName}
                </p>
                <p className="text-white text-[11px] font-medium mt-0.5 opacity-70">{reward.campaignName}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
                >
                  {meta.label}
                </span>
                <span className="text-xl leading-none">{reward.businessEmoji ?? meta.emoji}</span>
              </div>
            </div>

            {/* Reward hero text */}
            <p className="relative text-white text-xl font-extrabold leading-tight mb-4">
              {reward.reward}
            </p>

            {/* Code */}
            <CodePill code={reward.code} dark />

            {/* Instruction */}
            <p className="relative text-white/50 text-[10px] font-medium text-center mt-2">
              Show this code to staff at the counter to redeem
            </p>
          </div>

          {/* Card footer */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-white"
          >
            <div className="flex items-center gap-2">
              {expiry.text && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={expiry.urgent
                    ? { background: '#FEE2E2', color: '#DC2626' }
                    : expiry.warning
                      ? { background: '#FEF3C7', color: '#D97706' }
                      : { background: '#F3F4F6', color: '#6B7280' }}
                >
                  {expiry.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-[10px]">Won {timeAgo(reward.earnedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── History reward card ───────────────────────────────────────
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
      <Link href={reward.businessId ? `/customer/business/${reward.businessId}` : '#'}>
        <div className="flex gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm items-center">
          {/* Mechanic icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
          >
            {reward.businessEmoji ?? meta.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                style={{ background: meta.badgeBg, color: meta.badgeText }}
              >
                {meta.label}
              </span>
              <span className="text-[9px] text-gray-400">
                {reward.businessName ?? reward.campaignName}
              </span>
            </div>
            <p className="text-[13px] font-extrabold text-gray-900 truncate">{reward.reward}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                {reward.code}
              </span>
            </div>
          </div>

          {/* Redeemed date */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full block mb-1">
              Redeemed ✓
            </span>
            <p className="text-[9px] text-gray-400">
              {reward.redeemedAt ? timeAgo(reward.redeemedAt) : ''}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('active')

  const activeRewards  = demo.rewards
    .filter(r => r.status === 'pending')
    .sort((a, b) => {
      // Sort by expiry urgency: soonest first
      const da = a.expiresAt ? daysUntil(a.expiresAt) : 999
      const db = b.expiresAt ? daysUntil(b.expiresAt) : 999
      return da - db
    })

  const historyRewards = demo.rewards
    .filter(r => r.status === 'redeemed')
    .sort((a, b) => new Date(b.redeemedAt ?? b.earnedAt).getTime() - new Date(a.redeemedAt ?? a.earnedAt).getTime())

  const urgentCount = activeRewards.filter(r => r.expiresAt && daysUntil(r.expiresAt) <= 3).length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />

        {/* Top row */}
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

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <div className="flex divide-x divide-white/10">
            <div className="flex-1 text-center py-4 px-2">
              <motion.p
                className="text-2xl font-black text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.18 }}
              >
                {activeRewards.length}
              </motion.p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5 uppercase tracking-wide">To Redeem</p>
            </div>
            <div className="flex-1 text-center py-4 px-2">
              <motion.p
                className="text-2xl font-black text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.22 }}
              >
                {topStreak}
              </motion.p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5 uppercase tracking-wide">Day Streak 🔥</p>
            </div>
            <div className="flex-1 text-center py-4 px-2">
              <motion.p
                className="text-2xl font-black text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.26 }}
              >
                {(totalPoints / 1000).toFixed(1)}k
              </motion.p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5 uppercase tracking-wide">Points ⭐</p>
            </div>
          </div>
        </motion.div>

        {/* Urgent expiry nudge */}
        {urgentCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}
          >
            <motion.span
              className="text-base"
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
            >
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
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t ? 'text-purple-800' : 'text-gray-400'
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="wallet-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {t === 'active'
                    ? `Active ${activeRewards.length > 0 ? `(${activeRewards.length})` : ''}`
                    : `History ${historyRewards.length > 0 ? `(${historyRewards.length})` : ''}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5">
          <AnimatePresence mode="wait">
            {tab === 'active' ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                {activeRewards.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">🎮</p>
                    <p className="text-gray-500 font-semibold">No active rewards yet</p>
                    <p className="text-gray-400 text-sm mt-1">Play games at your favourite spots to win!</p>
                    <Link href="/customer/home">
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="mt-5 inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}
                      >
                        Explore Campaigns →
                      </motion.div>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 pb-6">
                    {activeRewards.map((r, i) => (
                      <ActiveCard key={r.id} reward={r} index={i} />
                    ))}

                    {/* Play more nudge */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link href="/customer/home">
                        <div
                          className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                          style={{ background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', border: '1px solid #DDD6FE' }}
                        >
                          <div>
                            <p className="text-sm font-bold text-purple-900">Win more rewards</p>
                            <p className="text-xs text-purple-500 mt-0.5">
                              {customerBusinesses.filter(b => b.mechanics.some(m => m.status === 'active' && !(m as any).playedToday)).length} campaigns ready to play today
                            </p>
                          </div>
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
                          >
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                {historyRewards.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <p className="text-3xl mb-3">📋</p>
                    No redeemed rewards yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 pb-6">
                    {historyRewards.map((r, i) => (
                      <HistoryCard key={r.id} reward={r} index={i} />
                    ))}
                  </div>
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
