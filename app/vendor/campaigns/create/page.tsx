'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Zap, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select, Slider } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getMechanicLabel, getMechanicEmoji, getMechanicColor } from '@/lib/utils'
import type { MechanicType } from '@/lib/types'

const MECHANICS: { type: MechanicType; desc: string; tags: string[] }[] = [
  { type: 'shake', desc: 'Customer shakes their phone to reveal a mystery reward instantly.', tags: ['Instant', 'High engagement'] },
  { type: 'stamp', desc: 'Collect stamps on every visit. Hidden surprise drop + big reward at the end.', tags: ['Repeat visits', 'Loyalty', 'Surprise'] },
  { type: 'spin', desc: 'Spin a colourful wheel and land on exciting rewards.', tags: ['Visual', 'Exciting'] },
  { type: 'dice', desc: 'Roll the dice — certain numbers win. Pure luck, maximum thrill.', tags: ['Gamble feel', 'Quick'] },
  { type: 'lottery', desc: 'Scratch & reveal a lottery ticket with tiered prizes and a jackpot.', tags: ['Jackpot', 'Tiered rewards'] },
]

const STEPS = ['Mechanic', 'Basics', 'Game Config', 'Rewards', 'Review']

const SPIN_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#F43F5E', '#8B5CF6', '#10B981']
const ICONS = ['🎁', '☕', '🧁', '🥪', '🍰', '🏷️', '🎉', '🍳', '👑', '🎫', '🎟️', '💰']

interface RewardEntry {
  id: string
  name: string
  description: string
  icon: string
  probability: number
}

function newReward(): RewardEntry {
  return { id: Math.random().toString(36).slice(2), name: '', description: '', icon: '🎁', probability: 10 }
}

function ProbabilityBar({ rewards }: { rewards: RewardEntry[] }) {
  const total = rewards.reduce((s, r) => s + r.probability, 0)
  const noWin = Math.max(0, 100 - total)
  const over = total > 100

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2 text-xs text-v-text-2">
        <span>Probability breakdown</span>
        <span className={over ? 'text-v-danger font-bold' : total === 100 ? 'text-v-success font-bold' : 'text-v-text-2'}>
          {total}% allocated
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-v-border gap-px">
        {rewards.filter(r => r.probability > 0).map(r => (
          <div key={r.id} className="h-full transition-all" style={{ width: `${Math.min(r.probability, 100)}%`, background: getMechanicColor('shake') }} title={r.name} />
        ))}
        {noWin > 0 && !over && (
          <div className="h-full bg-gray-200 transition-all" style={{ width: `${noWin}%` }} title="No win" />
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] text-v-text-3">
        {rewards.filter(r => r.name).map(r => (
          <span key={r.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: getMechanicColor('shake') }} />
            {r.name} ({r.probability}%)
          </span>
        ))}
        {noWin > 0 && !over && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block bg-gray-300" />
            No win ({noWin}%)
          </span>
        )}
      </div>
      {over && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-v-danger bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Total exceeds 100%. Reduce probabilities to continue.
        </div>
      )}
    </div>
  )
}

