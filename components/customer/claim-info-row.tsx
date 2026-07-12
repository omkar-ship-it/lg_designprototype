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
    <div className="rounded-2xl p-3 flex items-center gap-2.5 bg-white" style={{ border: `1px solid ${accent}25` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
