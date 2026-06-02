import { createContext, useContext } from 'react'
import type { PortalConfig } from '../types'

export const PortalConfigContext = createContext<PortalConfig | null>(null)

export function usePortalConfig(): PortalConfig {
  const ctx = useContext(PortalConfigContext)
  if (!ctx) throw new Error('usePortalConfig must be called inside a PortalShell')
  return ctx
}
