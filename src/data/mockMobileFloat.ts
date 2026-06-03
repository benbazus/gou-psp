// src/data/mockMobileFloat.ts
import type { MobileFloat } from '../types'

function makeIntraday(peakBillion: number): { hour: string; value: number }[] {
  const base = peakBillion * 1_000_000_000
  return Array.from({ length: 14 }, (_, i) => {
    const h = 7 + i
    const factor = h < 9 ? 0.85 : h < 12 ? 0.95 : h < 14 ? 1.0 : h < 17 ? 0.92 : 0.88
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      value: Math.floor(base * factor),
    }
  })
}

export const mockMobileFloat: Record<string, MobileFloat> = {
  mtn: {
    operatorId: 'mtn',
    available:  420_000_000_000,
    reserved:    85_000_000_000,
    threshold:   60_000_000_000,
    utilizationPct: 62,
    lastUpdated: '2026-06-02 14:22:00',
    intraday: makeIntraday(450),
  },
  airtel: {
    operatorId: 'airtel',
    available:  210_000_000_000,
    reserved:    42_000_000_000,
    threshold:   30_000_000_000,
    utilizationPct: 55,
    lastUpdated: '2026-06-02 14:19:00',
    intraday: makeIntraday(240),
  },
}
