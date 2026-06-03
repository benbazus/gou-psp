// src/data/mockAgencySettlements.ts
import type { AgencySettlement } from '../types'

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeBatchDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toISOString().slice(0, 10)
}

const STATUSES: AgencySettlement['status'][] = ['completed', 'completed', 'completed', 'processing', 'pending', 'failed']

function generateSettlement(agencyId: string, idx: number): AgencySettlement {
  const status = rnd(STATUSES)
  const gross = rndInt(50_000_000, 2_000_000_000)
  const fee   = Math.floor(gross * 0.005)
  const batchDate = makeBatchDate(rndInt(0, 14))
  return {
    id: `AGSET-${agencyId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    agencyId,
    batchRef: `BREF-${agencyId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    batchDate,
    grossAmount: gross,
    netAmount: gross - fee,
    fee,
    transactionCount: rndInt(50, 2_000),
    status,
    settledAt: status === 'completed'
      ? `${batchDate} ${String(rndInt(8, 17)).padStart(2, '0')}:${String(rndInt(0, 59)).padStart(2, '0')}`
      : undefined,
    slaStatus: status === 'failed' ? 'breach' : rnd(['compliant', 'compliant', 'compliant', 'warning']),
  }
}

const AGENCY_IDS = ['ura', 'nira', 'ursb', 'mol', 'upf', 'imm', 'kcca']

export const mockAgencySettlements: AgencySettlement[] = AGENCY_IDS.flatMap((aid, agIdx) =>
  Array.from({ length: 7 }, (_, i) => generateSettlement(aid, agIdx * 7 + i))
)
