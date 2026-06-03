// src/routes/app/treasury/consolidated-fund.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Vault } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { AreaChart } from '../../../components/charts/AreaChart'
import { BarChart } from '../../../components/charts/BarChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function TreasuryConsolidatedFundPage() {
  const { accentColor } = usePortalConfig()

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['treasury-fund'],
    queryFn: () => tenantService.getTreasuryConsolidatedFund(),
  })

  const balanceTrend = entries.map((e) => ({
    date: e.date.slice(5),
    balance: Math.round(e.closingBalance / 1_000_000_000_000 * 100) / 100,
  }))

  const flowData = entries.slice(-7).map((e) => ({
    date: e.date.slice(5),
    receipts: Math.round(e.receipts / 1_000_000_000),
    disbursements: Math.round(e.disbursements / 1_000_000_000),
  }))

  const latest = entries[entries.length - 1]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Consolidated Fund"
          subtitle="Government of Uganda master account — daily position"
          actions={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs text-muted">
              <Vault size={12} />
              FY 2025/26
            </div>
          }
        />
      </motion.div>

      {/* Today's position summary */}
      {latest && (
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Opening Balance', value: formatUGX(latest.openingBalance), color: '#3b82f6' },
            { label: 'Receipts Today',  value: formatUGX(latest.receipts),       color: '#22c55e' },
            { label: 'Disbursements',   value: formatUGX(latest.disbursements),  color: '#ef4444' },
            { label: 'Closing Balance', value: formatUGX(latest.closingBalance), color: accentColor },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card rounded-card shadow-card p-4 border-l-4" style={{ borderColor: color }}>
              <div className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">{label}</div>
              <div className="text-base font-bold text-slate-800">{value}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">14-Day Balance Trend</h3>
          <p className="text-xs text-muted mb-3">Closing balance — UGX trillions</p>
          {isLoading ? (
            <div className="h-48 bg-slate-50 rounded animate-pulse" />
          ) : (
            <AreaChart
              data={balanceTrend}
              xKey="date"
              areas={[{ key: 'balance', color: accentColor, name: 'Balance (UGX T)' }]}
              height={200}
            />
          )}
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">7-Day Net Flow</h3>
          <p className="text-xs text-muted mb-3">Receipts vs disbursements — UGX billions</p>
          {isLoading ? (
            <div className="h-48 bg-slate-50 rounded animate-pulse" />
          ) : (
            <BarChart
              data={flowData}
              xKey="date"
              bars={[
                { key: 'receipts',      color: '#22c55e', name: 'Receipts UGX B' },
                { key: 'disbursements', color: '#ef4444', name: 'Disbursements UGX B' },
              ]}
              height={200}
            />
          )}
        </div>
      </motion.div>

      {/* Position table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-800">14-Day Daily Position</h3>
          <p className="text-xs text-muted">Opening balance, receipts, disbursements, closing balance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Date', 'Opening Balance', 'Receipts', 'Disbursements', 'Closing Balance', 'Net Movement'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-right first:text-left font-medium text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...entries].reverse().map((e) => {
                const net = e.closingBalance - e.openingBalance
                return (
                  <tr key={e.date} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{e.date}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatUGX(e.openingBalance)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{formatUGX(e.receipts)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatUGX(e.disbursements)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(e.closingBalance)}</td>
                    <td className={clsx('px-4 py-3 text-right font-semibold', net >= 0 ? 'text-green-700' : 'text-red-600')}>
                      {net >= 0 ? '+' : ''}{formatUGX(net)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
