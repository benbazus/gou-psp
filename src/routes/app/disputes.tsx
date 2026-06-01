import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Drawer } from '../../components/ui/Drawer'
import { Timeline } from '../../components/ui/Timeline'
import { disputesApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatDateTime } from '../../utils/format'
import { Clock, CheckCircle, XCircle, ArrowUp } from 'lucide-react'
import type { Dispute } from '../../types'

function SLATimer({ dueAt }: { dueAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(dueAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('OVERDUE'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${days}d ${hours}h ${mins}m`)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [dueAt])

  const overdue = timeLeft === 'OVERDUE'
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${overdue ? 'text-danger' : 'text-warning'}`}>
      <Clock size={12} />
      {timeLeft}
    </div>
  )
}

export default function DisputesPage() {
  const addToast = useAppStore((s) => s.addToast)
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Dispute | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: disputesApi.list,
  })

  const { mutate: resolve } = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => disputesApi.resolve(id, action),
    onSuccess: (_, { action }) => {
      addToast(
        action === 'approve' ? 'Dispute resolved — refund initiated' :
        action === 'reject' ? 'Dispute rejected' : 'Dispute escalated',
        action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning'
      )
      qc.invalidateQueries({ queryKey: ['disputes'] })
      setSelected(null)
    },
  })

  const filtered = statusFilter === 'all' ? disputes : disputes.filter((d) => d.status === statusFilter)

  const timelineItems = (selected?.timeline ?? []).map((t) => ({
    label: t.stage,
    timestamp: t.timestamp ? formatDateTime(t.timestamp) : 'Pending',
    description: t.note || undefined,
    actor: t.actor || undefined,
    status: (t.timestamp ? 'done' : 'pending') as 'done' | 'pending',
  }))

  return (
    <div>
      <PageHeader title="Disputes & Refunds" subtitle="Payment dispute resolution and refund management" />

      <div className="flex gap-2 mb-4">
        {['all', 'open', 'investigating', 'approved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors
              ${statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:text-slate-800'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable<Dispute & Record<string, unknown>>
        columns={[
          { key: 'id', header: 'Dispute ID',
            render: (r) => <span className="font-mono text-xs">{r.id as string}</span> },
          { key: 'transactionId', header: 'Transaction',
            render: (r) => <span className="font-mono text-xs">{r.transactionId as string}</span> },
          { key: 'payer', header: 'Payer', sortable: true },
          { key: 'type', header: 'Type',
            render: (r) => <Badge variant="warning">{(r.type as string).replace(/_/g, ' ')}</Badge> },
          { key: 'amount', header: 'Amount', sortable: true,
            render: (r) => formatUGX(r.amount as number) },
          { key: 'status', header: 'Status',
            render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
          { key: 'slaDueAt', header: 'SLA',
            render: (r) => <SLATimer dueAt={r.slaDueAt as string} /> },
        ]}
        data={filtered as (Dispute & Record<string, unknown>)[]}
        keyField="id"
        loading={isLoading}
        onRowClick={(row) => setSelected(row as unknown as Dispute)}
      />

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Dispute ${selected?.id ?? ''}`}
        subtitle={selected ? `${selected.type.replace(/_/g, ' ')} · ${selected.channel}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface rounded-lg p-3">
                <div className="text-xs text-muted">Amount</div>
                <div className="font-bold text-primary">{formatUGX(selected.amount)}</div>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <div className="text-xs text-muted">SLA Deadline</div>
                <SLATimer dueAt={selected.slaDueAt} />
              </div>
              <div className="bg-surface rounded-lg p-3 col-span-2">
                <div className="text-xs text-muted">Transaction ID</div>
                <div className="font-mono text-xs">{selected.transactionId}</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Resolution Timeline</div>
              <Timeline items={timelineItems} />
            </div>

            {selected.status !== 'closed' && selected.status !== 'approved' && selected.status !== 'rejected' && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => resolve({ id: selected.id, action: 'approve' })}
                  className="flex items-center justify-center gap-2 py-2.5 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={14} /> Approve Refund
                </button>
                <button
                  onClick={() => resolve({ id: selected.id, action: 'reject' })}
                  className="flex items-center justify-center gap-2 py-2.5 border border-danger text-danger rounded-lg text-sm hover:bg-danger-light transition-colors"
                >
                  <XCircle size={14} /> Reject Dispute
                </button>
                <button
                  onClick={() => resolve({ id: selected.id, action: 'escalate' })}
                  className="flex items-center justify-center gap-2 py-2.5 border border-border text-muted rounded-lg text-sm hover:text-slate-800 transition-colors"
                >
                  <ArrowUp size={14} /> Escalate
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
