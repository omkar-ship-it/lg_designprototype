'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { WinCelebration, NoWin } from '@/components/customer/win-celebration'

const MAX_PLAYS = 2
const PRIZES    = ['Free Coffee ☕', 'Free Pastry 🥐', '₹50 Off 🏷️']

type State = 'idle' | 'revealing' | 'result'

const SPARKLE_POS = [
  { top: '12%', left: '8%' }, { top: '20%', right: '10%' },
  { top: '45%', left: '4%' }, { top: '55%', right: '6%' },
  { bottom: '28%', left: '9%' }, { bottom: '20%', right: '8%' },
]

export default function ScratchCardPage() {
  const router = useRouter()
  const [state, setState]         = useState<State>('idle')
  const [won, setWon]             = useState(false)
  const [wonPrize, setWonPrize]   = useState('')
  const [playsLeft, setPlaysLeft] = useState(MAX_PLAYS)

  const scratch = () => {
    if (state !== 'idle' || playsLeft <= 0) return
    const didWin = Math.random() < 0.65
    const prize  = didWin ? PRIZES[Math.floor(Math.random() * PRIZES.length)] : ''
    setWon(didWin)
    setWonPrize(prize)
    setPlaysLeft(p => p - 1)
    setState('revealing')
    setTimeout(() => setState('result'), 1800)
  }

  const handlePlayAgain = () => {
    if (playsLeft <= 0) return
    setState('idle')
    setWon(false)
    setWonPrize('')
  }

  if (state === 'result' && won)
    return <WinCelebration reward={wonPrize} emoji="🃏" onClose={handlePlayAgain} hidePlayAgain={playsLeft <= 0} />
  if (state === 'result' && !won)
    return <NoWin onClose={handlePlayAgain} />

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-5 pt-12 pb-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 50%, #0C0A1E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-16 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)', filter: 'blur(48px)' }} />
      <div className="absolute bottom-32 -right-20 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Idle sparkles */}
      {state === 'idle' && SPARKLE_POS.map((pos, i) => (
        <motion.div key={i} className="absolute text-blue-300/30 text-xs pointer-events-none select-none" style={pos}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}>
          ✦
        </motion.div>
      ))}

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>
      <p className="absolute top-14 right-4 text-[10px] text-white/30 z-20">
        Scratch Card · {playsLeft} play{playsLeft !== 1 ? 's' : ''} left
      </p>

      {/* Title */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-6">
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-white">Scratch &amp; Win</h1>
          <p className="text-sm text-white/45 mt-1">
            {state === 'revealing' ? 'Revealing your reward…' : 'Tap the card to scratch and reveal'}
          </p>
        </div>

        {/* Scratch Card */}
        <motion.div
          onClick={scratch}
          className="relative z-10 rounded-3xl overflow-hidden select-none w-full max-w-[320px]"
          style={{
            boxShadow: '0 28px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)',
            cursor: state === 'idle' ? 'pointer' : 'default',
          }}
          whileTap={state === 'idle' ? { scale: 0.97 } : {}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          {/* Card header */}
          <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }} />
            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mb-0.5 relative">Lucky Scratch</p>
            <div className="flex items-center justify-between relative">
              <p className="text-[18px] font-extrabold text-white">🃏 Scratch &amp; Win</p>
              <div className="flex gap-1.5">
                {PRIZES.slice(0, 2).map((p, i) => (
                  <span key={i} className="text-[9px] font-semibold text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                    {p.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scratch area */}
          <div className="relative bg-white overflow-hidden" style={{ height: '240px' }}>
            {/* Revealed content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              <AnimatePresence>
                {state !== 'idle' && (
                  <motion.div
                    key="revealed"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.9 }}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <motion.span
                      className="text-7xl"
                      animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      {won ? wonPrize.split(' ').slice(-1)[0] : '😔'}
                    </motion.span>
                    <p className="text-base font-extrabold text-gray-800">
                      {won ? wonPrize.split(' ').slice(0, -1).join(' ') : 'Not this time!'}
                    </p>
                    {won && <p className="text-xs text-gray-400 font-medium">Show this to the staff to redeem</p>}
                    {!won && <p className="text-xs text-gray-400">Better luck on your next visit</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metallic scratch overlay */}
            <AnimatePresence>
              {state === 'idle' && (
                <motion.div
                  key="overlay"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #C8C8C8 0%, #E4E4E4 25%, #B0B0B0 50%, #CECECE 75%, #BEBEBE 100%)' }}
                  exit={{ y: '100%', transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] } }}
                >
                  {/* Metallic sheen */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)' }}
                    animate={{ x: ['-120%', '220%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
                  />
                  <motion.span
                    className="text-5xl z-10 select-none"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🪙
                  </motion.span>
                  <div className="z-10 text-center">
                    <p className="text-sm font-bold text-gray-500">Tap to Scratch</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Your reward is waiting</p>
                  </div>
                </motion.div>
              )}

              {state === 'revealing' && (
                <motion.div
                  key="shimmer"
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.95)' }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: 3, ease: 'linear' }}
                    className="text-4xl"
                  >
                    ✨
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card footer */}
          <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
            <span className="font-mono text-[9px] text-gray-300 tracking-wider">LG-SCR-2026</span>
            <span className="text-[9px] text-gray-300">{playsLeft} play{playsLeft !== 1 ? 's' : ''} remaining</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-white/20 text-center z-10"
        >
          Each visit earns you {MAX_PLAYS > 1 ? `${MAX_PLAYS} scratches` : 'one scratch'} · Results are instant
        </motion.p>
      </div>
    </div>
  )
}
