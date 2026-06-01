import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { Toast } from '../../types'
import clsx from 'clsx'

const CONFIG = {
  success: { icon: CheckCircle, cls: 'border-l-success bg-success-light text-success' },
  error:   { icon: XCircle,     cls: 'border-l-danger bg-danger-light text-danger' },
  warning: { icon: AlertTriangle, cls: 'border-l-warning bg-warning-light text-warning' },
  info:    { icon: Info,        cls: 'border-l-primary bg-primary-50 text-primary' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useAppStore((s) => s.removeToast)
  const { icon: Icon, cls } = CONFIG[toast.variant]

  useEffect(() => {
    const t = setTimeout(() => remove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, remove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      className={clsx('flex items-start gap-3 p-3.5 pr-10 rounded-lg shadow-card border-l-4 bg-card relative max-w-sm', cls)}
    >
      <Icon size={17} className="flex-shrink-0 mt-0.5" />
      <span className="text-sm text-slate-700">{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        className="absolute right-3 top-3.5 text-muted hover:text-slate-700"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastStack() {
  const toasts = useAppStore((s) => s.toasts)
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  )
}
