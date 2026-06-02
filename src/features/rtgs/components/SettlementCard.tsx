import { motion } from 'framer-motion'
import { ArrowRight, Clock, CheckCircle2, XCircle, Loader2, Pause } from 'lucide-react'
import { fadeInUp } from '../../../utils/animations'
import { formatUGX } from '../../../utils/format'
import type { RTGSTransaction } from '../../../types/rtgs'
import clsx from 'clsx'

interface StatusConfig {
  label: string
  icon: React.ReactNode
  bg: string
  text: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  queued:         { label: 'Queued',         icon: <Clock size={12} />,       bg: 'bg-slate-700',     text: 'text-slate-300' },
  high_priority:  { label: 'High Priority',  icon: <Clock size={12} />,       bg: 'bg-amber-500/20',  text: 'text-amber-300' },
  liquidity_wait: { label: 'Liquidity Wait', icon: <Pause size={12} />,       bg: 'bg-orange-500/20', text: 'text-orange-300' },
  pending_auth:   { label: 'Pending Auth',   icon: <Clock size={12} />,       bg: 'bg-blue-500/20',   text: 'text-blue-300' },
  processing:     { label: 'Processing',     icon: <Loader2 size={12} className="animate-spin" />, bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  settled:        { label: 'Settled',        icon: <CheckCircle2 size={12} />, bg: 'bg-green-500/20',  text: 'text-green-300' },
  failed:         { label: 'Failed',         icon: <XCircle size={12} />,     bg: 'bg-red-500/20',    text: 'text-red-300' },
  held:           { label: 'On Hold',        icon: <Pause size={12} />,       bg: 'bg-slate-600/50',  text: 'text-slate-300' },
  reversed:       { label: 'Reversed',       icon: <XCircle size={12} />,     bg: 'bg-purple-500/20', text: 'text-purple-300' },
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  normal:   'bg-slate-600/50 text-slate-400 border-slate-500/30',
  low:      'bg-slate-700/50 text-slate-500 border-slate-600/30',
}

interface Props {
  tx: RTGSTransaction
  delay?: number
  onClick?: () => void
}

export function SettlementCard({ tx, delay = 0, onClick }: Props) {
  const s = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.queued

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      onClick={onClick}
      className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-amber-400/80">{tx.rtgsRef}</span>
            <span className={clsx('inline-flex items-center gap-1 text-[10px] font-semibold border rounded px-1.5 py-0.5', PRIORITY_BADGE[tx.priority])}>
              {tx.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-white font-bold text-base">{formatUGX(tx.amount)}</p>
        </div>
        <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1', s.bg, s.text)}>
          {s.icon} {s.label}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="truncate max-w-[120px]">{tx.senderBank.split(' ').slice(0, 2).join(' ')}</span>
        <ArrowRight size={12} className="flex-shrink-0 text-amber-400" />
        <span className="truncate max-w-[120px]">{tx.receiverBank.split(' ').slice(0, 2).join(' ')}</span>
      </div>
      <p className="text-[11px] text-slate-500 mt-1 truncate">{tx.purpose}</p>
    </motion.div>
  )
}
