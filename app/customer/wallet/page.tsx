'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers } from '@/lib/mock-data'
import { MECHANIC_META, formatDate } from '@/lib/utils'
import type { CustomerReward } from '@/lib/types'

const demo = customers[0]
const firstName = demo.name.split(' ')[0]
type Tab = 'active' | 'history'

// Stamp grid visualiser — circular stamps
function StampGrid({ filled }: { filled: number }) {
  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={i < filled ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: i * 0.04 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
            i < filled
              ? 'bg-amber-400 border-amber-500 shadow-sm shadow-amber-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          {i < filled ? '☕' : <span className="text-[10px] text-gray-300 font-bold">{i + 1}</span>}
        </motion.div>
      ))}
    </div>
  )
}

function ActiveRewardCard({ reward, index }: { reward: CustomerReward; index: number }) {
  const meta = MECHANIC_META[reward.mechanic]
  const isStamp = reward.mechanic === 'stamp'
  // Fake stamp count for demo
  const stampsFilled = 6

  return (
    <motion.div
      key={reward.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: index * 0.08 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      {/* Cover */}
      <div
        className="relative h-28 flex items-end p-3"
        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
      >
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: meta.badgeBg, color: meta.badgeText }}
        >
          {meta.label}
        </span>
        <div className="absolute bottom-3 right-3 text-2xl">{meta.emoji}</div>
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-0.5">{reward.campaignName}</p>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{reward.reward}</h3>
        {isStamp && <StampGrid filled={stampsFilled} />}
        <p className="text-[10px] text-gray-400 mt-2">Expires {formatDate('2026-06-30')}</p>
      </div>
    </motion.div>
  )
}

function HistoryRewardCard({ reward, index }: { reward: CustomerReward; index: number }) {
  const meta = MECHANIC_META[reward.mechanic]
  return (
    <motion.div
      key={reward.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: index * 0.08 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      <div className="flex gap-3 p-4">
        {/* Mini mechanic image */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: meta.badgeBg, color: meta.badgeText }}
            >
              {meta.label}
            </span>
            <span className="text-[10px] bg-orange-50 text-orange-500 font-semibold px-1.5 py-0.5 rounded-full">
              Expiring soon
            </span>
          </div>
          <p className="text-xs font-bold text-gray-900 truncate">{reward.campaignName}</p>
          <p className="text-[10px] text-gray-400">Last Visit: 5 days ago</p>
          <p className="text-xs text-gray-700 mt-1 font-medium">{reward.reward}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{reward.code}</span>
            <span className="text-[10px] text-gray-400">· Expires {formatDate('2026-06-30')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('active')

  const activeRewards  = demo.rewards.filter(r => r.status === 'pending')
  const historyRewards = demo.rewards.filter(r => r.status === 'redeemed')
  const shown = tab === 'active' ? activeRewards : historyRewards

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Purple header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #4C1D95, #5B21B6)' }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-300 text-xs">Welcome Back</p>
            <h1 className="text-white text-xl font-extrabold">
              {firstName} 👋
            </h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* White wallet summary card — spring-in with animated numbers */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="mx-0 bg-white rounded-2xl shadow-lg shadow-purple-200/40 p-4 flex items-center divide-x divide-gray-100"
        >
          <div className="flex-1 text-center pr-4">
            <motion.div
              className="text-2xl font-black text-purple-700"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
            >
              {activeRewards.length}
            </motion.div>
            <div className="text-xs text-gray-400 mt-0.5">Active rewards</div>
          </div>
          <div className="flex-1 text-center pl-4">
            <motion.div
              className="text-2xl font-black text-gray-700"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.25 }}
            >
              {historyRewards.length}
            </motion.div>
            <div className="text-xs text-gray-400 mt-0.5">Redeemed</div>
          </div>
        </motion.div>
      </div>

      {/* Tabs + content */}
      <div className="px-5 pt-5">
        {/* Pill tabs */}
        <div className="flex items-center gap-2 mb-5 bg-gray-100 rounded-xl p-1">
          {(['active', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-white text-purple-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'active' ? 'Active' : 'History'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {shown.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-gray-400 text-sm"
              >
                {tab === 'active' ? 'No active rewards. Play games to win!' : 'No redeemed rewards yet.'}
              </motion.div>
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'active' ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 'active' ? 40 : -40 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="space-y-4"
              >
                {shown.map((r, i) =>
                  tab === 'active'
                    ? <ActiveRewardCard key={r.id} reward={r} index={i} />
                    : <HistoryRewardCard key={r.id} reward={r} index={i} />
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
