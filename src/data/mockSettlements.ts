import type { SettlementBatch, SettlementAccount } from '../types'

function settlementDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().split('T')[0]
}

export const mockSettlementBatches: SettlementBatch[] = [
  { id: 'BATCH-2026-0601-001', batchDate: settlementDate(0), participant: 'Stanbic Bank', grossAmount: 8_400_000_000, netAmount: 8_376_000_000, transactionCount: 12400, status: 'pending' },
  { id: 'BATCH-2026-0601-002', batchDate: settlementDate(0), participant: 'MTN Mobile Money', grossAmount: 12_800_000_000, netAmount: 12_736_000_000, transactionCount: 380000, status: 'processing' },
  { id: 'BATCH-2026-0601-003', batchDate: settlementDate(0), participant: 'Centenary Bank', grossAmount: 3_200_000_000, netAmount: 3_184_000_000, transactionCount: 7800, status: 'pending' },
  { id: 'BATCH-2026-0531-001', batchDate: settlementDate(1), participant: 'Stanbic Bank', grossAmount: 7_900_000_000, netAmount: 7_861_500_000, transactionCount: 11200, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'BATCH-2026-0531-002', batchDate: settlementDate(1), participant: 'Airtel Money', grossAmount: 7_200_000_000, netAmount: 7_164_000_000, transactionCount: 210000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 82800000).toISOString() },
  { id: 'BATCH-2026-0531-003', batchDate: settlementDate(1), participant: 'DFCU Bank', grossAmount: 1_900_000_000, netAmount: 1_890_500_000, transactionCount: 4200, status: 'failed', failureReason: 'API timeout during settlement confirmation' },
  { id: 'BATCH-2026-0530-001', batchDate: settlementDate(2), participant: 'Equity Bank', grossAmount: 2_700_000_000, netAmount: 2_686_500_000, transactionCount: 5900, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'BATCH-2026-0530-002', batchDate: settlementDate(2), participant: 'MTN Mobile Money', grossAmount: 11_400_000_000, netAmount: 11_343_000_000, transactionCount: 340000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 169200000).toISOString() },
]

export const mockSettlementAccounts: SettlementAccount[] = [
  { participant: 'Treasury (Consolidated Fund)', type: 'Treasury', accountNumber: 'BOU-TREAS-MAIN', balance: 248_400_000_000, pendingInflow: 24_400_000_000, pendingOutflow: 0 },
  { participant: 'URA Settlement', type: 'Agency', accountNumber: 'BOU-TREAS-001-URA', balance: 89_400_000_000, pendingInflow: 4_820_000_000, pendingOutflow: 0 },
  { participant: 'NIRA Settlement', type: 'Agency', accountNumber: 'BOU-TREAS-002-NIRA', balance: 7_200_000_000, pendingInflow: 380_000_000, pendingOutflow: 0 },
  { participant: 'Stanbic Bank', type: 'Bank', accountNumber: 'BOU-STB-001', balance: 12_400_000_000, pendingInflow: 8_400_000_000, pendingOutflow: 8_376_000_000 },
  { participant: 'MTN Mobile Money', type: 'Bank', accountNumber: 'BOU-MTN-001', balance: 18_200_000_000, pendingInflow: 12_800_000_000, pendingOutflow: 12_736_000_000 },
]
