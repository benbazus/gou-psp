import type { ComponentType } from 'react'

// ─── Roles ───────────────────────────────────────────────
export type Role =
  | 'Super Admin'
  | 'Bank of Uganda Operator'
  | 'Treasury Officer'
  | 'Agency Officer'
  | 'Compliance Officer'
  | 'Settlement Officer'
  | 'Support Officer'
  | 'Developer'
  | 'RTGS Super Admin'
  | 'Central Bank Settlement Operator'
  | 'Treasury Settlement Officer'
  | 'Bank RTGS Operator'
  | 'Liquidity Manager'
  | 'RTGS Auditor'
  | 'Bank Auditor'
  | 'Collections Manager'
  | 'Agency Auditor'
  | 'Treasury Approver'
  | 'Treasury Auditor'
  | 'Mobile Operator'
  | 'Mobile Auditor'

// ─── Portal ───────────────────────────────────────
export type PortalType =
  | 'national'
  | 'bank'
  | 'rtgs'
  | 'treasury'
  | 'agency'
  | 'mobile'

export interface NavItem {
  path: string
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  external?: boolean
}

export interface NavSection {
  header: string
  accent?: 'amber' | 'emerald' | 'violet' | 'cyan' | 'orange'
  items: NavItem[]
}

export interface PortalConfig {
  portalType: PortalType
  tenantId: string
  tenantName: string
  tenantShort: string
  accentColor: string
  accentLight: string
  accentDark: string
  homeRoute: string
  navSections: NavSection[]
  allowedRoles: Role[]
}

// ─── Shared ──────────────────────────────────────────────
export type Status = 'completed' | 'pending' | 'failed' | 'processing' | 'cancelled' | 'reversed'
export type Channel = 'MTN Mobile Money' | 'Airtel Money' | 'Bank Transfer' | 'Visa/Mastercard' | 'USSD'
export type Region = 'Kampala' | 'Wakiso' | 'Mukono' | 'Jinja' | 'Mbarara' | 'Gulu' | 'Mbale' | 'Arua' | 'Fort Portal' | 'Masaka'

// ─── Agencies ────────────────────────────────────────────
export interface AgencyService {
  id: string
  name: string
  fee: number
  description: string
}

export interface Agency {
  id: string
  name: string
  shortName: string
  type: string
  settlementAccount: string
  services: AgencyService[]
  dailyVolume: number
  monthlyRevenue: number
  status: 'active' | 'inactive'
}

// ─── Participants ─────────────────────────────────────────
export type ParticipantType = 'Bank' | 'Mobile Money Operator' | 'Government Agency' | 'Payment Aggregator' | 'Treasury'

export interface Participant {
  id: string
  name: string
  shortName: string
  type: ParticipantType
  status: 'active' | 'suspended' | 'onboarding'
  apiHealth: 'healthy' | 'degraded' | 'down'
  apiLatency: number // ms
  settlementAccount: string
  dailyVolume: number
  dailyCount: number
  slaStatus: 'compliant' | 'breach' | 'warning'
  riskRating: 'low' | 'medium' | 'high'
  joinedDate: string
  apiHealthHistory: number[] // last 7 data points (latency ms)
}

// ─── Transactions ─────────────────────────────────────────
export interface Transaction {
  id: string
  tenantId: string
  amount: number // UGX
  payer: string
  payee: string
  agency: string
  service: string
  channel: Channel
  status: Status
  region: Region
  prn: string
  timestamp: string
  processingTime: number // ms
  failureReason?: string
}

// ─── Settlements ──────────────────────────────────────────
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'approved' | 'rejected'

export interface SettlementBatch {
  id: string
  tenantId: string
  batchDate: string
  participant: string
  grossAmount: number
  netAmount: number
  transactionCount: number
  status: SettlementStatus
  approvedBy?: string
  completedAt?: string
  failureReason?: string
}

export interface SettlementAccount {
  participant: string
  type: 'Treasury' | 'Agency' | 'Bank'
  accountNumber: string
  balance: number
  pendingInflow: number
  pendingOutflow: number
}

// ─── Disputes ─────────────────────────────────────────────
export type DisputeStatus = 'open' | 'investigating' | 'participant_response' | 'approved' | 'rejected' | 'closed'
export type DisputeType = 'failed_debit' | 'duplicate_payment' | 'incorrect_amount' | 'no_confirmation'

export interface DisputeTimelineEntry {
  stage: string
  actor: string
  timestamp: string
  note: string
}

