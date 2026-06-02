import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { Search, Bell, ShieldCheck, Lock, LogOut, ArrowLeftRight } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { CommandPalette } from './CommandPalette'
import { NotificationPanel } from './NotificationPanel'
import { PortalSwitcher } from './PortalSwitcher'
import type { PortalConfig } from '../../types'

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
  '/app/architecture':   'System Architecture',
}

interface TopbarProps {
  portalConfig?: PortalConfig
}

export function Topbar({ portalConfig }: TopbarProps) {
  const [cmdOpen, setCmdOpen]       = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [secOpen, setSecOpen]       = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

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

  const role                = useAppStore((s) => s.activeRole)
  const mfaVerified         = useAppStore((s) => s.mfaVerified)
  const sessionInfo         = useAppStore((s) => s.sessionInfo)
  const notificationsRead   = useAppStore((s) => s.notificationsRead)
  const liveTransactions    = useAppStore((s) => s.liveTransactions)
  const logout              = useAppStore((s) => s.logout)

  function getPageTitle() {
    if (!portalConfig) return BREADCRUMB_MAP[pathname] ?? 'GovPay Switch'
    for (const section of portalConfig.navSections) {
      for (const item of section.items) {
        if (pathname === item.path || pathname.startsWith(item.path + '/')) {
          return item.label
        }
      }
    }
    return portalConfig.tenantName
  }
  const pageTitle = getPageTitle()

  function handleLogout() {
    logout()
    navigate({ to: '/login' })
  }

  const sessionAge = sessionInfo
    ? Math.floor((Date.now() - sessionInfo.loginAt) / 60000)
    : 0

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-2 text-sm">
          {portalConfig && (
            <>
              <span className="text-muted text-xs font-medium">{portalConfig.tenantShort}</span>
              <span className="text-muted">/</span>
            </>
          )}
          <span className="font-semibold text-slate-800">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch Portal button — only when inside a portal */}
          {portalConfig && (
            <button
              onClick={() => setSwitchOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-card transition-colors text-muted hover:text-slate-700"
            >
              <ArrowLeftRight size={12} />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>
          )}

          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 text-sm text-muted bg-surface border border-border rounded-lg px-3 py-1.5 hover:border-primary/30 transition-colors"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd className="text-xs bg-card border border-border rounded px-1">⌘K</kbd>
          </button>

          {/* Session security badge */}
          <div className="relative">
            <button
              onClick={() => setSecOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${
                mfaVerified
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
              }`}
              title="Session security info"
            >
              <ShieldCheck size={13} />
              <span className="hidden sm:inline">
                {mfaVerified ? 'MFA Verified' : 'No MFA'}
              </span>
              <Lock size={11} className="opacity-60" />
            </button>

            {secOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-xl shadow-xl z-50 p-4 text-xs"
                onMouseLeave={() => setSecOpen(false)}
              >
                <div className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-600" />
                  Session Security
                </div>
                <div className="space-y-2">
                  <Row label="MFA Status"   value={mfaVerified ? '✓ Verified (TOTP)' : '✗ Not verified'} ok={mfaVerified} />
                  <Row label="Encryption"   value={sessionInfo?.encryptionCipher ?? 'AES-256-GCM'} ok />
                  <Row label="Transport"    value={sessionInfo?.tlsVersion ?? 'TLS 1.3'} ok />
                  <Row label="Session ID"   value={sessionInfo ? sessionInfo.sessionId.slice(0, 16) + '…' : 'N/A'} ok={!!sessionInfo} mono />
                  <Row label="IP Address"   value={sessionInfo?.ip ?? 'N/A'} ok={!!sessionInfo} mono />
                  <Row label="Session Age"  value={`${sessionAge} min`} ok={sessionAge < 480} />
                  <Row label="Expires In"   value={sessionInfo ? `${Math.max(0, Math.floor((sessionInfo.expiresAt - Date.now()) / 60000))} min` : 'N/A'} ok={!!sessionInfo} />
                  <Row label="Data at Rest" value="AES-256 encrypted" ok />
                  <Row label="Audit Log"    value="All actions logged" ok />
                </div>
                <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted">
                  Compliant with Uganda Data Protection and Privacy Act, 2019
                </div>
              </div>
            )}
          </div>

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
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={portalConfig
                ? { background: portalConfig.accentColor + '22', borderColor: portalConfig.accentColor + '44', border: '1px solid' }
                : { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }
              }
            >
              <span className="text-xs font-bold" style={portalConfig ? { color: portalConfig.accentColor } : undefined}>
                {role ? role[0] : 'G'}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">{role ?? 'Guest'}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-muted hover:text-danger transition-colors rounded"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      {portalConfig && <PortalSwitcher open={switchOpen} onClose={() => setSwitchOpen(false)} />}
    </>
  )
}

function Row({ label, value, ok, mono }: { label: string; value: string; ok?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${ok ? 'text-green-700' : 'text-red-600'} ${mono ? 'font-mono text-[10px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
