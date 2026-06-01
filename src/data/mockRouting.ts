import type { RoutingRule, ChannelHealth } from '../types'

export const mockRoutingRules: RoutingRule[] = [
  { id: 'RR-001', priority: 1, channel: 'MTN Mobile Money', participant: 'MTN Mobile Money Uganda', minAmount: 500, maxAmount: 5_000_000, fee: 0.5, feeType: 'percentage', status: 'active' },
  { id: 'RR-002', priority: 2, channel: 'Airtel Money', participant: 'Airtel Money Uganda', minAmount: 500, maxAmount: 3_000_000, fee: 0.5, feeType: 'percentage', status: 'active' },
  { id: 'RR-003', priority: 3, channel: 'Bank Transfer', participant: 'Stanbic Bank Uganda', minAmount: 1000, maxAmount: 50_000_000_000, fee: 5000, feeType: 'flat', status: 'active' },
  { id: 'RR-004', priority: 4, channel: 'Bank Transfer', participant: 'Centenary Bank', minAmount: 1000, maxAmount: 20_000_000_000, fee: 4000, feeType: 'flat', status: 'active' },
  { id: 'RR-005', priority: 5, channel: 'Visa/Mastercard', participant: 'Pesalink Aggregator', minAmount: 10000, maxAmount: 10_000_000, fee: 1.5, feeType: 'percentage', status: 'active' },
  { id: 'RR-006', priority: 6, channel: 'USSD', participant: 'MTN Mobile Money Uganda', minAmount: 500, maxAmount: 500_000, fee: 200, feeType: 'flat', status: 'active' },
  { id: 'RR-007', priority: 7, channel: 'Bank Transfer', participant: 'DFCU Bank', minAmount: 1000, maxAmount: 15_000_000_000, fee: 3500, feeType: 'flat', status: 'inactive' },
]

export const mockChannelHealth: ChannelHealth[] = [
  { channel: 'MTN Mobile Money', participant: 'MTN Mobile Money Uganda', status: 'healthy', latency: 78, uptime: 99.97, lastChecked: new Date().toISOString() },
  { channel: 'Airtel Money', participant: 'Airtel Money Uganda', status: 'healthy', latency: 83, uptime: 99.91, lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer', participant: 'Stanbic Bank Uganda', status: 'healthy', latency: 92, uptime: 99.95, lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer', participant: 'Centenary Bank', status: 'healthy', latency: 108, uptime: 99.88, lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer', participant: 'DFCU Bank', status: 'degraded', latency: 340, uptime: 97.2, lastChecked: new Date().toISOString() },
  { channel: 'Visa/Mastercard', participant: 'Pesalink Aggregator', status: 'healthy', latency: 142, uptime: 99.5, lastChecked: new Date().toISOString() },
  { channel: 'USSD', participant: 'MTN Mobile Money Uganda', status: 'healthy', latency: 450, uptime: 99.6, lastChecked: new Date().toISOString() },
]
