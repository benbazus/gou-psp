// src/routes/app/aggregator/profile.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Clock, DollarSign, BarChart2, Calendar } from 'lucide-react'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { mockParticipants } from '../../../data/mockParticipants'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

const PARTICIPANT_ID_MAP: Record<string, string> = {
  pesalink:    'PESA',
  interswitch: 'ISW',
  flutterwave: 'FLWV',
}

export default function AggregatorProfilePage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()

  const { data: merchants = [] } = useQuery({
    queryKey: ['agg-merchants', tenantId],
    queryFn: () => tenantService.getAggregatorMerchants(tenantId),
  })
  const { data: txns = [] } = useQuery({
    queryKey: ['agg-txns', tenantId],
    queryFn: () => tenantService.getAggregatorTransactions(tenantId),
  })

  const participant = mockParticipants.find((p) => p.id === (PARTICIPANT_ID_MAP[tenantId] ?? tenantId.toUpperCase()))

  const activeMerchants = merchants.filter((m) => m.status === 'active').length
  const completed       = txns.filter((t) => t.status === 'completed')
  const totalVolume     = completed.reduce((s, t) => s + t.amount, 0)
  const totalFees       = completed.reduce((s, t) => s + t.fee, 0)
  const successRate     = txns.length > 0 ? Math.round((completed.length / txns.length) * 100) : 0

  const stats = [
    { label: 'Active Merchants', value: activeMerchants,        icon: BarChart2,  color: accentColor },
    { label: 'Total Volume',     value: formatUGX(totalVolume), icon: DollarSign, color: '#3b82f6'   },
    { label: 'Fee Revenue',      value: formatUGX(totalFees),   icon: DollarSign, color: '#22c55e'   },
    { label: 'Success Rate',     value: `${successRate}%`,      icon: BarChart2,  color: '#f59e0b'   },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Aggregator Profile" subtitle="Platform registration and connection details" />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {tenantName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">{tenantName}</h2>
            <div className="text-xs text-muted mt-0.5">Payment Aggregator · GovPay Switch participant</div>
            {participant && (
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1">
                  {participant.apiHealth === 'healthy'
                    ? <Wifi size={12} className="text-green-600" />
                    : <WifiOff size={12} className="text-red-500" />}
                  API {participant.apiHealth} · {participant.apiLatency}ms
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  Joined {participant.joinedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {participant.settlementAccount}
                </span>
              </div>
            )}
          </div>
          {participant && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              participant.status === 'active'     ? 'bg-green-100 text-green-700 border-green-200' :
              participant.status === 'onboarding' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
            }`}>
              {participant.status}
            </span>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4 border-l-4" style={{ borderColor: color }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} style={{ color }} />
              <span className="text-[10px] font-medium text-muted uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-xl font-bold text-slate-800">{value}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Merchants Overview</h3>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {(['active', 'onboarding', 'suspended'] as const).map((status) => {
            const count = merchants.filter((m) => m.status === status).length
            const color = status === 'active' ? '#22c55e' : status === 'onboarding' ? '#f59e0b' : '#ef4444'
            return (
              <div key={status} className="p-3 rounded-lg border" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                <div className="font-semibold text-slate-800 text-lg">{count}</div>
                <div className="text-muted capitalize">{status}</div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