export interface Dispute {
  id: string
  transactionId: string
  amount: number
  payer: string
  agency: string
  channel: Channel
  type: DisputeType
  status: DisputeStatus
  raisedAt: string
  slaDueAt: string
  timeline: DisputeTimelineEntry[]
  refundAmount?: number
  reversalStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
  reversalRef?: string
  participantNote?: string
}

// ─── Compliance ───────────────────────────────────────────
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface ComplianceAlert {
  id: string
  type: string
  severity: AlertSeverity
  description: string
  payer?: string
  participant?: string
  transactionId?: string
  triggeredAt: string
  status: 'open' | 'investigating' | 'resolved'
  rule: string
}

export interface BlacklistedAccount {
  id: string
  accountNumber: string
  name: string
  reason: string
  blacklistedAt: string
  addedBy: string
}

export interface AuditLogEntry {
  id: string
  actor: string
  role: Role
  action: string
  resource: string
  timestamp: string
  ip: string
}

export interface AmlRule {
  id: string
  code: string
  name: string
  description: string
  threshold: string
  action: 'block' | 'flag' | 'alert'
  severity: AlertSeverity
  status: 'active' | 'paused'
  lastTriggeredAt?: string
  triggeredToday: number
}

export interface SuspiciousTransaction {
  id: string
  transactionId: string
  payer: string
  amount: number
  channel: Channel
  reason: string
  riskScore: number
  flaggedAt: string
  status: 'under_review' | 'cleared' | 'blocked' | 'escalated'
  rule: string
}

export interface HighValuePayment {
  id: string
  transactionId: string
  payer: string
  payee: string
  agency: string
  amount: number
  channel: Channel
  region: Region
  timestamp: string
  clearanceStatus: 'auto_cleared' | 'manual_review' | 'blocked'
  reviewedBy?: string
}

export interface SlaBreachEntry {
  id: string
  participant: string
  type: 'Bank' | 'Mobile Money Operator' | 'Government Agency'
  metric: string
  target: string
  actual: string
  breachSince: string
  severity: AlertSeverity
  status: 'active' | 'resolved'
}

export interface FailedSpike {
  hour: string
  failed: number
  total: number
  threshold: number
  spikeDetected: boolean
}

// ─── Reconciliation ───────────────────────────────────────
export type ReconRecordSource = 'switch' | 'agency' | 'bank' | 'treasury'

export type ReconExceptionType =
  | 'unmatched'
  | 'duplicate'
  | 'missing_confirmation'
  | 'overpayment'
  | 'underpayment'

export type ReconStatus = 'matched' | 'unmatched' | 'exception' | 'resolved'

export interface ReconRecord {
  id: string
  transactionId: string
  payer: string
  payee: string
  agency: string
  channel: Channel
  amount: number
  source: ReconRecordSource
  referenceDate: string
  status: ReconStatus
  exceptionType?: ReconExceptionType
  switchAmount?: number
  reportedAmount?: number
  variance?: number
  resolvedAt?: string
  resolvedBy?: string
  resolutionNote?: string
}

export interface ReconRun {
  id: string
  triggeredBy: string
  startedAt: string
  completedAt?: string
  totalSwitch: number
  totalAgency: number
  totalBank: number
  totalTreasury: number
  matched: number
  unmatched: number
  duplicates: number
  missingConfirmations: number
  overpayments: number
  underpayments: number
  matchRate: number
}

// ─── Routing ──────────────────────────────────────────────
export interface RoutingRule {
  id: string
  priority: number
  channel: Channel
  participant: string
  minAmount: number
  maxAmount: number
  fee: number
  feeType: 'flat' | 'percentage'
  status: 'active' | 'inactive'
}

export interface ChannelHealth {
  channel: Channel
  participant: string
  status: 'healthy' | 'degraded' | 'down'
  latency: number
  uptime: number
  lastChecked: string
}

// ─── Reports ──────────────────────────────────────────────
export interface DailyVolumeStat {
  date: string
  count: number
  amount: number
  success: number
  failed: number
}

export interface AgencyRevenue {
  agency: string
  revenue: number
  count: number
}

export interface ChannelBreakdown {
  channel: string
  count: number
  amount: number
}

export interface RegionalActivity {
  region: Region
  count: number
  amount: number
  successRate: number
  topChannel: string
}

export interface FailureReason {
  reason: string
  count: number
  pct: number
}

// ─── Toast ────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  createdAt: number
}

// ─── MFA / Auth ───────────────────────────────────────────
export type MfaMethod = 'totp' | 'sms' | 'email'

export interface MfaChallenge {
  code: string         // mock generated OTP (shown to user in demo)
  method: MfaMethod
  expiresAt: number    // epoch ms
  attempts: number
}

