# GovPay Phase 1 — Multi-Portal Foundation Design

**Date:** 2026-06-02  
**Status:** Approved  
**Scope:** Phase 1 of a 6-phase multi-portal ecosystem expansion  
**Platform:** Demo-only — no real banking integrations

---

## Overview

Transform the existing Uganda GovPay Switch (single-portal, 14 flat roles, 24 pages) into a multi-portal, multi-tenant national payment ecosystem. Phase 1 delivers the foundation that all subsequent portal phases (bank, treasury, agency, mobile money) will build on.

**What Phase 1 delivers:**
1. Overhauled three-step login (organisation → role → MFA)
2. Config-driven `PortalShell` component — one shell serving all portal types
3. Migration of existing national + RTGS pages to `/app/national/*`
4. Full bank portal implementation (10 pages, 7 banks)
5. `tenantService.ts` — mock data isolation per institution
6. Switch Portal modal for demo-mode instant portal switching
7. Portal accent colour system (CSS custom properties)

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Login flow | Two-step: Org → Role → MFA | Feels like real institutional SSO; separates institution from role cleanly |
| Portal visual identity | Accent colour per portal type, shared dark layout | One design system; distinct colours make portals instantly recognisable in demos |
| Existing route migration | Migrate `/app/*` → `/app/national/*` | Clean architecture; no coexisting URL systems |
| Shell architecture | Config-driven single `PortalShell` | One shell to maintain; adding a new bank = one config object |

---

## Architecture

### Route Tree

```
/ (root)
├── /login                          ← overhauled (org → role → MFA)
│
├── /app/national/*                 ← migrated from /app/*
│   ├── /dashboard
│   ├── /collections, /routing, /participants
│   ├── /settlement, /reconciliation
│   ├── /compliance, /disputes
│   ├── /api-platform, /operations
│   ├── /reports, /admin, /architecture
│   └── (sidebar links to /app/rtgs/* as cross-portal shortcut)
│
├── /app/bank/:bankId/*             ← new (Phase 1)
│   ├── /dashboard
│   ├── /incoming, /outgoing
│   ├── /rtgs-queue, /settlement
│   ├── /liquidity, /exceptions
│   ├── /treasury-transfers
│   ├── /reconciliation, /reports
│   └── /notifications, /settings
│
├── /app/rtgs/*                     ← preserved as-is (its own portal)
├── /app/treasury/*                 ← new (Phase 3)
├── /app/agency/:agencyId/*         ← new (Phase 4)
└── /app/mobile/:operatorId/*       ← new (Phase 5)
```

**Redirects:**
- `/` → `/login`
- `/app` → `/app/national/dashboard` (for existing bookmarks)

### PortalConfig Interface

```typescript
interface PortalConfig {
  portalType: 'national' | 'bank' | 'rtgs' | 'treasury' | 'agency' | 'mobile'
  tenantId: string        // 'stanbic', 'centenary', 'ura', 'national', 'mtn'
  tenantName: string      // 'Stanbic Bank Uganda'
  tenantShort: string     // 'Stanbic'
  accentColor: string     // '#22c55e'
  accentLight: string     // '#dcfce7'
  accentDark: string      // '#14532d'
  homeRoute: string       // '/app/bank/stanbic/dashboard'
  navSections: NavSection[]
  allowedRoles: Role[]
}
```

### Portal Colour Map

| Portal Type | Accent | Hex |
|---|---|---|
| National | Blue | `#3b82f6` |
| Bank | Emerald | `#22c55e` |
| RTGS | Amber | `#f59e0b` |
| Treasury | Violet | `#a855f7` |
| Agency | Orange | `#f97316` |
| Mobile Money | Cyan | `#06b6d4` |

Colours are applied via a CSS custom property `--portal-accent` set on the `<html>` element when `PortalShell` mounts. All accent usages in components reference `var(--portal-accent)` rather than hardcoded colour values.

### PortalShell Component

