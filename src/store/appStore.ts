import { create } from 'zustand'
import type { Role, Toast, ToastVariant, Transaction, MfaChallenge, SessionInfo, SecurityEvent, SecurityEventType, PortalType } from '../types'

function mockIp() {
  return `196.43.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}`
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

interface AppState {
  // ─── Auth ─────────────────────────────────────────────
  activeRole: Role | null
  setRole: (role: Role) => void

  // ─── Portal / Tenant ──────────────────────────────
  activePortal: PortalType | null
  activeTenant: string | null
  setPortal: (portalType: PortalType, tenantId: string, role: Role) => void

  // ─── MFA ──────────────────────────────────────────────
  mfaChallenge: MfaChallenge | null
  mfaVerified: boolean
  sessionInfo: SessionInfo | null
  startMfaChallenge: (role: Role) => MfaChallenge
  verifyMfa: (code: string) => boolean
  logout: () => void

  // ─── Security Events (live audit) ─────────────────────
  securityEvents: SecurityEvent[]
  pushSecurityEvent: (type: SecurityEventType, detail: string, resource?: string) => void

  // ─── Sidebar ──────────────────────────────────────────
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // ─── Toasts ───────────────────────────────────────────
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant) => void
  removeToast: (id: string) => void

  // ─── Live transactions (rolling buffer, max 50) ────────
  liveTransactions: Transaction[]
  pushTransaction: (tx: Transaction) => void

  // ─── Notifications ────────────────────────────────────
  notificationsRead: boolean
  markNotificationsRead: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // ─── Auth ─────────────────────────────────────────────
  activeRole: (localStorage.getItem('govpay_role') as Role | null) ?? null,
  setRole: (role) => {
    localStorage.setItem('govpay_role', role)
    set({ activeRole: role })
  },

  // ─── Portal / Tenant ──────────────────────────────
  activePortal: (localStorage.getItem('govpay_portal') as PortalType | null) ?? null,
  activeTenant: localStorage.getItem('govpay_tenant') ?? null,

  setPortal: (portalType, tenantId, role) => {
    localStorage.setItem('govpay_portal', portalType)
    localStorage.setItem('govpay_tenant', tenantId)
    localStorage.setItem('govpay_role', role)
    set({ activePortal: portalType, activeTenant: tenantId, activeRole: role })
  },

  // ─── MFA ──────────────────────────────────────────────
  mfaChallenge: null,
  mfaVerified: (localStorage.getItem('govpay_mfa') === '1'),
  sessionInfo: (() => {
    try { return JSON.parse(localStorage.getItem('govpay_session') ?? 'null') } catch { return null }
  })(),

  startMfaChallenge: (_role) => {
    const challenge: MfaChallenge = {
      code: generateOtp(),
      method: 'totp',
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    }
    set({ mfaChallenge: challenge, mfaVerified: false })
    return challenge
  },

  verifyMfa: (code) => {
    const { mfaChallenge, activeRole } = get()
    if (!mfaChallenge || !activeRole) return false
    if (Date.now() > mfaChallenge.expiresAt) {
      set({ mfaChallenge: null })
      return false
    }
    set((s) => ({
      mfaChallenge: s.mfaChallenge
        ? { ...s.mfaChallenge, attempts: s.mfaChallenge.attempts + 1 }
        : null,
    }))
    if (code === mfaChallenge.code) {
      const session: SessionInfo = {
        role: activeRole,
        loginAt: Date.now(),
        mfaVerifiedAt: Date.now(),
        sessionId: crypto.randomUUID(),
        ip: mockIp(),
        tlsVersion: 'TLS 1.3',
        encryptionCipher: 'AES-256-GCM',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      }
      localStorage.setItem('govpay_mfa', '1')
      localStorage.setItem('govpay_session', JSON.stringify(session))
      set({ mfaVerified: true, sessionInfo: session, mfaChallenge: null })
      get().pushSecurityEvent('MFA_VERIFIED', `MFA verified for ${activeRole}`)
      get().pushSecurityEvent('LOGIN', `Session started`, session.sessionId)
      return true
    }
    get().pushSecurityEvent('MFA_FAILED', `MFA attempt failed for ${activeRole}`)
    return false
  },

  logout: () => {
    get().pushSecurityEvent('LOGOUT', `Session ended`)
    localStorage.removeItem('govpay_role')
    localStorage.removeItem('govpay_mfa')
    localStorage.removeItem('govpay_session')
    localStorage.removeItem('govpay_portal')
    localStorage.removeItem('govpay_tenant')
    set({ activeRole: null, mfaVerified: false, mfaChallenge: null, sessionInfo: null, activePortal: null, activeTenant: null })
  },

  // ─── Security Events ──────────────────────────────────
  securityEvents: [],
  pushSecurityEvent: (type, detail, resource) => {
    const { activeRole, sessionInfo } = get()
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      actor: activeRole ?? 'System',
      role: (activeRole ?? 'Super Admin') as Role,
      resource,
      detail,
      timestamp: Date.now(),
      ip: sessionInfo?.ip ?? mockIp(),
      sessionId: sessionInfo?.sessionId ?? 'N/A',
    }
    set((s) => ({ securityEvents: [event, ...s.securityEvents].slice(0, 200) }))
  },

  // ─── Sidebar ──────────────────────────────────────────
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ─── Toasts ───────────────────────────────────────────
  toasts: [],
  addToast: (message, variant) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: crypto.randomUUID(), message, variant, createdAt: Date.now() },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ─── Live transactions ────────────────────────────────
  liveTransactions: [],
  pushTransaction: (tx) =>
    set((s) => ({
      liveTransactions: [tx, ...s.liveTransactions].slice(0, 50),
      notificationsRead: false,
    })),

  // ─── Notifications ────────────────────────────────────
  notificationsRead: false,
  markNotificationsRead: () => set({ notificationsRead: true }),
}))
