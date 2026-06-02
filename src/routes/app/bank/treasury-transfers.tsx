import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Building2 } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

type Direction = 'from_treasury' | 'to_treasury'
type TransferStatus = 'completed' | 'pending' | 'processing' | 'failed'

interface TreasuryTransfer {
  id: string
  reference: string
  amount: number
  direction: Direction
  description: string
  status: TransferStatus
  initiatedBy: string
  timestamp: string
  settlementRef: string
}

const STATUS_STYLE: Record<TransferStatus, string> = {
  completed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  failed:     'bg-red-100 text-red-700',
}

function makeTransfers(tenantId: string): TreasuryTransfer[] {
  const tid = tenantId.slice(0, 4).toUpperCase()
  return [
    {
      id:            '1',
      reference:     `TRF-${tid}-001`,
      amount:        4_200_000_000,
      direction:     'from_treasury',
      description:   'Monthly liquidity injection — government salary disbursement',
      status:        'completed',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-06-02 08:15',
      settlementRef: `SETL-${tid}-2024-061`,
    },
    {
      id:            '2',
      reference:     `TRF-${tid}-002`,
      amount:        1_850_000_000,
      direction:     'to_treasury',
      description:   'End-of-day surplus remittance to Consolidated Fund',
      status:        'completed',
      initiatedBy:   `${tenantId} Treasury Ops`,
      timestamp:     '2026-06-01 17:00',
      settlementRef: `SETL-${tid}-2024-060`,
    },
    {
      id:            '3',
      reference:     `TRF-${tid}-003`,
      amount:        980_000_000,
      direction:     'from_treasury',
      description:   'Infrastructure development fund transfer — MoFPED directive',
      status:        'completed',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-06-01 10:45',
      settlementRef: `SETL-${tid}-2024-059`,
    },
    {
      id:            '4',
      reference:     `TRF-${tid}-004`,
      amount:        3_500_000_000,
      direction:     'from_treasury',
      description:   'Periodic reserve repo settlement — BOU monetary policy',
      status:        'completed',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-05-31 14:30',
      settlementRef: `SETL-${tid}-2024-058`,
    },
    {
      id:            '5',
      reference:     `TRF-${tid}-005`,
      amount:        620_000_000,
      direction:     'to_treasury',
      description:   'Weekly excess liquidity withdrawal — BOU standing facility',
      status:        'completed',
      initiatedBy:   `${tenantId} Treasury Ops`,
      timestamp:     '2026-05-31 09:10',
      settlementRef: `SETL-${tid}-2024-057`,
    },
    {
      id:            '6',
      reference:     `TRF-${tid}-006`,
      amount:        2_100_000_000,
      direction:     'from_treasury',
      description:   'Education sector special allocation — Ministry disbursement',
      status:        'processing',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-05-30 11:20',
      settlementRef: `SETL-${tid}-2024-056`,
    },
    {
      id:            '7',
      reference:     `TRF-${tid}-007`,
      amount:        445_000_000,
      direction:     'to_treasury',
      description:   'Overnight collateral return',
      status:        'completed',
      initiatedBy:   `${tenantId} Treasury Ops`,
      timestamp:     '2026-05-30 08:00',
      settlementRef: `SETL-${tid}-2024-055`,
    },
    {
      id:            '8',
      reference:     `TRF-${tid}-008`,
      amount:        760_000_000,
      direction:     'from_treasury',
      description:   'Health sector emergency allocation — MoH directive',
      status:        'completed',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-05-29 15:45',
      settlementRef: `SETL-${tid}-2024-054`,
    },
    {
      id:            '9',
      reference:     `TRF-${tid}-009`,
      amount:        1_300_000_000,
      direction:     'to_treasury',
      description:   'Tax collection remittance — URA sweep',
      status:        'pending',
      initiatedBy:   `${tenantId} Treasury Ops`,
      timestamp:     '2026-05-29 12:00',
      settlementRef: `SETL-${tid}-2024-053`,
    },
    {
      id:            '10',
      reference:     `TRF-${tid}-010`,
      amount:        5_000_000_000,
      direction:     'from_treasury',
      description:   'Quarterly capital injection — BOU prudential requirement',
      status:        'completed',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-05-28 09:00',
      settlementRef: `SETL-${tid}-2024-052`,
    },
    {
      id:            '11',
      reference:     `TRF-${tid}-011`,
      amount:        880_000_000,
      direction:     'to_treasury',
      description:   'Surplus remittance — end of fiscal quarter sweep',
      status:        'failed',
      initiatedBy:   `${tenantId} Treasury Ops`,
      timestamp:     '2026-05-27 16:30',
      settlementRef: `SETL-${tid}-2024-051`,
    },
    {
      id:            '12',
      reference:     `TRF-${tid}-012`,
      amount:        2_750_000_000,
      direction:     'from_treasury',
      description:   'Road infrastructure fund drawdown — Works Ministry',
      status:        'completed',
      initiatedBy:   'BOU Treasury Desk',
      timestamp:     '2026-05-27 10:15',
      settlementRef: `SETL-${tid}-2024-050`,
    },
  ]
}

