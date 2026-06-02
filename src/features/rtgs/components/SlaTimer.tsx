import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  deadline: string
  className?: string
}

export function SlaTimer({ deadline, className }: Props) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    function calc() {
      setRemaining(Math.max(0, new Date(deadline).getTime() - Date.now()))
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [deadline])

  const totalMins = Math.floor(remaining / 60000)
  const secs      = Math.floor((remaining % 60000) / 1000)
  const hours     = Math.floor(totalMins / 60)
  const mins      = totalMins % 60
  const isUrgent  = remaining < 30 * 60 * 1000
  const isExpired = remaining === 0

  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-mono font-bold', {
      'text-red-400 animate-pulse': isExpired,
      'text-orange-400':            isUrgent && !isExpired,
      'text-green-400':             !isUrgent,
    }, className)}>
      <Clock size={11} />
      {isExpired
        ? 'EXPIRED'
        : hours > 0
        ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
    </span>
  )
}
