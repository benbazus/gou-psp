import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { X, CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { ALL_PORTAL_ENTRIES } from '../../data/mockPortalConfigs'
import { usePortalConfig } from '../../contexts/portalConfig'
import type { Role } from '../../types'

const PORTAL_TYPE_ICON: Record<string, string> = {
  national: '🏛',
  bank:     '🏦',
  rtgs:     '⚡',
  treasury: '🏛',
  agency:   '📋',
  mobile:   '📱',
}

const PORTAL_TYPE_LABEL: Record<string, string> = {
  national: 'NATIONAL',
  bank:     'BANK',
  rtgs:     'RTGS',
  treasury: 'TREASURY',
  agency:   'AGENCY',
  mobile:   'MOBILE',
}

interface PortalSwitcherProps {
  open: boolean
  onClose: () => void
}

export function PortalSwitcher({ open, onClose }: PortalSwitcherProps) {
  const navigate     = useNavigate()
  const setPortal    = useAppStore((s) => s.setPortal)
  const addToast     = useAppStore((s) => s.addToast)
  const { tenantId } = usePortalConfig()

  function handleSwitch(entry: typeof ALL_PORTAL_ENTRIES[number]) {
    if (entry.comingSoon) return
    const { config, label } = entry

    if (config.tenantId === tenantId) {
      onClose()
      return
    }

    const role = (config.allowedRoles[0] ?? 'Super Admin') as Role
    setPortal(config.portalType, config.tenantId, role)
    addToast(`Switched to ${label}`, 'success')
    onClose()
    navigate({ to: config.homeRoute })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dropdown panel */}
          <motion.div
            key="portal-switcher"
            className="fixed right-4 top-16 z-50 w-96 bg-white border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
              <div>
                <p className="text-sm font-semibold text-slate-800">Switch Portal</p>
                <p className="text-xs text-muted mt-0.5">Demo mode — instant portal switching</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-slate-700 rounded-lg hover:bg-card transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Portal list */}
            <div className="max-h-[420px] overflow-y-auto py-1">
              {ALL_PORTAL_ENTRIES.map((entry) => {
                const { config, label, comingSoon } = entry
                const isActive  = config.tenantId === tenantId
                const typeIcon  = PORTAL_TYPE_ICON[config.portalType]  ?? '🏢'
                const typeLabel = PORTAL_TYPE_LABEL[config.portalType] ?? config.portalType.toUpperCase()
                const roleHint  = config.allowedRoles[0] ?? 'Super Admin'

                return (
                  <button
                    key={config.tenantId}
                    onClick={() => handleSwitch(entry)}
                    disabled={comingSoon}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      isActive
                        ? 'border-l-2 bg-green-50/60 hover:bg-green-50'
                        : comingSoon
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-surface border-l-2 border-transparent',
                    ].join(' ')}
                    style={isActive ? { borderLeftColor: '#22c55e' } : undefined}
                  >
                    {/* Coloured icon circle */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: config.accentColor + '18', border: `1.5px solid ${config.accentColor}44` }}
                    >
                      {typeIcon}
                    </div>

                    {/* Label + role hint */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate leading-tight">{label}</p>
                      <p className="text-xs text-muted truncate mt-0.5">{comingSoon ? 'Coming soon' : roleHint}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {comingSoon ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 tracking-wide">
                          SOON
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide"
                          style={{ background: config.accentColor + '18', color: config.accentColor }}
                        >
                          {typeLabel}
                        </span>
                      )}

                      {isActive && (
                        <>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 tracking-wide">
                            ● ACTIVE
                          </span>
                          <CheckCircle size={14} className="text-green-600" />
                        </>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-surface text-center">
              <p className="text-[11px] text-muted">
                Switching portal navigates instantly · no re-login required
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
