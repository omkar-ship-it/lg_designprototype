'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Megaphone, Users, Settings, ChevronRight, Zap,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard',  href: '/vendor/dashboard',  icon: LayoutDashboard },
  { label: 'Campaigns',  href: '/vendor/campaigns',   icon: Megaphone },
  { label: 'Customers',  href: '/vendor/customers',   icon: Users },
  { label: 'Settings',   href: '/vendor/settings',    icon: Settings },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-v-surface border-r border-v-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-v-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-v-purple/20 border border-v-purple/30 flex items-center justify-center text-xl">
            🧞
          </div>
          <div>
            <div className="text-sm font-extrabold text-v-text">LoyalGenie</div>
            <div className="text-[10px] text-v-text-3 font-medium">Brew & Bite Café</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-v-purple/15 text-v-text border border-v-purple/25'
                  : 'text-v-text-2 hover:text-v-text hover:bg-v-surface-2',
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-v-purple' : 'text-v-text-3')} />
              {label}
              {active && <ChevronRight className="w-3 h-3 text-v-purple ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade hint */}
      <div className="p-4">
        <div className="glass-purple rounded-xl p-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-v-gold mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-v-text">3 Active Campaigns</div>
            <div className="text-[10px] text-v-text-3 mt-0.5">312 players today</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
