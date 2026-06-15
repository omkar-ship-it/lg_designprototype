'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Wallet, User } from 'lucide-react'
import { motion } from 'framer-motion'

const nav = [
  { label: 'Home',     href: '/customer',         icon: Home    },
  { label: 'Discover', href: '/customer/discover', icon: Compass },
  { label: 'Wallet',   href: '/customer/wallet',   icon: Wallet  },
  { label: 'Profile',  href: '/customer/profile',  icon: User    },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 z-50 shadow-[0_-4px_24px_rgba(91,33,182,0.06)]">
      <div className="flex items-center justify-around py-2 px-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === '/customer' ? path === '/customer' : path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer select-none"
              >
                <div className="relative w-9 h-9 flex items-center justify-center">
                  {active && (
                    <motion.div
                      layoutId="nav-bubble"
                      className="absolute inset-0 rounded-full bg-purple-100"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${active ? 'text-purple-700' : 'text-gray-400'}`}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide leading-none transition-colors duration-200 ${active ? 'text-purple-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
