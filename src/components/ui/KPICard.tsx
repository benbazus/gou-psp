import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'

type AccentColor = 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'muted'

const ACCENT_BORDER: Record<AccentColor, string> = {
  primary: 'border-t-primary',
  accent:  'border-t-accent',
  success: 'border-t-success',
  danger:  'border-t-danger',
  warning: 'border-t-warning',
  muted:   'border-t-muted',
}

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  accent?: AccentColor
  animate?: boolean
  className?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const spring = useSpring(0, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (inView) spring.set(value)
  }, [inView, value, spring])

  return <motion.span ref={ref}>{display}</motion.span>
}

export function KPICard({ title, value, subtitle, icon, accent = 'primary', animate = true, className }: Props) {
  return (
    <div className={clsx(
      'bg-card rounded-card shadow-card border-t-[3px] p-4 flex flex-col gap-1',
      ACCENT_BORDER[accent],
      className
    )}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{title}</span>
        {icon && <span className="text-muted/60">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-slate-800">
        {animate && typeof value === 'number' ? (
          <AnimatedNumber value={value} />
        ) : (
          value
        )}
      </div>
      {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
    </div>
  )
}

export function KPICardSkeleton() {
  return (
    <div className="bg-card rounded-card shadow-card border-t-[3px] border-t-slate-200 p-4 flex flex-col gap-2">
      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
    </div>
  )
}
