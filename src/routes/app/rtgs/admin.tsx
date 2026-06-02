import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useAppStore } from '../../../store/appStore'
import { staggerContainer, fadeInUp } from '../../../utils/animations'
import { formatUGX } from '../../../utils/format'
import clsx from 'clsx'

const TABS = [
  'Settlement Windows', 'Transaction Limits', 'Approval Workflows', 'Participant Rules',
  'Liquidity Thresholds', 'Priority Rules', 'Exception Rules', 'Notification Templates',
  'Operator Roles', 'Audit Policy',
]

const SETTLEMENT_WINDOWS = [
  { id: 'w1',  name: 'Window 1',          opens: '08:00',     closes: '12:00',     type: 'Standard',   status: 'active' },
  { id: 'w2',  name: 'Window 2',          opens: '12:00',     closes: '16:00',     type: 'Standard',   status: 'active' },
  { id: 'w3',  name: 'Window 3',          opens: '16:00',     closes: '17:30',     type: 'End-of-Day', status: 'active' },
  { id: 'eme', name: 'Emergency Window',  opens: 'On-demand', closes: 'On-demand', type: 'Emergency',  status: 'available' },
]

const APPROVAL_WORKFLOWS = [
  { rule: 'Transaction > UGX 1 Billion',              required: 'CBU Settlement Operator',            steps: 1 },
  { rule: 'Transaction > UGX 5 Billion',              required: 'CBU Settlement Operator + PS Treasury', steps: 2 },
  { rule: 'Government Salary Settlement',             required: 'PS Treasury + CBU Governor',         steps: 2 },
  { rule: 'Emergency Priority Settlement',            required: 'CBU Governor',                       steps: 1 },
  { rule: 'Treasury Disbursement > UGX 10 Billion',  required: 'AG + PS Treasury + CBU',             steps: 3 },
]

const OPERATOR_ROLES = [
  { role: 'RTGS Super Admin',                 approve: true,  reject: true,  hold: true,  inject: true,  config: true },
  { role: 'Central Bank Settlement Operator', approve: true,  reject: true,  hold: true,  inject: true,  config: false },
  { role: 'Treasury Settlement Officer',      approve: false, reject: false, hold: true,  inject: false, config: false },
  { role: 'Bank RTGS Operator',               approve: false, reject: false, hold: false, inject: false, config: false },
  { role: 'Liquidity Manager',                approve: false, reject: false, hold: false, inject: true,  config: false },
  { role: 'RTGS Auditor',                     approve: false, reject: false, hold: false, inject: false, config: false },
]

const LIQUIDITY_THRESHOLDS = [
  { bank: 'Stanbic Bank Uganda',   warning: 75, critical: 90, intraday: 6_000_000_000 },
  { bank: 'Centenary Bank',        warning: 70, critical: 88, intraday: 3_000_000_000 },
  { bank: 'DFCU Bank',             warning: 80, critical: 92, intraday: 5_000_000_000 },
  { bank: 'Equity Bank Uganda',    warning: 75, critical: 90, intraday: 2_500_000_000 },
  { bank: 'Absa Bank Uganda',      warning: 75, critical: 90, intraday: 2_000_000_000 },
  { bank: 'Bank of Africa Uganda', warning: 80, critical: 92, intraday: 1_500_000_000 },
  { bank: 'Housing Finance Bank',  warning: 75, critical: 90, intraday: 800_000_000 },
]

