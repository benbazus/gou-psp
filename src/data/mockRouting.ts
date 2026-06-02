import type { RoutingRule, ChannelHealth } from '../types'

export const mockRoutingRules: RoutingRule[] = [
  { id: 'RR-001', priority: 1, channel: 'MTN Mobile Money', participant: 'MTN Mobile Money Uganda', minAmount: 500,    maxAmount: 5_000_000,      fee: 0.5, feeType: 'percentage', status: 'active' },
  { id: 'RR-002', priority: 2, channel: 'Airtel Money',     participant: 'Airtel Money Uganda',     minAmount: 500,    maxAmount: 3_000_000,      fee: 0.5, feeType: 'percentage', status: 'active' },
  { id: 'RR-003', priority: 3, channel: 'Bank Transfer',    participant: 'Stanbic Bank Uganda',     minAmount: 1_000,  maxAmount: 50_000_000_000, fee: 5000, feeType: 'flat',      status: 'active' },
  { id: 'RR-004', priority: 4, channel: 'Bank Transfer',    participant: 'Centenary Bank',          minAmount: 1_000,  maxAmount: 20_000_000_000, fee: 4000, feeType: 'flat',      status: 'active' },
  { id: 'RR-005', priority: 5, channel: 'Visa/Mastercard',  participant: 'Pesalink Aggregator',     minAmount: 10_000, maxAmount: 10_000_000,     fee: 1.5, feeType: 'percentage', status: 'active' },
  { id: 'RR-006', priority: 6, channel: 'USSD',             participant: 'MTN Mobile Money Uganda', minAmount: 500,    maxAmount: 500_000,        fee: 200,  feeType: 'flat',      status: 'active' },
  { id: 'RR-007', priority: 7, channel: 'Bank Transfer',    participant: 'DFCU Bank',               minAmount: 1_000,  maxAmount: 15_000_000_000, fee: 3500, feeType: 'flat',      status: 'inactive' },
]

export const mockChannelHealth: ChannelHealth[] = [
  { channel: 'MTN Mobile Money', participant: 'MTN Mobile Money Uganda', status: 'healthy',  latency: 78,  uptime: 99.97, lastChecked: new Date().toISOString() },
  { channel: 'Airtel Money',     participant: 'Airtel Money Uganda',     status: 'healthy',  latency: 83,  uptime: 99.91, lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer',    participant: 'Stanbic Bank Uganda',     status: 'healthy',  latency: 92,  uptime: 99.95, lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer',    participant: 'Centenary Bank',          status: 'healthy',  latency: 108, uptime: 99.88, lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer',    participant: 'DFCU Bank',               status: 'degraded', latency: 340, uptime: 97.2,  lastChecked: new Date().toISOString() },
  { channel: 'Visa/Mastercard',  participant: 'Pesalink Aggregator',     status: 'healthy',  latency: 142, uptime: 99.5,  lastChecked: new Date().toISOString() },
  { channel: 'USSD',             participant: 'MTN Mobile Money Uganda', status: 'healthy',  latency: 450, uptime: 99.6,  lastChecked: new Date().toISOString() },
  { channel: 'Bank Transfer',    participant: 'Bank of Africa',          status: 'down',     latency: 0,   uptime: 0,     lastChecked: new Date().toISOString() },
]

// Daily volume per channel (UGX billions for display)
export const channelDailyVolume: Record<string, { count: number; volume: number }> = {
  'MTN Mobile Money Uganda': { count: 380_000, volume: 12_800_000_000 },
  'Airtel Money Uganda':     { count: 210_000, volume: 7_200_000_000 },
  'Stanbic Bank Uganda':     { count: 12_400,  volume: 8_400_000_000 },
  'Centenary Bank':          { count: 7_800,   volume: 3_200_000_000 },
  'DFCU Bank':               { count: 4_200,   volume: 1_900_000_000 },
  'Pesalink Aggregator':     { count: 2_100,   volume: 980_000_000 },
  'MTN Mobile Money Uganda (USSD)': { count: 42_000, volume: 1_440_000_000 },
  'Bank of Africa':          { count: 0,       volume: 0 },
}

// Transaction priority levels
export const txnPriorityLevels = [
  { id: 'P1', name: 'Critical',        amountThreshold: 'Any',           criteria: 'Government payroll disbursements, BOU reserve transfers',   sla: '< 2s',   color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'P2', name: 'High Priority',   amountThreshold: '> UGX 40M',     criteria: 'High-value payments, tax clearance above threshold',         sla: '< 5s',   color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'P3', name: 'Standard',        amountThreshold: 'UGX 1K – 40M',  criteria: 'All normal citizen and business payments',                  sla: '< 10s',  color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'P4', name: 'Batch',           amountThreshold: 'Bulk files',     criteria: 'Scheduled payroll, pension disbursements, bulk invoices',   sla: '< 5 min', color: 'bg-slate-100 border-slate-300 text-slate-700' },
]

// Fallback routing config
export const fallbackConfig = [
  { primary: 'MTN Mobile Money', fallback1: 'Airtel Money',     fallback2: 'Bank Transfer (Stanbic)',  trigger: 'API timeout > 5s or error rate > 15%' },
  { primary: 'Airtel Money',     fallback1: 'MTN Mobile Money', fallback2: 'Bank Transfer (Centenary)', trigger: 'API timeout > 5s or error rate > 15%' },
  { primary: 'Bank Transfer',    fallback1: 'MTN Mobile Money', fallback2: 'Airtel Money',              trigger: 'Bank API down > 10 min' },
  { primary: 'Visa/Mastercard',  fallback1: 'Bank Transfer',    fallback2: 'MTN Mobile Money',          trigger: 'Acquirer error rate > 10%' },
]
