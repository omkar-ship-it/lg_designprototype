'use client'
import { use, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Users, Delete, Gift, Sparkles } from 'lucide-react'
import { customerBusinesses } from '@/lib/mock-data'
import { MECHANIC_META } from '@/lib/utils'
import { MechanicPattern } from '@/components/customer/mechanic-pattern'
import { HERO_COVER } from '@/components/customer/hero-cover-data'
import type { MechanicType } from '@/lib/types'

const MECHANIC_GAME_LINKS: Record<MechanicType, string> = {
  stamp:   '/customer/games/stamp',
  spin:    '/customer/games/spin',
  shake:   '/customer/games/shake',
  dice:    '/customer/games/dice',
  lottery: '/customer/games/lottery',
  checkin: '/customer/games/checkin',
  buyxgety: '/customer/games/buyxgety',
  coupon: '/customer/games/coupon',
  flash: '/customer/games/flash',
  friend: '/customer/games/friend',
  groupunlock: '/customer/games/groupunlock',
  combo: '/customer/games/combo',
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

// Duration ranges drop the year — the two dates already imply the span
function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// Splits a reward string like "Free Coffee ☕" into its label and trailing emoji
function splitReward(text: string): { label: string; icon: string } {
  const match = text.match(/^(.*?)\s*([\p{Extended_Pictographic}️‍]+)\s*$/u)
  return match ? { label: match[1], icon: match[2] } : { label: text, icon: '🎁' }
}

// Shared "Duration + players" stat box, tinted to the mechanic's brand color
function DurationPlayersBox({ cardFrom, startDate, endDate, participants, className = '' }: {
  cardFrom: string; startDate: string; endDate: string; participants: number; className?: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: `${cardFrom}12` }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</p>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: cardFrom }}>
          <Users className="w-3 h-3" />
          <span>{participants.toLocaleString()} players</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-800">
        {fmtDateShort(startDate)} → {fmtDateShort(endDate)}
      </p>
    </div>
  )
}

interface ClaimRedeemGridProps {
  cardFrom: string
  cardTo: string
  claimLabel?: string
  claimDate: string
  redeemDate?: string
  progress?: {
    label: string
    current: number
    total: number
    remainingLabel: string
    showBar?: boolean
  }
  reward?: string
  terms?: string
  /** Shown as a small "N people already joined" line — replaces the separate Duration/players box these mechanics no longer need, since Claim Before already covers the relevant date. */
  participants?: number
}

