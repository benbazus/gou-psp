import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { PieChart } from '../../components/charts/PieChart'
import { LineChart } from '../../components/charts/LineChart'
import { Modal } from '../../components/ui/Modal'
import { useAppStore } from '../../store/appStore'
import { mockTransactions } from '../../data/mockTransactions'
import { formatUGX } from '../../utils/format'
import { PlayCircle, CheckCircle } from 'lucide-react'

const MATCH_RATE_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  matched: 94 + Math.random() * 4,
  unmatched: 0.5 + Math.random() * 2,
}))

const SCORE = 97.4

export default function ReconciliationPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [resolveModal, setResolveModal] = useState(false)
  const [selectedTx, setSelectedTx] = useState<typeof matchedTx[0] | null>(null)
  const [note, setNote] = useState('')

  const matchedTx = mockTransactions.filter((t) => t.status === 'completed').slice(0, 20)
  const unmatchedTx = mockTransactions.filter((t) => t.status === 'failed').slice(0, 8)
  const exceptions = mockTransactions.filter((t) => t.status === 'pending').slice(0, 5)

  async function runRecon() {
    setRunning(true)
    await new Promise<void>((r) => setTimeout(r, 2500))
    setRunning(false)
    setRan(true)
    addToast('Reconciliation complete — 97.4% match rate', 'success')
  }

  const piData = [
    { name: 'Matched', value: 97.4, color: '#16A34A' },
    { name: 'Unmatched', value: 1.8, color: '#D62828' },
    { name: 'Exceptions', value: 0.8, color: '#D97706' },
  ]

  void ran

  return (
    <div>
      <PageHeader
        title="Reconciliation"
        subtitle="Match payment records across switch, bank, and agency systems"
        actions={
          <button
            onClick={runRecon}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            {running
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <PlayCircle size={16} />}
            {running ? 'Running Reconciliation...' : 'Run Reconciliation'}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-card rounded-card shadow-card p-4 flex flex-col items-center">
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Reconciliation Score</div>
          <PieChart data={piData} height={160} donut />
          <div className="text-3xl font-bold text-primary mt-1">{SCORE}%</div>
          <div className="text-xs text-muted">Match rate</div>
        </div>
        <div className="col-span-2 bg-card rounded-card shadow-card p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Match Rate — Last 14 Days</div>
          <LineChart
            data={MATCH_RATE_DATA}
            xKey="day"
            lines={[
              { key: 'matched', color: '#16A34A', name: 'Matched %' },
              { key: 'unmatched', color: '#D62828', name: 'Unmatched %' },
            ]}
            height={180}
          />
        </div>
      </div>

      <Tabs.Root defaultValue="matched">
        <Tabs.List className="flex gap-1 bg-surface p-1 rounded-lg mb-4 w-fit">
          {[
            { value: 'matched', label: `Matched (${matchedTx.length})` },
            { value: 'unmatched', label: `Unmatched (${unmatchedTx.length})` },
            { value: 'exceptions', label: `Exceptions (${exceptions.length})` },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-1.5 text-sm rounded-md text-muted data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:font-semibold transition-all"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="matched">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['ID', 'Payer', 'Agency', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matchedTx.map((t) => (
                  <tr key={t.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-2.5">{t.payer}</td>
                    <td className="px-4 py-2.5">{t.agency}</td>
                    <td className="px-4 py-2.5 font-semibold">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="success">
                        <CheckCircle size={10} className="inline mr-1" />Matched
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        <Tabs.Content value="unmatched">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['ID', 'Payer', 'Agency', 'Amount', 'Reason'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {unmatchedTx.map((t) => (
                  <tr key={t.id} className="hover:bg-danger-light/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-2.5">{t.payer}</td>
                    <td className="px-4 py-2.5">{t.agency}</td>
                    <td className="px-4 py-2.5 font-semibold">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-2.5 text-danger text-xs">{t.failureReason ?? 'No agency confirmation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        <Tabs.Content value="exceptions">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['ID', 'Payer', 'Amount', 'Type', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exceptions.map((t) => (
                  <tr key={t.id} className="hover:bg-warning/5">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-2.5">{t.payer}</td>
                    <td className="px-4 py-2.5">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-2.5"><Badge variant="warning">Pending Confirmation</Badge></td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => { setSelectedTx(t); setResolveModal(true) }}
                        className="text-xs text-primary underline hover:text-primary-light"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Modal
        open={resolveModal}
        onClose={() => setResolveModal(false)}
        title="Resolve Exception"
        footer={
          <button
            onClick={() => { setResolveModal(false); addToast('Exception resolved manually', 'success') }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
          >
            Save Resolution
          </button>
        }
      >
        {selectedTx && (
          <div className="space-y-4 text-sm">
            <div className="bg-surface rounded-lg p-3 space-y-1">
              <div className="flex justify-between"><span className="text-muted">Transaction</span><span className="font-mono">{selectedTx.id}</span></div>
              <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold">{formatUGX(selectedTx.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Payer</span><span>{selectedTx.payer}</span></div>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Resolution Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
                placeholder="Describe how this exception was resolved..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
