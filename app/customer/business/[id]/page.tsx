'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Phone, ExternalLink, CalendarDays, Users, Gift } from 'lucide-react'
import { BottomNav } from '@/components/customer/bottom-nav'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType, CustomerBusiness } from '@/lib/types'

const MECHANIC_GAME_LINKS: Record<MechanicType, string> = {
  stamp:   '/customer/games/stamp',
  spin:    '/customer/games/spin',
  shake:   '/customer/games/shake',
  dice:    '/customer/games/dice',
  lottery: '/customer/games/lottery',
  checkin: '/customer/games/checkin',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#D1FAE5', text: '#065F46', label: 'Active'  },
  paused: { bg: '#FEF3C7', text: '#92400E', label: 'Paused'  },
  draft:  { bg: '#E5E7EB', text: '#374151', label: 'Draft'   },
  ended:  { bg: '#EDE9FE', text: '#5B21B6', label: 'Ended'   },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Cafe:       { bg: '#FEF3C7', text: '#92400E' },
  Salon:      { bg: '#FCE7F3', text: '#9D174D' },
  Gym:        { bg: '#D1FAE5', text: '#065F46' },
  Restaurant: { bg: '#DBEAFE', text: '#1E40AF' },
  Jewellery:  { bg: '#EDE9FE', text: '#5B21B6' },
}

