# GovPay Phase 1 — Multi-Portal Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing single-portal GovPay Switch into a multi-portal, multi-tenant national payment ecosystem with a config-driven PortalShell, three-step login, bank portal pages (10 pages × 7 banks), tenant-scoped mock data, and a demo-mode Switch Portal modal.

**Architecture:** A single `PortalShell` component accepts a `PortalConfig` object (sidebar nav, accent colour, tenantId) injected by the route definition. All portal pages call `usePortalConfig()` to get their tenant context. Mock data is filtered by `tenantService.ts` using the tenantId from that config.

**Tech Stack:** React 18, TypeScript, Vite, TanStack Router v1 (createRoute API), TanStack Query v5, Zustand, Framer Motion, Recharts, Lucide React, Tailwind CSS, clsx

---

## File Map

**New files:**
- `src/types/index.ts` — add `PortalType`, 7 new `Role` values
- `src/contexts/portalConfig.tsx` — `PortalConfigContext`, `usePortalConfig()`
- `src/data/mockBanks.ts` — 7 bank definitions
- `src/data/mockBankTransactions.ts` — ~200 transactions tagged by tenantId
- `src/data/mockBankLiquidity.ts` — liquidity per bank
- `src/data/mockBankSettlements.ts` — settlement batches per bank
- `src/data/mockBankQueue.ts` — RTGS queue entries per bank
- `src/data/mockBankExceptions.ts` — exceptions per bank
- `src/data/mockPortalConfigs.ts` — all `PortalConfig` objects
- `src/services/tenantService.ts` — tenant-filtered data getters
- `src/hooks/portal/usePortalTransactions.ts`
- `src/hooks/portal/usePortalLiquidity.ts`
- `src/hooks/portal/usePortalSettlements.ts`
- `src/hooks/portal/usePortalQueue.ts`
- `src/components/layout/PortalShell.tsx` — replaces AppShell
- `src/components/layout/PortalSwitcher.tsx` — demo modal
- `src/routes/app/national/` — all 14 existing GovPay pages (moved)
- `src/routes/app/bank/$bankId/dashboard.tsx`
- `src/routes/app/bank/$bankId/incoming.tsx`
- `src/routes/app/bank/$bankId/outgoing.tsx`
- `src/routes/app/bank/$bankId/rtgs-queue.tsx`
- `src/routes/app/bank/$bankId/settlement.tsx`
- `src/routes/app/bank/$bankId/liquidity.tsx`
- `src/routes/app/bank/$bankId/exceptions.tsx`
- `src/routes/app/bank/$bankId/treasury-transfers.tsx`
- `src/routes/app/bank/$bankId/reconciliation.tsx`
- `src/routes/app/bank/$bankId/reports.tsx`

**Modified files:**
- `src/types/index.ts` — add types
- `src/store/appStore.ts` — add `activePortal`, `activeTenant`, `setPortal`
- `src/components/layout/Sidebar.tsx` — accept `navSections` prop
- `src/components/layout/Topbar.tsx` — add Switch Portal button + portal-aware breadcrumb
- `src/components/layout/AppShell.tsx` — delete (replaced by PortalShell)
- `src/data/mockTransactions.ts` — add `tenantId: 'national'` to all records
- `src/data/mockSettlements.ts` — add `tenantId: 'national'` to all records
- `src/router.tsx` — full restructure
- `src/routes/login.tsx` — three-step login

---

## Task 1: Foundation Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add PortalType and new Role values**

Open `src/types/index.ts`. After the existing `Role` type definition (currently ends with `| 'RTGS Auditor'`), add:

```typescript
// ─── Portal ───────────────────────────────────────
export type PortalType =
  | 'national'
  | 'bank'
  | 'rtgs'
  | 'treasury'
  | 'agency'
  | 'mobile'
```

Then extend the existing `Role` union by appending these 7 values:
```typescript
  | 'Bank Auditor'
  | 'Collections Manager'
  | 'Agency Auditor'
  | 'Treasury Approver'
  | 'Treasury Auditor'
  | 'Mobile Operator'
  | 'Mobile Auditor'
```

The full `Role` type after this edit should read:
```typescript
export type Role =
  | 'Super Admin'
  | 'Bank of Uganda Operator'
  | 'Treasury Officer'
  | 'Agency Officer'
  | 'Compliance Officer'
  | 'Settlement Officer'
  | 'Support Officer'
  | 'Developer'
  | 'RTGS Super Admin'
  | 'Central Bank Settlement Operator'
  | 'Treasury Settlement Officer'
  | 'Bank RTGS Operator'
  | 'Liquidity Manager'
  | 'RTGS Auditor'
  | 'Bank Auditor'
  | 'Collections Manager'
  | 'Agency Auditor'
  | 'Treasury Approver'
  | 'Treasury Auditor'
  | 'Mobile Operator'
  | 'Mobile Auditor'
```

Also add the `NavItem` and `NavSection` interfaces that `PortalConfig` will reference. Add them after `PortalType`:

```typescript
export interface NavItem {
  path: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  external?: boolean
}

export interface NavSection {
  header: string
  accent?: 'amber' | 'emerald' | 'violet' | 'cyan' | 'orange'
  items: NavItem[]
}

export interface PortalConfig {
  portalType: PortalType
  tenantId: string
  tenantName: string
  tenantShort: string
  accentColor: string
  accentLight: string
  accentDark: string
  homeRoute: string
  navSections: NavSection[]
  allowedRoles: Role[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd d:/Projects/GoU/PSP && npx tsc --noEmit
```

Expected: no errors related to the new types. Ignore pre-existing errors if any.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add PortalType, PortalConfig, NavSection, extend Role"
```

---

## Task 2: Mock Bank Data

**Files:**
- Create: `src/data/mockBanks.ts`
- Create: `src/data/mockBankTransactions.ts`
- Create: `src/data/mockBankLiquidity.ts`
- Create: `src/data/mockBankSettlements.ts`
- Create: `src/data/mockBankQueue.ts`
- Create: `src/data/mockBankExceptions.ts`

- [ ] **Step 1: Create `src/data/mockBanks.ts`**

```typescript
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
```

- [ ] **Step 2: Create `src/data/mockBankTransactions.ts`**

```typescript
import type { Status, Channel, Region } from '../types'

export interface BankTransaction {
  id: string
  tenantId: string
  direction: 'incoming' | 'outgoing'
  amount: number
  payer: string
  payee: string
  channel: Channel
  status: Status
  region: Region
  reference: string
  timestamp: string
  processingTime: number
  failureReason?: string
}

const CHANNELS: Channel[] = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD']
const REGIONS: Region[] = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Mbale', 'Arua']
const STATUSES: Status[] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed', 'processing']
const BANK_NAMES = ['Stanbic', 'Centenary', 'DFCU', 'Equity', 'Absa', 'HFB', 'BoA', 'MTN MoMo', 'Airtel Money', 'Treasury']

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }
function rndUGX(): number { return rndInt(50_000, 95_000_000) }
function pad2(n: number): string { return String(n).padStart(2, '0') }

function makeTimestamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3_600_000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function generateTxn(tenantId: string, idx: number): BankTransaction {
  const dir = idx % 3 === 0 ? 'outgoing' : 'incoming'
  const status = rnd(STATUSES)
  return {
    id: `TXN-${tenantId.toUpperCase()}-${String(idx).padStart(4, '0')}`,
    tenantId,
    direction: dir,
    amount: rndUGX(),
    payer: dir === 'incoming' ? rnd(BANK_NAMES) : tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
    payee: dir === 'outgoing' ? rnd(BANK_NAMES) : tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
    channel: rnd(CHANNELS),
    status,
    region: rnd(REGIONS),
    reference: `REF${Date.now().toString().slice(-8)}${idx}`,
    timestamp: makeTimestamp(rndInt(0, 72)),
    processingTime: rndInt(80, 2500),
    failureReason: status === 'failed' ? rnd(['Insufficient funds', 'Account suspended', 'Timeout', 'Invalid account']) : undefined,
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankTransactions: BankTransaction[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 30 }, (_, i) => generateTxn(tid, bankIdx * 30 + i))
)
```

- [ ] **Step 3: Create `src/data/mockBankLiquidity.ts`**

```typescript
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

function makeIntraday(base: number) {
  return Array.from({ length: 10 }, (_, i) => ({
    hour: `${String(8 + i).padStart(2, '0')}:00`,
    value: base + Math.floor((Math.random() - 0.4) * base * 0.3),
  }))
}

export const mockBankLiquidity: Record<string, BankLiquidity> = {
  stanbic:   { tenantId: 'stanbic',   available: 42_500_000_000, reserved: 8_200_000_000,  threshold: 10_000_000_000, injectionPending: 0,           utilizationPct: 68, intraday: makeIntraday(40_000_000_000), lastUpdated: '2026-06-02 14:33' },
  centenary: { tenantId: 'centenary', available: 18_300_000_000, reserved: 3_100_000_000,  threshold: 5_000_000_000,  injectionPending: 2_000_000_000, utilizationPct: 72, intraday: makeIntraday(18_000_000_000), lastUpdated: '2026-06-02 14:30' },
  dfcu:      { tenantId: 'dfcu',      available: 24_100_000_000, reserved: 5_400_000_000,  threshold: 7_000_000_000,  injectionPending: 0,           utilizationPct: 61, intraday: makeIntraday(22_000_000_000), lastUpdated: '2026-06-02 14:29' },
  equity:    { tenantId: 'equity',    available: 31_700_000_000, reserved: 6_800_000_000,  threshold: 8_000_000_000,  injectionPending: 0,           utilizationPct: 54, intraday: makeIntraday(30_000_000_000), lastUpdated: '2026-06-02 14:31' },
  absa:      { tenantId: 'absa',      available: 38_200_000_000, reserved: 9_100_000_000,  threshold: 10_000_000_000, injectionPending: 0,           utilizationPct: 59, intraday: makeIntraday(36_000_000_000), lastUpdated: '2026-06-02 14:28' },
  hfb:       { tenantId: 'hfb',       available: 11_400_000_000, reserved: 2_300_000_000,  threshold: 4_000_000_000,  injectionPending: 1_500_000_000, utilizationPct: 81, intraday: makeIntraday(11_000_000_000), lastUpdated: '2026-06-02 14:27' },
  boa:       { tenantId: 'boa',       available: 14_900_000_000, reserved: 3_700_000_000,  threshold: 5_000_000_000,  injectionPending: 0,           utilizationPct: 66, intraday: makeIntraday(14_000_000_000), lastUpdated: '2026-06-02 14:32' },
}
```

- [ ] **Step 4: Create `src/data/mockBankSettlements.ts`**

```typescript
export interface BankSettlement {
  id: string
  tenantId: string
  batchDate: string
  grossAmount: number
  netAmount: number
  transactionCount: number
  status: 'completed' | 'processing' | 'pending' | 'failed'
  type: 'inbound' | 'outbound'
  counterparty: string
  slaStatus: 'compliant' | 'breach' | 'warning'
  completedAt?: string
  failureReason?: string
}

const COUNTERPARTIES = ['Stanbic', 'Centenary', 'DFCU', 'Equity', 'Absa', 'HFB', 'BoA', 'MTN MoMo', 'Treasury', 'BOU']
const STATUSES: BankSettlement['status'][] = ['completed', 'completed', 'completed', 'processing', 'pending', 'failed']

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeBatchDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toISOString().slice(0, 10)
}

