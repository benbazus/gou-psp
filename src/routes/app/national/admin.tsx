import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Modal } from '../../../components/ui/Modal'
import { useAppStore } from '../../../store/appStore'
import { mockRoutingRules } from '../../../data/mockRouting'
import { mockAuditLog } from '../../../data/mockCompliance'
import { formatUGX } from '../../../utils/format'
import {
  ChevronUp, ChevronDown, Save, ShieldCheck, Eye, KeyRound,
  AlertTriangle, CheckCircle2, Clock, Globe, FileText,
  UserCheck, Database, Wifi, RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { RoutingRule, Role } from '../../../types'
import clsx from 'clsx'

const ROLES: Role[] = [
  'Super Admin', 'Bank of Uganda Operator', 'Treasury Officer', 'Agency Officer',
  'Compliance Officer', 'Settlement Officer', 'Support Officer', 'Developer',
]
const PERMISSIONS = [
  'View Dashboard', 'Run Settlement', 'Approve Settlement', 'View Compliance',
  'Manage Participants', 'Access API Keys', 'Admin Config', 'View Reports',
]
const ROLE_PERMS: Record<string, string[]> = {
  'Super Admin':             PERMISSIONS,
  'Bank of Uganda Operator': ['View Dashboard', 'View Compliance', 'View Reports', 'Run Settlement'],
  'Treasury Officer':        ['View Dashboard', 'Run Settlement', 'Approve Settlement', 'View Reports'],
  'Agency Officer':          ['View Dashboard', 'View Reports'],
  'Compliance Officer':      ['View Dashboard', 'View Compliance', 'View Reports'],
  'Settlement Officer':      ['View Dashboard', 'Run Settlement', 'Approve Settlement'],
  'Support Officer':         ['View Dashboard', 'View Reports'],
  'Developer':               ['View Dashboard', 'Access API Keys'],
}

const SETTLEMENT_CYCLES = [
  { id: 'SC-01', name: 'MTN Mobile Money', frequency: 'Daily', cutoff: '21:00' },
  { id: 'SC-02', name: 'Stanbic Bank',     frequency: 'Daily', cutoff: '22:00' },
  { id: 'SC-03', name: 'Airtel Money',     frequency: 'Daily', cutoff: '21:30' },
]

const NOTIFICATION_TEMPLATES = [
  { id: 'NT-01', name: 'Payment Confirmed',   channel: 'SMS + Email', active: true  },
  { id: 'NT-02', name: 'Payment Failed',      channel: 'SMS',         active: true  },
  { id: 'NT-03', name: 'Settlement Complete', channel: 'Email',       active: true  },
  { id: 'NT-04', name: 'Dispute Raised',      channel: 'Email',       active: false },
]

// â”€â”€â”€ Fee schedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FEE_SCHEDULE = [
  { id: 'FS-01', channel: 'MTN Mobile Money', type: 'Percentage', value: 1.5, cap: 5000,   payer: 'Citizen' },
  { id: 'FS-02', channel: 'Airtel Money',     type: 'Percentage', value: 1.5, cap: 5000,   payer: 'Citizen' },
  { id: 'FS-03', channel: 'Bank Transfer',    type: 'Flat',       value: 2500, cap: null,  payer: 'Citizen' },
  { id: 'FS-04', channel: 'Visa/Mastercard',  type: 'Percentage', value: 2.9, cap: 15000,  payer: 'Citizen' },
  { id: 'FS-05', channel: 'USSD',             type: 'Flat',       value: 500,  cap: null,  payer: 'Citizen' },
  { id: 'FS-06', channel: 'Wallet',           type: 'Percentage', value: 1.0, cap: 3000,   payer: 'Agency' },
]

