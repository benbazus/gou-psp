import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Stepper } from '../../../components/ui/Stepper'
import { mockAgencies } from '../../../data/mockAgencies'
import { useAppStore } from '../../../store/appStore'
import { formatUGX, generatePRN, generateTxnId } from '../../../utils/format'
import { fadeInUp } from '../../../utils/animations'
import {
  CheckCircle2, Printer, RotateCcw, Smartphone, CreditCard,
  Building2, Radio, Wallet, ArrowLeft, ChevronRight,
  ShieldCheck, Landmark,
} from 'lucide-react'
import type { Agency, AgencyService } from '../../../types'
import clsx from 'clsx'

// ─── Channels ─────────────────────────────────────────────────────────────────
type Channel = 'MTN Mobile Money' | 'Airtel Money' | 'Bank Transfer' | 'Visa/Mastercard' | 'Wallet' | 'USSD'

const CHANNELS: { id: Channel; icon: React.ElementType; label: string; sub: string }[] = [
  { id: 'MTN Mobile Money', icon: Smartphone,  label: 'MTN Mobile Money',  sub: 'Dial *165# · Instant' },
  { id: 'Airtel Money',     icon: Smartphone,  label: 'Airtel Money',      sub: 'Dial *185# · Instant' },
  { id: 'Bank Transfer',    icon: Building2,   label: 'Bank Transfer',     sub: 'Any connected bank' },
  { id: 'Visa/Mastercard',  icon: CreditCard,  label: 'Visa / Mastercard', sub: 'Debit or credit card' },
  { id: 'Wallet',           icon: Wallet,      label: 'GovPay Wallet',     sub: 'Prepaid wallet balance' },
  { id: 'USSD',             icon: Radio,       label: 'USSD',              sub: '*280*PRN# - no data needed' },
]

const BANKS = ['Stanbic Bank Uganda', 'Centenary Bank', 'DFCU Bank', 'Equity Bank', 'Absa Uganda', 'Bank of Africa', 'Housing Finance Bank']

const LIFECYCLE = [
  { stage: 'Invoice Generated',      detail: 'PRN created and validated' },
  { stage: 'Payment Initiated',      detail: 'Debit instruction sent to channel' },
  { stage: 'Channel Processing',     detail: 'Bank/MNO processing debit' },
  { stage: 'Confirmation Received',  detail: 'Channel confirmed payment' },
  { stage: 'Agency Notified',        detail: 'Agency marked PRN as PAID' },
]

const STEPS = [{ label: 'Select Service' }, { label: 'Review & Pay' }, { label: 'Confirmation' }]

// ─── Amount in words ──────────────────────────────────────────────────────────
const ONES  = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
               'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
               'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS  = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function toWords(n: number): string {
  if (n === 0) return 'Zero'
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '')
  if (n < 1_000_000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '')
  if (n < 1_000_000_000) return toWords(Math.floor(n / 1_000_000)) + ' Million' + (n % 1_000_000 ? ' ' + toWords(n % 1_000_000) : '')
  return toWords(Math.floor(n / 1_000_000_000)) + ' Billion' + (n % 1_000_000_000 ? ' ' + toWords(n % 1_000_000_000) : '')
}

