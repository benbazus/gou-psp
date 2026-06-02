import type { Transaction, SettlementBatch } from '../types'
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

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const tenantService = {
  // National portal — platform-level transactions
  getPlatformTransactions: (tenantId: string): Promise<Transaction[]> =>
    delay(
      tenantId === 'national'
        ? mockTransactions
        : mockTransactions.filter((t) => t.tenantId === tenantId)
    ),

  // National portal — settlement batches
  getPlatformSettlements: (tenantId: string): Promise<SettlementBatch[]> =>
    delay(
      tenantId === 'national'
        ? mockSettlementBatches
        : mockSettlementBatches.filter((s) => s.tenantId === tenantId)
    ),

  // Bank portal — transactions (optionally filtered by direction)
  getBankTransactions: (tenantId: string, direction?: 'incoming' | 'outgoing'): Promise<BankTransaction[]> =>
    delay(
      mockBankTransactions
        .filter((t) => t.tenantId === tenantId)
        .filter((t) => !direction || t.direction === direction)
    ),

  // Bank portal — liquidity position
  getBankLiquidity: (tenantId: string): Promise<BankLiquidity> =>
    delay(mockBankLiquidity[tenantId] ?? mockBankLiquidity['stanbic']),

  // Bank portal — settlement batches
  getBankSettlements: (tenantId: string): Promise<BankSettlement[]> =>
    delay(mockBankSettlements.filter((s) => s.tenantId === tenantId)),

  // Bank portal — RTGS queue
  getBankQueue: (tenantId: string): Promise<BankQueueEntry[]> =>
    delay(mockBankQueue.filter((q) => q.tenantId === tenantId)),

  // Bank portal — exceptions
  getBankExceptions: (tenantId: string): Promise<BankException[]> =>
    delay(mockBankExceptions.filter((e) => e.tenantId === tenantId)),
}
