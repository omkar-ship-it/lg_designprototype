'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Home',    href: '/customer',         icon: Home },
  { label: 'Wallet',  href: '/customer/wallet',   icon: Wallet },
  { label: 'Profile', href: '/customer/profile',  icon: User },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm glass border-t border-white/10 z-50">
      <div className="flex items-center justify-around py-3 px-4">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || (href !== '/customer' && path.startsWith(href))
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all', active ? 'bg-c-purple/25' : '')}>
                <Icon className={cn('w-4 h-4 transition-colors', active ? 'text-c-purple-l' : 'text-white/40')} />
              </div>
              <span className={cn('text-[9px] font-semibold tracking-wide', active ? 'text-c-purple-l' : 'text-white/40')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
