import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MechanicType, CampaignStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePIN(): string {
  return String(Math.floor(100 + Math.random() * 900))
}

export function getMechanicLabel(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: 'Shake & Win',
    stamp: 'Stamp Card',
    spin: 'Spin a Wheel',
    dice: 'Roll a Dice',
    lottery: 'Lottery',
  }
  return map[mechanic]
}

export function getMechanicEmoji(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: '🤳',
    stamp: '🎯',
    spin: '🎡',
    dice: '🎲',
    lottery: '🎟️',
  }
  return map[mechanic]
}

export function getMechanicColor(mechanic: MechanicType): string {
  const map: Record<MechanicType, string> = {
    shake: '#EC4899',
    stamp: '#F59E0B',
    spin: '#06B6D4',
    dice: '#22C55E',
    lottery: '#8B5CF6',
  }
  return map[mechanic]
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
