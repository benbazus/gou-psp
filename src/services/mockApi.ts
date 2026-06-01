import { mockTransactions } from '../data/mockTransactions'
import { mockParticipants } from '../data/mockParticipants'
import { mockAgencies } from '../data/mockAgencies'
import { mockSettlementBatches, mockSettlementAccounts } from '../data/mockSettlements'
import { mockDisputes } from '../data/mockDisputes'
import { mockAlerts, mockBlacklist, mockAuditLog } from '../data/mockCompliance'
import { mockRoutingRules, mockChannelHealth } from '../data/mockRouting'
import { dailyVolumeStats, agencyRevenue, channelBreakdown } from '../data/mockReports'

function delay(ms = 400): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

export const transactionsApi = {
  list: async (limit = 100) => { await delay(400); return mockTransactions.slice(0, limit) },
  getById: async (id: string) => { await delay(300); return mockTransactions.find((t) => t.id === id) ?? null },
  todayStats: async () => {
    await delay(350)
    const today = mockTransactions.filter((t) => t.timestamp.startsWith(new Date().toISOString().slice(0, 10)))
    const total = today.reduce((s, t) => s + t.amount, 0)
    const success = today.filter((t) => t.status === 'completed').length
    return {
      count: today.length || 48291,
      totalValue: total || 18_400_000_000,
      successRate: today.length ? (success / today.length) * 100 : 98.4,
      failedCount: today.filter((t) => t.status === 'failed').length || 382,
      avgProcessingTime: 342,
      uptime: 99.97,
      activeParticipants: 18,
      pendingSettlements: 3,
    }
  },
}

export const participantsApi = {
  list: async () => { await delay(400); return mockParticipants },
  getById: async (id: string) => { await delay(300); return mockParticipants.find((p) => p.id === id) ?? null },
  suspend: async (id: string) => { await delay(600); return { success: true, id } },
  activate: async (id: string) => { await delay(600); return { success: true, id } },
}

export const agenciesApi = {
  list: async () => { await delay(400); return mockAgencies },
  getById: async (id: string) => { await delay(300); return mockAgencies.find((a) => a.id === id) ?? null },
}

export const settlementsApi = {
  listBatches: async () => { await delay(500); return mockSettlementBatches },
  listAccounts: async () => { await delay(400); return mockSettlementAccounts },
  approve: async (id: string) => { await delay(800); return { success: true, id } },
  reject: async (id: string) => { await delay(600); return { success: true, id } },
  rerun: async (id: string) => { await delay(1200); return { success: true, id } },
}

export const disputesApi = {
  list: async () => { await delay(450); return mockDisputes },
  getById: async (id: string) => { await delay(300); return mockDisputes.find((d) => d.id === id) ?? null },
  resolve: async (id: string, action: string) => { await delay(700); return { success: true, id, action } },
}

export const complianceApi = {
  listAlerts: async () => { await delay(400); return mockAlerts },
  listBlacklist: async () => { await delay(400); return mockBlacklist },
  listAuditLog: async () => { await delay(450); return mockAuditLog },
  investigate: async (id: string) => { await delay(600); return { success: true, id } },
}

export const routingApi = {
  listRules: async () => { await delay(400); return mockRoutingRules },
  listChannelHealth: async () => { await delay(300); return mockChannelHealth },
  testRoute: async (amount: number, channel: string) => {
    await delay(1000)
    const rule = mockRoutingRules.find((r) => r.channel === channel && r.status === 'active')
    return { success: !!rule, rule: rule ?? null, fallback: !rule ? mockRoutingRules[0] : null }
  },
  reorderRule: async (id: string, direction: 'up' | 'down') => { await delay(400); return { success: true, id, direction } },
}

export const reportsApi = {
  dailyVolume: async () => { await delay(500); return dailyVolumeStats },
  agencyRevenue: async () => { await delay(450); return agencyRevenue },
  channelBreakdown: async () => { await delay(400); return channelBreakdown },
}
