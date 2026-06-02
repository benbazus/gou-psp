// src/data/mockRtgsExceptions.ts
import type { RTGSException } from '../types/rtgs'

export const mockRtgsExceptions: RTGSException[] = [
  {
    id: 'exc-001', type: 'insufficient_liquidity', severity: 'high', status: 'investigating',
    transactionRef: 'RTGS/2026/06/02/003', amount: 850_000_000,
    senderBank: 'DFCU Bank', receiverBank: 'Centenary Bank',
    assignedTo: 'P. Nabukenya – Liquidity Manager', slaDeadline: '2026-06-02T12:00:00Z',
    raisedAt: '2026-06-02T08:45:15Z',
    rootCause: 'DFCU Bank intraday liquidity facility exhausted at 94% utilization. Queued outgoing transactions exceed available collateral.',
    recommendedAction: 'Request DFCU Bank to inject additional liquidity or pledge additional collateral. Alternatively, CBU may extend emergency intraday facility.',
    auditLog: [
      { timestamp: '2026-06-02T08:45:15Z', actor: 'Liquidity Engine', action: 'EXCEPTION_RAISED', detail: 'Insufficient liquidity detected for RTGS/2026/06/02/003' },
      { timestamp: '2026-06-02T08:46:00Z', actor: 'RTGS System', action: 'ASSIGNED', detail: 'Auto-assigned to Liquidity Manager' },
    ],
  },
  {
    id: 'exc-002', type: 'invalid_beneficiary', severity: 'critical', status: 'open',
    transactionRef: 'RTGS/2026/06/02/006', amount: 430_000_000,
    senderBank: 'Housing Finance Bank', receiverBank: 'Bank of Africa Uganda',
    slaDeadline: '2026-06-02T10:00:00Z', raisedAt: '2026-06-02T08:20:30Z',
    rootCause: 'Bank of Africa Uganda RTGS settlement account has status SUSPENDED following regulatory action by Bank of Uganda dated 2026-05-30.',
    recommendedAction: 'Notify Housing Finance Bank of suspension. Reject instruction and return funds. Escalate to CBU Compliance team.',
    auditLog: [
      { timestamp: '2026-06-02T08:20:30Z', actor: 'Validation Engine', action: 'EXCEPTION_RAISED', detail: 'Beneficiary account status: SUSPENDED' },
    ],
  },
  {
    id: 'exc-003', type: 'settlement_timeout', severity: 'high', status: 'escalated',
    transactionRef: 'RTGS/2026/06/02/010', amount: 220_000_000,
    senderBank: 'Bank of Africa Uganda', receiverBank: 'Housing Finance Bank',
    assignedTo: 'M. Nakato – CBU Settlement Operator', slaDeadline: '2026-06-02T10:30:00Z',
    raisedAt: '2026-06-02T08:55:00Z',
    rootCause: 'CBU authorization not received within the 30-minute SLA window. CBU operator system reported intermittent connectivity issues 08:40–09:10.',
    recommendedAction: 'Retry authorization request. If CBU system still unavailable, apply Manual Override per Emergency Settlement Protocol §4.2.',
    auditLog: [
      { timestamp: '2026-06-02T08:55:00Z', actor: 'RTGS Engine', action: 'TIMEOUT', detail: 'Authorization SLA of 30 mins exceeded' },
      { timestamp: '2026-06-02T09:00:00Z', actor: 'CBU Operator', action: 'ESCALATED', detail: 'Escalated to Senior Settlement Officer' },
    ],
  },
  {
    id: 'exc-004', type: 'duplicate_instruction', severity: 'medium', status: 'investigating',
    transactionRef: 'RTGS/2026/06/02/021', amount: 1_200_000_000,
    senderBank: 'Stanbic Bank Uganda', receiverBank: 'DFCU Bank',
    assignedTo: 'J. Ochieng – Bank RTGS Operator', slaDeadline: '2026-06-02T14:00:00Z',
    raisedAt: '2026-06-02T09:45:00Z',
    rootCause: 'Transaction RTGS/2026/06/02/021 has identical sender, receiver, amount, and purpose as RTGS/2026/06/02/008 submitted 15 minutes earlier.',
    recommendedAction: 'Contact Stanbic Bank RTGS operator to confirm whether both instructions are intentional. Suspend the duplicate pending confirmation.',
    auditLog: [
      { timestamp: '2026-06-02T09:45:00Z', actor: 'Duplicate Detection Engine', action: 'EXCEPTION_RAISED', detail: 'Duplicate match with RTGS/2026/06/02/008 – 98% similarity' },
    ],
  },
  {
    id: 'exc-005', type: 'compliance_flag', severity: 'critical', status: 'open',
    transactionRef: 'RTGS/2026/06/02/034', amount: 6_800_000_000,
    senderBank: 'Equity Bank Uganda', receiverBank: 'Housing Finance Bank',
    slaDeadline: '2026-06-02T11:00:00Z', raisedAt: '2026-06-02T10:00:00Z',
    rootCause: 'AML screening engine flagged the originator entity against FATF watch list. Transaction pattern suggests potential layering – 4th large transaction to same beneficiary in 48 hours.',
    recommendedAction: 'Freeze instruction immediately. Escalate to Compliance Officer for enhanced due diligence. File STR if warranted.',
    auditLog: [
      { timestamp: '2026-06-02T10:00:00Z', actor: 'AML Engine', action: 'COMPLIANCE_FLAG', detail: 'FATF watch list match – confidence 87%' },
    ],
  },
  {
    id: 'exc-006', type: 'treasury_mismatch', severity: 'high', status: 'open',
    transactionRef: 'RTGS/2026/06/02/002', amount: 2_100_000_000,
    senderBank: 'Uganda Revenue Authority', receiverBank: 'Bank of Uganda',
    slaDeadline: '2026-06-02T12:00:00Z', raisedAt: '2026-06-02T09:15:00Z',
    rootCause: 'IFMS treasury ledger shows expected remittance of UGX 2,350,000,000 but RTGS instruction amount is UGX 2,100,000,000. Variance of UGX 250,000,000.',
    recommendedAction: 'Request URA Finance to confirm correct amount. Do not settle until variance is resolved.',
    auditLog: [
      { timestamp: '2026-06-02T09:15:00Z', actor: 'Treasury Reconciliation Engine', action: 'MISMATCH_DETECTED', detail: 'IFMS expected: 2,350,000,000 | RTGS: 2,100,000,000' },
    ],
  },
]
