// src/data/mockMobileTransactions.ts
import type { MobileTransaction } from '../types'

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad2(n: number): string { return String(n).padStart(2, '0') }

function makeTimestamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3_600_000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const TYPES: MobileTransaction['type'][] = ['b2c', 'c2b', 'p2p', 'airtime', 'bill_payment', 'b2c', 'c2b', 'p2p']
const CHANNELS: MobileTransaction['channel'][] = ['USSD', 'App', 'Agent', 'USSD', 'USSD']
const STATUSES: MobileTransaction['status'][] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed']

const NAMES = [
  'Kizza Joel', 'Namukasa Faith', 'Ssali Rogers', 'Apio Christine', 'Musoke Brian',
  'Nakawuki Linda', 'Bwire Eric', 'Atim Sandra', 'Mugisha Patrick', 'Nabirye Proscovia',
]

function typeToFee(type: MobileTransaction['type'], amount: number): number {
  if (type === 'airtime') return 0
  if (type === 'p2p') return Math.min(Math.floor(amount * 0.01), 10_000)
  if (type === 'c2b' || type === 'bill_payment') return 500
  return Math.min(Math.floor(amount * 0.005), 20_000)
}

function generateTxn(operatorId: string, idx: number): MobileTransaction {
  const type = rnd(TYPES)
  const amount = type === 'airtime' ? rnd([1_000, 2_000, 5_000, 10_000, 20_000]) : rndInt(2_000, 5_000_000)
  const status = rnd(STATUSES)
  return {
    id: `MOB-${operatorId.toUpperCase()}-${String(idx).padStart(4, '0')}`,
    operatorId,
    amount,
    sender: rnd(NAMES),
    receiver: type === 'c2b' || type === 'bill_payment' ? rnd(['URA', 'NIRA', 'KCCA', 'Stanbic Bank', 'Centenary Bank']) : rnd(NAMES),
    type,
    channel: rnd(CHANNELS),
    status,
    reference: `MREF${Date.now().toString().slice(-8)}${idx}`,
    timestamp: makeTimestamp(rndInt(0, 48)),
    fee: typeToFee(type, amount),
    failureReason: status === 'failed' ? rnd(['Insufficient float', 'Account not registered', 'Timeout', 'System error']) : undefined,
  }
}

export const mockMobileTransactions: MobileTransaction[] = ['mtn', 'airtel'].flatMap((opId, opIdx) =>
  Array.from({ length: 40 }, (_, i) => generateTxn(opId, opIdx * 40 + i))
)
