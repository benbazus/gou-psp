import type { Participant } from '../types'

function health7(base = 100, spread = 120): number[] {
  return Array.from({ length: 7 }, () => base + Math.floor(Math.random() * spread))
}

export const mockParticipants: Participant[] = [
  // ─── Banks ───────────────────────────────────────────────────────────────
  { id: 'STB',  name: 'Stanbic Bank Uganda',       shortName: 'Stanbic',       type: 'Bank', status: 'active',     apiHealth: 'healthy',  apiLatency: 92,  settlementAccount: 'BOU-STB-001',  dailyVolume: 8_400_000_000, dailyCount: 12400,  slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2022-01-15', apiHealthHistory: health7(80,  60) },
  { id: 'CTB',  name: 'Centenary Bank',             shortName: 'Centenary',     type: 'Bank', status: 'active',     apiHealth: 'healthy',  apiLatency: 108, settlementAccount: 'BOU-CTB-001',  dailyVolume: 3_200_000_000, dailyCount: 7800,   slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2022-03-10', apiHealthHistory: health7(90,  70) },
  { id: 'DFCU', name: 'DFCU Bank',                  shortName: 'DFCU',          type: 'Bank', status: 'active',     apiHealth: 'degraded', apiLatency: 340, settlementAccount: 'BOU-DFCU-001', dailyVolume: 1_900_000_000, dailyCount: 4200,   slaStatus: 'warning',   riskRating: 'medium', joinedDate: '2022-05-20', apiHealthHistory: health7(200, 200) },
  { id: 'EQB',  name: 'Equity Bank Uganda',         shortName: 'Equity',        type: 'Bank', status: 'active',     apiHealth: 'healthy',  apiLatency: 115, settlementAccount: 'BOU-EQB-001',  dailyVolume: 2_700_000_000, dailyCount: 5900,   slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2022-02-28', apiHealthHistory: health7(90,  80) },
  { id: 'ABSA', name: 'Absa Bank Uganda',           shortName: 'Absa',          type: 'Bank', status: 'active',     apiHealth: 'healthy',  apiLatency: 98,  settlementAccount: 'BOU-ABSA-001', dailyVolume: 2_100_000_000, dailyCount: 3800,   slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2022-04-05', apiHealthHistory: health7(85,  55) },
  { id: 'BOA',  name: 'Bank of Africa Uganda',      shortName: 'Bank of Africa', type: 'Bank', status: 'suspended',  apiHealth: 'down',     apiLatency: 0,   settlementAccount: 'BOU-BOA-001',  dailyVolume: 0,             dailyCount: 0,      slaStatus: 'breach',    riskRating: 'high',   joinedDate: '2022-06-12', apiHealthHistory: health7(300, 300) },
  { id: 'HFB',  name: 'Housing Finance Bank',       shortName: 'Housing Finance', type: 'Bank', status: 'active',   apiHealth: 'healthy',  apiLatency: 125, settlementAccount: 'BOU-HFB-001',  dailyVolume: 980_000_000,   dailyCount: 2100,   slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2022-07-19', apiHealthHistory: health7(100, 60) },

  // ─── Mobile Money Operators ───────────────────────────────────────────────
  { id: 'MTN',  name: 'MTN Mobile Money Uganda',    shortName: 'MTN MoMo',      type: 'Mobile Money Operator', status: 'active', apiHealth: 'healthy',  apiLatency: 78,  settlementAccount: 'BOU-MTN-001',  dailyVolume: 12_800_000_000, dailyCount: 380000, slaStatus: 'compliant', riskRating: 'low',  joinedDate: '2021-11-01', apiHealthHistory: health7(60, 40) },
  { id: 'AIR',  name: 'Airtel Money Uganda',        shortName: 'Airtel Money',   type: 'Mobile Money Operator', status: 'active', apiHealth: 'healthy',  apiLatency: 83,  settlementAccount: 'BOU-AIR-001',  dailyVolume: 7_200_000_000,  dailyCount: 210000, slaStatus: 'compliant', riskRating: 'low',  joinedDate: '2021-11-15', apiHealthHistory: health7(65, 50) },

  // ─── Government Agencies ──────────────────────────────────────────────────
  { id: 'URA',  name: 'Uganda Revenue Authority',   shortName: 'URA',           type: 'Government Agency', status: 'active',     apiHealth: 'healthy',  apiLatency: 44,  settlementAccount: 'BOU-TREAS-001-URA',  dailyVolume: 4_820_000_000, dailyCount: 42000, slaStatus: 'compliant', riskRating: 'low',  joinedDate: '2021-07-01', apiHealthHistory: health7(35, 25) },
  { id: 'NIRA', name: 'National Identification & Registration Authority', shortName: 'NIRA', type: 'Government Agency', status: 'active', apiHealth: 'healthy', apiLatency: 61, settlementAccount: 'BOU-TREAS-002-NIRA', dailyVolume: 380_000_000, dailyCount: 4200, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-09-15', apiHealthHistory: health7(50, 30) },
  { id: 'KCCA', name: 'Kampala Capital City Authority', shortName: 'KCCA',      type: 'Government Agency', status: 'active',     apiHealth: 'healthy',  apiLatency: 88,  settlementAccount: 'BOU-TREAS-007-KCCA', dailyVolume: 290_000_000,   dailyCount: 3100,  slaStatus: 'compliant', riskRating: 'low',  joinedDate: '2022-01-20', apiHealthHistory: health7(75, 40) },
  { id: 'URSB', name: 'Uganda Registration Services Bureau', shortName: 'URSB', type: 'Government Agency', status: 'onboarding', apiHealth: 'healthy', apiLatency: 102, settlementAccount: 'BOU-TREAS-003-URSB', dailyVolume: 142_000_000, dailyCount: 1400, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2024-01-10', apiHealthHistory: health7(90, 50) },

  // ─── Payment Aggregators ──────────────────────────────────────────────────
  { id: 'PESA', name: 'Pesalink Aggregator',        shortName: 'Pesalink',      type: 'Payment Aggregator', status: 'active',    apiHealth: 'healthy',  apiLatency: 142, settlementAccount: 'BOU-PESA-001', dailyVolume: 1_400_000_000, dailyCount: 9200, slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2023-01-10', apiHealthHistory: health7(110, 80) },
  { id: 'FLWV', name: 'Flutterwave Uganda',         shortName: 'Flutterwave',   type: 'Payment Aggregator', status: 'onboarding', apiHealth: 'healthy', apiLatency: 188, settlementAccount: 'BOU-FLWV-001', dailyVolume: 0,             dailyCount: 0,    slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2024-03-05', apiHealthHistory: health7(150, 90) },

  // ─── Treasury ──────────────────────────────────────────────────────────────
  { id: 'TREAS', name: 'Consolidated Fund (Treasury)', shortName: 'Treasury',   type: 'Treasury',           status: 'active',    apiHealth: 'healthy',  apiLatency: 55,  settlementAccount: 'BOU-TREAS-MAIN', dailyVolume: 0, dailyCount: 0, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-07-01', apiHealthHistory: health7(40, 20) },

  // ─── Local Governments ────────────────────────────────────────────────────
  { id: 'WKS',  name: 'Wakiso District Local Government', shortName: 'Wakiso LG',  type: 'Government Agency', status: 'active',     apiHealth: 'healthy',  apiLatency: 120, settlementAccount: 'BOU-LG-001-WKS',  dailyVolume: 48_000_000,   dailyCount: 520,  slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2023-06-01', apiHealthHistory: health7(100, 60) },
  { id: 'MKN',  name: 'Mukono District Local Government', shortName: 'Mukono LG', type: 'Government Agency', status: 'active',     apiHealth: 'healthy',  apiLatency: 145, settlementAccount: 'BOU-LG-002-MKN',  dailyVolume: 22_000_000,   dailyCount: 240,  slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2023-06-01', apiHealthHistory: health7(110, 70) },
  { id: 'JJA',  name: 'Jinja City Authority',              shortName: 'Jinja CA',  type: 'Government Agency', status: 'onboarding', apiHealth: 'healthy', apiLatency: 160, settlementAccount: 'BOU-LG-003-JJA',  dailyVolume: 0,            dailyCount: 0,    slaStatus: 'compliant', riskRating: 'low',    joinedDate: '2024-02-14', apiHealthHistory: health7(130, 80) },
]
