// src/data/mockRtgsParticipants.ts
import type { RTGSParticipant } from '../types/rtgs'

export const mockRtgsParticipants: RTGSParticipant[] = [
  {
    id: 'rp-001', name: 'Stanbic Bank Uganda', shortName: 'Stanbic', type: 'Commercial Bank',
    rtgsStatus: 'active', settlementAccount: 'SBU-RTGS-001-CBU', dailyLimit: 500_000_000_000,
    singleTransactionLimit: 50_000_000_000, liquidityPosition: 18_400_000_000,
    apiHealth: 'healthy', apiLatency: 12, approvalRequired: true, riskRating: 'low',
    joinedDate: '2018-01-15', dailyTransactionCount: 84, dailySettledValue: 12_400_000_000,
  },
  {
    id: 'rp-002', name: 'Centenary Bank', shortName: 'Centenary', type: 'Commercial Bank',
    rtgsStatus: 'active', settlementAccount: 'CEN-RTGS-002-CBU', dailyLimit: 300_000_000_000,
    singleTransactionLimit: 30_000_000_000, liquidityPosition: 11_200_000_000,
    apiHealth: 'healthy', apiLatency: 18, approvalRequired: true, riskRating: 'low',
    joinedDate: '2018-03-01', dailyTransactionCount: 61, dailySettledValue: 8_900_000_000,
  },
  {
    id: 'rp-003', name: 'DFCU Bank', shortName: 'DFCU', type: 'Commercial Bank',
    rtgsStatus: 'active', settlementAccount: 'DFCU-RTGS-003-CBU', dailyLimit: 200_000_000_000,
    singleTransactionLimit: 20_000_000_000, liquidityPosition: 2_100_000_000,
    apiHealth: 'degraded', apiLatency: 145, approvalRequired: true, riskRating: 'high',
    joinedDate: '2018-05-10', dailyTransactionCount: 45, dailySettledValue: 6_200_000_000,
  },
  {
    id: 'rp-004', name: 'Equity Bank Uganda', shortName: 'Equity', type: 'Commercial Bank',
    rtgsStatus: 'active', settlementAccount: 'EBU-RTGS-004-CBU', dailyLimit: 250_000_000_000,
    singleTransactionLimit: 25_000_000_000, liquidityPosition: 9_800_000_000,
    apiHealth: 'healthy', apiLatency: 22, approvalRequired: true, riskRating: 'low',
    joinedDate: '2019-02-20', dailyTransactionCount: 38, dailySettledValue: 5_800_000_000,
  },
  {
    id: 'rp-005', name: 'Absa Bank Uganda', shortName: 'Absa', type: 'Commercial Bank',
    rtgsStatus: 'active', settlementAccount: 'ABSA-RTGS-005-CBU', dailyLimit: 200_000_000_000,
    singleTransactionLimit: 20_000_000_000, liquidityPosition: 7_300_000_000,
    apiHealth: 'healthy', apiLatency: 15, approvalRequired: true, riskRating: 'low',
    joinedDate: '2018-08-01', dailyTransactionCount: 29, dailySettledValue: 4_100_000_000,
  },
  {
    id: 'rp-006', name: 'Bank of Africa Uganda', shortName: 'BOA', type: 'Commercial Bank',
    rtgsStatus: 'suspended', settlementAccount: 'BOA-RTGS-006-CBU', dailyLimit: 100_000_000_000,
    singleTransactionLimit: 10_000_000_000, liquidityPosition: 1_800_000_000,
    apiHealth: 'down', apiLatency: 0, approvalRequired: true, riskRating: 'high',
    joinedDate: '2019-06-15', dailyTransactionCount: 0, dailySettledValue: 0,
  },
  {
    id: 'rp-007', name: 'Housing Finance Bank', shortName: 'HFB', type: 'Commercial Bank',
    rtgsStatus: 'active', settlementAccount: 'HFB-RTGS-007-CBU', dailyLimit: 80_000_000_000,
    singleTransactionLimit: 8_000_000_000, liquidityPosition: 3_900_000_000,
    apiHealth: 'healthy', apiLatency: 31, approvalRequired: false, riskRating: 'low',
    joinedDate: '2020-01-10', dailyTransactionCount: 14, dailySettledValue: 1_800_000_000,
  },
  {
    id: 'rp-008', name: 'Ministry of Finance, Planning and Economic Development', shortName: 'MoFPED', type: 'Treasury Account',
    rtgsStatus: 'active', settlementAccount: 'MoF-RTGS-CONSOL-CRF', dailyLimit: 2_000_000_000_000,
    singleTransactionLimit: 200_000_000_000, liquidityPosition: 0,
    apiHealth: 'healthy', apiLatency: 8, approvalRequired: true, riskRating: 'low',
    joinedDate: '2017-01-01', dailyTransactionCount: 5, dailySettledValue: 26_000_000_000,
  },
  {
    id: 'rp-009', name: 'Uganda Revenue Authority', shortName: 'URA', type: 'Government Agency',
    rtgsStatus: 'active', settlementAccount: 'URA-RTGS-CONSOL-001', dailyLimit: 500_000_000_000,
    singleTransactionLimit: 50_000_000_000, liquidityPosition: 0,
    apiHealth: 'healthy', apiLatency: 11, approvalRequired: true, riskRating: 'low',
    joinedDate: '2017-03-01', dailyTransactionCount: 3, dailySettledValue: 2_100_000_000,
  },
  {
    id: 'rp-010', name: 'Bank of Uganda', shortName: 'BoU', type: 'Central Bank',
    rtgsStatus: 'active', settlementAccount: 'BOU-RTGS-MASTER', dailyLimit: 0,
    singleTransactionLimit: 0, liquidityPosition: 0,
    apiHealth: 'healthy', apiLatency: 4, approvalRequired: false, riskRating: 'low',
    joinedDate: '2017-01-01', dailyTransactionCount: 0, dailySettledValue: 0,
  },
]
