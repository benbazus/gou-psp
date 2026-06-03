// src/data/mockTreasuryData.ts
import type {
  TreasuryDisbursement, TreasuryApproval, TreasuryAccount,
  TreasuryCommitment, ConsolidatedFundEntry,
} from '../types'

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toISOString().slice(0, 10)
}
function makeDateTime(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000 - rndInt(0, 8) * 3_600_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Disbursements ────────────────────────────────────────────────────────────
const VOTE_CODES = ['3100', '3110', '4001', '4010', '5000', '5200', '6001', '7001', '7010', '8000']
const MINISTRY_LINES = [
  'Ministry of Education',
  'Ministry of Health',
  'Ministry of Works & Transport',
  'Ministry of Agriculture',
  'Ministry of Defence',
  'Office of the President',
  'Ministry of Finance Planning',
  'Ministry of Internal Affairs',
  'Ministry of Energy',
  'Ministry of Lands',
]
const BANKS = ['Stanbic Bank Uganda', 'Centenary Bank', 'DFCU Bank', 'Bank of Uganda']
const PAYEES = [
  'National Medical Stores', 'Uganda National Roads Authority', 'NSSF Uganda',
  'Makerere University', 'Uganda Revenue Authority', 'National Water & Sewerage',
  'Rural Electrification Agency', 'Pharmacy Board of Uganda', 'Pader District Local Government',
  'Uganda Police Force HQ',
]

const DISB_STATUSES: TreasuryDisbursement['status'][] = [
  'completed', 'completed', 'completed',
  'pending_approval', 'pending_approval',
  'approved', 'processing', 'rejected',
]

export const mockTreasuryDisbursements: TreasuryDisbursement[] = Array.from({ length: 40 }, (_, i) => {
  const status = rnd(DISB_STATUSES)
  const voteCode = rnd(VOTE_CODES)
  const ministryLine = MINISTRY_LINES[VOTE_CODES.indexOf(voteCode)]
  const daysAgo = rndInt(0, 14)
  return {
    id: `TDISB-${String(i).padStart(3, '0')}`,
    reference: `TREF-2026-${String(i + 1000).padStart(5, '0')}`,
    amount: rndInt(5_000_000, 2_000_000_000),
    payee: rnd(PAYEES),
    bank: rnd(BANKS),
    accountNumber: `BOU-${voteCode}-${String(rndInt(1000, 9999))}`,
    voteCode,
    ministryLine,
    description: `${rnd(['Salary disbursement', 'Capital expenditure', 'Recurrent expenditure', 'Grant transfer', 'Contractor payment'])} — Q${rndInt(1, 4)} FY 2025/26`,
    status,
    requestedBy: rnd(['Namukasa F.', 'Okello D.', 'Mugisha A.', 'Ssali R.']),
    requestedAt: makeDateTime(daysAgo + 2),
    approvedBy: ['approved', 'processing', 'completed'].includes(status) ? rnd(['Hon. Kasaija M.', 'Dr. Mutebile E.']) : undefined,
    approvedAt: ['approved', 'processing', 'completed'].includes(status) ? makeDateTime(daysAgo + 1) : undefined,
    processedAt: status === 'completed' ? makeDateTime(daysAgo) : undefined,
    priority: rnd(['urgent', 'normal', 'normal', 'normal', 'low'] as TreasuryDisbursement['priority'][]),
  }
})

// ─── Approvals queue (pending_approval items projected as TreasuryApproval) ──
export const mockTreasuryApprovals: TreasuryApproval[] = mockTreasuryDisbursements
  .filter((d) => d.status === 'pending_approval')
  .map((d) => ({
    id: `TAPPR-${d.id}`,
    disbursementId: d.id,
    reference: d.reference,
    amount: d.amount,
    payee: d.payee,
    voteCode: d.voteCode,
    ministryLine: d.ministryLine,
    description: d.description,
    requestedBy: d.requestedBy,
    requestedAt: d.requestedAt,
    priority: d.priority,
  }))

// ─── Treasury Accounts ────────────────────────────────────────────────────────
export const mockTreasuryAccounts: TreasuryAccount[] = [
  {
    id: 'TACC-001', bank: 'Bank of Uganda', accountNumber: 'BOU-CF-001',
    accountType: 'Consolidated Fund', currency: 'UGX',
    balance: 12_450_000_000_000, pendingDisbursements: 840_000_000_000,
    availableBalance: 11_610_000_000_000, lastUpdated: makeDateTime(0),
  },
  {
    id: 'TACC-002', bank: 'Bank of Uganda', accountNumber: 'BOU-CF-002',
    accountType: 'Consolidated Fund', currency: 'USD',
    balance: 48_500_000, pendingDisbursements: 2_100_000,
    availableBalance: 46_400_000, lastUpdated: makeDateTime(0),
  },
  {
    id: 'TACC-003', bank: 'Stanbic Bank Uganda', accountNumber: 'STB-SAL-001',
    accountType: 'Salary Account', currency: 'UGX',
    balance: 820_000_000_000, pendingDisbursements: 780_000_000_000,
    availableBalance: 40_000_000_000, lastUpdated: makeDateTime(0),
  },
  {
    id: 'TACC-004', bank: 'DFCU Bank', accountNumber: 'DFCU-DEV-001',
    accountType: 'Development Fund', currency: 'UGX',
    balance: 3_200_000_000_000, pendingDisbursements: 420_000_000_000,
    availableBalance: 2_780_000_000_000, lastUpdated: makeDateTime(0),
  },
  {
    id: 'TACC-005', bank: 'Centenary Bank', accountNumber: 'CEN-DON-001',
    accountType: 'Donor Fund', currency: 'EUR',
    balance: 12_800_000, pendingDisbursements: 800_000,
    availableBalance: 12_000_000, lastUpdated: makeDateTime(0),
  },
  {
    id: 'TACC-006', bank: 'Equity Bank Uganda', accountNumber: 'EQT-PC-001',
    accountType: 'Petty Cash', currency: 'UGX',
    balance: 5_000_000_000, pendingDisbursements: 200_000_000,
    availableBalance: 4_800_000_000, lastUpdated: makeDateTime(0),
  },
]

// ─── Budget Commitments ───────────────────────────────────────────────────────
export const mockTreasuryCommitments: TreasuryCommitment[] = VOTE_CODES.map((voteCode, i) => {
  const budgetAllocation = rndInt(200_000_000_000, 2_000_000_000_000)
  const committed = Math.floor(budgetAllocation * (0.3 + Math.random() * 0.5))
  const actual = Math.floor(committed * (0.4 + Math.random() * 0.5))
  const balance = budgetAllocation - actual
  const utilizationPct = Math.round((actual / budgetAllocation) * 100)
  return {
    id: `TCOMM-${String(i).padStart(3, '0')}`,
    voteCode,
    ministryLine: MINISTRY_LINES[i],
    description: `FY 2025/26 Budget — ${MINISTRY_LINES[i]}`,
    financialYear: '2025/26',
    budgetAllocation,
    committed,
    actual,
    balance,
    utilizationPct,
    status: utilizationPct > 95 ? 'overrun' : utilizationPct > 80 ? 'at_risk' : 'on_track',
  }
})

// ─── Consolidated Fund daily position (last 14 days) ─────────────────────────
export const mockConsolidatedFund: ConsolidatedFundEntry[] = Array.from({ length: 14 }, (_, i) => {
  const daysAgo = 13 - i
  const openingBalance = 12_000_000_000_000 + rndInt(-500_000_000_000, 500_000_000_000)
  const receipts = rndInt(80_000_000_000, 400_000_000_000)
  const disbursements = rndInt(60_000_000_000, 350_000_000_000)
  const closingBalance = openingBalance + receipts - disbursements
  return {
    date: makeDate(daysAgo),
    openingBalance,
    receipts,
    disbursements,
    closingBalance,
  }
})
