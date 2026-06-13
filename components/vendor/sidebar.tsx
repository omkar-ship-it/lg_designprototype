'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Megaphone, Users, Settings, ChevronRight, Zap } from 'lucide-react'

const nav = [
  { label: 'Dashboard',  href: '/vendor/dashboard',  icon: LayoutDashboard },
  { label: 'Campaigns',  href: '/vendor/campaigns',   icon: Megaphone },
  { label: 'Customers',  href: '/vendor/customers',   icon: Users },
  { label: 'Settings',   href: '/vendor/settings',    icon: Settings },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0" style={{ background: '#100E2B', borderRight: '1px solid #2A2660' }}>
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid #2A2660' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}>
            🧞
          </div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#F0EFFF' }}>LoyalGenie</div>
            <div className="text-[10px] font-medium" style={{ color: '#5B5897' }}>Brew & Bite Café</div>
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
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150')}
              style={{
                background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: active ? '#F0EFFF' : '#9B93C8',
                border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
              }}
            >
              <Icon className="w-4 h-4" style={{ color: active ? '#9D6FF0' : '#5B5897' }} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: '#9D6FF0' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Status widget */}
      <div className="p-4">
        <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Zap className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F5C518' }} />
          <div>
            <div className="text-xs font-bold" style={{ color: '#F0EFFF' }}>3 Active Campaigns</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#5B5897' }}>312 players today</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
