'use client'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Gift, Stamp } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

// Map mechanic type to game route + campaign query
const MECHANIC_GAME_LINKS: Record<MechanicType, string> = {
  stamp:   '/customer/games/stamp?campaign=camp-2',
  spin:    '/customer/games/spin?campaign=camp-1',
  shake:   '/customer/games/shake?campaign=camp-1',
  dice:    '/customer/games/dice?campaign=camp-3',
  lottery: '/customer/games/lottery?campaign=camp-5',
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const biz = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Cover section */}
      <div
        className="relative h-[220px]"
        style={{ background: `linear-gradient(135deg, ${biz.coverFrom}, ${biz.coverTo})` }}
      >
        {/* Floating emoji bg */}
        <motion.span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20 select-none"
          animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {biz.coverEmoji}
        </motion.span>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Business name in header */}
        <div className="absolute top-12 left-0 right-0 text-center z-10 pointer-events-none">
          <span className="text-white font-bold text-base drop-shadow">{biz.name}</span>
        </div>

        {/* Rating badge top-right */}
        <div className="absolute top-12 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-800">{biz.rating.toFixed(1)}</span>
        </div>

        {/* Mechanic pills bottom-left */}
        <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5 z-10">
          {biz.mechanics.map(m => {
            const meta = MECHANIC_META[m.type]
            return (
              <span
                key={m.type}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: meta.badgeBg, color: meta.badgeText }}
              >
                {meta.label}
              </span>
            )
          })}
        </div>

        {/* Floating action buttons — right edge bottom */}
        <div className="absolute right-4 bottom-3 flex flex-col gap-2 z-10">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <Gift className="w-4 h-4 text-purple-700" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
            <Stamp className="w-4 h-4 text-purple-700" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-5">
        {/* Name + distance row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-2 mb-2"
        >
          <h1 className="text-xl font-extrabold text-gray-900">{biz.name}</h1>
          <span className="text-sm text-gray-400 shrink-0 mt-1">{biz.distance}</span>
        </motion.div>

        {/* Location + reviews */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-2 text-xs text-gray-500"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{biz.location}</span>
          <span>·</span>
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-700">{biz.rating.toFixed(1)}</span>
          <span>({biz.reviews} reviews)</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="text-sm text-gray-500 mb-5 leading-relaxed"
        >
          {biz.tagline}
        </motion.p>

        {/* Membership CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="w-full py-3.5 rounded-full text-sm font-bold text-white mb-6 shadow-lg shadow-purple-200/60"
          style={{ background: 'linear-gradient(90deg, #4C1D95, #7C3AED)' }}
        >
          Checkout Membership Plans
          <motion.span
            className="inline-block ml-2"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        </motion.button>

        {/* Mechanics section */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base font-extrabold text-gray-900 mb-4"
        >
          Mechanics Live Here
        </motion.h2>

        <div className="space-y-4">
          {biz.mechanics.map((m, i) => {
            const meta = MECHANIC_META[m.type]
            const gameLink = MECHANIC_GAME_LINKS[m.type]
            return (
              <motion.div
                key={m.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
              >
                <Link href={gameLink}>
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-shadow cursor-pointer"
                  >
                    {/* Cover */}
                    <div
                      className="relative h-32 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                    >
                      <motion.span
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-20 select-none"
                        animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {meta.emoji}
                      </motion.span>
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: meta.badgeBg, color: meta.badgeText }}
                      >
                        {meta.label}
                      </span>
                      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                        {meta.emoji}
                      </div>
                    </div>
                    {/* Text + CTA */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{m.label}</h3>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{m.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700">Play now</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-purple-400 text-xs"
                        >
                          →
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
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
