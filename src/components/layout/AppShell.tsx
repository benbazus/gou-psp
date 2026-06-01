import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAppStore } from '../../store/appStore'
import { motion } from 'framer-motion'

export function AppShell() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Spacer matches sidebar width so content div doesn't overlap */}
      <motion.div
        className="flex-shrink-0"
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
