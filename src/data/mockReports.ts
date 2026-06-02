import type { DailyVolumeStat, AgencyRevenue, ChannelBreakdown, RegionalActivity, FailureReason } from '../types'

function dateLabel(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().split('T')[0].slice(5)
}

export const dailyVolumeStats: DailyVolumeStat[] = Array.from({ length: 30 }, (_, i) => ({
  date: dateLabel(29 - i),
  count: 400000 + Math.floor(Math.random() * 80000),
  amount: 22_000_000_000 + Math.floor(Math.random() * 6_000_000_000),
  success: 380000 + Math.floor(Math.random() * 60000),
  failed: 8000 + Math.floor(Math.random() * 8000),
}))

export const agencyRevenue: AgencyRevenue[] = [
  { agency: 'URA',              revenue: 89_400_000_000, count: 420000 },
  { agency: 'MTN MoMo',         revenue: 38_400_000_000, count: 1140000 },
  { agency: 'Ministry of Lands', revenue: 10_500_000_000, count: 62000 },
  { agency: 'KCCA',             revenue: 5_500_000_000,  count: 48000 },
  { agency: 'NIRA',             revenue: 7_200_000_000,  count: 84000 },
  { agency: 'Ministry of Works', revenue: 7_900_000_000, count: 92000 },
  { agency: 'URSB',             revenue: 3_900_000_000,  count: 24000 },
  { agency: 'Immigration',      revenue: 3_400_000_000,  count: 18000 },
]

export const channelBreakdown: ChannelBreakdown[] = [
  { channel: 'MTN Mobile Money', count: 1140000, amount: 38_400_000_000 },
  { channel: 'Airtel Money',     count: 630000,  amount: 21_600_000_000 },
  { channel: 'Bank Transfer',    count: 48000,   amount: 28_800_000_000 },
  { channel: 'Visa/Mastercard',  count: 24000,   amount: 8_400_000_000 },
  { channel: 'USSD',             count: 72000,   amount: 1_440_000_000 },
]

// Regional payment activity — collections distribution across the 10 demo regions
export const regionalActivity: RegionalActivity[] = [
  { region: 'Kampala',     count: 842000, amount: 61_200_000_000, successRate: 98.1, topChannel: 'MTN Mobile Money' },
  { region: 'Wakiso',      count: 318000, amount: 19_400_000_000, successRate: 97.6, topChannel: 'MTN Mobile Money' },
  { region: 'Mukono',      count: 142000, amount: 7_800_000_000,  successRate: 97.2, topChannel: 'Airtel Money' },
  { region: 'Jinja',       count: 128000, amount: 6_900_000_000,  successRate: 96.8, topChannel: 'Bank Transfer' },
  { region: 'Mbarara',     count: 116000, amount: 6_100_000_000,  successRate: 97.0, topChannel: 'MTN Mobile Money' },
  { region: 'Gulu',        count: 74000,  amount: 3_200_000_000,  successRate: 95.9, topChannel: 'Airtel Money' },
  { region: 'Mbale',       count: 68000,  amount: 2_900_000_000,  successRate: 96.1, topChannel: 'MTN Mobile Money' },
  { region: 'Arua',        count: 52000,  amount: 2_100_000_000,  successRate: 95.4, topChannel: 'Airtel Money' },
  { region: 'Fort Portal', count: 47000,  amount: 1_900_000_000,  successRate: 96.3, topChannel: 'USSD' },
  { region: 'Masaka',      count: 58000,  amount: 2_400_000_000,  successRate: 96.7, topChannel: 'MTN Mobile Money' },
]

// Failed transaction analysis — breakdown by root-cause reason
export const failureReasons: FailureReason[] = [
  { reason: 'Insufficient funds',       count: 18400, pct: 41.2 },
  { reason: 'Timeout / no response',    count: 9600,  pct: 21.5 },
  { reason: 'Invalid account/MSISDN',   count: 6100,  pct: 13.7 },
  { reason: 'Daily limit exceeded',     count: 4200,  pct: 9.4 },
  { reason: 'Participant unavailable',  count: 3300,  pct: 7.4 },
  { reason: 'Duplicate / idempotency',  count: 1800,  pct: 4.0 },
  { reason: 'Other',                    count: 1250,  pct: 2.8 },
]
