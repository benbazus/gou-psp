import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

interface ReportType {
  id: string
  label: string
  emoji: string
  description: string
}

const REPORT_TYPES: ReportType[] = [
  {
    id:          'daily_settlement',
    label:       'Daily Settlement Report',
    emoji:       '📋',
    description: 'Summary of all settlement batches processed today',
  },
  {
    id:          'liquidity_history',
    label:       'Liquidity History Report',
    emoji:       '💧',
    description: 'Intraday and end-of-day liquidity position over selected period',
  },
  {
    id:          'transaction_summary',
    label:       'Transaction Summary',
    emoji:       '📊',
    description: 'Aggregate transaction volumes, values, and channels',
  },
  {
    id:          'rtgs_queue_history',
    label:       'RTGS Queue History',
    emoji:       '⚡',
    description: 'Historical RTGS instruction queue with SLA metrics',
  },
  {
    id:          'exception_incident',
    label:       'Exception & Incident Report',
    emoji:       '⚠️',
    description: 'All raised exceptions with resolution times and severity breakdown',
  },
  {
    id:          'reconciliation',
    label:       'Reconciliation Report',
    emoji:       '🔄',
    description: 'Matched, unmatched, and pending reconciliation records',
  },
  {
    id:          'treasury_transfers',
    label:       'Treasury Transfers Report',
    emoji:       '🏛',
    description: 'Transfers to and from Treasury with net position analysis',
  },
  {
    id:          'sla_compliance',
    label:       'SLA Compliance Report',
    emoji:       '✅',
    description: 'SLA adherence rates across settlement, RTGS, and exceptions',
  },
]

export default function BankReportsPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('2026-05-01')
  const [dateTo, setDateTo] = useState('2026-06-02')
  const [isGenerating, setIsGenerating] = useState(false)

  function handleGenerate() {
    if (!selectedReport) return
    const report = REPORT_TYPES.find((r) => r.id === selectedReport)
    setIsGenerating(true)
    addToast(`Generating ${report?.label}…`, 'info')
    setTimeout(() => {
      setIsGenerating(false)
      addToast(`${report?.label} ready for download`, 'success')
    }, 1500)
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Reports"
          subtitle={`${tenantName} — Generate and download bank portal reports`}
          actions={
            <button
              onClick={handleGenerate}
              disabled={!selectedReport || isGenerating}
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors',
                !selectedReport || isGenerating
                  ? 'bg-primary/40 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90',
              )}
            >
              <Download size={14} />
              {isGenerating ? 'Generating…' : 'Generate Report'}
            </button>
          }
        />
      </motion.div>

      {/* Date Range */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Date Range</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {selectedReport && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted">Selected:</span>
              <span className="text-xs font-semibold text-slate-700">
                {REPORT_TYPES.find((r) => r.id === selectedReport)?.label}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Report Type Grid */}
      <motion.div variants={fadeInUp}>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Select Report Type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map((report) => {
            const isSelected = selectedReport === report.id
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(isSelected ? null : report.id)}
                className={clsx(
                  'text-left p-4 rounded-card shadow-card border-2 transition-all',
                  isSelected
                    ? 'bg-card'
                    : 'bg-card border-border hover:border-primary/30 hover:shadow-md',
                )}
                style={isSelected ? { borderColor: accentColor } : undefined}
              >
                <div className="text-2xl mb-2">{report.emoji}</div>
                <p className={clsx(
                  'text-sm font-semibold leading-snug',
                  isSelected ? 'text-slate-800' : 'text-slate-700',
                )}>
                  {report.label}
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{report.description}</p>
                {isSelected && (
                  <div
                    className="mt-3 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: accentColor }}
                  >
                    Selected
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Generate CTA (bottom) */}
      {selectedReport && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between bg-card rounded-card shadow-card p-4"
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {REPORT_TYPES.find((r) => r.id === selectedReport)?.label}
            </p>
            <p className="text-xs text-muted mt-0.5">
              Period: {dateFrom} → {dateTo} · Tenant: {tenantId}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              isGenerating
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90',
            )}
          >
            <Download size={14} />
            {isGenerating ? 'Generating…' : 'Generate & Download'}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
