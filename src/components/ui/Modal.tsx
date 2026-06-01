import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { scaleIn, overlayVariants } from '../../utils/animations'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg', footer }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                  variants={overlayVariants}
                  initial="hidden" animate="visible" exit="exit"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} bg-card rounded-xl shadow-modal z-50 overflow-hidden`}
                  variants={scaleIn}
                  initial="hidden" animate="visible" exit="exit"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <Dialog.Title className="text-base font-semibold text-slate-800">{title}</Dialog.Title>
                    <button onClick={onClose} className="text-muted hover:text-slate-700 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="px-5 py-5">{children}</div>
                  {footer && <div className="px-5 py-4 border-t border-border bg-surface flex justify-end gap-2">{footer}</div>}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
