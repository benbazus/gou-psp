import type { Dispute, DisputeTimelineEntry } from '../types'

function tl(items: DisputeTimelineEntry[]): DisputeTimelineEntry[] {
  return items satisfies DisputeTimelineEntry[]
}

export interface DisputeEvidence {
  id: string
  name: string
  type: 'PDF' | 'PNG' | 'JPEG' | 'CSV'
  size: string
  uploadedAt: string
  uploadedBy: string
}

export interface DisputeEx extends Dispute {
  reversalStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
  reversalRef?: string
  evidence: DisputeEvidence[]
  participantNote?: string
}

function evidence(...files: Omit<DisputeEvidence, 'id'>[]): DisputeEvidence[] {
  return files.map((f, i) => ({ ...f, id: `EV-${i + 1}` }))
}

export const mockDisputes: DisputeEx[] = [
  // ─── Failed but debited ──────────────────────────────────────
  {
    id: 'DSP-2026-001', transactionId: 'TXN-2026-00042', amount: 250000,
    payer: 'Namutebi Grace', agency: 'NIRA', channel: 'MTN Mobile Money',
    type: 'failed_debit', status: 'investigating',
    raisedAt: '2026-05-29T10:23:00Z', slaDueAt: '2026-06-05T10:23:00Z',
    reversalStatus: null,
    evidence: evidence(
      { name: 'mtn_deduction_sms.png', type: 'PNG', size: '42 KB', uploadedAt: '2026-05-29T11:00:00Z', uploadedBy: 'Namutebi Grace' },
      { name: 'nira_application_ref.pdf', type: 'PDF', size: '88 KB', uploadedAt: '2026-05-29T11:02:00Z', uploadedBy: 'Namutebi Grace' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised',       actor: 'Namutebi Grace',   timestamp: '2026-05-29T10:23:00Z', note: 'Debited UGX 250,000 via MTN Mobile Money for passport — no confirmation received from NIRA' },
      { stage: 'Investigation',        actor: 'Support Officer',   timestamp: '2026-05-29T11:05:00Z', note: 'MTN confirms debit. NIRA API returned 504 at time of payment. Investigating confirmation gap.' },
      { stage: 'Participant Response', actor: 'NIRA',              timestamp: '2026-06-01T09:00:00Z', note: 'NIRA technical team reviewing — PRN not in their confirmed records' },
    ]),
  },
  {
    id: 'DSP-2026-004', transactionId: 'TXN-2026-00301', amount: 120000,
    payer: 'Nakato Fatuma', agency: 'IMM', channel: 'Airtel Money',
    type: 'failed_debit', status: 'open',
    raisedAt: '2026-06-01T07:30:00Z', slaDueAt: '2026-06-08T07:30:00Z',
    reversalStatus: null,
    evidence: evidence(
      { name: 'airtel_receipt.jpeg', type: 'JPEG', size: '55 KB', uploadedAt: '2026-06-01T07:45:00Z', uploadedBy: 'Nakato Fatuma' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised', actor: 'Nakato Fatuma', timestamp: '2026-06-01T07:30:00Z', note: 'UGX 120,000 deducted from Airtel wallet. Visa application shows "Payment Pending" on Immigration portal.' },
    ]),
  },

  // ─── Duplicate payments ───────────────────────────────────────
  {
    id: 'DSP-2026-002', transactionId: 'TXN-2026-00128', amount: 80000,
    payer: 'Okello James', agency: 'MOW', channel: 'Bank Transfer',
    type: 'duplicate_payment', status: 'open',
    raisedAt: '2026-05-30T14:45:00Z', slaDueAt: '2026-06-06T14:45:00Z',
    reversalStatus: null,
    evidence: evidence(
      { name: 'stanbic_statement_may.pdf', type: 'PDF', size: '124 KB', uploadedAt: '2026-05-30T15:00:00Z', uploadedBy: 'Okello James' },
      { name: 'mow_portal_screenshot.png', type: 'PNG', size: '78 KB', uploadedAt: '2026-05-30T15:05:00Z', uploadedBy: 'Okello James' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised', actor: 'Okello James', timestamp: '2026-05-30T14:45:00Z', note: 'Charged twice for driving license renewal — two separate debits of UGX 80,000 on same PRN-7741882' },
    ]),
  },
  {
    id: 'DSP-2026-006', transactionId: 'TXN-2026-00512', amount: 200000,
    payer: 'Byaruhanga John', agency: 'URA', channel: 'MTN Mobile Money',
    type: 'duplicate_payment', status: 'investigating',
    raisedAt: '2026-06-01T12:00:00Z', slaDueAt: '2026-06-08T12:00:00Z',
    reversalStatus: 'pending',
    participantNote: 'MTN confirms two successful debit responses were returned for the same session. Possible network retry issue.',
    evidence: evidence(
      { name: 'mtn_two_debits.png',    type: 'PNG', size: '61 KB', uploadedAt: '2026-06-01T12:30:00Z', uploadedBy: 'Byaruhanga John' },
      { name: 'ura_prn_statement.pdf', type: 'PDF', size: '92 KB', uploadedAt: '2026-06-01T12:35:00Z', uploadedBy: 'Byaruhanga John' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised',  actor: 'Byaruhanga John', timestamp: '2026-06-01T12:00:00Z', note: 'Double-charged UGX 200,000 for income tax — same PRN debited twice within 3 seconds' },
      { stage: 'Investigation',   actor: 'Support Officer',  timestamp: '2026-06-01T12:45:00Z', note: 'Confirmed duplicate TXN-2026-00512 and TXN-2026-00513 — same PRN, amount, timestamp window' },
    ]),
  },

  // ─── Incorrect amount ─────────────────────────────────────────
  {
    id: 'DSP-2026-003', transactionId: 'TXN-2026-99841', amount: 500000,
    payer: 'Ssekandi Paul', agency: 'MOL', channel: 'Visa/Mastercard',
    type: 'incorrect_amount', status: 'approved',
    raisedAt: '2026-05-27T09:12:00Z', slaDueAt: '2026-06-03T09:12:00Z',
    refundAmount: 300000, reversalStatus: 'completed', reversalRef: 'REV-2026-00841',
    evidence: evidence(
      { name: 'lands_invoice.pdf',     type: 'PDF', size: '108 KB', uploadedAt: '2026-05-27T09:30:00Z', uploadedBy: 'Ssekandi Paul' },
      { name: 'card_statement.pdf',    type: 'PDF', size: '215 KB', uploadedAt: '2026-05-27T09:35:00Z', uploadedBy: 'Ssekandi Paul' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised',        actor: 'Ssekandi Paul',     timestamp: '2026-05-27T09:12:00Z', note: 'Charged UGX 500,000 but Ministry of Lands invoice was UGX 200,000. Overcharge of UGX 300,000.' },
      { stage: 'Investigation',         actor: 'Support Officer',    timestamp: '2026-05-27T10:00:00Z', note: 'Fee schedule mismatch confirmed. System applied old rate. Overcharge of UGX 300,000 validated.' },
      { stage: 'Participant Response',  actor: 'Ministry of Lands',  timestamp: '2026-05-28T08:00:00Z', note: 'Ministry confirmed correct fee is UGX 200,000. Old fee schedule removed from system.' },
      { stage: 'Approval',             actor: 'Settlement Officer',  timestamp: '2026-05-28T14:30:00Z', note: 'Refund of UGX 300,000 approved and queued for processing' },
      { stage: 'Refund / Reversal',    actor: 'System',             timestamp: '2026-05-29T09:00:00Z', note: 'UGX 300,000 reversed to Visa card ending 4821. REV-2026-00841.' },
      { stage: 'Closure',              actor: 'Support Officer',    timestamp: '2026-05-30T10:00:00Z', note: 'Dispute closed. Citizen confirmed receipt of refund.' },
    ]),
  },

  // ─── No confirmation ──────────────────────────────────────────
  {
    id: 'DSP-2026-007', transactionId: 'TXN-2026-00620', amount: 5000,
    payer: 'Kemigisha Diana', agency: 'NIRA', channel: 'USSD',
    type: 'no_confirmation', status: 'open',
    raisedAt: '2026-06-02T08:00:00Z', slaDueAt: '2026-06-09T08:00:00Z',
    reversalStatus: null,
    evidence: evidence(
      { name: 'nira_application_ref.pdf', type: 'PDF', size: '44 KB', uploadedAt: '2026-06-02T08:20:00Z', uploadedBy: 'Kemigisha Diana' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised', actor: 'Kemigisha Diana', timestamp: '2026-06-02T08:00:00Z', note: 'USSD payment for National ID — UGX 5,000 debited, no SMS confirmation, NIRA portal shows "awaiting payment"' },
    ]),
  },

  // ─── Refund requests ──────────────────────────────────────────
  {
    id: 'DSP-2026-008', transactionId: 'TXN-2026-00780', amount: 250000,
    payer: 'Lutalo Emmanuel', agency: 'IMM', channel: 'Bank Transfer',
    type: 'failed_debit', status: 'participant_response',
    raisedAt: '2026-05-31T09:00:00Z', slaDueAt: '2026-06-07T09:00:00Z',
    refundAmount: 250000, reversalStatus: 'processing',
    participantNote: 'Immigration confirms PRN was not registered in their system at time of payment. Refund pre-approved pending BOU settlement approval.',
    evidence: evidence(
      { name: 'stanbic_debit.pdf',       type: 'PDF', size: '88 KB', uploadedAt: '2026-05-31T09:30:00Z', uploadedBy: 'Lutalo Emmanuel' },
      { name: 'imm_portal_status.png',   type: 'PNG', size: '52 KB', uploadedAt: '2026-05-31T09:32:00Z', uploadedBy: 'Lutalo Emmanuel' },
      { name: 'support_case_notes.csv',  type: 'CSV', size: '12 KB', uploadedAt: '2026-05-31T11:00:00Z', uploadedBy: 'Support Officer' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised',       actor: 'Lutalo Emmanuel', timestamp: '2026-05-31T09:00:00Z', note: 'Work permit payment via Stanbic Bank — debited but Immigration portal shows no payment received' },
      { stage: 'Investigation',        actor: 'Support Officer',  timestamp: '2026-05-31T10:00:00Z', note: 'PRN confirmed valid. Stanbic confirms debit. Immigration API was in maintenance window at payment time.' },
      { stage: 'Participant Response', actor: 'Immigration',      timestamp: '2026-06-01T08:00:00Z', note: 'Immigration confirms PRN not in their DB. Full refund of UGX 250,000 agreed.' },
    ]),
  },

  // ─── Closed / historical ──────────────────────────────────────
  {
    id: 'DSP-2026-005', transactionId: 'TXN-2026-00489', amount: 200000,
    payer: 'Oryem Moses', agency: 'KCCA', channel: 'MTN Mobile Money',
    type: 'duplicate_payment', status: 'closed',
    raisedAt: '2026-05-25T13:00:00Z', slaDueAt: '2026-06-01T13:00:00Z',
    refundAmount: 200000, reversalStatus: 'completed', reversalRef: 'REV-2026-00489',
    evidence: evidence(
      { name: 'mtn_double_charge.png', type: 'PNG', size: '34 KB', uploadedAt: '2026-05-25T13:30:00Z', uploadedBy: 'Oryem Moses' },
    ),
    timeline: tl([
      { stage: 'Dispute Raised',      actor: 'Oryem Moses',      timestamp: '2026-05-25T13:00:00Z', note: 'Duplicate business permit payment — system retry charged twice' },
      { stage: 'Investigation',       actor: 'Support Officer',   timestamp: '2026-05-25T14:00:00Z', note: 'Confirmed: second charge was automatic switch retry, not customer action' },
      { stage: 'Participant Response', actor: 'KCCA',             timestamp: '2026-05-25T16:00:00Z', note: 'KCCA confirms only one permit registered. Second payment is duplicate.' },
      { stage: 'Approval',            actor: 'Settlement Officer', timestamp: '2026-05-26T09:00:00Z', note: 'Full refund of UGX 200,000 approved' },
      { stage: 'Refund / Reversal',   actor: 'System',            timestamp: '2026-05-26T10:00:00Z', note: 'UGX 200,000 reversed to MTN wallet +256772XXXXXX. REV-2026-00489.' },
      { stage: 'Closure',             actor: 'Support Officer',   timestamp: '2026-05-27T10:00:00Z', note: 'Dispute closed. Customer confirmed refund received.' },
    ]),
  },
]
