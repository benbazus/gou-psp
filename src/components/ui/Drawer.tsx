import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { slideInRight, overlayVariants } from '../../utils/animations'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: number
}

export function Drawer({ open, onClose, title, subtitle, children, width = 480 }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 h-screen bg-card shadow-drawer z-50 flex flex-col overflow-hidden"
            style={{ width }}
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="text-muted hover:text-slate-700 transition-colors mt-0.5">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
