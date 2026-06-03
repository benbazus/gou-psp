// src/routes/app/mobile/reports.tsx
import { motion } from 'framer-motion'
import { FileBarChart, Download } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

const REPORTS = [
  { id: 'daily-txns',     title: 'Daily Transactions Report',      description: 'All transactions by type, channel, and status',           period: 'Daily' },
  { id: 'settlement',     title: 'Settlement Summary',             description: 'Settlement batches — gross, net, fees, SLA compliance',   period: 'Daily' },
  { id: 'reconciliation', title: 'Reconciliation Report',          description: 'Matched vs unmatched transactions with exception details', period: 'Daily' },
  { id: 'float',          title: 'Float Position Report',          description: 'Daily float balance movements and top-up history',        period: 'Monthly' },
  { id: 'channel-perf',   title: 'Channel Performance',            description: 'USSD, App, and Agent transaction volumes and success rates', period: 'Monthly' },
  { id: 'exceptions',     title: 'Exceptions & Retry Report',      description: 'Failed transactions, retry attempts, and resolution status', period: 'Monthly' },
]

export default function MobileReportsPage() {
  const { accentColor, tenantName } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Reports" subtitle={`${tenantName} — downloadable transaction and settlement reports`} />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.id} className="bg-card rounded-card shadow-card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}15`, color: accentColor }}>
              <FileBarChart size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                  <div className="text-xs text-muted mt-0.5">{r.description}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-muted flex-shrink-0">{r.period}</span>
              </div>
              <button
                onClick={() => addToast(`Generating "${r.title}"...`, 'success')}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:opacity-90"
                style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}08` }}
              >
                <Download size={11} />
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