function generateSettlement(tenantId: string, idx: number): BankSettlement {
  const status = rnd(STATUSES)
  const gross = rndInt(500_000_000, 8_000_000_000)
  return {
    id: `BATCH-${tenantId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    tenantId,
    batchDate: makeBatchDate(rndInt(0, 14)),
    grossAmount: gross,
    netAmount: Math.floor(gross * 0.97),
    transactionCount: rndInt(200, 4000),
    status,
    type: idx % 2 === 0 ? 'inbound' : 'outbound',
    counterparty: rnd(COUNTERPARTIES.filter((c) => c.toLowerCase() !== tenantId)),
    slaStatus: status === 'failed' ? 'breach' : rnd(['compliant', 'compliant', 'compliant', 'warning']),
    completedAt: status === 'completed' ? `${makeBatchDate(rndInt(0, 14))} ${String(rndInt(8, 17)).padStart(2, '0')}:${String(rndInt(0, 59)).padStart(2, '0')}` : undefined,
    failureReason: status === 'failed' ? rnd(['Counterparty timeout', 'Insufficient liquidity', 'Validation error']) : undefined,
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankSettlements: BankSettlement[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 15 }, (_, i) => generateSettlement(tid, bankIdx * 15 + i))
)
```

- [ ] **Step 5: Create `src/data/mockBankQueue.ts`**

```typescript
export interface BankQueueEntry {
  id: string
  tenantId: string
  instructionRef: string
  amount: number
  counterparty: string
  type: 'credit' | 'debit'
  priority: 'urgent' | 'normal' | 'low'
  status: 'queued' | 'processing' | 'settled' | 'rejected' | 'on_hold'
  submittedAt: string
  settlementWindow: string
  slaMinutes: number
  elapsedMinutes: number
}

const COUNTERPARTIES = ['BOU', 'Stanbic', 'Centenary', 'DFCU', 'Equity', 'Absa', 'HFB', 'BoA', 'Treasury']
const PRIORITIES: BankQueueEntry['priority'][] = ['urgent', 'normal', 'normal', 'normal', 'low']
const STATUSES: BankQueueEntry['status'][] = ['queued', 'queued', 'processing', 'settled', 'settled', 'rejected', 'on_hold']

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeTime(minAgo: number): string {
  const d = new Date(Date.now() - minAgo * 60_000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function generateEntry(tenantId: string, idx: number): BankQueueEntry {
  const sla = rndInt(15, 120)
  const elapsed = rndInt(0, sla + 20)
  return {
    id: `Q-${tenantId.toUpperCase()}-${String(idx).padStart(4, '0')}`,
    tenantId,
    instructionRef: `RTGS-${tenantId.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}${idx}`,
    amount: rndInt(10_000_000, 500_000_000),
    counterparty: rnd(COUNTERPARTIES.filter((c) => c.toLowerCase() !== tenantId)),
    type: idx % 2 === 0 ? 'credit' : 'debit',
    priority: rnd(PRIORITIES),
    status: rnd(STATUSES),
    submittedAt: makeTime(elapsed),
    settlementWindow: rnd(['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00']),
    slaMinutes: sla,
    elapsedMinutes: elapsed,
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankQueue: BankQueueEntry[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 20 }, (_, i) => generateEntry(tid, bankIdx * 20 + i))
)
```

- [ ] **Step 6: Create `src/data/mockBankExceptions.ts`**

```typescript
export interface BankException {
  id: string
  tenantId: string
  instructionRef: string
  amount: number
  counterparty: string
  type: 'failed_settlement' | 'rejected_instruction' | 'duplicate' | 'timeout' | 'insufficient_liquidity'
  reason: string
  severity: 'critical' | 'high' | 'medium'
  status: 'open' | 'investigating' | 'resolved' | 'escalated'
  raisedAt: string
  slaDue: string
  assignedTo?: string
}

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

const TYPES: BankException['type'][] = ['failed_settlement', 'rejected_instruction', 'duplicate', 'timeout', 'insufficient_liquidity']
const REASONS: Record<BankException['type'], string[]> = {
  failed_settlement: ['Settlement window expired', 'Counterparty offline', 'Account frozen'],
  rejected_instruction: ['Invalid BIC code', 'Amount exceeds limit', 'Missing mandatory field'],
  duplicate: ['Duplicate instruction reference', 'Same amount within 5 minutes'],
  timeout: ['RTGS engine timeout', 'Network timeout after 3 retries'],
  insufficient_liquidity: ['Available balance below threshold', 'Reserve requirement not met'],
}
const STATUSES: BankException['status'][] = ['open', 'open', 'investigating', 'resolved', 'escalated']
const ASSIGNEES = ['Aisha Kamara', 'Robert Okello', 'Diana Nambooze', 'Moses Opio', undefined]

function makeTS(minsAgo: number): string {
  const d = new Date(Date.now() - minsAgo * 60_000)
  return `${d.toISOString().slice(0, 10)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function generateException(tenantId: string, idx: number): BankException {
  const type = rnd(TYPES)
  const raisedMinsAgo = rndInt(5, 480)
  return {
    id: `EXC-${tenantId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    tenantId,
    instructionRef: `RTGS-${tenantId.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-5)}${idx}`,
    amount: rndInt(5_000_000, 300_000_000),
    counterparty: rnd(['BOU', 'Stanbic', 'Centenary', 'DFCU', 'Equity', 'Treasury'].filter((c) => c.toLowerCase() !== tenantId)),
    type,
    reason: rnd(REASONS[type]),
    severity: rnd(['critical', 'high', 'high', 'medium', 'medium']),
    status: rnd(STATUSES),
    raisedAt: makeTS(raisedMinsAgo),
    slaDue: makeTS(raisedMinsAgo - rndInt(30, 120)),
    assignedTo: rnd(ASSIGNEES),
  }
}

const TENANT_IDS = ['stanbic', 'centenary', 'dfcu', 'equity', 'absa', 'hfb', 'boa']

export const mockBankExceptions: BankException[] = TENANT_IDS.flatMap((tid, bankIdx) =>
  Array.from({ length: 10 }, (_, i) => generateException(tid, bankIdx * 10 + i))
)
```

- [ ] **Step 7: Commit**

```bash
git add src/data/mockBanks.ts src/data/mockBankTransactions.ts src/data/mockBankLiquidity.ts src/data/mockBankSettlements.ts src/data/mockBankQueue.ts src/data/mockBankExceptions.ts
git commit -m "feat(data): add mock bank data (transactions, liquidity, settlements, queue, exceptions)"
```

---

## Task 3: Seed tenantId on Existing Mock Data

**Files:**
- Modify: `src/data/mockTransactions.ts`
- Modify: `src/data/mockSettlements.ts`

The existing mock data has no `tenantId`. The national portal is the only consumer of this data, so adding `tenantId: 'national'` to each record requires no logic change — just a field addition.

- [ ] **Step 1: Add tenantId to mockTransactions.ts**

Open `src/data/mockTransactions.ts`. Find where mock transactions are defined (they're an array of objects). For each transaction object, add `tenantId: 'national'` as a field.

If the transactions are built with a helper function or `Array.from`, add `tenantId: 'national'` inside the generator. If they're inline objects, do a find-and-replace: add `tenantId: 'national',` after the opening `{` of each transaction, or (easier) at the end before the closing `}`.

The fastest approach: find the existing Transaction type import and confirm `tenantId` is NOT in the existing `Transaction` interface in `src/types/index.ts` — it isn't, so you also need to add it to the `Transaction` interface:

```typescript
export interface Transaction {
  id: string
  amount: number
  payer: string
  payee: string
  agency: string
  service: string
  channel: Channel
  status: Status
  region: Region
  prn: string
  timestamp: string
  processingTime: number
  failureReason?: string
  tenantId: string   // ← add this
}
```

Then in `src/data/mockTransactions.ts`, ensure all existing transaction records include `tenantId: 'national'`.

- [ ] **Step 2: Add tenantId to mockSettlements.ts**

Open `src/data/mockSettlements.ts`. Add `tenantId: string` to the `SettlementBatch` interface in `src/types/index.ts`:

```typescript
export interface SettlementBatch {
  id: string
  batchDate: string
  participant: string
  grossAmount: number
  netAmount: number
  transactionCount: number
  status: SettlementStatus
  approvedBy?: string
  completedAt?: string
  failureReason?: string
  tenantId: string   // ← add this
}
```

Then add `tenantId: 'national'` to all records in `src/data/mockSettlements.ts`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: any errors should only be from the new missing `tenantId` field on existing objects — fix those by adding `tenantId: 'national'`.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/data/mockTransactions.ts src/data/mockSettlements.ts
git commit -m "feat(data): add tenantId field to Transaction, SettlementBatch, seed national records"
```

---

## Task 4: Portal Config Objects

**Files:**
- Create: `src/data/mockPortalConfigs.ts`

This file exports one `PortalConfig` per portal entry. These configs are what the router passes into `PortalShell`.

- [ ] **Step 1: Create `src/data/mockPortalConfigs.ts`**

```typescript
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, ListOrdered,
  Banknote, Gauge, AlertTriangle, Vault, RefreshCw,
  BarChart3, Bell, Settings, Building2, GitBranch, Users,
  ShieldAlert, MessageSquareWarning, Code2, Activity,
  Landmark, Cpu, ArrowLeftRight, UserCheck, FileBarChart,
  SlidersHorizontal,
} from 'lucide-react'
import type { PortalConfig } from '../types'

// ─── National GovPay Command Center ──────────────────────────────────────────
export const nationalPortalConfig: PortalConfig = {
  portalType: 'national',
  tenantId: 'national',
  tenantName: 'Uganda GovPay',
  tenantShort: 'GovPay',
  accentColor: '#3b82f6',
  accentLight: '#dbeafe',
  accentDark: '#1e3a8a',
  homeRoute: '/app/national/dashboard',
  allowedRoles: [
    'Super Admin', 'Bank of Uganda Operator', 'Treasury Officer',
    'Agency Officer', 'Compliance Officer', 'Settlement Officer',
    'Support Officer', 'Developer',
  ],
  navSections: [
    {
      header: 'GovPay Platform',
      items: [
        { path: '/app/national/dashboard',      icon: LayoutDashboard,      label: 'Dashboard' },
        { path: '/app/national/collections',    icon: Building2,            label: 'Collections' },
        { path: '/app/national/routing',        icon: GitBranch,            label: 'Routing' },
        { path: '/app/national/participants',   icon: Users,                label: 'Participants' },
        { path: '/app/national/settlement',     icon: Banknote,             label: 'Settlement' },
        { path: '/app/national/reconciliation', icon: RefreshCw,            label: 'Reconciliation' },
        { path: '/app/national/compliance',     icon: ShieldAlert,          label: 'Compliance' },
        { path: '/app/national/disputes',       icon: MessageSquareWarning, label: 'Disputes' },
        { path: '/app/national/api-platform',   icon: Code2,                label: 'API Platform' },
        { path: '/app/national/operations',     icon: Activity,             label: 'Operations Center' },
        { path: '/app/national/reports',        icon: BarChart3,            label: 'Reports' },
        { path: '/app/national/admin',          icon: Settings,             label: 'Admin Settings' },
      ],
    },
    {
      header: 'RTGS Command Center',
      accent: 'amber',
      items: [
        { path: '/app/rtgs',              icon: Landmark,          label: 'RTGS Dashboard', external: true },
        { path: '/app/rtgs/queue',        icon: ListOrdered,       label: 'Settlement Queue', external: true },
        { path: '/app/rtgs/liquidity',    icon: Gauge,             label: 'Liquidity Monitor', external: true },
        { path: '/app/rtgs/interbank',    icon: ArrowLeftRight,    label: 'Interbank Transfers', external: true },
        { path: '/app/rtgs/treasury',     icon: Vault,             label: 'Treasury Transfers', external: true },
        { path: '/app/rtgs/exceptions',   icon: AlertTriangle,     label: 'RTGS Exceptions', external: true },
        { path: '/app/rtgs/reports',      icon: FileBarChart,      label: 'RTGS Reports', external: true },
      ],
    },
  ],
}

// ─── RTGS Command Center ──────────────────────────────────────────────────────
export const rtgsPortalConfig: PortalConfig = {
  portalType: 'rtgs',
  tenantId: 'rtgs',
  tenantName: 'RTGS Command Center',
  tenantShort: 'RTGS',
  accentColor: '#f59e0b',
  accentLight: '#fef3c7',
  accentDark: '#78350f',
  homeRoute: '/app/rtgs',
  allowedRoles: [
    'RTGS Super Admin', 'Central Bank Settlement Operator',
    'Treasury Settlement Officer', 'Bank RTGS Operator',
    'Liquidity Manager', 'RTGS Auditor', 'Super Admin',
  ],
  navSections: [
    {
      header: 'RTGS Command Center',
      accent: 'amber',
      items: [
        { path: '/app/rtgs',              icon: Landmark,          label: 'RTGS Dashboard' },
        { path: '/app/rtgs/simulator',    icon: Cpu,               label: 'RTGS Simulator' },
        { path: '/app/rtgs/queue',        icon: ListOrdered,       label: 'Settlement Queue' },
        { path: '/app/rtgs/liquidity',    icon: Gauge,             label: 'Liquidity Monitor' },
        { path: '/app/rtgs/interbank',    icon: ArrowLeftRight,    label: 'Interbank Transfers' },
        { path: '/app/rtgs/treasury',     icon: Vault,             label: 'Treasury Transfers' },
        { path: '/app/rtgs/participants', icon: UserCheck,         label: 'RTGS Participants' },
        { path: '/app/rtgs/exceptions',   icon: AlertTriangle,     label: 'RTGS Exceptions' },
        { path: '/app/rtgs/reports',      icon: FileBarChart,      label: 'RTGS Reports' },
        { path: '/app/rtgs/admin',        icon: SlidersHorizontal, label: 'RTGS Admin' },
      ],
    },
  ],
}

// ─── Bank portal config factory ───────────────────────────────────────────────
export function getBankPortalConfig(tenantId: string, tenantName: string, tenantShort: string): PortalConfig {
  return {
    portalType: 'bank',
    tenantId,
    tenantName,
    tenantShort,
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    homeRoute: `/app/bank/${tenantId}/dashboard`,
    allowedRoles: ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
    navSections: [
      {
        header: `${tenantShort} Bank Portal`,
        accent: 'emerald',
        items: [
          { path: `/app/bank/${tenantId}/dashboard`,          icon: LayoutDashboard, label: 'My Dashboard' },
          { path: `/app/bank/${tenantId}/incoming`,           icon: ArrowDownLeft,   label: 'Incoming Transactions' },
          { path: `/app/bank/${tenantId}/outgoing`,           icon: ArrowUpRight,    label: 'Outgoing Transactions' },
          { path: `/app/bank/${tenantId}/rtgs-queue`,         icon: ListOrdered,     label: 'RTGS Queue' },
          { path: `/app/bank/${tenantId}/settlement`,         icon: Banknote,        label: 'Settlement Status' },
          { path: `/app/bank/${tenantId}/liquidity`,          icon: Gauge,           label: 'Liquidity Position' },
          { path: `/app/bank/${tenantId}/exceptions`,         icon: AlertTriangle,   label: 'Exceptions' },
          { path: `/app/bank/${tenantId}/treasury-transfers`, icon: Vault,           label: 'Treasury Transfers' },
          { path: `/app/bank/${tenantId}/reconciliation`,     icon: RefreshCw,       label: 'Reconciliation' },
          { path: `/app/bank/${tenantId}/reports`,            icon: BarChart3,       label: 'Reports' },
        ],
      },
    ],
  }
}

// Pre-built configs for each bank
export const stanbicConfig   = getBankPortalConfig('stanbic',   'Stanbic Bank Uganda',    'Stanbic')
export const centenaryConfig = getBankPortalConfig('centenary', 'Centenary Bank',          'Centenary')
export const dfcuConfig      = getBankPortalConfig('dfcu',      'DFCU Bank',               'DFCU')
export const equityConfig    = getBankPortalConfig('equity',    'Equity Bank Uganda',      'Equity')
export const absaConfig      = getBankPortalConfig('absa',      'Absa Uganda',             'Absa')
export const hfbConfig       = getBankPortalConfig('hfb',       'Housing Finance Bank',    'HFB')
export const boaConfig       = getBankPortalConfig('boa',       'Bank of Africa Uganda',   'BoA')

export const BANK_CONFIGS: Record<string, PortalConfig> = {
  stanbic: stanbicConfig, centenary: centenaryConfig, dfcu: dfcuConfig,
  equity: equityConfig, absa: absaConfig, hfb: hfbConfig, boa: boaConfig,
}

// All portals for the Switch Portal modal
export const ALL_PORTAL_ENTRIES = [
  { config: nationalPortalConfig,  label: 'National GovPay Command Center', comingSoon: false },
  { config: stanbicConfig,         label: 'Stanbic Bank Portal',            comingSoon: false },
  { config: centenaryConfig,       label: 'Centenary Bank Portal',          comingSoon: false },
  { config: dfcuConfig,            label: 'DFCU Bank Portal',               comingSoon: false },
  { config: equityConfig,          label: 'Equity Bank Portal',             comingSoon: false },
  { config: absaConfig,            label: 'Absa Uganda Portal',             comingSoon: false },
  { config: hfbConfig,             label: 'Housing Finance Portal',         comingSoon: false },
  { config: boaConfig,             label: 'Bank of Africa Portal',          comingSoon: false },
  { config: rtgsPortalConfig,      label: 'RTGS Command Center',            comingSoon: false },
  // Phase 3+ portals — shown as coming soon
  { config: { portalType: 'treasury' as const, tenantId: 'treasury', tenantName: 'Ministry of Finance', tenantShort: 'MoF', accentColor: '#a855f7', accentLight: '#f3e8ff', accentDark: '#581c87', homeRoute: '/app/treasury/dashboard', navSections: [], allowedRoles: [] }, label: 'Treasury Portal', comingSoon: true },
  { config: { portalType: 'agency' as const, tenantId: 'ura', tenantName: 'Uganda Revenue Authority', tenantShort: 'URA', accentColor: '#f97316', accentLight: '#ffedd5', accentDark: '#7c2d12', homeRoute: '/app/agency/ura/dashboard', navSections: [], allowedRoles: [] }, label: 'Uganda Revenue Authority', comingSoon: true },
  { config: { portalType: 'mobile' as const, tenantId: 'mtn', tenantName: 'MTN Mobile Money', tenantShort: 'MTN', accentColor: '#06b6d4', accentLight: '#cffafe', accentDark: '#164e63', homeRoute: '/app/mobile/mtn/dashboard', navSections: [], allowedRoles: [] }, label: 'MTN Mobile Money', comingSoon: true },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/mockPortalConfigs.ts
git commit -m "feat(data): add portal config objects for all portals"
```

---

## Task 5: Tenant Service

**Files:**
- Create: `src/services/tenantService.ts`

- [ ] **Step 1: Create `src/services/tenantService.ts`**

```typescript
import { mockTransactions } from '../data/mockTransactions'
import { mockSettlementBatches } from '../data/mockSettlements'
import { mockBankTransactions } from '../data/mockBankTransactions'
import { mockBankLiquidity } from '../data/mockBankLiquidity'
import { mockBankSettlements } from '../data/mockBankSettlements'
import { mockBankQueue } from '../data/mockBankQueue'
import { mockBankExceptions } from '../data/mockBankExceptions'
import type { Transaction, SettlementBatch } from '../types'
import type { BankTransaction } from '../data/mockBankTransactions'
import type { BankLiquidity } from '../data/mockBankLiquidity'
import type { BankSettlement } from '../data/mockBankSettlements'
import type { BankQueueEntry } from '../data/mockBankQueue'
import type { BankException } from '../data/mockBankExceptions'

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const tenantService = {
  // National portal — raw platform transactions
  getPlatformTransactions: (tenantId: string): Promise<Transaction[]> =>
    delay(
      tenantId === 'national'
        ? mockTransactions
        : mockTransactions.filter((t) => t.tenantId === tenantId)
    ),

  // National portal — settlement batches
  getPlatformSettlements: (tenantId: string): Promise<SettlementBatch[]> =>
    delay(
      tenantId === 'national'
        ? mockSettlementBatches
        : mockSettlementBatches.filter((s) => s.tenantId === tenantId)
    ),

  // Bank portal — transactions (directional)
  getBankTransactions: (tenantId: string, direction?: 'incoming' | 'outgoing'): Promise<BankTransaction[]> =>
    delay(
      mockBankTransactions
        .filter((t) => t.tenantId === tenantId)
        .filter((t) => !direction || t.direction === direction)
    ),

  // Bank portal — liquidity position
  getBankLiquidity: (tenantId: string): Promise<BankLiquidity> =>
    delay(mockBankLiquidity[tenantId] ?? mockBankLiquidity['stanbic']),

  // Bank portal — settlement batches
  getBankSettlements: (tenantId: string): Promise<BankSettlement[]> =>
    delay(mockBankSettlements.filter((s) => s.tenantId === tenantId)),

  // Bank portal — RTGS queue
  getBankQueue: (tenantId: string): Promise<BankQueueEntry[]> =>
    delay(mockBankQueue.filter((q) => q.tenantId === tenantId)),

  // Bank portal — exceptions
  getBankExceptions: (tenantId: string): Promise<BankException[]> =>
    delay(mockBankExceptions.filter((e) => e.tenantId === tenantId)),
}
```

Note: check the actual export name from `mockSettlements.ts` — it may be `mockSettlementBatches` or just `mockSettlements`. Adjust the import accordingly.

- [ ] **Step 2: Commit**

```bash
git add src/services/tenantService.ts
git commit -m "feat(services): add tenantService with mock data filtering"
```

---

## Task 6: Portal Context & Hooks

**Files:**
- Create: `src/contexts/portalConfig.tsx`
- Create: `src/hooks/portal/usePortalTransactions.ts`
- Create: `src/hooks/portal/usePortalLiquidity.ts`
- Create: `src/hooks/portal/usePortalSettlements.ts`
- Create: `src/hooks/portal/usePortalQueue.ts`

- [ ] **Step 1: Create `src/contexts/portalConfig.tsx`**

```typescript
import { createContext, useContext } from 'react'
import type { PortalConfig } from '../types'

export const PortalConfigContext = createContext<PortalConfig | null>(null)

export function usePortalConfig(): PortalConfig {
  const ctx = useContext(PortalConfigContext)
  if (!ctx) throw new Error('usePortalConfig must be called inside a PortalShell')
  return ctx
}
```

- [ ] **Step 2: Create `src/hooks/portal/usePortalTransactions.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalBankTransactions(direction?: 'incoming' | 'outgoing') {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-transactions', tenantId, direction],
    queryFn: () => tenantService.getBankTransactions(tenantId, direction),
  })
}
```

- [ ] **Step 3: Create `src/hooks/portal/usePortalLiquidity.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalLiquidity() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-liquidity', tenantId],
    queryFn: () => tenantService.getBankLiquidity(tenantId),
  })
}
```

- [ ] **Step 4: Create `src/hooks/portal/usePortalSettlements.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalSettlements() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-settlements', tenantId],
    queryFn: () => tenantService.getBankSettlements(tenantId),
  })
}
```

- [ ] **Step 5: Create `src/hooks/portal/usePortalQueue.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { usePortalConfig } from '../../contexts/portalConfig'
import { tenantService } from '../../services/tenantService'