type Mechanic = CustomerBusiness['mechanics'][number]

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const biz = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]
  const catColor = CATEGORY_COLORS[biz.category] ?? { bg: '#F3F4F6', text: '#374151' }

  // Code entry state
  const [activeCampaign, setActiveCampaign] = useState<Mechanic | null>(null)
  const [digits, setDigits] = useState(['', '', ''])
  const ref0 = useRef<HTMLInputElement>(null)
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const digitRefs = [ref0, ref1, ref2]

  const openCampaign = (m: Mechanic) => {
    setActiveCampaign(m)
    setDigits(['', '', ''])
    setTimeout(() => ref0.current?.focus(), 350)
  }

  const closeCampaign = () => {
    setActiveCampaign(null)
    setDigits(['', '', ''])
  }

  const handleDigitChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = clean
    setDigits(next)
    if (clean && i < 2) digitRefs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digitRefs[i - 1].current?.focus()
    }
  }

  const joinCampaign = () => {
    if (!activeCampaign || digits.some(d => !d)) return
    closeCampaign()
    const base = MECHANIC_GAME_LINKS[activeCampaign.type]
    // Stamp: code is the participation code — auto-apply on landing
    router.push(activeCampaign.type === 'stamp' ? `${base}?stamp=1` : base)
  }

  const activeMeta = activeCampaign ? MECHANIC_META[activeCampaign.type] : null
  const codeComplete = digits.every(d => !!d)

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* ── Cover ───────────────────────────────────────────────── */}
      <div className="relative h-[300px] overflow-hidden">
        <img src={biz.coverImage} alt={biz.name} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.12) 0%, ${biz.coverFrom}CC 55%, ${biz.coverTo}F0 100%)` }}
        />

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Rating */}
        <div className="absolute top-12 right-4 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-white">{biz.rating.toFixed(1)}</span>
        </div>

        {/* Business name */}
        <div className="absolute bottom-14 left-4 right-4 z-10">
          <p className="text-white/65 text-[10px] font-bold uppercase tracking-widest mb-1">{biz.category}</p>
          <h2 className="text-white text-[22px] font-extrabold drop-shadow-lg leading-tight">{biz.name}</h2>
        </div>

        {/* Mechanic pills */}
        <div className="absolute bottom-5 left-4 flex flex-wrap gap-1.5 z-10">
          {biz.mechanics.map(m => (
            <span
              key={m.type}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}
            >
              {MECHANIC_META[m.type].label}
            </span>
          ))}
        </div>

        {/* Scallop */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem] z-10" />
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="px-5 pt-3">

        {/* Category + distance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2 mb-1"
        >
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: catColor.bg, color: catColor.text }}>
            {biz.category}
          </span>
          <span className="text-sm text-gray-400 font-medium">{biz.distance}</span>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-1.5 text-xs text-gray-500"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{biz.location}</span>
        </motion.div>

        {/* Open + phone */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.07 }}
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

        {/* Stars + Google Reviews */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.09 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(n => (
              <Star key={n} className="w-3.5 h-3.5"
                fill={n <= Math.round(biz.rating) ? '#FBBF24' : 'none'}
                color={n <= Math.round(biz.rating) ? '#FBBF24' : '#D1D5DB'} />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-800">{biz.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({biz.reviews})</span>
          <a href="#" className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <span className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] font-black"
              style={{ background: 'linear-gradient(135deg, #4285F4, #0F9D58)' }}>G</span>
            Google Reviews
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.11 }}
          className="text-sm text-gray-500 mb-6 leading-relaxed"
        >
          {biz.tagline}
        </motion.p>

        {/* ── Loyalty Campaigns ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.13 }}
          className="flex items-baseline justify-between mb-1"
        >
          <h2 className="text-base font-extrabold text-gray-900">Loyalty Campaigns</h2>
          <span className="text-[11px] text-gray-400">{biz.mechanics.length} active</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-xs text-gray-400 mb-4"
        >
          Ask the staff for a code and tap a campaign to participate
        </motion.p>

        <div className="space-y-4 mb-4">
          {biz.mechanics.map((m, i) => {
            const meta = MECHANIC_META[m.type]
            return (
              <motion.div
                key={m.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.17 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
              >
                <motion.div
                  onClick={() => openCampaign(m)}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-shadow cursor-pointer"
                >
                  {/* Cover */}
                  <div className="relative h-32 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <motion.span
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-20 select-none pointer-events-none"
                      animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                      transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {meta.emoji}
                    </motion.span>
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: meta.badgeBg, color: meta.badgeText }}>
                      {meta.label}
                    </span>
                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: STATUS_STYLES[m.status]?.bg, color: STATUS_STYLES[m.status]?.text }}
                    >
                      {STATUS_STYLES[m.status]?.label}
                    </span>
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-sm">
                      {meta.emoji}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{m.label}</h3>
                      {m.type === 'checkin' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          +100 pts / visit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{m.description}</p>

                    {/* Campaign details */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <CalendarDays className="w-3 h-3 shrink-0 text-gray-400" />
                        <span>{fmtDate(m.startDate)} – {fmtDate(m.endDate)}</span>
                      </div>
                      <span className="text-gray-200">|</span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Users className="w-3 h-3 shrink-0 text-gray-400" />
                        <span>{m.participants.toLocaleString()} participants</span>
                      </div>
                      <span className="text-gray-200">|</span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Gift className="w-3 h-3 shrink-0 text-gray-400" />
                        <span>{m.totalRewards.toLocaleString()} rewards</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 tracking-wide">CODE</span>
                        <span className="text-xs font-bold text-purple-700">Join with code</span>
                      </div>
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
              </motion.div>
            )
          })}
        </div>
      </div>

      <BottomNav />

      {/* ── 3-digit code entry sheet ───────────────────────────── */}
      <AnimatePresence>
        {activeCampaign && activeMeta && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCampaign}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto z-50 rounded-t-3xl overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #1E0A5C 0%, #0D0B1E 100%)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="px-6 pt-5 pb-10">
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                {/* Campaign identity */}
                <div className="text-center mb-7">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${activeMeta.cardFrom}, ${activeMeta.cardTo})` }}
                  >
                    {activeMeta.emoji}
                  </motion.div>
                  <h3 className="text-lg font-extrabold text-white mb-1">{activeCampaign.label}</h3>
                  <p className="text-sm text-white/40 leading-snug">
                    Enter the 3-digit code<br />from the staff to participate
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="flex gap-3 justify-center mb-7">
                  {[0, 1, 2].map(i => (
                    <input
                      key={i}
                      ref={digitRefs[i]}
                      value={digits[i]}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      maxLength={1}
                      inputMode="numeric"
                      className="w-[72px] h-[80px] text-center text-4xl font-black text-white outline-none rounded-2xl tracking-widest"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: digits[i]
                          ? '2px solid rgba(167,139,250,0.8)'
                          : '2px solid rgba(255,255,255,0.12)',
                        transition: 'border-color 0.15s ease',
                        boxShadow: digits[i] ? '0 0 0 4px rgba(139,92,246,0.15)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={joinCampaign}
                  disabled={!codeComplete}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: codeComplete
                      ? `linear-gradient(135deg, ${activeMeta.cardFrom}, ${activeMeta.cardTo})`
                      : 'rgba(255,255,255,0.08)',
                    color: codeComplete ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: codeComplete ? `0 8px 28px ${activeMeta.cardFrom}55` : 'none',
                  }}
                >
                  {codeComplete ? `Join ${activeCampaign.label} →` : 'Enter code above'}
                </motion.button>

                <button
                  onClick={closeCampaign}
                  className="w-full mt-3 py-3 text-white/30 text-sm hover:text-white/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
