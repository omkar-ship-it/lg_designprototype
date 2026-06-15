'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CalendarDays, Users, Gift } from 'lucide-react'
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <CalendarDays className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Start</p>
            <p className="text-xs font-bold text-gray-800">{fmtDate(mechanic.startDate)}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Players</p>
            <p className="text-xs font-bold text-gray-800">{mechanic.participants.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <Gift className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Rewards</p>
            <p className="text-xs font-bold text-gray-800">{mechanic.totalRewards.toLocaleString()}</p>
          </div>
        </div>

        {/* Duration bar */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Duration</p>
          <p className="text-sm font-semibold text-gray-800">
            {fmtDate(mechanic.startDate)} → {fmtDate(mechanic.endDate)}
          </p>
        </div>

        {/* Business name */}
        <p className="text-xs text-gray-400 mb-1">Offered by</p>
        <p className="text-sm font-bold text-gray-800 mb-8">{biz.name}</p>

        {/* PLAY CTA */}
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
