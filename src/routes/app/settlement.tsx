import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../../components/ui/PageHeader'
import { KPICard } from '../../components/ui/KPICard'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { settlementsApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatDate } from '../../utils/format'
import { staggerContainer, fadeInUp } from '../../utils/animations'
import { Download, CheckCircle, XCircle, RotateCcw, Banknote } from 'lucide-react'
import type { SettlementBatch } from '../../types'

const PIPELINE = ['Batch Created', 'Validation', 'Netting', 'Approval', 'Settlement Complete']

function downloadCSV(batches: SettlementBatch[]) {
  const header = 'Batch ID,Date,Participant,Gross Amount,Net Amount,Transactions,Status\n'
  const rows = batches.map((b) =>
    `${b.id},${b.batchDate},${b.participant},${b.grossAmount},${b.netAmount},${b.transactionCount},${b.status}`
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'settlement-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function SettlementPage() {
  const addToast = useAppStore((s) => s.addToast)
  const qc = useQueryClient()
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null)

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['settlement-batches'],
    queryFn: settlementsApi.listBatches,
  })
  const { data: accounts = [] } = useQuery({
    queryKey: ['settlement-accounts'],
    queryFn: settlementsApi.listAccounts,
  })

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: string) => settlementsApi.approve(id),
    onSuccess: () => {
      addToast('Settlement batch approved', 'success')
      qc.invalidateQueries({ queryKey: ['settlement-batches'] })
      setSelectedBatch(null)
    },
  })
  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => settlementsApi.reject(id),
    onSuccess: () => {
      addToast('Settlement batch rejected', 'error')
      qc.invalidateQueries({ queryKey: ['settlement-batches'] })
      setSelectedBatch(null)
    },
  })
  const { mutate: rerun } = useMutation({
    mutationFn: (id: string) => settlementsApi.rerun(id),
    onSuccess: () => {
      addToast('Settlement batch requeued for processing', 'info')
      qc.invalidateQueries({ queryKey: ['settlement-batches'] })
      setSelectedBatch(null)
    },
  })

  const pending = batches.filter((b) => b.status === 'pending')
  const completed = batches.filter((b) => b.status === 'completed')
  const failed = batches.filter((b) => b.status === 'failed')
  const totalPending = pending.reduce((s, b) => s + b.netAmount, 0)
  const totalCompleted = completed.reduce((s, b) => s + b.netAmount, 0)

  return (
    <div>
      <PageHeader
        title="Settlement"
        subtitle="Batch settlement management and treasury account positions"
        actions={
          <button onClick={() => downloadCSV(batches)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors">
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <motion.div className="grid grid-cols-4 gap-4 mb-5" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={fadeInUp}>
          <KPICard title="Pending Value" value={formatUGX(totalPending)} accent="warning" animate={false} icon={<Banknote size={16} />} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Completed Today" value={completed.length} accent="success" />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Failed Batches" value={failed.length} accent="danger" />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Net Position (Today)" value={formatUGX(totalCompleted)} accent="primary" animate={false} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <DataTable<SettlementBatch & Record<string, unknown>>
            columns={[
              { key: 'id', header: 'Batch ID',
                render: (r) => <span className="font-mono text-xs">{r.id as string}</span> },
              { key: 'participant', header: 'Participant', sortable: true },
              { key: 'netAmount', header: 'Net Amount', sortable: true,
                render: (r) => formatUGX(r.netAmount as number) },
              { key: 'transactionCount', header: 'Txns', sortable: true },
              { key: 'status', header: 'Status',
                render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
              { key: 'batchDate', header: 'Date',
                render: (r) => formatDate(r.batchDate as string) },
            ]}
            data={batches as (SettlementBatch & Record<string, unknown>)[]}
            keyField="id"
            loading={isLoading}
            onRowClick={(row) => setSelectedBatch(row as unknown as SettlementBatch)}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Settlement Pipeline</h3>
            {PIPELINE.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i < 4 ? 'bg-success text-white' : 'bg-primary text-white animate-pulse'}`}>
                  {i < 4 ? '✓' : i + 1}
                </div>
                <div className={`text-xs font-medium ${i <= 4 ? 'text-slate-800' : 'text-muted'}`}>{stage}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Account Positions</h3>
            {accounts.map((acc) => (
              <div key={acc.accountNumber} className="py-2 border-b border-border last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium">{acc.participant}</div>
                    <div className="text-[10px] text-muted font-mono">{acc.accountNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-primary">{formatUGX(acc.balance)}</div>
                    {acc.pendingInflow > 0 && (
                      <div className="text-[10px] text-success">+{formatUGX(acc.pendingInflow)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        title={`Batch: ${selectedBatch?.id ?? ''}`}
        footer={
          selectedBatch ? (
            <div className="flex gap-2 w-full">
              {selectedBatch.status === 'pending' && (
                <>
                  <button onClick={() => reject(selectedBatch.id)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-danger text-danger rounded-lg text-sm hover:bg-danger-light transition-colors">
                    <XCircle size={14} /> Reject
                  </button>
                  <button onClick={() => approve(selectedBatch.id)} disabled={approving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors ml-auto disabled:opacity-60">
                    <CheckCircle size={14} /> {approving ? 'Approving...' : 'Approve'}
                  </button>
                </>
              )}
              {selectedBatch.status === 'failed' && (
                <button onClick={() => rerun(selectedBatch.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors ml-auto">
                  <RotateCcw size={14} /> Re-run Settlement
                </button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedBatch && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Participant</span><span className="font-medium">{selectedBatch.participant}</span></div>
            <div className="flex justify-between"><span className="text-muted">Gross Amount</span><span>{formatUGX(selectedBatch.grossAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Net Amount</span><span className="font-bold text-primary">{formatUGX(selectedBatch.netAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Transactions</span><span>{selectedBatch.transactionCount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted">Status</span><Badge variant={statusVariant(selectedBatch.status)}>{selectedBatch.status}</Badge></div>
            {selectedBatch.failureReason && (
              <div className="bg-danger-light text-danger text-xs p-3 rounded-lg">{selectedBatch.failureReason}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
