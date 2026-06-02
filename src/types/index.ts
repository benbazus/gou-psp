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
