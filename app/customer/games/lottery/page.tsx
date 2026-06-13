'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

const TIERS = [
  { name: 'Jackpot', reward: 'Free Month Subscription 👑', color: '#F5C518', probability: 0.02 },
  { name: 'Gold', reward: 'Free Breakfast Combo 🍳', color: '#F59E0B', probability: 0.08 },
  { name: 'Silver', reward: 'Free Coffee ☕', color: '#9B93C8', probability: 0.25 },
  { name: 'Bronze', reward: '₹30 Off 🏷️', color: '#CD7F32', probability: 0.35 },
]

const ROWS = 3
const COLS = 3

type State = 'idle' | 'revealing' | 'result'

function ScratchCell({ revealed, value, color, delay }: { revealed: boolean; value: string; color: string; delay: number }) {
  return (
    <motion.div
      className="aspect-square rounded-xl relative overflow-hidden flex items-center justify-center"
      style={{ background: revealed ? `${color}18` : 'rgba(255,255,255,0.12)', border: `1px solid ${revealed ? color + '50' : 'rgba(255,255,255,0.15)'}` }}
    >
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key="hidden" exit={{ scale: 0, opacity: 0 }} className="text-2xl">🎫</motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay }}
            className="text-center p-1"
          >
            <div className="text-lg">{value.split(' ').slice(-1)[0]}</div>
            <div className="text-[8px] font-bold leading-tight mt-0.5" style={{ color }}>{value.split(' ').slice(0, -1).join(' ')}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LotteryPage() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [revealed, setRevealed] = useState(Array(ROWS * COLS).fill(false))
  const [won, setWon] = useState(false)
  const [wonReward, setWonReward] = useState('')
  const [cells, setCells] = useState<Array<{ value: string; color: string }>>([])

  const generateTicket = (): typeof cells => {
    // Pick a win tier or no win
    const r = Math.random()
    let cumulative = 0
    let winTier: (typeof TIERS)[0] | null = null
    for (const tier of TIERS) {
      cumulative += tier.probability
      if (r < cumulative) { winTier = tier; break }
    }

    const grid = Array(ROWS * COLS).fill(null).map(() => ({
      value: 'No Win',
      color: 'rgba(255,255,255,0.3)',
    }))

    if (winTier) {
      const positions = [0,1,2,3,4,5,6,7,8]
      const pos1 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
      const pos2 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
      const pos3 = positions.splice(Math.floor(Math.random() * positions.length), 1)[0]
      grid[pos1] = { value: winTier.reward, color: winTier.color }
      grid[pos2] = { value: winTier.reward, color: winTier.color }
      grid[pos3] = { value: winTier.reward, color: winTier.color }
    }
    return grid
  }

  const startReveal = () => {
    if (state !== 'idle') return
    const ticket = generateTicket()
    setCells(ticket)
    setState('revealing')

    ticket.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => prev.map((v, j) => j === i ? true : v))
      }, i * 180 + 200)
    })

    // Check win: 3 matching cells
    setTimeout(() => {
      const valueCounts: Record<string, number> = {}
      ticket.forEach(c => { valueCounts[c.value] = (valueCounts[c.value] || 0) + 1 })
      const winEntry = Object.entries(valueCounts).find(([v, count]) => v !== 'No Win' && count >= 3)
      if (winEntry) {
        setWon(true)
        setWonReward(winEntry[0])
      } else {
        setWon(false)
      }
      setState('result')
    }, ROWS * COLS * 180 + 800)
  }

  if (state === 'result' && won) return <WinCelebration reward={wonReward} emoji="🎟️" />
  if (state === 'result' && !won) return <NoWin />

  return (
    <div className="min-h-screen flex flex-col px-5 pt-12 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Lottery!</h1>
        <p className="text-sm text-c-text-2">Match 3 identical prizes to win</p>
      </div>

      {/* Ticket */}
      <div className="glass-purple rounded-3xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-c-text-2">Brew & Bite Café</p>
            <p className="text-xs font-bold text-c-gold">Summer Lottery Blast</p>
          </div>
          <div className="text-2xl">🎟️</div>
        </div>

        {state === 'idle' ? (
          <div className="aspect-square max-w-[240px] mx-auto rounded-2xl glass flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">🎫</div>
              <p className="text-sm text-c-text-2">Tap reveal to scratch</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {Array(ROWS * COLS).fill(null).map((_, i) => (
              <ScratchCell
                key={i}
                revealed={revealed[i]}
                value={cells[i]?.value || '?'}
                color={cells[i]?.color || '#fff'}
                delay={i * 0.05}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prize tiers */}
      <div className="glass rounded-2xl p-4 mb-6">
        <p className="text-xs text-c-text-2 font-semibold mb-2 text-center">Prize Tiers</p>
        <div className="space-y-1.5">
          {TIERS.map(t => (
            <div key={t.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                <span style={{ color: t.color }} className="font-semibold">{t.name}</span>
              </div>
              <span className="text-white/60">{t.reward.split(' ').slice(0, 3).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={startReveal}
        disabled={state !== 'idle'}
        className="w-full py-5 rounded-2xl text-base font-extrabold transition-all disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
        }}
      >
        {state === 'idle' ? '🎟️ Reveal Ticket' : '✨ Revealing…'}
      </motion.button>

      <button onClick={() => router.push('/customer')} className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors mx-auto block">
        ← Back to games
      </button>
    </div>
  )
}
