import type {
  ComplianceAlert, BlacklistedAccount, AuditLogEntry,
  AmlRule, SuspiciousTransaction, HighValuePayment, SlaBreachEntry, FailedSpike,
} from '../types'

// ─── AML Alerts ───────────────────────────────────────────────────────────────
export const mockAlerts: ComplianceAlert[] = [
  {
    id: 'AML-001', type: 'High Transaction Volume', severity: 'critical',
    description: 'Single payer made 47 payments totaling UGX 8.4M within 2 hours — exceeds VELOCITY_PAYER_2H_GT_40 threshold',
    payer: 'Unknown Corp Ltd', triggeredAt: '2026-06-01T07:23:00Z', status: 'open', rule: 'VELOCITY_PAYER_2H_GT_40',
  },
  {
    id: 'AML-002', type: 'Repeated Failed Payments', severity: 'high',
    description: 'Account 0XX-XXXX-7741 attempted 19 payments to URA in 30 minutes — all failed. Pattern consistent with account testing or credential stuffing.',
    payer: 'Mwenda Traders Ltd', triggeredAt: '2026-06-01T08:47:00Z', status: 'open', rule: 'FAILED_REPEAT_GT_15_30MIN',
  },
  {
    id: 'AML-003', type: 'Agency Settlement Mismatch', severity: 'high',
    description: 'DFCU Bank settlement batch discrepancy: switch total UGX 1.9B vs bank-reported UGX 1.87B. Variance UGX 30M (1.6%) exceeds 1% threshold.',
    participant: 'DFCU Bank', triggeredAt: '2026-05-31T23:45:00Z', status: 'investigating', rule: 'SETTLEMENT_MISMATCH_GT_1PCT',
  },
  {
    id: 'AML-004', type: 'Bank Response Timeout', severity: 'high',
    description: 'Bank of Africa API returning HTTP 503 for all settlement calls. 89 transactions queued and pending. API down for 73 minutes.',
    participant: 'Bank of Africa', triggeredAt: '2026-06-01T06:00:00Z', status: 'investigating', rule: 'PARTICIPANT_DOWN_GT_60MIN',
  },
  {
    id: 'AML-005', type: 'Mobile Money Confirmation Delay', severity: 'medium',
    description: 'MTN Mobile Money average confirmation time 8.4s — exceeds 5s SLA. 1,240 transactions in delayed state. Possible network congestion on MTN backbone.',
    participant: 'MTN Mobile Money', triggeredAt: '2026-06-01T09:15:00Z', status: 'open', rule: 'MNO_CONFIRM_DELAY_GT_5S',
  },
  {
    id: 'AML-006', type: 'High Value Payment', severity: 'medium',
    description: 'Single UGX 45M payment to URA — exceeds UGX 40M automated clearance threshold. Manual review required before release.',
    transactionId: 'TXN-2026-00511', triggeredAt: '2026-06-01T08:12:00Z', status: 'open', rule: 'HIGHVALUE_GT_40M',
  },
  {
    id: 'AML-007', type: 'Blacklist Match', severity: 'critical',
    description: 'Payment attempt from blacklisted entity #BL-0042. Payment blocked at gateway. FIA notification sent automatically.',
    payer: 'Kato Investment Holdings', triggeredAt: '2026-06-01T05:44:00Z', status: 'resolved', rule: 'BLACKLIST_MATCH',
  },
  {
    id: 'AML-008', type: 'Failed Payment Spike', severity: 'high',
    description: 'Failed payment rate jumped to 18.4% between 09:00–10:00 EAT — 3× the normal 6% baseline. Affecting primarily Airtel Money channel.',
    participant: 'Airtel Money', triggeredAt: '2026-06-01T10:05:00Z', status: 'open', rule: 'FAILURE_RATE_SPIKE_GT_15PCT',
  },
]

