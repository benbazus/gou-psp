import { useState } from 'react'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useAppStore } from '../../../store/appStore'
import {
  CheckCircle2, Copy, Eye, EyeOff, RefreshCw, ShieldCheck,
  Zap, FileText, Key, Webhook, Globe, AlertTriangle,
  Play, ChevronRight, RotateCcw, BookOpen,
} from 'lucide-react'
import clsx from 'clsx'

// â”€â”€â”€ API catalogue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const APIS = [
  {
    id: 'create-invoice',
    method: 'POST', path: '/api/v1/invoices',
    name: 'Create Invoice',
    group: 'Collections',
    description: 'Generate a Payment Reference Number (PRN) for a government service. The PRN is a unique identifier that links a citizen\'s payment to a specific government obligation.',
    auth: 'Bearer token',
    headers: [
      { name: 'Authorization', value: 'Bearer gps_live_...', required: true },
      { name: 'Content-Type',  value: 'application/json',     required: true },
      { name: 'X-Idempotency-Key', value: 'uuid-v4',          required: true, note: 'Prevents duplicate invoices on retry' },
    ],
    params: [
      { name: 'agency_id',   type: 'string',  required: true,  desc: 'Agency code: URA, NIRA, URSB, MOL, UPF, IMM, KCCA, MOW' },
      { name: 'service_id',  type: 'string',  required: true,  desc: 'Service identifier within the agency' },
      { name: 'payer_name',  type: 'string',  required: true,  desc: 'Full legal name of the payer' },
      { name: 'payer_phone', type: 'string',  required: false, desc: 'E.164 format: +256771234567' },
      { name: 'amount',      type: 'integer', required: true,  desc: 'Amount in UGX (Uganda Shillings), no decimals' },
      { name: 'currency',    type: 'string',  required: true,  desc: 'Must be "UGX"' },
      { name: 'reference',   type: 'string',  required: false, desc: 'Your internal reference ID' },
    ],
    request: `{
  "agency_id": "URA",
  "service_id": "ura-tax",
  "payer_name": "Mugisha Robert",
  "payer_phone": "+256771234567",
  "amount": 1200000,
  "currency": "UGX",
  "reference": "INTERNAL-REF-001"
}`,
    response: `{
  "status": "success",
  "code": "INV_001",
  "data": {
    "prn": "PRN20260601001234",
    "invoice_id": "INV-2026-001234",
    "agency": "Uganda Revenue Authority",
    "service": "Income Tax",
    "amount": 1200000,
    "currency": "UGX",
    "payer_name": "Mugisha Robert",
    "issued_at": "2026-06-01T09:00:00Z",
    "expires_at": "2026-06-08T23:59:59Z",
    "status": "pending",
    "payment_url": "https://pay.govpay.go.ug/PRN20260601001234"
  },
  "meta": { "request_id": "req_abc123", "version": "v1" }
}`,
    errors: ['400 â€” Missing required field', '409 â€” Duplicate idempotency key', '422 â€” Invalid agency or service ID'],
  },
  {
    id: 'validate-payment',
    method: 'GET', path: '/api/v1/invoices/{prn}',
    name: 'Validate Payment',
    group: 'Collections',
    description: 'Validate a PRN and retrieve full invoice details before initiating payment. Always validate before charging the payer to avoid failed debits on expired or already-paid invoices.',
    auth: 'Bearer token',
    headers: [
      { name: 'Authorization', value: 'Bearer gps_live_...', required: true },
    ],
    params: [
      { name: 'prn', type: 'string (path)', required: true, desc: 'Payment Reference Number from Create Invoice' },
    ],
    request: `GET /api/v1/invoices/PRN20260601001234`,
    response: `{
  "status": "success",
  "data": {
    "prn": "PRN20260601001234",
    "valid": true,
    "invoice_status": "pending",
    "amount": 1200000,
    "currency": "UGX",
    "payer_name": "Mugisha Robert",
    "agency": "Uganda Revenue Authority",
    "service": "Income Tax",
    "expires_at": "2026-06-08T23:59:59Z",
    "payment_channels": ["MTN Mobile Money", "Airtel Money", "Bank Transfer"]
  }
}`,
    errors: ['404 â€” PRN not found', '410 â€” PRN expired', '422 â€” PRN already paid'],
  },
  {
    id: 'initiate-payment',
    method: 'POST', path: '/api/v1/payments',
    name: 'Initiate Payment',
    group: 'Payments',
    description: 'Initiate a payment for a validated PRN via a specified channel. The switch validates the PRN, routes the debit instruction to the selected channel, and returns a transaction ID.',
    auth: 'Bearer token',
    headers: [
      { name: 'Authorization',     value: 'Bearer gps_live_...',       required: true },
      { name: 'Content-Type',      value: 'application/json',           required: true },
      { name: 'X-Idempotency-Key', value: 'uuid-v4',                   required: true },
    ],
    params: [
      { name: 'prn',     type: 'string',  required: true,  desc: 'Validated PRN from Create Invoice' },
      { name: 'channel', type: 'string',  required: true,  desc: 'MTN Mobile Money | Airtel Money | Bank Transfer | Visa/Mastercard | USSD' },
      { name: 'phone',   type: 'string',  required: false, desc: 'E.164 phone for mobile money channels' },
      { name: 'amount',  type: 'integer', required: true,  desc: 'Must match invoice amount exactly' },
    ],
    request: `{
  "prn": "PRN20260601001234",
  "channel": "MTN Mobile Money",
  "phone": "+256771234567",
  "amount": 1200000,
  "currency": "UGX"
}`,
    response: `{
  "status": "success",
  "data": {
    "transaction_id": "TXN-2026-100512",
    "status": "processing",
    "channel": "MTN Mobile Money",
    "channel_reference": "MTN-REF-89012345",
    "expected_confirmation_ms": 5000,
    "webhook_event": "payment.completed or payment.failed"
  }
}`,
    errors: ['400 â€” Invalid channel', '409 â€” PRN already processing', '422 â€” Amount mismatch'],
  },
  {
    id: 'confirm-payment',
    method: 'POST', path: '/api/v1/payments/{id}/confirm',
    name: 'Confirm Payment',
    group: 'Payments',
    description: 'Called by bank or MNO to post payment confirmation back to the switch. The switch matches the confirmation to the pending transaction and updates its status.',
    auth: 'mTLS + HMAC-SHA256',
    headers: [
      { name: 'X-GovPay-Signature', value: 'HMAC-SHA256 of body', required: true, note: 'Compute with your webhook secret' },
      { name: 'Content-Type',       value: 'application/json',      required: true },
    ],
    params: [
      { name: 'transaction_id',    type: 'string', required: true, desc: 'GovPay transaction ID' },
      { name: 'channel_reference', type: 'string', required: true, desc: 'Channel-side transaction reference' },
      { name: 'status',            type: 'string', required: true, desc: 'success | failed | reversed' },
      { name: 'confirmed_at',      type: 'ISO8601', required: true, desc: 'Timestamp of confirmation at channel' },
    ],
    request: `{
  "transaction_id": "TXN-2026-100512",
  "channel_reference": "MTN-REF-89012345",
  "status": "success",
  "confirmed_at": "2026-06-01T09:24:15Z",
  "payer_msisdn": "+256771234567"
}`,
    response: `{
  "acknowledged": true,
  "transaction_id": "TXN-2026-100512",
  "final_status": "completed"
}`,
    errors: ['401 â€” Invalid signature', '404 â€” Transaction not found', '409 â€” Already confirmed'],
  },
  {
    id: 'query-transaction',
    method: 'GET', path: '/api/v1/transactions/{id}',
    name: 'Query Transaction',
    group: 'Payments',
    description: 'Retrieve full details and current status of a payment transaction. Poll this endpoint if your webhook is delayed, or use it to audit a specific transaction.',
    auth: 'Bearer token',
    headers: [{ name: 'Authorization', value: 'Bearer gps_live_...', required: true }],
    params: [
      { name: 'id', type: 'string (path)', required: true, desc: 'GovPay transaction ID (TXN-YYYY-XXXXXX)' },
    ],
    request: `GET /api/v1/transactions/TXN-2026-100512`,
    response: `{
  "status": "success",
  "data": {
    "id": "TXN-2026-100512",
    "prn": "PRN20260601001234",
    "status": "completed",
    "amount": 1200000,
    "currency": "UGX",
    "channel": "MTN Mobile Money",
    "payer_name": "Mugisha Robert",
    "agency": "Uganda Revenue Authority",
    "initiated_at": "2026-06-01T09:23:58Z",
    "completed_at": "2026-06-01T09:24:15Z",
    "processing_ms": 342,
    "receipt_url": "https://receipts.govpay.go.ug/TXN-2026-100512"
  }
}`,
    errors: ['404 â€” Transaction not found', '403 â€” Not authorized for this transaction'],
  },
  {
    id: 'settlement-report',
    method: 'GET', path: '/api/v1/reports/settlement',
    name: 'Settlement Report',
    group: 'Reports',
    description: 'Retrieve settlement batch summary and details for a given date. Settlement files are available after 06:00 EAT the following day.',
    auth: 'Bearer token',
    headers: [{ name: 'Authorization', value: 'Bearer gps_live_...', required: true }],
    params: [
      { name: 'date',     type: 'string (query)', required: true,  desc: 'ISO 8601 date: 2026-06-01' },
      { name: 'format',   type: 'string (query)', required: false, desc: 'json | csv | iso20022 (default: json)' },
      { name: 'institution', type: 'string (query)', required: false, desc: 'Filter by institution ID' },
    ],
    request: `GET /api/v1/reports/settlement?date=2026-06-01&format=json`,
    response: `{
  "status": "success",
  "data": {
    "date": "2026-06-01",
    "settlement_window": "22:00 EAT",
    "total_batches": 8,
    "total_gross_amount": 24400000000,
    "total_net_amount": 24278000000,
    "total_fees": 122000000,
    "currency": "UGX",
    "status": "completed",
    "batches": [
      {
        "batch_id": "BATCH-2026-0601-001",
        "institution": "MTN Mobile Money",
        "gross": 12800000000,
        "net": 12736000000,
        "transactions": 380000,
        "status": "completed"
      }
    ]
  }
}`,
    errors: ['400 â€” Invalid date format', '404 â€” No settlement for date', '403 â€” Access denied'],
  },
  {
    id: 'reconciliation',
    method: 'GET', path: '/api/v1/reports/reconciliation',
    name: 'Reconciliation API',
    group: 'Reports',
    description: 'Pull reconciliation results and exception reports. Returns match rate, unmatched transactions, and exception breakdown for audit and compliance.',
    auth: 'Bearer token',
    headers: [{ name: 'Authorization', value: 'Bearer gps_live_...', required: true }],
    params: [
      { name: 'date',      type: 'string (query)', required: true,  desc: 'ISO 8601 date' },
      { name: 'source',    type: 'string (query)', required: false, desc: 'switch | agency | bank | treasury' },
      { name: 'exception_type', type: 'string (query)', required: false, desc: 'unmatched | duplicate | overpayment | underpayment' },
    ],
    request: `GET /api/v1/reports/reconciliation?date=2026-06-01`,
    response: `{
  "status": "success",
  "data": {
    "date": "2026-06-01",
    "match_rate": 97.4,
    "total_switch_records": 48291,
    "total_agency_records": 47198,
    "matched": 47012,
    "unmatched": 892,
    "duplicates": 187,
    "missing_confirmations": 412,
    "overpayments": 93,
    "underpayments": 201,
    "exceptions_total": 1279
  }
}`,
    errors: ['404 â€” No reconciliation run found', '403 â€” Access denied'],
  },
  {
    id: 'webhook-events',
    method: 'POST', path: '/api/v1/webhooks',
    name: 'Register Webhook',
    group: 'Webhooks',
    description: 'Register a callback URL for real-time payment event notifications. GovPay will POST a signed payload to your URL for each subscribed event.',
    auth: 'Bearer token',
    headers: [
      { name: 'Authorization', value: 'Bearer gps_live_...', required: true },
      { name: 'Content-Type',  value: 'application/json',    required: true },
    ],
    params: [
      { name: 'url',         type: 'string',    required: true,  desc: 'HTTPS endpoint to receive events' },
      { name: 'events',      type: 'string[]',  required: true,  desc: 'payment.completed | payment.failed | settlement.done | reconciliation.complete | dispute.raised' },
      { name: 'description', type: 'string',    required: false, desc: 'Human-readable webhook name' },
    ],
    request: `{
  "url": "https://your-agency.go.ug/webhooks/govpay",
  "events": [
    "payment.completed",
    "payment.failed",
    "settlement.done"
  ],
  "description": "URA production webhook"
}`,
    response: `{
  "status": "success",
  "data": {
    "webhook_id": "WH-001234",
    "url": "https://your-agency.go.ug/webhooks/govpay",
    "events": ["payment.completed", "payment.failed", "settlement.done"],
    "secret": "whsec_xxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "active",
    "created_at": "2026-06-01T09:00:00Z"
  }
}`,
    errors: ['400 â€” Invalid URL or event type', '422 â€” URL not reachable (must return 200 on POST)'],
  },
]

