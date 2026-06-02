import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Modal } from '../../../components/ui/Modal'
import { ParticipantDrawer } from '../../../features/participants/ParticipantDrawer'
import { participantsApi } from '../../../services/mockApi'
import { formatUGX } from '../../../utils/format'
import { useAppStore } from '../../../store/appStore'
import {
  Wifi, WifiOff, Users, Activity,
  Building2, Landmark, CreditCard, Smartphone,
  Search, Filter, ChevronRight, AlertTriangle,
  CheckCircle2, ChevronLeft, ChevronRight as ChevronRightIcon,
  Globe, Lock, Banknote, FileText, UserPlus,
} from 'lucide-react'
import type { Participant, ParticipantType } from '../../../types'
import clsx from 'clsx'

// â”€â”€â”€ Type metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TYPE_META: Record<ParticipantType | 'All', { icon: React.ElementType; color: string; bg: string }> = {
  'All':                    { icon: Users,      color: 'text-slate-700',  bg: 'bg-slate-100 border-slate-200' },
  'Bank':                   { icon: Building2,  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  'Mobile Money Operator':  { icon: Smartphone, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  'Government Agency':      { icon: Landmark,   color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  'Payment Aggregator':     { icon: CreditCard, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'Treasury':               { icon: Landmark,   color: 'text-primary',    bg: 'bg-primary/10 border-primary/20' },
}

// â”€â”€â”€ Status helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_DOT: Record<string, string> = {
  active:     'bg-green-500',
  suspended:  'bg-danger animate-pulse',
  onboarding: 'bg-yellow-400 animate-pulse',
}
const STATUS_BADGE: Record<string, string> = {
  active:     'bg-green-100 text-green-700 border-green-200',
  suspended:  'bg-red-100 text-red-700 border-red-200',
  onboarding: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}
const HEALTH_COLOR: Record<string, string> = {
  healthy:  'text-green-600',
  degraded: 'text-yellow-600',
  down:     'text-danger',
}
const SLA_BADGE: Record<string, string> = {
  compliant: 'bg-green-100 text-green-700 border-green-200',
  warning:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  breach:    'bg-red-100 text-red-700 border-red-200',
}
const RISK_BADGE: Record<string, string> = {
  low:    'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high:   'bg-red-100 text-red-700 border-red-200',
}

// â”€â”€â”€ KPI summary strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KpiStrip({ data }: { data: Participant[] }) {
  const active     = data.filter((p) => p.status === 'active').length
  const suspended  = data.filter((p) => p.status === 'suspended').length
  const onboarding = data.filter((p) => p.status === 'onboarding').length
  const breach     = data.filter((p) => p.slaStatus === 'breach').length
  const degraded   = data.filter((p) => p.apiHealth !== 'healthy').length

  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {[
        { label: 'Active',      value: active,     color: 'border-green-200 bg-green-50',  dot: 'bg-green-500',            text: 'text-green-700' },
        { label: 'Suspended',   value: suspended,  color: 'border-red-200 bg-red-50',      dot: 'bg-danger',               text: 'text-danger' },
        { label: 'Onboarding',  value: onboarding, color: 'border-yellow-200 bg-yellow-50', dot: 'bg-yellow-400',          text: 'text-yellow-700' },
        { label: 'SLA Breach',  value: breach,     color: 'border-red-200 bg-red-50',      dot: 'bg-danger animate-pulse', text: 'text-danger' },
        { label: 'API Issues',  value: degraded,   color: 'border-orange-200 bg-orange-50', dot: 'bg-orange-400',          text: 'text-orange-700' },
      ].map(({ label, value, color, dot, text }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx('rounded-xl border p-4 flex items-center gap-3', color)}
        >
          <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', dot)} />
          <div>
            <div className={clsx('text-2xl font-black', text)}>{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// â”€â”€â”€ Participant row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ParticipantRow({ p, onClick }: { p: Participant; onClick: () => void }) {
  const tm = TYPE_META[p.type] ?? TYPE_META['Government Agency']

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={clsx(
        'border-b border-border cursor-pointer transition-colors group',
        p.status === 'suspended' ? 'bg-red-50/30 hover:bg-red-50' :
        p.status === 'onboarding' ? 'bg-yellow-50/20 hover:bg-yellow-50' :
        'hover:bg-primary-50',
      )}
    >
      {/* Name + type */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0', tm.bg)}>
            <tm.icon size={14} className={tm.color} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{p.name}</div>
            <div className="text-[10px] text-muted">{p.type}</div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[p.status] ?? 'bg-muted')} />
          <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border', STATUS_BADGE[p.status] ?? 'bg-slate-100 text-muted border-slate-200')}>
            {p.status}
          </span>
        </div>
      </td>

      {/* API Health */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {p.apiHealth === 'down'
            ? <WifiOff size={13} className="text-danger" />
            : <Wifi size={13} className={HEALTH_COLOR[p.apiHealth]} />
          }
          <span className={clsx('text-xs font-semibold', HEALTH_COLOR[p.apiHealth])}>{p.apiHealth}</span>
          {p.apiHealth !== 'down' && (
            <span className="text-[10px] text-muted font-mono">{p.apiLatency}ms</span>
          )}
        </div>
        {/* Latency bar */}
        {p.apiHealth !== 'down' && (
          <div className="h-1 w-16 bg-surface rounded-full overflow-hidden mt-1 border border-border">
            <div
              className={clsx('h-full rounded-full', p.apiLatency < 150 ? 'bg-green-500' : p.apiLatency < 300 ? 'bg-yellow-400' : 'bg-danger')}
              style={{ width: `${Math.min(100, (p.apiLatency / 400) * 100)}%` }}
            />
          </div>
        )}
      </td>

      {/* Settlement account */}
      <td className="px-4 py-3">
        <span className="font-mono text-[11px] text-muted">{p.settlementAccount}</span>
      </td>

      {/* Daily volume */}
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-primary">
          {p.dailyVolume > 0 ? formatUGX(p.dailyVolume) : 'â€”'}
        </span>
        {p.dailyCount > 0 && (
          <div className="text-[10px] text-muted">{p.dailyCount.toLocaleString()} txns</div>
        )}
      </td>

      {/* SLA */}
      <td className="px-4 py-3">
        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border', SLA_BADGE[p.slaStatus] ?? 'bg-slate-100 text-muted border-slate-200')}>
          {p.slaStatus}
        </span>
      </td>

      {/* Risk */}
      <td className="px-4 py-3">
        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border', RISK_BADGE[p.riskRating] ?? 'bg-slate-100 text-muted border-slate-200')}>
          {p.riskRating}
        </span>
      </td>

      {/* Chevron */}
      <td className="px-4 py-3">
        <ChevronRight size={14} className="text-muted group-hover:text-primary transition-colors" />
      </td>
    </motion.tr>
  )
}

// â”€â”€â”€ Onboarding wizard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ONBOARD_STEPS = [
  { label: 'Basic Info',    icon: UserPlus,  desc: 'Name, type, contact' },
  { label: 'API Config',    icon: Globe,     desc: 'Endpoints & keys' },
  { label: 'Settlement',    icon: Banknote,  desc: 'Account & schedule' },
  { label: 'Review',        icon: FileText,  desc: 'Confirm & submit' },
]

const PARTICIPANT_TYPES: ParticipantType[] = [
  'Bank', 'Mobile Money Operator', 'Government Agency', 'Payment Aggregator', 'Treasury',
]
const BANKS_LIST = ['Stanbic Bank Uganda', 'Centenary Bank', 'DFCU Bank', 'Equity Bank', 'Absa Uganda']
const NETTING_TYPES = ['Multilateral Net Settlement', 'Bilateral Net Settlement', 'Gross Settlement (RTGS)']

interface OnboardForm {
  name: string
  shortName: string
  type: ParticipantType
  email: string
  phone: string
  address: string
  apiEndpoint: string
  healthCheckUrl: string
  webhookUrl: string
  apiVersion: string
  settlementBank: string
  settlementAccount: string
  nettingType: string
  cutoffTime: string
  minSettlement: string
}

const EMPTY_FORM: OnboardForm = {
  name: '', shortName: '', type: 'Bank', email: '', phone: '', address: '',
  apiEndpoint: '', healthCheckUrl: '', webhookUrl: '', apiVersion: 'v1',
  settlementBank: BANKS_LIST[0], settlementAccount: '', nettingType: NETTING_TYPES[0],
  cutoffTime: '21:00', minSettlement: '1000000',
}

function OnboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addToast          = useAppStore((s) => s.addToast)
  const pushSecurityEvent = useAppStore((s) => s.pushSecurityEvent)

  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState<OnboardForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [errors, setErrors]   = useState<Partial<Record<keyof OnboardForm, string>>>({})

  function update(field: keyof OnboardForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof OnboardForm, string>> = {}
    if (s === 0) {
      if (!form.name.trim())      errs.name      = 'Required'
      if (!form.shortName.trim()) errs.shortName = 'Required'
      if (!form.email.trim())     errs.email     = 'Required'
    }
    if (s === 1) {
      if (!form.apiEndpoint.trim()) errs.apiEndpoint = 'Required'
    }
    if (s === 2) {
      if (!form.settlementAccount.trim()) errs.settlementAccount = 'Required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3))
  }

  async function submit() {
    setSubmitting(true)
    await new Promise<void>((r) => setTimeout(r, 1400))
    setSubmitting(false)
    setSubmitted(true)
    addToast(`${form.name} onboarded â€” status: onboarding`, 'success')
    pushSecurityEvent('CONFIG_CHANGED', `New participant onboarded: ${form.name}`, form.shortName)
  }

  function handleClose() {
    setStep(0); setForm(EMPTY_FORM); setErrors({})
    setSubmitted(false); setSubmitting(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={submitted ? 'Participant Onboarded' : `Onboard New Participant â€” Step ${step + 1} of 4`}
      footer={
        submitted ? (
          <button onClick={handleClose}
            className="ml-auto px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
            Done
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm text-muted hover:text-slate-800 transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button onClick={handleClose}
              className="px-4 py-2 border border-border rounded-xl text-sm text-muted hover:text-slate-800 transition-colors">
              Cancel
            </button>
            {step < 3 ? (
              <button onClick={next}
                className="ml-auto flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                Next <ChevronRightIcon size={14} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
                {submitting
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Submittingâ€¦</>
                  : <><CheckCircle2 size={14} />Submit Onboarding</>
                }
              </button>
            )}
          </div>
        )
      }
    >
      {submitted ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">{form.name}</h3>
          <p className="text-sm text-muted mb-4">Successfully onboarded as <strong>{form.type}</strong></p>
          <div className="grid grid-cols-2 gap-2 text-xs text-left max-w-sm mx-auto">
            {[
              { label: 'Status',      value: 'Onboarding' },
              { label: 'Type',        value: form.type },
              { label: 'API Version', value: form.apiVersion },
              { label: 'Cutoff',      value: form.cutoffTime + ' EAT' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-lg p-2.5 border border-border">
                <div className="text-muted">{label}</div>
                <div className="font-semibold text-slate-800 mt-0.5">{value}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">
            API integration testing will begin automatically. Status will update to <strong>Active</strong> once certification is complete.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Step progress */}
          <div className="flex items-center gap-0">
            {ONBOARD_STEPS.map(({ label, icon: Icon }, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className={clsx(
                  'flex flex-col items-center',
                  i < step ? 'opacity-100' : i === step ? 'opacity-100' : 'opacity-40',
                )}>
                  <div className={clsx(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                    i < step  ? 'bg-green-500 border-green-500' :
                    i === step ? 'bg-primary border-primary shadow-lg shadow-primary/30' :
                    'bg-surface border-border',
                  )}>
                    {i < step
                      ? <CheckCircle2 size={14} className="text-white" />
                      : <Icon size={13} className={i === step ? 'text-white' : 'text-muted'} />
                    }
                  </div>
                  <span className={clsx('text-[10px] mt-1 font-medium whitespace-nowrap',
                    i === step ? 'text-primary' : i < step ? 'text-green-600' : 'text-muted'
                  )}>{label}</span>
                </div>
                {i < ONBOARD_STEPS.length - 1 && (
                  <div className={clsx('flex-1 h-0.5 mx-1 mb-4 rounded', i < step ? 'bg-green-400' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* â”€â”€ Step 0: Basic Info â”€â”€ */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Institution Name *" error={errors.name}>
                    <input value={form.name} onChange={(e) => update('name', e.target.value)}
                      placeholder="e.g. Equity Bank Uganda" className={inputCls(!!errors.name)} />
                  </Field>
                  <Field label="Short Name *" error={errors.shortName}>
                    <input value={form.shortName} onChange={(e) => update('shortName', e.target.value)}
                      placeholder="e.g. Equity" className={inputCls(!!errors.shortName)} />
                  </Field>
                </div>
                <Field label="Participant Type *">
                  <select value={form.type} onChange={(e) => update('type', e.target.value as ParticipantType)}
                    className={inputCls(false) + ' bg-white'}>
                    {PARTICIPANT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contact Email *" error={errors.email}>
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                      placeholder="tech@institution.ug" className={inputCls(!!errors.email)} />
                  </Field>
                  <Field label="Phone">
                    <input value={form.phone} onChange={(e) => update('phone', e.target.value)}
                      placeholder="+256 7XX XXX XXX" className={inputCls(false)} />
                  </Field>
                </div>
                <Field label="Registered Address">
                  <input value={form.address} onChange={(e) => update('address', e.target.value)}
                    placeholder="Kampala, Uganda" className={inputCls(false)} />
                </Field>
              </motion.div>
            )}

            {/* â”€â”€ Step 1: API Config â”€â”€ */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
                  <Lock size={12} className="flex-shrink-0 mt-0.5" />
                  All API connections require TLS 1.3 and HMAC-SHA256 request signing. mTLS client certificates will be issued after onboarding.
                </div>
                <Field label="API Base Endpoint URL *" error={errors.apiEndpoint}>
                  <input value={form.apiEndpoint} onChange={(e) => update('apiEndpoint', e.target.value)}
                    placeholder="https://api.institution.ug/govpay" className={inputCls(!!errors.apiEndpoint) + ' font-mono text-[12px]'} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Health Check URL">
                    <input value={form.healthCheckUrl} onChange={(e) => update('healthCheckUrl', e.target.value)}
                      placeholder="/health" className={inputCls(false) + ' font-mono text-[12px]'} />
                  </Field>
                  <Field label="API Version">
                    <select value={form.apiVersion} onChange={(e) => update('apiVersion', e.target.value)}
                      className={inputCls(false) + ' bg-white'}>
                      <option>v1</option><option>v2</option>
                    </select>
                  </Field>
                </div>
                <Field label="Webhook Callback URL">
                  <input value={form.webhookUrl} onChange={(e) => update('webhookUrl', e.target.value)}
                    placeholder="https://institution.ug/webhooks/govpay" className={inputCls(false) + ' font-mono text-[12px]'} />
                </Field>
                <div className="bg-surface border border-border rounded-xl p-3 text-xs text-muted">
                  <p className="font-semibold text-slate-700 mb-1">API credentials will be generated after submission:</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>Live API key (gps_live_â€¦)</li>
                    <li>Sandbox API key (gps_test_â€¦)</li>
                    <li>mTLS client certificate pair</li>
                    <li>Webhook signing secret</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* â”€â”€ Step 2: Settlement â”€â”€ */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <Field label="Settlement Bank at BOU">
                  <select value={form.settlementBank} onChange={(e) => update('settlementBank', e.target.value)}
                    className={inputCls(false) + ' bg-white'}>
                    {BANKS_LIST.map((b) => <option key={b}>{b}</option>)}
                    <option>Bank of Uganda (Direct)</option>
                  </select>
                </Field>
                <Field label="BOU Settlement Account Number *" error={errors.settlementAccount}>
                  <input value={form.settlementAccount} onChange={(e) => update('settlementAccount', e.target.value.replace(/\D/g, ''))}
                    placeholder="BOU-XXX-001" className={inputCls(!!errors.settlementAccount) + ' font-mono'} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Netting Type">
                    <select value={form.nettingType} onChange={(e) => update('nettingType', e.target.value)}
                      className={inputCls(false) + ' bg-white'}>
                      {NETTING_TYPES.map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </Field>
                  <Field label="Settlement Cutoff (EAT)">
                    <input type="time" value={form.cutoffTime} onChange={(e) => update('cutoffTime', e.target.value)}
                      className={inputCls(false)} />
                  </Field>
                </div>
                <Field label="Minimum Settlement Amount (UGX)">
                  <input type="number" value={form.minSettlement} onChange={(e) => update('minSettlement', e.target.value)}
                    className={inputCls(false)} />
                </Field>
              </motion.div>
            )}

            {/* â”€â”€ Step 3: Review â”€â”€ */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={12} /> Please review all details carefully before submitting.
                </div>

                {[
                  { section: 'Basic Information', rows: [
                    { label: 'Name',    value: form.name || 'â€”' },
                    { label: 'Short Name', value: form.shortName || 'â€”' },
                    { label: 'Type',    value: form.type },
                    { label: 'Email',   value: form.email || 'â€”' },
                    { label: 'Phone',   value: form.phone || 'â€”' },
                  ]},
                  { section: 'API Configuration', rows: [
                    { label: 'Endpoint',    value: form.apiEndpoint || 'â€”' },
                    { label: 'Health URL',  value: form.healthCheckUrl || '/health' },
                    { label: 'Webhook',     value: form.webhookUrl || 'â€”' },
                    { label: 'API Version', value: form.apiVersion },
                  ]},
                  { section: 'Settlement', rows: [
                    { label: 'Settlement Bank',    value: form.settlementBank },
                    { label: 'Account Number',     value: form.settlementAccount || 'â€”' },
                    { label: 'Netting Type',       value: form.nettingType },
                    { label: 'Cutoff Time',        value: form.cutoffTime + ' EAT' },
                    { label: 'Min Settlement',     value: form.minSettlement ? `UGX ${Number(form.minSettlement).toLocaleString()}` : 'â€”' },
                  ]},
                ].map(({ section, rows }) => (
                  <div key={section} className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="px-3 py-2 border-b border-border bg-white/50">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{section}</span>
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      {rows.map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-muted">{label}</span>
                          <span className="font-medium text-slate-800 max-w-[55%] text-right truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Modal>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      {children}
      {error && <p className="text-[11px] text-danger mt-0.5">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return clsx(
    'w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors',
    hasError ? 'border-danger focus:border-danger' : 'border-border focus:border-primary/50',
  )
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type FilterType = ParticipantType | 'All'

const TYPE_TABS: FilterType[] = [
  'All', 'Bank', 'Mobile Money Operator', 'Government Agency', 'Payment Aggregator', 'Treasury',
]

const TYPE_LABELS: Record<FilterType, string> = {
  'All':                   'All',
  'Bank':                  'Banks',
  'Mobile Money Operator': 'Mobile Money',
  'Government Agency':     'Gov Agencies',
  'Payment Aggregator':    'Aggregators',
  'Treasury':              'Treasury',
}

export default function ParticipantsPage() {
  const [selected, setSelected]         = useState<Participant | null>(null)
  const [onboardOpen, setOnboardOpen]   = useState(false)
  const [typeFilter, setTypeFilter]     = useState<FilterType>('All')
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'onboarding'>('all')

  const { data = [], isLoading } = useQuery({
    queryKey: ['participants'],
    queryFn: participantsApi.list,
  })

  const filtered = data.filter((p) => {
    const matchType   = typeFilter === 'All' || p.type === typeFilter
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  // Count per type tab
  function countType(t: FilterType) {
    if (t === 'All') return data.length
    return data.filter((p) => p.type === t).length
  }

  return (
    <div>
      <PageHeader
        title="Participant Management"
        subtitle="Banks, mobile money operators, government agencies, aggregators, and local governments"
        actions={
          <button
            onClick={() => setOnboardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            <Users size={14} /> Onboard Participant
          </button>
        }
      />

      <KpiStrip data={data} />

      {/* â”€â”€ Type filter tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border flex-wrap">
          {TYPE_TABS.map((t) => {
            const meta  = TYPE_META[t]
            const count = countType(t)
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  typeFilter === t
                    ? 'bg-card text-slate-800 shadow-sm'
                    : 'text-muted hover:text-slate-700',
                )}
              >
                <meta.icon size={12} className={typeFilter === t ? meta.color : ''} />
                {TYPE_LABELS[t]}
                <span className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  typeFilter === t ? meta.bg + ' ' + meta.color : 'bg-border text-muted',
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-border rounded-xl px-3 py-2 text-xs outline-none bg-white text-muted focus:border-primary/50"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="onboarding">Onboarding</option>
        </select>

        {/* Search */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 ml-auto">
          <Search size={13} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or IDâ€¦"
            className="text-xs outline-none bg-transparent w-40 placeholder:text-muted"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted hover:text-slate-800 text-[10px]">âœ•</button>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted">
          <Filter size={12} />
          {filtered.length} of {data.length}
        </div>
      </div>

      {/* â”€â”€ Participants table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted">Loading participantsâ€¦</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={32} className="text-muted/30 mx-auto mb-2" />
            <p className="text-sm text-muted">No participants match the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  {['Participant', 'Status', 'API Health', 'Settlement Account', 'Daily Volume', 'SLA', 'Risk', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <AnimatePresence mode="popLayout">
                <motion.tbody layout>
                  {filtered.map((p) => (
                    <ParticipantRow key={p.id} p={p} onClick={() => setSelected(p)} />
                  ))}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        )}

        {/* Suspended warning banner */}
        {data.some((p) => p.status === 'suspended') && (
          <div className="px-4 py-2.5 bg-red-50 border-t border-red-100 flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle size={13} />
            {data.filter((p) => p.status === 'suspended').length} participant(s) currently suspended â€”
            all transactions blocked until reactivated
          </div>
        )}

        {/* Onboarding info bar */}
        {data.some((p) => p.status === 'onboarding') && (
          <div className="px-4 py-2.5 bg-yellow-50 border-t border-yellow-100 flex items-center gap-2 text-xs text-yellow-700">
            <Activity size={13} />
            {data.filter((p) => p.status === 'onboarding').length} participant(s) in onboarding â€”
            API integration testing in progress
          </div>
        )}
      </div>

      <ParticipantDrawer participant={selected} onClose={() => setSelected(null)} />
      <OnboardModal open={onboardOpen} onClose={() => setOnboardOpen(false)} />
    </div>
  )
}
