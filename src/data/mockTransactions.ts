import type { Transaction, Channel, Region, Status } from '../types'

const PAYERS = [
  'Mugisha Robert', 'Namutebi Grace', 'Okello James', 'Nakato Fatuma',
  'Ssekandi Paul', 'Nansubuga Doreen', 'Oryem Moses', 'Akello Sarah',
  'Byamukama Denis', 'Namugga Ritah', 'Tumukunde Frank', 'Akullo Betty',
  'Ssentongo Richard', 'Nabwire Joyce', 'Olweny Peter', 'Nabirye Esther',
]

const CHANNELS: Channel[] = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD']
const REGIONS: Region[] = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Mbale', 'Arua', 'Fort Portal', 'Masaka']
const STATUSES: Status[] = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'failed', 'pending', 'processing', 'reversed']

const SERVICES = [
  { agency: 'URA', service: 'Income Tax', amounts: [500000, 1200000, 4500000, 280000] },
  { agency: 'URA', service: 'PAYE', amounts: [2800000, 5600000, 890000] },
  { agency: 'NIRA', service: 'Passport', amounts: [250000] },
  { agency: 'NIRA', service: 'National ID', amounts: [5000] },
  { agency: 'MOW', service: 'Driving License', amounts: [80000] },
  { agency: 'MOW', service: 'Vehicle Registration', amounts: [200000, 350000] },
  { agency: 'MOL', service: 'Land Search', amounts: [50000] },
  { agency: 'MOL', service: 'Land Transfer', amounts: [200000, 500000] },
  { agency: 'UPF', service: 'Court Fine', amounts: [50000, 100000, 200000] },
  { agency: 'URSB', service: 'Business Registration', amounts: [100000, 250000] },
  { agency: 'KCCA', service: 'Business Permit', amounts: [200000, 400000, 800000] },
  { agency: 'IMM', service: 'Visa Application', amounts: [120000, 240000] },
]

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): string {
  const d = new Date()
  d.setTime(d.getTime() - Math.random() * daysBack * 86400000)
  return d.toISOString()
}

function buildTransactions(): Transaction[] {
  return Array.from({ length: 500 }, (_, i) => {
    const svc = randomItem(SERVICES)
    const amount = randomItem(svc.amounts)
    const status = randomItem(STATUSES)
    return {
      id: `TXN-2026-${String(100000 + i).slice(1)}`,
      tenantId: 'national',
      amount,
      payer: randomItem(PAYERS),
      payee: svc.agency,
      agency: svc.agency,
      service: svc.service,
      channel: randomItem(CHANNELS),
      status,
      region: randomItem(REGIONS),
      prn: `PRN2026${String(100000 + i).slice(1)}`,
      timestamp: randomDate(30),
      processingTime: 100 + Math.floor(Math.random() * 800),
      failureReason: status === 'failed' ? randomItem([
        'Insufficient funds', 'Network timeout', 'Invalid PRN', 'Bank API unavailable',
      ] as const) : undefined,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const mockTransactions: Transaction[] = buildTransactions()