```typescript
// src/components/layout/PortalShell.tsx
interface PortalShellProps {
  config: PortalConfig
}

export function PortalShell({ config }: PortalShellProps) {
  // Sets CSS vars on mount: --portal-accent, --portal-accent-light, --portal-accent-dark
  // Provides PortalConfigContext with config
  // Renders: Sidebar (nav from config.navSections) + Topbar + <Outlet />
}
```

The existing `AppShell` is replaced by `PortalShell`. The existing `Sidebar` is refactored to accept `navSections` as props (from config) rather than hardcoded `NAV_SECTIONS`.

### PortalConfigContext

```typescript
// src/contexts/portalConfig.tsx
const PortalConfigContext = createContext<PortalConfig | null>(null)

export function usePortalConfig(): PortalConfig {
  const ctx = useContext(PortalConfigContext)
  if (!ctx) throw new Error('usePortalConfig must be used inside PortalShell')
  return ctx
}
```

---

## Login Flow

### Step 1 — Organisation Picker

Displays all supported institutions grouped visually by portal type:

**National:**
- Uganda GovPay (National Payment Infrastructure)

**Banks (7):**
- Stanbic Bank Uganda
- Centenary Bank
- DFCU Bank
- Equity Bank Uganda
- Absa Uganda
- Housing Finance Bank
- Bank of Africa Uganda

**RTGS:**
- RTGS Command Center (Bank of Uganda)

**Treasury:**
- Ministry of Finance (Treasury Portal)

**Agencies (7):**
- Uganda Revenue Authority
- Ministry of Lands
- Uganda Police
- Immigration Department
- NIRA
- URSB
- Kampala Capital City Authority

**Mobile Money (2):**
- MTN Mobile Money
- Airtel Money

Each institution card shows: icon, institution name, portal type badge (colour-coded), and a short description.

### Step 2 — Role Picker (scoped to institution)

Roles shown are scoped to the chosen institution. Examples:

| Institution | Available Roles |
|---|---|
| Stanbic Bank | Bank RTGS Operator, Liquidity Manager, Bank Auditor |
| Uganda Revenue Authority | Agency Officer, Agency Auditor, Collections Manager |
| Ministry of Finance | Treasury Officer, Treasury Approver, Treasury Auditor |
| RTGS Command Center | Central Bank Settlement Operator, Liquidity Manager, RTGS Auditor, RTGS Super Admin |
| Uganda GovPay | Super Admin, Bank of Uganda Operator, Compliance Officer, Settlement Officer, Support Officer, Developer |

### Step 3 — MFA

Unchanged from current implementation. Demo OTP shown inline. On success:
- `localStorage` stores: `govpay_portal`, `govpay_tenant`, `govpay_role`
- Router redirects to `config.homeRoute` for the selected institution
- `PortalShell` mounts with the appropriate config

---

## Tenant Service

### File: `src/services/tenantService.ts`

All mock data records include a `tenantId: string` field. `tenantService` exposes typed getter functions that filter by active tenant:

```typescript
export const tenantService = {
  getTransactions: (tenantId: string): Transaction[] =>
    tenantId === 'national'
      ? mockTransactions
      : mockTransactions.filter(t => t.tenantId === tenantId),

  getLiquidity: (tenantId: string): LiquidityPosition =>
    mockLiquidityByTenant[tenantId] ?? mockLiquidityByTenant['stanbic'],

  getSettlements: (tenantId: string): SettlementBatch[] =>
    tenantId === 'national'
      ? mockSettlements
      : mockSettlements.filter(s => s.tenantId === tenantId),

  // ... getExceptions, getQueue, getRtgsInstructions etc.
}
```

### TanStack Query Hooks

Portal pages use hooks that automatically scope to the active tenant:

```typescript
// src/hooks/portal/usePortalTransactions.ts
export function usePortalTransactions() {
  const { tenantId } = usePortalConfig()
  return useQuery({
    queryKey: ['transactions', tenantId],
    queryFn: () => tenantService.getTransactions(tenantId),
  })
}
```

Switching portals changes `tenantId`, which changes the query key, which triggers automatic refetch. No manual cache invalidation needed.

---

## Switch Portal Modal

### Trigger

