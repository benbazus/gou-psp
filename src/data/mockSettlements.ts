import type { SettlementBatch, SettlementAccount } from '../types'

function settlementDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().split('T')[0]
}

export const mockSettlementBatches: SettlementBatch[] = [
  // Today — pending
  { id: 'BATCH-2026-0601-001', batchDate: settlementDate(0), participant: 'Stanbic Bank',      grossAmount: 8_400_000_000, netAmount: 8_376_000_000, transactionCount: 12400,  status: 'pending' },
  { id: 'BATCH-2026-0601-003', batchDate: settlementDate(0), participant: 'Centenary Bank',    grossAmount: 3_200_000_000, netAmount: 3_184_000_000, transactionCount: 7800,   status: 'pending' },
  { id: 'BATCH-2026-0601-006', batchDate: settlementDate(0), participant: 'Housing Finance',   grossAmount: 1_100_000_000, netAmount: 1_094_500_000, transactionCount: 2200,   status: 'pending' },
  { id: 'BATCH-2026-0601-007', batchDate: settlementDate(0), participant: 'Bank of Africa',    grossAmount: 980_000_000,  netAmount: 975_100_000,  transactionCount: 1900,   status: 'pending' },
  // Today — processing
  { id: 'BATCH-2026-0601-002', batchDate: settlementDate(0), participant: 'MTN Mobile Money',  grossAmount: 12_800_000_000, netAmount: 12_736_000_000, transactionCount: 380000, status: 'processing' },
  { id: 'BATCH-2026-0601-005', batchDate: settlementDate(0), participant: 'Absa Uganda',       grossAmount: 2_450_000_000, netAmount: 2_437_750_000, transactionCount: 5100,   status: 'processing' },
  // Yesterday — completed
  { id: 'BATCH-2026-0531-001', batchDate: settlementDate(1), participant: 'Stanbic Bank',      grossAmount: 7_900_000_000, netAmount: 7_861_500_000, transactionCount: 11200,  status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'BATCH-2026-0531-002', batchDate: settlementDate(1), participant: 'Airtel Money',      grossAmount: 7_200_000_000, netAmount: 7_164_000_000, transactionCount: 210000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 82800000).toISOString() },
  { id: 'BATCH-2026-0531-004', batchDate: settlementDate(1), participant: 'MTN Mobile Money',  grossAmount: 11_400_000_000, netAmount: 11_343_000_000, transactionCount: 340000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 79200000).toISOString() },
  { id: 'BATCH-2026-0531-005', batchDate: settlementDate(1), participant: 'Equity Bank',       grossAmount: 2_700_000_000, netAmount: 2_686_500_000, transactionCount: 5900,   status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 75600000).toISOString() },
  { id: 'BATCH-2026-0531-006', batchDate: settlementDate(1), participant: 'Centenary Bank',    grossAmount: 3_050_000_000, netAmount: 3_034_750_000, transactionCount: 7200,   status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 72000000).toISOString() },
  // Yesterday — failed
  { id: 'BATCH-2026-0531-003', batchDate: settlementDate(1), participant: 'DFCU Bank',         grossAmount: 1_900_000_000, netAmount: 1_890_500_000, transactionCount: 4200,   status: 'failed',    failureReason: 'API timeout during settlement confirmation — BOU gateway unresponsive for 45 min' },
  // 2 days ago — completed
  { id: 'BATCH-2026-0530-001', batchDate: settlementDate(2), participant: 'Stanbic Bank',      grossAmount: 8_100_000_000, netAmount: 8_059_500_000, transactionCount: 11800,  status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'BATCH-2026-0530-002', batchDate: settlementDate(2), participant: 'MTN Mobile Money',  grossAmount: 10_900_000_000, netAmount: 10_845_500_000, transactionCount: 325000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 169200000).toISOString() },
  { id: 'BATCH-2026-0530-003', batchDate: settlementDate(2), participant: 'Airtel Money',      grossAmount: 6_800_000_000, netAmount: 6_766_000_000, transactionCount: 198000, status: 'completed', approvedBy: 'Settlement Officer', completedAt: new Date(Date.now() - 165600000).toISOString() },
  { id: 'BATCH-2026-0530-004', batchDate: settlementDate(2), participant: 'Absa Uganda',       grossAmount: 2_200_000_000, netAmount: 2_189_000_000, transactionCount: 4800,   status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 162000000).toISOString() },
  // 2 days ago — rejected
  { id: 'BATCH-2026-0530-005', batchDate: settlementDate(2), participant: 'Housing Finance',   grossAmount: 820_000_000,  netAmount: 815_900_000,  transactionCount: 1600,   status: 'rejected',  failureReason: 'Reconciliation mismatch > 1% threshold — manual review required' },
]

