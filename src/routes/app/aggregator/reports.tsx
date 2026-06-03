import { motion } from 'framer-motion'
import { Download, FileText } from 'lucide-react'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { PageHeader } from '../../../components/ui/PageHeader'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

const REPORTS = [
  { title: 'Volume Summary',       desc: 'Total transaction volume and count by merchant and type',  period: 'Monthly' },
  { title: 'Merchant Performance', desc: 'Per-merchant volume, fees, and SLA compliance',            period: 'Monthly' },
  { title: 'Settlement Report',    desc: 'All settlement batches with SLA status and timestamps',    period: 'Monthly' },
  { title: 'Fee Revenue Report',   desc: 'Earned fee revenue by transaction type and merchant',      period: 'Monthly' },
  { title: 'Dispute & Chargeback', desc: 'Failed and reversed transactions with resolution status',  period: 'Monthly' },
  { title: 'API Health Report',    desc: 'Uptime, latency, and error rate for each merchant API',    period: 'Weekly' },
]

export default function AggregatorReportsPage() {
  const { accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Reports" subtitle="Downloadable aggregator performance and compliance reports" />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <div key={r.title} className="bg-card rounded-card shadow-card p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${accentColor}15` }}>
                <FileText size={18} style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                <div className="text-xs text-muted mt-0.5">{r.desc}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-medium text-muted uppercase tracking-wide">{r.period}</span>
              <button
                onClick={() => addToast(`${r.title} export queued`, 'success')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: accentColor }}
              >
                <Download size={12} />
                Export
              </button>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
