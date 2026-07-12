import type { LucideIcon } from 'lucide-react'

interface ClaimInfoRowProps {
  icon: LucideIcon
  label: string
  value: string
  accent: string
}

/** Icon-circle + label/value row for the extra info shown on ClaimReward screens. */
export function ClaimInfoRow({ icon: Icon, label, value, accent }: ClaimInfoRowProps) {
  return (
    <div className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.25)' }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
