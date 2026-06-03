// src/routes/app/treasury/accounts.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { TreasuryAccount } from '../../../types'

const ACCOUNT_TYPE_COLOR: Record<TreasuryAccount['accountType'], string> = {
  'Consolidated Fund': '#a855f7',
  'Salary Account':    '#3b82f6',
  'Development Fund':  '#22c55e',
  'Donor Fund':        '#f59e0b',
  'Petty Cash':        '#94a3b8',
}

export default function TreasuryAccountsPage() {
  const { accentColor } = usePortalConfig()

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['treasury-accounts'],
    queryFn: () => tenantService.getTreasuryAccounts(),
  })

  const ugxTotal = accounts.filter((a) => a.currency === 'UGX').reduce((s, a) => s + a.availableBalance, 0)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Treasury Accounts"
          subtitle="Government accounts held across commercial and central bank"
          actions={
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: accentColor }}>
              <Building2 size={13} />
              UGX Available: {formatUGX(ugxTotal)}
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-card shadow-card p-5 space-y-3">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-slate-50 rounded animate-pulse" />
            </div>
          ))
        ) : accounts.map((acc) => {
          const typeColor = ACCOUNT_TYPE_COLOR[acc.accountType]
          const utilPct = acc.balance > 0
            ? Math.round((1 - acc.availableBalance / acc.balance) * 100)
            : 0
          return (
            <div key={acc.id} className="bg-card rounded-card shadow-card p-5 border-l-4" style={{ borderColor: typeColor }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-medium text-muted uppercase tracking-wide">{acc.accountType}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{acc.bank}</div>
                  <div className="font-mono text-[10px] text-muted">{acc.accountNumber}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: typeColor, borderColor: typeColor, background: `${typeColor}15` }}
                >
                  {acc.currency}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Total Balance</span>
                  <span className="font-semibold text-slate-800">{formatUGX(acc.balance)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Pending Disbursements</span>
                  <span className="font-medium text-red-600">-{formatUGX(acc.pendingDisbursements)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-border pt-1 mt-1">
                  <span className="font-medium text-slate-700">Available</span>
                  <span className="font-bold text-slate-800">{formatUGX(acc.availableBalance)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${utilPct}%`, background: utilPct > 80 ? '#ef4444' : typeColor }}
                />
              </div>
              <div className="text-[10px] text-muted mt-1">{utilPct}% committed — updated {acc.lastUpdated.slice(0, 10)}</div>
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
