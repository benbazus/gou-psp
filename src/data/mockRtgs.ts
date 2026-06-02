import type {
  RTGSTransaction, RTGSKpi, RTGSLiveEvent, InterbankTransfer,
} from '../types/rtgs'

export const rtgsKpi: RTGSKpi = {
  totalValueToday:        48_750_000_000,
  totalTransactions:      347,
  pendingInstructions:    28,
  settledTransactions:    301,
  failedTransactions:     18,
  queueDepth:             12,
  avgSettlementTimeSecs:  94,
  liquidityUtilizationPct: 68.4,
  activeBanks:            7,
  treasuryTransferValue:  19_200_000_000,
  systemUptimePct:        99.97,
  netPosition:            3_500_000_000,
}

export const mockSettlementQueue: RTGSTransaction[] = [
  {
    id: 'rtx-001', rtgsRef: 'RTGS/2026/06/02/001',
    amount: 4_500_000_000, senderBank: 'Ministry of Finance, Planning and Economic Development',
    receiverBank: 'Stanbic Bank Uganda', purpose: 'Treasury Disbursement – Infrastructure Fund',
    priority: 'critical', status: 'pending_auth', submittedAt: '2026-06-02T08:14:22Z',
    settlementWindow: 'Window 1 (08:00–12:00)', liquidityStatus: 'available',
    approvalStatus: 'pending', fees: 450_000,
    auditLog: [
      { timestamp: '2026-06-02T08:14:22Z', actor: 'Treasury System', action: 'SUBMITTED', detail: 'Instruction received and validated' },
      { timestamp: '2026-06-02T08:14:30Z', actor: 'Validation Engine', action: 'VALIDATED', detail: 'All fields validated successfully' },
      { timestamp: '2026-06-02T08:14:35Z', actor: 'Liquidity Engine', action: 'LIQUIDITY_OK', detail: 'Sufficient liquidity confirmed' },
    ],
  },
  {
    id: 'rtx-002', rtgsRef: 'RTGS/2026/06/02/002',
    amount: 2_100_000_000, senderBank: 'Uganda Revenue Authority',
    receiverBank: 'Bank of Uganda Consolidated Fund', purpose: 'Tax Revenue Remittance – May 2026',
    priority: 'high', status: 'processing', submittedAt: '2026-06-02T08:30:10Z',
    settlementWindow: 'Window 1 (08:00–12:00)', liquidityStatus: 'available',
    approvalStatus: 'approved', approvedBy: 'Central Bank Settlement Operator', fees: 210_000,
    auditLog: [
      { timestamp: '2026-06-02T08:30:10Z', actor: 'URA System', action: 'SUBMITTED', detail: 'Remittance instruction submitted' },
      { timestamp: '2026-06-02T08:30:18Z', actor: 'Validation Engine', action: 'VALIDATED', detail: 'Validated successfully' },
      { timestamp: '2026-06-02T08:31:00Z', actor: 'CBU Operator', action: 'APPROVED', detail: 'Approved by Central Bank Settlement Operator' },
    ],
  },
  {
    id: 'rtx-003', rtgsRef: 'RTGS/2026/06/02/003',
    amount: 850_000_000, senderBank: 'DFCU Bank',
    receiverBank: 'Centenary Bank', purpose: 'Interbank Settlement – Net Position',
    priority: 'normal', status: 'liquidity_wait', submittedAt: '2026-06-02T08:45:05Z',
    settlementWindow: 'Window 1 (08:00–12:00)', liquidityStatus: 'insufficient',
    approvalStatus: 'not_required', fees: 85_000,
    auditLog: [
      { timestamp: '2026-06-02T08:45:05Z', actor: 'DFCU System', action: 'SUBMITTED', detail: 'Interbank settlement instruction submitted' },
      { timestamp: '2026-06-02T08:45:15Z', actor: 'Liquidity Engine', action: 'LIQUIDITY_INSUFFICIENT', detail: 'DFCU available liquidity below required threshold' },
    ],
  },
  {
    id: 'rtx-004', rtgsRef: 'RTGS/2026/06/02/004',
    amount: 3_200_000_000, senderBank: 'National Social Security Fund',
    receiverBank: 'Stanbic Bank Uganda', purpose: 'Pension Disbursement – June 2026',
    priority: 'high', status: 'queued', submittedAt: '2026-06-02T09:00:00Z',
    settlementWindow: 'Window 1 (08:00–12:00)', liquidityStatus: 'available',
    approvalStatus: 'approved', approvedBy: 'Treasury Settlement Officer', fees: 320_000,
    auditLog: [
      { timestamp: '2026-06-02T09:00:00Z', actor: 'NSSF System', action: 'SUBMITTED', detail: 'Pension disbursement instruction received' },
    ],
  },
  {
    id: 'rtx-005', rtgsRef: 'RTGS/2026/06/02/005',
    amount: 620_000_000, senderBank: 'Equity Bank Uganda',
    receiverBank: 'Absa Bank Uganda', purpose: 'Customer Transfer – Corporate Settlement',
    priority: 'normal', status: 'settled', submittedAt: '2026-06-02T07:30:00Z',
    settlementWindow: 'Window 1 (08:00–12:00)', liquidityStatus: 'available',
    approvalStatus: 'approved', approvedBy: 'CBU Operator', settledAt: '2026-06-02T07:52:10Z', fees: 62_000,
    auditLog: [
      { timestamp: '2026-06-02T07:30:00Z', actor: 'Equity System', action: 'SUBMITTED', detail: 'Instruction submitted' },
      { timestamp: '2026-06-02T07:52:10Z', actor: 'Settlement Engine', action: 'SETTLED', detail: 'Settlement executed successfully. Final.' },
    ],
  },
  {
    id: 'rtx-006', rtgsRef: 'RTGS/2026/06/02/006',
    amount: 430_000_000, senderBank: 'Housing Finance Bank',
    receiverBank: 'Bank of Africa Uganda', purpose: 'Interbank Liquidity Transfer',
    priority: 'normal', status: 'failed', submittedAt: '2026-06-02T08:20:00Z',
    settlementWindow: 'Window 1 (08:00–12:00)', liquidityStatus: 'insufficient',
    approvalStatus: 'rejected', failureReason: 'Receiving bank account suspended – contact RTGS Admin', fees: 0,
    auditLog: [
      { timestamp: '2026-06-02T08:20:00Z', actor: 'HFB System', action: 'SUBMITTED', detail: 'Instruction submitted' },
      { timestamp: '2026-06-02T08:20:30Z', actor: 'Validation Engine', action: 'FAILED', detail: 'Bank of Africa Uganda RTGS account status: SUSPENDED' },
    ],
  },
  {
    id: 'rtx-007', rtgsRef: 'RTGS/2026/06/02/007',
    amount: 7_800_000_000, senderBank: 'Ministry of Finance, Planning and Economic Development',
    receiverBank: 'Centenary Bank', purpose: 'Government Salary Bulk Settlement – June 2026',
    priority: 'critical', status: 'high_priority', submittedAt: '2026-06-02T09:15:00Z',
    settlementWindow: 'Window 2 (12:00–16:00)', liquidityStatus: 'available',
    approvalStatus: 'pending', fees: 780_000,
    auditLog: [
      { timestamp: '2026-06-02T09:15:00Z', actor: 'Treasury System', action: 'SUBMITTED', detail: 'Bulk salary settlement instruction submitted' },
      { timestamp: '2026-06-02T09:15:10Z', actor: 'Priority Engine', action: 'ELEVATED', detail: 'Elevated to CRITICAL – government salary mandate' },
    ],
  },
  {
    id: 'rtx-008', rtgsRef: 'RTGS/2026/06/02/008',
    amount: 1_150_000_000, senderBank: 'Absa Bank Uganda',
    receiverBank: 'DFCU Bank', purpose: 'Net Settlement – ACH Multilateral',
    priority: 'normal', status: 'queued', submittedAt: '2026-06-02T09:30:00Z',
    settlementWindow: 'Window 2 (12:00–16:00)', liquidityStatus: 'marginal',
    approvalStatus: 'not_required', fees: 115_000,
    auditLog: [],
  },
]

