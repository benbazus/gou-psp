import type { Dispute, DisputeTimelineEntry } from '../types'

export const mockDisputes: Dispute[] = [
  {
    id: 'DSP-2026-001', transactionId: 'TXN-2026-00042', amount: 250000,
    payer: 'Namutebi Grace', agency: 'NIRA', channel: 'MTN Mobile Money',
    type: 'failed_debit', status: 'investigating', raisedAt: '2026-05-29T10:23:00Z',
    slaDueAt: '2026-06-05T10:23:00Z',
    timeline: [
      { stage: 'Dispute Raised', actor: 'Namutebi Grace', timestamp: '2026-05-29T10:23:00Z', note: 'Reported via citizen portal — debited but no passport confirmation received' },
      { stage: 'Investigation', actor: 'Support Officer', timestamp: '2026-05-29T11:05:00Z', note: 'Transaction confirmed on MTN side. Awaiting NIRA confirmation API response' },
      { stage: 'Participant Response', actor: 'NIRA', timestamp: '', note: '' },
    ] satisfies DisputeTimelineEntry[],
  },
  {
    id: 'DSP-2026-002', transactionId: 'TXN-2026-00128', amount: 80000,
    payer: 'Okello James', agency: 'MOW', channel: 'Bank Transfer',
    type: 'duplicate_payment', status: 'open', raisedAt: '2026-05-30T14:45:00Z',
    slaDueAt: '2026-06-06T14:45:00Z',
    timeline: [
      { stage: 'Dispute Raised', actor: 'Okello James', timestamp: '2026-05-30T14:45:00Z', note: 'Paid twice for driving license — duplicate PRN charged' },
    ] satisfies DisputeTimelineEntry[],
  },
  {
    id: 'DSP-2026-003', transactionId: 'TXN-2026-99841', amount: 500000,
    payer: 'Ssekandi Paul', agency: 'MOL', channel: 'Visa/Mastercard',
    type: 'incorrect_amount', status: 'approved', raisedAt: '2026-05-27T09:12:00Z',
    slaDueAt: '2026-06-03T09:12:00Z', refundAmount: 300000,
    timeline: [
      { stage: 'Dispute Raised', actor: 'Ssekandi Paul', timestamp: '2026-05-27T09:12:00Z', note: 'Charged UGX 500,000 but invoice was UGX 200,000' },
      { stage: 'Investigation', actor: 'Support Officer', timestamp: '2026-05-27T10:00:00Z', note: 'Confirmed overcharge of UGX 300,000 — Ministry of Lands fee schedule mismatch' },
      { stage: 'Approved', actor: 'Settlement Officer', timestamp: '2026-05-28T14:30:00Z', note: 'Refund of UGX 300,000 approved' },
    ] satisfies DisputeTimelineEntry[],
  },
  {
    id: 'DSP-2026-004', transactionId: 'TXN-2026-00301', amount: 120000,
    payer: 'Nakato Fatuma', agency: 'IMM', channel: 'Airtel Money',
    type: 'no_confirmation', status: 'open', raisedAt: '2026-06-01T07:30:00Z',
    slaDueAt: '2026-06-08T07:30:00Z',
    timeline: [
      { stage: 'Dispute Raised', actor: 'Nakato Fatuma', timestamp: '2026-06-01T07:30:00Z', note: 'Payment deducted from Airtel wallet but visa application not confirmed' },
    ] satisfies DisputeTimelineEntry[],
  },
  {
    id: 'DSP-2026-005', transactionId: 'TXN-2026-00489', amount: 200000,
    payer: 'Oryem Moses', agency: 'KCCA', channel: 'MTN Mobile Money',
    type: 'failed_debit', status: 'closed', raisedAt: '2026-05-25T13:00:00Z',
    slaDueAt: '2026-06-01T13:00:00Z',
    timeline: [
      { stage: 'Dispute Raised', actor: 'Oryem Moses', timestamp: '2026-05-25T13:00:00Z', note: 'Reported duplicate business permit payment' },
      { stage: 'Investigation', actor: 'Support Officer', timestamp: '2026-05-25T14:00:00Z', note: 'Confirmed — second payment was system retry, not payer action' },
      { stage: 'Approved', actor: 'Settlement Officer', timestamp: '2026-05-26T09:00:00Z', note: 'Refund of UGX 200,000 processed' },
      { stage: 'Closed', actor: 'Support Officer', timestamp: '2026-05-27T10:00:00Z', note: 'Dispute resolved and closed' },
    ] satisfies DisputeTimelineEntry[],
  },
]
