import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const MANUAL_STEPS = [
  'Paper or email instruction raised',
  'Manual fax/email to Central Bank',
  'Manual verification by CBU officer',
  'Phone/email approval chain',
  'Manual queue tracking in spreadsheet',
  'Phone confirmation to receiving bank',
  'Spreadsheet reconciliation next day',
  'Delayed visibility – hours to days',
  'No audit trail – paper files only',
]

const DIGITAL_STEPS = [
  'Digital instruction via secure portal',
  'Automated validation in milliseconds',
  'Real-time compliance & AML check',
  'Workflow approval with digital signature',
  'Live settlement queue with priority',
  'Automated settlement execution',
  'Instant receiving bank confirmation',
  'Real-time treasury ledger update',
  'Full immutable audit trail',
]

export function ManualVsDigitalComparison() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <X size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-300">Current Manual RTGS</p>
            <p className="text-[10px] text-red-400/70">Paper-based process</p>
          </div>
        </div>
        <div className="space-y-2">
          {MANUAL_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-red-200/70">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Check size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-300">GovPay Digital RTGS</p>
            <p className="text-[10px] text-green-400/70">Automated national settlement</p>
          </div>
        </div>
        <div className="space-y-2">
          {DIGITAL_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 + 0.3 }}
              className="flex items-start gap-2"
            >
              <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-200/80">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
