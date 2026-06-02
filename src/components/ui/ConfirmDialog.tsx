import { Modal } from './Modal'
import { AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

type Intent = 'danger' | 'warning' | 'info'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  intent?: Intent
  loading?: boolean
}

const INTENT_CFG: Record<Intent, { icon: React.ElementType; iconClass: string; btnClass: string }> = {
  danger:  { icon: AlertTriangle, iconClass: 'text-danger',  btnClass: 'bg-danger  hover:bg-red-700  text-white' },
  warning: { icon: AlertTriangle, iconClass: 'text-warning', btnClass: 'bg-warning hover:bg-amber-500 text-primary' },
  info:    { icon: Info,          iconClass: 'text-primary', btnClass: 'bg-primary hover:bg-primary-light text-white' },
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  intent = 'info', loading = false,
}: Props) {
  const { icon: Icon, iconClass, btnClass } = INTENT_CFG[intent]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-border rounded-lg text-slate-700 hover:bg-surface transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx('px-4 py-2 text-sm rounded-lg font-semibold transition-colors disabled:opacity-50', btnClass)}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex gap-4">
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', `bg-${intent === 'danger' ? 'danger' : intent === 'warning' ? 'warning' : 'primary'}/10`)}>
          <Icon size={20} className={iconClass} />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
      </div>
    </Modal>
  )
}
