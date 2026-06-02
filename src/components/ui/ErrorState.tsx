import { AlertTriangle, RefreshCw, WifiOff, ShieldX, ServerCrash } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

type ErrorKind = 'generic' | 'network' | 'permission' | 'server' | 'empty'

const CONFIG: Record<ErrorKind, {
  icon: React.ElementType
  title: string
  defaultMessage: string
  iconClass: string
  bgClass: string
}> = {
  generic:    { icon: AlertTriangle, title: 'Something went wrong',      defaultMessage: 'An unexpected error occurred. Please try again.',        iconClass: 'text-warning',  bgClass: 'bg-warning/10'  },
  network:    { icon: WifiOff,       title: 'Connection failed',          defaultMessage: 'Unable to reach the server. Check your connection.',     iconClass: 'text-danger',   bgClass: 'bg-danger/10'   },
  permission: { icon: ShieldX,       title: 'Access denied',              defaultMessage: 'You do not have permission to view this resource.',       iconClass: 'text-danger',   bgClass: 'bg-danger/10'   },
  server:     { icon: ServerCrash,   title: 'Server error',               defaultMessage: 'The server returned an error. Our team has been notified.', iconClass: 'text-danger', bgClass: 'bg-danger/10'   },
  empty:      { icon: AlertTriangle, title: 'No data available',          defaultMessage: 'There are no records to display at this time.',           iconClass: 'text-muted',    bgClass: 'bg-surface'     },
}

interface Props {
  kind?: ErrorKind
  message?: string
  onRetry?: () => void
  className?: string
  compact?: boolean
}

export function ErrorState({ kind = 'generic', message, onRetry, className, compact = false }: Props) {
  const { icon: Icon, title, defaultMessage, iconClass, bgClass } = CONFIG[kind]
  const msg = message ?? defaultMessage

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2 py-3 px-4 rounded-lg text-sm', bgClass, className)}>
        <Icon size={15} className={iconClass} />
        <span className="text-slate-700">{msg}</span>
        {onRetry && (
          <button onClick={onRetry} className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
            <RefreshCw size={11} /> Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex flex-col items-center justify-center py-16 px-6 text-center', className)}
    >
      <div className={clsx('w-14 h-14 rounded-full flex items-center justify-center mb-4', bgClass)}>
        <Icon size={26} className={iconClass} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-xs mb-5">{msg}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors"
        >
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </motion.div>
  )
}