A persistent `⇄ Switch Portal` button in the Topbar, visible in all portals. Designed for demo presentations.

### Behaviour

1. Opens a modal listing all configured portals with their type badge and active tenant role
2. The currently active portal is highlighted
3. Clicking a portal:
   - Updates `localStorage` (`govpay_portal`, `govpay_tenant`, `govpay_role`)
   - Updates `appStore` (`activePortal`, `activeTenant`, `activeRole`)
   - Navigates to the selected portal's `homeRoute`
   - Framer Motion cross-fade transition between portals
4. No re-authentication required in demo mode

### Portal entries in the modal (Phase 1)

| Label | Tenant | Type Badge |
|---|---|---|
| National GovPay Command Center | national | NATIONAL |
| Stanbic Bank Portal | stanbic | BANK |
| Centenary Bank Portal | centenary | BANK |
| DFCU Bank Portal | dfcu | BANK |
| Equity Bank Portal | equity | BANK |
| Absa Uganda Portal | absa | BANK |
| Housing Finance Portal | hfb | BANK |
| Bank of Africa Portal | boa | BANK |
| RTGS Command Center | rtgs | RTGS |

Treasury, agency, and mobile entries are shown but marked "Coming Soon" in Phase 1.

---

## appStore Changes

Add to existing Zustand store:

```typescript
// New fields on AppState
activePortal: PortalType | null
activeTenant: string | null  // 'stanbic', 'ura', 'national'
setPortal: (portalType: PortalType, tenantId: string, role: Role) => void
```

`setRole` is replaced/extended by `setPortal` which sets all three fields atomically.

localStorage keys:
- `govpay_portal` — portal type string
- `govpay_tenant` — tenant ID string
- `govpay_role` — role string (existing)
- `govpay_mfa` — existing
- `govpay_session` — existing

---

## types/index.ts Changes

### New types

```typescript
export type PortalType =
  | 'national' | 'bank' | 'rtgs' | 'treasury' | 'agency' | 'mobile'

// Extend existing Role type — keep all 14 existing roles, add only:
export type Role =
  // ... existing 14 roles preserved unchanged ...
  // New roles for portal-scoped access:
  | 'Bank Auditor'           // bank portal read-only
  | 'Collections Manager'    // agency portal
  | 'Agency Auditor'         // agency portal read-only
  | 'Treasury Approver'      // treasury portal approvals
  | 'Treasury Auditor'       // treasury portal read-only
  | 'Mobile Operator'        // mobile money portal
  | 'Mobile Auditor'         // mobile money read-only
  // Note: 'Liquidity Manager', 'Agency Officer', 'Bank RTGS Operator' already exist
```

---

## Bank Portal — Pages (Phase 1)

All 7 banks share the same 10 page templates. Pages receive tenant-scoped data via `usePortalConfig()` + tenant hooks.

| Route | Page | Description |
|---|---|---|
| `/app/bank/:bankId/dashboard` | Bank Dashboard | KPI cards, hourly volume chart, settlement trend, live queue |
| `/app/bank/:bankId/incoming` | Incoming Transactions | Filtered inbound transaction table |
| `/app/bank/:bankId/outgoing` | Outgoing Transactions | Filtered outbound transaction table |
| `/app/bank/:bankId/rtgs-queue` | RTGS Queue | Bank's pending/active RTGS instructions |
| `/app/bank/:bankId/settlement` | Settlement Status | Settlement batches for this bank |
| `/app/bank/:bankId/liquidity` | Liquidity Position | Bank's liquidity, threshold alerts, injection request |
| `/app/bank/:bankId/exceptions` | Exceptions | Failed/rejected instructions with actions |
| `/app/bank/:bankId/treasury-transfers` | Treasury Transfers | Treasury-to-bank RTGS transfer history |
| `/app/bank/:bankId/reconciliation` | Reconciliation | Bank-scoped reconciliation view |
| `/app/bank/:bankId/reports` | Reports | Downloadable reports scoped to this bank |

### Bank Dashboard KPIs

