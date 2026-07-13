import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MechanicType, CampaignStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePIN(): string {
  return String(Math.floor(100 + Math.random() * 900))
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function hexMix(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA)
  const [r2, g2, b2] = hexToRgb(hexB)
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t)
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

export function getMechanicLabel(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: 'Shake & Win',
    stamp: 'Stamp Card',
    spin: 'Spin a Wheel',
    dice: 'Roll a Dice',
    lottery: 'Lottery',
    checkin: 'Daily Check-in',
    buyxgety: 'Buy X Get Y',
    coupon: 'Coupon Codes',
    flash: 'Flash Deal',
    friend: 'Bring a Friend',
    groupunlock: 'Community Offer — Group Unlock',
    combo: 'Package/Combo Deal',
  }
  return map[mechanic]
}

export function getMechanicEmoji(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: '🤳',
    stamp: '🎯',
    spin: '🎰',
    dice: '🎲',
    lottery: '🎟️',
    checkin: '📍',
    buyxgety: '💰',
    coupon: '🎫',
    flash: '⚡',
    friend: '👫',
    groupunlock: '🤝',
    combo: '🎁',
  }
  return map[mechanic]
}

// Delegates to MECHANIC_META so there's exactly one source of truth for a
// mechanic's brand color — badges, hero art, play screens, and reward
// screens all end up tinted identically instead of drifting apart.
export function getMechanicColor(mechanic: MechanicType): string {
  return MECHANIC_META[mechanic].cardFrom
}

export function getStatusColor(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    active: '#22C55E',
    draft: '#9B93C8',
    ended: '#5B5897',
    paused: '#F59E0B',
  }
  return map[status]
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Combines a date with a "6:00 PM"-style time string into a parseable ISO datetime. Returns the plain date (midnight) if no time is given. */
export function combineDateTime(dateStr: string, timeStr?: string): string {
  const d = new Date(dateStr)
  if (!timeStr) return d.toISOString()
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return d.toISOString()
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const isPM = match[3].toUpperCase() === 'PM'
  if (isPM && hours !== 12) hours += 12
  if (!isPM && hours === 12) hours = 0
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function capPercent(current: number, cap: number): number {
  return Math.min(100, Math.round((current / cap) * 100))
}

export const MECHANIC_META: Record<MechanicType, { label: string; badgeBg: string; badgeText: string; cardFrom: string; cardTo: string; emoji: string }> = {
  stamp:   { label: 'STAMP',        badgeBg: '#FEF3C7', badgeText: '#92400E', cardFrom: '#F59E0B', cardTo: '#D97706', emoji: '🎯' },
  spin:    { label: 'SPIN A WHEEL', badgeBg: '#EDE9FE', badgeText: '#5B21B6', cardFrom: '#7C3AED', cardTo: '#4C1D95', emoji: '🎰' },
  shake:   { label: 'SHAKE & WIN',  badgeBg: '#F3E8FF', badgeText: '#6B21A8', cardFrom: '#8B5CF6', cardTo: '#7C3AED', emoji: '🤳' },
  dice:    { label: 'ROLL A DICE',  badgeBg: '#FCE7F3', badgeText: '#9D174D', cardFrom: '#BE185D', cardTo: '#831843', emoji: '🎲' },
  lottery: { label: 'LOTTERY',      badgeBg: '#EDE9FE', badgeText: '#4C3FA8', cardFrom: '#7C6EF0', cardTo: '#4C3FA8', emoji: '🎟️' },
  checkin: { label: 'CHECK-IN',     badgeBg: '#D1FAE5', badgeText: '#065F46', cardFrom: '#10B981', cardTo: '#047857', emoji: '📍' },
  buyxgety: { label: 'BUY X GET Y', badgeBg: '#DCFCE7', badgeText: '#166534', cardFrom: '#16A34A', cardTo: '#15803D', emoji: '💰' },
  coupon:  { label: 'COUPON CODES', badgeBg: '#CFFAFE', badgeText: '#155E75', cardFrom: '#06B6D4', cardTo: '#0E7490', emoji: '🎫' },
  flash:   { label: 'FLASH DEAL',   badgeBg: '#DBEAFE', badgeText: '#1E40AF', cardFrom: '#2563EB', cardTo: '#1E3A8A', emoji: '⚡' },
  friend:  { label: 'BRING A FRIEND', badgeBg: '#FFE4E6', badgeText: '#9F1239', cardFrom: '#F43F5E', cardTo: '#9F1239', emoji: '👫' },
  groupunlock: { label: 'COMMUNITY OFFER', badgeBg: '#CCFBF1', badgeText: '#115E59', cardFrom: '#0D9488', cardTo: '#115E59', emoji: '🤝' },
  combo:   { label: 'COMBO DEAL',   badgeBg: '#E0E7FF', badgeText: '#3730A3', cardFrom: '#4F46E5', cardTo: '#3730A3', emoji: '🎁' },
}