// ─── Channel-specific form ────────────────────────────────────────────────────
function ChannelForm({ channel }: { channel: Channel }) {
  const [phone, setPhone]     = useState('0772')
  const [bank, setBank]       = useState(BANKS[0])
  const [account, setAccount] = useState('')
  const [card, setCard]       = useState('')
  const [expiry, setExpiry]   = useState('')
  const [cvv, setCvv]         = useState('')
  const [walletId, setWalletId] = useState('')

  if (channel === 'MTN Mobile Money' || channel === 'Airtel Money') {
    const prefix = channel === 'MTN Mobile Money' ? '077/078' : '075/070'
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Registered Mobile Number ({prefix})</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 font-mono tracking-wider"
            placeholder={channel === 'MTN Mobile Money' ? '0772 XXX XXX' : '0752 XXX XXX'}
          />
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3 text-xs text-muted">
          A payment prompt will be sent to <span className="font-mono font-semibold text-slate-700">{phone || '07XX XXX XXX'}</span>. Enter your PIN on your phone to authorise.
        </div>
      </div>
    )
  }

  if (channel === 'Bank Transfer') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Select Bank</label>
          <select value={bank} onChange={(e) => setBank(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 bg-white">
            {BANKS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Account Number</label>
          <input value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 font-mono"
            placeholder="XXXX XXXX XXXX" />
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3 text-xs text-muted">
          Funds will be debited from your <span className="font-semibold text-slate-700">{bank}</span> account instantly.
        </div>
      </div>
    )
  }

  if (channel === 'Visa/Mastercard') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Card Number</label>
          <input value={card}
            onChange={(e) => setCard(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 font-mono tracking-wider"
            placeholder="0000 0000 0000 0000" maxLength={19} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Expiry (MM/YY)</label>
            <input value={expiry}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setExpiry(v.length > 2 ? v.slice(0,2)+'/'+v.slice(2) : v) }}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 font-mono"
              placeholder="MM/YY" maxLength={5} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">CVV</label>
            <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 font-mono"
              placeholder="123" maxLength={3} type="password" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={12} className="text-green-500" />
          Secured by 3D Secure · PCI-DSS Level 1 compliant
        </div>
      </div>
    )
  }

  if (channel === 'Wallet') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">GovPay Wallet ID</label>
          <input value={walletId} onChange={(e) => setWalletId(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 font-mono"
            placeholder="GP-WALLET-XXXXXXXX" />
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 flex items-center gap-2">
          <Wallet size={13} /> Available balance: <span className="font-bold">UGX 1,240,000</span>
        </div>
      </div>
    )
  }

  // USSD
  return (
    <div className="space-y-3">
      <div className="bg-slate-900 text-green-400 font-mono text-sm rounded-xl p-4 text-center">
        <p className="text-xs text-green-400/60 mb-2">Dial this USSD code from any phone</p>
        <p className="text-2xl font-bold tracking-widest">*280*{'{PRN}'}#</p>
        <p className="text-xs text-green-400/60 mt-2">No internet required · Works on all networks</p>
      </div>
      <div className="bg-surface border border-border rounded-xl px-4 py-3 text-xs text-muted space-y-1">
        <p>1. Dial <span className="font-mono font-bold text-slate-700">*280*PRN#</span> on your mobile phone</p>
        <p>2. Follow the USSD menu prompts</p>
        <p>3. Confirm the amount and enter your PIN</p>
        <p>4. You will receive an SMS confirmation</p>
      </div>
    </div>
  )
}

