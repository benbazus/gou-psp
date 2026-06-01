import type { Participant } from '../types'

function health7(): number[] {
  return Array.from({ length: 7 }, () => 80 + Math.floor(Math.random() * 200))
}

export const mockParticipants: Participant[] = [
  { id: 'STB', name: 'Stanbic Bank Uganda', shortName: 'Stanbic', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 92, settlementAccount: 'BOU-STB-001', dailyVolume: 8_400_000_000, dailyCount: 12400, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-01-15', apiHealthHistory: health7() },
  { id: 'CTB', name: 'Centenary Bank', shortName: 'Centenary', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 108, settlementAccount: 'BOU-CTB-001', dailyVolume: 3_200_000_000, dailyCount: 7800, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-03-10', apiHealthHistory: health7() },
  { id: 'DFCU', name: 'DFCU Bank', shortName: 'DFCU', type: 'Bank', status: 'active', apiHealth: 'degraded', apiLatency: 340, settlementAccount: 'BOU-DFCU-001', dailyVolume: 1_900_000_000, dailyCount: 4200, slaStatus: 'warning', riskRating: 'medium', joinedDate: '2022-05-20', apiHealthHistory: health7() },
  { id: 'EQB', name: 'Equity Bank Uganda', shortName: 'Equity', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 115, settlementAccount: 'BOU-EQB-001', dailyVolume: 2_700_000_000, dailyCount: 5900, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-02-28', apiHealthHistory: health7() },
  { id: 'ABSA', name: 'Absa Bank Uganda', shortName: 'Absa', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 98, settlementAccount: 'BOU-ABSA-001', dailyVolume: 2_100_000_000, dailyCount: 3800, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-04-05', apiHealthHistory: health7() },
  { id: 'BOA', name: 'Bank of Africa Uganda', shortName: 'Bank of Africa', type: 'Bank', status: 'suspended', apiHealth: 'down', apiLatency: 0, settlementAccount: 'BOU-BOA-001', dailyVolume: 0, dailyCount: 0, slaStatus: 'breach', riskRating: 'high', joinedDate: '2022-06-12', apiHealthHistory: health7() },
  { id: 'HFB', name: 'Housing Finance Bank', shortName: 'Housing Finance', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 125, settlementAccount: 'BOU-HFB-001', dailyVolume: 980_000_000, dailyCount: 2100, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-07-19', apiHealthHistory: health7() },
  { id: 'MTN', name: 'MTN Mobile Money Uganda', shortName: 'MTN MoMo', type: 'Mobile Money Operator', status: 'active', apiHealth: 'healthy', apiLatency: 78, settlementAccount: 'BOU-MTN-001', dailyVolume: 12_800_000_000, dailyCount: 380000, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-11-01', apiHealthHistory: health7() },
  { id: 'AIR', name: 'Airtel Money Uganda', shortName: 'Airtel Money', type: 'Mobile Money Operator', status: 'active', apiHealth: 'healthy', apiLatency: 83, settlementAccount: 'BOU-AIR-001', dailyVolume: 7_200_000_000, dailyCount: 210000, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-11-15', apiHealthHistory: health7() },
  { id: 'PESA', name: 'Pesalink Aggregator', shortName: 'Pesalink', type: 'Payment Aggregator', status: 'active', apiHealth: 'healthy', apiLatency: 142, settlementAccount: 'BOU-PESA-001', dailyVolume: 1_400_000_000, dailyCount: 9200, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2023-01-10', apiHealthHistory: health7() },
  { id: 'TREAS', name: 'Consolidated Fund (Treasury)', shortName: 'Treasury', type: 'Treasury', status: 'active', apiHealth: 'healthy', apiLatency: 55, settlementAccount: 'BOU-TREAS-MAIN', dailyVolume: 0, dailyCount: 0, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-07-01', apiHealthHistory: health7() },
]
