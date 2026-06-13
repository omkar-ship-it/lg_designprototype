'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customers, business } from '@/lib/mock-data'
import { getMechanicEmoji, formatDate, formatRelativeTime } from '@/lib/utils'

const demo = customers[0]

export default function ProfilePage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="pt-12 px-5 pb-6">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-c-purple/20 border-2 border-c-purple/40 flex items-center justify-center text-4xl font-extrabold text-c-purple mx-auto mb-4">
            {demo.name[0]}
          </div>
          <h1 className="text-xl font-extrabold text-white">{demo.name}</h1>
          <p className="text-sm text-c-text-2 mt-1">{demo.phone}</p>
          <p className="text-xs text-white/30 mt-0.5">Member since {formatDate(demo.joinedAt)}</p>
        </motion.div>

        {/* Loyalty stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: 'Visits', value: demo.totalVisits, icon: '📅' },
            { label: 'Games', value: demo.gamesPlayed, icon: '🎮' },
            { label: 'Rewards', value: demo.rewardsEarned, icon: '🎁' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[10px] text-c-text-2">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Business info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-xl">{business.logo}</div>
            <div>
              <p className="text-sm font-bold text-white">{business.name}</p>
              <p className="text-xs text-c-text-2">{business.category}</p>
            </div>
          </div>
          <div className="text-xs text-white/40 leading-relaxed">{business.hours}</div>
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xs font-bold text-c-text-2 uppercase tracking-widest mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {demo.gameHistory.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.2 }}
                className="glass rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                  {getMechanicEmoji(g.mechanic)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{g.campaignName}</p>
                  <p className="text-[10px] text-white/30">{formatRelativeTime(g.playedAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  {g.won ? (
                    <>
                      <p className="text-[10px] font-bold text-c-gold">Won!</p>
                      <p className="text-[9px] text-white/40">{g.reward}</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-white/30">No win</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 glass rounded-2xl p-4">
          <h2 className="text-xs font-bold text-c-text-2 uppercase tracking-widest mb-3">Profile</h2>
          {[
            { label: 'Email', value: demo.email },
            { label: 'Date of Birth', value: formatDate(demo.dob) },
            { label: 'Last Visit', value: formatRelativeTime(demo.lastVisit) },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-xs text-white/40">{item.label}</span>
              <span className="text-xs text-white font-medium">{item.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
