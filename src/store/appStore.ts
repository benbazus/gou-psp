import { create } from 'zustand'
import type { Role, Toast, ToastVariant, Transaction } from '../types'

interface AppState {
  // Auth
  activeRole: Role | null
  setRole: (role: Role) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Toasts
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant) => void
  removeToast: (id: string) => void

  // Live transactions (rolling buffer, max 50)
  liveTransactions: Transaction[]
  pushTransaction: (tx: Transaction) => void

  // Notifications
  notificationsRead: boolean
  markNotificationsRead: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeRole: (localStorage.getItem('govpay_role') as Role | null) ?? null,
  setRole: (role) => {
    localStorage.setItem('govpay_role', role)
    set({ activeRole: role })
  },

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

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

  liveTransactions: [],
  pushTransaction: (tx) =>
    set((s) => ({
      liveTransactions: [tx, ...s.liveTransactions].slice(0, 50),
      notificationsRead: false,
    })),

  notificationsRead: false,
  markNotificationsRead: () => set({ notificationsRead: true }),
}))