// ─── AML Rules ────────────────────────────────────────────────────────────────
export const mockAmlRules: AmlRule[] = [
  { id: 'R-001', code: 'VELOCITY_PAYER_2H_GT_40',    name: 'Payer Velocity — 2 Hour Window',       description: 'Flag payers with more than 40 transactions in any rolling 2-hour window',                  threshold: '> 40 txns / 2h',        action: 'flag',  severity: 'critical', status: 'active', lastTriggeredAt: '2026-06-01T07:23:00Z', triggeredToday: 1 },
  { id: 'R-002', code: 'HIGHVALUE_GT_40M',            name: 'High Value Transaction',                description: 'Flag any single payment exceeding UGX 40,000,000 for manual clearance review',            threshold: '> UGX 40M',             action: 'flag',  severity: 'medium', status: 'active', lastTriggeredAt: '2026-06-01T08:12:00Z', triggeredToday: 1 },
  { id: 'R-003', code: 'BLACKLIST_MATCH',             name: 'Blacklist Screening',                   description: 'Block transactions from or to entities on the UNPS blacklist or FIA sanctions list',       threshold: 'Any match',             action: 'block', severity: 'critical', status: 'active', lastTriggeredAt: '2026-06-01T05:44:00Z', triggeredToday: 1 },
  { id: 'R-004', code: 'FAILED_REPEAT_GT_15_30MIN',  name: 'Repeated Failed Attempts',              description: 'Flag accounts with 15+ consecutive failed payment attempts within 30 minutes',             threshold: '> 15 failures / 30m',   action: 'alert', severity: 'high',     status: 'active', lastTriggeredAt: '2026-06-01T08:47:00Z', triggeredToday: 1 },
  { id: 'R-005', code: 'SETTLEMENT_MISMATCH_GT_1PCT',name: 'Settlement Variance',                    description: 'Alert when participant-reported settlement totals deviate more than 1% from switch totals', threshold: '> 1% variance',         action: 'alert', severity: 'high',     status: 'active', lastTriggeredAt: '2026-05-31T23:45:00Z', triggeredToday: 1 },
  { id: 'R-006', code: 'PARTICIPANT_DOWN_GT_60MIN',  name: 'Participant API Downtime',              description: 'Alert when a participant API remains unreachable for more than 60 consecutive minutes',     threshold: '> 60 min downtime',     action: 'alert', severity: 'high',     status: 'active', lastTriggeredAt: '2026-06-01T06:00:00Z', triggeredToday: 1 },
  { id: 'R-007', code: 'MNO_CONFIRM_DELAY_GT_5S',    name: 'MNO Confirmation Latency',              description: 'Alert when mobile money operator average confirmation time exceeds 5 seconds',              threshold: '> 5s avg',              action: 'alert', severity: 'medium',   status: 'active', lastTriggeredAt: '2026-06-01T09:15:00Z', triggeredToday: 1 },
  { id: 'R-008', code: 'FAILURE_RATE_SPIKE_GT_15PCT',name: 'Failed Payment Rate Spike',             description: 'Alert when channel failure rate exceeds 15% over a 30-minute rolling window',              threshold: '> 15% failure rate',    action: 'alert', severity: 'high',     status: 'active', lastTriggeredAt: '2026-06-01T10:05:00Z', triggeredToday: 1 },
  { id: 'R-009', code: 'STRUCTURING_BELOW_5M',       name: 'Structuring Pattern Detection',         description: 'Flag accounts making multiple payments just below UGX 5M threshold (structuring behavior)', threshold: 'Pattern: 3+ txns 4–5M', action: 'flag',  severity: 'high',     status: 'active', lastTriggeredAt: '2026-05-30T14:20:00Z', triggeredToday: 0 },
  { id: 'R-010', code: 'CROSSBORDER_GT_10M',         name: 'Cross-Border Large Transfer',           description: 'Flag outbound cross-border transfers exceeding UGX 10M for FIA review',                    threshold: '> UGX 10M outbound',    action: 'flag',  severity: 'medium',   status: 'active',                               triggeredToday: 0 },
  { id: 'R-011', code: 'SLA_BREACH_RESPONSE_2MIN',   name: 'Participant SLA Breach',                description: 'Alert when participant average response time exceeds 2 minutes during settlement window',   threshold: '> 2 min response',      action: 'alert', severity: 'medium',   status: 'active',                               triggeredToday: 2 },
  { id: 'R-012', code: 'DORMANT_ACCOUNT_LARGE_TXN',  name: 'Dormant Account Activity',              description: 'Flag accounts with no activity for 180+ days making a transaction above UGX 1M',           threshold: '180d dormant + > 1M',   action: 'flag',  severity: 'medium',   status: 'paused',                               triggeredToday: 0 },
]

