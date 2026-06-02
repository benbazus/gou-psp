import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalQueue() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-queue', tenantId],
    queryFn: () => tenantService.getBankQueue(tenantId),
  })
}

export function usePortalExceptions() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-exceptions', tenantId],
    queryFn: () => tenantService.getBankExceptions(tenantId),
  })
}
