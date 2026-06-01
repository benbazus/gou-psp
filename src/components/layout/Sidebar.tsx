import { Link, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  LayoutDashboard, Zap, Building2, GitBranch, Users,
  Banknote, RefreshCw, ShieldAlert, MessageSquareWarning,
  Code2, Activity, BarChart3, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { path: '/app/dashboard',      icon: LayoutDashboard,       label: 'Dashboard' },
  { path: '/app/simulator',      icon: Zap,                   label: 'Payment Simulator' },
  { path: '/app/collections',    icon: Building2,             label: 'Collections' },
  { path: '/app/routing',        icon: GitBranch,             label: 'Routing' },
  { path: '/app/participants',   icon: Users,                 label: 'Participants' },
  { path: '/app/settlement',     icon: Banknote,              label: 'Settlement' },
  { path: '/app/reconciliation', icon: RefreshCw,             label: 'Reconciliation' },
  { path: '/app/compliance',     icon: ShieldAlert,           label: 'Compliance' },
  { path: '/app/disputes',       icon: MessageSquareWarning,  label: 'Disputes' },
  { path: '/app/api-platform',   icon: Code2,                 label: 'API Platform' },
  { path: '/app/operations',     icon: Activity,              label: 'Operations' },
  { path: '/app/reports',        icon: BarChart3,             label: 'Reports' },
  { path: '/app/admin',          icon: Settings,              label: 'Admin' },
]

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const activeRole = useAppStore((s) => s.activeRole)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <Tooltip.Provider delayDuration={300}>
      <motion.aside
        className="fixed left-0 top-0 h-screen bg-primary flex flex-col z-40 overflow-hidden"
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-primary-light/30">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 min-w-0"
              >
                <div className="w-7 h-7 bg-accent rounded-md flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-white font-bold text-xs leading-tight truncate">Uganda GovPay</div>
                  <div className="text-accent text-[10px] truncate">National Payment Infrastructure</div>
                </div>
              </motion.div>
            )}
            {collapsed && (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-7 h-7 bg-accent rounded-md mx-auto"
              />
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0 ml-1"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = pathname.startsWith(path)
            const item = (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-md text-sm transition-colors relative group',
                  active
                    ? 'bg-primary-light text-white'
                    : 'text-white/70 hover:text-white hover:bg-primary-light/50'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}
                <Icon size={17} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate whitespace-nowrap overflow-hidden font-medium"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip.Root key={path}>
                  <Tooltip.Trigger asChild>{item}</Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg ml-1"
                    >
                      {label}
                      <Tooltip.Arrow className="fill-slate-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )
            }
            return item
          })}
        </nav>

        {/* Role badge */}
        <div className="border-t border-primary-light/30 px-3 py-3">
          <div className={clsx('flex items-center gap-2', collapsed && 'justify-center')}>
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold">
                {activeRole ? activeRole[0] : 'G'}
              </span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <div className="text-white text-xs font-medium truncate">
                    {activeRole ?? 'Guest'}
                  </div>
                  <div className="text-white/50 text-[10px]">GovPay Switch</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </Tooltip.Provider>
  )
}
