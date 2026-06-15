'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Users } from 'lucide-react'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

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
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string; type: string }> }) {
  const { id, type } = use(params)
  const router = useRouter()

  const biz      = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]
  const mechanic = biz.mechanics.find(m => m.type === type) ?? biz.mechanics[0]
  const meta     = MECHANIC_META[mechanic.type as MechanicType]

  // OTP state
  const [showOTP, setShowOTP] = useState(false)
  const [digits, setDigits]   = useState(['', '', ''])
  const ref0 = useRef<HTMLInputElement>(null)
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const digitRefs = [ref0, ref1, ref2]

  const openOTP = () => {
    setDigits(['', '', ''])
    setShowOTP(true)
    setTimeout(() => ref0.current?.focus(), 350)
  }

  const closeOTP = () => {
    setShowOTP(false)
    setDigits(['', '', ''])
  }

  const handleDigitChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next  = [...digits]
    next[i]     = clean
    setDigits(next)
    if (clean && i < 2) digitRefs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) digitRefs[i - 1].current?.focus()
  }

  const joinCampaign = () => {
    if (digits.some(d => !d)) return
    closeOTP()
    const base = MECHANIC_GAME_LINKS[mechanic.type as MechanicType]
    router.push(mechanic.type === 'stamp' ? `${base}?stamp=1` : base)
  }

  const codeComplete = digits.every(d => !!d)

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* Cover */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <motion.span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-15 select-none pointer-events-none"
          animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {meta.emoji}
        </motion.span>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Mechanic badge */}
        <span
          className="absolute top-12 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10"
          style={{ background: meta.badgeBg, color: meta.badgeText }}
        >
          {meta.label}
        </span>

        {/* Status badge */}
        <span
          className="absolute bottom-6 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: STATUS_STYLES[mechanic.status]?.bg, color: STATUS_STYLES[mechanic.status]?.text }}
        >
          {STATUS_STYLES[mechanic.status]?.label}
        </span>

        {/* Scallop */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem]" />
      </div>

      {/* Body */}
      <div className="px-5 pt-3">

        {/* Title + points badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">{mechanic.label}</h1>
          {mechanic.type === 'checkin' && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 shrink-0 mt-0.5">
              +100 pts / visit
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{mechanic.description}</p>

        {/* Stamp card layout */}
        {mechanic.type === 'stamp' && mechanic.stampsCollected !== undefined && mechanic.totalStamps ? (
          <div className="mb-6">
            {/* Physical card */}
            <div
              className="rounded-3xl overflow-hidden mb-4"
              style={{ boxShadow: `0 16px 48px ${meta.cardFrom}33, 0 0 0 1px ${meta.cardFrom}30` }}
            >
              {/* Card header */}
              <div
                className="relative px-5 py-4 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
              >
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[80px] opacity-10 select-none pointer-events-none leading-none">
                  {meta.emoji}
                </span>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] mb-0.5">Loyalty Card</p>
                    <p className="text-lg font-extrabold text-black/70">{biz.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-black/35 font-bold uppercase tracking-wide mb-0.5">Stamps</p>
                    <p className="text-4xl font-black text-black/65 leading-none">
                      {mechanic.stampsCollected}
                      <span className="text-base font-semibold text-black/30">/{mechanic.totalStamps}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Perforated line */}
              <div className="h-0" style={{ borderTop: `2px dashed ${meta.cardFrom}55` }} />

              {/* Stamp grid */}
              <div className="bg-white px-5 pt-5 pb-4">
                <div className="grid grid-cols-5 gap-2.5 mb-4">
                  {Array.from({ length: mechanic.totalStamps }, (_, i) => {
                    const n          = i + 1
                    const isFilled   = n <= mechanic.stampsCollected!
                    const isFinalPos = n === mechanic.totalStamps
                    return (
                      <div key={n} className="flex flex-col items-center relative">
                        <div className="relative w-12 h-12 mb-1">
                          {isFilled ? (
                            <div
                              className="absolute inset-0 rounded-full flex items-center justify-center text-xl"
                              style={{
                                background: isFinalPos
                                  ? `linear-gradient(145deg, ${meta.cardFrom}, ${meta.cardTo})`
                                  : `linear-gradient(145deg, ${meta.cardFrom}CC, ${meta.cardTo})`,
                                boxShadow: `0 4px 14px ${meta.cardFrom}55`,
                              }}
                            >
                              {isFinalPos ? '🏆' : meta.emoji}
                            </div>
                          ) : (
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB' }}
                            />
                          )}
                          {isFinalPos && !isFilled && (
                            <div className="absolute inset-0 rounded-full flex items-center justify-center text-lg opacity-30">
                              🏆
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{n}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span>{mechanic.stampsCollected} collected</span>
                  <span>{mechanic.totalStamps - mechanic.stampsCollected} more to go</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(mechanic.stampsCollected / mechanic.totalStamps) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Grand reward reveal */}
            {mechanic.finalReward && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">Complete for</p>
                  <p className="text-sm font-bold text-gray-800">{mechanic.finalReward}</p>
                </div>
              </div>
            )}

            {/* Compact stats row */}
            <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{fmtDate(mechanic.startDate)} – {fmtDate(mechanic.endDate)}</span>
              </div>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{mechanic.participants.toLocaleString()} players</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Prizes — spin / dice / shake */}
            {(mechanic.type === 'spin' || mechanic.type === 'dice' || mechanic.type === 'shake') && mechanic.prizes && mechanic.prizes.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-3">What you could win</p>
                <div className="flex flex-wrap gap-2">
                  {mechanic.prizes.map((p, i) => (
                    <span
                      key={i}
                      className="text-sm font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: `${meta.cardFrom}18`, color: meta.cardFrom }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lottery — draw date + tickets */}
            {mechanic.type === 'lottery' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Draw Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {mechanic.drawDate ? fmtDate(mechanic.drawDate) : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Your Tickets</p>
                  <p className="text-2xl font-black" style={{ color: meta.cardFrom }}>
                    {mechanic.userTickets ?? 0}
                    <span className="text-xs font-semibold text-gray-400 ml-1">tickets</span>
                  </p>
                </div>
              </div>
            )}

            {/* Check-in — streak + points */}
            {mechanic.type === 'checkin' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-2xl mb-0.5">🔥</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Streak</p>
                  <p className="text-2xl font-black text-gray-900">
                    {mechanic.checkInStreak ?? 0}
                    <span className="text-xs font-semibold text-gray-400 ml-1">days</span>
                  </p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-2xl mb-0.5">⭐</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Points</p>
                  <p className="text-2xl font-black text-gray-900">
                    {mechanic.totalPoints ?? 0}
                    <span className="text-xs font-semibold text-gray-400 ml-1">pts</span>
                  </p>
                </div>
              </div>
            )}

            {/* Duration + players */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{mechanic.participants.toLocaleString()} players</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {fmtDate(mechanic.startDate)} → {fmtDate(mechanic.endDate)}
              </p>
            </div>
          </>
        )}

        {/* Business name */}
        <p className="text-xs text-gray-400 mb-1">Offered by</p>
        <p className="text-sm font-bold text-gray-800 mb-8">{biz.name}</p>

        {/* PLAY CTA */}
        {mechanic.playedToday ? (
          <div className="w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-400 bg-gray-100 flex items-center justify-center gap-2">
            <span>✓</span> Played today · Come back tomorrow
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openOTP}
            className="w-full py-4 rounded-2xl font-bold text-base text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`,
              boxShadow: `0 8px 28px ${meta.cardFrom}55`,
            }}
          >
            Play Now {meta.emoji}
          </motion.button>
        )}
      </div>

      {/* OTP bottom sheet */}
      <AnimatePresence>
        {showOTP && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOTP}
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
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <div className="text-center mb-7">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
                  >
                    {meta.emoji}
                  </motion.div>
                  <h3 className="text-lg font-extrabold text-white mb-1">{mechanic.label}</h3>
                  <p className="text-sm text-white/40 leading-snug">
                    Enter the 3-digit code<br />from the staff to participate
                  </p>
                </div>

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
                        border: digits[i] ? '2px solid rgba(167,139,250,0.8)' : '2px solid rgba(255,255,255,0.12)',
                        transition: 'border-color 0.15s ease',
                        boxShadow: digits[i] ? '0 0 0 4px rgba(139,92,246,0.15)' : 'none',
                      }}
                    />
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={joinCampaign}
                  disabled={!codeComplete}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: codeComplete
                      ? `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`
                      : 'rgba(255,255,255,0.08)',
                    color: codeComplete ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: codeComplete ? `0 8px 28px ${meta.cardFrom}55` : 'none',
                  }}
                >
                  {codeComplete ? `Join ${mechanic.label} →` : 'Enter code above'}
                </motion.button>

                <button
                  onClick={closeOTP}
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