export default function RTGSAdminPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [activeTab, setActiveTab] = useState('Settlement Windows')

  function handleSave() {
    addToast('Configuration saved successfully (demo — no real changes persisted)', 'success')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="RTGS Admin" subtitle="Configure settlement windows, limits, workflows, roles, and policies" />

      <div className="flex gap-1 flex-wrap bg-slate-900 border border-slate-700 rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">

        {activeTab === 'Settlement Windows' && (
          <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[160px_100px_100px_120px_80px_80px] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Window</span><span>Opens</span><span>Closes</span><span>Type</span><span>Status</span><span className="text-center">Edit</span>
            </div>
            {SETTLEMENT_WINDOWS.map((w) => (
              <div key={w.id} className="grid grid-cols-[160px_100px_100px_120px_80px_80px] px-4 py-3 border-b border-slate-800 last:border-b-0 items-center text-xs">
                <span className="text-white font-semibold">{w.name}</span>
                <span className="text-slate-300 font-mono">{w.opens}</span>
                <span className="text-slate-300 font-mono">{w.closes}</span>
                <span className="text-slate-400">{w.type}</span>
                <span className={clsx('font-semibold text-[10px]', w.status === 'active' ? 'text-green-400' : 'text-amber-400')}>
                  {w.status.toUpperCase()}
                </span>
                <div className="flex justify-center">
                  <button onClick={handleSave} className="text-xs text-amber-400 hover:text-amber-300">Edit</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Approval Workflows' && (
          <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_200px_60px_80px_60px] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Rule</span><span>Required Approvers</span><span className="text-center">Steps</span><span className="text-center">Active</span><span className="text-center">Edit</span>
            </div>
            {APPROVAL_WORKFLOWS.map((w, i) => (
              <div key={i} className="grid grid-cols-[1fr_200px_60px_80px_60px] px-4 py-3 border-b border-slate-800 last:border-b-0 items-center text-xs">
                <span className="text-white">{w.rule}</span>
                <span className="text-slate-400">{w.required}</span>
                <span className="text-center text-amber-400 font-bold">{w.steps}</span>
                <div className="flex justify-center"><Check size={14} className="text-green-400" /></div>
                <div className="flex justify-center"><button onClick={handleSave} className="text-xs text-amber-400 hover:text-amber-300">Edit</button></div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Liquidity Thresholds' && (
          <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[180px_100px_100px_1fr_60px] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Bank</span><span className="text-right">Warning %</span><span className="text-right">Critical %</span><span className="text-right">Intraday Limit</span><span className="text-center">Edit</span>
            </div>
            {LIQUIDITY_THRESHOLDS.map((t) => (
              <div key={t.bank} className="grid grid-cols-[180px_100px_100px_1fr_60px] px-4 py-3 border-b border-slate-800 last:border-b-0 items-center text-xs">
                <span className="text-white font-semibold truncate">{t.bank.split(' ')[0]}</span>
                <span className="text-right text-amber-400 font-bold">{t.warning}%</span>
                <span className="text-right text-red-400 font-bold">{t.critical}%</span>
                <span className="text-right text-slate-300 font-mono">{(t.intraday / 1_000_000_000).toFixed(1)}B UGX</span>
                <div className="flex justify-center"><button onClick={handleSave} className="text-xs text-amber-400 hover:text-amber-300">Edit</button></div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Operator Roles' && (
          <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[200px_repeat(5,60px)] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Role</span>
              {['Approve', 'Reject', 'Hold', 'Inject', 'Config'].map((h) => (
                <span key={h} className="text-center">{h}</span>
              ))}
            </div>
            {OPERATOR_ROLES.map((r) => (
              <div key={r.role} className="grid grid-cols-[200px_repeat(5,60px)] px-4 py-3 border-b border-slate-800 last:border-b-0 items-center text-xs">
                <span className="text-white font-medium truncate">{r.role}</span>
                {[r.approve, r.reject, r.hold, r.inject, r.config].map((val, i) => (
                  <div key={i} className="flex justify-center">
                    {val ? <Check size={14} className="text-green-400" /> : <span className="text-slate-700">—</span>}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {!['Settlement Windows', 'Approval Workflows', 'Liquidity Thresholds', 'Operator Roles'].includes(activeTab) && (
          <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center space-y-3">
            <p className="text-slate-300 font-semibold text-sm">{activeTab}</p>
            <p className="text-slate-500 text-xs">Configuration panel for {activeTab}. Edit fields and save to apply changes.</p>
            <button
              onClick={handleSave}
              className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm transition-colors"
            >
              Save Configuration
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
