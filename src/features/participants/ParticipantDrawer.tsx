import { useState } from 'react'
import { motion } from 'framer-motion'
import { Drawer } from '../../components/ui/Drawer'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { LineChart } from '../../components/charts/LineChart'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { participantsApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatNumber } from '../../utils/format'
import {
  ShieldOff, ShieldCheck, Key, Copy, RefreshCw,
  Banknote, Settings, Eye, EyeOff, CheckCircle2,
  Clock, AlertTriangle,
} from 'lucide-react'
import type { Participant } from '../../types'
import clsx from 'clsx'

interface Props {
  participant: Participant | null
  onClose: () => void
}

// ─── Deterministic settlement rules per participant ───────────────────────────
function settlementRules(p: Participant) {
  const isMNO  = p.type === 'Mobile Money Operator'
  const isGov  = p.type === 'Government Agency'
  return {
    frequency:    isGov ? 'Daily' : 'Daily',
    cutoffTime:   isMNO ? '21:00 EAT' : p.type === 'Bank' ? '22:00 EAT' : '20:00 EAT',
    nettingType:  'Multilateral Net Settlement',
    settlementBank: 'Bank of Uganda',
    minSettlement: formatUGX(isMNO ? 100_000 : 1_000_000),
    gracePeriod:  '30 minutes',
    reportFormat: 'ISO 20022 XML + CSV',
    nextSettlement: 'Today at ' + (isMNO ? '21:00' : '22:00') + ' EAT',
  }
}

// ─── Deterministic transaction limits per participant ─────────────────────────
function txnLimits(p: Participant) {
  const isMNO   = p.type === 'Mobile Money Operator'
  const isBank  = p.type === 'Bank'
  return {
    perTxnMax:    isMNO ? formatUGX(5_000_000) : isBank ? formatUGX(50_000_000_000) : formatUGX(10_000_000),
    dailyMax:     isMNO ? formatUGX(15_000_000_000) : isBank ? formatUGX(500_000_000_000) : formatUGX(2_000_000_000),
    monthlyCap:   isMNO ? formatUGX(300_000_000_000) : isBank ? formatUGX(10_000_000_000_000) : formatUGX(40_000_000_000),
    velocityCheck: '40 transactions / payer / 2 hours',
    highValueThreshold: formatUGX(40_000_000),
    blockedAmounts: 'None',
    lastModified:  '2026-03-15 by Super Admin',
  }
}

