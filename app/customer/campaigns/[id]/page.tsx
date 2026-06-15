'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Delete } from 'lucide-react'
import { campaigns } from '@/lib/mock-data'
import { getMechanicEmoji, getMechanicLabel, getMechanicColor } from '@/lib/utils'

export default function CampaignPINPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const campaign = campaigns.find(c => c.id === id) ?? campaigns[0]
  const color = getMechanicColor(campaign.mechanic)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleKey = (k: string) => {
    if (pin.length < 3) setPin(p => p + k)
    setError(false)
  }

  const handleDelete = () => setPin(p => p.slice(0, -1))

  const handleSubmit = () => {
    if (pin.length < 3) return
    // In prototype, any 3-digit PIN works
    if (pin.length === 3) {
      router.push(`/customer/games/${campaign.mechanic}?campaign=${campaign.id}`)
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-12 pb-8">
      <button onClick={() => router.push('/customer')} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-8 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Campaign info */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
          {getMechanicEmoji(campaign.mechanic)}
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white">{campaign.name}</h1>
          <p className="text-xs" style={{ color }}>{getMechanicLabel(campaign.mechanic)}</p>
        </div>
      </motion.div>

      {/* Campaign Details Card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 p-4 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${color}40` }}
      >
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Status</p>
            <p className="text-white font-bold">{campaign.status.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Duration</p>
            <p className="text-white font-bold text-sm">{campaign.startDate} – {campaign.endDate}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Participants</p>
            <p className="text-white font-bold">{campaign.currentUsers.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1 uppercase tracking-wide text-[10px]">Plays</p>
            <p className="text-white font-bold">{campaign.participations.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8">
        <p className="text-sm font-bold text-white mb-1">Enter Staff PIN</p>
        <p className="text-xs text-white/40">Ask the staff for the 3-digit PIN</p>
      </motion.div>

      {/* PIN display */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="flex justify-center gap-4 mb-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-2 transition-all"
            style={{
              borderColor: pin[i] ? color : 'rgba(255,255,255,0.15)',
              background: pin[i] ? `${color}15` : 'rgba(255,255,255,0.05)',
              color: pin[i] ? 'white' : 'transparent',
            }}
          >
            {pin[i] || '·'}
          </motion.div>
        ))}
      </motion.div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-red-400 mb-4">
          Wrong PIN. Ask staff for the current PIN.
        </motion.p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto flex-1">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleKey(String(n))}
            className="h-16 rounded-2xl glass text-2xl font-bold text-white hover:bg-white/15 transition-all"
          >
            {n}
          </motion.button>
        ))}
        <div />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleKey('0')}
          className="h-16 rounded-2xl glass text-2xl font-bold text-white hover:bg-white/15 transition-all"
        >
          0
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          className="h-16 rounded-2xl glass text-white/50 hover:bg-white/15 transition-all flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleSubmit}
        disabled={pin.length < 3}
        className="mt-6 w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30"
        style={{
          background: pin.length === 3 ? `linear-gradient(135deg, ${color}, ${color}99)` : 'rgba(255,255,255,0.08)',
          color: 'white',
          boxShadow: pin.length === 3 ? `0 8px 24px ${color}40` : 'none',
        }}
      >
        {pin.length === 3 ? `Let's Play! ${getMechanicEmoji(campaign.mechanic)}` : 'Enter PIN'}
      </motion.button>
    </div>
  )
}
