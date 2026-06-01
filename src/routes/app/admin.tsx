import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useAppStore } from '../../store/appStore'
import { mockRoutingRules } from '../../data/mockRouting'
import { formatUGX } from '../../utils/format'
import { ChevronUp, ChevronDown, Save } from 'lucide-react'
import type { RoutingRule, Role } from '../../types'

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

export default function AdminPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [rules, setRules] = useState<RoutingRule[]>(mockRoutingRules)
  const [txLimits, setTxLimits] = useState({ mtn: 5000000, airtel: 3000000, bank: 50000000000 })
  const [webhookModal, setWebhookModal] = useState(false)

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
  }

  function save() {
    addToast('Configuration saved successfully', 'success')
  }

  const TABS = ['roles', 'routing', 'limits', 'settlement', 'notifications', 'webhooks']

  return (
    <div>
      <PageHeader title="Admin & Configuration" subtitle="Platform fees, limits, routing, settlement cycles, roles, and notifications" />

      <Tabs.Root defaultValue="roles">
        <Tabs.List className="flex gap-1 bg-surface p-1 rounded-lg mb-5 flex-wrap">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="px-3 py-1.5 text-sm rounded-md text-muted capitalize data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:font-semibold transition-all"
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Role permissions matrix */}
        <Tabs.Content value="roles">
          <div className="bg-card rounded-card shadow-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted uppercase">Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-3 py-3 text-center font-semibold text-muted uppercase w-24">
                      {r.split(' ')[0]}
                    </th>
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

        {/* Routing priority reorder */}
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
                    <td className="px-4 py-2.5">
                      {rule.feeType === 'flat' ? formatUGX(rule.fee) : `${rule.fee}%`}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={rule.status === 'active' ? 'success' : 'muted'}>{rule.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => reorder(rule.id, 'up')}
                          className="p-1 hover:bg-surface rounded transition-colors text-muted hover:text-primary">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={() => reorder(rule.id, 'down')}
                          className="p-1 hover:bg-surface rounded transition-colors text-muted hover:text-primary">
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Transaction limits */}
        <Tabs.Content value="limits">
          <div className="bg-card rounded-card shadow-card p-5 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Channel Transaction Limits (UGX)</h3>
            <div className="space-y-4">
              {[
                { key: 'mtn',    label: 'MTN Mobile Money — Max per transaction' },
                { key: 'airtel', label: 'Airtel Money — Max per transaction' },
                { key: 'bank',   label: 'Bank Transfer — Max per transaction' },
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

        {/* Settlement cycles */}
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
                      <button
                        onClick={() => addToast(`Settlement cycle for ${sc.name} updated`, 'success')}
                        className="text-xs text-primary underline hover:text-primary-light">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Notification templates */}
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
                    <td className="px-4 py-2.5">
                      <Badge variant={tmpl.active ? 'success' : 'muted'}>
                        {tmpl.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => addToast(`${tmpl.name} template saved`, 'success')}
                        className="text-xs text-primary underline hover:text-primary-light">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Webhooks */}
        <Tabs.Content value="webhooks">
          <div className="bg-card rounded-card shadow-card p-5 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Webhook Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Default Webhook URL</label>
                <input
                  defaultValue="https://treasury.go.ug/webhooks/govpay"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Retry Policy</label>
                <select
                  defaultValue="3"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none bg-white"
                >
                  <option value="1">1 retry</option>
                  <option value="3">3 retries (recommended)</option>
                  <option value="5">5 retries</option>
                </select>
              </div>
              <button
                onClick={() => { setWebhookModal(true); save() }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
                <Save size={14} /> Save Webhook Config
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