// â”€â”€â”€ Agency accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AGENCY_ACCOUNTS = [
  { id: 'AG-01', agency: 'Uganda Revenue Authority (URA)', settlementBank: 'Bank of Uganda', account: 'BOU-URA-0001', status: 'active',    contact: 'collections@ura.go.ug' },
  { id: 'AG-02', agency: 'Kampala Capital City Authority', settlementBank: 'Stanbic Bank',   account: 'STAN-KCCA-4471', status: 'active',   contact: 'finance@kcca.go.ug' },
  { id: 'AG-03', agency: 'Ministry of Lands',              settlementBank: 'Bank of Uganda', account: 'BOU-MLHUD-0023', status: 'active',   contact: 'lands@mlhud.go.ug' },
  { id: 'AG-04', agency: 'NIRA',                           settlementBank: 'Centenary Bank', account: 'CENT-NIRA-8890', status: 'active',   contact: 'support@nira.go.ug' },
  { id: 'AG-05', agency: 'URSB',                           settlementBank: 'dfcu Bank',      account: 'DFCU-URSB-2210', status: 'suspended', contact: 'registry@ursb.go.ug' },
  { id: 'AG-06', agency: 'Directorate of Immigration',    settlementBank: 'Bank of Uganda', account: 'BOU-IMM-0044',   status: 'pending',  contact: 'epass@immigration.go.ug' },
]

// â”€â”€â”€ Approval workflows (maker-checker chains) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const APPROVAL_WORKFLOWS = [
  { id: 'WF-01', name: 'Settlement Batch Release',  threshold: 'All batches',        steps: ['Settlement Officer', 'Treasury Officer', 'Bank of Uganda Operator'], enabled: true },
  { id: 'WF-02', name: 'Refund / Reversal Approval', threshold: '> UGX 1,000,000',    steps: ['Support Officer', 'Compliance Officer'],                            enabled: true },
  { id: 'WF-03', name: 'New Participant Onboarding', threshold: 'All participants',   steps: ['Agency Officer', 'Compliance Officer', 'Super Admin'],              enabled: true },
  { id: 'WF-04', name: 'Fee Schedule Change',        threshold: 'Any fee edit',       steps: ['Treasury Officer', 'Super Admin'],                                  enabled: true },
  { id: 'WF-05', name: 'High-Value Payment Hold',    threshold: '> UGX 50,000,000',   steps: ['Compliance Officer', 'Bank of Uganda Operator'],                    enabled: false },
]

// â”€â”€â”€ PDPA data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PDPA_ITEMS = [
  { id: 'P01', article: 'S.11', title: 'Lawful Processing',           desc: 'All data processing has a defined lawful basis (government mandate, consent, or legal obligation).', status: 'compliant' },
  { id: 'P02', article: 'S.12', title: 'Purpose Limitation',          desc: 'Payment data collected for collections is not re-used for unrelated purposes.', status: 'compliant' },
  { id: 'P03', article: 'S.13', title: 'Data Minimisation',           desc: 'Only NIN, phone number, and transaction reference are collected â€” no biometric profiling.', status: 'compliant' },
  { id: 'P04', article: 'S.14', title: 'Accuracy',                    desc: 'Payer records are verified against NIRA database at onboarding. Annual refresh scheduled.', status: 'compliant' },
  { id: 'P05', article: 'S.15', title: 'Storage Limitation',          desc: 'Transaction records retained for 7 years per Bank of Uganda Directive 2022/04, then deleted.', status: 'compliant' },
  { id: 'P06', article: 'S.16', title: 'Integrity & Confidentiality', desc: 'AES-256-GCM encryption at rest, TLS 1.3 in transit. HSM-backed key management.', status: 'compliant' },
  { id: 'P07', article: 'S.20', title: 'Right of Access',             desc: 'Citizens can request their payment history via GovPay self-service portal within 21 days.', status: 'compliant' },
  { id: 'P08', article: 'S.21', title: 'Right to Rectification',      desc: 'Data correction request workflow available for incorrect citizen payment records.', status: 'compliant' },
  { id: 'P09', article: 'S.22', title: 'Right to Erasure',            desc: 'Erasure requests reviewed by DPO. Payment records subject to legal hold are exempt.', status: 'review'    },
  { id: 'P10', article: 'S.23', title: 'Right to Object',             desc: 'Opt-out from non-essential marketing communications (transactional notifications are mandatory).', status: 'compliant' },
  { id: 'P11', article: 'S.29', title: 'Cross-border Transfers',      desc: 'No personal data transferred outside Uganda without adequacy decision or SCCs.', status: 'compliant' },
  { id: 'P12', article: 'S.32', title: 'Data Breach Notification',    desc: 'Breach response SLA: notify PDPO within 72 hours, affected individuals within 30 days.', status: 'compliant' },
  { id: 'P13', article: 'S.36', title: 'Data Protection Officer',     desc: 'DPO appointed at Bank of Uganda. Contact: dpo@bou.go.ug. Registered with PDPO.', status: 'compliant' },
  { id: 'P14', article: 'S.40', title: 'Privacy Impact Assessment',   desc: 'PIA completed January 2026. Next review due January 2027.', status: 'due'       },
]

