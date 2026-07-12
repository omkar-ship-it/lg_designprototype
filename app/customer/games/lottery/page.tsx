'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { MECHANIC_META, hexToRgb, hexMix } from '@/lib/utils'

const meta = MECHANIC_META.lottery
const accentRgb = hexToRgb(meta.cardFrom).join(',')
const deepRgb = hexToRgb(meta.cardTo).join(',')

const DRAW_DATE      = '31 Jul 2026'
const JACKPOT_PRIZE  = 'Free Month of Coffee 👑'
const BUSINESS_NAME  = 'The Daily Grind'
const CAMPAIGN_NAME  = 'Daily Grind Draw'
const INITIAL_TICKETS = 3   // tickets already owned before this visit

type State = 'idle' | 'receiving' | 'received'

const SPARKLE_POS = [
  { top: '10%', left: '6%'  }, { top: '16%', right: '7%'  },
  { top: '42%', left: '3%'  }, { top: '38%', right: '4%'  },
  { bottom: '38%', left: '8%'  }, { bottom: '30%', right: '7%' },
]

function padTicketNo(n: number) {
  return String(n).padStart(4, '0')
}

export default function LotteryPage() {
  const router = useRouter()
  const [state, setState]     = useState<State>('idle')
  const [tickets, setTickets] = useState(INITIAL_TICKETS)

  const ticketNo = useMemo(() => Math.floor(1000 + Math.random() * 9000), [])
  const serialNo = useMemo(() => `LG-${Math.floor(10000 + Math.random() * 90000)}`, [])

  const receiveTicket = () => {
    if (state !== 'idle') return
    setState('receiving')
    setTimeout(() => {
      setTickets(t => t + 1)
      setState('received')
    }, 1200)
  }

  // Count-down to draw date
  const daysUntilDraw = Math.max(0, Math.ceil(
    (new Date('2026-07-31').getTime() - new Date('2026-06-15').getTime()) / 86400000
  ))

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, #FFFFFF 0%, ${meta.cardFrom}0F 55%, ${meta.cardFrom}1F 100%)` }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${accentRgb},0.14) 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      <div className="absolute bottom-32 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${deepRgb},0.12) 0%, transparent 70%)`, filter: 'blur(48px)' }} />

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute pointer-events-none select-none" style={{ ...pos, color: `rgba(${accentRgb},0.4)` }}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.2, 0.8], rotate: [0, 12, 0] }}
          transition={{ duration: 2.5 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
          ✦
        </motion.div>
      ))}

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
      </button>
      <p className="absolute top-14 right-4 text-[10px] text-gray-400 z-20">Lucky Draw</p>

      <div className="flex-1 flex flex-col justify-center relative z-10 gap-6 mt-8">

        <AnimatePresence mode="wait">
          {state !== 'received' ? (
            <motion.div key="pre" className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Jackpot hero */}
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.06, 1], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-3 select-none"
                >
                  🎟️
                </motion.div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-1">{CAMPAIGN_NAME}</p>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{JACKPOT_PRIZE}</h1>
                <p className="text-sm text-gray-500">{BUSINESS_NAME}</p>
              </div>

              {/* Draw countdown */}
              <div className="rounded-2xl p-4 text-center"
                style={{ background: `rgba(${accentRgb},0.08)`, border: `1px solid rgba(${accentRgb},0.3)` }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: meta.cardFrom }}>Draw in</p>
                <p className="text-4xl font-black" style={{ color: meta.cardFrom }}>{daysUntilDraw}</p>
                <p className="text-xs text-gray-400 mt-0.5">days · {DRAW_DATE}</p>
              </div>

              {/* Your tickets */}
              <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Your tickets</p>
                    <p className="text-3xl font-black text-gray-900">{tickets}
                      <span className="text-sm font-semibold text-gray-400 ml-1">entered</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">More visits</p>
                    <p className="text-xs font-bold text-gray-600">= more tickets</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={receiveTicket}
                disabled={state === 'receiving'}
                className="w-full py-5 rounded-2xl text-base font-extrabold z-10"
                style={{
                  background: state === 'receiving' ? '#F3F4F6' : `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})`,
                  color: state === 'receiving' ? '#9CA3AF' : 'white',
                  boxShadow: state !== 'receiving' ? `0 8px 32px rgba(${accentRgb},0.4)` : 'none',
                }}
                animate={state === 'idle'
                  ? { boxShadow: [`0 8px 32px rgba(${accentRgb},0.35)`, `0 8px 52px rgba(${accentRgb},0.65)`, `0 8px 32px rgba(${accentRgb},0.35)`] }
                  : {}}
                transition={{ duration: 1.8, repeat: state === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
              >
                {state === 'receiving' ? '✨ Generating ticket…' : '🎟️ Get My Ticket'}
              </motion.button>

            </motion.div>
          ) : (
            /* Received state — ticket receipt */
            <motion.div key="post" className="flex flex-col gap-5"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}>

              {/* Confirmation */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                  className="text-5xl mb-2 select-none"
                >
                  🎉
                </motion.div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">You're in!</h2>
                <p className="text-sm text-gray-500">Good luck on {DRAW_DATE}</p>
              </div>

              {/* Physical ticket */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.2 }}
                className="rounded-3xl overflow-hidden"
                style={{
                  border: `2px solid rgba(${accentRgb},0.5)`,
                  boxShadow: `0 0 40px rgba(${accentRgb},0.12), 0 16px 40px rgba(0,0,0,0.15)`,
                }}
              >
                {/* Ticket header */}
                <div className="relative px-5 py-4 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${meta.cardFrom} 0%, ${meta.cardTo} 100%)` }}>
                  <div className="absolute inset-0 opacity-[0.08]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
                  {/* Sheen */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }}
                    animate={{ x: ['-120%', '200%'] }}
                    transition={{ duration: 1.8, ease: 'linear' }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">Lucky Draw</p>
                      <p className="text-lg font-extrabold text-white">🎟️ {CAMPAIGN_NAME}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/50 font-bold uppercase mb-0.5">{BUSINESS_NAME}</p>
                      <p className="text-[10px] font-bold text-white/70">Draw: {DRAW_DATE}</p>
                    </div>
                  </div>
                </div>

                {/* Ticket body */}
                <div className="px-5 py-6 text-center"
                  style={{ background: `linear-gradient(180deg, ${hexMix(meta.cardTo, '#000000', 0.6)} 0%, #0D0B1E 100%)` }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Your ticket number</p>
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.5 }}
                    className="text-6xl font-black tracking-widest mb-1"
                    style={{ color: meta.cardFrom, textShadow: `0 0 30px rgba(${accentRgb},0.5)` }}
                  >
                    #{padTicketNo(ticketNo)}
                  </motion.p>
                  <p className="text-xs text-white/30">
                    Ticket {tickets} of yours · Draw {DRAW_DATE}
                  </p>
                </div>

                {/* Perforated line */}
                <div style={{ borderTop: `2px dashed rgba(${accentRgb},0.3)` }} />

                {/* Ticket footer */}
                <div className="px-5 py-2.5 flex items-center justify-between"
                  style={{ background: '#0D0B1E' }}>
                  <p className="font-mono text-[9px] text-white/20 tracking-wider">{serialNo}</p>
                  <p className="text-[9px] text-white/15">Terms apply</p>
                </div>
              </motion.div>

              {/* Jackpot reminder */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-2xl px-4 py-3 text-center"
                style={{ background: `rgba(${accentRgb},0.08)`, border: `1px solid rgba(${accentRgb},0.25)` }}
              >
                <p className="text-xs text-gray-500">You could win</p>
                <p className="text-sm font-bold" style={{ color: meta.cardFrom }}>{JACKPOT_PRIZE}</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.back()}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gray-100 border border-gray-200 text-gray-700"
              >
                ← Back to {BUSINESS_NAME}
              </motion.button>

              <p className="text-xs text-gray-400 text-center">
                We'll notify you if you win on {DRAW_DATE}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
