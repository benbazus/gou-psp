import type { Channel, Region, Status } from '../types'

export interface BankTransaction {
  id: string
  tenantId: string
  direction: 'incoming' | 'outgoing'
  amount: number
  payer: string
  payee: string
  channel: Channel
  status: Status
  region: Region
  reference: string
  timestamp: string
  processingTime: number
  failureReason?: string
}

const CHANNELS: Channel[] = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD']
const REGIONS: Region[] = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Mbale', 'Arua']
const STATUSES: Status[] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed', 'processing']
const BANK_NAMES = ['Stanbic', 'Centenary', 'DFCU', 'Equity', 'Absa', 'HFB', 'BoA', 'MTN MoMo', 'Airtel Money', 'Treasury']

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad2(n: number): string { return String(n).padStart(2, '0') }

function makeTimestamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3_600_000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function generateTxn(tenantId: string, idx: number): BankTransaction {
  const dir = idx % 3 === 0 ? 'outgoing' : 'incoming'
  const status = rnd(STATUSES)
  return {
    id: `TXN-${tenantId.toUpperCase()}-${String(idx).padStart(4, '0')}`,
    tenantId,
    direction: dir,
    amount: rndInt(50_000, 95_000_000),
    payer: dir === 'incoming' ? rnd(BANK_NAMES) : tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
    payee: dir === 'outgoing' ? rnd(BANK_NAMES) : tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
    channel: rnd(CHANNELS),
    status,
    region: rnd(REGIONS),
    reference: `REF${Date.now().toString().slice(-8)}${idx}`,
    timestamp: makeTimestamp(rndInt(0, 72)),
    processingTime: rndInt(80, 2500),
    failureReason: status === 'failed' ? rnd(['Insufficient funds', 'Account suspended', 'Timeout', 'Invalid account']) : undefined,
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankTransactions: BankTransaction[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 30 }, (_, i) => generateTxn(tid, bankIdx * 30 + i))
)
