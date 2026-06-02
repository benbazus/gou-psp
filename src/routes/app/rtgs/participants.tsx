import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatUGX } from '../../../utils/format'
import { mockRtgsParticipants } from '../../../data/mockRtgsParticipants'
import type { RTGSParticipant } from '../../../types/rtgs'
import clsx from 'clsx'

const STATUS_BADGE: Record<string, string> = {
  active:     'bg-green-500/20 text-green-400 border-green-500/30',
  suspended:  'bg-red-500/20 text-red-400 border-red-500/30',
  onboarding: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const RISK_COLOR: Record<string, string> = {
  low:    'text-green-400',
  medium: 'text-amber-400',
  high:   'text-red-400',
}

const API_HEALTH_ICON: Record<string, React.ReactNode> = {
  healthy:  <Wifi size={13} className="text-green-400" />,
  degraded: <Wifi size={13} className="text-amber-400" />,
  down:     <WifiOff size={13} className="text-red-400" />,
}

export default function RTGSParticipantsPage() {
  const [selected, setSelected] = useState<RTGSParticipant | null>(null)
  const [typeFilter, setTypeFilter] = useState('all')

  const types = ['all', 'Commercial Bank', 'Treasury Account', 'Government Agency', 'Central Bank']
  const filtered = typeFilter === 'all'
    ? mockRtgsParticipants
    : mockRtgsParticipants.filter((p) => p.type === typeFilter)

  return (
    <div className="space-y-6">
      <PageHeader title="RTGS Participants" subtitle="Registered participants in the national RTGS settlement system" />

      <div className="flex gap-1 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              typeFilter === t
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white',
            )}
          >
            {t === 'all' ? 'All Participants' : t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[180px_1fr_80px_80px_70px_80px] gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Participant</span>
            <span>Settlement Account</span>
            <span className="text-right">Daily Limit</span>
            <span className="text-center">API</span>
            <span className="text-center">Risk</span>
            <span className="text-center">Status</span>
          </div>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(p)}
              className={clsx(
                'grid grid-cols-[180px_1fr_80px_80px_70px_80px] gap-2 items-center px-4 py-3 cursor-pointer hover:bg-slate-800/60 border-b border-slate-800 last:border-b-0 transition-colors',
                selected?.id === p.id && 'bg-slate-800/80',
              )}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.shortName}</p>
                <p className="text-[10px] text-slate-500 truncate">{p.type}</p>
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate">{p.settlementAccount}</p>
              <p className="text-xs text-slate-300 text-right">
                {p.dailyLimit > 0 ? `${(p.dailyLimit / 1_000_000_000_000).toFixed(0)}T` : '—'}
              </p>
              <div className="flex justify-center items-center gap-1">
                {API_HEALTH_ICON[p.apiHealth]}
                <span className="text-[10px] text-slate-500">{p.apiLatency > 0 ? `${p.apiLatency}ms` : '—'}</span>
              </div>
              <div className="flex justify-center">
                <span className={clsx('text-[10px] font-semibold', RISK_COLOR[p.riskRating])}>
                  {p.riskRating.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-center">
                <span className={clsx('text-[10px] font-semibold border rounded px-1.5 py-0.5', STATUS_BADGE[p.rtgsStatus])}>
                  {p.rtgsStatus.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 sticky top-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-bold">{selected.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selected.type}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={clsx('text-[10px] font-semibold border rounded px-1.5 py-0.5', STATUS_BADGE[selected.rtgsStatus])}>
                  {selected.rtgsStatus.toUpperCase()}
                </span>
                <span className={clsx('text-[10px] font-semibold', RISK_COLOR[selected.riskRating])}>
                  {selected.riskRating.toUpperCase()} RISK
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {([
                  ['Settlement Account',  selected.settlementAccount],
                  ['Daily Limit',         selected.dailyLimit > 0 ? formatUGX(selected.dailyLimit) : 'Unlimited'],
                  ['Single Tx Limit',     selected.singleTransactionLimit > 0 ? formatUGX(selected.singleTransactionLimit) : 'Unlimited'],
                  ['Liquidity Position',  selected.liquidityPosition > 0 ? formatUGX(selected.liquidityPosition) : '—'],
                  ['API Health',          `${selected.apiHealth} (${selected.apiLatency > 0 ? selected.apiLatency + 'ms' : '—'})`],
                  ['Approval Required',   selected.approvalRequired ? 'Yes' : 'No'],
                  ['Joined',              selected.joinedDate],
                  ['Today Tx Count',      String(selected.dailyTransactionCount)],
                  ['Today Settled Value', formatUGX(selected.dailySettledValue)],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">{label}</span>
                    <span className="text-slate-200 text-right">{val}</span>
                  </div>
                ))}
              </div>
              {selected.rtgsStatus === 'suspended' && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    This participant is suspended. All RTGS instructions to/from this participant are rejected. Contact RTGS Admin to reinstate.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-500">Select a participant to view full profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