// ─── Suspicious Transactions ──────────────────────────────────────────────────
export const mockSuspiciousTransactions: SuspiciousTransaction[] = [
  { id: 'SUP-001', transactionId: 'TXN-2026-07823', payer: 'Unknown Corp Ltd',      amount: 185_000, channel: 'MTN Mobile Money', reason: 'Payer velocity: 47 transactions in 2 hours', riskScore: 94, flaggedAt: '2026-06-01T07:23:00Z', status: 'under_review', rule: 'VELOCITY_PAYER_2H_GT_40' },
  { id: 'SUP-002', transactionId: 'TXN-2026-07824', payer: 'Unknown Corp Ltd',      amount: 192_000, channel: 'MTN Mobile Money', reason: 'Payer velocity: structuring pattern detected', riskScore: 92, flaggedAt: '2026-06-01T07:24:00Z', status: 'under_review', rule: 'VELOCITY_PAYER_2H_GT_40' },
  { id: 'SUP-003', transactionId: 'TXN-2026-07831', payer: 'Mwenda Traders Ltd',    amount: 95_000,  channel: 'Airtel Money',    reason: 'Repeated failed attempts: 19 failures in 30 min', riskScore: 88, flaggedAt: '2026-06-01T08:47:00Z', status: 'blocked',      rule: 'FAILED_REPEAT_GT_15_30MIN' },
  { id: 'SUP-004', transactionId: 'TXN-2026-00511', payer: 'Ssemwogerere Holdings', amount: 45_000_000, channel: 'Bank Transfer', reason: 'High-value payment: UGX 45M to URA — manual clearance required', riskScore: 75, flaggedAt: '2026-06-01T08:12:00Z', status: 'under_review', rule: 'HIGHVALUE_GT_40M' },
  { id: 'SUP-005', transactionId: 'TXN-2026-07104', payer: 'Sunrise Trading Ltd',   amount: 4_900_000, channel: 'Bank Transfer', reason: 'Structuring: 4th transaction just below UGX 5M threshold', riskScore: 81, flaggedAt: '2026-05-31T14:20:00Z', status: 'escalated',   rule: 'STRUCTURING_BELOW_5M' },
  { id: 'SUP-006', transactionId: 'TXN-2026-07105', payer: 'Sunrise Trading Ltd',   amount: 4_850_000, channel: 'Bank Transfer', reason: 'Structuring: linked to SUP-005 — same account, same pattern', riskScore: 83, flaggedAt: '2026-05-31T14:35:00Z', status: 'escalated',   rule: 'STRUCTURING_BELOW_5M' },
  { id: 'SUP-007', transactionId: 'TXN-2026-07240', payer: 'Nakato Sarah',          amount: 12_000_000, channel: 'MTN Mobile Money', reason: 'Cross-border transfer: UGX 12M flagged for FIA review', riskScore: 70, flaggedAt: '2026-06-01T06:50:00Z', status: 'cleared',     rule: 'CROSSBORDER_GT_10M' },
  { id: 'SUP-008', transactionId: 'TXN-2026-07512', payer: 'Ochieng David',         amount: 4_750_000, channel: 'Airtel Money',  reason: 'Dormant account (220 days): large transaction UGX 4.75M', riskScore: 67, flaggedAt: '2026-06-01T09:30:00Z', status: 'under_review', rule: 'DORMANT_ACCOUNT_LARGE_TXN' },
]