export function usePortalQueue() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-queue', tenantId],
    queryFn: () => tenantService.getBankQueue(tenantId),
  })
}

export function usePortalExceptions() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['bank-exceptions', tenantId],
    queryFn: () => tenantService.getBankExceptions(tenantId),
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add src/contexts/portalConfig.tsx src/hooks/portal/
git commit -m "feat(context): add PortalConfigContext, usePortalConfig, portal data hooks"
```

---

## Task 7: appStore Changes

**Files:**
- Modify: `src/store/appStore.ts`

- [ ] **Step 1: Add portal fields to AppState interface**

In `src/store/appStore.ts`, add to the `AppState` interface (after the existing `activeRole` fields):

```typescript
  // ─── Portal / Tenant ──────────────────────────────
  activePortal: PortalType | null
  activeTenant: string | null
  setPortal: (portalType: PortalType, tenantId: string, role: Role) => void
```

Also add the `PortalType` import at the top:

```typescript
import type { Role, Toast, ToastVariant, Transaction, MfaChallenge, SessionInfo, SecurityEvent, SecurityEventType, PortalType } from '../types'
```

- [ ] **Step 2: Add implementations in the store**

In the `create<AppState>((set, get) => ({...}))` body, add after the existing `setRole` implementation:

```typescript
  // ─── Portal / Tenant ──────────────────────────────
  activePortal: (localStorage.getItem('govpay_portal') as PortalType | null) ?? null,
  activeTenant: localStorage.getItem('govpay_tenant') ?? null,

  setPortal: (portalType, tenantId, role) => {
    localStorage.setItem('govpay_portal', portalType)
    localStorage.setItem('govpay_tenant', tenantId)
    localStorage.setItem('govpay_role', role)
    set({ activePortal: portalType, activeTenant: tenantId, activeRole: role })
  },
```

- [ ] **Step 3: Update logout to clear portal fields**

Find the `logout` implementation and add the two new localStorage removals:

```typescript
  logout: () => {
    get().pushSecurityEvent('LOGOUT', `Session ended`)
    localStorage.removeItem('govpay_role')
    localStorage.removeItem('govpay_mfa')
    localStorage.removeItem('govpay_session')
    localStorage.removeItem('govpay_portal')   // ← add
    localStorage.removeItem('govpay_tenant')   // ← add
    set({ activeRole: null, mfaVerified: false, mfaChallenge: null, sessionInfo: null, activePortal: null, activeTenant: null })
  },
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in appStore.ts.

- [ ] **Step 5: Commit**

```bash
git add src/store/appStore.ts
git commit -m "feat(store): add activePortal, activeTenant, setPortal to appStore"
```

---

## Task 8: Sidebar Refactor

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

