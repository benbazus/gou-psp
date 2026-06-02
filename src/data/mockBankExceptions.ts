export interface BankException {
  id: string
  tenantId: string
  instructionRef: string
  amount: number
  counterparty: string
  type: 'failed_settlement' | 'rejected_instruction' | 'duplicate' | 'timeout' | 'insufficient_liquidity'
  reason: string
  severity: 'critical' | 'high' | 'medium'
  status: 'open' | 'investigating' | 'resolved' | 'escalated'
  raisedAt: string
  slaDue: string
  assignedTo?: string
}

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

const TYPES: BankException['type'][] = ['failed_settlement', 'rejected_instruction', 'duplicate', 'timeout', 'insufficient_liquidity']
const REASONS: Record<BankException['type'], string[]> = {
  failed_settlement:        ['Settlement window expired', 'Counterparty offline', 'Account frozen'],
  rejected_instruction:     ['Invalid BIC code', 'Amount exceeds limit', 'Missing mandatory field'],
  duplicate:                ['Duplicate instruction reference', 'Same amount within 5 minutes'],
  timeout:                  ['RTGS engine timeout', 'Network timeout after 3 retries'],
  insufficient_liquidity:   ['Available balance below threshold', 'Reserve requirement not met'],
}
const STATUSES: BankException['status'][] = ['open', 'open', 'investigating', 'resolved', 'escalated']
const ASSIGNEES = ['Aisha Kamara', 'Robert Okello', 'Diana Nambooze', 'Moses Opio', undefined]

function makeTS(minsAgo: number): string {
  const d = new Date(Date.now() - minsAgo * 60_000)
  return `${d.toISOString().slice(0, 10)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function generateException(tenantId: string, idx: number): BankException {
  const type = rnd(TYPES)
  const raisedMinsAgo = rndInt(5, 480)
  return {
    id: `EXC-${tenantId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    tenantId,
    instructionRef: `RTGS-${tenantId.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-5)}${idx}`,
    amount: rndInt(5_000_000, 300_000_000),
    counterparty: rnd(['BOU', 'Stanbic', 'Centenary', 'DFCU', 'Equity', 'Treasury'].filter((c) => c.toLowerCase() !== tenantId)),
    type,
    reason: rnd(REASONS[type]),
    severity: rnd(['critical', 'high', 'high', 'medium', 'medium'] as BankException['severity'][]),
    status: rnd(STATUSES),
    raisedAt: makeTS(raisedMinsAgo),
    slaDue: makeTS(raisedMinsAgo - rndInt(30, 120)),
    assignedTo: rnd(ASSIGNEES),
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankExceptions: BankException[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 10 }, (_, i) => generateException(tid, bankIdx * 10 + i))
)
