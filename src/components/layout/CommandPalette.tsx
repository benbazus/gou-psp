import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { formatUGX, timeAgo } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, overlayVariants } from '../../utils/animations'

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const transactions = useAppStore((s) => s.liveTransactions)

  function handleClose() {
    setQuery('')
    onClose()
  }

  const filtered = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.payer.toLowerCase().includes(query.toLowerCase()) ||
      t.agency.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl bg-card rounded-xl shadow-modal z-50 overflow-hidden"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search size={16} className="text-muted" />
                    <input
                      autoFocus
                      className="flex-1 text-sm outline-none bg-transparent"
                      placeholder="Search transactions, payers, agencies..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded border border-border">Esc</kbd>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {filtered.length === 0 && (
                      <div className="py-8 text-center text-muted text-sm">No transactions found</div>
                    )}
                    {filtered.slice(0, 8).map((t) => (
                      <button
                        key={t.id}
                        onClick={handleClose}
                        className="w-full text-left px-4 py-3 hover:bg-surface transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">{t.id}</div>
                          <div className="text-xs text-muted">{t.payer} · {t.agency}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">{formatUGX(t.amount)}</div>
                          <div className="text-xs text-muted">{timeAgo(t.timestamp)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
