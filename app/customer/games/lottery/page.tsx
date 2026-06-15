'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

const TIERS = [
  { name: 'Jackpot', emoji: '👑', reward: 'Free Month',      color: '#F5C518', probability: 0.02 },
  { name: 'Gold',    emoji: '🍳', reward: 'Free Breakfast',  color: '#F59E0B', probability: 0.08 },
  { name: 'Silver',  emoji: '☕', reward: 'Free Coffee',     color: '#9B93C8', probability: 0.25 },
  { name: 'Bronze',  emoji: '🏷️', reward: '₹50 Off',        color: '#CD7F32', probability: 0.35 },
] as const

const NO_WIN_TIER = { emoji: '❌', reward: 'No Win', color: 'rgba(255,255,255,0.15)' }

const ROWS = 3
const COLS = 3
const TOTAL = ROWS * COLS

type CellValue = { emoji: string; reward: string; color: string }
type State = 'idle' | 'scratching' | 'done'

const SPARKLE_POS = [
  { top: '12%', left: '6%' }, { top: '20%', right: '7%' },
  { top: '50%', left: '3%' }, { top: '45%', right: '4%' },
  { bottom: '35%', left: '8%' }, { bottom: '26%', right: '7%' },
]

function generateTicket(): CellValue[] {
  const r = Math.random()
  let cumulative = 0
  let winTier: typeof TIERS[number] | null = null
  for (const tier of TIERS) {
    cumulative += tier.probability
    if (r < cumulative) { winTier = tier; break }
  }

  const grid: CellValue[] = Array(TOTAL).fill(null).map(() => ({
    emoji: NO_WIN_TIER.emoji, reward: NO_WIN_TIER.reward, color: NO_WIN_TIER.color,
  }))

  if (winTier) {
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const pos1 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    const pos2 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    const pos3 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
    const cell: CellValue = { emoji: winTier.emoji, reward: winTier.reward, color: winTier.color }
    grid[pos1] = cell
    grid[pos2] = cell
    grid[pos3] = cell
  }

  return grid
}

interface ScratchCellProps {
  revealed: boolean
  cell: CellValue | null
  onReveal: () => void
  disabled: boolean
  index: number
}

