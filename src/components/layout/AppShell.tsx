import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAppStore } from '../../store/appStore'
import { motion } from 'framer-motion'

export function AppShell() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <motion.div
        className="flex flex-col flex-1 overflow-hidden"
        animate={{ marginLeft: collapsed ? 56 : 240 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}
