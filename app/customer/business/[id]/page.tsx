'use client'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Phone, ExternalLink, Clock } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

const MECHANIC_GAME_LINKS: Record<MechanicType, string> = {
  stamp:   '/customer/games/stamp?campaign=camp-2',
  spin:    '/customer/games/spin?campaign=camp-1',
  shake:   '/customer/games/shake?campaign=camp-1',
  dice:    '/customer/games/dice?campaign=camp-3',
  lottery: '/customer/games/lottery?campaign=camp-5',
}

// Mock loyalty progress per business for the logged-in user
const STAMP_PROGRESS: Record<string, { stamps: number; total: number }> = {
  'biz-amber':     { stamps: 2, total: 8 },
  'biz-noir':      { stamps: 5, total: 8 },
  'biz-ironforge': { stamps: 0, total: 10 },
  'biz-lustre':    { stamps: 0, total: 8 },
  'biz-verde':     { stamps: 0, total: 8 },
  'biz-glamspa':   { stamps: 3, total: 8 },
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Cafe:       { bg: '#FEF3C7', text: '#92400E' },
  Salon:      { bg: '#FCE7F3', text: '#9D174D' },
  Gym:        { bg: '#D1FAE5', text: '#065F46' },
  Restaurant: { bg: '#DBEAFE', text: '#1E40AF' },
  Jewellery:  { bg: '#EDE9FE', text: '#5B21B6' },
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const biz = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]
  const catColor = CATEGORY_COLORS[biz.category] ?? { bg: '#F3F4F6', text: '#374151' }
  const progress = STAMP_PROGRESS[biz.id]
  const hasStamps = biz.mechanics.some(m => m.type === 'stamp')

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* ── Cover ─────────────────────────────────────────────── */}
      <div className="relative h-[260px]" style={{ background: `linear-gradient(135deg, ${biz.coverFrom}, ${biz.coverTo})` }}>

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }}
        />

        {/* Floating emoji */}
        <motion.span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] opacity-20 select-none pointer-events-none"
          animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {biz.coverEmoji}
        </motion.span>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Mechanic pills — bottom-left */}
        <div className="absolute bottom-10 left-4 flex flex-wrap gap-1.5 z-10">
          {biz.mechanics.map(m => {
            const meta = MECHANIC_META[m.type]
            return (
              <span
                key={m.type}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.40)', color: 'rgba(255,255,255,0.9)' }}
              >
                {meta.label}
              </span>
            )
          })}
        </div>

        {/* White scallop edge — transitions cover into body */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem] z-10" />
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="px-5 pt-3">

        {/* Name + distance + category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-2 mb-1"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-extrabold text-gray-900">{biz.name}</h1>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: catColor.bg, color: catColor.text }}
              >
                {biz.category}
              </span>
            </div>
          </div>
          <span className="text-sm text-gray-400 shrink-0 mt-1">{biz.distance}</span>
        </motion.div>

        {/* Location row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-1.5 text-xs text-gray-500"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{biz.location}</span>
        </motion.div>

        {/* Open status + phone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.07 }}
          className="flex items-center gap-3 mb-3 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-green-600 font-semibold">{biz.openUntil}</span>
          </div>
          <span className="text-gray-300">·</span>
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="w-3 h-3" />
            <span>{biz.phone}</span>
          </div>
        </motion.div>

        {/* Star + Reviews + Google Reviews link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.09 }}
          className="flex items-center gap-2 mb-4"
        >
          {/* Stars */}
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(n => (
              <Star
                key={n}
                className="w-3.5 h-3.5"
                fill={n <= Math.round(biz.rating) ? '#FBBF24' : 'none'}
                color={n <= Math.round(biz.rating) ? '#FBBF24' : '#D1D5DB'}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-800">{biz.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({biz.reviews})</span>
          <a
            href="#"
            className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span
              className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] font-black"
              style={{ background: 'linear-gradient(135deg, #4285F4, #0F9D58)' }}
            >
              G
            </span>
            Google Reviews
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.11 }}
          className="text-sm text-gray-500 mb-5 leading-relaxed"
        >
          {biz.tagline}
        </motion.p>

        {/* Loyalty progress — only if they have stamps at this biz */}
        {hasStamps && progress && progress.stamps > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="rounded-2xl p-4 mb-5 border border-amber-100"
            style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-xs font-bold text-amber-800">Your Stamp Progress</p>
                <p className="text-[11px] text-amber-600 mt-0.5">{progress.total - progress.stamps} more to your next reward</p>
              </div>
              <span className="text-2xl font-black text-amber-700">{progress.stamps}<span className="text-sm font-semibold text-amber-400">/{progress.total}</span></span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: progress.total }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all ${i < progress.stamps ? 'bg-amber-500' : 'bg-amber-200'}`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Membership CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
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

        {/* Games & Rewards section */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
          className="text-base font-extrabold text-gray-900 mb-1"
        >
          Games &amp; Rewards
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-xs text-gray-400 mb-4"
        >
          Play and earn rewards on every visit
        </motion.p>

        <div className="space-y-4 mb-4">
          {biz.mechanics.map((m, i) => {
            const meta = MECHANIC_META[m.type]
            const gameLink = MECHANIC_GAME_LINKS[m.type]
            return (
              <motion.div
                key={m.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.20 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
              >
                <Link href={gameLink}>
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-shadow cursor-pointer"
                  >
                    {/* Card cover */}
                    <div
                      className="relative h-32 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                    >
                      {/* Dot pattern */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                      />
                      <motion.span
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-20 select-none"
                        animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {meta.emoji}
                      </motion.span>
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: meta.badgeBg, color: meta.badgeText }}
                      >
                        {meta.label}
                      </span>
                      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-sm">
                        {meta.emoji}
                      </div>
                    </div>
                    {/* Text */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{m.label}</h3>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{m.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700">Play now</span>
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-purple-400 text-xs"
                        >
                          →
                        </motion.span>
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
