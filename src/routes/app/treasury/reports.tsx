// src/routes/app/treasury/reports.tsx
import { motion } from 'framer-motion'
import { FileBarChart, Download } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useAppStore } from '../../../store/appStore'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

const REPORTS = [
  { id: 'daily-position',    title: 'Daily Consolidated Fund Position',  description: 'Opening/closing balances, receipts, and disbursements for today', period: 'Daily' },
  { id: 'disbursements',     title: 'Disbursements Summary',             description: 'All payment orders by status, ministry line, and vote code',       period: 'Daily' },
  { id: 'budget-utilisation',title: 'Budget Utilisation Report',         description: 'Commitments vs actuals across all vote codes — FY 2025/26',        period: 'Monthly' },
  { id: 'account-statement', title: 'Treasury Account Statements',       description: 'Transactions across all treasury accounts by bank',                period: 'Monthly' },
  { id: 'approvals',         title: 'Approval Audit Trail',              description: 'History of all approvals and rejections with approver details',     period: 'Monthly' },
  { id: 'reconciliation',    title: 'Reconciliation Summary',            description: 'Matched vs unmatched disbursements against bank confirmations',     period: 'Daily' },
  { id: 'commitments',       title: 'Commitment Tracker',                description: 'Multi-year commitment schedule vs actual spend per ministry',       period: 'Quarterly' },
  { id: 'donor-fund',        title: 'Donor Fund Activity',               description: 'All donor-funded disbursements and balance movements',              period: 'Monthly' },
]

export default function TreasuryReportsPage() {
  const { accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  function handleDownload(title: string) {
    addToast(`Generating "${title}"... download will start shortly`, 'success')
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Reports"
          subtitle="Downloadable treasury reports — daily, monthly, and quarterly"
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.id} className="bg-card rounded-card shadow-card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${accentColor}15`, color: accentColor }}
            >
              <FileBarChart size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                  <div className="text-xs text-muted mt-0.5">{r.description}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-muted flex-shrink-0">
                  {r.period}
                </span>
              </div>
              <button
                onClick={() => handleDownload(r.title)}
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