function RewardPool({ rewards, setRewards }: { rewards: RewardEntry[]; setRewards: (r: RewardEntry[]) => void }) {
  const total = rewards.reduce((s, r) => s + r.probability, 0)

  const update = (id: string, field: keyof RewardEntry, value: string | number) => {
    setRewards(rewards.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Reward Pool</p>
        <Button variant="secondary" size="sm" onClick={() => setRewards([...rewards, newReward()])}>
          <Plus className="w-3 h-3" /> Add Reward
        </Button>
      </div>

      <div className="space-y-2.5">
        {rewards.map((r, i) => (
          <div key={r.id} className="p-3.5 bg-v-surface-2 border border-v-border rounded-xl">
            <div className="flex items-start gap-2">
              {/* Icon picker */}
              <select
                value={r.icon}
                onChange={e => update(r.id, 'icon', e.target.value)}
                className="text-xl bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="bg-white border border-v-border rounded-lg px-3 py-1.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple"
                    placeholder="Reward name (e.g. Free Coffee)"
                    value={r.name}
                    onChange={e => update(r.id, 'name', e.target.value)}
                  />
                  <input
                    className="bg-white border border-v-border rounded-lg px-3 py-1.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple"
                    placeholder="Description (optional)"
                    value={r.description}
                    onChange={e => update(r.id, 'description', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-v-text-2 shrink-0">Win chance:</span>
                  <input
                    type="range"
                    min={1} max={99} step={1}
                    value={r.probability}
                    onChange={e => update(r.id, 'probability', Number(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-v-purple [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{ accentColor: '#7C3AED' }}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number" min={1} max={99}
                      value={r.probability}
                      onChange={e => update(r.id, 'probability', Math.min(99, Math.max(1, Number(e.target.value))))}
                      className="w-12 bg-white border border-v-border rounded-lg px-2 py-1 text-sm text-v-text text-center focus:outline-none focus:border-v-purple"
                    />
                    <span className="text-sm text-v-text-2">%</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setRewards(rewards.filter(x => x.id !== r.id))} className="p-1.5 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {rewards.length === 0 && (
          <div className="text-center py-6 text-v-text-3 text-sm border-2 border-dashed border-v-border rounded-xl">
            No rewards yet — click "Add Reward" to start
          </div>
        )}
      </div>

      {rewards.length > 0 && <ProbabilityBar rewards={rewards} />}
    </div>
  )
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [mechanic, setMechanic] = useState<MechanicType | null>(null)
  const [basics, setBasics] = useState({ name: '', startDate: '', endDate: '', userCap: 200, playsPerUser: 1, dailyRewardCap: 50 })
  const [rewards, setRewards] = useState<RewardEntry[]>([newReward()])

  // Mechanic-specific configs
  const [spinSegments, setSpinSegments] = useState([
    { label: 'Free Coffee', color: '#7C3AED', isWin: true },
    { label: 'Try Again', color: '#E5E1F8', isWin: false },
    { label: '20% Off', color: '#EC4899', isWin: true },
    { label: 'Better Luck', color: '#EDE9FF', isWin: false },
    { label: 'Free Muffin', color: '#F59E0B', isWin: true },
    { label: '₹50 Off', color: '#06B6D4', isWin: true },
  ])
  const [stampConfig, setStampConfig] = useState({ totalStamps: 10, surpriseFrom: 4, surpriseTo: 6, surpriseReward: 'Mystery Treat', bigReward: 'Free Breakfast Combo' })
  const [diceOutcomes, setDiceOutcomes] = useState([
    { value: 1, isWin: false }, { value: 2, isWin: false },
    { value: 3, isWin: true }, { value: 4, isWin: true },
    { value: 5, isWin: false }, { value: 6, isWin: true },
  ])
  const [lotteryConfig, setLotteryConfig] = useState({
    ticketLimit: 500,
    jackpot: 'Free Month Subscription',
    tiers: [
      { name: 'Gold', reward: 'Free Breakfast', color: '#F59E0B', probability: 5 },
      { name: 'Silver', reward: 'Free Coffee', color: '#9B93C8', probability: 20 },
      { name: 'Bronze', reward: '₹30 Off', color: '#CD7F32', probability: 35 },
    ],
  })
  const [launched, setLaunched] = useState(false)

  const isLottery = mechanic === 'lottery'
  const rewardTotal = rewards.reduce((s, r) => s + r.probability, 0)
  const canProceed = () => {
    if (step === 0) return mechanic !== null
    if (step === 1) return basics.name.trim().length > 0
    if (step === 3) return mechanic === 'lottery' || (rewards.length > 0 && rewardTotal <= 100)
    return true
  }

  const handleLaunch = () => {
    setLaunched(true)
    setTimeout(() => router.push('/vendor/campaigns'), 2500)
  }

  if (launched) {
    return (
      <div className="min-h-screen vendor-bg flex items-center justify-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 5, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="text-7xl mb-6">🚀</motion.div>
          <h2 className="text-2xl font-extrabold text-v-text mb-2">Campaign Launched!</h2>
          <p className="text-v-text-2 text-sm">Redirecting to campaigns…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
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
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${i < step ? 'bg-v-success text-white' : i === step ? 'bg-v-purple text-white' : 'bg-v-surface-2 text-v-text-3 border border-v-border'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-v-text' : 'text-v-text-3'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-v-success' : 'bg-v-border'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

          {/* Step 0: Mechanic picker */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MECHANICS.map(m => {
                const selected = mechanic === m.type
                const color = getMechanicColor(m.type)
                return (
                  <motion.div key={m.type} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <button onClick={() => setMechanic(m.type)} className={`w-full text-left rounded-2xl p-5 border-2 transition-all duration-200 ${selected ? '' : 'border-v-border bg-white hover:border-v-border-b'}`}
                      style={selected ? { borderColor: color, background: `${color}08` } : {}}>
                      <div className="text-4xl mb-3">{getMechanicEmoji(m.type)}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-v-text">{getMechanicLabel(m.type)}</span>
                        {selected && <Check className="w-4 h-4" style={{ color }} />}
                      </div>
                      <p className="text-xs text-v-text-3 mb-3 leading-relaxed">{m.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {m.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${color}12`, color }}>{t}</span>)}
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
                {/* User cap + plays — hidden for lottery */}
                {!isLottery && (
                  <>
                    <Slider label="User Cap" displayValue={`${basics.userCap} users`} min={10} max={2000} step={10} value={basics.userCap} onChange={e => setBasics(p => ({ ...p, userCap: Number(e.target.value) }))} />
                    <Slider label="Plays Per User" displayValue={`${basics.playsPerUser} play${basics.playsPerUser > 1 ? 's' : ''}`} min={1} max={10} step={1} value={basics.playsPerUser} onChange={e => setBasics(p => ({ ...p, playsPerUser: Number(e.target.value) }))} />
                  </>
                )}
                {isLottery && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-v-surface-2 border border-v-border rounded-xl text-xs text-v-text-2">
                    <AlertCircle className="w-4 h-4 text-v-purple shrink-0 mt-0.5" />
                    <p>User cap and plays per user are not applicable for Lottery. Lottery uses a ticket limit instead — configure it in the next step.</p>
                  </div>
                )}
                {/* Daily reward cap — for all mechanics */}
                <div className="pt-2 border-t border-v-border">
                  <Slider
                    label="Daily Rewards Cap"
                    displayValue={basics.dailyRewardCap === 0 ? 'Unlimited' : `${basics.dailyRewardCap} rewards/day`}
                    min={0} max={500} step={5}
                    value={basics.dailyRewardCap}
                    onChange={e => setBasics(p => ({ ...p, dailyRewardCap: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-v-text-3 mt-1.5">Max rewards that can be claimed per day. Set to 0 for unlimited.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Game Config */}
          {step === 2 && mechanic === 'spin' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Spin a Wheel — Segments</h2>
              <p className="text-xs text-v-text-3 mb-5">Configure wheel segments. Win probability per segment is set in the Rewards step.</p>
              <div className="space-y-2">
                {spinSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-v-surface-2 border border-v-border rounded-xl">
                    <div className="w-5 h-5 rounded-full shrink-0 border border-v-border" style={{ background: seg.color }} />
                    <input className="flex-1 bg-white border border-v-border rounded-lg px-3 py-1.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple" placeholder="Segment label" value={seg.label} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                    <div className="flex items-center gap-1">
                      <input type="checkbox" checked={seg.isWin} onChange={e => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, isWin: e.target.checked } : x))} className="w-3.5 h-3.5 accent-v-purple" />
                      <span className="text-xs text-v-text-3">Win</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {SPIN_COLORS.map(c => <button key={c} onClick={() => setSpinSegments(s => s.map((x, j) => j === i ? { ...x, color: c } : x))} className="w-4 h-4 rounded-full border-2 transition-all" style={{ background: c, borderColor: seg.color === c ? '#1E1B4B' : 'transparent' }} />)}
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => setSpinSegments(s => [...s, { label: 'New Segment', color: '#7C3AED', isWin: false }])}>
                  <Plus className="w-3 h-3" /> Add Segment
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'stamp' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Stamp Card — Configuration</h2>
              <p className="text-xs text-v-text-3 mb-5">Set total stamps and where hidden rewards appear.</p>
              <div className="space-y-5">
                <Slider label="Total Stamps" displayValue={`${stampConfig.totalStamps} stamps`} min={5} max={20} step={1} value={stampConfig.totalStamps} onChange={e => setStampConfig(p => ({ ...p, totalStamps: Number(e.target.value) }))} />
                <div className="p-4 bg-v-surface-2 border border-v-border rounded-xl space-y-3">
                  <p className="text-xs font-semibold text-v-text-2 uppercase tracking-wider">Surprise Drop — First Half</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="From Stamp #" type="number" min={1} max={Math.floor(stampConfig.totalStamps / 2)} value={stampConfig.surpriseFrom} onChange={e => setStampConfig(p => ({ ...p, surpriseFrom: Number(e.target.value) }))} />
                    <Input label="To Stamp #" type="number" min={stampConfig.surpriseFrom} max={Math.floor(stampConfig.totalStamps / 2)} value={stampConfig.surpriseTo} onChange={e => setStampConfig(p => ({ ...p, surpriseTo: Number(e.target.value) }))} />
                  </div>
                  <Input label="Surprise Reward" placeholder="e.g. Mystery Treat" value={stampConfig.surpriseReward} onChange={e => setStampConfig(p => ({ ...p, surpriseReward: e.target.value }))} />
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Big Reward — Stamp #{stampConfig.totalStamps}</p>
                  <Input label="Big Reward" placeholder="e.g. Free Breakfast Combo" value={stampConfig.bigReward} onChange={e => setStampConfig(p => ({ ...p, bigReward: e.target.value }))} />
                </div>
                {/* Preview */}
                <div>
                  <p className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-3">Card Preview</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: stampConfig.totalStamps }, (_, i) => {
                      const n = i + 1
                      const isSurprise = n >= stampConfig.surpriseFrom && n <= stampConfig.surpriseTo
                      const isBig = n === stampConfig.totalStamps
                      return (
                        <div key={n} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border-2 ${isBig ? 'border-amber-400 bg-amber-50 text-amber-600' : isSurprise ? 'border-v-purple/40 bg-v-surface-2 text-v-purple' : 'border-v-border text-v-text-3'}`}>
                          {isBig ? '🏆' : isSurprise ? '?' : n}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'shake' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Shake & Win — Configuration</h2>
              <p className="text-xs text-v-text-3 mb-5">Win probability and rewards are configured in the next step.</p>
              <div className="p-4 bg-v-surface-2 border border-v-border rounded-xl text-sm text-v-text-2">
                Customers will shake their phone to reveal a reward. The outcome is determined by the reward pool you configure next.
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'dice' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Roll a Dice — Winning Faces</h2>
              <p className="text-xs text-v-text-3 mb-5">Mark which dice faces are winning rolls. Assign specific rewards in the next step.</p>
              <div className="grid grid-cols-3 gap-3">
                {diceOutcomes.map((o, i) => (
                  <button key={i} onClick={() => setDiceOutcomes(d => d.map((x, j) => j === i ? { ...x, isWin: !x.isWin } : x))}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${o.isWin ? 'border-amber-400 bg-amber-50' : 'border-v-border bg-white hover:border-v-border-b'}`}>
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-md flex items-center justify-center mb-2">
                      <DiceFaceSVG value={o.value} />
                    </div>
                    <p className="text-xs font-semibold text-v-text">Roll {o.value}</p>
                    <p className={`text-[10px] mt-0.5 font-medium ${o.isWin ? 'text-amber-600' : 'text-v-text-3'}`}>{o.isWin ? '🎁 Win' : 'No win'}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && mechanic === 'lottery' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Lottery — Ticket & Prize Tiers</h2>
              <p className="text-xs text-v-text-3 mb-5">Set the ticket limit and configure prize tiers including the jackpot.</p>
              <div className="space-y-5">
                <Slider label="Ticket Limit" displayValue={`${lotteryConfig.ticketLimit} tickets`} min={100} max={5000} step={100} value={lotteryConfig.ticketLimit} onChange={e => setLotteryConfig(p => ({ ...p, ticketLimit: Number(e.target.value) }))} />
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2"><span className="text-xl">👑</span><span className="text-sm font-bold text-amber-700">Jackpot Prize</span></div>
                  <Input placeholder="e.g. Free Month Subscription" value={lotteryConfig.jackpot} onChange={e => setLotteryConfig(p => ({ ...p, jackpot: e.target.value }))} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-v-text-2 uppercase tracking-wider mb-3">Prize Tiers (with probability)</p>
                  <div className="space-y-2">
                    {lotteryConfig.tiers.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-v-surface-2 border border-v-border rounded-xl">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ background: t.color }} />
                        <span className="text-sm font-medium text-v-text w-16 shrink-0">{t.name}</span>
                        <input className="flex-1 bg-white border border-v-border rounded-lg px-3 py-1.5 text-sm text-v-text focus:outline-none focus:border-v-purple" placeholder="Reward" value={t.reward} onChange={e => setLotteryConfig(p => ({ ...p, tiers: p.tiers.map((x, j) => j === i ? { ...x, reward: e.target.value } : x) }))} />
                        <div className="flex items-center gap-1 shrink-0">
                          <input type="number" min={1} max={50} value={t.probability} onChange={e => setLotteryConfig(p => ({ ...p, tiers: p.tiers.map((x, j) => j === i ? { ...x, probability: Number(e.target.value) } : x) }))} className="w-12 bg-white border border-v-border rounded-lg px-2 py-1 text-sm text-center text-v-text focus:outline-none focus:border-v-purple" />
                          <span className="text-sm text-v-text-2">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Rewards pool (all non-stamp, non-lottery mechanics share this) */}
          {step === 3 && mechanic !== 'stamp' && mechanic !== 'lottery' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Reward Pool</h2>
              <p className="text-xs text-v-text-3 mb-5">Add rewards customers can win. Set a win probability for each. The remaining % is "no win".</p>
              <RewardPool rewards={rewards} setRewards={setRewards} />
            </Card>
          )}

          {step === 3 && mechanic === 'stamp' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Stamp Card Rewards</h2>
              <p className="text-xs text-v-text-3 mb-5">Rewards are fixed by stamp position — configured in the previous step.</p>
              <div className="space-y-3">
                {[
                  { icon: '🎁', title: stampConfig.surpriseReward || 'Surprise Drop', desc: `Triggered at stamps ${stampConfig.surpriseFrom}–${stampConfig.surpriseTo} (random)`, color: '#7C3AED' },
                  { icon: '🏆', title: stampConfig.bigReward || 'Big Reward', desc: `Triggered at stamp #${stampConfig.totalStamps} (completion)`, color: '#D97706' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-v-surface-2 border border-v-border rounded-xl">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${r.color}10`, border: `1px solid ${r.color}25` }}>{r.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-v-text">{r.title}</p>
                      <p className="text-xs text-v-text-3">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {step === 3 && mechanic === 'lottery' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-v-text mb-1">Lottery Rewards Summary</h2>
              <p className="text-xs text-v-text-3 mb-5">Prize tiers configured in the previous step.</p>
              <div className="space-y-2">
                {[{ icon: '👑', name: lotteryConfig.jackpot, tier: 'Jackpot', color: '#D97706' }, ...lotteryConfig.tiers.map(t => ({ icon: '🎟️', name: t.reward, tier: `${t.name} (${t.probability}%)`, color: t.color }))].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-v-surface-2 border border-v-border rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl bg-white border border-v-border">{r.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-v-text">{r.name || '—'}</p>
                      <p className="text-xs text-v-text-3">{r.tier}</p>
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
                <div className="space-y-0">
                  {[
                    { label: 'Campaign Name', value: basics.name || '—' },
                    { label: 'Mechanic', value: mechanic ? `${getMechanicEmoji(mechanic)} ${getMechanicLabel(mechanic)}` : '—' },
                    { label: 'Duration', value: basics.startDate && basics.endDate ? `${basics.startDate} → ${basics.endDate}` : '—' },
                    ...(!isLottery ? [
                      { label: 'User Cap', value: `${basics.userCap} users` },
                      { label: 'Plays Per User', value: `${basics.playsPerUser}` },
                    ] : [
                      { label: 'Ticket Limit', value: `${lotteryConfig.ticketLimit} tickets` },
                    ]),
                    { label: 'Daily Rewards Cap', value: basics.dailyRewardCap === 0 ? 'Unlimited' : `${basics.dailyRewardCap}/day` },
                    { label: 'Rewards', value: mechanic === 'lottery' ? `${lotteryConfig.tiers.length + 1} prize tiers` : mechanic === 'stamp' ? '2 (Surprise + Big Reward)' : `${rewards.filter(r => r.name).length} reward${rewards.length !== 1 ? 's' : ''}` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-v-border last:border-0">
                      <span className="text-sm text-v-text-2">{item.label}</span>
                      <span className="text-sm font-semibold text-v-text">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-xs text-v-text-3 mb-2">A PIN will be auto-generated on launch</p>
                <div className="text-4xl font-black tracking-[0.3em] text-v-border-b">···</div>
                <p className="text-xs text-v-text-3 mt-2">Rotates every 60 seconds · Campaign-level</p>
              </Card>
              <Button variant="gold" size="lg" className="w-full" onClick={handleLaunch}>
                <Zap className="w-5 h-5" /> Launch Campaign
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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

function DiceFaceSVG({ value }: { value: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  }
  return (
    <svg viewBox="0 0 100 100" width="32" height="32">
      {(dots[value] || []).map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" fill="#1E1B4B" />)}
    </svg>
  )
}
