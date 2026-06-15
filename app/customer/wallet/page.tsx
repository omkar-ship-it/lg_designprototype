'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight, X } from 'lucide-react'
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
  if (d <= 0)  return { text: 'Expired',              style: { background: '#FEE2E2', color: '#DC2626' } }
  if (d === 1) return { text: 'Expires tomorrow!',    style: { background: '#FEE2E2', color: '#DC2626' } }
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

// ── Full-screen countdown ring ────────────────────────────────
function CountdownRing({ seconds, total = 60 }: { seconds: number; total?: number }) {
  const r    = 72
  const circ = 2 * Math.PI * r
  const dash = circ * (seconds / total)

  return (
    <svg width={168} height={168} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={84} cy={84} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={7} />
      <motion.circle
        cx={84} cy={84} r={r} fill="none"
        stroke={seconds <= 10 ? '#F87171' : 'rgba(255,255,255,0.85)'}
        strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        transition={{ duration: 0.85, ease: 'linear' }}
      />
    </svg>
  )
}

// ── Full-screen redemption overlay ───────────────────────────
function RedemptionScreen({
  reward,
  countdown,
  redeemedAt,
  onClose,
}: {
  reward:     CustomerReward
  countdown:  number
  redeemedAt: string | null
  onClose:    () => void
}) {
  const meta   = MECHANIC_META[reward.mechanic]
  const bgFrom = reward.businessCoverFrom ?? meta.cardFrom
  const bgTo   = reward.businessCoverTo   ?? meta.cardTo
  const isDone = redeemedAt !== null

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: isDone
          ? 'linear-gradient(145deg, #052E16, #14532D)'
          : `linear-gradient(145deg, ${bgFrom}, ${bgTo})`,
      }}
    >
      {/* Dot texture */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${isDone ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.10)'} 0%, transparent 70%)`, filter: 'blur(40px)' }} />

      {/* Close button */}
      <div className="relative flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
            {reward.businessName ?? reward.campaignName}
          </p>
          <p className="text-white/70 text-xs mt-0.5">{reward.campaignName}</p>
        </div>
        {!isDone && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* ── Countdown state ── */}
      {!isDone && (
        <div className="relative flex-1 flex flex-col items-center justify-between px-6 pb-14">

          {/* Reward name */}
          <div className="text-center mt-4 mb-auto">
            <span className="text-5xl block mb-4">{reward.businessEmoji ?? meta.emoji}</span>
            <p className="text-3xl font-black text-white leading-tight">{reward.reward}</p>
            <span
              className="inline-block mt-3 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.80)' }}
            >
              {meta.label}
            </span>
          </div>

          {/* Big timer */}
          <div className="flex flex-col items-center my-6">
            <div className="relative">
              <CountdownRing seconds={countdown} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.15, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-6xl font-black leading-none ${countdown <= 10 ? 'text-red-300' : 'text-white'}`}
                >
                  {countdown}
                </motion.span>
                <span className="text-white/40 text-xs font-semibold tracking-widest mt-1">SEC</span>
              </div>
            </div>
            <p className="text-white/60 text-sm font-medium mt-4 text-center">
              Show this screen to staff at<br />
              <span className="text-white font-bold">{reward.businessName ?? 'the counter'}</span>
            </p>
          </div>

          {/* Bottom note */}
          <p className="text-white/30 text-xs text-center">
            This screen confirms automatically when time is up
          </p>
        </div>
      )}

      {/* ── Redeemed state ── */}
      {isDone && (
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-14 gap-6">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="w-28 h-28 rounded-full bg-green-400 flex items-center justify-center"
            style={{ boxShadow: '0 0 60px rgba(34,197,94,0.5)' }}
          >
            <span className="text-5xl text-white font-black">✓</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-4xl font-black text-white mb-2">Redeemed!</p>
            <p className="text-xl font-bold text-green-300">{reward.reward}</p>
            <p className="text-green-400/70 text-sm font-medium mt-1">{reward.businessName}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl px-5 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1">Redeemed on</p>
            <p className="text-white font-bold text-base">{fmtDateTime(redeemedAt!)}</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white mt-2"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            Done
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

// ── Wallet card (compact) ─────────────────────────────────────
function ActiveCard({
  reward,
  index,
  isRedeemed,
  redeemedAt,
  onRedeem,
}: {
  reward:     CustomerReward
  index:      number
  isRedeemed: boolean
  redeemedAt: string | null
  onRedeem:   () => void
}) {
  const meta   = MECHANIC_META[reward.mechanic]
  const bgFrom = reward.businessCoverFrom ?? meta.cardFrom
  const bgTo   = reward.businessCoverTo   ?? meta.cardTo
  const chip   = expiryChip(reward)
  const urgent = chip?.style.color === '#DC2626'

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
          boxShadow: isRedeemed
            ? '0 4px 20px rgba(34,197,94,0.20)'
            : urgent
              ? '0 4px 20px rgba(239,68,68,0.20)'
              : '0 4px 16px rgba(0,0,0,0.09)',
        }}
      >
        {/* Card gradient header */}
        <div
          className="relative px-4 pt-4 pb-4 overflow-hidden"
          style={{
            background: isRedeemed
              ? 'linear-gradient(145deg, #052E16, #14532D)'
              : `linear-gradient(145deg, ${bgFrom}, ${bgTo})`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

          {/* Top row */}
          <div className="relative flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-white/55 text-[10px] font-semibold uppercase tracking-widest truncate">
                {reward.businessName ?? reward.campaignName}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5 truncate">{reward.campaignName}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.28)', color: 'rgba(255,255,255,0.85)' }}>
                {meta.label}
              </span>
              <span className="text-lg leading-none">{reward.businessEmoji ?? meta.emoji}</span>
            </div>
          </div>

          {/* Reward text */}
          <p className="relative text-white text-lg font-extrabold leading-tight mb-3">{reward.reward}</p>

          {/* Bottom row: redeemed state OR redeem button */}
          {isRedeemed ? (
            <div className="relative flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-xs">✓</span>
              </div>
              <div>
                <p className="text-green-300 text-xs font-extrabold">Redeemed</p>
                <p className="text-green-400/60 text-[10px]">{fmtDateTime(redeemedAt!)}</p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-between">
              {chip && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={chip.style}>
                  {chip.text}
                </span>
              )}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onRedeem}
                className="ml-auto px-4 py-1.5 rounded-xl text-[12px] font-extrabold"
                style={{ background: 'rgba(255,255,255,0.95)', color: bgFrom }}
              >
                Redeem →
              </motion.button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isRedeemed && (
          <div className="bg-white px-4 py-2.5">
            <p className="text-[10px] text-gray-400">Won {timeAgo(reward.earnedAt)}</p>
          </div>
        )}
        {isRedeemed && (
          <div className="bg-green-50 px-4 py-2">
            <p className="text-[10px] text-green-600 font-medium">
              Thanks for visiting {reward.businessName}! 🎉
            </p>
          </div>
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
      <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.09)' }}>
        {/* Gradient header — same as active redeemed state */}
        <div
          className="relative px-4 pt-4 pb-4 overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

          {/* Top row */}
          <div className="relative flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-white/55 text-[10px] font-semibold uppercase tracking-widest truncate">
                {reward.businessName ?? reward.campaignName}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5 truncate">{reward.campaignName}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.28)', color: 'rgba(255,255,255,0.85)' }}>
                {meta.label}
              </span>
              <span className="text-lg leading-none">{reward.businessEmoji ?? meta.emoji}</span>
            </div>
          </div>

          {/* Reward text */}
          <p className="relative text-white text-lg font-extrabold leading-tight mb-3">{reward.reward}</p>

          {/* Redeemed row */}
          <div className="relative flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">✓</span>
            </div>
            <div>
              <p className="text-green-300 text-xs font-extrabold">Redeemed</p>
              <p className="text-green-400/60 text-[10px]">
                {reward.redeemedAt ? fmtDateTime(reward.redeemedAt) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-green-50 px-4 py-2">
          <p className="text-[10px] text-green-600 font-medium">
            Thanks for visiting {reward.businessName ?? 'the business'}! 🎉
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('active')
  const [rewards, setRewards] = useState<CustomerReward[]>(demo.rewards)

  // Which reward is currently open in full-screen
  const [openId, setOpenId] = useState<string | null>(null)

  // Countdown per reward id
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})

  // Session-redeemed: id → ISO timestamp
  const [sessionRedeemed, setSessionRedeemed] = useState<Record<string, string>>({})

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const running = Object.entries(countdowns).filter(([, s]) => s > 0)
    if (running.length === 0) {
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
          justDone.forEach(id => setSessionRedeemed(sr => ({ ...sr, [id]: now })))
          setRewards(rs => rs.map(r =>
            justDone.includes(r.id)
              ? { ...r, status: 'redeemed' as const, redeemedAt: now }
              : r
          ))
        }
        return next
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [JSON.stringify(Object.keys(countdowns))])

  const startRedeem = (id: string) => {
    setCountdowns(prev => ({ ...prev, [id]: 60 }))
    setOpenId(id)
  }

  const closeScreen = () => setOpenId(null)

  const openReward = openId ? rewards.find(r => r.id === openId) ?? null : null

  const pendingRewards = rewards
    .filter(r => r.status === 'pending' || sessionRedeemed[r.id])
    .sort((a, b) => {
      if (sessionRedeemed[a.id] && !sessionRedeemed[b.id]) return 1
      if (sessionRedeemed[b.id] && !sessionRedeemed[a.id]) return -1
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

      {/* ── Full-screen redemption overlay ──────────────────── */}
      <AnimatePresence>
        {openReward && (
          <RedemptionScreen
            reward={openReward}
            countdown={countdowns[openReward.id] ?? 0}
            redeemedAt={sessionRedeemed[openReward.id] ?? null}
            onClose={closeScreen}
          />
        )}
      </AnimatePresence>

      {/* ── Purple header ────────────────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-between mb-5">
          <div>
            <p className="text-purple-300 text-xs font-medium tracking-wide">Your Rewards</p>
            <h1 className="text-white text-xl font-extrabold mt-0.5">{firstName}'s Wallet</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
            {urgentCount > 0 && (
              <motion.div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <span className="text-[9px] font-black text-white">{urgentCount}</span>
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)' }}>
          <div className="flex divide-x divide-white/10">
            {[
              { value: pendingRewards.filter(r => !sessionRedeemed[r.id]).length, label: 'To Redeem' },
              { value: topStreak,                                                  label: 'Day Streak 🔥' },
              { value: `${(totalPoints / 1000).toFixed(1)}k`,                     label: 'Points ⭐' },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex-1 text-center py-4 px-2">
                <motion.p className="text-2xl font-black text-white" initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.18 + i * 0.05 }}>
                  {value}
                </motion.p>
                <p className="text-[10px] text-purple-300 font-semibold mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

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

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-t-3xl -mt-3 pt-5 min-h-screen">
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
                        key={r.id} reward={r} index={i}
                        isRedeemed={!!sessionRedeemed[r.id]}
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