// â”€â”€â”€ Webhook log entries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WEBHOOK_LOGS = [
  { id: 'WL-001', event: 'payment.completed',        url: 'https://ura.go.ug/webhooks',   status: 'delivered', code: 200, ms: 142, ts: '09:24:15', retries: 0, size: '1.2 KB' },
  { id: 'WL-002', event: 'settlement.done',           url: 'https://mow.go.ug/webhooks',   status: 'delivered', code: 200, ms: 318, ts: '22:05:01', retries: 0, size: '8.4 KB' },
  { id: 'WL-003', event: 'payment.failed',            url: 'https://nira.go.ug/webhooks',  status: 'failed',    code: 503, ms: 5001, ts: '08:47:33', retries: 3, size: '0.9 KB' },
  { id: 'WL-004', event: 'reconciliation.complete',   url: 'https://ura.go.ug/webhooks',   status: 'delivered', code: 200, ms: 224, ts: '06:04:37', retries: 0, size: '12.1 KB' },
  { id: 'WL-005', event: 'dispute.raised',            url: 'https://imm.go.ug/webhooks',   status: 'delivered', code: 200, ms: 189, ts: '07:31:00', retries: 0, size: '2.3 KB' },
  { id: 'WL-006', event: 'payment.completed',         url: 'https://kcca.go.ug/webhooks',  status: 'retrying',  code: 0,   ms: 0,   ts: '10:12:44', retries: 1, size: '1.1 KB' },
]

