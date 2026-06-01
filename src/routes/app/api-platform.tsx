import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { Code2, RefreshCw, CheckCircle2 } from 'lucide-react'

const ENDPOINTS = [
  {
    method: 'POST', path: '/api/v1/invoices', name: 'Create Invoice',
    description: 'Generate a payment reference number (PRN) for a government service',
    request: '{\n  "agency_id": "URA",\n  "service_id": "ura-tax",\n  "payer_name": "Mugisha Robert",\n  "amount": 1200000,\n  "currency": "UGX"\n}',
    response: '{\n  "prn": "PRN20260601001234",\n  "invoice_id": "INV-2026-001234",\n  "agency": "Uganda Revenue Authority",\n  "amount": 1200000,\n  "expires_at": "2026-06-08T23:59:59Z",\n  "status": "pending"\n}',
  },
  {
    method: 'GET', path: '/api/v1/invoices/{prn}', name: 'Validate Payment',
    description: 'Validate a PRN and retrieve invoice details before payment',
    request: 'GET /api/v1/invoices/PRN20260601001234',
    response: '{\n  "prn": "PRN20260601001234",\n  "valid": true,\n  "status": "pending",\n  "amount": 1200000,\n  "payer": "Mugisha Robert"\n}',
  },
  {
    method: 'POST', path: '/api/v1/payments', name: 'Initiate Payment',
    description: 'Initiate a payment for a validated PRN via a specified channel',
    request: '{\n  "prn": "PRN20260601001234",\n  "channel": "MTN Mobile Money",\n  "phone": "256771234567",\n  "amount": 1200000\n}',
    response: '{\n  "transaction_id": "TXN-2026-100512",\n  "status": "processing",\n  "channel_reference": "MTN-REF-89012345"\n}',
  },
  {
    method: 'GET', path: '/api/v1/transactions/{id}', name: 'Query Transaction',
    description: 'Retrieve current status and details of a payment transaction',
    request: 'GET /api/v1/transactions/TXN-2026-100512',
    response: '{\n  "id": "TXN-2026-100512",\n  "status": "completed",\n  "amount": 1200000,\n  "completed_at": "2026-06-01T09:24:15Z",\n  "processing_ms": 342\n}',
  },
  {
    method: 'POST', path: '/api/v1/payments/{id}/confirm', name: 'Confirm Payment',
    description: 'Webhook endpoint — bank or MNO posts payment confirmation',
    request: '{\n  "transaction_id": "TXN-2026-100512",\n  "channel_reference": "MTN-REF-89012345",\n  "status": "success",\n  "confirmed_at": "2026-06-01T09:24:15Z"\n}',
    response: '{\n  "acknowledged": true,\n  "transaction_id": "TXN-2026-100512"\n}',
  },
  {
    method: 'GET', path: '/api/v1/reports/settlement', name: 'Settlement Report',
    description: 'Retrieve settlement batch details for a given date',
    request: 'GET /api/v1/reports/settlement?date=2026-06-01',
    response: '{\n  "date": "2026-06-01",\n  "batches": 8,\n  "total_amount": 24400000000,\n  "status": "completed"\n}',
  },
  {
    method: 'GET', path: '/api/v1/reports/reconciliation', name: 'Reconciliation API',
    description: 'Pull reconciliation results and exception reports',
    request: 'GET /api/v1/reports/reconciliation?date=2026-06-01',
    response: '{\n  "match_rate": 97.4,\n  "matched": 48012,\n  "unmatched": 892,\n  "exceptions": 387\n}',
  },
  {
    method: 'POST', path: '/api/v1/webhooks', name: 'Register Webhook',
    description: 'Register a callback URL for real-time payment event notifications',
    request: '{\n  "url": "https://your-agency.go.ug/webhooks/payments",\n  "events": ["payment.completed", "payment.failed", "settlement.done"]\n}',
    response: '{\n  "webhook_id": "WH-001234",\n  "secret": "whsec_***masked***",\n  "status": "active"\n}',
  },
]

const WEBHOOK_LOGS = [
  { id: 'WL-001', event: 'payment.completed', url: 'https://ura.go.ug/webhooks', status: 'delivered', code: 200 },
  { id: 'WL-002', event: 'settlement.done', url: 'https://mow.go.ug/webhooks', status: 'delivered', code: 200 },
  { id: 'WL-003', event: 'payment.failed', url: 'https://nira.go.ug/webhooks', status: 'failed', code: 503 },
]

const METHOD_COLOR: Record<string, string> = {
  GET:  'bg-success-light text-success',
  POST: 'bg-primary-50 text-primary',
}

export default function ApiPlatformPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [tryModal, setTryModal] = useState<typeof ENDPOINTS[0] | null>(null)
  const [liveKey] = useState(`gps_live_${'x'.repeat(36)}`)
  const [sandboxKey] = useState(`gps_test_${'x'.repeat(36)}`)

  return (
    <div>
      <PageHeader
        title="API Platform"
        subtitle="Developer portal — GovPay Switch payment integration APIs"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-light text-success rounded-full text-xs font-medium">
            <CheckCircle2 size={13} /> Sandbox: Operational
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        {ENDPOINTS.map((ep) => (
          <div key={ep.path} className="bg-card rounded-card shadow-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${METHOD_COLOR[ep.method] ?? 'bg-slate-100 text-muted'}`}>
                {ep.method}
              </span>
              <code className="text-xs text-muted font-mono">{ep.path}</code>
            </div>
            <div className="text-sm font-semibold text-slate-800">{ep.name}</div>
            <div className="text-xs text-muted flex-1">{ep.description}</div>
            <button
              onClick={() => setTryModal(ep)}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-light transition-colors w-fit"
            >
              <Code2 size={12} /> Try It →
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">API Key Management</h3>
          <div className="space-y-4">
            {[
              { label: 'Live API Key', key: liveKey },
              { label: 'Sandbox API Key', key: sandboxKey },
            ].map((k) => (
              <div key={k.label}>
                <div className="text-xs text-muted mb-1">{k.label}</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-surface border border-border rounded px-3 py-2 truncate">
                    {k.key.slice(0, 16)}{'*'.repeat(24)}
                  </code>
                  <button
                    onClick={() => addToast(`${k.label} regenerated`, 'warning')}
                    className="text-xs text-muted hover:text-danger transition-colors flex-shrink-0"
                    title="Regenerate key"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Webhook Delivery Log</h3>
          <div className="space-y-2">
            {WEBHOOK_LOGS.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-xs font-medium">{log.event}</div>
                  <div className="text-[10px] text-muted font-mono truncate max-w-[200px]">{log.url}</div>
                </div>
                <Badge variant={log.status === 'delivered' ? 'success' : 'danger'}>
                  {log.code}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!tryModal} onClose={() => setTryModal(null)} title={tryModal?.name ?? ''} maxWidth="max-w-3xl">
        {tryModal && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-muted uppercase mb-2">Request</div>
              <pre className="bg-slate-900 text-green-400 text-xs rounded-lg p-4 overflow-auto max-h-64 font-mono leading-relaxed whitespace-pre-wrap">
                {tryModal.request}
              </pre>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted uppercase mb-2">Response</div>
              <pre className="bg-slate-900 text-blue-300 text-xs rounded-lg p-4 overflow-auto max-h-64 font-mono leading-relaxed whitespace-pre-wrap">
                {tryModal.response}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
