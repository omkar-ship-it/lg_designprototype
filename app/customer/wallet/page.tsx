'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers } from '@/lib/mock-data'
import { getMechanicEmoji, formatRelativeTime } from '@/lib/utils'
import type { CustomerReward } from '@/lib/types'

const demo = customers[0]
type Tab = 'active' | 'redeemed'

function RewardCard({ reward }: { reward: CustomerReward }) {
  const [expanded, setExpanded] = useState(false)
  const isActive = reward.status === 'pending'

  return (
    <motion.div layout onClick={() => isActive && setExpanded(p => !p)}>
      <div className={`rounded-2xl overflow-hidden border transition-all ${isActive ? 'border-c-gold/30 cursor-pointer hover:border-c-gold/60' : 'border-white/10 opacity-60'}`}
        style={{ background: isActive ? 'linear-gradient(135deg, rgba(245,197,24,0.08), rgba(139,92,246,0.08))' : 'rgba(255,255,255,0.04)' }}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: isActive ? 'rgba(245,197,24,0.15)' : 'rgba(255,255,255,0.05)', border: isActive ? '1px solid rgba(245,197,24,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
              {getMechanicEmoji(reward.mechanic)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white">{reward.reward}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isActive ? 'bg-c-gold/15 text-c-gold' : 'bg-white/10 text-white/40'}`}>
                  {isActive ? 'Active' : 'Redeemed'}
                </span>
              </div>
              <p className="text-xs text-c-text-2 mt-0.5">{reward.campaignName}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{formatRelativeTime(reward.earnedAt)}</p>
            </div>
          </div>

          <AnimatePresence>
            {expanded && isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-center mb-3">
                    <p className="text-xs text-c-text-2 mb-1">Reward Code</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 font-mono text-sm text-c-gold font-bold tracking-widest">
                      {reward.code}
                    </div>
                  </div>
                  <p className="text-center text-xs text-white/30">Show this to staff to redeem your reward</p>
                  <div className="mt-3 w-full py-3 rounded-xl text-sm font-bold text-center text-v-bg"
                    style={{ background: 'linear-gradient(135deg, #F5C518, #F59E0B)' }}>
                    Show to Staff →
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('active')
  const rewards = demo.rewards.filter(r => tab === 'active' ? r.status === 'pending' : r.status === 'redeemed')

  return (
    <div className="min-h-screen pb-24">
      <div className="pt-12 px-5 pb-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-extrabold text-white">My Wallet</h1>
          <p className="text-sm text-c-text-2 mt-1">{demo.rewards.filter(r => r.status === 'pending').length} active rewards</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: 'Total Won', value: demo.rewardsEarned, icon: '🎁' },
            { label: 'Active', value: demo.rewards.filter(r => r.status === 'pending').length, icon: '✨' },
            { label: 'Redeemed', value: demo.rewards.filter(r => r.status === 'redeemed').length, icon: '✅' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[10px] text-c-text-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 glass rounded-xl p-1 mb-5">
          {(['active', 'redeemed'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-c-purple text-white' : 'text-white/40'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Rewards list */}
        <div className="space-y-3">
          <AnimatePresence>
            {rewards.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="text-5xl mb-3">🎁</div>
                <p className="text-sm text-c-text-2">
                  {tab === 'active' ? 'No active rewards. Play games to win!' : 'No redeemed rewards yet.'}
                </p>
              </motion.div>
            ) : (
              rewards.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <RewardCard reward={r} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
