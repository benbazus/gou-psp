export interface BankLiquidity {
  tenantId: string
  available: number
  reserved: number
  threshold: number
  injectionPending: number
  utilizationPct: number
  intraday: { hour: string; value: number }[]
  lastUpdated: string
}

function makeIntraday(base: number): { hour: string; value: number }[] {
  return Array.from({ length: 10 }, (_, i) => ({
    hour: `${String(8 + i).padStart(2, '0')}:00`,
    value: base + Math.floor((Math.random() - 0.4) * base * 0.3),
  }))
}

export const mockBankLiquidity: Record<string, BankLiquidity> = {
  stanbic:   { tenantId: 'stanbic',   available: 42_500_000_000, reserved: 8_200_000_000,  threshold: 10_000_000_000, injectionPending: 0,             utilizationPct: 68, intraday: makeIntraday(40_000_000_000), lastUpdated: '2026-06-02 14:33' },
  centenary: { tenantId: 'centenary', available: 18_300_000_000, reserved: 3_100_000_000,  threshold: 5_000_000_000,  injectionPending: 2_000_000_000, utilizationPct: 72, intraday: makeIntraday(18_000_000_000), lastUpdated: '2026-06-02 14:30' },
  dfcu:      { tenantId: 'dfcu',      available: 24_100_000_000, reserved: 5_400_000_000,  threshold: 7_000_000_000,  injectionPending: 0,             utilizationPct: 61, intraday: makeIntraday(22_000_000_000), lastUpdated: '2026-06-02 14:29' },
  equity:    { tenantId: 'equity',    available: 31_700_000_000, reserved: 6_800_000_000,  threshold: 8_000_000_000,  injectionPending: 0,             utilizationPct: 54, intraday: makeIntraday(30_000_000_000), lastUpdated: '2026-06-02 14:31' },
  absa:      { tenantId: 'absa',      available: 38_200_000_000, reserved: 9_100_000_000,  threshold: 10_000_000_000, injectionPending: 0,             utilizationPct: 59, intraday: makeIntraday(36_000_000_000), lastUpdated: '2026-06-02 14:28' },
  hfb:       { tenantId: 'hfb',       available: 11_400_000_000, reserved: 2_300_000_000,  threshold: 4_000_000_000,  injectionPending: 1_500_000_000, utilizationPct: 81, intraday: makeIntraday(11_000_000_000), lastUpdated: '2026-06-02 14:27' },
  boa:       { tenantId: 'boa',       available: 14_900_000_000, reserved: 3_700_000_000,  threshold: 5_000_000_000,  injectionPending: 0,             utilizationPct: 66, intraday: makeIntraday(14_000_000_000), lastUpdated: '2026-06-02 14:32' },
}