// ─── Mock API keys ────────────────────────────────────────────────────────────
function mockKey(prefix: string, id: string, visible: boolean) {
  const secret = 'sk_' + Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
  return visible ? `gps_${prefix}_${secret.slice(0, 8)}_${id.toLowerCase().slice(0, 4)}xxxxxxxxxxxxxxxx` : `gps_${prefix}_${'•'.repeat(36)}`
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const DRAWER_TABS = [
  { id: 'profile',    label: 'Profile' },
  { id: 'settlement', label: 'Settlement Rules' },
  { id: 'limits',     label: 'Tx Limits' },
  { id: 'apikeys',    label: 'API Keys' },
]

export function ParticipantDrawer({ participant, onClose }: Props) {
  const addToast = useAppStore((s) => s.addToast)
  const pushSecurityEvent = useAppStore((s) => s.pushSecurityEvent)
  const qc = useQueryClient()

  const [tab, setTab]           = useState('profile')
  const [showLive, setShowLive] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [copied, setCopied]     = useState<string | null>(null)

  const { mutate: suspend, isPending: suspending } = useMutation({
    mutationFn: (id: string) => participantsApi.suspend(id),
    onSuccess: () => {
      addToast(`${participant?.name} suspended`, 'warning')
      pushSecurityEvent('PARTICIPANT_SUSPENDED', `Participant ${participant?.name} suspended`, participant?.id)
      qc.invalidateQueries({ queryKey: ['participants'] })
      onClose()
    },
  })

  const { mutate: activate, isPending: activating } = useMutation({
    mutationFn: (id: string) => participantsApi.activate(id),
    onSuccess: () => {
      addToast(`${participant?.name} activated`, 'success')
      pushSecurityEvent('PARTICIPANT_ACTIVATED', `Participant ${participant?.name} activated`, participant?.id)
      qc.invalidateQueries({ queryKey: ['participants'] })
      onClose()
    },
  })

  if (!participant) return null

  const healthData = participant.apiHealthHistory.map((v, i) => ({ day: `D-${6 - i}`, latency: v }))
  const rules      = settlementRules(participant)
  const limits     = txnLimits(participant)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Drawer
      open
      onClose={() => { setTab('profile'); onClose() }}
      title={participant.name}
      subtitle={`${participant.type} · ${participant.id}`}
    >
      <div className="space-y-4">
        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={statusVariant(participant.status)}>{participant.status}</Badge>
          <Badge variant={statusVariant(participant.apiHealth)}>API: {participant.apiHealth}</Badge>
          <Badge variant={statusVariant(participant.riskRating)}>Risk: {participant.riskRating}</Badge>
          <Badge variant={statusVariant(participant.slaStatus)}>SLA: {participant.slaStatus}</Badge>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 bg-surface p-1 rounded-xl border border-border">
          {DRAWER_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                'flex-1 py-1.5 text-xs rounded-lg font-medium transition-all',
                tab === id ? 'bg-card text-slate-800 shadow-sm' : 'text-muted hover:text-slate-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoBox label="Daily Volume"    value={formatUGX(participant.dailyVolume)} />
              <InfoBox label="Daily Count"     value={formatNumber(participant.dailyCount)} />
              <InfoBox label="API Latency"     value={`${participant.apiLatency}ms`} />
              <InfoBox label="Joined"          value={participant.joinedDate} />
            </div>

            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-xs text-muted mb-0.5">Settlement Account</div>
              <div className="text-xs font-mono font-semibold text-primary">{participant.settlementAccount}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                API Latency — Last 7 Days
              </div>
              <LineChart
                data={healthData}
                xKey="day"
                lines={[{ key: 'latency', color: '#1B3A6B', name: 'Latency (ms)' }]}
                height={130}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {participant.status === 'active' || participant.status === 'onboarding'
                ? (
                  <button
                    onClick={() => suspend(participant.id)}
                    disabled={suspending}
                    className="flex items-center gap-2 w-full py-2.5 border border-danger text-danger rounded-xl text-sm font-semibold hover:bg-danger-light transition-colors justify-center disabled:opacity-60"
                  >
                    <ShieldOff size={14} /> {suspending ? 'Suspending…' : 'Suspend Participant'}
                  </button>
                ) : (
                  <button
                    onClick={() => activate(participant.id)}
                    disabled={activating}
                    className="flex items-center gap-2 w-full py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors justify-center disabled:opacity-60"
                  >
                    <ShieldCheck size={14} /> {activating ? 'Activating…' : 'Activate Participant'}
                  </button>
                )
              }
            </div>
          </motion.div>
        )}

        {/* ── Settlement Rules tab ── */}
        {tab === 'settlement' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={14} className="text-primary" />
              <span className="text-sm font-semibold text-slate-800">Settlement Configuration</span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Settlement Frequency', value: rules.frequency,     icon: <Clock size={12} /> },
                { label: 'Cutoff Time',          value: rules.cutoffTime,    icon: <Clock size={12} /> },
                { label: 'Netting Type',         value: rules.nettingType,   icon: null },
                { label: 'Settlement Bank',      value: rules.settlementBank, icon: null },
                { label: 'Minimum Settlement',   value: rules.minSettlement, icon: null },
                { label: 'Grace Period',         value: rules.gracePeriod,   icon: null },
                { label: 'Report Format',        value: rules.reportFormat,  icon: null },
                { label: 'Next Settlement',      value: rules.nextSettlement, icon: <CheckCircle2 size={12} className="text-green-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-0 gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted flex-shrink-0">{icon}{label}</div>
                  <div className="text-xs font-semibold text-slate-800 text-right">{value}</div>
                </div>
              ))}
            </div>

            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-xs text-muted mb-0.5">Settlement Account at BOU</div>
              <div className="text-xs font-mono font-bold text-primary">{participant.settlementAccount}</div>
            </div>

            <button
              onClick={() => addToast('Settlement rules updated (demo)', 'success')}
              className="w-full py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={13} /> Edit Settlement Rules
            </button>
          </motion.div>
        )}

        {/* ── Transaction Limits tab ── */}
        {tab === 'limits' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={14} className="text-primary" />
              <span className="text-sm font-semibold text-slate-800">Transaction Limits</span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Max per Transaction', value: limits.perTxnMax,          warn: false },
                { label: 'Daily Limit',         value: limits.dailyMax,           warn: false },
                { label: 'Monthly Cap',         value: limits.monthlyCap,         warn: false },
                { label: 'High-Value Threshold', value: limits.highValueThreshold, warn: true },
                { label: 'Velocity Check',       value: limits.velocityCheck,     warn: true },
                { label: 'Blocked Amounts',      value: limits.blockedAmounts,    warn: false },
                { label: 'Last Modified',        value: limits.lastModified,      warn: false },
              ].map(({ label, value, warn }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-0 gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted flex-shrink-0">
                    {warn && <AlertTriangle size={11} className="text-warning" />}
                    {label}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 text-right max-w-[55%]">{value}</div>
                </div>
              ))}
            </div>

            {/* Limit gauges for daily */}
            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-xs text-muted mb-2">Daily utilisation</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Used:</span>
                <span className="font-semibold text-primary">{formatUGX(participant.dailyVolume)}</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden mt-1.5">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (participant.dailyVolume / 15_000_000_000) * 100).toFixed(1)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <button
              onClick={() => addToast('Transaction limits saved (demo)', 'success')}
              className="w-full py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={13} /> Edit Limits
            </button>
          </motion.div>
        )}

        {/* ── API Keys tab ── */}
        {tab === 'apikeys' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Key size={14} className="text-primary" />
              <span className="text-sm font-semibold text-slate-800">API Key Management</span>
            </div>

            {/* Live key */}
            <KeyCard
              label="Live API Key"
              value={mockKey('live', participant.id, showLive)}
              visible={showLive}
              onToggle={() => setShowLive((v) => !v)}
              onCopy={() => copy(mockKey('live', participant.id, true), 'live')}
              copied={copied === 'live'}
              badgeColor="bg-green-100 text-green-700 border-green-200"
              badge="Live"
            />

            {/* Sandbox key */}
            <KeyCard
              label="Sandbox API Key"
              value={mockKey('test', participant.id, showTest)}
              visible={showTest}
              onToggle={() => setShowTest((v) => !v)}
              onCopy={() => copy(mockKey('test', participant.id, true), 'test')}
              copied={copied === 'test'}
              badgeColor="bg-blue-100 text-blue-700 border-blue-200"
              badge="Sandbox"
            />

            {/* Webhook secret */}
            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Webhook Signing Secret</div>
              <div className="font-mono text-xs text-slate-700">
                whsec_{'•'.repeat(32)}
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-surface rounded-xl p-3 border border-border">
              <div className="text-xs font-semibold text-slate-800 mb-2">Key Permissions</div>
              <div className="flex flex-wrap gap-1.5">
                {['read:transactions', 'write:payments', 'read:settlement', 'read:reconciliation'].map((perm) => (
                  <span key={perm} className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5 font-mono">
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addToast('New API key generated — previous key invalidated', 'warning')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-warning text-warning rounded-xl text-sm font-semibold hover:bg-warning/5 transition-colors"
              >
                <RefreshCw size={13} /> Regenerate
              </button>
              <button
                onClick={() => addToast('API key revoked — participant access suspended', 'error')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-danger text-danger rounded-xl text-sm font-semibold hover:bg-danger-light transition-colors"
              >
                <ShieldOff size={13} /> Revoke
              </button>
            </div>

            <p className="text-[10px] text-muted text-center">
              Keys are masked for security. Reveal to copy. Regenerating invalidates the current key immediately.
            </p>
          </motion.div>
        )}
      </div>
    </Drawer>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl p-3 border border-border">
      <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  )
}

function KeyCard({
  label, value, visible, onToggle, onCopy, copied, badgeColor, badge,
}: {
  label: string; value: string; visible: boolean
  onToggle: () => void; onCopy: () => void
  copied: boolean; badgeColor: string; badge: string
}) {
  return (
    <div className="bg-surface rounded-xl p-3 border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', badgeColor)}>{badge}</span>
      </div>
      <div className="font-mono text-[11px] text-slate-700 break-all mb-2 bg-white/60 rounded-lg px-2 py-1.5 border border-border/50">
        {value}
      </div>
      <div className="flex gap-2">
        <button onClick={onToggle} className="flex items-center gap-1 text-[11px] text-muted hover:text-slate-800 transition-colors">
          {visible ? <EyeOff size={12} /> : <Eye size={12} />}
          {visible ? 'Hide' : 'Reveal'}
        </button>
        <button onClick={onCopy} className="flex items-center gap-1 text-[11px] text-muted hover:text-slate-800 transition-colors ml-auto">
          {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
