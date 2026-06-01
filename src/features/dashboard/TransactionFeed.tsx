import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../../store/appStore'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { formatUGX, timeAgo } from '../../utils/format'

export function TransactionFeed() {
  const transactions = useAppStore((s) => s.liveTransactions)

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-slate-800">Live Transaction Feed</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {transactions.slice(0, 15).map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-700 truncate">{tx.id}</div>
                <div className="text-xs text-muted truncate">{tx.payer} · {tx.agency}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-xs font-semibold text-primary">{formatUGX(tx.amount)}</span>
                <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                <span className="text-xs text-muted w-14 text-right">{timeAgo(tx.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
