// src/routes/app/agency/profile.tsx
import { motion } from 'framer-motion'
import { Building2, Hash, Banknote, Activity } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { mockAgencies } from '../../../data/mockAgencies'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AgencyProfilePage() {
  const { tenantId, accentColor, tenantName } = usePortalConfig()
  const agency = mockAgencies.find((a) => a.id.toLowerCase() === tenantId)

  if (!agency) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted text-sm">
        Agency profile not found for "{tenantId}"
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Agency Profile" subtitle={`${tenantName} — registration and service details`} />
      </motion.div>

      {/* Summary card */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}15`, color: accentColor }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{agency.name}</div>
            <div className="text-sm text-muted mt-0.5">{agency.type}</div>
            <div className="mt-1">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                {agency.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Agency Code',       value: agency.id,                icon: <Hash size={14} /> },
            { label: 'Short Name',        value: agency.shortName,         icon: <Building2 size={14} /> },
            { label: 'Settlement Account',value: agency.settlementAccount, icon: <Banknote size={14} /> },
            { label: 'Daily Volume',      value: formatUGX(agency.dailyVolume), icon: <Activity size={14} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-surface rounded-xl p-3 border border-border">
              <div className="flex items-center gap-1.5 mb-1" style={{ color: accentColor }}>
                {icon}
                <span className="text-[10px] uppercase tracking-wide font-medium text-muted">{label}</span>
              </div>
              <div className="text-sm font-semibold text-slate-800 truncate">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Services */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-800">Available Services</h3>
          <p className="text-xs text-muted">Services accessible through GovPay payment channels</p>
        </div>
        <div className="divide-y divide-border">
          {agency.services.map((svc) => (
            <div key={svc.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-800">{svc.name}</div>
                <div className="text-xs text-muted mt-0.5">{svc.description}</div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="text-sm font-bold" style={{ color: accentColor }}>{formatUGX(svc.fee)}</div>
                <div className="text-[10px] text-muted">Standard Fee</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPI summary */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Daily Volume</div>
          <div className="text-2xl font-bold text-slate-800">{formatUGX(agency.dailyVolume)}</div>
          <div className="text-xs text-muted mt-0.5">Average daily collections</div>
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Monthly Revenue</div>
          <div className="text-2xl font-bold text-slate-800">{formatUGX(agency.monthlyRevenue)}</div>
          <div className="text-xs text-muted mt-0.5">Net of fees</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