// â”€â”€â”€ Security config data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ENCRYPTION_STATUS = [
  { layer: 'Database (PostgreSQL)',     algo: 'AES-256-GCM',    status: 'active', detail: 'Tablespace encryption via pgcrypto + HSM-backed keys' },
  { layer: 'File Storage (settlements)', algo: 'AES-256-GCM',  status: 'active', detail: 'Encrypted at write; keys rotated every 90 days' },
  { layer: 'Audit Logs',               algo: 'AES-256-GCM',    status: 'active', detail: 'Immutable append-only store; WORM policy enforced' },
  { layer: 'API Secrets / Keys',       algo: 'RSA-4096 (wrap)', status: 'active', detail: 'Keys wrapped with HSM master key; never stored plaintext' },
]

const TLS_CONFIG = [
  { item: 'Protocol',        value: 'TLS 1.3 (mandatory)',              ok: true  },
  { item: 'TLS 1.0 / 1.1',  value: 'Disabled',                         ok: true  },
  { item: 'TLS 1.2',        value: 'Allowed (legacy participants only)', ok: false },
  { item: 'Cipher Suite',   value: 'TLS_AES_256_GCM_SHA384',            ok: true  },
  { item: 'Certificate',    value: 'DigiCert â€” expires 2027-01-15',     ok: true  },
  { item: 'HSTS',           value: 'max-age=31536000; includeSubDomains', ok: true },
  { item: 'OCSP Stapling',  value: 'Enabled',                           ok: true  },
  { item: 'mTLS (participants)', value: 'Required for all API calls',   ok: true  },
]

const MFA_POLICY = [
  { role: 'Super Admin',             required: true,  method: 'TOTP + Hardware Key' },
  { role: 'Bank of Uganda Operator', required: true,  method: 'TOTP' },
  { role: 'Treasury Officer',        required: true,  method: 'TOTP' },
  { role: 'Compliance Officer',      required: true,  method: 'TOTP' },
  { role: 'Settlement Officer',      required: true,  method: 'TOTP' },
  { role: 'Agency Officer',          required: true,  method: 'SMS OTP' },
  { role: 'Support Officer',         required: true,  method: 'SMS OTP' },
  { role: 'Developer',               required: true,  method: 'TOTP' },
]

const SESSION_POLICY = {
  maxDuration: '8 hours',
  idleTimeout: '30 minutes',
  concurrentSessions: 1,
  reAuthOnSensitiveOps: true,
  logAllAccess: true,
  ipBinding: false,
}

