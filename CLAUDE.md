# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # TypeScript type-check + Vite production build
npm run lint         # ESLint (TypeScript + React Hooks + React Refresh)
npm run preview      # Preview production build locally
npx tsc --noEmit     # Type-check only, no output
```

No test framework is configured. UI validation requires running `npm run dev` and exercising the feature in a browser.

## What This Is

**Uganda GovPay Switch** — a full-depth *demo* frontend for a national PSP/PSO platform for the Government of Uganda. All transactions, settlements, and financial data are simulated. No real payment APIs are called.

The app is a single-page React app with multiple role-scoped portals for different institution types. Login creates a mock MFA session stored in `localStorage`.

## Architecture

### Portal Model

The app is structured around **portals** — scoped views for each institution type. Each portal has its own URL namespace, sidebar navigation, accent colour, and allowed roles. The portal types are:

| Type | URL Pattern | Config Source |
|------|-------------|---------------|
| National (GovPay Command Centre) | `/app/national/*` | `nationalPortalConfig` |
| RTGS Command Centre | `/app/rtgs/*` | `rtgsPortalConfig` |
| Bank (per bank) | `/app/bank/:bankId/*` | `BANK_CONFIGS[bankId]` |
| Treasury | `/app/treasury/*` | `treasuryPortalConfig` |
| Agency (per agency) | `/app/agency/:agencyId/*` | `AGENCY_CONFIGS[agencyId]` |
| Mobile MNO (per operator) | `/app/mobile/:operatorId/*` | `MOBILE_CONFIGS[operatorId]` |
| Payment Aggregator | `/app/aggregator/:aggregatorId/*` | `AGGREGATOR_CONFIGS[aggregatorId]` |

**Adding a new portal** means:
1. Add a `PortalConfig` entry in `src/data/mockPortalConfigs.ts`
2. Add page components under `src/routes/app/<type>/`
3. Register shell route + leaf routes in `src/router.tsx`
4. Add route entries to `ROUTE_ROLES` in `src/router.tsx`

### PortalShell

`src/components/layout/PortalShell.tsx` is the shared layout for all portals. It:
- Receives a `PortalConfig` and provides it via `PortalConfigContext`
- Writes `--portal-accent`, `--portal-accent-light`, `--portal-accent-dark` CSS variables to `document.documentElement` for per-portal accent theming
- Starts the live transaction feed via `useLiveUpdates()`
- Renders `<Sidebar>`, `<Topbar>`, and `<Outlet>` (the active page)

Use `usePortalConfig()` from `src/contexts/portalConfig.tsx` inside any page component to read the active portal's config.

### RBAC

RBAC is defined centrally in `src/router.tsx`:

- `ROUTE_ROLES` — maps every route path to the list of `Role`s that may access it. Parameterised paths use `:bankId` / `:agencyId` etc. as placeholders.
- `guardedRoute(path, Page)` — HOC that checks `localStorage.govpay_role` against `ROUTE_ROLES` at render time. Shows `<AccessDenied>` instead of the page when access is denied.
- The `appRoute.beforeLoad` guards require both `govpay_role` and `govpay_mfa === '1'` to be set before entering any `/app/*` route.

The `Role` union type in `src/types/index.ts` is the single source of truth for all valid roles.

### State Management

`src/store/appStore.ts` — single Zustand store covering:
- Auth state (`activeRole`, `mfaVerified`, `sessionInfo`)
- Portal/tenant selection (`activePortal`, `activeTenant`)
- Live transaction buffer (rolling 50-item array, populated every 4 s by `useLiveUpdates`)
- Toast queue
- Security event log (live audit, max 200 events in memory)
- Sidebar collapse state

`src/store/rtgsStore.ts` — separate Zustand store for RTGS-specific state.

Auth is persisted to `localStorage` with keys: `govpay_role`, `govpay_mfa`, `govpay_session`, `govpay_portal`, `govpay_tenant`. Zustand reads these on init and writes them on every auth action.

### Data Layer

All data lives in `src/data/mock*.ts` files — static arrays typed against the interfaces in `src/types/index.ts`. There is no API client; pages import mock data directly. Each portal family has its own mock data files (e.g. `mockBankTransactions.ts`, `mockAgencySettlements.ts`).

### Design System

Custom Tailwind tokens (defined in `tailwind.config.ts`):
- `primary` (#1B3A6B) — GovPay navy
- `accent` (#F4B000) — gold
- `danger` / `success` / `warning` — semantic colours
- `surface` / `card` / `border` / `muted` — layout tokens

Portal-specific accent theming uses CSS variables `var(--portal-accent)` etc., set by `PortalShell`. Use `text-[var(--portal-accent)]` / `bg-[var(--portal-accent)]` in portal pages to match the active institution's brand.

Shared UI primitives: `src/components/ui/` — `KPICard`, `DataTable`, `Modal`, `Drawer`, `Badge`, `Skeleton`, `PageHeader`, `Stepper`, `Timeline`, `ToastStack`.

### Routing

TanStack Router v1 with a code-first (non-file-based) route tree. The full route tree is assembled in `src/router.tsx`. Routes are registered once then exported as `router` for `RouterProvider` in `src/main.tsx`.
