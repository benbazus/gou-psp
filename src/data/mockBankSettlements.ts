export interface BankSettlement {
  id: string
  tenantId: string
  batchDate: string
  grossAmount: number
  netAmount: number
  transactionCount: number
  status: 'completed' | 'processing' | 'pending' | 'failed'
  type: 'inbound' | 'outbound'
  counterparty: string
  slaStatus: 'compliant' | 'breach' | 'warning'
  completedAt?: string
  failureReason?: string
}

const COUNTERPARTIES = ['Stanbic', 'Centenary', 'DFCU', 'Equity', 'Absa', 'HFB', 'BoA', 'MTN MoMo', 'Treasury', 'BOU']
const STATUSES: BankSettlement['status'][] = ['completed', 'completed', 'completed', 'processing', 'pending', 'failed']

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeBatchDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toISOString().slice(0, 10)
}

function generateSettlement(tenantId: string, idx: number): BankSettlement {
  const status = rnd(STATUSES)
  const gross = rndInt(500_000_000, 8_000_000_000)
  return {
    id: `BATCH-${tenantId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    tenantId,
    batchDate: makeBatchDate(rndInt(0, 14)),
    grossAmount: gross,
    netAmount: Math.floor(gross * 0.97),
    transactionCount: rndInt(200, 4000),
    status,
    type: idx % 2 === 0 ? 'inbound' : 'outbound',
    counterparty: rnd(COUNTERPARTIES.filter((c) => c.toLowerCase() !== tenantId)),
    slaStatus: status === 'failed' ? 'breach' : rnd(['compliant', 'compliant', 'compliant', 'warning']),
    completedAt: status === 'completed' ? `${makeBatchDate(rndInt(0, 14))} ${String(rndInt(8, 17)).padStart(2, '0')}:${String(rndInt(0, 59)).padStart(2, '0')}` : undefined,
    failureReason: status === 'failed' ? rnd(['Counterparty timeout', 'Insufficient liquidity', 'Validation error']) : undefined,
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankSettlements: BankSettlement[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 15 }, (_, i) => generateSettlement(tid, bankIdx * 15 + i))
)
