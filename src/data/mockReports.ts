import type { DailyVolumeStat, AgencyRevenue, ChannelBreakdown } from '../types'

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