export default function BankTreasuryTransfersPage() {
  const { tenantId, tenantName } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [dirFilter, setDirFilter] = useState<'all' | Direction>('all')

  const transfers = useMemo(() => makeTransfers(tenantId), [tenantId])

  const filtered = useMemo(() => {
    return transfers.filter((t) => dirFilter === 'all' || t.direction === dirFilter)
  }, [transfers, dirFilter])

  const receivedTotal = transfers
    .filter((t) => t.direction === 'from_treasury' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const remittedTotal = transfers
    .filter((t) => t.direction === 'to_treasury' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const netPosition = receivedTotal - remittedTotal

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Treasury Transfers"
          subtitle={`${tenantName} — Transfers between bank and Treasury`}
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-card shadow-card border-l-4 border-l-green-500 p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Received from Treasury</span>
          <div className="text-xl font-bold text-green-700">{formatUGX(receivedTotal)}</div>
          <span className="text-xs text-muted">
            {transfers.filter((t) => t.direction === 'from_treasury' && t.status === 'completed').length} completed transfers
          </span>
        </div>
        <div className="bg-card rounded-card shadow-card border-l-4 border-l-orange-500 p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Remitted to Treasury</span>
          <div className="text-xl font-bold text-orange-600">{formatUGX(remittedTotal)}</div>
          <span className="text-xs text-muted">
            {transfers.filter((t) => t.direction === 'to_treasury' && t.status === 'completed').length} completed transfers
          </span>
        </div>
        <div className="bg-card rounded-card shadow-card border-l-4 border-l-primary p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Net Position</span>
          <div className={clsx(
            'text-xl font-bold',
            netPosition >= 0 ? 'text-green-700' : 'text-red-600',
          )}>
            {netPosition >= 0 ? '+' : ''}{formatUGX(netPosition)}
          </div>
          <span className="text-xs text-muted">Received minus remitted</span>
        </div>
      </motion.div>

      {/* Direction Filter */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <select
          value={dirFilter}
          onChange={(e) => setDirFilter(e.target.value as 'all' | Direction)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Directions</option>
          <option value="from_treasury">From Treasury</option>
          <option value="to_treasury">To Treasury</option>
        </select>
        <span className="text-sm text-muted ml-auto">
          {filtered.length} transfer{filtered.length !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Timeline List */}
      <motion.div variants={fadeInUp} className="space-y-3">
        {filtered.map((t) => {
          const isFrom = t.direction === 'from_treasury'
          return (
            <div
              key={t.id}
              className="bg-card rounded-card shadow-card p-4 flex items-start gap-4"
            >
              {/* Icon */}
              <div className={clsx(
                'mt-0.5 p-2 rounded-full shrink-0',
                isFrom ? 'bg-green-100' : 'bg-orange-100',
              )}>
                {isFrom ? (
                  <ArrowDownCircle size={18} className="text-green-600" />
                ) : (
                  <ArrowUpCircle size={18} className="text-orange-500" />
                )}
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="font-mono">{t.reference}</span>
                      <span>·</span>
                      <span>{t.timestamp}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Building2 size={10} />
                        {t.initiatedBy}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">Settlement: <span className="font-mono">{t.settlementRef}</span></p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={clsx(
                      'text-base font-bold',
                      isFrom ? 'text-green-700' : 'text-orange-600',
                    )}>
                      {isFrom ? '+' : '-'}{formatUGX(t.amount)}
                    </p>
                    <span className={clsx(
                      'inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                      STATUS_STYLE[t.status],
                    )}>
                      {t.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className={clsx(
                    'text-[10px] font-semibold uppercase tracking-wider',
                    isFrom ? 'text-green-600' : 'text-orange-500',
                  )}>
                    {isFrom ? 'From Treasury' : 'To Treasury'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="bg-card rounded-card shadow-card p-10 text-center text-muted text-sm">
            No transfers found.
          </div>
        )}
      </motion.div>

      {/* Retry for failed */}
      {transfers.some((t) => t.status === 'failed') && (
        <motion.div variants={fadeInUp} className="text-xs text-muted">
          <button
            onClick={() => addToast('Failed transfers queued for retry', 'info')}
            className="text-blue-600 hover:underline"
          >
            Retry failed transfers
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