// ─── High-Value Payments ──────────────────────────────────────────────────────
export const mockHighValuePayments: HighValuePayment[] = [
  { id: 'HVP-001', transactionId: 'TXN-2026-00511', payer: 'Ssemwogerere Holdings',  payee: 'Uganda Revenue Authority', agency: 'URA',  amount: 45_000_000,  channel: 'Bank Transfer',    region: 'Kampala', timestamp: '2026-06-01T08:12:00Z', clearanceStatus: 'manual_review' },
  { id: 'HVP-002', transactionId: 'TXN-2026-00441', payer: 'Nile Breweries Ltd',     payee: 'Uganda Revenue Authority', agency: 'URA',  amount: 182_400_000, channel: 'Bank Transfer',    region: 'Kampala', timestamp: '2026-06-01T07:00:00Z', clearanceStatus: 'auto_cleared',  reviewedBy: 'Auto' },
  { id: 'HVP-003', transactionId: 'TXN-2026-00389', payer: 'MTN Uganda Ltd',          payee: 'Uganda Revenue Authority', agency: 'URA',  amount: 1_240_000_000, channel: 'Bank Transfer', region: 'Kampala', timestamp: '2026-05-31T15:30:00Z', clearanceStatus: 'auto_cleared',  reviewedBy: 'Auto' },
  { id: 'HVP-004', transactionId: 'TXN-2026-00502', payer: 'Uganda Airlines Ltd',    payee: 'Ministry of Lands',        agency: 'Ministry of Lands', amount: 68_000_000, channel: 'Bank Transfer', region: 'Kampala', timestamp: '2026-06-01T09:45:00Z', clearanceStatus: 'manual_review' },
  { id: 'HVP-005', transactionId: 'TXN-2026-00480', payer: 'Kakira Sugar Works',     payee: 'Uganda Revenue Authority', agency: 'URA',  amount: 420_000_000, channel: 'Bank Transfer',    region: 'Jinja',   timestamp: '2026-06-01T06:20:00Z', clearanceStatus: 'auto_cleared',  reviewedBy: 'Auto' },
  { id: 'HVP-006', transactionId: 'TXN-2026-00491', payer: 'Aga Khan Development',   payee: 'URSB',                     agency: 'URSB', amount: 55_000_000,  channel: 'Bank Transfer',    region: 'Kampala', timestamp: '2026-06-01T10:15:00Z', clearanceStatus: 'blocked' },
]

// ─── SLA Breaches ─────────────────────────────────────────────────────────────
export const mockSlaBreaches: SlaBreachEntry[] = [
  { id: 'SLA-001', participant: 'MTN Mobile Money',  type: 'Mobile Money Operator', metric: 'Avg confirmation time',  target: '≤ 5s',    actual: '8.4s',  breachSince: '2026-06-01T09:15:00Z', severity: 'medium', status: 'active' },
  { id: 'SLA-002', participant: 'Bank of Africa',    type: 'Bank',                  metric: 'API availability',       target: '99.9%',   actual: '0%',    breachSince: '2026-06-01T06:00:00Z', severity: 'high',   status: 'active' },
  { id: 'SLA-003', participant: 'Airtel Money',      type: 'Mobile Money Operator', metric: 'Failed transaction rate', target: '≤ 5%',    actual: '18.4%', breachSince: '2026-06-01T10:05:00Z', severity: 'high',   status: 'active' },
  { id: 'SLA-004', participant: 'DFCU Bank',         type: 'Bank',                  metric: 'Settlement reconciliation', target: '≤ 1% variance', actual: '1.6%', breachSince: '2026-05-31T23:45:00Z', severity: 'high', status: 'active' },
  { id: 'SLA-005', participant: 'Housing Finance',   type: 'Bank',                  metric: 'Avg API response time',  target: '≤ 2s',    actual: '4.1s',  breachSince: '2026-06-01T08:00:00Z', severity: 'medium', status: 'active' },
  { id: 'SLA-006', participant: 'Equity Bank',       type: 'Bank',                  metric: 'Avg API response time',  target: '≤ 2s',    actual: '2.3s',  breachSince: '2026-06-01T07:30:00Z', severity: 'low',    status: 'resolved' },
]