// ─── Official Receipt ─────────────────────────────────────────────────────────
function OfficialReceipt({
  prn, txnId, agency, service, channel, amount, onPrint, onNew,
}: {
  prn: string; txnId: string; agency: Agency; service: AgencyService
  channel: Channel; amount: number; onPrint: () => void; onNew: () => void
}) {
  const now      = new Date()
  const dateStr  = now.toLocaleDateString('en-UG', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr  = now.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const rcptNo   = `RCPT-${Date.now().toString().slice(-8)}`
  const inWords  = toWords(amount) + ' Uganda Shillings Only'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Receipt document */}
      <div className="border-2 border-primary/20 rounded-2xl overflow-hidden shadow-xl mb-4 bg-white">
        {/* Uganda colour stripe */}
        <div className="flex h-2">
          {['#1a1a1a','#FCDC04','#CE1126','#1a1a1a','#FCDC04','#CE1126'].map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-[#2A5298] px-6 py-5 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
              <rect width="28" height="4.67" fill="#1a1a1a" />
              <rect y="4.67" width="28" height="4.67" fill="#FCDC04" />
              <rect y="9.33" width="28" height="4.67" fill="#CE1126" />
              <rect y="14" width="28" height="4.67" fill="#1a1a1a" />
              <rect y="18.67" width="28" height="4.67" fill="#FCDC04" />
              <rect y="23.33" width="28" height="4.67" fill="#CE1126" />
              <circle cx="14" cy="14" r="5.6" fill="white" />
              <ellipse cx="14" cy="15.8" rx="2.5" ry="1.7" fill="#555" />
              <circle cx="13.8" cy="10.3" r="1.05" fill="#555" />
            </svg>
            <div className="text-left">
              <div className="font-black text-sm tracking-wide">REPUBLIC OF UGANDA</div>
              <div className="text-white/70 text-xs">Uganda GovPay Switch</div>
            </div>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-widest">Official Payment Receipt</div>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-5">
          {/* Success stamp area */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Receipt No.</div>
              <div className="font-mono font-bold text-primary text-sm">{rcptNo}</div>
              <div className="text-[10px] text-muted mt-1">{dateStr} · {timeStr}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center bg-green-50">
                <CheckCircle2 size={28} className="text-green-500" />
              </div>
              <span className="text-[10px] font-black text-green-600 mt-1 uppercase tracking-wider">PAID</span>
            </div>
          </div>

          {/* Agency + service */}
          <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Landmark size={14} className="text-primary" />
              <span className="font-bold text-sm text-primary">{agency.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <ReceiptRow label="Service"     value={service.name} />
              <ReceiptRow label="PRN"         value={prn} mono />
              <ReceiptRow label="TXN ID"      value={txnId} mono />
              <ReceiptRow label="Channel"     value={channel} />
            </div>
          </div>

          {/* Amount */}
          <div className="border-t-2 border-dashed border-border py-4 mb-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-muted uppercase tracking-wider mb-0.5">Amount Paid</div>
                <div className="text-3xl font-black text-primary">{formatUGX(amount)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">In words</div>
                <div className="text-xs text-slate-600 max-w-[180px] text-right leading-snug italic">{inWords}</div>
              </div>
            </div>
          </div>

          {/* QR + barcode placeholders */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-dashed border-border mb-4">
            <div className="w-14 h-14 bg-surface border border-border rounded-lg flex items-center justify-center text-[8px] text-muted text-center leading-tight flex-shrink-0">
              QR<br/>CODE
            </div>
            <div className="flex-1">
              <div className="h-8 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded opacity-80"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 2px, white 2px, white 4px, #1a1a1a 4px, #1a1a1a 7px, white 7px, white 9px)' }}
              />
              <div className="text-[8px] font-mono text-muted text-center mt-1 tracking-[0.3em]">
                {prn}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-muted space-y-0.5">
            <p className="font-semibold text-slate-600">This is an official Government of Uganda payment receipt.</p>
            <p>Verify at <span className="font-mono text-primary">verify.govpay.go.ug</span> · PRN: {prn}</p>
            <p>Processed by Uganda GovPay Switch · Governed by Bank of Uganda</p>
          </div>
        </div>

        {/* Bottom colour stripe */}
        <div className="flex h-1.5">
          {['#CE1126','#FCDC04','#1a1a1a','#CE1126','#FCDC04','#1a1a1a'].map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onPrint}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-border rounded-xl text-sm font-semibold text-muted hover:text-slate-800 hover:border-primary/30 transition-all">
          <Printer size={15} /> Print Receipt
        </button>
        <button onClick={onNew}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
          <RotateCcw size={14} /> New Payment
        </button>
      </div>
    </motion.div>
  )
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <span className="text-muted">{label}</span>
      <span className={clsx('font-semibold text-slate-800', mono && 'font-mono text-[11px]')}>{value}</span>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  const addToast = useAppStore((s) => s.addToast)

  const [step, setStep]           = useState(0)
  const [agency, setAgency]       = useState<Agency>(mockAgencies[0])
  const [service, setService]     = useState<AgencyService>(mockAgencies[0].services[0])
  const [channel, setChannel]     = useState<Channel>('MTN Mobile Money')
  const [prn, setPrn]             = useState('')
  const [txnId, setTxnId]         = useState('')
  const [done, setDone]           = useState(false)
  const [lifecycleStage, setLifecycleStage] = useState(-1)

  function handleAgencyChange(id: string) {
    const a = mockAgencies.find((ag) => ag.id === id)!
    setAgency(a)
    setService(a.services[0])
  }

  function handleGeneratePRN() {
    setPrn(generatePRN())
    setStep(1)
  }

  async function handlePay() {
    const id = generateTxnId()
    setTxnId(id)
    setStep(2)
    setDone(false)
    setLifecycleStage(-1)
    for (let i = 0; i < LIFECYCLE.length; i++) {
      await new Promise<void>((r) => setTimeout(r, 520))
      setLifecycleStage(i)
    }
    setDone(true)
    addToast(`Payment ${id} confirmed - PRN ${prn} marked PAID`, 'success')
  }

  function reset() {
    setStep(0); setPrn(''); setTxnId('')
    setDone(false); setLifecycleStage(-1)
    setAgency(mockAgencies[0])
    setService(mockAgencies[0].services[0])
  }

  return (
    <div>
      <PageHeader
        title="Government Collections"
        subtitle="Pay for government services securely through Uganda GovPay Switch"
      />

      <div className="mb-6 max-w-lg">
        <Stepper steps={STEPS} current={step} />
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 0: Select Agency + Service ── */}
        {step === 0 && (
          <motion.div key="s0" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-5">
              {/* Agency grid */}
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Select Government Agency</h3>
                <p className="text-xs text-muted mb-4">Choose the agency you are paying</p>
                <div className="grid grid-cols-2 gap-2">
                  {mockAgencies.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleAgencyChange(a.id)}
                      className={clsx(
                        'text-left p-3 rounded-xl border-2 text-sm transition-all',
                        agency.id === a.id
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-surface',
                      )}
                    >
                      <div className="font-semibold text-xs">{a.shortName}</div>
                      <div className="text-[10px] text-muted mt-0.5">{a.type}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service list */}
              <div className="bg-card rounded-card shadow-card p-5 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{agency.name}</h3>
                  <p className="text-xs text-muted">Select the service you need to pay for</p>
                </div>

                <div className="flex-1 space-y-2 mb-4">
                  {agency.services.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setService(svc)}
                      className={clsx(
                        'w-full text-left p-3.5 rounded-xl border-2 transition-all',
                        service.id === svc.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-surface',
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold text-slate-800">{svc.name}</span>
                        <span className="text-sm font-bold text-primary">{formatUGX(svc.fee)}</span>
                      </div>
                      <div className="text-xs text-muted">{svc.description}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGeneratePRN}
                  className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
                >
                  Generate Invoice <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Invoice + Channel ── */}
        {step === 1 && (
          <motion.div key="s1" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-5">
              {/* Official invoice */}
              <div>
                <div className="border-2 border-border rounded-2xl overflow-hidden shadow-md bg-white">
                  {/* Stripe */}
                  <div className="flex h-1.5">
                    {['#1a1a1a','#FCDC04','#CE1126','#1a1a1a','#FCDC04','#CE1126'].map((c, i) => (
                      <div key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  {/* Invoice header */}
                  <div className="bg-primary/5 border-b border-primary/10 px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider">Government Invoice</div>
                      <div className="font-bold text-slate-800 text-sm">{agency.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted">PRN</div>
                      <div className="font-mono font-bold text-primary">{prn}</div>
                    </div>
                  </div>
                  {/* Invoice body */}
                  <div className="px-5 py-4 space-y-2.5 text-sm">
                    <InvRow label="Service"         value={service.name} />
                    <InvRow label="Description"     value={service.description} />
                    <InvRow label="Issued"          value={new Date().toLocaleString('en-UG')} />
                    <InvRow label="Valid Until"     value={new Date(Date.now() + 7*86400000).toLocaleDateString('en-UG')} />
                  </div>
                  <div className="mx-5 border-t-2 border-dashed border-border py-3 flex justify-between items-center text-sm">
                    <span className="text-muted font-medium">Total Due</span>
                    <span className="text-2xl font-black text-primary">{formatUGX(service.fee)}</span>
                  </div>
                  <div className="px-5 pb-4">
                    <div className="text-[10px] text-muted italic text-center">
                      {toWords(service.fee)} Uganda Shillings Only
                    </div>
                  </div>
                </div>
                <button onClick={reset} className="mt-3 flex items-center gap-1 text-xs text-muted hover:text-slate-700 transition-colors">
                  <ArrowLeft size={12} /> Change selection
                </button>
              </div>

              {/* Channel selection + form */}
              <div className="bg-card rounded-card shadow-card p-5 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Choose Payment Channel</h3>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {CHANNELS.map(({ id, icon: Icon, label, sub }) => (
                    <button
                      key={id}
                      onClick={() => setChannel(id)}
                      className={clsx(
                        'flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                        channel === id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-surface',
                      )}
                    >
                      <Icon size={16} className={channel === id ? 'text-primary mt-0.5' : 'text-muted mt-0.5'} />
                      <div>
                        <div className={clsx('text-xs font-semibold leading-tight', channel === id ? 'text-primary' : 'text-slate-800')}>{label}</div>
                        <div className="text-[10px] text-muted mt-0.5">{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Channel-specific form */}
                <div className="mb-4">
                  <ChannelForm channel={channel} />
                </div>

                <button
                  onClick={handlePay}
                  className="mt-auto w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
                >
                  Pay {formatUGX(service.fee)} via {channel}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Processing + Confirmation ── */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="grid grid-cols-2 gap-5">
              {/* Left: processing → receipt */}
              <div>
                {!done ? (
                  <div className="bg-card rounded-card shadow-card p-8 flex flex-col items-center justify-center text-center min-h-64">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Smartphone size={20} className="text-primary" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">Processing payment...</p>
                    <p className="text-xs text-muted">Contacting {channel} - please do not close this page</p>
                  </div>
                ) : (
                  <OfficialReceipt
                    prn={prn}
                    txnId={txnId}
                    agency={agency}
                    service={service}
                    channel={channel}
                    amount={service.fee}
                    onPrint={() => window.print()}
                    onNew={reset}
                  />
                )}
              </div>

              {/* Right: payment lifecycle */}
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-5">Payment Lifecycle</h3>
                <div className="relative">
                  {/* Vertical connector */}
                  <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-border" />
                  <div className="space-y-5">
                    {LIFECYCLE.map(({ stage, detail }, i) => {
                      const active    = i === lifecycleStage
                      const completed = i < lifecycleStage || (done && i <= lifecycleStage)

                      return (
                        <div key={stage} className="flex items-start gap-4 relative">
                          <motion.div
                            animate={active ? { scale: [1, 1.15, 1] } : {}}
                            transition={active ? { repeat: Infinity, duration: 0.8 } : {}}
                            className={clsx(
                              'w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300',
                              completed ? 'bg-green-500 border-green-500'  :
                              active    ? 'bg-primary border-primary shadow-md shadow-primary/30' :
                              'bg-surface border-border',
                            )}
                          >
                            {completed
                              ? <CheckCircle2 size={16} className="text-white" />
                              : active
                              ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              : <span className="text-[10px] font-bold text-muted">{i + 1}</span>
                            }
                          </motion.div>
                          <div className={clsx('flex-1 transition-all duration-300', active || completed ? 'opacity-100' : 'opacity-40')}>
                            <div className={clsx(
                              'text-sm font-semibold leading-tight',
                              completed ? 'text-green-700' : active ? 'text-primary' : 'text-muted',
                            )}>
                              {stage}
                            </div>
                            <div className="text-xs text-muted mt-0.5">{detail}</div>
                            {completed && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] text-green-600 font-medium mt-0.5"
                              >
                                ✓ Completed
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {done && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-4 border-t border-border text-center"
                  >
                    <div className="text-xs font-mono text-muted mb-1">Transaction ID</div>
                    <div className="font-mono font-bold text-primary text-sm">{txnId}</div>
                    <div className="text-xs text-muted mt-1">PRN {prn} - Status: <span className="font-bold text-green-600">PAID</span></div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-slate-800 text-right max-w-[60%]">{value}</span>
    </div>
  )
}
