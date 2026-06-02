// src/types/rtgs.ts

export type RTGSTransactionStatus =
  | 'queued'
  | 'high_priority'
  | 'liquidity_wait'
  | 'pending_auth'
  | 'processing'
  | 'settled'
  | 'failed'
  | 'held'
  | 'reversed'

export type RTGSPriority = 'critical' | 'high' | 'normal' | 'low'

export type RTGSLiquidityStatus = 'available' | 'marginal' | 'insufficient'

export type RTGSApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected'

export interface RTGSAuditEntry {
  timestamp: string
  actor: string
  action: string
  detail: string
}

export interface RTGSTransaction {
  id: string
  rtgsRef: string
  amount: number
  senderBank: string
  receiverBank: string
  purpose: string
  priority: RTGSPriority
  status: RTGSTransactionStatus
  submittedAt: string
  settlementWindow: string
  liquidityStatus: RTGSLiquidityStatus
  approvalStatus: RTGSApprovalStatus
  approvedBy?: string
  settledAt?: string
  failureReason?: string
  fees: number
  auditLog: RTGSAuditEntry[]
}

export interface LiquidityPosition {
  bankId: string
  bankName: string
  bankShort: string
  openingBalance: number
  availableLiquidity: number
  intradayLiquidity: number
  pledgedCollateral: number
  queuedOutgoing: number
  settledOutgoing: number
  settledIncoming: number
  utilizationPct: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  warningThreshold: number
  onWatchlist: boolean
}

export type RTGSParticipantType = 'Commercial Bank' | 'Treasury Account' | 'Government Agency' | 'Central Bank'

export interface RTGSParticipant {
  id: string
  name: string
  shortName: string
  type: RTGSParticipantType
  rtgsStatus: 'active' | 'suspended' | 'onboarding'
  settlementAccount: string
  dailyLimit: number
  singleTransactionLimit: number
  liquidityPosition: number
  apiHealth: 'healthy' | 'degraded' | 'down'
  apiLatency: number
  approvalRequired: boolean
  riskRating: 'low' | 'medium' | 'high'
  joinedDate: string
  dailyTransactionCount: number
  dailySettledValue: number
}

export type RTGSExceptionType =
  | 'insufficient_liquidity'
  | 'duplicate_instruction'
  | 'invalid_beneficiary'
  | 'invalid_account'
  | 'compliance_flag'
  | 'settlement_timeout'
  | 'rejected_authorization'
  | 'failed_confirmation'
  | 'treasury_mismatch'
  | 'reversal_request'

export interface RTGSException {
  id: string
  type: RTGSExceptionType
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'investigating' | 'escalated' | 'resolved' | 'closed'
  transactionRef: string
  amount: number
  senderBank: string
  receiverBank: string
  assignedTo?: string
  slaDeadline: string
  raisedAt: string
  rootCause: string
  recommendedAction: string
  auditLog: RTGSAuditEntry[]
}

export type TreasuryWorkflowType =
  | 'ministry_vendor_payment'
  | 'treasury_disbursement'
  | 'ura_remittance'
  | 'salary_bulk_settlement'
  | 'emergency_priority'

export interface TreasuryStep {
  step: number
  label: string
  actor: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp?: string
  note?: string
}

export interface RTGSTreasuryWorkflow {
  id: string
  type: TreasuryWorkflowType
  title: string
  description: string
  amount: number
  originator: string
  beneficiary: string
  reference: string
  priority: RTGSPriority
  status: RTGSTransactionStatus
  steps: TreasuryStep[]
  createdAt: string
}

export type SimulatorScenario =
  | 'successful_settlement'
  | 'insufficient_liquidity'
  | 'queued_settlement'
  | 'rejected_settlement'
  | 'timeout'
  | 'manual_override'
  | 'reversal'

export type SimulatorNodeState = 'idle' | 'active' | 'completed' | 'failed' | 'skipped' | 'waiting' | 'overridden'

export interface RTGSSimulatorNode {
  id: string
  label: string
  description: string
  state: SimulatorNodeState
}

export type SimulatorRunStatus = 'idle' | 'running' | 'completed' | 'failed'

export interface RTGSSimulatorRun {
  scenario: SimulatorScenario
  currentStep: number
  nodes: RTGSSimulatorNode[]
  rtgsRef: string
  amount: number
  senderBank: string
  receiverBank: string
  status: SimulatorRunStatus
  auditLog: RTGSAuditEntry[]
  finalOutcome?: string
}

export type RTGSEventType =
  | 'settled'
  | 'queued'
  | 'failed'
  | 'authorized'
  | 'liquidity_injected'
  | 'exception_raised'
  | 'reversed'

export interface RTGSLiveEvent {
  id: string
  type: RTGSEventType
  rtgsRef: string
  amount: number
  senderBank: string
  receiverBank: string
  timestamp: string
  detail: string
}

export interface RTGSKpi {
  totalValueToday: number
  totalTransactions: number
  pendingInstructions: number
  settledTransactions: number
  failedTransactions: number
  queueDepth: number
  avgSettlementTimeSecs: number
  liquidityUtilizationPct: number
  activeBanks: number
  treasuryTransferValue: number
  systemUptimePct: number
  netPosition: number
}

export interface ApprovalChainEntry {
  role: string
  actor: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp?: string
}

export interface InterbankTransfer {
  id: string
  rtgsRef: string
  senderBank: string
  receiverBank: string
  amount: number
  purpose: string
  status: RTGSTransactionStatus
  liquidityImpact: number
  fees: number
  submittedAt: string
  settledAt?: string
  approvalChain: ApprovalChainEntry[]
  auditLog: RTGSAuditEntry[]
}
