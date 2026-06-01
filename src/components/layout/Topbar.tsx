import { useState, useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Search, Bell } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { CommandPalette } from './CommandPalette'
import { NotificationPanel } from './NotificationPanel'

const BREADCRUMB_MAP: Record<string, string> = {
  '/app/dashboard':      'Dashboard',
  '/app/simulator':      'Payment Simulator',
  '/app/collections':    'Collections',
  '/app/routing':        'Payment Routing',
  '/app/participants':   'Participant Management',
  '/app/settlement':     'Settlement',
  '/app/reconciliation': 'Reconciliation',
  '/app/compliance':     'Compliance & Risk',
  '/app/disputes':       'Disputes & Refunds',
  '/app/api-platform':   'API Platform',
  '/app/operations':     'Operations Center',
  '/app/reports':        'Reports & Analytics',
  '/app/admin':          'Admin & Configuration',
}

export function Topbar() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const role = useAppStore((s) => s.activeRole)
  const notificationsRead = useAppStore((s) => s.notificationsRead)
  const liveTransactions = useAppStore((s) => s.liveTransactions)
  const pageTitle = BREADCRUMB_MAP[pathname] ?? 'GovPay Switch'

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">GovPay Switch</span>
          <span className="text-muted">/</span>
          <span className="font-semibold text-slate-800">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 text-sm text-muted bg-surface border border-border rounded-lg px-3 py-1.5 hover:border-primary/30 transition-colors"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd className="text-xs bg-card border border-border rounded px-1">⌘K</kbd>
          </button>

          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 text-muted hover:text-slate-800 transition-colors"
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {!notificationsRead && liveTransactions.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">{role ? role[0] : 'G'}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">{role ?? 'Guest'}</span>
          </div>
        </div>
      </header>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