// â”€â”€â”€ Sandbox components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SANDBOX_COMPONENTS = [
  { name: 'API Gateway (Sandbox)',     status: 'operational', latency: '34ms', uptime: '100%' },
  { name: 'MTN Mobile Money (Test)',   status: 'operational', latency: '45ms', uptime: '100%' },
  { name: 'Airtel Money (Test)',       status: 'operational', latency: '51ms', uptime: '100%' },
  { name: 'Stanbic Bank (Test)',       status: 'operational', latency: '67ms', uptime: '100%' },
  { name: 'URA Agency (Test)',         status: 'operational', latency: '28ms', uptime: '100%' },
  { name: 'Webhook Delivery (Test)',   status: 'degraded',    latency: '320ms', uptime: '97.2%' },
]

const METHOD_STYLE: Record<string, string> = {
  GET:  'bg-green-100 text-green-700 border-green-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
}

const GROUP_ICON: Record<string, React.ElementType> = {
  Collections: FileText,
  Payments:    Zap,
  Reports:     BookOpen,
  Webhooks:    Webhook,
}

// â”€â”€â”€ API Reference panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ApiReference() {
  const addToast = useAppStore((s) => s.addToast)
  const [selectedId, setSelectedId] = useState(APIS[0].id)
  const [docTab, setDocTab] = useState<'docs' | 'try'>('docs')
  const [sending, setSending] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const api = APIS.find((a) => a.id === selectedId)!

  const groups = Array.from(new Set(APIS.map((a) => a.group)))

  async function sendRequest() {
    setSending(true)
    setResponse(null)
    await new Promise<void>((r) => setTimeout(r, 1100))
    setResponse(api.response)
    setSending(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    addToast('Copied to clipboard', 'info')
  }

  return (
    <div className="flex gap-0 min-h-[680px]">
      {/* Left nav */}
      <div className="w-52 flex-shrink-0 bg-surface border-r border-border">
        <div className="px-3 py-3 border-b border-border">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">API Reference</p>
          <p className="text-[10px] text-muted mt-0.5">v1 â€” Stable</p>
        </div>
        <nav className="py-2">
          {groups.map((group) => {
            const Icon = GROUP_ICON[group] ?? FileText
            return (
              <div key={group} className="mb-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                  <Icon size={11} /> {group}
                </div>
                {APIS.filter((a) => a.group === group).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedId(a.id); setDocTab('docs'); setResponse(null) }}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-all',
                      selectedId === a.id
                        ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold'
                        : 'text-muted hover:text-slate-800 hover:bg-surface',
                    )}
                  >
                    <span className={clsx('text-[9px] font-black px-1.5 py-0.5 rounded border flex-shrink-0', METHOD_STYLE[a.method])}>
                      {a.method}
                    </span>
                    <span className="truncate">{a.name}</span>
                  </button>
                ))}
              </div>
            )
          })}

          {/* Auth + Errors quicklinks */}
          <div className="mt-2 border-t border-border pt-2">
            {['Authentication', 'Error Codes', 'Rate Limits'].map((s) => (
              <div key={s} className="px-3 py-1.5 text-xs text-muted hover:text-slate-700 cursor-pointer flex items-center gap-1.5">
                <ChevronRight size={10} /> {s}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Doc panel */}
      <div className="flex-1 min-w-0">
        <div className="p-6 max-w-3xl">
          {/* Endpoint header */}
          <div className="flex items-center gap-3 mb-2">
            <span className={clsx('text-xs font-black px-2.5 py-1 rounded-lg border', METHOD_STYLE[api.method])}>
              {api.method}
            </span>
            <code className="text-sm font-mono text-slate-800 bg-surface border border-border rounded-lg px-3 py-1.5">
              {api.path}
            </code>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-1">{api.name}</h2>
          <p className="text-sm text-muted mb-5 leading-relaxed">{api.description}</p>

          {/* Doc / Try It tabs */}
          <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border mb-5 w-fit">
            {(['docs', 'try'] as const).map((t) => (
              <button key={t} onClick={() => { setDocTab(t); setResponse(null) }}
                className={clsx('px-4 py-1.5 text-xs rounded-lg font-medium transition-all capitalize',
                  docTab === t ? 'bg-card text-slate-800 shadow-sm' : 'text-muted hover:text-slate-700')}>
                {t === 'try' ? 'â–¶ Try It' : 'ðŸ“„ Docs'}
              </button>
            ))}
          </div>

          {docTab === 'docs' ? (
            <div className="space-y-6">
              {/* Auth */}
              <section>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Authentication</h3>
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck size={14} className="text-green-500" />
                  <code className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-primary">{api.auth}</code>
                </div>
              </section>

              {/* Headers */}
              <section>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Request Headers</h3>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        {['Header', 'Value', 'Required', 'Notes'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-muted uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {api.headers.map((hdr) => (
                        <tr key={hdr.name} className="hover:bg-surface">
                          <td className="px-3 py-2 font-mono font-semibold text-primary">{hdr.name}</td>
                          <td className="px-3 py-2 font-mono text-muted text-[11px]">{hdr.value}</td>
                          <td className="px-3 py-2">
                            {hdr.required
                              ? <span className="text-danger font-bold text-[10px]">Required</span>
                              : <span className="text-muted text-[10px]">Optional</span>
                            }
                          </td>
                          <td className="px-3 py-2 text-muted text-[11px]">{'note' in hdr ? hdr.note : 'â€”'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Parameters */}
              <section>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  {api.method === 'GET' ? 'Query Parameters' : 'Request Body'}
                </h3>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        {['Parameter', 'Type', 'Required', 'Description'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-muted uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {api.params.map((p) => (
                        <tr key={p.name} className="hover:bg-surface">
                          <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{p.name}</td>
                          <td className="px-3 py-2.5 font-mono text-muted text-[11px]">{p.type}</td>
                          <td className="px-3 py-2.5">
                            {p.required
                              ? <span className="text-danger font-bold text-[10px]">Required</span>
                              : <span className="text-muted text-[10px]">Optional</span>
                            }
                          </td>
                          <td className="px-3 py-2.5 text-muted leading-snug">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Request / Response examples */}
              <section className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Request</span>
                    <button onClick={() => copy(api.request, 'req')}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-slate-800">
                      {copied === 'req' ? <CheckCircle2 size={11} className="text-green-500" /> : <Copy size={11} />}
                      {copied === 'req' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-green-400 text-[11px] rounded-xl p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                    {api.request}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Response 200</span>
                    <button onClick={() => copy(api.response, 'res')}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-slate-800">
                      {copied === 'res' ? <CheckCircle2 size={11} className="text-green-500" /> : <Copy size={11} />}
                      {copied === 'res' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-blue-300 text-[11px] rounded-xl p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                    {api.response}
                  </pre>
                </div>
              </section>

              {/* Errors */}
              <section>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Error Codes</h3>
                <div className="space-y-1.5">
                  {api.errors.map((e) => (
                    <div key={e} className="flex items-center gap-2 text-xs bg-surface border border-border rounded-lg px-3 py-2">
                      <AlertTriangle size={11} className="text-warning flex-shrink-0" />
                      <span className="font-mono text-danger font-semibold">{e.split(' â€” ')[0]}</span>
                      <span className="text-muted">â€” {e.split(' â€” ')[1]}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* â”€â”€ Try It panel â”€â”€ */
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-800 mb-3">Request Parameters</p>
                <div className="space-y-2.5">
                  {api.params.slice(0, 4).map((p) => (
                    <div key={p.name}>
                      <label className="text-xs text-muted mb-1 block">
                        {p.name}
                        {p.required && <span className="text-danger ml-1">*</span>}
                        <span className="ml-2 font-mono text-[10px] text-primary">{p.type}</span>
                      </label>
                      <input
                        className="w-full border border-border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                        placeholder={p.desc}
                        defaultValue={
                          p.name.includes('prn') ? 'PRN20260601001234' :
                          p.name.includes('amount') ? '1200000' :
                          p.name.includes('channel') ? 'MTN Mobile Money' :
                          p.name.includes('id') ? 'TXN-2026-100512' :
                          p.name.includes('date') ? '2026-06-01' : ''
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={sendRequest}
                disabled={sending}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60"
              >
                {sending
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sendingâ€¦</>
                  : <><Play size={14} />Send Request</>
                }
              </button>

              {response && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 font-bold px-2 py-0.5 rounded-full">200 OK</span>
                      <span className="text-[10px] text-muted">342ms</span>
                    </div>
                    <button onClick={() => copy(response, 'try')}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-slate-800">
                      {copied === 'try' ? <CheckCircle2 size={11} className="text-green-500" /> : <Copy size={11} />}
                      Copy
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-green-300 text-[11px] rounded-xl p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap max-h-72">
                    {response}
                  </pre>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ API Keys tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ApiKeysTab() {
  const addToast = useAppStore((s) => s.addToast)
  const [showLive, setShowLive] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const LIVE_KEY = 'gps_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  const TEST_KEY = 'gps_test_sk_tttttttttttttttttttttttttttttttttttttt'

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    addToast('API key copied to clipboard', 'info')
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-1">API Key Management</h2>
        <p className="text-xs text-muted">Keys grant access to the GovPay Switch API. Keep them secret â€” never commit to source code.</p>
      </div>

      {[
        { label: 'Live API Key',    badge: 'bg-green-100 text-green-700 border-green-200', key: LIVE_KEY, show: showLive, onToggle: () => setShowLive((v) => !v), copyKey: 'live', env: 'Production' },
        { label: 'Sandbox API Key', badge: 'bg-blue-100 text-blue-700 border-blue-200',   key: TEST_KEY, show: showTest, onToggle: () => setShowTest((v) => !v), copyKey: 'test', env: 'Sandbox' },
      ].map(({ label, badge, key, show, onToggle, copyKey, env }) => (
        <div key={label} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-primary" />
              <span className="text-sm font-semibold text-slate-800">{label}</span>
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', badge)}>{env}</span>
            </div>
            <span className="text-[10px] text-muted">Last used: 3 min ago</span>
          </div>

          <div className="bg-slate-900 rounded-xl px-4 py-3 font-mono text-[12px] text-green-400 mb-3 break-all">
            {show ? key : `gps_${env === 'Production' ? 'live' : 'test'}_sk_${'â€¢'.repeat(42)}`}
          </div>

          <div className="flex gap-2">
            <button onClick={onToggle}
              className="flex items-center gap-1.5 text-xs text-muted border border-border rounded-lg px-3 py-1.5 hover:text-slate-800 transition-colors">
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
              {show ? 'Hide' : 'Reveal'}
            </button>
            <button onClick={() => copy(key, copyKey)}
              className="flex items-center gap-1.5 text-xs text-muted border border-border rounded-lg px-3 py-1.5 hover:text-slate-800 transition-colors">
              {copied === copyKey ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied === copyKey ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => addToast(`${label} regenerated â€” old key invalidated`, 'warning')}
              className="flex items-center gap-1.5 text-xs text-warning border border-yellow-200 rounded-lg px-3 py-1.5 hover:bg-yellow-50 transition-colors ml-auto">
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>

          {/* Permissions */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted mb-1.5 font-semibold uppercase tracking-wider">Permissions</p>
            <div className="flex flex-wrap gap-1.5">
              {['read:transactions', 'write:payments', 'write:invoices', 'read:reports', 'read:settlement'].map((p) => (
                <span key={p} className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5">{p}</span>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Usage stats */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">API Usage Today</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Requests', value: '8,421', sub: 'of 100,000 limit' },
            { label: 'Success Rate', value: '99.6%', sub: 'last 24 hours' },
            { label: 'Avg Latency', value: '187ms', sub: 'P99: 1.2s' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-surface rounded-xl p-3 border border-border text-center">
              <div className="text-lg font-black text-primary">{value}</div>
              <div className="text-[10px] text-muted">{label}</div>
              <div className="text-[10px] text-muted">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Webhooks tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WebhooksTab() {
  const addToast = useAppStore((s) => s.addToast)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Event types */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Event Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { event: 'payment.completed',        desc: 'Payment successfully processed and confirmed' },
            { event: 'payment.failed',           desc: 'Payment failed at channel or validation' },
            { event: 'payment.reversed',         desc: 'Previously completed payment was reversed' },
            { event: 'settlement.done',          desc: 'End-of-day settlement batch completed' },
            { event: 'reconciliation.complete',  desc: 'Daily reconciliation run finished' },
            { event: 'dispute.raised',           desc: 'New dispute registered by a payer' },
          ].map(({ event, desc }) => (
            <div key={event} className="bg-surface border border-border rounded-xl p-3 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <code className="text-[11px] font-mono font-bold text-primary">{event}</code>
                <p className="text-[10px] text-muted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        <p className="font-semibold mb-1 flex items-center gap-1.5"><ShieldCheck size={13} /> Verify webhook signatures</p>
        <p>Every webhook payload includes an <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">X-GovPay-Signature</code> header.
        Compute <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">HMAC-SHA256(body, webhook_secret)</code> and compare to verify authenticity before processing.</p>
      </div>

      {/* Delivery log */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Webhook Delivery Log</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['ID', 'Event', 'Endpoint', 'Status', 'Code', 'Latency', 'Retries', 'Time', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {WEBHOOK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-surface transition-colors">
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted">{log.id}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-primary">{log.event}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted truncate max-w-[140px]">{log.url}</td>
                  <td className="px-3 py-2.5">
                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      log.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                      log.status === 'failed'    ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className={clsx('px-3 py-2.5 font-mono font-bold text-[11px]',
                    log.code === 200 ? 'text-green-700' : log.code === 0 ? 'text-muted' : 'text-danger')}>
                    {log.code || 'â€”'}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted">{log.ms > 0 ? `${log.ms}ms` : 'â€”'}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted">{log.retries}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted">{log.ts}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => addToast(`${log.event} replayed to ${log.url}`, 'info')}
                      className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold">
                      <RotateCcw size={10} /> Replay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Sandbox tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SandboxTab() {
  const addToast = useAppStore((s) => s.addToast)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Status grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Sandbox Environment Status</h3>
          <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Mostly Operational
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SANDBOX_COMPONENTS.map((c) => (
            <div key={c.name} className={clsx('rounded-xl border p-3 flex items-center justify-between',
              c.status === 'operational' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200')}>
              <div>
                <div className="text-xs font-semibold text-slate-800">{c.name}</div>
                <div className="text-[10px] text-muted mt-0.5">{c.uptime} uptime Â· {c.latency} avg</div>
              </div>
              <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0',
                c.status === 'operational' ? 'bg-green-500' : 'bg-yellow-400 animate-pulse')} />
            </div>
          ))}
        </div>
      </div>

      {/* Test data */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Pre-seeded Test Data</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Test PRNs',         value: '100 pre-generated', desc: 'Use PRN-TEST-XXXX pattern' },
            { label: 'Test Payer ID',     value: '256771234567',       desc: 'MTN test number (always succeeds)' },
            { label: 'Fail Trigger',      value: '256700000000',       desc: 'Forces payment.failed response' },
            { label: 'Timeout Trigger',   value: '256711111111',       desc: 'Simulates 30s timeout' },
            { label: 'Test Bank Account', value: '00100001234',         desc: 'Stanbic sandbox account' },
            { label: 'Test Card',         value: '4111 1111 1111 1111', desc: 'Visa test card (CVV: 123)' },
          ].map(({ label, value, desc }) => (
            <div key={label} className="bg-surface rounded-xl border border-border p-3">
              <div className="text-muted mb-0.5">{label}</div>
              <div className="font-mono font-bold text-slate-800">{value}</div>
              <div className="text-muted mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="flex gap-3">
        <button onClick={() => addToast('Sandbox data reset to defaults', 'info')}
          className="flex items-center gap-2 px-4 py-2 border border-border text-muted rounded-xl text-sm hover:text-slate-800 transition-colors">
          <RefreshCw size={13} /> Reset Sandbox Data
        </button>
        <button onClick={() => addToast('Sandbox cleared â€” all test transactions purged', 'warning')}
          className="flex items-center gap-2 px-4 py-2 border border-warning text-warning rounded-xl text-sm hover:bg-yellow-50 transition-colors">
          <AlertTriangle size={13} /> Clear All Test Transactions
        </button>
      </div>
    </div>
  )
}

// â”€â”€â”€ Overview tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OverviewTab() {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-[#2A5298] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={20} className="text-accent" />
          <span className="font-black text-lg">Uganda GovPay Switch API</span>
          <span className="text-[10px] bg-white/20 text-white border border-white/30 rounded-full px-2 py-0.5 font-bold ml-1">v1</span>
        </div>
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          The GovPay Switch API enables banks, fintechs, and government portals to integrate with Uganda's national payment infrastructure â€” accepting tax payments, government fees, and service charges across all payment channels.
        </p>
        <div className="flex gap-3 text-xs">
          <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
            <div className="font-black text-lg">8</div><div className="text-white/60">Endpoints</div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
            <div className="font-black text-lg">99.97%</div><div className="text-white/60">Uptime</div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
            <div className="font-black text-lg">187ms</div><div className="text-white/60">Avg Latency</div>
          </div>
        </div>
      </div>

      {/* Quick start */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Start â€” 3 Steps</h3>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Get your API key', desc: 'Generate a sandbox API key from the API Keys tab. Use gps_test_ keys for development.', code: 'Authorization: Bearer gps_test_sk_...' },
            { step: '2', title: 'Create an invoice', desc: 'POST /api/v1/invoices to generate a PRN for the government service you want to collect.', code: 'POST /api/v1/invoices â†’ { "prn": "PRN..." }' },
            { step: '3', title: 'Initiate payment', desc: 'POST /api/v1/payments with the PRN and channel. Listen for the webhook to confirm.', code: 'POST /api/v1/payments â†’ { "transaction_id": "TXN-..." }' },
          ].map(({ step, title, desc, code }) => (
            <div key={step} className="flex gap-4 bg-card border border-border rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black flex-shrink-0">{step}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 mb-0.5">{title}</div>
                <div className="text-xs text-muted mb-2">{desc}</div>
                <code className="text-[11px] font-mono text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 block">{code}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate limits */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Rate Limits</h3>
        <table className="w-full text-xs">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Endpoint Group', 'Live Limit', 'Sandbox Limit', 'Window'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { group: 'Create Invoice',      live: '1,000/min',   sandbox: '100/min',   window: 'Rolling 60s' },
              { group: 'Initiate Payment',    live: '500/min',     sandbox: '50/min',    window: 'Rolling 60s' },
              { group: 'Query Transaction',   live: '5,000/min',   sandbox: '500/min',   window: 'Rolling 60s' },
              { group: 'Reports',             live: '60/hour',     sandbox: '10/hour',   window: 'Rolling 3600s' },
            ].map((r) => (
              <tr key={r.group} className="hover:bg-surface">
                <td className="px-3 py-2.5 font-medium">{r.group}</td>
                <td className="px-3 py-2.5 font-mono text-primary">{r.live}</td>
                <td className="px-3 py-2.5 font-mono text-muted">{r.sandbox}</td>
                <td className="px-3 py-2.5 text-muted">{r.window}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ApiPlatformPage() {
  return (
    <div>
      <PageHeader
        title="API Platform"
        subtitle="Developer portal â€” GovPay Switch payment integration APIs"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Sandbox: Operational
          </div>
        }
      />

      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex gap-1 bg-surface p-1 rounded-xl border border-border mb-4 w-fit">
          {[
            { val: 'overview',  label: 'Overview',  icon: <Globe size={13} /> },
            { val: 'reference', label: 'Reference', icon: <BookOpen size={13} /> },
            { val: 'keys',      label: 'API Keys',  icon: <Key size={13} /> },
            { val: 'webhooks',  label: 'Webhooks',  icon: <Webhook size={13} /> },
            { val: 'sandbox',   label: 'Sandbox',   icon: <Zap size={13} /> },
          ].map(({ val, label, icon }) => (
            <Tabs.Trigger
              key={val}
              value={val}
              className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg text-muted font-medium
                data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:shadow-sm
                hover:text-slate-700 transition-all"
            >
              {icon}{label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="bg-card rounded-card shadow-card">
          <Tabs.Content value="overview"><OverviewTab /></Tabs.Content>
          <Tabs.Content value="reference"><ApiReference /></Tabs.Content>
          <Tabs.Content value="keys"><ApiKeysTab /></Tabs.Content>
          <Tabs.Content value="webhooks"><WebhooksTab /></Tabs.Content>
          <Tabs.Content value="sandbox"><SandboxTab /></Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  )
}
