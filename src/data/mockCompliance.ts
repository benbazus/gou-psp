import type { ComplianceAlert, BlacklistedAccount, AuditLogEntry } from '../types'

export const mockAlerts: ComplianceAlert[] = [
  { id: 'AML-001', type: 'High Volume', severity: 'critical', description: 'Single payer made 47 payments totaling UGX 8.4M in 2 hours', payer: 'Unknown Corp Ltd', triggeredAt: '2026-06-01T07:23:00Z', status: 'open', rule: 'VELOCITY_PAYER_2H_GT_40' },
  { id: 'AML-002', type: 'Participant Down', severity: 'high', description: 'Bank of Africa API returning 503 for all settlement calls — 89 transactions queued', participant: 'Bank of Africa', triggeredAt: '2026-06-01T06:00:00Z', status: 'investigating', rule: 'PARTICIPANT_DOWN_GT_60MIN' },
  { id: 'AML-003', type: 'Settlement Mismatch', severity: 'high', description: 'DFCU settlement batch discrepancy: switch total UGX 1.9B vs bank-reported UGX 1.87B', participant: 'DFCU Bank', triggeredAt: '2026-05-31T23:45:00Z', status: 'investigating', rule: 'SETTLEMENT_MISMATCH_GT_1PCT' },
  { id: 'AML-004', type: 'High Value Payment', severity: 'medium', description: 'Single UGX 45M payment to URA — exceeds automated clearance threshold', transactionId: 'TXN-2026-00511', triggeredAt: '2026-06-01T08:12:00Z', status: 'open', rule: 'HIGHVALUE_GT_40M' },
  { id: 'AML-005', type: 'Blacklist Match', severity: 'critical', description: 'Payment attempt from blacklisted account #BL-0042', payer: 'Kato Investment Holdings', triggeredAt: '2026-06-01T05:44:00Z', status: 'resolved', rule: 'BLACKLIST_MATCH' },
]

export const mockBlacklist: BlacklistedAccount[] = [
  { id: 'BL-0042', accountNumber: '0XX-XXXX-8821', name: 'Kato Investment Holdings', reason: 'Suspected tax fraud — under URA investigation', blacklistedAt: '2026-03-15T00:00:00Z', addedBy: 'Compliance Officer' },
  { id: 'BL-0038', accountNumber: '0XX-XXXX-4417', name: 'Sunrise Trading Ltd', reason: 'AML pattern — structuring below reporting threshold', blacklistedAt: '2026-02-28T00:00:00Z', addedBy: 'Bank of Uganda Operator' },
  { id: 'BL-0031', accountNumber: '0XX-XXXX-9903', name: 'Lagos Express Services', reason: 'Cross-border fund diversion — flagged by FIA', blacklistedAt: '2025-11-10T00:00:00Z', addedBy: 'Compliance Officer' },
]

export const mockAuditLog: AuditLogEntry[] = [
  { id: 'AUD-001', actor: 'Treasury Officer', role: 'Treasury Officer', action: 'APPROVED_SETTLEMENT', resource: 'BATCH-2026-0531-001', timestamp: '2026-05-31T16:30:00Z', ip: '196.43.X.X' },
  { id: 'AUD-002', actor: 'Compliance Officer', role: 'Compliance Officer', action: 'BLACKLISTED_ACCOUNT', resource: 'BL-0042', timestamp: '2026-03-15T09:00:00Z', ip: '196.43.X.X' },
  { id: 'AUD-003', actor: 'Super Admin', role: 'Super Admin', action: 'SUSPENDED_PARTICIPANT', resource: 'BOA', timestamp: '2026-05-20T11:24:00Z', ip: '196.43.X.X' },
  { id: 'AUD-004', actor: 'Settlement Officer', role: 'Settlement Officer', action: 'RERUN_SETTLEMENT', resource: 'BATCH-2026-0531-003', timestamp: '2026-06-01T08:05:00Z', ip: '196.43.X.X' },
]
