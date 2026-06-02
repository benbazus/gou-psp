export interface BankDefinition {
  tenantId: string
  name: string
  shortName: string
  accentColor: string
  accentLight: string
  accentDark: string
  bic: string
  settlementAccount: string
}

export const BANKS: BankDefinition[] = [
  {
    tenantId: 'stanbic',
    name: 'Stanbic Bank Uganda',
    shortName: 'Stanbic',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'SBICUGKX',
    settlementAccount: '00100123456',
  },
  {
    tenantId: 'centenary',
    name: 'Centenary Bank',
    shortName: 'Centenary',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'CERBUGKA',
    settlementAccount: '00100234567',
  },
  {
    tenantId: 'dfcu',
    name: 'DFCU Bank',
    shortName: 'DFCU',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'DFCUUGKA',
    settlementAccount: '00100345678',
  },
  {
    tenantId: 'equity',
    name: 'Equity Bank Uganda',
    shortName: 'Equity',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'EQBLUGKA',
    settlementAccount: '00100456789',
  },
  {
    tenantId: 'absa',
    name: 'Absa Uganda',
    shortName: 'Absa',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'BARCUGKX',
    settlementAccount: '00100567890',
  },
  {
    tenantId: 'hfb',
    name: 'Housing Finance Bank',
    shortName: 'HFB',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'HFBAUGKA',
    settlementAccount: '00100678901',
  },
  {
    tenantId: 'boa',
    name: 'Bank of Africa Uganda',
    shortName: 'BoA',
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    bic: 'AFRIGUUX',
    settlementAccount: '00100789012',
  },
]

export function getBankByTenantId(tenantId: string): BankDefinition | undefined {
  return BANKS.find((b) => b.tenantId === tenantId)
}
