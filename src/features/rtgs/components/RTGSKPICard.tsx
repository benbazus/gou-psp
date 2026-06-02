import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { fadeInUp } from '../../../utils/animations'
import clsx from 'clsx'

interface Props {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  accent?: 'green' | 'amber' | 'red' | 'blue' | 'default'
  delay?: number
}

const ACCENT_RING: Record<string, string> = {
  green:   'border-green-500/30 shadow-green-500/10',
  amber:   'border-amber-500/30 shadow-amber-500/10',
  red:     'border-red-500/30 shadow-red-500/10',
  blue:    'border-blue-500/30 shadow-blue-500/10',
  default: 'border-slate-700 shadow-slate-900/20',
}

const ACCENT_ICON: Record<string, string> = {
  green:   'bg-green-500/20 text-green-400',
  amber:   'bg-amber-500/20 text-amber-400',
  red:     'bg-red-500/20 text-red-400',
  blue:    'bg-blue-500/20 text-blue-400',
  default: 'bg-slate-700 text-slate-300',
}

export function RTGSKPICard({ label, value, sub, icon: Icon, accent = 'default', delay = 0 }: Props) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={clsx(
        'bg-slate-900 border rounded-xl p-4 shadow-lg flex items-start gap-3',
        ACCENT_RING[accent],
      )}
    >
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', ACCENT_ICON[accent])}>
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-xs font-medium truncate">{label}</p>
        <p className="text-white font-bold text-lg leading-tight mt-0.5 truncate">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5 truncate">{sub}</p>}
      </div>
    </motion.div>
  )
}
