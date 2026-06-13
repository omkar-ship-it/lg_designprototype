'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BottomNav } from '@/components/customer/bottom-nav'
import { campaigns, business } from '@/lib/mock-data'
import { getMechanicEmoji, getMechanicLabel, getMechanicColor, formatDate } from '@/lib/utils'

const active = campaigns.filter(c => c.status === 'active')

export default function CustomerHomePage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="pt-12 px-5 pb-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl">{business.logo}</div>
          <div>
            <h1 className="text-lg font-extrabold text-white">{business.name}</h1>
            <p className="text-xs text-c-text-2">{business.tagline}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-c-text-2 mb-0.5">{active.length} games live right now</p>
            <p className="text-sm font-bold text-white">Pick a game & win rewards! 🎉</p>
          </div>
          <div className="text-3xl float">🧞</div>
        </motion.div>
      </div>

      {/* Active campaigns */}
      <div className="px-5">
        <h2 className="text-xs font-bold text-c-text-2 uppercase tracking-widest mb-3">Live Games</h2>
        <div className="space-y-3">
          {active.map((c, i) => {
            const color = getMechanicColor(c.mechanic)
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.2, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <Link href={`/customer/campaigns/${c.id}`}>
                  <div className="relative rounded-2xl overflow-hidden glass border border-white/10 hover:border-white/20 transition-all active:scale-98">
                    {/* Color accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                        >
                          {getMechanicEmoji(c.mechanic)}
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-white mb-1">{c.name}</h3>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2"
                            style={{ background: `${color}20`, color }}>
                            {getMechanicLabel(c.mechanic)}
                          </div>
                          <p className="text-[10px] text-white/40">Ends {formatDate(c.endDate)}</p>
                        </div>
                        <div className="text-white/50 text-lg">→</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between text-[10px] text-white/40">
                        <span>Enter staff PIN to play</span>
                        <span style={{ color }}>{c.rewardsClaimed} rewards won today</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