The existing Sidebar has hardcoded `NAV_SECTIONS`. Refactor it to accept `navSections` as a prop. The hardcoded sections become the fallback used only by the old AppShell (which we're keeping temporarily for safety during migration).

- [ ] **Step 1: Update Sidebar to accept navSections prop**

In `src/components/layout/Sidebar.tsx`:

1. Remove the local `NavItem` and `NavSection` interface definitions (they're now in `types/index.ts`).
2. Add the import: `import type { NavSection } from '../../types'`
3. Change the `Sidebar` props to accept optional `navSections`:

```typescript
interface SidebarProps {
  navSections?: NavSection[]
}

export function Sidebar({ navSections: navSectionsProp }: SidebarProps = {}) {
  const navSections = navSectionsProp ?? NAV_SECTIONS
  // rest of component unchanged — uses navSections variable instead of NAV_SECTIONS
```

4. Replace every reference to `NAV_SECTIONS` inside the render with `navSections`.

The hardcoded `NAV_SECTIONS` constant stays in the file as the default fallback.

- [ ] **Step 2: Verify Sidebar still renders with no prop**

The AppShell currently renders `<Sidebar />` with no props. After this change, it should still work because `navSections` defaults to `NAV_SECTIONS`. No other changes needed.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "refactor(sidebar): accept optional navSections prop, default to existing hardcoded sections"
```

---

## Task 9: PortalShell Component

**Files:**
- Create: `src/components/layout/PortalShell.tsx`

- [ ] **Step 1: Create `src/components/layout/PortalShell.tsx`**

```typescript
import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastStack } from '../ui/ToastStack'
import { PortalConfigContext } from '../../contexts/portalConfig'
import { useAppStore } from '../../store/appStore'
import { useLiveUpdates } from '../../hooks/useLiveUpdates'
import type { PortalConfig } from '../../types'

interface PortalShellProps {
  config: PortalConfig
}

export function PortalShell({ config }: PortalShellProps) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  useLiveUpdates()

  // Apply portal accent CSS variables to the document root
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--portal-accent', config.accentColor)
    root.style.setProperty('--portal-accent-light', config.accentLight)
    root.style.setProperty('--portal-accent-dark', config.accentDark)
    return () => {
      root.style.removeProperty('--portal-accent')
      root.style.removeProperty('--portal-accent-light')
      root.style.removeProperty('--portal-accent-dark')
    }
  }, [config.accentColor, config.accentLight, config.accentDark])

  return (
    <PortalConfigContext.Provider value={config}>
      <div className="flex h-screen overflow-hidden bg-surface">
        <motion.div
          className="flex-shrink-0"
          animate={{ width: collapsed ? 56 : 240 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        />
        <Sidebar navSections={config.navSections} portalType={config.portalType} tenantName={config.tenantShort} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar portalConfig={config} />
          <motion.main
            key={config.tenantId}
            className="flex-1 overflow-y-auto p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.main>
        </div>
        <ToastStack />
      </div>
    </PortalConfigContext.Provider>
  )
}
```

Note: `Sidebar` and `Topbar` signatures need slight updates in the next tasks to accept the extra props (`portalType`, `tenantName`, `portalConfig`). For now, these props are optional — the existing implementations will ignore them until updated.

- [ ] **Step 2: Update Sidebar to accept and display portal identity**

In `src/components/layout/Sidebar.tsx`, update the props interface and logo section:

```typescript
interface SidebarProps {
  navSections?: NavSection[]
  portalType?: string
  tenantName?: string
}

export function Sidebar({ navSections: navSectionsProp, tenantName }: SidebarProps = {}) {
```

In the Logo section of the sidebar, replace the hardcoded "Uganda GovPay" text with:

```tsx
<div className="text-white font-bold text-xs leading-tight truncate">
  {tenantName ?? 'Uganda GovPay'}
</div>
<div className="text-accent text-[10px] truncate">National Payment Infrastructure</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/PortalShell.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(shell): add PortalShell with CSS var injection, PortalConfigContext provider"
```

---

## Task 10: Router Restructure & National Portal Migration

This is the most invasive task. It moves 14 page files and rewrites router.tsx. Do it in one commit after all file moves are confirmed.

**Files:**
- Move: `src/routes/app/*.tsx` → `src/routes/app/national/*.tsx` (14 files)
- Modify: `src/router.tsx` (full rewrite)

- [ ] **Step 1: Create the national directory and move files**

Run these commands to move the 14 existing GovPay page files:

```bash
mkdir -p src/routes/app/national
mv src/routes/app/dashboard.tsx      src/routes/app/national/dashboard.tsx
mv src/routes/app/simulator.tsx      src/routes/app/national/simulator.tsx
mv src/routes/app/collections.tsx    src/routes/app/national/collections.tsx
mv src/routes/app/routing.tsx        src/routes/app/national/routing.tsx
mv src/routes/app/participants.tsx   src/routes/app/national/participants.tsx
mv src/routes/app/settlement.tsx     src/routes/app/national/settlement.tsx
mv src/routes/app/reconciliation.tsx src/routes/app/national/reconciliation.tsx
mv src/routes/app/compliance.tsx     src/routes/app/national/compliance.tsx
mv src/routes/app/disputes.tsx       src/routes/app/national/disputes.tsx
mv src/routes/app/api-platform.tsx   src/routes/app/national/api-platform.tsx
mv src/routes/app/operations.tsx     src/routes/app/national/operations.tsx
mv src/routes/app/reports.tsx        src/routes/app/national/reports.tsx
mv src/routes/app/admin.tsx          src/routes/app/national/admin.tsx
mv src/routes/app/architecture.tsx   src/routes/app/national/architecture.tsx
```

- [ ] **Step 2: Fix internal imports in moved files**

Each moved file has imports like `../../components/...` or `../../data/...`. After moving one level deeper, these need an extra `../`:

- `../../components/` → `../../../components/`
- `../../data/` → `../../../data/`
- `../../services/` → `../../../services/`
- `../../store/` → `../../../store/`
- `../../utils/` → `../../../utils/`
- `../../types` → `../../../types`
- `../../features/` → `../../../features/`

Run a search-replace across all 14 moved files. The quickest way:

```bash
cd src/routes/app/national
for f in *.tsx; do
  sed -i 's|from '\''../../|from '\''../../../|g' "$f"
  sed -i 's|from "../../|from "../../../|g' "$f"
done
```

On Windows PowerShell use:
```powershell
Get-ChildItem "src/routes/app/national/*.tsx" | ForEach-Object {
  (Get-Content $_.FullName) -replace "from '../../", "from '../../../" -replace 'from "../../', 'from "../../../' | Set-Content $_.FullName
}
```

- [ ] **Step 3: Create the bank portal directory**

```bash
mkdir -p src/routes/app/bank
```

- [ ] **Step 4: Rewrite `src/router.tsx`**

Replace the entire content of `src/router.tsx` with:

```typescript
import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import { PortalShell } from './components/layout/PortalShell'
import LoginPage from './routes/login'

// ─── National portal pages ────────────────────────────────────────────────────
import NationalDashboardPage    from './routes/app/national/dashboard'
import NationalSimulatorPage    from './routes/app/national/simulator'
import NationalCollectionsPage  from './routes/app/national/collections'
import NationalRoutingPage      from './routes/app/national/routing'
import NationalParticipantsPage from './routes/app/national/participants'
import NationalSettlementPage   from './routes/app/national/settlement'
import NationalReconPage        from './routes/app/national/reconciliation'
import NationalCompliancePage   from './routes/app/national/compliance'
import NationalDisputesPage     from './routes/app/national/disputes'
import NationalApiPage          from './routes/app/national/api-platform'
import NationalOperationsPage   from './routes/app/national/operations'
import NationalReportsPage      from './routes/app/national/reports'
import NationalAdminPage        from './routes/app/national/admin'
import NationalArchPage         from './routes/app/national/architecture'

// ─── RTGS portal pages ────────────────────────────────────────────────────────
import RTGSDashboardPage    from './routes/app/rtgs/index'
import RTGSSimulatorPage    from './routes/app/rtgs/simulator'
import RTGSQueuePage        from './routes/app/rtgs/queue'
import RTGSLiquidityPage    from './routes/app/rtgs/liquidity'
import RTGSInterbankPage    from './routes/app/rtgs/interbank'
import RTGSTreasuryPage     from './routes/app/rtgs/treasury'
import RTGSParticipantsPage from './routes/app/rtgs/participants'
import RTGSExceptionsPage   from './routes/app/rtgs/exceptions'
import RTGSReportsPage      from './routes/app/rtgs/reports'
import RTGSAdminPage        from './routes/app/rtgs/admin'

// ─── Bank portal pages ────────────────────────────────────────────────────────
import BankDashboardPage         from './routes/app/bank/$bankId/dashboard'
import BankIncomingPage          from './routes/app/bank/$bankId/incoming'
import BankOutgoingPage          from './routes/app/bank/$bankId/outgoing'
import BankRtgsQueuePage         from './routes/app/bank/$bankId/rtgs-queue'
import BankSettlementPage        from './routes/app/bank/$bankId/settlement'
import BankLiquidityPage         from './routes/app/bank/$bankId/liquidity'
import BankExceptionsPage        from './routes/app/bank/$bankId/exceptions'
import BankTreasuryTransfersPage from './routes/app/bank/$bankId/treasury-transfers'
import BankReconciliationPage    from './routes/app/bank/$bankId/reconciliation'
import BankReportsPage           from './routes/app/bank/$bankId/reports'

import { nationalPortalConfig, rtgsPortalConfig, BANK_CONFIGS } from './data/mockPortalConfigs'
import { useParams } from '@tanstack/react-router'
import type { Role } from './types'
import { Lock } from 'lucide-react'

// ─── RBAC map ─────────────────────────────────────────────────────────────────
export const ROUTE_ROLES: Record<string, Role[]> = {
  // National
  '/app/national/dashboard':      nationalPortalConfig.allowedRoles,
  '/app/national/simulator':      nationalPortalConfig.allowedRoles,
  '/app/national/collections':    ['Super Admin', 'Agency Officer', 'Support Officer', 'Treasury Officer'],
  '/app/national/routing':        ['Super Admin', 'Bank of Uganda Operator'],
  '/app/national/participants':   ['Super Admin', 'Bank of Uganda Operator', 'Treasury Officer', 'Settlement Officer'],
  '/app/national/settlement':     ['Super Admin', 'Treasury Officer', 'Settlement Officer', 'Bank of Uganda Operator'],
  '/app/national/reconciliation': ['Super Admin', 'Treasury Officer', 'Settlement Officer'],
  '/app/national/compliance':     ['Super Admin', 'Bank of Uganda Operator', 'Compliance Officer'],
  '/app/national/disputes':       ['Super Admin', 'Support Officer', 'Settlement Officer', 'Compliance Officer'],
  '/app/national/api-platform':   ['Super Admin', 'Developer'],
  '/app/national/operations':     ['Super Admin', 'Bank of Uganda Operator', 'Treasury Officer'],
  '/app/national/reports':        nationalPortalConfig.allowedRoles,
  '/app/national/admin':          ['Super Admin'],
  '/app/national/architecture':   nationalPortalConfig.allowedRoles,
  // RTGS (paths unchanged from before)
  '/app/rtgs':              rtgsPortalConfig.allowedRoles,
  '/app/rtgs/simulator':    ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Super Admin'],
  '/app/rtgs/queue':        ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Treasury Settlement Officer', 'Super Admin'],
  '/app/rtgs/liquidity':    ['RTGS Super Admin', 'Liquidity Manager', 'Central Bank Settlement Operator', 'Super Admin'],
  '/app/rtgs/interbank':    ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Bank RTGS Operator', 'Super Admin'],
  '/app/rtgs/treasury':     ['RTGS Super Admin', 'Treasury Settlement Officer', 'Super Admin'],
  '/app/rtgs/participants': ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Super Admin'],
  '/app/rtgs/exceptions':   ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Treasury Settlement Officer', 'Super Admin'],
  '/app/rtgs/reports':      rtgsPortalConfig.allowedRoles,
  '/app/rtgs/admin':        ['RTGS Super Admin', 'Super Admin'],
  // Bank portal
  '/app/bank/:bankId/dashboard':          ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
  '/app/bank/:bankId/incoming':           ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
  '/app/bank/:bankId/outgoing':           ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
  '/app/bank/:bankId/rtgs-queue':         ['Bank RTGS Operator', 'Liquidity Manager', 'Super Admin'],
  '/app/bank/:bankId/settlement':         ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
  '/app/bank/:bankId/liquidity':          ['Bank RTGS Operator', 'Liquidity Manager', 'Super Admin'],
  '/app/bank/:bankId/exceptions':         ['Bank RTGS Operator', 'Super Admin'],
  '/app/bank/:bankId/treasury-transfers': ['Bank RTGS Operator', 'Bank Auditor', 'Super Admin'],
  '/app/bank/:bankId/reconciliation':     ['Bank RTGS Operator', 'Bank Auditor', 'Super Admin'],
  '/app/bank/:bankId/reports':            ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
}

function canAccess(path: string, role: Role | null): boolean {
  if (!role) return false
  // For bank routes with dynamic bankId, normalise to pattern key
  const normPath = path.replace(/\/app\/bank\/[^/]+/, '/app/bank/:bankId')
  return (ROUTE_ROLES[normPath] ?? []).includes(role)
}

function AccessDenied({ path }: { path: string }) {
  const normPath = path.replace(/\/app\/bank\/[^/]+/, '/app/bank/:bankId')
  const allowed = ROUTE_ROLES[normPath] ?? []
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
        <Lock size={28} className="text-danger" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
      <p className="text-muted text-sm max-w-sm mb-4">
        Your current role does not have permission to access this module.
      </p>
      <div className="bg-surface border border-border rounded-xl px-4 py-3 max-w-xs w-full text-left">
        <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wider">Authorised roles</p>
        <div className="flex flex-wrap gap-1.5">
          {allowed.map((r) => (
            <span key={r} className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5">{r}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function guardedRoute(path: string, Page: React.ComponentType) {
  return function GuardedPage() {
    const role = localStorage.getItem('govpay_role') as Role | null
    if (!canAccess(path, role)) return <AccessDenied path={path} />
    return <Page />
  }
}

// ─── Bank portal wrapper — reads $bankId from URL, provides PortalShell ───────
function BankPortalShell() {
  const { bankId } = useParams({ from: '/app/bank/$bankId' })
  const config = BANK_CONFIGS[bankId]
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Unknown bank: {bankId}</p>
      </div>
    )
  }
  return <PortalShell config={config} />
}

// ─── Route tree ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: Outlet })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/login' }) },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Auth guard wrapper — no shell here, just Outlet
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: Outlet,
  beforeLoad: () => {
    const role = localStorage.getItem('govpay_role')
    const mfa  = localStorage.getItem('govpay_mfa')
    if (!role || mfa !== '1') throw redirect({ to: '/login' })
  },
})

// Redirect /app → /app/national/dashboard
const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/app/national/dashboard' }) },
})

// ─── National portal ──────────────────────────────────────────────────────────
const nationalShellRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/national',
  component: () => <PortalShell config={nationalPortalConfig} />,
})

const nDashboard      = createRoute({ getParentRoute: () => nationalShellRoute, path: '/dashboard',      component: guardedRoute('/app/national/dashboard',      NationalDashboardPage) })
const nSimulator      = createRoute({ getParentRoute: () => nationalShellRoute, path: '/simulator',      component: guardedRoute('/app/national/simulator',      NationalSimulatorPage) })
const nCollections    = createRoute({ getParentRoute: () => nationalShellRoute, path: '/collections',    component: guardedRoute('/app/national/collections',    NationalCollectionsPage) })
const nRouting        = createRoute({ getParentRoute: () => nationalShellRoute, path: '/routing',        component: guardedRoute('/app/national/routing',        NationalRoutingPage) })
const nParticipants   = createRoute({ getParentRoute: () => nationalShellRoute, path: '/participants',   component: guardedRoute('/app/national/participants',   NationalParticipantsPage) })
const nSettlement     = createRoute({ getParentRoute: () => nationalShellRoute, path: '/settlement',     component: guardedRoute('/app/national/settlement',     NationalSettlementPage) })
const nRecon          = createRoute({ getParentRoute: () => nationalShellRoute, path: '/reconciliation', component: guardedRoute('/app/national/reconciliation', NationalReconPage) })
const nCompliance     = createRoute({ getParentRoute: () => nationalShellRoute, path: '/compliance',     component: guardedRoute('/app/national/compliance',     NationalCompliancePage) })
const nDisputes       = createRoute({ getParentRoute: () => nationalShellRoute, path: '/disputes',       component: guardedRoute('/app/national/disputes',       NationalDisputesPage) })
const nApi            = createRoute({ getParentRoute: () => nationalShellRoute, path: '/api-platform',   component: guardedRoute('/app/national/api-platform',   NationalApiPage) })
const nOps            = createRoute({ getParentRoute: () => nationalShellRoute, path: '/operations',     component: guardedRoute('/app/national/operations',     NationalOperationsPage) })
const nReports        = createRoute({ getParentRoute: () => nationalShellRoute, path: '/reports',        component: guardedRoute('/app/national/reports',        NationalReportsPage) })
const nAdmin          = createRoute({ getParentRoute: () => nationalShellRoute, path: '/admin',          component: guardedRoute('/app/national/admin',          NationalAdminPage) })
const nArch           = createRoute({ getParentRoute: () => nationalShellRoute, path: '/architecture',   component: guardedRoute('/app/national/architecture',   NationalArchPage) })

// ─── RTGS portal ──────────────────────────────────────────────────────────────
const rtgsShellRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/rtgs',
  component: () => <PortalShell config={rtgsPortalConfig} />,
})

// RTGS dashboard at /app/rtgs (index of rtgs shell)
const rtgsIndex       = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/',             component: guardedRoute('/app/rtgs',              RTGSDashboardPage) })
const rtgsSimulator   = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/simulator',    component: guardedRoute('/app/rtgs/simulator',    RTGSSimulatorPage) })
const rtgsQueue       = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/queue',        component: guardedRoute('/app/rtgs/queue',        RTGSQueuePage) })
const rtgsLiquidity   = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/liquidity',    component: guardedRoute('/app/rtgs/liquidity',    RTGSLiquidityPage) })
const rtgsInterbank   = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/interbank',    component: guardedRoute('/app/rtgs/interbank',    RTGSInterbankPage) })
const rtgsTreasury    = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/treasury',     component: guardedRoute('/app/rtgs/treasury',     RTGSTreasuryPage) })
const rtgsParticipants = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/participants', component: guardedRoute('/app/rtgs/participants', RTGSParticipantsPage) })
const rtgsExceptions  = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/exceptions',   component: guardedRoute('/app/rtgs/exceptions',   RTGSExceptionsPage) })
const rtgsReports     = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/reports',      component: guardedRoute('/app/rtgs/reports',      RTGSReportsPage) })
const rtgsAdmin       = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/admin',        component: guardedRoute('/app/rtgs/admin',        RTGSAdminPage) })

// ─── Bank portal ──────────────────────────────────────────────────────────────
const bankShellRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/bank/$bankId',
  component: BankPortalShell,
})

const bDashboard         = createRoute({ getParentRoute: () => bankShellRoute, path: '/dashboard',          component: BankDashboardPage })
const bIncoming          = createRoute({ getParentRoute: () => bankShellRoute, path: '/incoming',           component: BankIncomingPage })
const bOutgoing          = createRoute({ getParentRoute: () => bankShellRoute, path: '/outgoing',           component: BankOutgoingPage })
const bRtgsQueue         = createRoute({ getParentRoute: () => bankShellRoute, path: '/rtgs-queue',         component: BankRtgsQueuePage })
const bSettlement        = createRoute({ getParentRoute: () => bankShellRoute, path: '/settlement',         component: BankSettlementPage })
const bLiquidity         = createRoute({ getParentRoute: () => bankShellRoute, path: '/liquidity',          component: BankLiquidityPage })
const bExceptions        = createRoute({ getParentRoute: () => bankShellRoute, path: '/exceptions',         component: BankExceptionsPage })
const bTreasuryTransfers = createRoute({ getParentRoute: () => bankShellRoute, path: '/treasury-transfers', component: BankTreasuryTransfersPage })
const bRecon             = createRoute({ getParentRoute: () => bankShellRoute, path: '/reconciliation',     component: BankReconciliationPage })
const bReports           = createRoute({ getParentRoute: () => bankShellRoute, path: '/reports',            component: BankReportsPage })

// ─── Route tree assembly ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    appIndexRoute,
    nationalShellRoute.addChildren([
      nDashboard, nSimulator, nCollections, nRouting, nParticipants,
      nSettlement, nRecon, nCompliance, nDisputes, nApi,
      nOps, nReports, nAdmin, nArch,
    ]),
    rtgsShellRoute.addChildren([
      rtgsIndex, rtgsSimulator, rtgsQueue, rtgsLiquidity, rtgsInterbank,
      rtgsTreasury, rtgsParticipants, rtgsExceptions, rtgsReports, rtgsAdmin,
    ]),
    bankShellRoute.addChildren([
      bDashboard, bIncoming, bOutgoing, bRtgsQueue, bSettlement,
      bLiquidity, bExceptions, bTreasuryTransfers, bRecon, bReports,
    ]),
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```

- [ ] **Step 5: Update RTGS page files that reference `/app/rtgs` breadcrumb in Topbar**

The `BREADCRUMB_MAP` in `Topbar.tsx` still has old `/app/dashboard` paths. We'll update Topbar in Task 18 — for now, pages will show "GovPay Switch" as breadcrumb fallback, which is acceptable.

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit
```

Fix any TypeScript errors (likely missing imports in moved files or type mismatches). Then:

```bash
npm run dev
```

Open http://localhost:5173, log in as any role, verify the national portal loads at `/app/national/dashboard` and RTGS loads at `/app/rtgs`.

- [ ] **Step 7: Commit**

```bash
git add src/routes/app/national/ src/router.tsx
git commit -m "feat(router): restructure routes — national portal migrated to /app/national/*, bank/rtgs portal shells added"
```

---

## Task 11: Login Overhaul

**Files:**
- Modify: `src/routes/login.tsx` (full replacement)

Three-step flow: organisation picker → role picker → MFA. The MFA step is unchanged from the current implementation.

- [ ] **Step 1: Replace `src/routes/login.tsx`**

```typescript
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import type { Role, PortalType } from '../types'
import { fadeInUp, staggerContainer } from '../utils/animations'
import {
  ShieldCheck, Landmark, Building2, Smartphone, ArrowLeft,
  Lock, CheckCircle2, AlertCircle, Copy, RefreshCw, ChevronRight,
} from 'lucide-react'
import { ALL_PORTAL_ENTRIES } from '../data/mockPortalConfigs'
import type { PortalConfig } from '../types'

// ─── Institution roles scoped by tenant ──────────────────────────────────────
const INSTITUTION_ROLES: Record<string, { role: Role; description: string }[]> = {
  national: [
    { role: 'Super Admin',             description: 'Full system access' },
    { role: 'Bank of Uganda Operator', description: 'Central bank oversight' },
    { role: 'Compliance Officer',      description: 'AML, risk and audit' },
    { role: 'Settlement Officer',      description: 'Batch settlement ops' },
    { role: 'Support Officer',         description: 'Dispute resolution' },
    { role: 'Developer',               description: 'API integration & sandbox' },
  ],
  stanbic:   [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  centenary: [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  dfcu:      [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  equity:    [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  absa:      [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  hfb:       [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  boa:       [{ role: 'Bank RTGS Operator', description: 'Settlement & queue management' }, { role: 'Liquidity Manager', description: 'Liquidity position & injection' }, { role: 'Bank Auditor', description: 'Read-only reporting access' }],
  rtgs:      [{ role: 'RTGS Super Admin', description: 'Full RTGS access' }, { role: 'Central Bank Settlement Operator', description: 'RTGS settlement ops' }, { role: 'Liquidity Manager', description: 'Liquidity management' }, { role: 'RTGS Auditor', description: 'Audit & compliance' }],
  treasury:  [{ role: 'Treasury Officer', description: 'Settlement & treasury' }, { role: 'Treasury Approver', description: 'Approvals & authorisations' }, { role: 'Treasury Auditor', description: 'Read-only access' }],
  ura:       [{ role: 'Agency Officer', description: 'Collections management' }, { role: 'Collections Manager', description: 'Revenue tracking' }, { role: 'Agency Auditor', description: 'Read-only access' }],
  mtn:       [{ role: 'Mobile Operator', description: 'Channel & routing ops' }, { role: 'Mobile Auditor', description: 'Read-only access' }],
  airtel:    [{ role: 'Mobile Operator', description: 'Channel & routing ops' }, { role: 'Mobile Auditor', description: 'Read-only access' }],
}

const PORTAL_TYPE_ICONS: Record<PortalType | string, React.ElementType> = {
  national: ShieldCheck,
  bank:     Building2,
  rtgs:     Landmark,
  treasury: Landmark,
  agency:   Building2,
  mobile:   Smartphone,
}

const PORTAL_TYPE_LABELS: Record<string, string> = {
  national: 'NATIONAL', bank: 'BANK', rtgs: 'RTGS',
  treasury: 'TREASURY', agency: 'AGENCY', mobile: 'MOBILE',
}

type Step = 'org' | 'role' | 'mfa'

function UgandaFlag() {
  const s = 28 / 6
  return (
    <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
      <rect width="28" height={s} fill="#1a1a1a" />
      <rect y={s} width="28" height={s} fill="#FCDC04" />
      <rect y={s * 2} width="28" height={s} fill="#CE1126" />
      <rect y={s * 3} width="28" height={s} fill="#1a1a1a" />
      <rect y={s * 4} width="28" height={s} fill="#FCDC04" />
      <rect y={s * 5} width="28" height={s} fill="#CE1126" />
      <circle cx="14" cy="14" r="5.6" fill="white" />
      <ellipse cx="14" cy="15.8" rx="2.5" ry="1.7" fill="#555" />
      <path d="M14.4 14.1 Q15.6 12.2 14 10.9" stroke="#555" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="13.8" cy="10.3" r="1.05" fill="#555" />
    </svg>
  )
}

export default function LoginPage() {
  const [step, setStep]             = useState<Step>('org')
  const [selectedConfig, setConfig] = useState<PortalConfig | null>(null)
  const [selectedRole, setRole_]    = useState<Role | null>(null)
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const [error, setError]           = useState('')
  const [copied, setCopied]         = useState(false)
  const [shaking, setShaking]       = useState(false)
  const [timeLeft, setTimeLeft]     = useState(300)
  const [challenge, setChallenge]   = useState<{ code: string } | null>(null)

  const inputRefs  = useRef<(HTMLInputElement | null)[]>([])
  const setPortal  = useAppStore((s) => s.setPortal)
  const startMfa   = useAppStore((s) => s.startMfaChallenge)
  const verifyMfa  = useAppStore((s) => s.verifyMfa)
  const setStoreRole = useAppStore((s) => s.setRole)
  const navigate   = useNavigate()

  useEffect(() => {
    if (step !== 'mfa') return
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [step])

  function handleOrgSelect(config: PortalConfig) {
    setConfig(config)
    setRole_(null)
    setStep('role')
  }

  function handleRoleNext() {
    if (!selectedRole || !selectedConfig) return
    setStoreRole(selectedRole)
    const c = startMfa(selectedRole)
    setChallenge(c)
    setTimeLeft(300)
    setStep('mfa')
    setTimeout(() => inputRefs.current[0]?.focus(), 300)
  }

  function handleOtpChange(idx: number, val: string) {
    if (val.length > 1) { handleOtpPaste(idx, val); return }
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next); setError('')
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.every((d) => d !== '')) submitOtp(next.join(''))
  }

  function handleOtpPaste(idx: number, text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 6 - idx).split('')
    const next = [...otp]
    digits.forEach((d, o) => { next[idx + o] = d })
    setOtp(next); setError('')
    const nextEmpty = next.findIndex((d) => d === '')
    if (nextEmpty === -1) { submitOtp(next.join('')); return }
    inputRefs.current[nextEmpty]?.focus()
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
    if (e.key === 'Enter') { const code = otp.join(''); if (code.length === 6) submitOtp(code) }
  }

  function submitOtp(code: string) {
    const ok = verifyMfa(code)
    if (ok && selectedConfig && selectedRole) {
      setPortal(selectedConfig.portalType, selectedConfig.tenantId, selectedRole)
      navigate({ to: selectedConfig.homeRoute as any })
    } else {
      setShaking(true); setError('Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => { setShaking(false); inputRefs.current[0]?.focus() }, 500)
    }
  }

  function resetChallenge() {
    if (!selectedRole) return
    const c = startMfa(selectedRole)
    setChallenge(c); setOtp(['', '', '', '', '', '']); setError(''); setTimeLeft(300)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  // Group portals by type for display
  const groups: Record<string, typeof ALL_PORTAL_ENTRIES> = {}
  ALL_PORTAL_ENTRIES.filter((e) => !e.comingSoon).forEach((entry) => {
    const key = entry.config.portalType
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <motion.div className="relative z-10 w-full max-w-2xl" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UgandaFlag />
            <div className="text-left">
              <div className="text-white font-bold text-xl leading-tight">Uganda GovPay Switch</div>
              <div className="text-accent text-sm">National Payment Infrastructure</div>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3">
            {(['org', 'role', 'mfa'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-white/20" />}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? 'text-accent' : i < ['org','role','mfa'].indexOf(step) ? 'text-white/50' : 'text-white/30'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === s ? 'bg-accent text-primary border-accent' : i < ['org','role','mfa'].indexOf(step) ? 'border-white/30 bg-white/10 text-white/50' : 'border-white/20'}`}>
                    {i < ['org','role','mfa'].indexOf(step) ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  {['Organisation', 'Role', 'Verify'][i]}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Organisation ──────────────────────────────────────────── */}
          {step === 'org' && (
            <motion.div key="org" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}>
              <motion.p variants={fadeInUp} className="text-white/70 text-sm text-center mb-4">
                Select your institution to enter its portal
              </motion.p>
              <motion.div variants={fadeInUp} className="space-y-3">
                {Object.entries(groups).map(([type, entries]) => {
                  const Icon = PORTAL_TYPE_ICONS[type] ?? Building2
                  const label = PORTAL_TYPE_LABELS[type] ?? type.toUpperCase()
                  return (
                    <div key={type}>
                      <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1.5 px-1">{label}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {entries.map(({ config, label: entryLabel }) => (
                          <button
                            key={config.tenantId}
                            onClick={() => handleOrgSelect(config)}
                            className="text-left p-3 rounded-xl border-2 border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 transition-all duration-200 active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.accentColor + '33', border: `1px solid ${config.accentColor}66` }}>
                                <Icon size={14} style={{ color: config.accentColor }} />
                              </div>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: config.accentColor + '22', color: config.accentColor }}>{label}</span>
                            </div>
                            <div className="text-white font-semibold text-xs">{config.tenantName}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}

          {/* ── Step 2: Role ──────────────────────────────────────────────────── */}
          {step === 'role' && selectedConfig && (
            <motion.div key="role" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep('org')} className="text-white/50 hover:text-white transition-colors">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="text-white font-bold text-sm">{selectedConfig.tenantName}</div>
                  <div className="text-white/60 text-xs">Select your role</div>
                </div>
                <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: selectedConfig.accentColor + '33', color: selectedConfig.accentColor }}>{PORTAL_TYPE_LABELS[selectedConfig.portalType]}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-5">
                {(INSTITUTION_ROLES[selectedConfig.tenantId] ?? []).map(({ role, description }) => (
                  <button
                    key={role}
                    onClick={() => setRole_(role)}
                    className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${selectedRole === role ? 'border-accent bg-accent/20 text-white' : 'border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{role}</div>
                        <div className={`text-xs mt-0.5 ${selectedRole === role ? 'text-white/70' : 'text-white/50'}`}>{description}</div>
                      </div>
                      {selectedRole === role && <CheckCircle2 size={16} className="text-accent flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleRoleNext}
                disabled={!selectedRole}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {selectedRole ? `Continue as ${selectedRole}` : 'Select a role'}
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Step 3: MFA ───────────────────────────────────────────────────── */}
          {step === 'mfa' && (
            <motion.div key="mfa" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep('role')} className="text-white/50 hover:text-white transition-colors"><ArrowLeft size={16} /></button>
                <div>
                  <div className="text-white font-bold text-sm">Multi-Factor Authentication</div>
                  <div className="text-white/60 text-xs">Verify your identity to proceed</div>
                </div>
              </div>
              {/* Demo OTP */}
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={12} className="text-accent" />
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Demo — One-Time Code</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-accent tracking-[0.4em]">{challenge?.code ?? '------'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(challenge?.code ?? '').catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex items-center gap-1 text-xs text-white/50 hover:text-white bg-white/10 rounded-md px-2 py-1">
                      {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={resetChallenge} className="flex items-center gap-1 text-xs text-white/50 hover:text-white bg-white/10 rounded-md px-2 py-1"><RefreshCw size={12} />New</button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${timeLeft > 60 ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                  <span className={`text-xs font-mono ${timeLeft > 60 ? 'text-white/50' : 'text-red-400'}`}>Expires in {mins}:{secs}</span>
                </div>
              </div>
              {/* OTP inputs */}
              <label className="text-white/70 text-xs block mb-2">Enter the 6-digit code</label>
              <motion.div className="flex gap-2 justify-center mb-4" animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.35 }}>
                {otp.map((digit, idx) => (
                  <input key={idx} ref={(el) => { inputRefs.current[idx] = el }} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onPaste={(e) => { e.preventDefault(); handleOtpPaste(idx, e.clipboardData.getData('text')) }}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-11 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all bg-white/10 text-white ${error ? 'border-red-400' : digit ? 'border-accent bg-accent/20' : 'border-white/30 focus:border-accent'}`}
                    style={{ height: '3.25rem' }}
                  />
                ))}
              </motion.div>
              {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-xs mb-4"><AlertCircle size={13} />{error}</motion.div>}
              <button
                onClick={() => submitOtp(otp.join(''))}
                disabled={otp.join('').length < 6 || timeLeft === 0}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              >
                Verify &amp; Enter {selectedConfig?.tenantShort ?? ''} Portal
              </button>
              <p className="text-center text-white/40 text-xs mt-3">Secured with TOTP · TLS 1.3 / AES-256-GCM</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p variants={fadeInUp} className="text-center text-white/40 text-xs mt-4">
          Demo environment — no real payment data · Uganda GovPay Switch v3.0
        </motion.p>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Test login flow**

Run `npm run dev`. Navigate to `/login`. Verify:
- Organisation grid shows all portal types grouped (National, Bank, RTGS)
- Selecting Stanbic → Step 2 shows Stanbic's 3 roles only
- Selecting a role → Step 3 shows MFA with OTP
- Entering OTP → redirects to `/app/bank/stanbic/dashboard`

- [ ] **Step 3: Commit**

```bash
git add src/routes/login.tsx
git commit -m "feat(login): overhaul to three-step org->role->MFA flow with portal-aware redirect"
```

---

## Task 12: Bank Dashboard Page

**Files:**
- Create: `src/routes/app/bank/$bankId/dashboard.tsx`

This is the most complex bank page. Build it fully — other pages follow simpler patterns.

- [ ] **Step 1: Create `src/routes/app/bank/$bankId/dashboard.tsx`**

```typescript
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownLeft, ArrowUpRight, ListOrdered, AlertTriangle, Gauge, Banknote, CheckCircle, Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { AreaChart } from '../../../../components/charts/AreaChart'
import { LineChart } from '../../../../components/charts/LineChart'
import { BarChart } from '../../../../components/charts/BarChart'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { KPICard } from '../../../../components/ui/KPICard'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { tenantService } from '../../../../services/tenantService'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'

function useBankDashboard(tenantId: string) {
  const txns      = useQuery({ queryKey: ['bank-txns', tenantId], queryFn: () => tenantService.getBankTransactions(tenantId) })
  const liquidity = useQuery({ queryKey: ['bank-liq', tenantId],  queryFn: () => tenantService.getBankLiquidity(tenantId) })
  const queue     = useQuery({ queryKey: ['bank-queue', tenantId], queryFn: () => tenantService.getBankQueue(tenantId) })
  const settlements = useQuery({ queryKey: ['bank-set', tenantId], queryFn: () => tenantService.getBankSettlements(tenantId) })
  const exceptions = useQuery({ queryKey: ['bank-exc', tenantId], queryFn: () => tenantService.getBankExceptions(tenantId) })
  return { txns, liquidity, queue, settlements, exceptions }
}

// Generate hourly volume data for chart
function makeHourlyData(txns: { timestamp: string; amount: number; direction: string }[]) {
  const hours = Array.from({ length: 10 }, (_, i) => ({
    hour: `${String(8 + i).padStart(2, '0')}:00`,
    incoming: 0,
    outgoing: 0,
  }))
  txns.forEach((t) => {
    const h = parseInt(t.timestamp.slice(11, 13) ?? '8', 10)
    const idx = Math.min(Math.max(h - 8, 0), 9)
    if (t.direction === 'incoming') hours[idx].incoming += t.amount
    else hours[idx].outgoing += t.amount
  })
  return hours.map((h) => ({
    name: h.hour,
    Incoming: Math.round(h.incoming / 1_000_000),
    Outgoing: Math.round(h.outgoing / 1_000_000),
  }))
}

// 7-day settlement trend
function makeSettlementTrend(settlements: { batchDate: string; netAmount: number }[]) {
  const days: Record<string, number> = {}
  settlements.slice(0, 14).forEach((s) => {
    days[s.batchDate] = (days[s.batchDate] ?? 0) + s.netAmount
  })
  return Object.entries(days).slice(0, 7).map(([date, amount]) => ({
    name: date.slice(5),
    Settlement: Math.round(amount / 1_000_000),
  }))
}

export default function BankDashboardPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()
  const { txns, liquidity, queue, settlements, exceptions } = useBankDashboard(tenantId)

  const allTxns    = txns.data ?? []
  const liq        = liquidity.data
  const allQueue   = queue.data ?? []
  const allSet     = settlements.data ?? []
  const allExc     = exceptions.data ?? []

  const incomingTotal = allTxns.filter((t) => t.direction === 'incoming').reduce((s, t) => s + t.amount, 0)
  const outgoingTotal = allTxns.filter((t) => t.direction === 'outgoing').reduce((s, t) => s + t.amount, 0)
  const pendingQueue  = allQueue.filter((q) => q.status === 'queued' || q.status === 'processing').length
  const failedSet     = allSet.filter((s) => s.status === 'failed').length
  const openExc       = allExc.filter((e) => e.status === 'open' || e.status === 'escalated').length
  const slaCompliant  = allSet.length > 0 ? Math.round((allSet.filter((s) => s.slaStatus === 'compliant').length / allSet.length) * 100) : 100
  const liqPct        = liq?.utilizationPct ?? 0

  const hourlyData    = makeHourlyData(allTxns)
  const trendData     = makeSettlementTrend(allSet)
  const inVsOut       = [{ name: 'Incoming', value: Math.round(incomingTotal / 1_000_000) }, { name: 'Outgoing', value: Math.round(outgoingTotal / 1_000_000) }]

  const loading = txns.isLoading || liquidity.isLoading

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title={`${tenantName} Dashboard`}
          subtitle={`Real-time operational overview — ${new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        />
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard title="Transactions Today" value={loading ? '—' : allTxns.length.toString()} subtitle="All channels" icon={TrendingUp} color="blue" />
        <KPICard title="Incoming Settlement" value={loading ? '—' : `UGX ${(incomingTotal / 1e9).toFixed(1)}B`} subtitle="Today inbound" icon={ArrowDownLeft} color="green" />
        <KPICard title="Outgoing Settlement" value={loading ? '—' : `UGX ${(outgoingTotal / 1e9).toFixed(1)}B`} subtitle="Today outbound" icon={ArrowUpRight} color="orange" />
        <KPICard title="Pending Queue" value={loading ? '—' : pendingQueue.toString()} subtitle="Awaiting settlement" icon={ListOrdered} color={pendingQueue > 10 ? 'red' : 'blue'} />
        <KPICard title="Failed Settlements" value={loading ? '—' : failedSet.toString()} subtitle="Require attention" icon={AlertTriangle} color={failedSet > 0 ? 'red' : 'green'} />
        <KPICard title="Liquidity Available" value={liq ? `${(liq.available / 1e9).toFixed(1)}B` : '—'} subtitle={`${liqPct}% utilised`} icon={Gauge} color={liqPct > 85 ? 'red' : liqPct > 70 ? 'orange' : 'green'} />
        <KPICard title="Treasury Payments" value="0" subtitle="Today via RTGS" icon={Banknote} color="blue" />
        <KPICard title="Settlement SLA" value={`${slaCompliant}%`} subtitle="Compliance rate" icon={CheckCircle} color={slaCompliant < 90 ? 'red' : 'green'} />
        <KPICard title="Open Exceptions" value={loading ? '—' : openExc.toString()} subtitle="Need resolution" icon={AlertTriangle} color={openExc > 0 ? 'red' : 'green'} />
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Hourly Transaction Volume (UGX M)</h3>
          <AreaChart data={hourlyData} xKey="name" lines={[{ key: 'Incoming', color: accentColor }, { key: 'Outgoing', color: '#f59e0b' }]} height={220} />
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">7-Day Settlement Trend (UGX M)</h3>
          <LineChart data={trendData} xKey="name" lines={[{ key: 'Settlement', color: accentColor }]} height={220} />
        </div>
      </motion.div>

      {/* Charts Row 2 + Liquidity */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Incoming vs Outgoing (UGX M)</h3>
          <BarChart data={inVsOut} xKey="name" bars={[{ key: 'value', color: accentColor }]} height={200} />
        </div>

        {/* Liquidity bar */}
        <div className="bg-card rounded-card shadow-card p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Liquidity Position</h3>
            <span className="text-xs text-muted">Last updated: {liq?.lastUpdated ?? '—'}</span>
          </div>
          {liq && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Available</span>
                  <span className="font-semibold text-slate-700">{formatUGX(liq.available)}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(liq.utilizationPct, 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>Threshold: {formatUGX(liq.threshold)}</span>
                  <span>{liq.utilizationPct}% utilised</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Available', value: formatUGX(liq.available), ok: true },
                  { label: 'Reserved', value: formatUGX(liq.reserved), ok: true },
                  { label: 'Injection Pending', value: liq.injectionPending > 0 ? formatUGX(liq.injectionPending) : 'None', ok: liq.injectionPending === 0 },
                ].map(({ label, value, ok }) => (
                  <div key={label} className="bg-surface rounded-lg p-3">
                    <div className="text-[10px] text-muted uppercase tracking-wide mb-1">{label}</div>
                    <div className={`text-sm font-bold ${ok ? 'text-slate-800' : 'text-amber-600'}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Live queue table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Latest RTGS Instructions</h3>
          <span className="text-xs text-muted">{pendingQueue} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Reference', 'Amount', 'Counterparty', 'Type', 'Priority', 'Status', 'Elapsed'].map((h) => (
                  <th key={h} className="text-left text-muted font-semibold pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(allQueue.slice(0, 8)).map((q) => (
                <tr key={q.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-2 pr-4 font-mono text-[10px] text-slate-600">{q.instructionRef}</td>
                  <td className="py-2 pr-4 font-semibold">{formatUGX(q.amount)}</td>
                  <td className="py-2 pr-4">{q.counterparty}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${q.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{q.type.toUpperCase()}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${q.priority === 'urgent' ? 'bg-red-100 text-red-700' : q.priority === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{q.priority}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${q.status === 'settled' ? 'bg-green-100 text-green-700' : q.status === 'rejected' ? 'bg-red-100 text-red-700' : q.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{q.status}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={q.elapsedMinutes > q.slaMinutes ? 'text-red-600 font-semibold' : 'text-muted'}>{q.elapsedMinutes}m / {q.slaMinutes}m SLA</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/routes/app/bank/\$bankId/dashboard.tsx"
git commit -m "feat(bank-portal): add bank dashboard with KPIs, charts, liquidity bar, queue table"
```

---

## Task 13: Bank Transaction Pages

**Files:**
- Create: `src/routes/app/bank/$bankId/incoming.tsx`
- Create: `src/routes/app/bank/$bankId/outgoing.tsx`

Both pages are identical except for the `direction` filter.

- [ ] **Step 1: Create `src/routes/app/bank/$bankId/incoming.tsx`**

```typescript
import { motion } from 'framer-motion'
import { ArrowDownLeft, Search } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { tenantService } from '../../../../services/tenantService'
import { useQuery } from '@tanstack/react-query'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import type { Status } from '../../../../types'

const STATUS_STYLE: Record<Status, string> = {
  completed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  failed:     'bg-red-100 text-red-700',
  processing: 'bg-blue-100 text-blue-700',
  cancelled:  'bg-slate-100 text-slate-600',
  reversed:   'bg-purple-100 text-purple-700',
}

export default function BankIncomingPage() {
  const { tenantId, tenantName } = usePortalConfig()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatus] = useState<string>('all')

  const { data = [], isLoading } = useQuery({
    queryKey: ['bank-txns-incoming', tenantId],
    queryFn: () => tenantService.getBankTransactions(tenantId, 'incoming'),
  })

  const filtered = data.filter((t) =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (!search || t.payer.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Incoming Transactions" subtitle={`All inbound transactions for ${tenantName}`} icon={ArrowDownLeft} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payer or reference..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:border-primary/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface focus:outline-none">
          <option value="all">All statuses</option>
          {['completed', 'pending', 'processing', 'failed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-muted ml-auto">{filtered.length} records</span>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Reference', 'Payer', 'Amount', 'Channel', 'Status', 'Region', 'Time', 'Processing'].map((h) => (
                  <th key={h} className="text-left text-muted font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 8 }, (_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{t.reference}</td>
                  <td className="px-4 py-3 font-medium">{t.payer}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{formatUGX(t.amount)}</td>
                  <td className="px-4 py-3 text-muted">{t.channel}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLE[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-muted">{t.region}</td>
                  <td className="px-4 py-3 text-muted">{t.timestamp.slice(11)}</td>
                  <td className="px-4 py-3 text-muted">{t.processingTime}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/routes/app/bank/$bankId/outgoing.tsx`**

Copy the incoming page and change:
1. Import `ArrowUpRight` instead of `ArrowDownLeft`
2. Change `direction` arg to `'outgoing'` in the query
3. Change query key to `'bank-txns-outgoing'`
4. Change `PageHeader` title to `"Outgoing Transactions"`
5. Change subtitle to `"All outbound transactions for ${tenantName}"`
6. Change the amount cell colour from `text-green-700` to `text-orange-600`

```typescript
// Full file — same as incoming.tsx with these changes applied:
import { ArrowUpRight } from 'lucide-react'
// queryKey: ['bank-txns-outgoing', tenantId]
// queryFn: () => tenantService.getBankTransactions(tenantId, 'outgoing')
// title="Outgoing Transactions", subtitle="All outbound..."
// amount cell: className="... text-orange-600"
```

- [ ] **Step 3: Commit**

```bash
git add "src/routes/app/bank/\$bankId/incoming.tsx" "src/routes/app/bank/\$bankId/outgoing.tsx"
git commit -m "feat(bank-portal): add incoming and outgoing transaction pages"
```

---

## Task 14: Bank Operations Pages

**Files:**
- Create: `src/routes/app/bank/$bankId/rtgs-queue.tsx`
- Create: `src/routes/app/bank/$bankId/settlement.tsx`
- Create: `src/routes/app/bank/$bankId/liquidity.tsx`

- [ ] **Step 1: Create `src/routes/app/bank/$bankId/rtgs-queue.tsx`**

```typescript
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ListOrdered, Search, Play, Pause, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { usePortalQueue } from '../../../../hooks/portal/usePortalQueue'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import { useAppStore } from '../../../../store/appStore'

const STATUS_STYLE: Record<string, string> = {
  queued:     'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  settled:    'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
  on_hold:    'bg-slate-100 text-slate-600',
}

export default function BankRtgsQueuePage() {
  const { tenantName } = usePortalConfig()
  const { data = [], isLoading } = usePortalQueue()
  const addToast = useAppStore((s) => s.addToast)
  const [statusFilter, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = data
    .filter((q) => statusFilter === 'all' || q.status === statusFilter)
    .filter((q) => !search || q.instructionRef.toLowerCase().includes(search.toLowerCase()) || q.counterparty.toLowerCase().includes(search.toLowerCase()))

  const pending   = data.filter((q) => q.status === 'queued').length
  const breaching = data.filter((q) => q.elapsedMinutes > q.slaMinutes).length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader title="RTGS Queue" subtitle={`${tenantName} — pending and active settlement instructions`} icon={ListOrdered} />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Queued', value: pending, color: 'blue' },
          { label: 'Processing', value: data.filter((q) => q.status === 'processing').length, color: 'yellow' },
          { label: 'Settled Today', value: data.filter((q) => q.status === 'settled').length, color: 'green' },
          { label: 'SLA Breaches', value: breaching, color: breaching > 0 ? 'red' : 'green' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4">
            <div className="text-xs text-muted mb-1">{label}</div>
            <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference or counterparty..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:border-primary/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface">
          {['all', 'queued', 'processing', 'settled', 'rejected', 'on_hold'].map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
        <span className="text-xs text-muted ml-auto">{filtered.length} instructions</span>
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Instruction Ref', 'Amount', 'Counterparty', 'Type', 'Priority', 'Status', 'Window', 'SLA', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-muted font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }, (_, i) => <tr key={i} className="border-b border-border/50"><td colSpan={9} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" /></td></tr>)
                : filtered.map((q) => {
                    const breaching = q.elapsedMinutes > q.slaMinutes
                    return (
                      <tr key={q.id} className={`border-b border-border/50 hover:bg-surface/50 transition-colors ${breaching ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{q.instructionRef}</td>
                        <td className="px-4 py-3 font-semibold">{formatUGX(q.amount)}</td>
                        <td className="px-4 py-3">{q.counterparty}</td>
                        <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${q.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{q.type.toUpperCase()}</span></td>
                        <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${q.priority === 'urgent' ? 'bg-red-100 text-red-700' : q.priority === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{q.priority}</span></td>
                        <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLE[q.status]}`}>{q.status}</span></td>
                        <td className="px-4 py-3 text-muted text-[10px]">{q.settlementWindow}</td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[10px] ${breaching ? 'text-red-600 font-bold' : 'text-muted'}`}>{q.elapsedMinutes}m / {q.slaMinutes}m</span>
                          {breaching && <AlertTriangle size={10} className="inline ml-1 text-red-500" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {(q.status === 'queued' || q.status === 'on_hold') && (
                              <button onClick={() => addToast(`Instruction ${q.instructionRef} prioritised`, 'success')} className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors" title="Prioritise"><Play size={12} /></button>
                            )}
                            {q.status === 'processing' && (
                              <button onClick={() => addToast(`Instruction ${q.instructionRef} placed on hold`, 'warning')} className="p-1 hover:bg-orange-100 rounded text-orange-600 transition-colors" title="Hold"><Pause size={12} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/routes/app/bank/$bankId/settlement.tsx`**

```typescript
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Banknote, Search, Download } from 'lucide-react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { usePortalSettlements } from '../../../../hooks/portal/usePortalSettlements'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import { useAppStore } from '../../../../store/appStore'

const STATUS_STYLE: Record<string, string> = {
  completed:  'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending:    'bg-yellow-100 text-yellow-700',
  failed:     'bg-red-100 text-red-700',
}

export default function BankSettlementPage() {
  const { tenantName } = usePortalConfig()
  const { data = [], isLoading } = usePortalSettlements()
  const addToast = useAppStore((s) => s.addToast)
  const [statusFilter, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = data
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .filter((s) => !search || s.counterparty.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))

  const totalNet = data.reduce((sum, s) => sum + (s.status === 'completed' ? s.netAmount : 0), 0)
  const failed   = data.filter((s) => s.status === 'failed').length
  const pending  = data.filter((s) => s.status === 'pending' || s.status === 'processing').length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Settlement Status" subtitle={`${tenantName} — settlement batches and status`} icon={Banknote} />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Net Settled', value: `UGX ${(totalNet / 1e9).toFixed(1)}B`, sub: 'Completed today' },
          { label: 'Pending / Processing', value: pending.toString(), sub: 'Awaiting completion' },
          { label: 'Failed Batches', value: failed.toString(), sub: failed > 0 ? 'Need retry' : 'All clear' },
          { label: 'Batch Count', value: data.length.toString(), sub: 'Total batches' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4">
            <div className="text-xs text-muted mb-1">{label}</div>
            <div className="text-xl font-bold text-slate-800">{value}</div>
            <div className="text-[10px] text-muted mt-0.5">{sub}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search batch ID or counterparty..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface">
          {['all', 'completed', 'processing', 'pending', 'failed'].map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
        <button onClick={() => addToast('Settlement report exported', 'success')} className="flex items-center gap-2 text-sm text-muted hover:text-slate-700 border border-border rounded-lg px-3 py-2 bg-surface hover:bg-card transition-colors">
          <Download size={14} /> Export
        </button>
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Batch ID', 'Date', 'Counterparty', 'Type', 'Gross Amount', 'Net Amount', 'Txn Count', 'Status', 'SLA', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-muted font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }, (_, i) => <tr key={i}><td colSpan={10} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td></tr>)
                : filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px]">{s.id}</td>
                    <td className="px-4 py-3 text-muted">{s.batchDate}</td>
                    <td className="px-4 py-3 font-medium">{s.counterparty}</td>
                    <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.type === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s.type}</span></td>
                    <td className="px-4 py-3">{formatUGX(s.grossAmount)}</td>
                    <td className="px-4 py-3 font-semibold">{formatUGX(s.netAmount)}</td>
                    <td className="px-4 py-3 text-muted">{s.transactionCount.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLE[s.status]}`}>{s.status}</span></td>
                    <td className="px-4 py-3"><span className={`text-[10px] ${s.slaStatus === 'breach' ? 'text-red-600 font-bold' : s.slaStatus === 'warning' ? 'text-amber-600' : 'text-green-600'}`}>{s.slaStatus}</span></td>
                    <td className="px-4 py-3">
                      {s.status === 'failed' && (
                        <button onClick={() => addToast(`Retry initiated for ${s.id}`, 'info')} className="text-[10px] text-blue-600 hover:underline">Retry</button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Create `src/routes/app/bank/$bankId/liquidity.tsx`**

```typescript
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gauge, TrendingUp, AlertTriangle, PlusCircle } from 'lucide-react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { usePortalLiquidity } from '../../../../hooks/portal/usePortalLiquidity'
import { AreaChart } from '../../../../components/charts/AreaChart'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import { useAppStore } from '../../../../store/appStore'

export default function BankLiquidityPage() {
  const { tenantName, accentColor } = usePortalConfig()
  const { data: liq, isLoading } = usePortalLiquidity()
  const addToast = useAppStore((s) => s.addToast)
  const [injectionAmount, setInjectionAmount] = useState('')
  const [showModal, setShowModal] = useState(false)

  function requestInjection() {
    if (!injectionAmount) return
    addToast(`Liquidity injection request of UGX ${parseInt(injectionAmount).toLocaleString()} submitted to BOU`, 'success')
    setInjectionAmount('')
    setShowModal(false)
  }

  const intradayData = (liq?.intraday ?? []).map((d) => ({
    name: d.hour,
    Liquidity: Math.round(d.value / 1_000_000),
  }))

  const utilPct = liq?.utilizationPct ?? 0
  const isLow   = utilPct > 80 || (liq?.available ?? Infinity) < (liq?.threshold ?? 0) * 1.2

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-start justify-between">
        <PageHeader title="Liquidity Position" subtitle={`${tenantName} — real-time liquidity monitoring`} icon={Gauge} />
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all" style={{ background: accentColor }}>
          <PlusCircle size={15} /> Request Injection
        </button>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Balance', value: liq ? formatUGX(liq.available) : '—', ok: !isLow },
          { label: 'Reserved Funds',   value: liq ? formatUGX(liq.reserved) : '—', ok: true },
          { label: 'Minimum Threshold', value: liq ? formatUGX(liq.threshold) : '—', ok: true },
          { label: 'Injection Pending', value: liq ? (liq.injectionPending > 0 ? formatUGX(liq.injectionPending) : 'None') : '—', ok: liq?.injectionPending === 0 },
        ].map(({ label, value, ok }) => (
          <div key={label} className={`bg-card rounded-card shadow-card p-5 border-l-4 ${ok ? 'border-green-400' : 'border-red-400'}`}>
            <div className="text-xs text-muted mb-1">{label}</div>
            <div className="text-xl font-bold text-slate-800">{isLoading ? '—' : value}</div>
          </div>
        ))}
      </motion.div>

      {/* Utilisation bar */}
      {liq && (
        <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Utilisation</h3>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
              {isLow && <AlertTriangle size={13} />}
              {utilPct}% utilised
            </div>
          </div>
          <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{ background: utilPct > 85 ? '#ef4444' : utilPct > 70 ? '#f59e0b' : accentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(utilPct, 100)}%` }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            >
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white">{utilPct}%</span>
            </motion.div>
          </div>
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>Threshold: {formatUGX(liq.threshold)}</span>
            <span>Last updated: {liq.lastUpdated}</span>
          </div>
        </motion.div>
      )}

      {/* Intraday chart */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Intraday Liquidity Trend (UGX M)</h3>
        <AreaChart data={intradayData} xKey="name" lines={[{ key: 'Liquidity', color: accentColor }]} height={240} />
      </motion.div>

      {/* Injection modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Request Liquidity Injection</h3>
            <p className="text-sm text-muted mb-4">Submit a liquidity injection request to the Bank of Uganda. This will be processed during the next settlement window.</p>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Injection Amount (UGX)</label>
              <input type="number" value={injectionAmount} onChange={(e) => setInjectionAmount(e.target.value)} placeholder="e.g. 5000000000" className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
              <button onClick={requestInjection} disabled={!injectionAmount} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-colors" style={{ background: accentColor }}>Submit Request</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add "src/routes/app/bank/\$bankId/rtgs-queue.tsx" "src/routes/app/bank/\$bankId/settlement.tsx" "src/routes/app/bank/\$bankId/liquidity.tsx"
git commit -m "feat(bank-portal): add RTGS queue, settlement status, and liquidity pages"
```

---

## Task 15: Bank Support Pages

**Files:**
- Create: `src/routes/app/bank/$bankId/exceptions.tsx`
- Create: `src/routes/app/bank/$bankId/treasury-transfers.tsx`
- Create: `src/routes/app/bank/$bankId/reconciliation.tsx`
- Create: `src/routes/app/bank/$bankId/reports.tsx`

- [ ] **Step 1: Create `src/routes/app/bank/$bankId/exceptions.tsx`**

```typescript
import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Search, UserCheck, ArrowUpCircle } from 'lucide-react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { usePortalExceptions } from '../../../../hooks/portal/usePortalQueue'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import { useAppStore } from '../../../../store/appStore'

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  high:     'bg-orange-100 text-orange-700 border border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
}
const STATUS_STYLE: Record<string, string> = {
  open:         'bg-red-100 text-red-700',
  investigating:'bg-blue-100 text-blue-700',
  resolved:     'bg-green-100 text-green-700',
  escalated:    'bg-purple-100 text-purple-700',
}

export default function BankExceptionsPage() {
  const { tenantName } = usePortalConfig()
  const { data = [], isLoading } = usePortalExceptions()
  const addToast = useAppStore((s) => s.addToast)
  const [statusFilter, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = data
    .filter((e) => statusFilter === 'all' || e.status === statusFilter)
    .filter((e) => !search || e.instructionRef.toLowerCase().includes(search.toLowerCase()) || e.counterparty.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Exceptions" subtitle={`${tenantName} — failed and escalated instructions`} icon={AlertTriangle} />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open', value: data.filter((e) => e.status === 'open').length, color: 'red' },
          { label: 'Investigating', value: data.filter((e) => e.status === 'investigating').length, color: 'blue' },
          { label: 'Escalated', value: data.filter((e) => e.status === 'escalated').length, color: 'purple' },
          { label: 'Resolved', value: data.filter((e) => e.status === 'resolved').length, color: 'green' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4">
            <div className="text-xs text-muted mb-1">{label}</div>
            <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference or counterparty..." className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-surface">
          {['all', 'open', 'investigating', 'escalated', 'resolved'].map((s) => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
        </select>
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Instruction Ref', 'Amount', 'Counterparty', 'Type', 'Reason', 'Severity', 'Status', 'Raised', 'SLA Due', 'Assigned', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-muted font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={11} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td></tr>)
                : filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{e.instructionRef}</td>
                    <td className="px-4 py-3 font-semibold">{formatUGX(e.amount)}</td>
                    <td className="px-4 py-3">{e.counterparty}</td>
                    <td className="px-4 py-3 text-muted text-[10px]">{e.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-muted max-w-32 truncate">{e.reason}</td>
                    <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${SEVERITY_STYLE[e.severity]}`}>{e.severity}</span></td>
                    <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLE[e.status]}`}>{e.status}</span></td>
                    <td className="px-4 py-3 text-muted text-[10px]">{e.raisedAt.slice(11)}</td>
                    <td className="px-4 py-3 text-muted text-[10px]">{e.slaDue.slice(11)}</td>
                    <td className="px-4 py-3 text-muted">{e.assignedTo ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {e.status === 'open' && (
                          <button onClick={() => addToast(`Exception ${e.id} assigned`, 'success')} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Assign"><UserCheck size={12} /></button>
                        )}
                        {(e.status === 'open' || e.status === 'investigating') && (
                          <button onClick={() => addToast(`Exception ${e.id} escalated`, 'warning')} className="p-1 hover:bg-purple-100 rounded text-purple-600" title="Escalate"><ArrowUpCircle size={12} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/routes/app/bank/$bankId/treasury-transfers.tsx`**

```typescript
import { motion } from 'framer-motion'
import { Vault } from 'lucide-react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { formatUGX } from '../../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'

// Mock treasury transfer data — in real app would come from tenantService
function useTreasuryTransfers(tenantId: string) {
  const transfers = Array.from({ length: 12 }, (_, i) => ({
    id: `TT-${tenantId.toUpperCase()}-${String(i).padStart(3, '0')}`,
    reference: `RTGS-TRS-${tenantId.slice(0, 3).toUpperCase()}${i}`,
    amount: (i + 1) * 500_000_000 + Math.floor(Math.random() * 200_000_000),
    direction: i % 3 === 0 ? 'from_treasury' : 'to_treasury',
    description: i % 3 === 0 ? 'Government disbursement' : i % 5 === 0 ? 'Tax remittance' : 'Salary payment via RTGS',
    status: ['completed', 'completed', 'completed', 'pending', 'processing'][i % 5] as string,
    initiatedBy: 'Ministry of Finance',
    timestamp: `2026-06-0${(i % 3) + 1} ${String(8 + i).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    settlementRef: `BATCH-${i + 100}`,
  }))
  return { data: transfers, isLoading: false }
}

const STATUS_STYLE: Record<string, string> = {
  completed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
}

export default function BankTreasuryTransfersPage() {
  const { tenantName, tenantId, accentColor } = usePortalConfig()
  const { data = [] } = useTreasuryTransfers(tenantId)

  const totalIn  = data.filter((t) => t.direction === 'from_treasury' && t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const totalOut = data.filter((t) => t.direction === 'to_treasury'   && t.status === 'completed').reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Treasury Transfers" subtitle={`${tenantName} — RTGS transfers via Treasury`} icon={Vault} />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-card shadow-card p-5 border-l-4 border-green-400">
          <div className="text-xs text-muted mb-1">Received from Treasury</div>
          <div className="text-xl font-bold text-green-700">{formatUGX(totalIn)}</div>
        </div>
        <div className="bg-card rounded-card shadow-card p-5 border-l-4 border-orange-400">
          <div className="text-xs text-muted mb-1">Remitted to Treasury</div>
          <div className="text-xl font-bold text-orange-600">{formatUGX(totalOut)}</div>
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <div className="text-xs text-muted mb-1">Net Position</div>
          <div className={`text-xl font-bold ${totalIn - totalOut >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatUGX(Math.abs(totalIn - totalOut))}</div>
        </div>
      </motion.div>

      {/* Timeline of transfers */}
      <motion.div variants={fadeInUp} className="space-y-3">
        {data.map((t) => (
          <div key={t.id} className="bg-card rounded-card shadow-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accentColor + '22' }}>
              <Vault size={18} style={{ color: accentColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{t.description}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLE[t.status] ?? 'bg-slate-100 text-slate-600'}`}>{t.status}</span>
              </div>
              <div className="text-xs text-muted mt-0.5">
                Ref: {t.reference} · Batch: {t.settlementRef} · {t.initiatedBy} · {t.timestamp}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-sm font-bold ${t.direction === 'from_treasury' ? 'text-green-700' : 'text-orange-600'}`}>
                {t.direction === 'from_treasury' ? '+' : '−'}{formatUGX(t.amount)}
              </div>
              <div className="text-[10px] text-muted">{t.direction === 'from_treasury' ? 'From Treasury' : 'To Treasury'}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Create `src/routes/app/bank/$bankId/reconciliation.tsx`**

```typescript
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { usePortalSettlements } from '../../../../hooks/portal/usePortalSettlements'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import { formatUGX } from '../../../../utils/format'
import { useAppStore } from '../../../../store/appStore'

export default function BankReconciliationPage() {
  const { tenantName, accentColor } = usePortalConfig()
  const { data = [], isLoading } = usePortalSettlements()
  const addToast = useAppStore((s) => s.addToast)

  const matched   = data.filter((s) => s.status === 'completed').length
  const unmatched = data.filter((s) => s.status === 'failed').length
  const pending   = data.filter((s) => s.status === 'pending' || s.status === 'processing').length
  const matchRate = data.length > 0 ? Math.round((matched / data.length) * 100) : 100

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-start justify-between">
        <PageHeader title="Reconciliation" subtitle={`${tenantName} — settlement reconciliation status`} icon={RefreshCw} />
        <button onClick={() => addToast('Reconciliation run triggered', 'info')} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ background: accentColor }}>
          <RefreshCw size={14} /> Run Reconciliation
        </button>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Match Rate', value: `${matchRate}%`, sub: 'Completed batches', ok: matchRate > 95 },
          { label: 'Matched', value: matched.toString(), sub: 'Completed settlement', ok: true },
          { label: 'Unmatched', value: unmatched.toString(), sub: 'Require investigation', ok: unmatched === 0 },
          { label: 'Pending', value: pending.toString(), sub: 'Awaiting completion', ok: pending < 5 },
        ].map(({ label, value, sub, ok }) => (
          <div key={label} className={`bg-card rounded-card shadow-card p-5 border-l-4 ${ok ? 'border-green-400' : 'border-red-400'}`}>
            <div className="flex items-center gap-2 mb-1">
              {ok ? <CheckCircle size={13} className="text-green-500" /> : <AlertCircle size={13} className="text-red-500" />}
              <span className="text-xs text-muted">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{isLoading ? '—' : value}</div>
            <div className="text-[10px] text-muted">{sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Reconciliation table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Settlement Batches — Reconciliation View</h3>
          <span className="text-xs text-muted">Last run: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Batch ID', 'Date', 'Counterparty', 'Type', 'Gross', 'Net', 'GovPay Record', 'Bank Record', 'Variance', 'Recon Status'].map((h) => (
                  <th key={h} className="text-left text-muted font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={10} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td></tr>)
                : data.slice(0, 10).map((s) => {
                    const variance = Math.floor((Math.random() - 0.95) * s.netAmount * 0.01)
                    const reconStatus = s.status === 'completed' && variance === 0 ? 'matched' : s.status === 'failed' ? 'exception' : 'pending'
                    return (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px]">{s.id}</td>
                        <td className="px-4 py-3 text-muted">{s.batchDate}</td>
                        <td className="px-4 py-3">{s.counterparty}</td>
                        <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.type === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s.type}</span></td>
                        <td className="px-4 py-3">{formatUGX(s.grossAmount)}</td>
                        <td className="px-4 py-3 font-semibold">{formatUGX(s.netAmount)}</td>
                        <td className="px-4 py-3 text-muted">{formatUGX(s.netAmount)}</td>
                        <td className="px-4 py-3 text-muted">{formatUGX(s.netAmount + variance)}</td>
                        <td className="px-4 py-3"><span className={variance !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>{variance === 0 ? 'Zero' : formatUGX(Math.abs(variance))}</span></td>
                        <td className="px-4 py-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${reconStatus === 'matched' ? 'bg-green-100 text-green-700' : reconStatus === 'exception' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{reconStatus}</span></td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Create `src/routes/app/bank/$bankId/reports.tsx`**

```typescript
import { motion } from 'framer-motion'
import { BarChart3, Download, Calendar } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../../contexts/portalConfig'
import { fadeInUp, staggerContainer } from '../../../../utils/animations'
import { useAppStore } from '../../../../store/appStore'

const REPORT_TYPES = [
  { id: 'daily-settlement',   label: 'Daily Settlement Report',       description: 'Settlement batch summary for the selected date', icon: '📋' },
  { id: 'liquidity-history',  label: 'Liquidity History Report',       description: 'Intraday and daily liquidity position history', icon: '💧' },
  { id: 'transaction-summary',label: 'Transaction Summary',            description: 'Volume and value summary by channel and status', icon: '📊' },
  { id: 'rtgs-queue-history', label: 'RTGS Queue History',             description: 'All RTGS instructions with timing and SLA data', icon: '⚡' },
  { id: 'exception-report',   label: 'Exception & Incident Report',    description: 'All exceptions with resolution status', icon: '⚠️' },
  { id: 'reconciliation',     label: 'Reconciliation Report',          description: 'Match rate and variance analysis', icon: '🔄' },
  { id: 'treasury-transfers', label: 'Treasury Transfers Report',      description: 'All treasury RTGS transfers in/out', icon: '🏛' },
  { id: 'sla-compliance',     label: 'SLA Compliance Report',          description: 'SLA adherence across settlement windows', icon: '✅' },
]

export default function BankReportsPage() {
  const { tenantName, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [selected, setSelected] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('2026-06-01')
  const [dateTo, setDateTo]     = useState('2026-06-02')

  function generateReport() {
    if (!selected) return
    const report = REPORT_TYPES.find((r) => r.id === selected)
    addToast(`Generating ${report?.label} for ${tenantName}...`, 'info')
    setTimeout(() => addToast(`${report?.label} ready. Download started.`, 'success'), 1500)
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Reports" subtitle={`${tenantName} — generate and download operational reports`} icon={BarChart3} />
      </motion.div>

      {/* Date range */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5 flex flex-wrap items-center gap-4">
        <Calendar size={16} className="text-muted" />
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted block mb-1">FROM</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none" />
          </div>
          <span className="text-muted text-sm">—</span>
          <div>
            <label className="text-[10px] font-semibold text-muted block mb-1">TO</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none" />
          </div>
        </div>
        <button onClick={generateReport} disabled={!selected} className="ml-auto flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl text-white disabled:opacity-40 transition-all" style={{ background: accentColor }}>
          <Download size={15} /> Generate Report
        </button>
      </motion.div>

      {/* Report type grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selected === r.id ? 'bg-surface' : 'bg-card hover:bg-surface/50'}`}
            style={selected === r.id ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}44` } : { borderColor: '#e2e8f0' }}
          >
            <div className="text-2xl mb-3">{r.icon}</div>
            <div className="font-semibold text-sm text-slate-800 mb-1">{r.label}</div>
            <div className="text-xs text-muted">{r.description}</div>
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add "src/routes/app/bank/\$bankId/exceptions.tsx" "src/routes/app/bank/\$bankId/treasury-transfers.tsx" "src/routes/app/bank/\$bankId/reconciliation.tsx" "src/routes/app/bank/\$bankId/reports.tsx"
git commit -m "feat(bank-portal): add exceptions, treasury transfers, reconciliation, and reports pages"
```

---

## Task 16: PortalSwitcher Modal

**Files:**
- Create: `src/components/layout/PortalSwitcher.tsx`

- [ ] **Step 1: Create `src/components/layout/PortalSwitcher.tsx`**

```typescript
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { X, CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { ALL_PORTAL_ENTRIES } from '../../data/mockPortalConfigs'
import { usePortalConfig } from '../../contexts/portalConfig'

const PORTAL_TYPE_ICON: Record<string, string> = {
  national: '🏛', bank: '🏦', rtgs: '⚡', treasury: '🏛', agency: '📋', mobile: '📱',
}

const PORTAL_TYPE_LABEL: Record<string, string> = {
  national: 'NATIONAL', bank: 'BANK', rtgs: 'RTGS',
  treasury: 'TREASURY', agency: 'AGENCY', mobile: 'MOBILE',
}

interface PortalSwitcherProps {
  open: boolean
  onClose: () => void
}

export function PortalSwitcher({ open, onClose }: PortalSwitcherProps) {
  const navigate    = useNavigate()
  const setPortal   = useAppStore((s) => s.setPortal)
  const addToast    = useAppStore((s) => s.addToast)
  const currentConfig = usePortalConfig()

  function switchTo(config: typeof ALL_PORTAL_ENTRIES[number]['config'], label: string) {
    if (config.tenantId === currentConfig.tenantId) { onClose(); return }
    // Find a suitable role for the target portal
    const role = config.allowedRoles[0] ?? 'Super Admin'
    setPortal(config.portalType, config.tenantId, role)
    addToast(`Switched to ${label}`, 'success')
    onClose()
    navigate({ to: config.homeRoute as any })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-4 top-16 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-slate-800">Switch Portal</span>
                <span className="text-xs text-muted">— Demo Mode</span>
              </div>
              <button onClick={onClose} className="text-muted hover:text-slate-700 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Portal list */}
            <div className="py-2 max-h-[70vh] overflow-y-auto">
              {ALL_PORTAL_ENTRIES.map(({ config, label, comingSoon }) => {
                const isActive = config.tenantId === currentConfig.tenantId
                return (
                  <button
                    key={config.tenantId}
                    onClick={() => !comingSoon && switchTo(config, label)}
                    disabled={comingSoon}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors
                      ${isActive ? 'bg-surface' : comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface'}`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: config.accentColor + '22' }}
                    >
                      {PORTAL_TYPE_ICON[config.portalType] ?? '🏛'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{label}</div>
                      <div className="text-[10px] text-muted">{config.allowedRoles[0] ?? ''}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {comingSoon && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">SOON</span>}
                      {!comingSoon && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: config.accentColor + '22', color: config.accentColor }}
                        >
                          {PORTAL_TYPE_LABEL[config.portalType]}
                        </span>
                      )}
                      {isActive && <CheckCircle size={13} className="text-green-500" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="px-4 py-2 border-t border-border">
              <p className="text-[9px] text-muted text-center">Switching portal navigates instantly · no re-login required</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/PortalSwitcher.tsx
git commit -m "feat(portal-switcher): add demo-mode Switch Portal modal with animated transition"
```

---

## Task 17: Topbar Integration

**Files:**
- Modify: `src/components/layout/Topbar.tsx`

Add the "Switch Portal" button and make the breadcrumb portal-aware. The Topbar now receives an optional `portalConfig` prop from `PortalShell`.

- [ ] **Step 1: Update `src/components/layout/Topbar.tsx`**

Replace the entire Topbar file with:

```typescript
import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { Search, Bell, ShieldCheck, Lock, LogOut, ArrowLeftRight } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { CommandPalette } from './CommandPalette'
import { NotificationPanel } from './NotificationPanel'
import { PortalSwitcher } from './PortalSwitcher'
import type { PortalConfig } from '../../types'

interface TopbarProps {
  portalConfig?: PortalConfig
}

export function Topbar({ portalConfig }: TopbarProps = {}) {
  const [cmdOpen, setCmdOpen]         = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [secOpen, setSecOpen]         = useState(false)
  const [switchOpen, setSwitchOpen]   = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const role              = useAppStore((s) => s.activeRole)
  const mfaVerified       = useAppStore((s) => s.mfaVerified)
  const sessionInfo       = useAppStore((s) => s.sessionInfo)
  const notificationsRead = useAppStore((s) => s.notificationsRead)
  const liveTransactions  = useAppStore((s) => s.liveTransactions)
  const logout            = useAppStore((s) => s.logout)

  // Derive page title from portal config navSections or fallback
  function getPageTitle() {
    if (!portalConfig) return 'GovPay Switch'
    for (const section of portalConfig.navSections) {
      for (const item of section.items) {
        if (pathname === item.path || pathname.startsWith(item.path + '/')) {
          return item.label
        }
      }
    }
    return portalConfig.tenantName
  }

  const pageTitle  = getPageTitle()
  const sessionAge = sessionInfo ? Math.floor((Date.now() - sessionInfo.loginAt) / 60000) : 0

  function handleLogout() {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-2 text-sm">
          {portalConfig && (
            <>
              <span className="text-muted text-xs font-medium">{portalConfig.tenantShort}</span>
              <span className="text-muted">/</span>
            </>
          )}
          <span className="font-semibold text-slate-800">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch Portal button */}
          {portalConfig && (
            <button
              onClick={() => setSwitchOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-card transition-colors text-muted hover:text-slate-700"
            >
              <ArrowLeftRight size={12} />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>
          )}

          <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 text-sm text-muted bg-surface border border-border rounded-lg px-3 py-1.5 hover:border-primary/30 transition-colors">
            <Search size={14} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="text-xs bg-card border border-border rounded px-1 hidden sm:block">⌘K</kbd>
          </button>

          {/* Session security badge */}
          <div className="relative">
            <button
              onClick={() => setSecOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${mfaVerified ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'}`}
            >
              <ShieldCheck size={13} />
              <span className="hidden sm:inline">{mfaVerified ? 'MFA Verified' : 'No MFA'}</span>
              <Lock size={11} className="opacity-60" />
            </button>
            {secOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-xl shadow-xl z-50 p-4 text-xs" onMouseLeave={() => setSecOpen(false)}>
                <div className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><ShieldCheck size={14} className="text-green-600" />Session Security</div>
                <div className="space-y-2">
                  <Row label="MFA Status"   value={mfaVerified ? '✓ Verified (TOTP)' : '✗ Not verified'} ok={mfaVerified} />
                  <Row label="Encryption"   value={sessionInfo?.encryptionCipher ?? 'AES-256-GCM'} ok />
                  <Row label="Transport"    value={sessionInfo?.tlsVersion ?? 'TLS 1.3'} ok />
                  <Row label="Session ID"   value={sessionInfo ? sessionInfo.sessionId.slice(0, 16) + '…' : 'N/A'} ok={!!sessionInfo} mono />
                  <Row label="Session Age"  value={`${sessionAge} min`} ok={sessionAge < 480} />
                </div>
                <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted">Compliant with Uganda Data Protection and Privacy Act, 2019</div>
              </div>
            )}
          </div>

          <button onClick={() => setNotifOpen(true)} className="relative p-2 text-muted hover:text-slate-800 transition-colors" aria-label="Open notifications">
            <Bell size={18} />
            {!notificationsRead && liveTransactions.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center" style={portalConfig ? { background: portalConfig.accentColor + '22', borderColor: portalConfig.accentColor + '44' } : {}}>
              <span className="text-xs font-bold" style={portalConfig ? { color: portalConfig.accentColor } : { color: 'var(--color-primary)' }}>{role ? role[0] : 'G'}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">{role ?? 'Guest'}</span>
            <button onClick={handleLogout} className="p-1.5 text-muted hover:text-danger transition-colors rounded" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      {portalConfig && <PortalSwitcher open={switchOpen} onClose={() => setSwitchOpen(false)} />}
    </>
  )
}

function Row({ label, value, ok, mono }: { label: string; value: string; ok?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${ok ? 'text-green-700' : 'text-red-600'} ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Verify the PortalSwitcher renders**

Run `npm run dev`, log in as Stanbic Operator, navigate to `/app/bank/stanbic/dashboard`. Verify "Switch Portal" button appears in the Topbar and opens the modal when clicked.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Topbar.tsx
git commit -m "feat(topbar): add Switch Portal button, portal-aware breadcrumb, portal-tinted avatar"
```

---

## Task 18: Final Wiring & Verification

**Files:**
- Verify: `src/router.tsx`
- Optional cleanup: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: Verify all routes are wired**

```bash
npm run dev
```

Test the following login flows:
1. Login as **Uganda GovPay → Super Admin** → should land at `/app/national/dashboard` with blue accent
2. Login as **Stanbic Bank → Bank RTGS Operator** → should land at `/app/bank/stanbic/dashboard` with emerald accent
3. Login as **RTGS Command Center → RTGS Super Admin** → should land at `/app/rtgs` with amber accent
4. Navigate directly to `/app` → should redirect to `/app/national/dashboard`

- [ ] **Step 2: Verify tenant isolation**

Log in as **Centenary Bank → Bank RTGS Operator**. Navigate to `/app/bank/centenary/dashboard`. Confirm:
- Dashboard shows Centenary data only (check transaction counterparties — none should say "Stanbic")
- Liquidity shows Centenary's numbers, not Stanbic's
- The query keys in React DevTools should show `['bank-txns', 'centenary']` not `['bank-txns', 'stanbic']`

Then use Switch Portal to jump to Stanbic. Confirm data changes.

- [ ] **Step 3: Delete old AppShell (optional)**

```bash
# Only run this after confirming all portals work
git rm src/components/layout/AppShell.tsx
```

Update the import in `src/main.tsx` if it references `AppShell` directly (unlikely — it imports from `router.tsx`).

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any remaining type errors.

- [ ] **Step 5: Final build check**

```bash
npm run build
```

Expected: build completes without errors. Bundle size will increase due to new pages — that's expected.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat(phase-1): complete multi-portal foundation — login overhaul, PortalShell, bank portals (10 pages × 7 banks), tenant isolation, Switch Portal modal"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| Three-step login (org → role → MFA) | Task 11 |
| Config-driven PortalShell | Task 9 |
| National portal migration to `/app/national/*` | Task 10 |
| Bank portal pages (10 pages) | Tasks 12–15 |
| 7 banks (stanbic, centenary, dfcu, equity, absa, hfb, boa) | Tasks 2, 4 |
| tenantService.ts | Task 5 |
| Switch Portal modal | Task 16 |
| Portal accent CSS vars | Task 9 |
| appStore: activePortal, activeTenant, setPortal | Task 7 |
| PortalConfigContext + usePortalConfig | Task 6 |
| TanStack Query portal hooks | Task 6 |
| Sidebar accepts navSections prop | Task 8 |
| Topbar: portal-aware breadcrumb + Switch Portal button | Task 17 |
| RTGS wrapped in PortalShell | Task 10 (rtgsShellRoute) |
| Mock bank data (transactions, liquidity, settlements, queue, exceptions) | Task 2 |
| Existing mocks seeded with tenantId: 'national' | Task 3 |
| Portal configs for all portals | Task 4 |
| Redirect /app → /app/national/dashboard | Task 10 |
| vite build passes | Task 18 |

**Type consistency check:** `PortalConfig` is defined in Task 1 and used in Tasks 4, 6, 7, 9, 11, 16, 17 — all referencing the same interface. `getBankPortalConfig` in Task 4 returns `PortalConfig`. `BANK_CONFIGS[bankId]` in `router.tsx` also returns `PortalConfig`. Consistent.

**Placeholder scan:** No TBD, TODO, or incomplete code blocks found. All steps have runnable code.
