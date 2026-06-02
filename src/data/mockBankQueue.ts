export interface BankQueueEntry {
  id: string
  tenantId: string
  instructionRef: string
  amount: number
  counterparty: string
  type: 'credit' | 'debit'
  priority: 'urgent' | 'normal' | 'low'
  status: 'queued' | 'processing' | 'settled' | 'rejected' | 'on_hold'
  submittedAt: string
  settlementWindow: string
  slaMinutes: number
  elapsedMinutes: number
}

const COUNTERPARTIES = ['BOU', 'Stanbic', 'Centenary', 'DFCU', 'Equity', 'Absa', 'HFB', 'BoA', 'Treasury']
const PRIORITIES: BankQueueEntry['priority'][] = ['urgent', 'normal', 'normal', 'normal', 'low']
const STATUSES: BankQueueEntry['status'][] = ['queued', 'queued', 'processing', 'settled', 'settled', 'rejected', 'on_hold']

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeTime(minAgo: number): string {
  const d = new Date(Date.now() - minAgo * 60_000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function generateEntry(tenantId: string, idx: number): BankQueueEntry {
  const sla = rndInt(15, 120)
  const elapsed = rndInt(0, sla + 20)
  return {
    id: `Q-${tenantId.toUpperCase()}-${String(idx).padStart(4, '0')}`,
    tenantId,
    instructionRef: `RTGS-${tenantId.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}${idx}`,
    amount: rndInt(10_000_000, 500_000_000),
    counterparty: rnd(COUNTERPARTIES.filter((c) => c.toLowerCase() !== tenantId)),
    type: idx % 2 === 0 ? 'credit' : 'debit',
    priority: rnd(PRIORITIES),
    status: rnd(STATUSES),
    submittedAt: makeTime(elapsed),
    settlementWindow: rnd(['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00']),
    slaMinutes: sla,
    elapsedMinutes: elapsed,
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankQueue: BankQueueEntry[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 20 }, (_, i) => generateEntry(tid, bankIdx * 20 + i))
)
