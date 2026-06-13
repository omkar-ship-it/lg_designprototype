import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-v-surface border border-v-border rounded-2xl',
        hover && 'hover:border-v-border-b hover:bg-v-surface-2 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  color = '#7C3AED',
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon: string
  color?: string
  trend?: { value: string; up: boolean }
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', trend.up ? 'text-v-success bg-v-success/10' : 'text-v-danger bg-v-danger/10')}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-v-text">{value}</div>
      <div className="text-xs font-medium text-v-text-2 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-v-text-3 mt-1">{sub}</div>}
    </Card>
  )
}

export function ProgressBar({
  value,
  max,
  color = '#7C3AED',
  className,
}: {
  value: number
  max: number
  color?: string
  className?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className={cn('w-full bg-v-border rounded-full h-1.5', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}
