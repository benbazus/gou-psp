import type { ReconRecord, ReconRun } from '../types'

const AGENCIES  = ['URA', 'NIRA', 'URSB', 'KCCA', 'Uganda Police', 'Immigration']
const PAYERS    = ['Nakato Sarah', 'Ochieng David', 'Tumusiime Robert', 'Akello Grace', 'Ssemwogerere Paul',
                   'Nabukenya Aisha', 'Byaruhanga John', 'Kemigisha Diana', 'Mugisha Peter', 'Nalubega Ruth',
                   'Lutalo Emmanuel', 'Namukasa Joyce', 'Kasozi Charles', 'Birungi Esther', 'Wandera Moses']
const CHANNELS: import('../types').Channel[] = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD']
const DATE      = '2026-06-01'

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function amt(min: number, max: number) { return Math.round((min + Math.random() * (max - min)) / 1000) * 1000 }
function txnId(n: number) { return `TXN-2026-${String(n).padStart(5, '0')}` }

let seq = 1
function rec(overrides: Partial<ReconRecord>): ReconRecord {
  const id = `REC-${String(seq).padStart(4, '0')}`
  seq++
  const base: ReconRecord = {
    id,
    transactionId: txnId(seq + 1000),
    payer:         pick(PAYERS),
    payee:         pick(AGENCIES),
    agency:        pick(AGENCIES),
    channel:       pick(CHANNELS),
    amount:        amt(50_000, 2_000_000),
    source:        'switch',
    referenceDate: DATE,
    status:        'matched',
  }
  return { ...base, ...overrides }
}

// ─── Switch-side records (200 total) ──────────────────────
export const switchRecords: ReconRecord[] = [
  // 180 matched
  ...Array.from({ length: 180 }, (_, i) => rec({ source: 'switch', status: 'matched', transactionId: txnId(i + 1) })),
  // 12 unmatched (agency didn't confirm)
  ...Array.from({ length: 12 }, (_, i) => rec({ source: 'switch', status: 'unmatched', exceptionType: 'unmatched', transactionId: txnId(i + 181) })),
  // 5 duplicate
  ...Array.from({ length: 5 }, (_, i) => {
    const a = amt(100_000, 500_000)
    return rec({ source: 'switch', status: 'exception', exceptionType: 'duplicate', transactionId: txnId(i + 193), amount: a })
  }),
  // 3 resolved
  ...Array.from({ length: 3 }, (_, i) => rec({ source: 'switch', status: 'resolved', transactionId: txnId(i + 198), resolvedAt: '2026-06-01T08:30:00Z', resolvedBy: 'Treasury Officer', resolutionNote: 'Manually verified with agency — confirmed' })),
]

// ─── Agency-side records ───────────────────────────────────
export const agencyRecords: ReconRecord[] = [
  // 180 matched
  ...Array.from({ length: 180 }, (_, i) => rec({ source: 'agency', status: 'matched', transactionId: txnId(i + 1) })),
  // 8 missing confirmations (agency received but didn't ack)
  ...Array.from({ length: 8 }, () => {
    const a = amt(100_000, 800_000)
    return rec({ source: 'agency', status: 'unmatched', exceptionType: 'missing_confirmation', amount: a, switchAmount: a })
  }),
  // 4 overpayments
  ...Array.from({ length: 4 }, () => {
    const s = amt(200_000, 1_000_000)
    const r = Math.round(s * 1.05)
    return rec({ source: 'agency', status: 'exception', exceptionType: 'overpayment', switchAmount: s, reportedAmount: r, variance: r - s, amount: r })
  }),
  // 4 underpayments
  ...Array.from({ length: 4 }, () => {
    const s = amt(200_000, 1_000_000)
    const r = Math.round(s * 0.97)
    return rec({ source: 'agency', status: 'exception', exceptionType: 'underpayment', switchAmount: s, reportedAmount: r, variance: s - r, amount: s })
  }),
]

// ─── Bank/MNO-side records ─────────────────────────────────
export const bankRecords: ReconRecord[] = [
  ...Array.from({ length: 175 }, (_, i) => rec({ source: 'bank', status: 'matched',   transactionId: txnId(i + 1),   channel: pick(['MTN Mobile Money', 'Airtel Money', 'Bank Transfer'] as import('../types').Channel[]) })),
  ...Array.from({ length: 10 }, ()      => rec({ source: 'bank', status: 'unmatched', exceptionType: 'unmatched',     channel: pick(['MTN Mobile Money', 'Airtel Money', 'Bank Transfer'] as import('../types').Channel[]) })),
  ...Array.from({ length: 3 }, ()       => {
    const s = amt(50_000, 400_000)
    const r = Math.round(s * 1.02)
    return rec({ source: 'bank', status: 'exception', exceptionType: 'overpayment', switchAmount: s, reportedAmount: r, variance: r - s, amount: r, channel: 'Bank Transfer' })
  }),
  ...Array.from({ length: 2 }, ()       => rec({ source: 'bank', status: 'exception', exceptionType: 'duplicate', channel: 'MTN Mobile Money' })),
]

// ─── Treasury records ──────────────────────────────────────
export const treasuryRecords: ReconRecord[] = [
  ...Array.from({ length: 50 }, (_, i) => rec({ source: 'treasury', status: 'matched',   transactionId: txnId(i + 1),   agency: pick(['URA', 'NIRA', 'KCCA']) })),
  ...Array.from({ length: 3 }, ()       => rec({ source: 'treasury', status: 'unmatched', exceptionType: 'missing_confirmation', agency: 'URA' })),
  ...Array.from({ length: 2 }, ()       => {
    const s = amt(5_000_000, 50_000_000)
    const r = Math.round(s * 1.001)
    return rec({ source: 'treasury', status: 'exception', exceptionType: 'overpayment', switchAmount: s, reportedAmount: r, variance: r - s, amount: r, agency: pick(['URA', 'KCCA']) })
  }),
]

// ─── Latest recon run summary ──────────────────────────────
export const latestReconRun: ReconRun = {
  id:                   'RECON-2026-0601-001',
  triggeredBy:          'Treasury Officer',
  startedAt:            '2026-06-01T06:00:00Z',
  completedAt:          '2026-06-01T06:04:37Z',
  totalSwitch:          200,
  totalAgency:          196,
  totalBank:            190,
  totalTreasury:        55,
  matched:              180,
  unmatched:            12,
  duplicates:           5,
  missingConfirmations: 8,
  overpayments:         4,
  underpayments:        4,
  matchRate:            97.4,
}

// ─── 14-day trend ─────────────────────────────────────────
export const matchRateTrend = Array.from({ length: 14 }, (_, i) => ({
  day:       `Jun ${String(i + 1).padStart(2, '0')}`,
  matched:   +(93 + Math.random() * 5).toFixed(1),
  unmatched: +(0.5 + Math.random() * 2).toFixed(1),
  exception: +(0.3 + Math.random() * 1).toFixed(1),
}))