// Shared claim/redeem/spots/reward grid — reused by buyxgety, coupon, flash, friend, groupunlock, combo
function ClaimRedeemGrid({ cardFrom, cardTo, claimLabel = 'Claim Before', claimDate, redeemDate, progress, reward, terms, participants }: ClaimRedeemGridProps) {
  return (
    <>
      {participants !== undefined && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold mb-3" style={{ color: cardFrom }}>
          <Users className="w-3 h-3" />
          <span>{participants.toLocaleString()} people already joined</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl p-4" style={{ background: `${cardFrom}12` }}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{claimLabel}</p>
          <p className="text-sm font-bold text-gray-900">{fmtDate(claimDate)}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: `${cardFrom}12` }}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Redeem Before</p>
          <p className="text-sm font-bold text-gray-900">{redeemDate ? fmtDate(redeemDate) : '—'}</p>
        </div>
        {progress && (
          <div className="col-span-2 rounded-2xl p-4" style={{ background: `${cardFrom}12` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">{progress.label}</p>
              <p className="text-xs font-semibold" style={{ color: cardFrom }}>
                {Math.max(0, progress.total - progress.current)} {progress.remainingLabel}
              </p>
            </div>
            <p className={`text-sm font-bold text-gray-900 ${progress.showBar ? 'mb-2' : ''}`}>
              {progress.current} / {progress.total}
            </p>
            {progress.showBar && (
              <div className="h-1.5 rounded-full bg-white overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
                    background: `linear-gradient(90deg, ${cardFrom}, ${cardTo})`,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {reward && (
          <div className="col-span-2 rounded-2xl p-4 text-center" style={{ background: `${cardFrom}12` }}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reward</p>
            <p className="text-sm font-bold" style={{ color: cardFrom }}>{reward}</p>
          </div>
        )}
      </div>
      {terms && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">Terms &amp; Conditions</p>
          <p className="text-xs text-gray-500 leading-relaxed">{terms}</p>
        </div>
      )}
    </>
  )
}

// Inline PIN entry — digit boxes + on-screen numeric keypad + submit button, embedded directly in a mechanic's card
function InlineKeypad({ cardFrom, cardTo, digits, pressDigit, pressBackspace, onSubmit, disabled, submitLabel }: {
  cardFrom: string; cardTo: string; digits: string[]; pressDigit: (d: string) => void; pressBackspace: () => void
  onSubmit: () => void; disabled: boolean; submitLabel: string
}) {
  return (
    <>
      <p className="text-sm font-bold text-gray-900 text-center mb-1">Enter the code shared by staff</p>
      <p className="text-xs text-gray-400 text-center mb-4">3-digit code · refreshes every 2 minutes</p>

      <div className="flex gap-2.5 justify-center mb-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-gray-900 transition-colors"
            style={{
              background: '#F9FAFB',
              border: digits[i] ? `2px solid ${cardFrom}` : '2px solid #E5E7EB',
            }}
          >
            {digits[i]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 max-w-[220px] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <motion.button
            key={d}
            whileTap={{ scale: 0.92 }}
            onClick={() => pressDigit(d)}
            className="py-2 rounded-xl text-sm font-bold text-gray-800 bg-gray-50"
          >
            {d}
          </motion.button>
        ))}
        <div />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => pressDigit('0')}
          className="py-2 rounded-xl text-sm font-bold text-gray-800 bg-gray-50"
        >
          0
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={pressBackspace}
          className="py-2 rounded-xl flex items-center justify-center text-gray-500 bg-gray-50"
        >
          <Delete className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={disabled}
        className="w-full py-4 rounded-2xl font-bold text-base transition-all"
        style={{
          background: !disabled ? `linear-gradient(135deg, ${cardFrom}, ${cardTo})` : '#F3F4F6',
          color: !disabled ? 'white' : '#9CA3AF',
          boxShadow: !disabled ? `0 8px 28px ${cardFrom}55` : 'none',
        }}
      >
        {submitLabel}
      </motion.button>
    </>
  )
}

function PlayedTodayNote({ label }: { label: string }) {
  return (
    <div className="w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-400 bg-gray-50 flex items-center justify-center gap-2">
      <span>✓</span> {label} · Come back tomorrow
    </div>
  )
}

// Single white card: mechanic-specific info (children) + duration/players + inline keypad — the shared shell for every non-groupunlock, non-spin mechanic
function MechanicCard({ cardFrom, cardTo, children, startDate, endDate, participants, showDuration = true, playedToday, playedLabel, submitLabel, digits, pressDigit, pressBackspace, onSubmit, disabled }: {
  cardFrom: string; cardTo: string; children?: ReactNode
  startDate: string; endDate: string; participants: number
  /** Skip when the mechanic-specific content (e.g. ClaimRedeemGrid) already shows the relevant date, to avoid showing the same date twice. */
  showDuration?: boolean
  playedToday?: boolean; playedLabel: string; submitLabel: string
  digits: string[]; pressDigit: (d: string) => void; pressBackspace: () => void; onSubmit: () => void; disabled: boolean
}) {
  return (
    <div className="mb-6">
      <div className="rounded-3xl bg-white px-5 py-5" style={{ boxShadow: `0 16px 48px ${cardFrom}20, 0 0 0 1px ${cardFrom}1A` }}>
        {children}
        {showDuration && (
          <DurationPlayersBox cardFrom={cardFrom} startDate={startDate} endDate={endDate} participants={participants} className="mb-5" />
        )}
        {playedToday ? (
          <PlayedTodayNote label={playedLabel} />
        ) : (
          <InlineKeypad
            cardFrom={cardFrom}
            cardTo={cardTo}
            digits={digits}
            pressDigit={pressDigit}
            pressBackspace={pressBackspace}
            onSubmit={onSubmit}
            disabled={disabled}
            submitLabel={submitLabel}
          />
        )}
      </div>
    </div>
  )
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string; type: string }> }) {
  const { id, type } = use(params)
  const router = useRouter()

  const biz      = customerBusinesses.find(b => b.id === id) ?? customerBusinesses[0]
  const mechanic = biz.mechanics.find(m => m.type === type) ?? biz.mechanics[0]
  const meta     = MECHANIC_META[mechanic.type as MechanicType]
  const hero     = HERO_COVER[mechanic.type as MechanicType]
  const Art      = hero?.art

  const [digits, setDigits] = useState(['', '', ''])

  // Inline keypad — pressing a digit fills the first empty slot
  const pressDigit = (d: string) => {
    const i = digits.findIndex(x => !x)
    if (i === -1) return
    const next = [...digits]
    next[i] = d
    setDigits(next)
  }

  const pressBackspace = () => {
    const i = [...digits].reverse().findIndex(x => x)
    if (i === -1) return
    const realIdx = digits.length - 1 - i
    const next = [...digits]
    next[realIdx] = ''
    setDigits(next)
  }

  const joinCampaign = () => {
    if (digits.some(d => !d)) return
    // groupunlock's "Reserve a Spot" step always goes to the standard route — claimRoute only
    // applies to the "Claim Now" step once the group is full and this camper has reserved.
    const isGroupReserveStep = mechanic.type === 'groupunlock'
      && !(mechanic.hasReserved && (mechanic.groupJoined ?? 0) >= (mechanic.groupTarget ?? Infinity))
    const base = !isGroupReserveStep && mechanic.claimRoute
      ? mechanic.claimRoute
      : MECHANIC_GAME_LINKS[mechanic.type as MechanicType]
    router.push(mechanic.type === 'stamp' ? `${base}?stamp=1` : base)
  }

  const codeComplete = digits.every(d => !!d)

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* Cover */}
      {hero ? (
        <div
          className={`relative overflow-hidden ${hero.footerBanner ? 'h-96' : hero.features ? 'h-80' : 'h-64'}`}
          style={{ background: `linear-gradient(135deg, ${hero.bgFrom}, ${hero.bgTo})` }}
        >
          <span className="absolute top-24 right-16 w-2 h-2 rounded-full" style={{ background: hero.textColor, opacity: 0.25 }} />
          <span className="absolute bottom-24 left-10 w-1.5 h-1.5 rounded-full" style={{ background: hero.textColor, opacity: 0.3 }} />
          <span className="absolute top-32 left-24 w-1 h-1 rounded-full" style={{ background: hero.textColor, opacity: 0.2 }} />

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center z-10"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Badges */}
          <div className="absolute top-12 right-4 z-10 flex flex-col items-end gap-1.5">
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70"
              style={{ color: hero.badgeTextColor ?? hero.textColor }}
            >
              {meta.label}
            </span>
            {hero.badgeRight ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-md text-white text-right max-w-[130px] leading-tight">
                {hero.badgeRight}
              </span>
            ) : (
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: STATUS_STYLES[mechanic.status]?.bg, color: STATUS_STYLES[mechanic.status]?.text }}
              >
                {STATUS_STYLES[mechanic.status]?.label}
              </span>
            )}
          </div>

          {hero.layout === 'side' ? (
            <div className="relative h-full flex flex-col justify-between pt-24 pb-10 px-5">
              <div className="flex items-center justify-between">
                <div className="max-w-[55%]">
                  <p className="text-2xl font-extrabold leading-tight" style={{ color: hero.textColor }}>
                    {hero.headline}
                  </p>
                  {hero.headlineAccent && (
                    <p className="text-2xl font-extrabold leading-tight" style={{ color: hero.accentColor ?? hero.textColor }}>
                      {hero.headlineAccent}
                    </p>
                  )}
                  <p className="text-xs mt-1.5 leading-snug opacity-80" style={{ color: hero.textColor }}>
                    {hero.tagline}
                  </p>
                </div>
                {Art && (
                  <motion.div
                    className="w-36 h-36 shrink-0"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Art className="w-full h-full" />
                  </motion.div>
                )}
              </div>

              {(hero.features || hero.footerBanner) && (
                <div className="flex flex-col gap-2">
                  {hero.features && (
                    <div className="rounded-xl bg-white/40 backdrop-blur-sm px-3 py-2.5 flex items-center justify-center gap-2">
                      {hero.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-1.5 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: hero.accentColor ?? hero.textColor }}>
                            <f.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[10px] leading-tight font-medium" style={{ color: hero.textColor }}>
                            {f.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {hero.footerBanner && (
                    <div className="rounded-xl bg-white/60 backdrop-blur-sm px-4 py-3 flex items-center justify-center gap-2.5">
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: hero.accentColor ?? hero.textColor }}>
                        <Gift className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-center" style={{ color: hero.accentColor ?? hero.textColor }}>
                        {hero.footerBanner}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: hero.accentColor ?? hero.textColor }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-full flex flex-col items-center justify-center pt-20 pb-10 px-5">
              <p className="text-2xl font-extrabold text-center leading-tight" style={{ color: hero.textColor }}>
                {hero.headline}
              </p>
              {hero.headlineAccent && (
                <p className="text-2xl font-extrabold text-center leading-tight" style={{ color: hero.accentColor ?? hero.textColor }}>
                  {hero.headlineAccent}
                </p>
              )}
              <p className="text-xs text-center leading-snug opacity-90 mt-1.5 mb-2" style={{ color: hero.textColor }}>
                {hero.tagline}
              </p>
              {Art && (
                <motion.div
                  className="w-40 h-32 shrink-0"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Art className="w-full h-full" />
                </motion.div>
              )}
              {hero.features && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  {hero.features.map((f, fi) => (
                    <div key={fi} className="flex flex-col items-center gap-1 w-16">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <f.icon className="w-3.5 h-3.5" style={{ color: hero.textColor }} />
                      </div>
                      <span className="text-[9px] leading-tight text-center opacity-85" style={{ color: hero.textColor }}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scallop */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem]" />
        </div>
      ) : (
        <div
          className="relative h-56 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}
        >
          <MechanicPattern type={mechanic.type as MechanicType} opacity={0.14} />
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
      )}

      {/* Body */}
      <div className="px-5 pt-3">

        {/* Title + points badge */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h1 className="text-xl font-extrabold text-gray-900">{mechanic.label}</h1>
          {mechanic.type === 'checkin' && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              +100 pts / visit
            </span>
          )}
        </div>

        {/* Offered by — who this campaign belongs to, up front rather than buried at the bottom */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[11px] shrink-0">{biz.coverEmoji}</div>
          <p className="text-xs font-semibold text-gray-500">{biz.name}</p>
        </div>

        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{mechanic.description}</p>

        {mechanic.type === 'spin' ? (
          <div className="mb-6">
            <div
              className="rounded-3xl bg-white px-5 py-5"
              style={{ boxShadow: `0 16px 48px ${meta.cardFrom}20, 0 0 0 1px ${meta.cardFrom}1A` }}
            >
              {/* Rewards */}
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-3">What you could win</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(mechanic.prizes ?? []).map((p, i) => {
                  const { label, icon } = splitReward(p)
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-3 flex items-center gap-2.5"
                      style={{ background: `${meta.cardFrom}0F` }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{ background: `${meta.cardFrom}1F` }}
                      >
                        {icon}
                      </div>
                      <span className="text-xs font-bold text-gray-800 leading-tight">{label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Duration + players */}
              <div className="flex items-center justify-between rounded-2xl p-4 mb-5" style={{ background: `${meta.cardFrom}0F` }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${meta.cardFrom}1F` }}>
                    <CalendarDays className="w-4 h-4" style={{ color: meta.cardFrom }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Duration</p>
                    <p className="text-sm font-bold text-gray-800">
                      {fmtDateShort(mechanic.startDate)} → {fmtDateShort(mechanic.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold shrink-0" style={{ color: meta.cardFrom }}>
                  <Users className="w-3.5 h-3.5" />
                  <span>{mechanic.participants.toLocaleString()}</span>
                </div>
              </div>

              {mechanic.playedToday ? (
                <div className="w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-400 bg-gray-50 flex items-center justify-center gap-2">
                  <span>✓</span> Played today · Come back tomorrow
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-900 text-center mb-1">Enter the code shared by staff</p>
                  <p className="text-xs text-gray-400 text-center mb-4">3-digit code · refreshes every 2 minutes</p>

                  {/* Digit boxes */}
                  <div className="flex gap-2.5 justify-center mb-4">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-gray-900 transition-colors"
                        style={{
                          background: '#F9FAFB',
                          border: digits[i] ? `2px solid ${meta.cardFrom}` : '2px solid #E5E7EB',
                        }}
                      >
                        {digits[i]}
                      </div>
                    ))}
                  </div>

                  {/* Numeric keypad */}
                  <div className="grid grid-cols-3 gap-2 mb-4 max-w-[220px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                      <motion.button
                        key={d}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => pressDigit(d)}
                        className="py-2 rounded-xl text-sm font-bold text-gray-800 bg-gray-50"
                      >
                        {d}
                      </motion.button>
                    ))}
                    <div />
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => pressDigit('0')}
                      className="py-2 rounded-xl text-sm font-bold text-gray-800 bg-gray-50"
                    >
                      0
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={pressBackspace}
                      className="py-2 rounded-xl flex items-center justify-center text-gray-500 bg-gray-50"
                    >
                      <Delete className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={joinCampaign}
                    disabled={!codeComplete}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all"
                    style={{
                      background: codeComplete ? `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` : '#F3F4F6',
                      color: codeComplete ? 'white' : '#9CA3AF',
                      boxShadow: codeComplete ? `0 8px 28px ${meta.cardFrom}55` : 'none',
                    }}
                  >
                    Play Now {meta.emoji}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Stamp Card — collected/total figure, duration/players + inline keypad */}
            {mechanic.type === 'stamp' && mechanic.stampsCollected !== undefined && mechanic.totalStamps && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                playedToday={mechanic.playedToday}
                playedLabel="Collected today"
                submitLabel={`Enter PIN & Collect Stamp ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="rounded-2xl p-4 mb-5 text-center" style={{ background: `${meta.cardFrom}12` }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Stamps Collected</p>
                  <p className="text-2xl font-black" style={{ color: meta.cardFrom }}>
                    {mechanic.stampsCollected}
                    <span className="text-sm font-semibold text-gray-400">/{mechanic.totalStamps}</span>
                  </p>
                </div>
              </MechanicCard>
            )}

            {/* Prizes — dice / shake, in a single card with duration/players + inline keypad */}
            {(mechanic.type === 'dice' || mechanic.type === 'shake') && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                playedToday={mechanic.playedToday}
                playedLabel="Played today"
                submitLabel={`Play Now ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                {mechanic.prizes && mechanic.prizes.length > 0 && (
                  <>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-3">What you could win</p>
                    <div className="flex flex-wrap gap-2 mb-5">
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
                  </>
                )}
              </MechanicCard>
            )}

            {/* Lottery — draw date + tickets, duration/players + inline keypad, all in one card */}
            {mechanic.type === 'lottery' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                playedToday={mechanic.playedToday}
                playedLabel="Played today"
                submitLabel="Play Now"
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Draw Date</p>
                    <p className="text-sm font-bold text-gray-800">
                      {mechanic.drawDate ? fmtDate(mechanic.drawDate) : '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Your Tickets</p>
                    <p className="text-2xl font-black" style={{ color: meta.cardFrom }}>
                      {mechanic.userTickets ?? 0}
                      <span className="text-xs font-semibold text-gray-400 ml-1">tickets</span>
                    </p>
                  </div>
                </div>
              </MechanicCard>
            )}

            {/* Check-in — points per visit + total points, duration/players + inline keypad */}
            {mechanic.type === 'checkin' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                playedToday={mechanic.playedToday}
                playedLabel="Checked in today"
                submitLabel="Check In & Earn Points ⭐"
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl p-4" style={{ background: `${meta.cardFrom}12` }}>
                    <p className="text-2xl mb-0.5">🎯</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Points per Check-in</p>
                    <p className="text-2xl font-black text-gray-900">
                      +100
                      <span className="text-xs font-semibold text-gray-400 ml-1">pts</span>
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
              </MechanicCard>
            )}

            {/* Buy X Get Y — claim window, spots, redeem window */}
            {mechanic.type === 'buyxgety' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                showDuration={false}
                playedToday={mechanic.playedToday}
                playedLabel="Claimed today"
                submitLabel={`Claim Now ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="mb-5">
                  <ClaimRedeemGrid
                    cardFrom={meta.cardFrom}
                    cardTo={meta.cardTo}
                    claimDate={mechanic.endDate}
                    redeemDate={mechanic.buyRedeemBefore}
                    progress={mechanic.buyTotalSlots !== undefined && mechanic.buyClaimed !== undefined ? {
                      label: 'Spots Claimed', current: mechanic.buyClaimed, total: mechanic.buyTotalSlots, remainingLabel: 'remaining',
                    } : undefined}
                    reward={mechanic.buyReward}
                    participants={mechanic.participants}
                  />
                </div>
              </MechanicCard>
            )}

            {/* Coupon Codes — claim window, spots, redeem window, terms */}
            {mechanic.type === 'coupon' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                showDuration={false}
                playedToday={mechanic.playedToday}
                playedLabel="Claimed today"
                submitLabel={`Claim Now ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="mb-5">
                  <ClaimRedeemGrid
                    cardFrom={meta.cardFrom}
                    cardTo={meta.cardTo}
                    claimDate={mechanic.endDate}
                    redeemDate={mechanic.couponRedeemBefore}
                    progress={mechanic.couponTotalSlots !== undefined && mechanic.couponClaimed !== undefined ? {
                      label: 'Coupons Claimed', current: mechanic.couponClaimed, total: mechanic.couponTotalSlots, remainingLabel: 'remaining',
                    } : undefined}
                    reward={mechanic.couponReward}
                    terms={mechanic.couponTerms}
                    participants={mechanic.participants}
                  />
                </div>
              </MechanicCard>
            )}

            {/* Flash Deal — claim window, spots, redeem window, terms */}
            {mechanic.type === 'flash' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                showDuration={false}
                playedToday={mechanic.playedToday}
                playedLabel="Claimed today"
                submitLabel={`Claim Now ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="mb-5">
                  <ClaimRedeemGrid
                    cardFrom={meta.cardFrom}
                    cardTo={meta.cardTo}
                    claimDate={mechanic.endDate}
                    redeemDate={mechanic.flashRedeemBefore}
                    progress={mechanic.flashTotalSlots !== undefined && mechanic.flashClaimed !== undefined ? {
                      label: 'Spots Claimed', current: mechanic.flashClaimed, total: mechanic.flashTotalSlots, remainingLabel: 'remaining',
                    } : undefined}
                    reward={mechanic.flashReward}
                    terms={mechanic.flashTerms}
                    participants={mechanic.participants}
                  />
                </div>
              </MechanicCard>
            )}

            {/* Bring a Friend — friend progress, claim window, redeem window, reward */}
            {mechanic.type === 'friend' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                showDuration={false}
                playedToday={mechanic.playedToday}
                playedLabel="Claimed today"
                submitLabel={`Claim Now ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="mb-5">
                  <ClaimRedeemGrid
                    cardFrom={meta.cardFrom}
                    cardTo={meta.cardTo}
                    claimDate={mechanic.endDate}
                    redeemDate={mechanic.friendRedeemBefore}
                    progress={mechanic.friendMinFriends !== undefined ? {
                      label: 'Friends Brought', current: mechanic.friendsBrought ?? 0, total: mechanic.friendMinFriends, remainingLabel: 'more to go', showBar: true,
                    } : undefined}
                    reward={mechanic.friendReward}
                    participants={mechanic.participants}
                  />
                </div>
              </MechanicCard>
            )}

            {/* Community Offer — Group Unlock: shared group progress, reserve/redeem window, reward — bespoke 4-state bottom section */}
            {mechanic.type === 'groupunlock' && (() => {
              const groupFull = (mechanic.groupJoined ?? 0) >= (mechanic.groupTarget ?? Infinity)
              return (
                <div className="mb-6">
                  <div className="rounded-3xl bg-white px-5 py-5" style={{ boxShadow: `0 16px 48px ${meta.cardFrom}20, 0 0 0 1px ${meta.cardFrom}1A` }}>
                    <div className="mb-5">
                      <ClaimRedeemGrid
                        cardFrom={meta.cardFrom}
                        cardTo={meta.cardTo}
                        claimLabel="Reserve Before"
                        claimDate={mechanic.endDate}
                        redeemDate={mechanic.groupRedeemBefore}
                        progress={mechanic.groupTarget !== undefined ? {
                          label: 'People Joined', current: mechanic.groupJoined ?? 0, total: mechanic.groupTarget, remainingLabel: 'more to unlock', showBar: true,
                        } : undefined}
                        reward={mechanic.groupReward}
                      />
                    </div>

                    {mechanic.hasReserved && groupFull ? (
                      <InlineKeypad
                        cardFrom={meta.cardFrom}
                        cardTo={meta.cardTo}
                        digits={digits}
                        pressDigit={pressDigit}
                        pressBackspace={pressBackspace}
                        onSubmit={joinCampaign}
                        disabled={!codeComplete}
                        submitLabel={`Claim Now ${meta.emoji}`}
                      />
                    ) : mechanic.hasReserved ? (
                      <Link
                        href={`/customer/games/${mechanic.type}`}
                        className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-500 bg-gray-100"
                      >
                        ✓ Reserved — View Status
                      </Link>
                    ) : groupFull ? (
                      <div className="w-full py-4 rounded-2xl font-semibold text-sm text-center text-gray-400 bg-gray-100">
                        Group Full
                      </div>
                    ) : (
                      <InlineKeypad
                        cardFrom={meta.cardFrom}
                        cardTo={meta.cardTo}
                        digits={digits}
                        pressDigit={pressDigit}
                        pressBackspace={pressBackspace}
                        onSubmit={joinCampaign}
                        disabled={!codeComplete}
                        submitLabel={`Reserve a Spot ${meta.emoji}`}
                      />
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Package/Combo Deal — bundle contents/pricing, claim/redeem window, spots, terms */}
            {mechanic.type === 'combo' && (
              <MechanicCard
                cardFrom={meta.cardFrom}
                cardTo={meta.cardTo}
                startDate={mechanic.startDate}
                endDate={mechanic.endDate}
                participants={mechanic.participants}
                showDuration={false}
                playedToday={mechanic.playedToday}
                playedLabel="Claimed today"
                submitLabel={`Claim Now ${meta.emoji}`}
                digits={digits}
                pressDigit={pressDigit}
                pressBackspace={pressBackspace}
                onSubmit={joinCampaign}
                disabled={!codeComplete}
              >
                <div className="rounded-2xl p-4 mb-3" style={{ background: `${meta.cardFrom}12` }}>
                  {mechanic.comboVariant === 'freeitem' ? (
                    <>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">The Deal</p>
                      <div className="flex items-center flex-wrap gap-2">
                        {(mechanic.comboPaidItems ?? []).map((it, idx) => (
                          <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-700 shadow-sm">{it}</span>
                        ))}
                        <span className="text-sm text-gray-400 font-bold">+</span>
                        {(mechanic.comboFreeItems ?? []).map((it, idx) => (
                          <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${meta.cardFrom}, ${meta.cardTo})` }}>
                            {it} FREE
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">What&apos;s Included</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(mechanic.comboItems ?? []).map((it, idx) => (
                          <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-700 shadow-sm">{it}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          {mechanic.comboOriginalPrice !== undefined && (
                            <span className="text-sm text-gray-400 line-through">₹{mechanic.comboOriginalPrice}</span>
                          )}
                          {mechanic.comboBundlePrice !== undefined && (
                            <span className="text-xl font-black" style={{ color: meta.cardFrom }}>₹{mechanic.comboBundlePrice}</span>
                          )}
                        </div>
                        {mechanic.comboOriginalPrice !== undefined && mechanic.comboBundlePrice !== undefined && mechanic.comboOriginalPrice > mechanic.comboBundlePrice && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white" style={{ color: meta.cardFrom }}>
                            Save ₹{mechanic.comboOriginalPrice - mechanic.comboBundlePrice} ({Math.round(((mechanic.comboOriginalPrice - mechanic.comboBundlePrice) / mechanic.comboOriginalPrice) * 100)}%)
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-5">
                  <ClaimRedeemGrid
                    cardFrom={meta.cardFrom}
                    cardTo={meta.cardTo}
                    claimDate={mechanic.endDate}
                    redeemDate={mechanic.comboRedeemBefore}
                    progress={mechanic.comboTotalSpots !== undefined ? {
                      label: 'Spots Claimed', current: mechanic.comboClaimed ?? 0, total: mechanic.comboTotalSpots, remainingLabel: 'remaining',
                    } : undefined}
                    terms={mechanic.comboTerms}
                    participants={mechanic.participants}
                  />
                </div>
              </MechanicCard>
            )}

          </>
        )}
      </div>
    </div>
  )
}