export const mockLiveEvents: RTGSLiveEvent[] = [
  { id: 'ev-001', type: 'settled', rtgsRef: 'RTGS/2026/06/02/005', amount: 620_000_000, senderBank: 'Equity Bank Uganda', receiverBank: 'Absa Bank Uganda', timestamp: '2026-06-02T07:52:10Z', detail: 'Settlement executed. Final.' },
  { id: 'ev-002', type: 'authorized', rtgsRef: 'RTGS/2026/06/02/002', amount: 2_100_000_000, senderBank: 'Uganda Revenue Authority', receiverBank: 'Bank of Uganda', timestamp: '2026-06-02T08:31:00Z', detail: 'Approved by CBU Operator.' },
  { id: 'ev-003', type: 'exception_raised', rtgsRef: 'RTGS/2026/06/02/006', amount: 430_000_000, senderBank: 'Housing Finance Bank', receiverBank: 'Bank of Africa Uganda', timestamp: '2026-06-02T08:20:30Z', detail: 'Receiving account suspended.' },
  { id: 'ev-004', type: 'queued', rtgsRef: 'RTGS/2026/06/02/004', amount: 3_200_000_000, senderBank: 'NSSF', receiverBank: 'Stanbic Bank Uganda', timestamp: '2026-06-02T09:00:00Z', detail: 'Queued in Window 1.' },
  { id: 'ev-005', type: 'liquidity_injected', rtgsRef: '', amount: 5_000_000_000, senderBank: 'Bank of Uganda', receiverBank: 'DFCU Bank', timestamp: '2026-06-02T08:50:00Z', detail: 'Intraday liquidity injected by CBU.' },
  { id: 'ev-006', type: 'settled', rtgsRef: 'RTGS/2026/06/01/198', amount: 980_000_000, senderBank: 'Stanbic Bank Uganda', receiverBank: 'Equity Bank Uganda', timestamp: '2026-06-02T07:15:00Z', detail: 'Settlement executed. Final.' },
  { id: 'ev-007', type: 'failed', rtgsRef: 'RTGS/2026/06/02/010', amount: 220_000_000, senderBank: 'Bank of Africa Uganda', receiverBank: 'Housing Finance Bank', timestamp: '2026-06-02T08:55:00Z', detail: 'Timeout – no CBU authorization within SLA.' },
]