export const mockSettlementAccounts: SettlementAccount[] = [
  // Treasury
  { participant: 'Consolidated Fund (Treasury)',   type: 'Treasury', accountNumber: 'BOU-TREAS-MAIN',      balance: 248_400_000_000, pendingInflow: 24_400_000_000, pendingOutflow: 0 },
  // Government Agency accounts
  { participant: 'URA — Revenue Collection',       type: 'Agency',   accountNumber: 'BOU-TREAS-001-URA',   balance: 89_400_000_000,  pendingInflow: 4_820_000_000,  pendingOutflow: 0 },
  { participant: 'NIRA — Civil Registration',      type: 'Agency',   accountNumber: 'BOU-TREAS-002-NIRA',  balance: 7_200_000_000,   pendingInflow: 380_000_000,    pendingOutflow: 0 },
  { participant: 'URSB — Business Reg.',           type: 'Agency',   accountNumber: 'BOU-TREAS-003-URSB',  balance: 2_100_000_000,   pendingInflow: 142_000_000,    pendingOutflow: 0 },
  { participant: 'KCCA — City Collections',        type: 'Agency',   accountNumber: 'BOU-TREAS-004-KCCA',  balance: 5_640_000_000,   pendingInflow: 620_000_000,    pendingOutflow: 0 },
  { participant: 'Uganda Police — Fines & Fees',   type: 'Agency',   accountNumber: 'BOU-TREAS-005-UPF',   balance: 880_000_000,     pendingInflow: 58_000_000,     pendingOutflow: 0 },
  { participant: 'Immigration — Passport & Visa',  type: 'Agency',   accountNumber: 'BOU-TREAS-006-IMM',   balance: 3_200_000_000,   pendingInflow: 210_000_000,    pendingOutflow: 0 },
  // Bank settlement accounts at BOU
  { participant: 'Stanbic Bank Uganda',            type: 'Bank',     accountNumber: 'BOU-STB-001',         balance: 12_400_000_000,  pendingInflow: 8_400_000_000,  pendingOutflow: 8_376_000_000 },
  { participant: 'MTN Mobile Money',               type: 'Bank',     accountNumber: 'BOU-MTN-001',         balance: 18_200_000_000,  pendingInflow: 12_800_000_000, pendingOutflow: 12_736_000_000 },
  { participant: 'Airtel Money Uganda',            type: 'Bank',     accountNumber: 'BOU-ATL-001',         balance: 9_400_000_000,   pendingInflow: 0,              pendingOutflow: 0 },
  { participant: 'Centenary Bank',                 type: 'Bank',     accountNumber: 'BOU-CEN-001',         balance: 4_800_000_000,   pendingInflow: 3_200_000_000,  pendingOutflow: 3_184_000_000 },
  { participant: 'DFCU Bank',                      type: 'Bank',     accountNumber: 'BOU-DFCU-001',        balance: 3_200_000_000,   pendingInflow: 0,              pendingOutflow: 0 },
  { participant: 'Equity Bank Uganda',             type: 'Bank',     accountNumber: 'BOU-EQT-001',         balance: 2_900_000_000,   pendingInflow: 0,              pendingOutflow: 0 },
  { participant: 'Absa Uganda',                    type: 'Bank',     accountNumber: 'BOU-ABSA-001',        balance: 3_800_000_000,   pendingInflow: 2_450_000_000,  pendingOutflow: 2_437_750_000 },
]