function ScratchCell({ revealed, cell, onReveal, disabled, index }: ScratchCellProps) {
  const isWinCell = cell && cell.color !== NO_WIN_TIER.color
  return (
    <motion.button
      onClick={onReveal}
      disabled={revealed || disabled}
      whileTap={!revealed && !disabled ? { scale: 0.88 } : {}}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.04 }}
      className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden select-none"
      style={{
        background: revealed
          ? (isWinCell ? `${cell!.color}20` : 'rgba(255,255,255,0.05)')
          : 'linear-gradient(145deg, #2D1B69, #4C1D95)',
        border: `1.5px solid ${revealed
          ? (isWinCell ? `${cell!.color}60` : 'rgba(255,255,255,0.08)')
          : 'rgba(255,255,255,0.14)'}`,
        boxShadow: revealed && isWinCell ? `0 0 18px ${cell!.color}35` : 'none',
        cursor: revealed || disabled ? 'default' : 'pointer',
      }}
    >
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key="hidden" exit={{ scale: 0, opacity: 0, rotate: 20 }}
            className="flex flex-col items-center gap-0.5">
            <span className="text-xl text-white/50">?</span>
          </motion.div>
        ) : (
          <motion.div key="revealed"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="flex flex-col items-center gap-0.5">
            <span className="text-xl">{cell?.emoji ?? '❌'}</span>
            <span className="text-[7px] font-bold leading-tight text-center px-1"
              style={{ color: cell?.color ?? 'rgba(255,255,255,0.3)' }}>
              {cell?.reward ?? 'No Win'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function LotteryPage() {
  const router = useRouter()
  const [state, setState]         = useState<State>('idle')
  const [cells, setCells]         = useState<CellValue[]>([])
  const [revealed, setRevealed]   = useState<boolean[]>(Array(TOTAL).fill(false))
  const [won, setWon]             = useState(false)
  const [wonReward, setWonReward] = useState('')
  const [wonEmoji, setWonEmoji]   = useState('')
  const serialNo = useMemo(() => `LG-${Math.floor(10000 + Math.random() * 90000)}`, [])

  const initTicket = () => {
    const ticket = generateTicket()
    setCells(ticket)
    setRevealed(Array(TOTAL).fill(false))
    setState('scratching')
    return ticket
  }

  const checkWin = (ticketCells: CellValue[], allRevealed: boolean[]) => {
    if (!allRevealed.every(Boolean)) return
    const counts: Record<string, { count: number; cell: CellValue }> = {}
    ticketCells.forEach(c => {
      if (!counts[c.reward]) counts[c.reward] = { count: 0, cell: c }
      counts[c.reward].count++
    })
    const winEntry = Object.values(counts).find(v => v.cell.reward !== NO_WIN_TIER.reward && v.count >= 3)
    setTimeout(() => {
      if (winEntry) {
        setWon(true)
        setWonReward(winEntry.cell.reward)
        setWonEmoji(TIERS.find(t => t.reward === winEntry.cell.reward)?.emoji ?? '🎟️')
      } else {
        setWon(false)
      }
      setState('done')
    }, 800)
  }

  const revealCell = (idx: number) => {
    let ticket = cells
    if (state === 'idle') ticket = initTicket()
    if (state === 'done' || revealed[idx]) return
    const newRevealed = revealed.map((v, i) => i === idx ? true : v)
    setRevealed(newRevealed)
    checkWin(ticket, newRevealed)
  }

  const revealAll = () => {
    let ticket = cells
    if (state === 'idle') ticket = initTicket()
    if (state === 'done') return
    const allTrue = Array(TOTAL).fill(true)
    ticket.forEach((_, i) => {
      setTimeout(() => setRevealed(prev => prev.map((v, j) => j <= i ? true : v)), i * 150)
    })
    setTimeout(() => {
      setRevealed(allTrue)
      checkWin(ticket, allTrue)
    }, TOTAL * 150 + 50)
  }

  if (state === 'done' && won)  return <WinCelebration reward={wonReward} emoji={wonEmoji} onClose={() => {
    setRevealed(Array(TOTAL).fill(false))
    setCells([])
    setState('idle')
  }} />
  if (state === 'done' && !won) return <NoWin onClose={() => {
    setRevealed(Array(TOTAL).fill(false))
    setCells([])
    setState('idle')
  }} />

  const revealedCount = revealed.filter(Boolean).length

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1A0A00 0%, #2C1600 40%, #0D0B1E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-32 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.18) 0%, transparent 70%)', filter: 'blur(48px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.05) 0%, transparent 70%)', filter: 'blur(70px)' }} />

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute text-yellow-300/20 pointer-events-none select-none" style={pos}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.2, 0.8], rotate: [0, 12, 0] }}
          transition={{ duration: 2.5 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
          ✦
        </motion.div>
      ))}

      {/* Campaign Details Card — At Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-5 mb-8 p-4 rounded-2xl relative z-10"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(245,197,24,0.3)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">🎟️ Summer Lottery</h2>
            <p className="text-xs text-white/60 mt-1">Scratch 3 to match and win tiered rewards</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#EF4444', color: '#fff' }}>ENDED</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Tier Odds</p>
            <p className="text-white font-bold text-sm">👑 2% • 🍳 8%</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Campaign</p>
            <p className="text-white font-bold text-sm">May 1–31</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Sales</p>
            <p className="text-white font-bold text-sm">2,341 sold</p>
          </div>
        </div>
      </motion.div>

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors text-sm mb-6 self-start relative z-10 px-5">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center mb-4 relative z-10">
        <h1 className="text-xl font-extrabold text-white\">Lucky Draw</h1>
        <p className="text-sm text-white/50 mt-1\">Tap cells to reveal • Match 3 to Win</p>
      </div>

      {/* Ticket */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-3xl overflow-hidden mb-4 relative z-10"
        style={{
          border: '2px solid rgba(245,197,24,0.45)',
          boxShadow: '0 0 50px rgba(245,197,24,0.12), 0 20px 60px rgba(0,0,0,0.65)',
          background: 'linear-gradient(180deg, #1E0A00 0%, #120800 100%)',
        }}
      >
        {/* Ticket header */}
        <div className="relative px-5 py-3.5 flex items-center justify-between overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #F5C518 0%, #D97706 100%)' }}>
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
          {/* Header shimmer — always visible before scratching */}
          {state === 'idle' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }}
              animate={{ x: ['-120%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
            />
          )}
          <div className="relative">
            <p className="text-[9px] font-black text-black/55 uppercase tracking-[0.2em] mb-0.5">Lucky Draw</p>
            <p className="text-[17px] font-extrabold text-black">🎟️ LUCKY DRAW</p>
          </div>
          <div className="relative text-right">
            <p className="text-[10px] font-bold text-black/55">Amber Cafe</p>
            <p className="text-[10px] font-bold text-black/75 mt-0.5">Match 3 to Win</p>
          </div>
        </div>

        {/* Grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {Array.from({ length: TOTAL }, (_, i) => (
              <ScratchCell
                key={i}
                index={i}
                revealed={revealed[i]}
                cell={cells[i] ?? null}
                onReveal={() => revealCell(i)}
                disabled={state === 'done'}
              />
            ))}
          </div>
        </div>

        {/* Ticket footer */}
        <div className="px-5 py-2.5 flex items-center justify-between"
          style={{ borderTop: '1px dashed rgba(245,197,24,0.25)' }}>
          <p className="font-mono text-[9px] text-white/25 tracking-wider">{serialNo}</p>
          <p className="text-[9px] text-white/20">Terms apply</p>
        </div>
      </motion.div>

      {/* Progress */}
      <AnimatePresence>
        {state === 'scratching' && revealedCount < TOTAL && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-xs text-white/35 mb-3 z-10">
            {revealedCount} / {TOTAL} revealed
          </motion.p>
        )}
      </AnimatePresence>

      {/* Prize legend */}
      <div className="rounded-2xl p-4 mb-4 z-10"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <p className="text-xs text-white/35 font-semibold mb-2.5 uppercase tracking-wide text-center">Prize Tiers</p>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map(t => (
            <div key={t.name} className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${t.color}12`, border: `1px solid ${t.color}28` }}>
              <span className="text-base">{t.emoji}</span>
              <div>
                <p className="text-[10px] font-bold" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[9px] text-white/40">{t.reward}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3 z-10">
        {state === 'scratching' && revealedCount < TOTAL && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={revealAll}
            className="w-full py-3.5 rounded-2xl text-white/70 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Reveal All
          </motion.button>
        )}
        {state === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={revealAll}
            className="w-full py-5 rounded-2xl text-base font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, #F5C518, #D97706)', color: '#1A0A00',
                     boxShadow: '0 8px 32px rgba(245,197,24,0.4)' }}
            animate={{ boxShadow: ['0 8px 32px rgba(245,197,24,0.35)', '0 8px 52px rgba(245,197,24,0.65)', '0 8px 32px rgba(245,197,24,0.35)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            🎟️ Reveal Ticket
          </motion.button>
        )}
      </div>
    </div>
  )
}