export const mockBankSettlementRanking = [
  { bank: 'Stanbic Bank', settled: 12_400_000_000, count: 84, successRate: 98.8 },
  { bank: 'Centenary Bank', settled: 8_900_000_000, count: 61, successRate: 97.2 },
  { bank: 'DFCU Bank', settled: 6_200_000_000, count: 45, successRate: 94.4 },
  { bank: 'Equity Bank', settled: 5_800_000_000, count: 38, successRate: 96.1 },
  { bank: 'Absa Bank', settled: 4_100_000_000, count: 29, successRate: 97.9 },
  { bank: 'Bank of Africa', settled: 2_900_000_000, count: 18, successRate: 88.9 },
  { bank: 'Housing Finance', settled: 1_800_000_000, count: 14, successRate: 92.9 },
]

export const mockSettlementVolumeChart = [
  { date: '27 May', value: 32_100_000_000, count: 210 },
  { date: '28 May', value: 41_500_000_000, count: 289 },
  { date: '29 May', value: 28_700_000_000, count: 195 },
  { date: '30 May', value: 0, count: 0 },
  { date: '31 May', value: 0, count: 0 },
  { date: '01 Jun', value: 38_900_000_000, count: 274 },
  { date: '02 Jun', value: 48_750_000_000, count: 347 },
]

export const mockIntradayLiquidityChart = [
  { time: '08:00', utilization: 22 }, { time: '08:30', utilization: 35 },
  { time: '09:00', utilization: 48 }, { time: '09:30', utilization: 55 },
  { time: '10:00', utilization: 62 }, { time: '10:30', utilization: 68 },
  { time: '11:00', utilization: 71 }, { time: '11:30', utilization: 65 },
  { time: '12:00', utilization: 58 }, { time: '12:30', utilization: 63 },
  { time: '13:00', utilization: 69 }, { time: '13:30', utilization: 74 },
  { time: '14:00', utilization: 68 }, { time: '14:30', utilization: 60 },
]

export const mockInterbankTransfers: InterbankTransfer[] = [
  {
    id: 'ibt-001', rtgsRef: 'RTGS/2026/06/02/051',
    senderBank: 'Stanbic Bank Uganda', receiverBank: 'Centenary Bank',
    amount: 1_800_000_000, purpose: 'Net interbank settlement – ACH clearing',
    status: 'settled', liquidityImpact: -1_800_000_000, fees: 180_000,
    submittedAt: '2026-06-02T08:00:00Z', settledAt: '2026-06-02T08:04:22Z',
    approvalChain: [
      { role: 'Bank RTGS Operator', actor: 'J. Ochieng (Stanbic)', status: 'approved', timestamp: '2026-06-02T08:01:00Z' },
      { role: 'Central Bank Settlement Operator', actor: 'M. Nakato (CBU)', status: 'approved', timestamp: '2026-06-02T08:03:00Z' },
    ],
    auditLog: [
      { timestamp: '2026-06-02T08:00:00Z', actor: 'Stanbic System', action: 'SUBMITTED', detail: 'Interbank transfer instruction submitted' },
      { timestamp: '2026-06-02T08:04:22Z', actor: 'Settlement Engine', action: 'SETTLED', detail: 'Settlement complete. UGX 1,800,000,000 transferred.' },
    ],
  },
  {
    id: 'ibt-002', rtgsRef: 'RTGS/2026/06/02/052',
    senderBank: 'DFCU Bank', receiverBank: 'Equity Bank Uganda',
    amount: 650_000_000, purpose: 'Treasury bond settlement',
    status: 'liquidity_wait', liquidityImpact: -650_000_000, fees: 65_000,
    submittedAt: '2026-06-02T09:00:00Z',
    approvalChain: [
      { role: 'Bank RTGS Operator', actor: 'P. Ssebugwawo (DFCU)', status: 'approved', timestamp: '2026-06-02T09:01:00Z' },
      { role: 'Central Bank Settlement Operator', actor: 'M. Nakato (CBU)', status: 'pending' },
    ],
    auditLog: [
      { timestamp: '2026-06-02T09:00:00Z', actor: 'DFCU System', action: 'SUBMITTED', detail: 'Bond settlement instruction submitted' },
      { timestamp: '2026-06-02T09:00:15Z', actor: 'Liquidity Engine', action: 'LIQUIDITY_WAIT', detail: 'DFCU intraday facility at 94% utilization' },
    ],
  },
]
