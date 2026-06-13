import { cn } from '@/lib/utils'
import type { MechanicType, CampaignStatus } from '@/lib/types'
import { getMechanicLabel, getMechanicColor, getStatusColor } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
  dot?: boolean
}

export function Badge({ children, color = '#9B93C8', className, dot }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', className)}
      style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  )
}

export function MechanicBadge({ mechanic }: { mechanic: MechanicType }) {
  return <Badge color={getMechanicColor(mechanic)}>{getMechanicLabel(mechanic)}</Badge>
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const labels: Record<CampaignStatus, string> = {
    active: 'Active',
    draft: 'Draft',
    ended: 'Ended',
    paused: 'Paused',
  }
  return <Badge color={getStatusColor(status)} dot>{labels[status]}</Badge>
}
