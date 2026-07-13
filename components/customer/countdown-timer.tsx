'use client'
import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

function getRemaining(targetMs: number) {
  const diffMs = targetMs - Date.now()
  const clamped = Math.max(0, diffMs)
  const totalSeconds = Math.floor(clamped / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: diffMs <= 0,
  }
}

interface CountdownTimerProps {
  /** ISO datetime to count down to */
  target: string
  color: string
  className?: string
}

/** Live "time left to claim" countdown — ticks every second, used on Flash Deal cards. */
export function CountdownTimer({ target, color, className = '' }: CountdownTimerProps) {
  const targetMs = new Date(target).getTime()
  const [remaining, setRemaining] = useState(() => getRemaining(targetMs))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold ${className}`} style={{ color }}>
      <Timer className="w-3.5 h-3.5 shrink-0" />
      {remaining.expired ? (
        <span>Deal ended</span>
      ) : remaining.days > 0 ? (
        <span>{remaining.days}d {remaining.hours}h {remaining.minutes}m left to claim</span>
      ) : (
        <span>{remaining.hours}h {remaining.minutes}m {remaining.seconds}s left to claim</span>
      )}
    </div>
  )
}