- Transactions today (count + value)
- Incoming settlement value
- Outgoing settlement value
- Pending queue count
- Failed settlement instructions
- Liquidity available (% of threshold)
- Treasury payments today
- Settlement SLA compliance %
- Exception count

### Bank Dashboard Charts

- Hourly transaction volume (AreaChart)
- Settlement trend — last 7 days (LineChart)
- Liquidity utilisation — animated bar
- Incoming vs Outgoing value — BarChart

---

## Mock Data Requirements

### New mock data files

| File | Contents |
|---|---|
| `src/data/mockBanks.ts` | 7 bank definitions with tenantId, name, short name, accent colour |
| `src/data/mockBankTransactions.ts` | ~200 transactions tagged with tenantId per bank |
| `src/data/mockBankLiquidity.ts` | Liquidity position per bank |
| `src/data/mockBankSettlements.ts` | Settlement batches per bank |
| `src/data/mockBankQueue.ts` | RTGS queue entries per bank |
| `src/data/mockBankExceptions.ts` | Exceptions per bank |
| `src/data/mockPortalConfigs.ts` | All PortalConfig objects exported |

### Existing mock data

`mockTransactions.ts`, `mockSettlements.ts`, etc. will be updated to add `tenantId: string` to each record. Existing records get `tenantId: 'national'`.

---

## File Structure (new files in Phase 1)

```
src/
├── components/
│   └── layout/
│       ├── PortalShell.tsx          ← replaces AppShell
│       ├── PortalSwitcher.tsx       ← Switch Portal modal
│       └── Sidebar.tsx              ← refactored to accept navSections prop
├── contexts/
│   └── portalConfig.tsx             ← PortalConfigContext + usePortalConfig
├── hooks/
│   └── portal/
│       ├── usePortalTransactions.ts
│       ├── usePortalLiquidity.ts
│       ├── usePortalSettlements.ts
│       └── usePortalQueue.ts
├── services/
│   └── tenantService.ts             ← data filtering by tenantId
├── data/
│   ├── mockBanks.ts
│   ├── mockBankTransactions.ts
│   ├── mockBankLiquidity.ts
│   ├── mockBankSettlements.ts
│   ├── mockBankQueue.ts
│   ├── mockBankExceptions.ts
│   └── mockPortalConfigs.ts
├── routes/
│   ├── login.tsx                    ← overhauled (2-step)
│   ├── app/
│   │   ├── national/                ← migrated from app/
│   │   │   ├── dashboard.tsx
│   │   │   ├── collections.tsx
│   │   │   └── ... (all 14 existing pages)
│   │   └── bank/
│   │       └── $bankId/
│   │           ├── dashboard.tsx
│   │           ├── incoming.tsx
│   │           ├── outgoing.tsx
│   │           ├── rtgs-queue.tsx
│   │           ├── settlement.tsx
│   │           ├── liquidity.tsx
│   │           ├── exceptions.tsx
│   │           ├── treasury-transfers.tsx
│   │           ├── reconciliation.tsx
│   │           └── reports.tsx
├── store/
│   └── appStore.ts                  ← add activePortal, activeTenant, setPortal
├── types/
│   └── index.ts                     ← add PortalType, extend Role
└── router.tsx                       ← restructured route tree
```

---

## Out of Scope for Phase 1

- Treasury portal pages (Phase 3)
- Agency portal pages (Phase 4)
- Mobile money portal pages (Phase 5)
- Aggregator portal (Phase 6)
- Per-bank custom branding beyond accent colour
- Real backend integration (demo-only throughout)
- User management or permissions editing UI

---

## Success Criteria

Phase 1 is complete when:
1. Login shows org picker → role picker → MFA, and correctly redirects to the right portal
2. `/app/national/*` serves all existing 24 pages (migrated, not rewritten)
3. `/app/bank/stanbic/dashboard` (and all 6 other banks) loads with emerald accent, bank-scoped nav, and Stanbic-only data
4. Stanbic portal NEVER shows Centenary or DFCU data
5. Switch Portal modal opens from Topbar and transitions between any two portals
6. `vite build` completes without errors after migration; app loads in browser
