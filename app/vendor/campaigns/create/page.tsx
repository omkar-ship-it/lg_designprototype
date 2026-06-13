'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select, Slider } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getMechanicLabel, getMechanicEmoji, getMechanicColor } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

const MECHANICS: { type: MechanicType; desc: string; tags: string[] }[] = [
  { type: 'shake', desc: 'Customer shakes their phone to reveal a mystery reward instantly.', tags: ['Instant', 'High engagement', 'Simple'] },
  { type: 'stamp', desc: 'Collect stamps on every visit. Hidden surprise drop + a big reward at the end.', tags: ['Repeat visits', 'Loyalty', 'Surprise'] },
  { type: 'spin', desc: 'Spin a colourful wheel and land on exciting rewards.', tags: ['Visual', 'Exciting', 'Shareable'] },
  { type: 'dice', desc: 'Roll the dice — certain numbers win. Pure luck, maximum thrill.', tags: ['Gamble feel', 'Quick', 'Fun'] },
  { type: 'lottery', desc: 'Scratch & reveal a lottery ticket with tiered prizes and a jackpot.', tags: ['Jackpot', 'Tiered rewards', 'Buzz'] },
]

const STEPS = ['Mechanic', 'Basics', 'Game Config', 'Rewards', 'Review']

const SPIN_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#F43F5E', '#8B5CF6', '#10B981']