export interface SessionInfo {
  role: Role
  loginAt: number      // epoch ms
  mfaVerifiedAt: number
  sessionId: string
  ip: string
  tlsVersion: 'TLS 1.3'
  encryptionCipher: 'AES-256-GCM'
  expiresAt: number
}

// ─── Security Event (live audit) ──────────────────────────
export type SecurityEventType =
  | 'LOGIN'
  | 'MFA_VERIFIED'
  | 'MFA_FAILED'
  | 'LOGOUT'
  | 'ROUTE_ACCESS_DENIED'
  | 'SETTLEMENT_APPROVED'
  | 'SETTLEMENT_REJECTED'
  | 'PARTICIPANT_SUSPENDED'
  | 'PARTICIPANT_ACTIVATED'
  | 'BLACKLIST_ADDED'
  | 'CONFIG_CHANGED'
  | 'DISPUTE_RESOLVED'

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  actor: string
  role: Role
  resource?: string
  detail: string
  timestamp: number
  ip: string
  sessionId: string
}

// ─── Agency Portal ────────────────────────────────────────────────────────────
export interface AgencyTransaction {
  id: string
  agencyId: string
  amount: number
  payer: string
  serviceId: string
  serviceName: string
  channel: Channel
  status: 'completed' | 'pending' | 'failed' | 'reversed'
  prn: string
  timestamp: string
  processingTimeMs: number
  failureReason?: string
}

export interface AgencySettlement {
  id: string
  agencyId: string
  batchRef: string
  batchDate: string
  grossAmount: number
  netAmount: number
  fee: number
  transactionCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  settledAt?: string
  slaStatus: 'compliant' | 'breach' | 'warning'
}

export interface AgencyException {
  id: string
  agencyId: string
  transactionId: string
  type: 'unmatched_prn' | 'overpayment' | 'duplicate' | 'failed_settlement' | 'channel_error'
  description: string
  amount: number
  payer: string
  createdAt: string
  status: 'open' | 'resolving' | 'resolved'
  priority: 'high' | 'medium' | 'low'
}

// ─── Mobile Money Portal ──────────────────────────────────────────────────────
export interface MobileTransaction {
  id: string
  operatorId: string
  amount: number
  sender: string
  receiver: string
  type: 'b2c' | 'c2b' | 'p2p' | 'airtime' | 'bill_payment'
  channel: 'USSD' | 'App' | 'Agent'
  status: 'completed' | 'pending' | 'failed' | 'reversed'
  reference: string
  timestamp: string
  fee: number
  failureReason?: string
}

export interface MobileFloat {
  operatorId: string
  available: number
  reserved: number
  threshold: number
  utilizationPct: number
  lastUpdated: string
  intraday: { hour: string; value: number }[]
}

export interface MobileSettlement {
  id: string
  operatorId: string
  batchRef: string
  batchDate: string
  grossAmount: number
  netAmount: number
  fee: number
  transactionCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  settledAt?: string
  slaStatus: 'compliant' | 'breach' | 'warning'
}

// ─── Treasury Portal ──────────────────────────────────────────────────────────
export interface TreasuryDisbursement {
  id: string
  reference: string
  amount: number
  payee: string
  bank: string
  accountNumber: string
  voteCode: string
  ministryLine: string
  description: string
  status: 'pending_approval' | 'approved' | 'processing' | 'completed' | 'rejected'
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  processedAt?: string
  priority: 'urgent' | 'normal' | 'low'
}

export interface TreasuryApproval {
  id: string
  disbursementId: string
  reference: string
  amount: number
  payee: string
  voteCode: string
  ministryLine: string
  description: string
  requestedBy: string
  requestedAt: string
  priority: 'urgent' | 'normal' | 'low'
}

export interface TreasuryAccount {
  id: string
  bank: string
  accountNumber: string
  accountType: 'Consolidated Fund' | 'Salary Account' | 'Development Fund' | 'Donor Fund' | 'Petty Cash'
  currency: 'UGX' | 'USD' | 'EUR'
  balance: number
  pendingDisbursements: number
  availableBalance: number
  lastUpdated: string
}

export interface TreasuryCommitment {
  id: string
  voteCode: string
  ministryLine: string
  description: string
  financialYear: string
  budgetAllocation: number
  committed: number
  actual: number
  balance: number
  utilizationPct: number
  status: 'on_track' | 'at_risk' | 'overrun'
}

export interface ConsolidatedFundEntry {
  date: string
  openingBalance: number
  receipts: number
  disbursements: number
  closingBalance: number
}
