import { motion } from 'framer-motion'
import { usePortalConfig } from '../../../contexts/portalConfig'

export function BankPagePlaceholder({ title }: { title: string }) {
  const { tenantName, accentColor } = usePortalConfig()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="text-center">
        <div className="text-4xl mb-4">🏦</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{tenantName} — {title}</h2>
        <p className="text-muted text-sm">This page is under construction</p>
        <div className="mt-4 w-2 h-2 rounded-full mx-auto animate-pulse" style={{ background: accentColor }} />
      </div>
    </motion.div>
  )
}
