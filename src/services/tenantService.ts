import type { Transaction, SettlementBatch, AgencyTransaction, AgencySettlement, AgencyException, MobileTransaction, MobileFloat, MobileSettlement, TreasuryDisbursement, TreasuryApproval, TreasuryAccount, TreasuryCommitment, ConsolidatedFundEntry, AggregatorMerchant, AggregatorTransaction, AggregatorSettlement, AggregatorFeeSchedule } from '../types'
import type { BankTransaction } from '../data/mockBankTransactions'
import type { BankLiquidity } from '../data/mockBankLiquidity'
import type { BankSettlement } from '../data/mockBankSettlements'
import type { BankQueueEntry } from '../data/mockBankQueue'
import type { BankException } from '../data/mockBankExceptions'

import { mockTransactions } from '../data/mockTransactions'
import { mockSettlementBatches } from '../data/mockSettlements'
import { mockBankTransactions } from '../data/mockBankTransactions'
import { mockBankLiquidity } from '../data/mockBankLiquidity'
import { mockBankSettlements } from '../data/mockBankSettlements'
import { mockBankQueue } from '../data/mockBankQueue'
import { mockBankExceptions } from '../data/mockBankExceptions'
import { mockAgencyTransactions } from '../data/mockAgencyTransactions'
import { mockAgencySettlements } from '../data/mockAgencySettlements'
import { mockAgencyExceptions } from '../data/mockAgencyExceptions'
import { mockMobileTransactions } from '../data/mockMobileTransactions'
import { mockMobileFloat } from '../data/mockMobileFloat'
import { mockMobileSettlements } from '../data/mockMobileSettlements'
import {
  mockTreasuryDisbursements, mockTreasuryApprovals, mockTreasuryAccounts,
  mockTreasuryCommitments, mockConsolidatedFund,
} from '../data/mockTreasuryData'
import { mockAggregatorMerchants, mockAggregatorTransactions, mockAggregatorSettlements, mockAggregatorFees } from '../data/mockAggregatorData'

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const tenantService = {
  // ── National portal ─────────────────────────────────────────────────────────
  getPlatformTransactions: (tenantId: string): Promise<Transaction[]> =>
    delay(
      tenantId === 'national'
        ? mockTransactions
        : mockTransactions.filter((t) => t.tenantId === tenantId)
    ),

  getPlatformSettlements: (tenantId: string): Promise<SettlementBatch[]> =>
    delay(
      tenantId === 'national'
        ? mockSettlementBatches
        : mockSettlementBatches.filter((s) => s.tenantId === tenantId)
    ),

  // ── Bank portal ──────────────────────────────────────────────────────────────
  getBankTransactions: (tenantId: string, direction?: 'incoming' | 'outgoing'): Promise<BankTransaction[]> =>
    delay(
      mockBankTransactions
        .filter((t) => t.tenantId === tenantId)
        .filter((t) => !direction || t.direction === direction)
    ),

  getBankLiquidity: (tenantId: string): Promise<BankLiquidity> =>
    delay(mockBankLiquidity[tenantId] ?? mockBankLiquidity['stanbic']),

  getBankSettlements: (tenantId: string): Promise<BankSettlement[]> =>
    delay(mockBankSettlements.filter((s) => s.tenantId === tenantId)),

  getBankQueue: (tenantId: string): Promise<BankQueueEntry[]> =>
    delay(mockBankQueue.filter((q) => q.tenantId === tenantId)),

  getBankExceptions: (tenantId: string): Promise<BankException[]> =>
    delay(mockBankExceptions.filter((e) => e.tenantId === tenantId)),

  // ── Agency portal ────────────────────────────────────────────────────────────
  getAgencyTransactions: (agencyId: string): Promise<AgencyTransaction[]> =>
    delay(mockAgencyTransactions.filter((t) => t.agencyId === agencyId)),

  getAgencySettlements: (agencyId: string): Promise<AgencySettlement[]> =>
    delay(mockAgencySettlements.filter((s) => s.agencyId === agencyId)),

  getAgencyExceptions: (agencyId: string): Promise<AgencyException[]> =>
    delay(mockAgencyExceptions.filter((e) => e.agencyId === agencyId)),

  // ── Mobile portal ────────────────────────────────────────────────────────────
  getMobileTransactions: (operatorId: string): Promise<MobileTransaction[]> =>
    delay(mockMobileTransactions.filter((t) => t.operatorId === operatorId)),

  getMobileFloat: (operatorId: string): Promise<MobileFloat> =>
    delay(mockMobileFloat[operatorId] ?? mockMobileFloat['mtn']),

  getMobileSettlements: (operatorId: string): Promise<MobileSettlement[]> =>
    delay(mockMobileSettlements.filter((s) => s.operatorId === operatorId)),

  // ── Treasury portal ──────────────────────────────────────────────────────────
  getTreasuryDisbursements: (): Promise<TreasuryDisbursement[]> =>
    delay(mockTreasuryDisbursements),

  getTreasuryApprovals: (): Promise<TreasuryApproval[]> =>
    delay(mockTreasuryApprovals),

  getTreasuryAccounts: (): Promise<TreasuryAccount[]> =>
    delay(mockTreasuryAccounts),

  getTreasuryCommitments: (): Promise<TreasuryCommitment[]> =>
    delay(mockTreasuryCommitments),

  getTreasuryConsolidatedFund: (): Promise<ConsolidatedFundEntry[]> =>
    delay(mockConsolidatedFund),

  // ── Aggregator portal ────────────────────────────────────────────────────────
  getAggregatorMerchants:    (aggregatorId: string): Promise<AggregatorMerchant[]>    => delay(mockAggregatorMerchants.filter((m) => m.aggregatorId === aggregatorId)),
  getAggregatorTransactions: (aggregatorId: string): Promise<AggregatorTransaction[]> => delay(mockAggregatorTransactions.filter((t) => t.aggregatorId === aggregatorId)),
  getAggregatorSettlements:  (aggregatorId: string): Promise<AggregatorSettlement[]>  => delay(mockAggregatorSettlements.filter((s) => s.aggregatorId === aggregatorId)),
  getAggregatorFees:         (aggregatorId: string): Promise<AggregatorFeeSchedule[]> => delay(mockAggregatorFees.filter((f) => f.aggregatorId === aggregatorId)),
}
