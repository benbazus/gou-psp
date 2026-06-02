import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalBankTransactions(direction?: 'incoming' | 'outgoing') {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-transactions', tenantId, direction],
    queryFn: () => tenantService.getBankTransactions(tenantId, direction),
  })
}
