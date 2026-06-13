'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { ComponentPropsWithoutRef } from 'react'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-v-purple text-white hover:bg-v-purple-l active:scale-95 shadow-sm shadow-purple-200',
    secondary: 'bg-white text-v-text border border-v-border hover:border-v-border-b hover:bg-v-surface-2 active:scale-95',
    ghost:     'text-v-text-2 hover:text-v-text hover:bg-v-surface-2 active:scale-95',
    danger:    'bg-red-50 text-v-danger border border-red-200 hover:bg-red-100 active:scale-95',
    gold:      'bg-v-gold text-white font-bold hover:bg-v-gold-d active:scale-95 shadow-sm',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
