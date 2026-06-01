import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { mockTransactions } from '../data/mockTransactions'
import { generateTxnId } from '../utils/format'
import type { Transaction } from '../types'

const CHANNELS = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer'] as const
const LIVE_STATUSES = ['completed', 'completed', 'completed', 'failed', 'pending'] as const
const PAYERS = ['Mugisha Robert', 'Namutebi Grace', 'Okello James', 'Nakato Fatuma', 'Ssekandi Paul']
const AGENCIES = ['URA', 'NIRA', 'MOW', 'MOL', 'KCCA']

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateLiveTx(): Transaction {
  const base = mockTransactions[Math.floor(Math.random() * 100)]
  return {
    ...base,
    id: generateTxnId(),
    payer: randomItem(PAYERS),
    agency: randomItem(AGENCIES),
    channel: randomItem(CHANNELS),
    status: randomItem(LIVE_STATUSES),
    amount: 10000 + Math.floor(Math.random() * 2000000),
    timestamp: new Date().toISOString(),
    processingTime: 100 + Math.floor(Math.random() * 600),
  }
}

export function useLiveUpdates() {
  const pushTransaction = useAppStore((s) => s.pushTransaction)

  useEffect(() => {
    // Seed with 20 recent transactions on mount
    for (let i = 0; i < 20; i++) {
      const tx = generateLiveTx()
      tx.timestamp = new Date(Date.now() - i * 12000).toISOString()
      pushTransaction(tx)
    }

    const id = setInterval(() => {
      if (document.visibilityState === 'hidden') return
      pushTransaction(generateLiveTx())
    }, 4000)

    return () => clearInterval(id)
  }, [pushTransaction])
}
