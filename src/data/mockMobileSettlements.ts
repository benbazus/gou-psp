// src/data/mockMobileSettlements.ts
import type { MobileSettlement } from '../types'

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeBatchDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toISOString().slice(0, 10)
}

const STATUSES: MobileSettlement['status'][] = ['completed', 'completed', 'completed', 'processing', 'pending', 'failed']

function generateSettlement(operatorId: string, idx: number): MobileSettlement {
  const status = rnd(STATUSES)
  const gross = rndInt(500_000_000, 8_000_000_000)
  const fee   = Math.floor(gross * 0.003)
  const batchDate = makeBatchDate(rndInt(0, 10))
  return {
    id: `MOBSET-${operatorId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    operatorId,
    batchRef: `MREF-${operatorId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    batchDate,
    grossAmount: gross,
    netAmount: gross - fee,
    fee,
    transactionCount: rndInt(5_000, 80_000),
    status,
    settledAt: status === 'completed'
      ? `${batchDate} ${String(rndInt(8, 17)).padStart(2, '0')}:${String(rndInt(0, 59)).padStart(2, '0')}`
      : undefined,
    slaStatus: status === 'failed' ? 'breach' : rnd(['compliant', 'compliant', 'compliant', 'warning']),
  }
}

export const mockMobileSettlements: MobileSettlement[] = ['mtn', 'airtel'].flatMap((opId, opIdx) =>
  Array.from({ length: 10 }, (_, i) => generateSettlement(opId, opIdx * 10 + i))
)
