import clsx from 'clsx'

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'muted' | 'accent'

const STYLES: Record<Variant, string> = {
  success: 'bg-success-light text-success',
  danger:  'bg-danger-light text-danger',
  warning: 'bg-warning-light text-warning',
  info:    'bg-primary-50 text-primary',
  muted:   'bg-slate-100 text-muted',
  accent:  'bg-accent/15 text-accent-dark',
}

interface Props {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: Props) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STYLES[variant], className)}>
      {children}
    </span>
  )
}

export function statusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    completed: 'success', active: 'success', healthy: 'success', compliant: 'success', resolved: 'success',
    failed: 'danger', suspended: 'danger', down: 'danger', breach: 'danger', critical: 'danger',
    pending: 'warning', processing: 'warning', degraded: 'warning', warning: 'warning', investigating: 'warning',
    cancelled: 'muted', inactive: 'muted', low: 'muted',
    reversed: 'info', onboarding: 'info',
  }
  return map[status.toLowerCase()] ?? 'muted'
}
