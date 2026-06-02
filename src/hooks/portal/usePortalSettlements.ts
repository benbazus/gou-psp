import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalSettlements() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-settlements', tenantId],
    queryFn: () => tenantService.getBankSettlements(tenantId),
  })
}
