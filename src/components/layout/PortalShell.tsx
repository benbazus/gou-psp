import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastStack } from '../ui/ToastStack'
import { PortalConfigContext } from '../../contexts/portalConfig'
import { useAppStore } from '../../store/appStore'
import { useLiveUpdates } from '../../hooks/useLiveUpdates'
import type { PortalConfig } from '../../types'

interface PortalShellProps {
  config: PortalConfig
}

export function PortalShell({ config }: PortalShellProps) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  useLiveUpdates()

  // Apply portal accent CSS variables to the document root
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--portal-accent', config.accentColor)
    root.style.setProperty('--portal-accent-light', config.accentLight)
    root.style.setProperty('--portal-accent-dark', config.accentDark)
    return () => {
      root.style.removeProperty('--portal-accent')
      root.style.removeProperty('--portal-accent-light')
      root.style.removeProperty('--portal-accent-dark')
    }
  }, [config.accentColor, config.accentLight, config.accentDark])

  return (
    <PortalConfigContext.Provider value={config}>
      <div className="flex h-screen overflow-hidden bg-surface">
        <motion.div
          className="flex-shrink-0"
          animate={{ width: collapsed ? 56 : 240 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        />
        <Sidebar
          navSections={config.navSections}
          portalType={config.portalType}
          tenantName={config.tenantShort}
        />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar portalConfig={config} />
          <motion.main
            key={config.tenantId}
            className="flex-1 overflow-y-auto p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.main>
        </div>
        <ToastStack />
      </div>
    </PortalConfigContext.Provider>
  )
}