export default function CreateCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [mechanic, setMechanic] = useState<MechanicType | null>(null)
  const [basics, setBasics] = useState({ name: '', startDate: '', endDate: '', userCap: 200, playsPerUser: 1 })
  const [spinSegments, setSpinSegments] = useState([
    { label: 'Free Coffee', reward: 'Free Coffee', color: '#7C3AED', isWin: true },
    { label: 'Try Again', reward: '', color: '#2A2660', isWin: false },
    { label: '20% Off', reward: '20% Off', color: '#EC4899', isWin: true },
    { label: 'Better Luck', reward: '', color: '#1A1840', isWin: false },
    { label: 'Free Muffin', reward: 'Free Muffin', color: '#F59E0B', isWin: true },
    { label: '₹50 Off', reward: '₹50 Off', color: '#06B6D4', isWin: true },
  ])
  const [stampConfig, setStampConfig] = useState({ totalStamps: 10, surpriseFrom: 4, surpriseTo: 6, surpriseReward: 'Mystery Treat', bigReward: 'Free Breakfast Combo' })
  const [shakeConfig, setShakeConfig] = useState({ rewardType: 'range', winProb: 65, rewards: ['₹30 Off', 'Free Sandwich', 'Free Coffee'] })
  const [diceOutcomes, setDiceOutcomes] = useState([
    { value: 1, reward: '', isWin: false },
    { value: 2, reward: '', isWin: false },
    { value: 3, reward: 'Free Dessert', isWin: true },
    { value: 4, reward: '₹50 Off', isWin: true },
    { value: 5, reward: '', isWin: false },
    { value: 6, reward: 'Free Dessert', isWin: true },
  ])
  const [lotteryConfig, setLotteryConfig] = useState({
    ticketLimit: 500,
    jackpot: 'Free Month Subscription',
    tiers: [
      { name: 'Gold', reward: 'Free Breakfast', color: '#F59E0B' },
      { name: 'Silver', reward: 'Free Coffee', color: '#9B93C8' },
      { name: 'Bronze', reward: '₹30 Off', color: '#CD7F32' },
    ],
  })
  const [launched, setLaunched] = useState(false)

  const canProceed = () => {
    if (step === 0) return mechanic !== null
    if (step === 1) return basics.name.trim().length > 0
    return true
  }

  const handleLaunch = () => {
    setLaunched(true)
    setTimeout(() => router.push('/vendor/campaigns'), 2500)
  }

  if (launched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-7xl mb-6"
          >
            🚀
          </motion.div>
          <h2 className="text-2xl font-extrabold text-v-text mb-2">Campaign Launched!</h2>
          <p className="text-v-text-2 text-sm">Redirecting to campaigns…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()} className="inline-flex items-center gap-1.5 text-sm text-v-text-2 hover:text-v-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-extrabold text-v-text">Create Campaign</h1>
        <p className="text-v-text-2 text-sm mt-1">Configure your game mechanic and rewards</p>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              i < step ? 'bg-v-success text-white' :
              i === step ? 'bg-v-purple text-white' :
              'bg-v-surface-2 text-v-text-3'
            }`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-v-text' : 'text-v-text-3'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-v-success' : 'bg-v-border'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Mechanic picker */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MECHANICS.map(m => {
                const selected = mechanic === m.type
                const color = getMechanicColor(m.type)
                return (
                  <motion.div key={m.type} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
                    <button
                      onClick={() => setMechanic(m.type)}
                      className={`w-full text-left rounded-2xl p-5 border transition-all duration-200 ${
                        selected ? 'border-[2px]' : 'border-v-border bg-v-surface hover:border-v-border-b hover:bg-v-surface-2'
                      }`}
                      style={selected ? { borderColor: color, background: `${color}12` } : {}}
                    >
                      <div className="text-4xl mb-3">{getMechanicEmoji(m.type)}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-v-text">{getMechanicLabel(m.type)}</span>
                        {selected && <Check className="w-4 h-4" style={{ color }} />}
                      </div>
                      <p className="text-xs text-v-text-3 mb-3 leading-relaxed">{m.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {m.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${color}18`, color }}>{t}</span>
                        ))}
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-5">Campaign Details</h2>
              <div className="space-y-5">
                <Input label="Campaign Name" placeholder="e.g. Weekend Spin Fiesta" value={basics.name} onChange={e => setBasics(p => ({ ...p, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" value={basics.startDate} onChange={e => setBasics(p => ({ ...p, startDate: e.target.value }))} />
                  <Input label="End Date" type="date" value={basics.endDate} onChange={e => setBasics(p => ({ ...p, endDate: e.target.value }))} />
                </div>
                <Slider label="User Cap" displayValue={`${basics.userCap} users`} min={10} max={2000} step={10} value={basics.userCap} onChange={e => setBasics(p => ({ ...p, userCap: Number(e.target.value) }))} />
                <Slider label="Plays Per User" displayValue={`${basics.playsPerUser} play${basics.playsPerUser > 1 ? 's' : ''}`} min={1} max={10} step={1} value={basics.playsPerUser} onChange={e => setBasics(p => ({ ...p, playsPerUser: Number(e.target.value) }))} />
              </div>
            </Card>
          )}

          {/* Step 2: Game Config */}
          {step === 2 && mechanic === 'spin' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Spin a Wheel — Segments</h2>
              <p className="text-xs text-v-text-3 mb-5">Configure up to 8 wheel segments. Mark which ones are winning slots.</p>
              <div className="space-y-2">
                {spinSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-v-surface-2 rounded-xl">
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ background: seg.color }} />
                    <input className="flex-1 bg-transparent text-sm text-v-text placeholder:text-v-text-3 focus:outline-none" placeholder="Label" value={seg.label} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                    <input className="flex-1 bg-transparent text-sm text-v-gold placeholder:text-v-text-3 focus:outline-none" placeholder="Reward (blank = no win)" value={seg.reward} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, reward: e.target.value, isWin: !!e.target.value } : x))} />
                    <div className="flex gap-1 shrink-0">
                      {SPIN_COLORS.map(c => (
                        <button key={c} onClick={() => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, color: c } : x))} className="w-4 h-4 rounded-full border-2 transition-all" style={{ background: c, borderColor: seg.color === c ? 'white' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'stamp' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Stamp Card — Configuration</h2>
              <p className="text-xs text-v-text-3 mb-5">Set the total stamps and where hidden rewards appear.</p>
              <div className="space-y-5">
                <Slider label="Total Stamps" displayValue={`${stampConfig.totalStamps} stamps`} min={5} max={20} step={1} value={stampConfig.totalStamps} onChange={e => setStampConfig(p => ({ ...p, totalStamps: Number(e.target.value) }))} />
                <div className="p-4 bg-v-surface-2 rounded-xl">
                  <div className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-3">Surprise Drop Range (First Half)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="From Stamp" type="number" min={1} max={stampConfig.totalStamps / 2} value={stampConfig.surpriseFrom} onChange={e => setStampConfig(p => ({ ...p, surpriseFrom: Number(e.target.value) }))} />
                    <Input label="To Stamp" type="number" min={stampConfig.surpriseFrom} max={stampConfig.totalStamps / 2} value={stampConfig.surpriseTo} onChange={e => setStampConfig(p => ({ ...p, surpriseTo: Number(e.target.value) }))} />
                  </div>
                  <Input className="mt-3" label="Surprise Reward" placeholder="e.g. Mystery Treat" value={stampConfig.surpriseReward} onChange={e => setStampConfig(p => ({ ...p, surpriseReward: e.target.value }))} />
                </div>
                <div className="p-4 bg-v-surface-2 rounded-xl">
                  <div className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-1">Big Reward</div>
                  <p className="text-xs text-v-text-3 mb-3">Triggered at stamp #{stampConfig.totalStamps} (end of card)</p>
                  <Input label="Big Reward" placeholder="e.g. Free Breakfast Combo" value={stampConfig.bigReward} onChange={e => setStampConfig(p => ({ ...p, bigReward: e.target.value }))} />
                </div>
                {/* Visual preview */}
                <div>
                  <div className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-3">Card Preview</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: stampConfig.totalStamps }, (_, i) => {
                      const n = i + 1
                      const isSurprise = n >= stampConfig.surpriseFrom && n <= stampConfig.surpriseTo
                      const isBig = n === stampConfig.totalStamps
                      return (
                        <div key={n} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${isBig ? 'border-v-gold bg-v-gold/15 text-v-gold' : isSurprise ? 'border-v-purple/50 bg-v-purple/10 text-v-purple' : 'border-v-border text-v-text-3'}`}>
                          {isBig ? '🏆' : isSurprise ? '🎁' : n}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-v-text-3">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-v-purple/20 border border-v-purple/50 inline-block" /> Surprise range</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-v-gold/20 border border-v-gold/40 inline-block" /> Big reward</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'shake' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Shake & Win — Configuration</h2>
              <p className="text-xs text-v-text-3 mb-5">Set the win probability and rewards users can win.</p>
              <div className="space-y-5">
                <Slider label="Win Probability" displayValue={`${shakeConfig.winProb}%`} min={10} max={90} step={5} value={shakeConfig.winProb} onChange={e => setShakeConfig(p => ({ ...p, winProb: Number(e.target.value) }))} />
                <div>
                  <div className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-3">Rewards Pool</div>
                  <div className="space-y-2">
                    {shakeConfig.rewards.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <input className="flex-1 bg-v-surface-2 border border-v-border rounded-xl px-3 py-2 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" value={r} onChange={e => setShakeConfig(p => ({ ...p, rewards: p.rewards.map((x, j) => j === i ? e.target.value : x) }))} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'dice' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Roll a Dice — Outcomes</h2>
              <p className="text-xs text-v-text-3 mb-5">Set what each dice face wins. Leave blank for no win.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {diceOutcomes.map((o, i) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all ${o.isWin ? 'border-v-gold/40 bg-v-gold/8' : 'border-v-border bg-v-surface-2'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl dice-shadow bg-white flex items-center justify-center">
                        <DiceFace value={o.value} />
                      </div>
                      <span className="text-sm font-bold text-v-text">Roll {o.value}</span>
                    </div>
                    <input
                      className="w-full bg-v-surface border border-v-border rounded-xl px-3 py-2 text-xs text-v-gold placeholder:text-v-text-3 focus:outline-none focus:border-v-gold"
                      placeholder="Reward (blank = no win)"
                      value={o.reward}
                      onChange={e => setDiceOutcomes(d => d.map((x, j) => j === i ? { ...x, reward: e.target.value, isWin: !!e.target.value } : x))}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'lottery' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Lottery — Prize Tiers</h2>
              <p className="text-xs text-v-text-3 mb-5">Configure the jackpot and prize tiers for the lottery.</p>
              <div className="space-y-5">
                <Slider label="Ticket Limit" displayValue={`${lotteryConfig.ticketLimit} tickets`} min={100} max={5000} step={100} value={lotteryConfig.ticketLimit} onChange={e => setLotteryConfig(p => ({ ...p, ticketLimit: Number(e.target.value) }))} />
                <div className="p-4 bg-v-gold/8 border border-v-gold/25 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">👑</span>
                    <span className="text-sm font-bold text-v-gold">Jackpot Prize</span>
                  </div>
                  <input className="w-full bg-v-surface border border-v-border rounded-xl px-3 py-2 text-sm text-v-gold placeholder:text-v-text-3 focus:outline-none focus:border-v-gold" placeholder="e.g. Free Month Subscription" value={lotteryConfig.jackpot} onChange={e => setLotteryConfig(p => ({ ...p, jackpot: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  {lotteryConfig.tiers.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-v-surface-2 rounded-xl">
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ background: t.color }} />
                      <span className="text-sm font-medium text-v-text w-16 shrink-0">{t.name}</span>
                      <input className="flex-1 bg-transparent text-sm text-v-text-2 placeholder:text-v-text-3 focus:outline-none" placeholder="Reward" value={t.reward} onChange={e => setLotteryConfig(p => ({ ...p, tiers: p.tiers.map((x, j) => j === i ? { ...x, reward: e.target.value } : x) }))} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Rewards summary */}
          {step === 3 && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Rewards Summary</h2>
              <p className="text-xs text-v-text-3 mb-6">Review what customers can win in this campaign.</p>
              <div className="space-y-3">
                {mechanic === 'spin' && spinSegments.filter(s => s.isWin).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-v-surface-2 rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl" style={{ background: `${s.color}20` }}>🎁</div>
                    <div>
                      <div className="text-sm font-semibold text-v-text">{s.reward}</div>
                      <div className="text-xs text-v-text-3">Spin segment: {s.label}</div>
                    </div>
                  </div>
                ))}
                {mechanic === 'stamp' && [
                  { icon: '🎁', name: stampConfig.surpriseReward, desc: `Surprise drop (stamps ${stampConfig.surpriseFrom}–${stampConfig.surpriseTo})` },
                  { icon: '🏆', name: stampConfig.bigReward, desc: `Big reward (stamp ${stampConfig.totalStamps})` },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-v-surface-2 rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-v-surface-3">{r.icon}</div>
                    <div>
                      <div className="text-sm font-semibold text-v-text">{r.name}</div>
                      <div className="text-xs text-v-text-3">{r.desc}</div>
                    </div>
                  </div>
                ))}
                {mechanic === 'shake' && shakeConfig.rewards.filter(Boolean).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-v-surface-2 rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-v-surface-3">🎁</div>
                    <div>
                      <div className="text-sm font-semibold text-v-text">{r}</div>
                      <div className="text-xs text-v-text-3">Win probability: {shakeConfig.winProb}%</div>
                    </div>
                  </div>
                ))}
                {mechanic === 'dice' && diceOutcomes.filter(o => o.isWin).map((o, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-v-surface-2 rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-v-surface-3">🎲</div>
                    <div>
                      <div className="text-sm font-semibold text-v-text">{o.reward}</div>
                      <div className="text-xs text-v-text-3">Roll: {o.value}</div>
                    </div>
                  </div>
                ))}
                {mechanic === 'lottery' && [{ icon: '👑', name: lotteryConfig.jackpot, desc: 'Jackpot' }, ...lotteryConfig.tiers.map(t => ({ icon: '🎟️', name: t.reward, desc: t.name }))].filter(r => r.name).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-v-surface-2 rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-v-surface-3">{r.icon}</div>
                    <div>
                      <div className="text-sm font-semibold text-v-text">{r.name}</div>
                      <div className="text-xs text-v-text-3">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Step 4: Review & Launch */}
          {step === 4 && (
            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-4">Review & Launch</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Campaign Name', value: basics.name || '—' },
                    { label: 'Mechanic', value: mechanic ? `${getMechanicEmoji(mechanic)} ${getMechanicLabel(mechanic)}` : '—' },
                    { label: 'Duration', value: basics.startDate && basics.endDate ? `${basics.startDate} → ${basics.endDate}` : '—' },
                    { label: 'User Cap', value: `${basics.userCap} users` },
                    { label: 'Plays Per User', value: `${basics.playsPerUser} play${basics.playsPerUser > 1 ? 's' : ''}` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-v-border last:border-0">
                      <span className="text-sm text-v-text-2">{item.label}</span>
                      <span className="text-sm font-semibold text-v-text">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* PIN preview */}
              <Card className="p-6 text-center">
                <p className="text-xs text-v-text-3 mb-2">A PIN will be generated on launch</p>
                <div className="text-4xl font-black tracking-[0.3em] text-v-purple">···</div>
                <p className="text-xs text-v-text-3 mt-2">Rotates every 60 seconds · Campaign-level</p>
              </Card>

              <Button variant="gold" size="lg" className="w-full" onClick={handleLaunch}>
                <Zap className="w-5 h-5" /> Launch Campaign
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      {!launched && (
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}>
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < 4 && (
            <Button variant="primary" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function DiceFace({ value }: { value: number }) {
  const dots: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  }
  return (
    <svg viewBox="0 0 100 100" width="28" height="28">
      {(dots[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#1A1840" />
      ))}
    </svg>
  )
}
