import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../components/ui/PageHeader'
import { Stepper } from '../../components/ui/Stepper'
import { Badge } from '../../components/ui/Badge'
import { mockAgencies } from '../../data/mockAgencies'
import { useAppStore } from '../../store/appStore'
import { formatUGX, generatePRN, generateTxnId } from '../../utils/format'
import { fadeInUp, scaleIn } from '../../utils/animations'
import { CheckCircle, Printer, RotateCcw } from 'lucide-react'
import type { Agency, AgencyService } from '../../types'

const STEPS = [
  { label: 'Select Service' },
  { label: 'Review Invoice' },
  { label: 'Confirm Payment' },
]

const CHANNELS = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard']

const LIFECYCLE = [
  'Invoice Generated',
  'Payment Initiated',
  'Bank/MoMo Processing',
  'Confirmation Received',
  'Agency Notified',
]

export default function CollectionsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(0)
  const [agency, setAgency] = useState<Agency>(mockAgencies[0])
  const [service, setService] = useState<AgencyService>(mockAgencies[0].services[0])
  const [channel, setChannel] = useState(CHANNELS[0])
  const [prn, setPrn] = useState('')
  const [txnId, setTxnId] = useState('')
  const [done, setDone] = useState(false)
  const [lifecycleStage, setLifecycleStage] = useState(0)

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
    for (let i = 0; i <= 4; i++) {
      await new Promise<void>((r) => setTimeout(r, 500))
      setLifecycleStage(i)
    }
    setDone(true)
    addToast(`Payment ${id} confirmed successfully`, 'success')
  }

  function reset() {
    setStep(0); setPrn(''); setTxnId('')
    setDone(false); setLifecycleStage(0)
    setAgency(mockAgencies[0]); setService(mockAgencies[0].services[0])
  }

  return (
    <div>
      <PageHeader title="Government Collections" subtitle="Pay for government services across all agencies" />

      <div className="mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Agency</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mockAgencies.map((a) => (
                    <button key={a.id} onClick={() => handleAgencyChange(a.id)}
                      className={`text-left p-3 rounded-lg border-2 text-sm transition-colors
                        ${agency.id === a.id ? 'border-primary bg-primary-50 text-primary' : 'border-border hover:border-primary/30'}`}>
                      <div className="font-semibold">{a.shortName}</div>
                      <div className="text-xs text-muted mt-0.5">{a.type}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Service — {agency.shortName}</h3>
                <div className="space-y-2 mb-4">
                  {agency.services.map((svc) => (
                    <button key={svc.id} onClick={() => setService(svc)}
                      className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-colors
                        ${service.id === svc.id ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{svc.name}</span>
                        <span className="text-primary font-semibold">{formatUGX(svc.fee)}</span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">{svc.description}</div>
                    </button>
                  ))}
                </div>
                <button onClick={handleGeneratePRN}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                  Generate Invoice
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-card shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">Invoice Preview</h3>
                  <Badge variant="warning">Pending Payment</Badge>
                </div>
                <div className="border border-border rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted">PRN</span><span className="font-mono font-medium">{prn}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Agency</span><span>{agency.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Service</span><span>{service.name}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between font-semibold">
                    <span>Total Due</span>
                    <span className="text-primary text-lg">{formatUGX(service.fee)}</span>
                  </div>
                </div>
                <button onClick={reset} className="mt-3 text-xs text-muted hover:text-slate-700">← Back</button>
              </div>
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Payment Channel</h3>
                <div className="space-y-2 mb-4">
                  {CHANNELS.map((c) => (
                    <button key={c} onClick={() => setChannel(c)}
                      className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-colors
                        ${channel === c ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <button onClick={handlePay}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                  Pay {formatUGX(service.fee)} via {channel}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={scaleIn} initial="hidden" animate="visible">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-card shadow-card p-6 text-center">
                {done ? (
                  <>
                    <CheckCircle size={48} className="text-success mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Confirmed!</h3>
                    <p className="text-sm text-muted mb-4">Transaction: <span className="font-mono font-medium">{txnId}</span></p>
                    <div className="bg-surface rounded-lg p-4 text-sm text-left space-y-2 mb-4">
                      <div className="flex justify-between"><span className="text-muted">Agency</span><span>{agency.shortName}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Service</span><span>{service.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold">{formatUGX(service.fee)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Channel</span><span>{channel}</span></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm text-muted hover:text-slate-800">
                        <Printer size={14} /> Print Receipt
                      </button>
                      <button onClick={reset}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                        <RotateCcw size={14} /> New Payment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700">Processing via {channel}...</p>
                  </>
                )}
              </div>
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Lifecycle</h3>
                <div className="space-y-3">
                  {LIFECYCLE.map((stage, i) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                        ${i <= lifecycleStage ? 'bg-success border-success' : 'bg-surface border-border'}`}>
                        {i <= lifecycleStage && <CheckCircle size={11} className="text-white" />}
                      </div>
                      <span className={`text-sm ${i <= lifecycleStage ? 'text-slate-800 font-medium' : 'text-muted'}`}>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