export default function AdminPage() {
  const addToast = useAppStore((s) => s.addToast)
  const pushSecurityEvent = useAppStore((s) => s.pushSecurityEvent)
  const securityEvents = useAppStore((s) => s.securityEvents)
  const [rules, setRules] = useState<RoutingRule[]>(mockRoutingRules)
  const [txLimits, setTxLimits] = useState({ mtn: 5000000, airtel: 3000000, bank: 50000000000 })
  const [webhookModal, setWebhookModal] = useState(false)
  const [sessionCfg] = useState(SESSION_POLICY)

  function reorder(id: string, dir: 'up' | 'down') {
    setRules((prev) => {
      const arr = [...prev]
      const idx = arr.findIndex((r) => r.id === id)
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= arr.length) return arr
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      return arr.map((r, i) => ({ ...r, priority: i + 1 }))
    })
    addToast('Routing priority updated', 'success')
    pushSecurityEvent('CONFIG_CHANGED', 'Routing rule priority reordered', 'ROUTING_RULES')
  }

  function save() {
    addToast('Configuration saved successfully', 'success')
    pushSecurityEvent('CONFIG_CHANGED', 'Platform configuration saved')
  }

  const allLogs = [
    ...mockAuditLog.map((l) => ({ ...l, timestamp: new Date(l.timestamp).getTime() })),
    ...securityEvents.map((e) => ({
      id: e.id, actor: e.actor, role: e.role, action: e.type,
      resource: e.resource ?? '', timestamp: e.timestamp, ip: e.ip,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  const TABS = ['roles', 'fees', 'limits', 'routing', 'settlement', 'agencies', 'notifications', 'webhooks', 'approvals', 'security', 'privacy']
  const TAB_LABELS: Record<string, string> = {
    roles: 'User Roles', fees: 'Fees', limits: 'Tx Limits', routing: 'Routing Rules',
    settlement: 'Settlement Cycles', agencies: 'Agency Accounts', notifications: 'Notifications',
    webhooks: 'Webhooks', approvals: 'Approval Workflows', security: 'ðŸ” Security', privacy: 'ðŸ›¡ï¸ Privacy / PDPA',
  }

  return (
    <div>
      <PageHeader title="Admin & Configuration" subtitle="Platform settings, security, RBAC, and Uganda PDPA compliance" />

      <Tabs.Root defaultValue="roles">
        <Tabs.List className="flex gap-1 bg-surface p-1 rounded-lg mb-5 flex-wrap">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="px-3 py-1.5 text-sm rounded-md text-muted data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:font-semibold transition-all"
            >
              {TAB_LABELS[tab] ?? tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* â”€â”€â”€ Roles tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="roles">
          <div className="bg-card rounded-card shadow-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted uppercase">Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-3 py-3 text-center font-semibold text-muted uppercase w-24">{r.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PERMISSIONS.map((perm) => (
                  <tr key={perm} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{perm}</td>
                    {ROLES.map((role) => (
                      <td key={role} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={ROLE_PERMS[role]?.includes(perm)}
                          onChange={() => addToast('Permission updated (demo)', 'info')}
                          className="accent-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={save}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
              <Save size={14} /> Save Permissions
            </button>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Routing tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="routing">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  {['Priority', 'Channel', 'Participant', 'Fee', 'Status', 'Reorder'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-bold text-primary">#{rule.priority}</td>
                    <td className="px-4 py-2.5">{rule.channel}</td>
                    <td className="px-4 py-2.5">{rule.participant}</td>
                    <td className="px-4 py-2.5">{rule.feeType === 'flat' ? formatUGX(rule.fee) : `${rule.fee}%`}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={rule.status === 'active' ? 'success' : 'muted'}>{rule.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => reorder(rule.id, 'up')} className="p-1 hover:bg-surface rounded transition-colors text-muted hover:text-primary"><ChevronUp size={14} /></button>
                        <button onClick={() => reorder(rule.id, 'down')} className="p-1 hover:bg-surface rounded transition-colors text-muted hover:text-primary"><ChevronDown size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Fees tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="fees">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Fee Schedule</h3>
              <span className="text-xs text-muted">Per-channel convenience fees Â· maker-checker via <span className="font-medium">Fee Schedule Change</span> workflow</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  {['Channel', 'Fee Type', 'Value', 'Cap (UGX)', 'Borne By', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FEE_SCHEDULE.map((f) => (
                  <tr key={f.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium">{f.channel}</td>
                    <td className="px-4 py-2.5"><Badge variant={f.type === 'Flat' ? 'info' : 'muted'}>{f.type}</Badge></td>
                    <td className="px-4 py-2.5 font-mono text-primary">{f.type === 'Flat' ? formatUGX(f.value) : `${f.value}%`}</td>
                    <td className="px-4 py-2.5 text-muted">{f.cap ? formatUGX(f.cap) : 'â€”'}</td>
                    <td className="px-4 py-2.5 text-muted">{f.payer}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { addToast(`Fee for ${f.channel} submitted for approval`, 'success'); pushSecurityEvent('CONFIG_CHANGED', `Fee schedule edit: ${f.channel}`, 'FEE_SCHEDULE') }}
                        className="text-xs text-primary underline hover:text-primary-light">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Limits tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="limits">
          <div className="bg-card rounded-card shadow-card p-5 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Channel Transaction Limits (UGX)</h3>
            <div className="space-y-4">
              {[
                { key: 'mtn',    label: 'MTN Mobile Money â€” Max per transaction' },
                { key: 'airtel', label: 'Airtel Money â€” Max per transaction' },
                { key: 'bank',   label: 'Bank Transfer â€” Max per transaction' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted mb-1 block">{f.label}</label>
                  <input
                    type="number"
                    value={txLimits[f.key as keyof typeof txLimits]}
                    onChange={(e) => setTxLimits((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                  />
                </div>
              ))}
              <button onClick={save}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
                <Save size={14} /> Save Limits
              </button>
            </div>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Settlement tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="settlement">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  {['Participant', 'Frequency', 'Cutoff Time', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SETTLEMENT_CYCLES.map((sc) => (
                  <tr key={sc.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium">{sc.name}</td>
                    <td className="px-4 py-2.5">{sc.frequency}</td>
                    <td className="px-4 py-2.5 font-mono">{sc.cutoff}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => addToast(`Settlement cycle for ${sc.name} updated`, 'success')} className="text-xs text-primary underline hover:text-primary-light">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Agency accounts tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="agencies">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Government Agency Accounts</h3>
              <button onClick={() => addToast('Agency onboarding workflow started (demo)', 'info')}
                className="text-xs text-primary underline hover:text-primary-light">+ Add Agency</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  {['Agency', 'Settlement Bank', 'Account Ref', 'Finance Contact', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {AGENCY_ACCOUNTS.map((a) => (
                  <tr key={a.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium">{a.agency}</td>
                    <td className="px-4 py-2.5">{a.settlementBank}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{a.account}</td>
                    <td className="px-4 py-2.5 text-muted">{a.contact}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={a.status === 'active' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}>{a.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => addToast(`${a.agency} account updated`, 'success')} className="text-xs text-primary underline hover:text-primary-light">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Notifications tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="notifications">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>
                  {['Template', 'Channel', 'Active', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {NOTIFICATION_TEMPLATES.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium">{tmpl.name}</td>
                    <td className="px-4 py-2.5 text-muted">{tmpl.channel}</td>
                    <td className="px-4 py-2.5"><Badge variant={tmpl.active ? 'success' : 'muted'}>{tmpl.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => addToast(`${tmpl.name} template saved`, 'success')} className="text-xs text-primary underline hover:text-primary-light">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Webhooks tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="webhooks">
          <div className="bg-card rounded-card shadow-card p-5 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Webhook Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Default Webhook URL</label>
                <input defaultValue="https://treasury.go.ug/webhooks/govpay"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 font-mono" />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Retry Policy</label>
                <select defaultValue="3" className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none bg-white">
                  <option value="1">1 retry</option>
                  <option value="3">3 retries (recommended)</option>
                  <option value="5">5 retries</option>
                </select>
              </div>
              <button onClick={() => { setWebhookModal(true); save() }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
                <Save size={14} /> Save Webhook Config
              </button>
            </div>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Approval workflows tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="approvals">
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Maker-checker approval chains. Each action must be approved sequentially by every role in the chain before it executes.
            </p>
            {APPROVAL_WORKFLOWS.map((wf) => (
              <div key={wf.id} className="bg-card rounded-card shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{wf.name}</span>
                      <Badge variant={wf.enabled ? 'success' : 'muted'}>{wf.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </div>
                    <div className="text-xs text-muted mt-0.5">Trigger: {wf.threshold}</div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                    <input type="checkbox" defaultChecked={wf.enabled} className="accent-primary"
                      onChange={() => addToast(`${wf.name} workflow toggled (demo)`, 'info')} />
                    Active
                  </label>
                </div>
                <div className="flex items-center flex-wrap gap-1">
                  {wf.steps.map((step, idx) => (
                    <div key={step} className="flex items-center">
                      <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                        <span className="text-xs font-medium text-slate-700">{step}</span>
                      </div>
                      {idx < wf.steps.length - 1 && <ChevronUp size={14} className="text-muted rotate-90 mx-0.5" />}
                    </div>
                  ))}
                  <div className="flex items-center">
                    <ChevronUp size={14} className="text-muted rotate-90 mx-0.5" />
                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                      <CheckCircle2 size={13} className="text-green-600" />
                      <span className="text-xs font-medium text-green-700">Executed</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Security tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="security">
          <div className="space-y-5">
            {/* Encryption at rest */}
            <div className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Database size={15} className="text-primary" /> Data Encryption at Rest
              </h3>
              <p className="text-xs text-muted mb-4">All persistent data layers are encrypted using FIPS 140-2 validated algorithms.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      {['Data Layer', 'Algorithm', 'Status', 'Detail'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ENCRYPTION_STATUS.map((row) => (
                      <tr key={row.layer} className="hover:bg-primary-50">
                        <td className="px-3 py-2.5 font-medium">{row.layer}</td>
                        <td className="px-3 py-2.5 font-mono text-primary">{row.algo}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-0.5">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted">{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TLS / Encryption in transit */}
            <div className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Wifi size={15} className="text-primary" /> Encryption in Transit (TLS)
              </h3>
              <p className="text-xs text-muted mb-4">All API traffic, participant connections, and admin sessions are protected by TLS.</p>
              <div className="grid grid-cols-2 gap-2">
                {TLS_CONFIG.map((row) => (
                  <div key={row.item} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2.5 text-xs">
                    <span className="text-muted font-medium">{row.item}</span>
                    <span className={clsx('font-mono', row.ok ? 'text-green-700' : 'text-yellow-600')}>
                      {row.ok
                        ? <span className="flex items-center gap-1"><CheckCircle2 size={11} /> {row.value}</span>
                        : <span className="flex items-center gap-1"><AlertTriangle size={11} /> {row.value}</span>
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* MFA enforcement */}
            <div className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <KeyRound size={15} className="text-primary" /> MFA Enforcement Policy
              </h3>
              <p className="text-xs text-muted mb-4">Multi-factor authentication is mandatory for all platform roles.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      {['Role', 'MFA Required', 'Method', 'Action'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MFA_POLICY.map((row) => (
                      <tr key={row.role} className="hover:bg-primary-50">
                        <td className="px-3 py-2.5 font-medium">{row.role}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-0.5">
                            <CheckCircle2 size={11} /> Required
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted">{row.method}</td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => addToast('MFA policy saved (demo)', 'success')} className="text-xs text-primary underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session management */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={15} className="text-primary" /> Session Policy
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Max session duration', key: 'maxDuration' },
                    { label: 'Idle timeout',          key: 'idleTimeout' },
                    { label: 'Concurrent sessions',   key: 'concurrentSessions' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-muted mb-1 block">{label}</label>
                      <input
                        defaultValue={String(sessionCfg[key as keyof typeof sessionCfg])}
                        onChange={() => {}}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Re-auth on sensitive ops</span>
                    <input type="checkbox" defaultChecked={sessionCfg.reAuthOnSensitiveOps} className="accent-primary" onChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Log all route access</span>
                    <input type="checkbox" defaultChecked={sessionCfg.logAllAccess} className="accent-primary" onChange={() => {}} />
                  </div>
                  <button onClick={save}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors w-full justify-center">
                    <Save size={14} /> Save Session Policy
                  </button>
                </div>
              </div>

              {/* Live security event log */}
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <Eye size={15} className="text-primary" /> Security Audit Log
                </h3>
                <p className="text-xs text-muted mb-3">Real-time security events from this session + historical records.</p>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {allLogs.slice(0, 20).map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 py-1.5 border-b border-border last:border-0"
                    >
                      <div className={clsx(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        entry.action.includes('FAILED') || entry.action.includes('DENIED') ? 'bg-danger' :
                        entry.action.includes('MFA') || entry.action.includes('LOGIN') ? 'bg-green-500' : 'bg-primary/50'
                      )} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-800 truncate">{entry.action.replace(/_/g, ' ')}</div>
                        <div className="text-[10px] text-muted truncate">{entry.actor} Â· {String(entry.ip)}</div>
                      </div>
                      <div className="text-[10px] text-muted flex-shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* â”€â”€â”€ Privacy / PDPA tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Tabs.Content value="privacy">
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-5 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Uganda Data Protection and Privacy Act, 2019</h2>
                  <p className="text-white/70 text-sm mt-0.5">
                    Uganda GovPay Switch is designed to comply with the PDPA 2019 and Personal Data Protection Office (PDPO) guidelines.
                    Compliance status last reviewed: June 2026.
                  </p>
                  <div className="flex gap-3 mt-3 text-xs">
                    <span className="bg-white/10 border border-white/20 rounded-md px-3 py-1">
                      {PDPA_ITEMS.filter((i) => i.status === 'compliant').length} / {PDPA_ITEMS.length} Compliant
                    </span>
                    <span className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-200 rounded-md px-3 py-1">
                      {PDPA_ITEMS.filter((i) => i.status === 'review').length} Under Review
                    </span>
                    <span className="bg-orange-400/20 border border-orange-400/30 text-orange-200 rounded-md px-3 py-1">
                      {PDPA_ITEMS.filter((i) => i.status === 'due').length} Action Required
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance checklist */}
            <div className="grid grid-cols-1 gap-3">
              {PDPA_ITEMS.map((item) => (
                <div key={item.id} className={clsx(
                  'bg-card rounded-xl border shadow-sm p-4 flex gap-4 items-start transition-all hover:shadow-md',
                  item.status === 'compliant' ? 'border-green-200' :
                  item.status === 'review'    ? 'border-yellow-300' : 'border-orange-300'
                )}>
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.status === 'compliant' ? 'bg-green-50' :
                    item.status === 'review'    ? 'bg-yellow-50' : 'bg-orange-50'
                  )}>
                    {item.status === 'compliant'
                      ? <CheckCircle2 size={18} className="text-green-600" />
                      : item.status === 'review'
                      ? <RefreshCw size={18} className="text-yellow-600" />
                      : <AlertTriangle size={18} className="text-orange-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-muted">{item.article}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium border ml-auto',
                        item.status === 'compliant' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.status === 'review'    ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-orange-50 text-orange-700 border-orange-300'
                      )}>
                        {item.status === 'compliant' ? 'Compliant' : item.status === 'review' ? 'Under Review' : 'Action Required'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DPO contact block */}
            <div className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <UserCheck size={15} className="text-primary" /> Data Protection Officer (DPO)
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                {[
                  { label: 'Appointed DPO',    value: 'Bank of Uganda â€” Legal & Compliance Division' },
                  { label: 'Contact',           value: 'dpo@bou.go.ug' },
                  { label: 'PDPO Registration', value: 'DPO-2024-BOU-0018' },
                  { label: 'Next PIA Review',   value: 'January 2027' },
                  { label: 'Supervising Body',  value: 'Personal Data Protection Office (PDPO), Uganda' },
                  { label: 'Framework',         value: 'PDPA 2019 + BoU Cybersecurity Framework 2020' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg p-3">
                    <div className="text-muted mb-0.5">{label}</div>
                    <div className="font-medium text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breach notification procedure */}
            <div className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={15} className="text-danger" /> Data Breach Notification Procedure
              </h3>
              <div className="flex gap-2 text-xs">
                {[
                  { step: '1', label: 'Detection', detail: 'SIEM alert or manual report', color: 'bg-primary text-white' },
                  { step: '2', label: 'Assessment', detail: 'Classify severity & scope', color: 'bg-primary text-white' },
                  { step: '3', label: 'Contain', detail: 'Isolate affected systems', color: 'bg-danger text-white' },
                  { step: '4', label: 'Notify PDPO', detail: 'Within 72 hours (S.32)', color: 'bg-warning text-primary' },
                  { step: '5', label: 'Notify Subjects', detail: 'Within 30 days (S.32)', color: 'bg-warning text-primary' },
                  { step: '6', label: 'Remediate', detail: 'Root cause analysis + fix', color: 'bg-green-600 text-white' },
                  { step: '7', label: 'Report', detail: 'Submit full incident report', color: 'bg-green-600 text-white' },
                ].map(({ step, label, detail, color }, idx, arr) => (
                  <div key={step} className="flex items-center">
                    <div className="text-center">
                      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs', color)}>{step}</div>
                      <div className="mt-1 font-semibold text-slate-800">{label}</div>
                      <div className="text-muted">{detail}</div>
                    </div>
                    {idx < arr.length - 1 && <div className="w-6 h-px bg-border mx-1 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex gap-3">
              <button onClick={() => addToast('Privacy Notice downloaded (demo)', 'success')}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted hover:bg-surface transition-colors">
                <FileText size={14} /> Download Privacy Notice
              </button>
              <button onClick={() => addToast('PDPA Compliance Report generated (demo)', 'success')}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted hover:bg-surface transition-colors">
                <Globe size={14} /> Export PDPA Compliance Report
              </button>
              <button onClick={() => addToast('PIA initiated (demo)', 'info')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors ml-auto">
                <RefreshCw size={14} /> Initiate PIA Review
              </button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Modal open={webhookModal} onClose={() => setWebhookModal(false)} title="Webhook Configuration">
        <p className="text-sm text-muted">Webhook configuration saved successfully.</p>
      </Modal>
    </div>
  )
}
