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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-50">
      <div className="px-5 pb-5 pt-1">
        <div
          className="flex justify-around rounded-2xl py-3 px-2"
          style={{
            background: '#FFF8F4',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(91,33,182,0.1), 0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active = href === '/customer'
              ? path === '/customer'
              : path === href || path.startsWith(href + '/')
            return (
              <Link key={href} href={href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="relative flex flex-col items-center gap-1.5 py-1 cursor-pointer select-none"
                >
                  {active ? (
                    <>
                      {/* Floating circle — lifted above the bar */}
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute left-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          top: '-44px',
                          transform: 'translateX(-50%)',
                          background: 'linear-gradient(145deg, #8B5CF6, #6D28D9)',
                          boxShadow: '0 8px 28px rgba(109,40,217,0.55), 0 2px 8px rgba(0,0,0,0.12)',
                        }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </motion.div>
                      {/* Layout spacer so label sits at same height as inactive tabs */}
                      <div style={{ width: 18, height: 18 }} />
                    </>
                  ) : (
                    <Icon className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.8} />
                  )}
                  <span
                    className={`text-[10px] font-semibold tracking-wide leading-none ${
                      active ? 'text-purple-700' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