// ─── Failed Payment Spikes (hourly, today) ────────────────────────────────────
export const mockFailedSpikes: FailedSpike[] = Array.from({ length: 24 }, (_, i) => {
  const failed = i === 9  ? 184  // spike at 09:00
               : i === 10 ? 220  // spike at 10:00
               : i === 3  ? 48   // small spike at 03:00
               : 20 + Math.floor(Math.random() * 40)
  const total  = 800 + Math.floor(Math.random() * 400)
  return {
    hour:          `${String(i).padStart(2, '0')}:00`,
    failed,
    total,
    threshold:     120,
    spikeDetected: failed > 120,
  }
})

// ─── Velocity check data (per-hour window, 24h) ───────────────────────────────
export const mockVelocityData = Array.from({ length: 24 }, (_, i) => ({
  hour:      `${String(i).padStart(2, '0')}:00`,
  volume:    8000 + Math.floor(Math.random() * 12000),
  threshold: 15000,
}))

// ─── Blacklist ─────────────────────────────────────────────────────────────────
export const mockBlacklist: BlacklistedAccount[] = [
  { id: 'BL-0042', accountNumber: '0XX-XXXX-8821', name: 'Kato Investment Holdings',  reason: 'Suspected tax fraud — under URA investigation',                      blacklistedAt: '2026-03-15T00:00:00Z', addedBy: 'Compliance Officer' },
  { id: 'BL-0038', accountNumber: '0XX-XXXX-4417', name: 'Sunrise Trading Ltd',        reason: 'AML pattern — structuring payments below UGX 5M reporting threshold', blacklistedAt: '2026-02-28T00:00:00Z', addedBy: 'Bank of Uganda Operator' },
  { id: 'BL-0031', accountNumber: '0XX-XXXX-9903', name: 'Lagos Express Services',     reason: 'Cross-border fund diversion — flagged by Financial Intelligence Authority', blacklistedAt: '2025-11-10T00:00:00Z', addedBy: 'Compliance Officer' },
  { id: 'BL-0027', accountNumber: '0XX-XXXX-1155', name: 'Mwenda Traders Ltd',         reason: 'Repeated credential testing — 19 failed attempts in 30 min',          blacklistedAt: '2026-06-01T09:00:00Z', addedBy: 'Compliance Officer' },
  { id: 'BL-0019', accountNumber: '0XX-XXXX-7734', name: 'Nkunda Cash Services',       reason: 'FATF sanctions match — East Africa Financial Action Task Force',       blacklistedAt: '2025-08-22T00:00:00Z', addedBy: 'Bank of Uganda Operator' },
]

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const mockAuditLog: AuditLogEntry[] = [
  { id: 'AUD-SEC-001', actor: 'Super Admin',         role: 'Super Admin',         action: 'USER_LOGIN',            resource: 'SESSION-2026-06-01-001', timestamp: '2026-06-01T06:00:00Z', ip: '196.43.112.45' },
  { id: 'AUD-SEC-002', actor: 'Super Admin',         role: 'Super Admin',         action: 'MFA_VERIFIED',          resource: 'SESSION-2026-06-01-001', timestamp: '2026-06-01T06:00:05Z', ip: '196.43.112.45' },
  { id: 'AUD-SEC-003', actor: 'Compliance Officer',  role: 'Compliance Officer',  action: 'USER_LOGIN',            resource: 'SESSION-2026-06-01-002', timestamp: '2026-06-01T06:15:00Z', ip: '196.43.88.201' },
  { id: 'AUD-SEC-004', actor: 'Compliance Officer',  role: 'Compliance Officer',  action: 'MFA_VERIFIED',          resource: 'SESSION-2026-06-01-002', timestamp: '2026-06-01T06:15:08Z', ip: '196.43.88.201' },
  { id: 'AUD-SEC-005', actor: 'Developer',           role: 'Developer',           action: 'MFA_FAILED',            resource: 'SESSION-ATTEMPT-003',    timestamp: '2026-06-01T06:30:11Z', ip: '197.156.44.7' },
  { id: 'AUD-SEC-006', actor: 'Developer',           role: 'Developer',           action: 'MFA_VERIFIED',          resource: 'SESSION-2026-06-01-003', timestamp: '2026-06-01T06:30:45Z', ip: '197.156.44.7' },
  { id: 'AUD-SEC-007', actor: 'Treasury Officer',    role: 'Treasury Officer',    action: 'ROUTE_ACCESS_DENIED',   resource: '/app/admin',             timestamp: '2026-06-01T07:04:18Z', ip: '196.43.77.55' },
  { id: 'AUD-001',     actor: 'Treasury Officer',    role: 'Treasury Officer',    action: 'APPROVED_SETTLEMENT',   resource: 'BATCH-2026-0531-001',    timestamp: '2026-05-31T16:30:00Z', ip: '196.43.77.55' },
  { id: 'AUD-002',     actor: 'Compliance Officer',  role: 'Compliance Officer',  action: 'BLACKLISTED_ACCOUNT',   resource: 'BL-0042',                timestamp: '2026-03-15T09:00:00Z', ip: '196.43.88.201' },
  { id: 'AUD-003',     actor: 'Super Admin',         role: 'Super Admin',         action: 'SUSPENDED_PARTICIPANT', resource: 'BOA',                    timestamp: '2026-05-20T11:24:00Z', ip: '196.43.112.45' },
  { id: 'AUD-004',     actor: 'Settlement Officer',  role: 'Settlement Officer',  action: 'RERUN_SETTLEMENT',      resource: 'BATCH-2026-0531-003',    timestamp: '2026-06-01T08:05:00Z', ip: '196.43.91.130' },
  { id: 'AUD-005',     actor: 'Super Admin',         role: 'Super Admin',         action: 'CONFIG_CHANGED',        resource: 'ROUTING_RULES',          timestamp: '2026-06-01T09:22:00Z', ip: '196.43.112.45' },
  { id: 'AUD-006',     actor: 'Compliance Officer',  role: 'Compliance Officer',  action: 'DISPUTE_RESOLVED',      resource: 'DISP-2026-0041',         timestamp: '2026-06-01T09:45:00Z', ip: '196.43.88.201' },
  { id: 'AUD-007',     actor: 'Treasury Officer',    role: 'Treasury Officer',    action: 'APPROVED_SETTLEMENT',   resource: 'BATCH-2026-0601-001',    timestamp: '2026-06-01T10:00:00Z', ip: '196.43.77.55' },
  { id: 'AUD-008',     actor: 'Super Admin',         role: 'Super Admin',         action: 'PARTICIPANT_ACTIVATED', resource: 'BOA',                    timestamp: '2026-06-01T10:15:00Z', ip: '196.43.112.45' },
  { id: 'AUD-009',     actor: 'Compliance Officer',  role: 'Compliance Officer',  action: 'ALERT_INVESTIGATED',    resource: 'AML-002',                timestamp: '2026-06-01T10:30:00Z', ip: '196.43.88.201' },
  { id: 'AUD-010',     actor: 'Compliance Officer',  role: 'Compliance Officer',  action: 'BLACKLISTED_ACCOUNT',   resource: 'BL-0027',                timestamp: '2026-06-01T09:00:00Z', ip: '196.43.88.201' },
  { id: 'AUD-011',     actor: 'Bank of Uganda Operator', role: 'Bank of Uganda Operator', action: 'SLA_BREACH_ACKNOWLEDGED', resource: 'SLA-001',       timestamp: '2026-06-01T09:30:00Z', ip: '196.43.55.10' },
  { id: 'AUD-012',     actor: 'Super Admin',         role: 'Super Admin',         action: 'HIGH_VALUE_CLEARED',    resource: 'HVP-002',                timestamp: '2026-06-01T07:05:00Z', ip: '196.43.112.45' },
]
