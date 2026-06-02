import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalLiquidity() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-liquidity', tenantId],
    queryFn: () => tenantService.getBankLiquidity(tenantId),
  })
}
