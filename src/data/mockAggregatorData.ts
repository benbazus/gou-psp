import type { AggregatorMerchant, AggregatorTransaction, AggregatorSettlement, AggregatorFeeSchedule } from '../types'

const AGGREGATOR_IDS = ['pesalink', 'interswitch', 'flutterwave'] as const

const MERCHANT_NAMES = [
  'Jumia Uganda', 'Uber Uganda', 'Safeboda', 'Quickmart', 'Pizza Hut Kampala',
  'Uganda Airlines', 'Makerere University', 'Mulago Hospital', 'City Oil', 'Java House',
]

const CATEGORIES: AggregatorMerchant['category'][] = [
  'E-Commerce', 'Transport', 'Transport', 'FMCG', 'Hospitality',
  'Transport', 'Education', 'Health', 'Utilities', 'Hospitality',
]

export const mockAggregatorMerchants: AggregatorMerchant[] = AGGREGATOR_IDS.flatMap((agg, ai) =>
  MERCHANT_NAMES.map((name, i) => ({
    id: `${agg}-M${String(i + 1).padStart(2, '0')}`,
    aggregatorId: agg,
    name,
    category: CATEGORIES[i],
    status: agg === 'flutterwave' ? 'onboarding' : i === 7 ? 'suspended' : 'active',
    dailyVolume:      agg === 'flutterwave' ? 0 : Math.floor((10 - i) * 28_000_000 * (ai === 1 ? 1.5 : 1)),
    monthlyVolume:    agg === 'flutterwave' ? 0 : Math.floor((10 - i) * 28_000_000 * (ai === 1 ? 1.5 : 1)) * 22,
    transactionCount: agg === 'flutterwave' ? 0 : (10 - i) * 80 * (ai + 1),
    settlementAccount: `AGG-${agg.toUpperCase().slice(0, 4)}-M${String(i + 1).padStart(2, '0')}`,
    joinedDate: `202${3 + ai}-0${(i % 9) + 1}-${String((i * 3 + 1) % 28 + 1).padStart(2, '0')}`,
    apiHealth: i === 7 ? 'down' : i === 4 ? 'degraded' : 'healthy',
  }))
)

const TXN_TYPES: AggregatorTransaction['type'][] = ['card', 'mobile_money', 'bank_transfer', 'ussd']
const CHANNELS = ['Visa', 'Mastercard', 'MTN MoMo', 'Airtel Money', 'SWIFT', 'USSD *185#', 'Stanbic API']
const FAILURE_REASONS = ['Insufficient funds', 'Card declined', 'Network timeout', 'Invalid account']

export const mockAggregatorTransactions: AggregatorTransaction[] = AGGREGATOR_IDS.flatMap((agg, ai) =>
  Array.from({ length: 40 }, (_, i) => {
    const type = TXN_TYPES[i % 4]
    const status = agg === 'flutterwave' ? 'pending' : i % 10 === 7 ? 'failed' : i % 15 === 0 ? 'reversed' : 'completed'
    const amount = (8 - (i % 8)) * 125_000 * (ai === 1 ? 1.4 : 1)
    return {
      id: `AT-${agg.slice(0, 4).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      aggregatorId: agg,
      merchantId: `${agg}-M${String((i % 10) + 1).padStart(2, '0')}`,
      merchantName: MERCHANT_NAMES[i % 10],
      amount,
      type,
      channel: CHANNELS[i % CHANNELS.length],
      status,
      reference: `TXN-${agg.toUpperCase().slice(0, 3)}-${Date.now() - i * 90000}`.slice(0, 24),
      timestamp: new Date(Date.now() - i * 92000 - ai * 3600000).toISOString(),
      fee: Math.round(amount * (type === 'card' ? 0.02 : 0.015)),
      failureReason: status === 'failed' ? FAILURE_REASONS[i % FAILURE_REASONS.length] : undefined,
    }
  })
)

export const mockAggregatorSettlements: AggregatorSettlement[] = AGGREGATOR_IDS.flatMap((agg, ai) =>
  Array.from({ length: 12 }, (_, i) => {
    const gross = (12 - i) * 4_800_000 * (ai === 1 ? 1.6 : 1)
    const fee = Math.round(gross * 0.008)
    const status = i === 0 ? 'processing' : i % 6 === 5 ? 'failed' : 'completed'
    return {
      id: `AS-${agg.slice(0, 4).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      aggregatorId: agg,
      merchantId: `${agg}-M${String((i % 10) + 1).padStart(2, '0')}`,
      merchantName: MERCHANT_NAMES[i % 10],
      batchRef: `BATCH-AGG-${agg.toUpperCase().slice(0, 3)}-${20260520 + i}`,
      batchDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      grossAmount: gross,
      netAmount: gross - fee,
      fee,
      transactionCount: (12 - i) * 18,
      status,
      settledAt: status === 'completed' ? new Date(Date.now() - i * 86400000 + 3600000).toISOString() : undefined,
      slaStatus: i % 8 === 7 ? 'breach' : i % 5 === 4 ? 'warning' : 'compliant',
    }
  })
)

const CATEGORIES_LIST: AggregatorMerchant['category'][] = ['E-Commerce', 'Utilities', 'Education', 'Health', 'Transport', 'Hospitality', 'FMCG']
const TXN_TYPES_LIST: AggregatorTransaction['type'][] = ['card', 'mobile_money', 'bank_transfer', 'ussd']

export const mockAggregatorFees: AggregatorFeeSchedule[] = AGGREGATOR_IDS.flatMap((agg, ai) =>
  CATEGORIES_LIST.flatMap((cat, ci) =>
    TXN_TYPES_LIST.map((type, ti) => ({
      id: `FEE-${agg.slice(0, 3).toUpperCase()}-${ci}-${ti}`,
      aggregatorId: agg,
      merchantCategory: cat,
      transactionType: type,
      feeType: type === 'card' ? 'percentage' : ti % 2 === 0 ? 'percentage' : 'flat',
      feeValue: type === 'card' ? (ai === 1 ? 2.2 : 2.0) : ti % 2 === 0 ? 1.5 : 2500,
      minFee: type === 'card' ? 1000 : undefined,
      maxFee: type === 'card' ? 50000 : undefined,
    }))
  )
)
