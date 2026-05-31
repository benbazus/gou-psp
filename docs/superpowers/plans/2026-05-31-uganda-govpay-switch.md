# Uganda GovPay Switch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-depth, 13-module national payment platform demo UI for the Government of Uganda, using React + Vite + TypeScript with mock data only.

**Architecture:** Greenfield Vite + React 18 + TypeScript project. TanStack Router (declarative) for routing, TanStack Query for async mock data, Zustand for global UI state. Radix UI headless primitives styled with pure Tailwind CSS. Framer Motion for all animations. No backend — all data from local mock files and services.

**Tech Stack:** React 18, Vite, TypeScript, TanStack Router v1, TanStack Query v5, Zustand v4, Tailwind CSS v3, Framer Motion v11, Recharts v2, Radix UI, Lucide React

---

## Phase 1: Project Foundation (Tasks 1–7)

---

### Task 1: Scaffold project and initialize git

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`

- [ ] **Step 1: Initialize git and scaffold Vite project**

```bash
cd d:/Projects/GoU/PSP
git init
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **No, keep existing files** (or select "Ignore files and continue"). The `arch.txt` and `docs/` folder will be preserved.

- [ ] **Step 2: Verify scaffold**

```bash
ls src/
```

Expected output includes: `App.css  App.tsx  assets/  index.css  main.tsx  vite-env.d.ts`

- [ ] **Step 3: Update `.gitignore`**

Add to `.gitignore`:
```
node_modules
dist
.superpowers
*.local
```

- [ ] **Step 4: Delete boilerplate files we won't use**

```bash
rm src/App.css src/assets/react.svg
```

Replace `src/App.tsx` with:
```tsx
export default function App() {
  return <div>GovPay Switch</div>
}
```

Replace `src/index.css` with:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  font-family: 'Inter', sans-serif;
}
```

- [ ] **Step 5: Update `index.html` title**

In `index.html`, replace the `<title>` tag:
```html
<title>Uganda GovPay Switch</title>
```

- [ ] **Step 6: Initial commit**

```bash
git add .
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

Expected: commit succeeds, working tree clean.

---

### Task 2: Install all dependencies

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install production dependencies**

```bash
npm install \
  @tanstack/react-router \
  @tanstack/react-query \
  zustand \
  framer-motion \
  recharts \
  lucide-react \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-tooltip \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-popover \
  @radix-ui/react-scroll-area \
  @radix-ui/react-separator \
  clsx
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
```

- [ ] **Step 3: Initialize Tailwind**

```bash
npx tailwindcss init -p --ts
```

Expected: creates `tailwind.config.ts` and `postcss.config.js`.

- [ ] **Step 4: Verify `npm run dev` starts**

```bash
npm run dev
```

Expected: Vite prints local URL (e.g. `http://localhost:5173`). Open in browser — should show "GovPay Switch" text. Stop server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tailwind.config.ts postcss.config.js
git commit -m "chore: install all dependencies"
```

---

### Task 3: Configure Tailwind CSS with design tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B3A6B',
          light: '#2A5298',
          50: '#EEF2F9',
        },
        accent: {
          DEFAULT: '#F4B000',
          light: '#FDD835',
        },
        danger: {
          DEFAULT: '#D62828',
          light: '#FFEBEB',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        surface: '#F5F7FA',
        card: '#FFFFFF',
        border: '#E2E8F0',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        drawer: '-4px 0 24px rgba(0,0,0,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 2: Update `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { font-family: 'Inter', sans-serif; }
  body { @apply bg-surface text-slate-800; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
}

@layer utilities {
  .sidebar-width { width: 240px; }
  .sidebar-collapsed-width { width: 56px; }
}
```

- [ ] **Step 3: Verify Tailwind works**

In `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <h1 className="text-3xl font-bold text-primary">Uganda GovPay Switch</h1>
    </div>
  )
}
```

Run `npm run dev` and verify navy text on light-gray background renders.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/index.css src/App.tsx
git commit -m "feat: configure Tailwind design tokens"
```

---

### Task 4: Set up TanStack Router

**Files:**
- Create: `src/router.tsx`
- Create: `src/routes/index.tsx` (redirect)
- Create: `src/routes/login.tsx` (placeholder)
- Create: `src/routes/app.tsx` (layout placeholder)
- Create: `src/routes/app/dashboard.tsx` (placeholder for each of 13 modules)
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create all placeholder route files**

Create `src/routes/login.tsx`:
```tsx
export default function LoginPage() {
  return <div className="p-8 text-primary font-semibold">Login Page</div>
}
```

Create `src/routes/app/dashboard.tsx`:
```tsx
export default function DashboardPage() {
  return <div className="p-8">Dashboard</div>
}
```

Create the remaining 12 placeholder pages (one file each, same pattern — replace "Dashboard" with the module name):
- `src/routes/app/simulator.tsx` → "Payment Simulator"
- `src/routes/app/collections.tsx` → "Collections"
- `src/routes/app/routing.tsx` → "Payment Routing"
- `src/routes/app/participants.tsx` → "Participants"
- `src/routes/app/settlement.tsx` → "Settlement"
- `src/routes/app/reconciliation.tsx` → "Reconciliation"
- `src/routes/app/compliance.tsx` → "Compliance"
- `src/routes/app/disputes.tsx` → "Disputes"
- `src/routes/app/api-platform.tsx` → "API Platform"
- `src/routes/app/operations.tsx` → "Operations Center"
- `src/routes/app/reports.tsx` → "Reports"
- `src/routes/app/admin.tsx` → "Admin"

- [ ] **Step 2: Create `src/router.tsx`**

```tsx
import { createRouter, createRootRoute, createRoute, Outlet, Navigate } from '@tanstack/react-router'
import LoginPage from './routes/login'
import DashboardPage from './routes/app/dashboard'
import SimulatorPage from './routes/app/simulator'
import CollectionsPage from './routes/app/collections'
import RoutingPage from './routes/app/routing'
import ParticipantsPage from './routes/app/participants'
import SettlementPage from './routes/app/settlement'
import ReconciliationPage from './routes/app/reconciliation'
import CompliancePage from './routes/app/compliance'
import DisputesPage from './routes/app/disputes'
import ApiPlatformPage from './routes/app/api-platform'
import OperationsPage from './routes/app/operations'
import ReportsPage from './routes/app/reports'
import AdminPage from './routes/app/admin'

const rootRoute = createRootRoute({ component: Outlet })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/login" />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: Outlet,
})

const dashboardRoute = createRoute({ getParentRoute: () => appRoute, path: '/dashboard', component: DashboardPage })
const simulatorRoute = createRoute({ getParentRoute: () => appRoute, path: '/simulator', component: SimulatorPage })
const collectionsRoute = createRoute({ getParentRoute: () => appRoute, path: '/collections', component: CollectionsPage })
const routingRoute = createRoute({ getParentRoute: () => appRoute, path: '/routing', component: RoutingPage })
const participantsRoute = createRoute({ getParentRoute: () => appRoute, path: '/participants', component: ParticipantsPage })
const settlementRoute = createRoute({ getParentRoute: () => appRoute, path: '/settlement', component: SettlementPage })
const reconciliationRoute = createRoute({ getParentRoute: () => appRoute, path: '/reconciliation', component: ReconciliationPage })
const complianceRoute = createRoute({ getParentRoute: () => appRoute, path: '/compliance', component: CompliancePage })
const disputesRoute = createRoute({ getParentRoute: () => appRoute, path: '/disputes', component: DisputesPage })
const apiPlatformRoute = createRoute({ getParentRoute: () => appRoute, path: '/api-platform', component: ApiPlatformPage })
const operationsRoute = createRoute({ getParentRoute: () => appRoute, path: '/operations', component: OperationsPage })
const reportsRoute = createRoute({ getParentRoute: () => appRoute, path: '/reports', component: ReportsPage })
const adminRoute = createRoute({ getParentRoute: () => appRoute, path: '/admin', component: AdminPage })

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute, simulatorRoute, collectionsRoute, routingRoute,
    participantsRoute, settlementRoute, reconciliationRoute, complianceRoute,
    disputesRoute, apiPlatformRoute, operationsRoute, reportsRoute, adminRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```

- [ ] **Step 3: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
```

- [ ] **Step 4: Remove `src/App.tsx`** (router handles everything now)

```bash
rm src/App.tsx
```

- [ ] **Step 5: Verify routes work**

```bash
npm run dev
```

Visit `http://localhost:5173` — should redirect to `/login` and show "Login Page". Visit `http://localhost:5173/app/dashboard` — should show "Dashboard". Stop server.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: set up TanStack Router with all 13 module routes"
```

---

### Task 5: Define all TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```ts
// ─── Roles ───────────────────────────────────────────────
export type Role =
  | 'Super Admin'
  | 'Bank of Uganda Operator'
  | 'Treasury Officer'
  | 'Agency Officer'
  | 'Compliance Officer'
  | 'Settlement Officer'
  | 'Support Officer'
  | 'Developer'

// ─── Shared ──────────────────────────────────────────────
export type Status = 'completed' | 'pending' | 'failed' | 'processing' | 'cancelled' | 'reversed'
export type Channel = 'MTN Mobile Money' | 'Airtel Money' | 'Bank Transfer' | 'Visa/Mastercard' | 'USSD'
export type Region = 'Kampala' | 'Wakiso' | 'Mukono' | 'Jinja' | 'Mbarara' | 'Gulu' | 'Mbale' | 'Arua' | 'Fort Portal' | 'Masaka'

// ─── Agencies ────────────────────────────────────────────
export interface AgencyService {
  id: string
  name: string
  fee: number
  description: string
}

export interface Agency {
  id: string
  name: string
  shortName: string
  type: string
  settlementAccount: string
  services: AgencyService[]
  dailyVolume: number
  monthlyRevenue: number
  status: 'active' | 'inactive'
}

// ─── Participants ─────────────────────────────────────────
export type ParticipantType = 'Bank' | 'Mobile Money Operator' | 'Government Agency' | 'Payment Aggregator' | 'Treasury'

export interface Participant {
  id: string
  name: string
  shortName: string
  type: ParticipantType
  status: 'active' | 'suspended' | 'onboarding'
  apiHealth: 'healthy' | 'degraded' | 'down'
  apiLatency: number // ms
  settlementAccount: string
  dailyVolume: number
  dailyCount: number
  slaStatus: 'compliant' | 'breach' | 'warning'
  riskRating: 'low' | 'medium' | 'high'
  joinedDate: string
  apiHealthHistory: number[] // last 7 data points (latency ms)
}

// ─── Transactions ─────────────────────────────────────────
export interface Transaction {
  id: string
  amount: number // UGX
  payer: string
  payee: string
  agency: string
  service: string
  channel: Channel
  status: Status
  region: Region
  prn: string
  timestamp: string
  processingTime: number // ms
  failureReason?: string
}

// ─── Settlements ──────────────────────────────────────────
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'approved' | 'rejected'

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
}

export interface SettlementAccount {
  participant: string
  type: 'Treasury' | 'Agency' | 'Bank'
  accountNumber: string
  balance: number
  pendingInflow: number
  pendingOutflow: number
}

// ─── Disputes ─────────────────────────────────────────────
export type DisputeStatus = 'open' | 'investigating' | 'participant_response' | 'approved' | 'rejected' | 'closed'
export type DisputeType = 'failed_debit' | 'duplicate_payment' | 'incorrect_amount' | 'no_confirmation'

export interface DisputeTimelineEntry {
  stage: string
  actor: string
  timestamp: string
  note: string
}

export interface Dispute {
  id: string
  transactionId: string
  amount: number
  payer: string
  agency: string
  channel: Channel
  type: DisputeType
  status: DisputeStatus
  raisedAt: string
  slaDueAt: string
  timeline: DisputeTimelineEntry[]
  refundAmount?: number
}

// ─── Compliance ───────────────────────────────────────────
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface ComplianceAlert {
  id: string
  type: string
  severity: AlertSeverity
  description: string
  payer?: string
  participant?: string
  transactionId?: string
  triggeredAt: string
  status: 'open' | 'investigating' | 'resolved'
  rule: string
}

export interface BlacklistedAccount {
  id: string
  accountNumber: string
  name: string
  reason: string
  blacklistedAt: string
  addedBy: string
}

export interface AuditLogEntry {
  id: string
  actor: string
  role: Role
  action: string
  resource: string
  timestamp: string
  ip: string
}

// ─── Routing ──────────────────────────────────────────────
export interface RoutingRule {
  id: string
  priority: number
  channel: Channel
  participant: string
  minAmount: number
  maxAmount: number
  fee: number
  feeType: 'flat' | 'percentage'
  status: 'active' | 'inactive'
}

export interface ChannelHealth {
  channel: Channel
  participant: string
  status: 'healthy' | 'degraded' | 'down'
  latency: number
  uptime: number
  lastChecked: string
}

// ─── Reports ──────────────────────────────────────────────
export interface DailyVolumeStat {
  date: string
  count: number
  amount: number
  success: number
  failed: number
}

export interface AgencyRevenue {
  agency: string
  revenue: number
  count: number
}

export interface ChannelBreakdown {
  channel: string
  count: number
  amount: number
}

// ─── Toast ────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  createdAt: number
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: define all TypeScript types"
```

---

### Task 6: Create Zustand stores

**Files:**
- Create: `src/store/appStore.ts`

- [ ] **Step 1: Write `src/store/appStore.ts`**

```ts
import { create } from 'zustand'
import type { Role, Toast, ToastVariant, Transaction } from '../types'

interface AppState {
  // Auth
  activeRole: Role | null
  setRole: (role: Role) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Toasts
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant) => void
  removeToast: (id: string) => void

  // Live transactions (rolling buffer, max 50)
  liveTransactions: Transaction[]
  pushTransaction: (tx: Transaction) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeRole: null,
  setRole: (role) => set({ activeRole: role }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toasts: [],
  addToast: (message, variant) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: crypto.randomUUID(), message, variant, createdAt: Date.now() },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  liveTransactions: [],
  pushTransaction: (tx) =>
    set((s) => ({
      liveTransactions: [tx, ...s.liveTransactions].slice(0, 50),
    })),
}))
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/appStore.ts
git commit -m "feat: create Zustand app store"
```

---

### Task 7: Create animation variants

**Files:**
- Create: `src/utils/animations.ts`
- Create: `src/utils/format.ts`

- [ ] **Step 1: Write `src/utils/animations.ts`**

```ts
import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
}

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
}

export const flowNode: Variants = {
  idle: { scale: 1, boxShadow: '0 0 0 0 rgba(244, 176, 0, 0)' },
  active: {
    scale: 1.05,
    boxShadow: '0 0 0 8px rgba(244, 176, 0, 0.2)',
    transition: { duration: 0.4 },
  },
  completed: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(22, 163, 74, 0)',
    transition: { duration: 0.3 },
  },
  failed: {
    scale: 1,
    boxShadow: '0 0 0 8px rgba(214, 40, 40, 0.2)',
    transition: { duration: 0.3 },
  },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}
```

- [ ] **Step 2: Write `src/utils/format.ts`**

```ts
export function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-UG').format(n)
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-UG', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-UG', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export function generatePRN(): string {
  return `PRN${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 100)}`
}

export function generateTxnId(): string {
  return `TXN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/
git commit -m "feat: add animation variants and formatting utilities"
```

---

## Phase 2: Layout & Navigation (Tasks 8–11)

---

### Task 8: Build AppShell layout

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Modify: `src/router.tsx` (update appRoute to use AppShell)

- [ ] **Step 1: Write `src/components/layout/AppShell.tsx`**

```tsx
import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAppStore } from '../../store/appStore'
import { motion } from 'framer-motion'

export function AppShell() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <motion.div
        className="flex flex-col flex-1 overflow-hidden"
        animate={{ marginLeft: collapsed ? 56 : 240 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Create placeholder `Sidebar` and `Topbar` (so AppShell compiles)**

Create `src/components/layout/Sidebar.tsx`:
```tsx
export function Sidebar() {
  return <div className="fixed left-0 top-0 h-screen w-60 bg-primary" />
}
```

Create `src/components/layout/Topbar.tsx`:
```tsx
export function Topbar() {
  return <div className="h-14 border-b border-border bg-card" />
}
```

- [ ] **Step 3: Update `appRoute` in `src/router.tsx` to use AppShell**

Replace:
```tsx
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: Outlet,
})
```

With:
```tsx
import { AppShell } from './components/layout/AppShell'
// ...
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppShell,
})
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Visit `http://localhost:5173/app/dashboard` — should see a navy sidebar strip on the left with "Dashboard" text in the content area. Stop server.

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/
git commit -m "feat: build AppShell layout with sidebar + topbar placeholders"
```

---

### Task 9: Build Sidebar component

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Write the full `src/components/layout/Sidebar.tsx`**

```tsx
import { Link, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  LayoutDashboard, Zap, Building2, GitBranch, Users,
  Banknote, RefreshCw, ShieldAlert, MessageSquareWarning,
  Code2, Activity, BarChart3, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { path: '/app/dashboard',      icon: LayoutDashboard,       label: 'Dashboard' },
  { path: '/app/simulator',      icon: Zap,                   label: 'Payment Simulator' },
  { path: '/app/collections',    icon: Building2,             label: 'Collections' },
  { path: '/app/routing',        icon: GitBranch,             label: 'Routing' },
  { path: '/app/participants',   icon: Users,                 label: 'Participants' },
  { path: '/app/settlement',     icon: Banknote,              label: 'Settlement' },
  { path: '/app/reconciliation', icon: RefreshCw,             label: 'Reconciliation' },
  { path: '/app/compliance',     icon: ShieldAlert,           label: 'Compliance' },
  { path: '/app/disputes',       icon: MessageSquareWarning,  label: 'Disputes' },
  { path: '/app/api-platform',   icon: Code2,                 label: 'API Platform' },
  { path: '/app/operations',     icon: Activity,              label: 'Operations' },
  { path: '/app/reports',        icon: BarChart3,             label: 'Reports' },
  { path: '/app/admin',          icon: Settings,              label: 'Admin' },
]

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const activeRole = useAppStore((s) => s.activeRole)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <Tooltip.Provider delayDuration={300}>
      <motion.aside
        className="fixed left-0 top-0 h-screen bg-primary flex flex-col z-40 overflow-hidden"
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-primary-light/30">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 min-w-0"
              >
                <div className="w-7 h-7 bg-accent rounded-md flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-white font-bold text-xs leading-tight truncate">Uganda GovPay</div>
                  <div className="text-accent text-[10px] truncate">National Payment Infrastructure</div>
                </div>
              </motion.div>
            )}
            {collapsed && (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-7 h-7 bg-accent rounded-md mx-auto"
              />
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0 ml-1"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = pathname.startsWith(path)
            const item = (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-md text-sm transition-colors relative group',
                  active
                    ? 'bg-primary-light text-white'
                    : 'text-white/70 hover:text-white hover:bg-primary-light/50'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}
                <Icon size={17} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate whitespace-nowrap overflow-hidden font-medium"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip.Root key={path}>
                  <Tooltip.Trigger asChild>{item}</Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg ml-1"
                    >
                      {label}
                      <Tooltip.Arrow className="fill-slate-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )
            }
            return item
          })}
        </nav>

        {/* Role badge */}
        <div className="border-t border-primary-light/30 px-3 py-3">
          <div className={clsx('flex items-center gap-2', collapsed && 'justify-center')}>
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold">
                {activeRole ? activeRole[0] : 'G'}
              </span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <div className="text-white text-xs font-medium truncate">
                    {activeRole ?? 'Guest'}
                  </div>
                  <div className="text-white/50 text-[10px]">GovPay Switch</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </Tooltip.Provider>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Visit `/app/dashboard`. Sidebar should show navy background with 13 nav items, gold logo box, and a collapse chevron. Click collapse — sidebar should animate to 56px with icons only. Click active link — gold left border accent appears. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: build collapsible sidebar with all 13 nav items"
```

---

### Task 10: Build Topbar component

**Files:**
- Modify: `src/components/layout/Topbar.tsx`
- Create: `src/components/layout/CommandPalette.tsx`

- [ ] **Step 1: Write `src/components/layout/CommandPalette.tsx`**

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { formatUGX, timeAgo } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, overlayVariants } from '../../utils/animations'

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const transactions = useAppStore((s) => s.liveTransactions)

  const filtered = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.payer.toLowerCase().includes(query.toLowerCase()) ||
      t.agency.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl bg-card rounded-xl shadow-modal z-50 overflow-hidden"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search size={16} className="text-muted" />
                    <input
                      autoFocus
                      className="flex-1 text-sm outline-none bg-transparent"
                      placeholder="Search transactions, payers, agencies..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded border border-border">Esc</kbd>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {filtered.length === 0 && (
                      <div className="py-8 text-center text-muted text-sm">No transactions found</div>
                    )}
                    {filtered.slice(0, 8).map((t) => (
                      <button
                        key={t.id}
                        onClick={onClose}
                        className="w-full text-left px-4 py-3 hover:bg-surface transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">{t.id}</div>
                          <div className="text-xs text-muted">{t.payer} · {t.agency}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">{formatUGX(t.amount)}</div>
                          <div className="text-xs text-muted">{timeAgo(t.timestamp)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 2: Write full `src/components/layout/Topbar.tsx`**

```tsx
import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Search, Bell } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { CommandPalette } from './CommandPalette'

const BREADCRUMB_MAP: Record<string, string> = {
  '/app/dashboard':      'Dashboard',
  '/app/simulator':      'Payment Simulator',
  '/app/collections':    'Collections',
  '/app/routing':        'Payment Routing',
  '/app/participants':   'Participant Management',
  '/app/settlement':     'Settlement',
  '/app/reconciliation': 'Reconciliation',
  '/app/compliance':     'Compliance & Risk',
  '/app/disputes':       'Disputes & Refunds',
  '/app/api-platform':   'API Platform',
  '/app/operations':     'Operations Center',
  '/app/reports':        'Reports & Analytics',
  '/app/admin':          'Admin & Configuration',
}

export function Topbar() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const role = useAppStore((s) => s.activeRole)
  const pageTitle = BREADCRUMB_MAP[pathname] ?? 'GovPay Switch'

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">GovPay Switch</span>
          <span className="text-muted">/</span>
          <span className="font-semibold text-slate-800">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 text-sm text-muted bg-surface border border-border rounded-lg px-3 py-1.5 hover:border-primary/30 transition-colors"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd className="text-xs bg-card border border-border rounded px-1">⌘K</kbd>
          </button>

          <button className="relative p-2 text-muted hover:text-slate-800 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">{role ? role[0] : 'G'}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">{role ?? 'Guest'}</span>
          </div>
        </div>
      </header>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}
```

- [ ] **Step 3: TypeScript check and visual verify**

```bash
npx tsc --noEmit
npm run dev
```

Visit `/app/dashboard` — topbar should show breadcrumb left, search/bell/role right. Click search — command palette opens. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: build topbar with breadcrumb, command palette, and role badge"
```

---

### Task 11: Build Login page

**Files:**
- Modify: `src/routes/login.tsx`

- [ ] **Step 1: Write full `src/routes/login.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import type { Role } from '../types'
import { fadeInUp, staggerContainer } from '../utils/animations'
import {
  ShieldCheck, Landmark, Receipt, Building2,
  ShieldAlert, Banknote, Headset, Code2,
} from 'lucide-react'

const ROLES: { role: Role; icon: React.ElementType; description: string }[] = [
  { role: 'Super Admin',              icon: ShieldCheck,  description: 'Full system access and configuration' },
  { role: 'Bank of Uganda Operator',  icon: Landmark,     description: 'Central bank oversight and controls' },
  { role: 'Treasury Officer',         icon: Receipt,      description: 'Settlement and treasury management' },
  { role: 'Agency Officer',           icon: Building2,    description: 'Government agency collections' },
  { role: 'Compliance Officer',       icon: ShieldAlert,  description: 'AML, risk, and audit functions' },
  { role: 'Settlement Officer',       icon: Banknote,     description: 'Batch settlement operations' },
  { role: 'Support Officer',          icon: Headset,      description: 'Dispute resolution and support' },
  { role: 'Developer',                icon: Code2,        description: 'API integration and sandbox access' },
]

export default function LoginPage() {
  const [selected, setSelected] = useState<Role | null>(null)
  const setRole = useAppStore((s) => s.setRole)
  const navigate = useNavigate()

  function handleEnter() {
    if (!selected) return
    setRole(selected)
    navigate({ to: '/app/dashboard' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-light flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="w-full max-w-2xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
              <Landmark size={24} className="text-primary" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-xl leading-tight">Uganda GovPay Switch</div>
              <div className="text-accent text-sm">National Payment Infrastructure</div>
            </div>
          </div>
          <p className="text-white/70 text-sm">Select your role to access the platform</p>
        </motion.div>

        {/* Role grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ role, icon: Icon, description }) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={`
                text-left p-4 rounded-xl border-2 transition-all duration-200
                ${selected === role
                  ? 'bg-accent border-accent text-primary shadow-lg scale-[1.02]'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'}
              `}
            >
              <Icon size={20} className="mb-2" />
              <div className="font-semibold text-sm">{role}</div>
              <div className={`text-xs mt-0.5 ${selected === role ? 'text-primary/70' : 'text-white/60'}`}>
                {description}
              </div>
            </button>
          ))}
        </motion.div>

        {/* Enter button */}
        <motion.div variants={fadeInUp}>
          <button
            onClick={handleEnter}
            disabled={!selected}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
              bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
          >
            {selected ? `Enter as ${selected}` : 'Select a role to continue'}
          </button>
        </motion.div>

        <motion.p variants={fadeInUp} className="text-center text-white/40 text-xs mt-4">
          Demo environment — no real payment data
        </motion.p>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Verify visually**

```bash
npm run dev
```

Visit `http://localhost:5173/login`. Should show navy gradient background, logo header, 2×4 role card grid. Click a role — card highlights gold. Click "Enter as..." — navigates to `/app/dashboard`. Stop server.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/login.tsx
git commit -m "feat: build login page with role switcher"
```

---

## Phase 3: Shared UI Components (Tasks 12–18)

---

### Task 12: Build core UI primitives (Badge, PageHeader, KPICard, Skeleton)

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/PageHeader.tsx`
- Create: `src/components/ui/KPICard.tsx`
- Create: `src/components/ui/Skeleton.tsx`

- [ ] **Step 1: Write `src/components/ui/Badge.tsx`**

```tsx
import clsx from 'clsx'

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'muted' | 'accent'

const STYLES: Record<Variant, string> = {
  success: 'bg-success-light text-success',
  danger:  'bg-danger-light text-danger',
  warning: 'bg-warning-light text-warning',
  info:    'bg-primary-50 text-primary',
  muted:   'bg-slate-100 text-muted',
  accent:  'bg-accent/15 text-amber-700',
}

interface Props {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: Props) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STYLES[variant], className)}>
      {children}
    </span>
  )
}

export function statusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    completed: 'success', active: 'success', healthy: 'success', compliant: 'success', resolved: 'success',
    failed: 'danger', suspended: 'danger', down: 'danger', breach: 'danger', critical: 'danger',
    pending: 'warning', processing: 'warning', degraded: 'warning', warning: 'warning', investigating: 'warning',
    cancelled: 'muted', inactive: 'muted', low: 'muted',
    reversed: 'info', onboarding: 'info',
  }
  return map[status.toLowerCase()] ?? 'muted'
}
```

- [ ] **Step 2: Write `src/components/ui/PageHeader.tsx`**

```tsx
interface Props {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-start justify-between pb-5 mb-6 border-b border-border">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/ui/KPICard.tsx`**

```tsx
import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'

type AccentColor = 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'muted'

const ACCENT_BORDER: Record<AccentColor, string> = {
  primary: 'border-t-primary',
  accent:  'border-t-accent',
  success: 'border-t-success',
  danger:  'border-t-danger',
  warning: 'border-t-warning',
  muted:   'border-t-muted',
}

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  accent?: AccentColor
  animate?: boolean
  className?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const spring = useSpring(0, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (inView) spring.set(value)
  }, [inView, value, spring])

  return <motion.span ref={ref}>{display}</motion.span>
}

export function KPICard({ title, value, subtitle, icon, accent = 'primary', animate = true, className }: Props) {
  return (
    <div className={clsx(
      'bg-card rounded-card shadow-card border-t-[3px] p-4 flex flex-col gap-1',
      ACCENT_BORDER[accent],
      className
    )}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{title}</span>
        {icon && <span className="text-muted/60">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-slate-800">
        {animate && typeof value === 'number' ? (
          <AnimatedNumber value={value} />
        ) : (
          value
        )}
      </div>
      {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/ui/Skeleton.tsx`**

```tsx
import clsx from 'clsx'

interface Props {
  className?: string
  variant?: 'text' | 'card' | 'circle'
}

export function Skeleton({ className, variant = 'text' }: Props) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-slate-200 rounded',
        variant === 'card' && 'h-24 rounded-card',
        variant === 'circle' && 'rounded-full',
        className
      )}
    />
  )
}

export function KPICardSkeleton() {
  return (
    <div className="bg-card rounded-card shadow-card border-t-[3px] border-t-slate-200 p-4 flex flex-col gap-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: build Badge, PageHeader, KPICard, and Skeleton components"
```

---

### Task 13: Build DataTable component

**Files:**
- Create: `src/components/ui/DataTable.tsx`

- [ ] **Step 1: Write `src/components/ui/DataTable.tsx`**

```tsx
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import clsx from 'clsx'
import { TableRowSkeleton } from './Skeleton'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  loading?: boolean
  onRowClick?: (row: T) => void
  emptyMessage?: string
  skeletonRows?: number
}

type SortDir = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, unknown>>({
  columns, data, keyField, loading, onRowClick, emptyMessage = 'No records found', skeletonRows = 6,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function handleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return }
    if (sortDir === 'asc') { setSortDir('desc'); return }
    setSortKey(null); setSortDir(null)
  }

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide',
                    col.sortable && 'cursor-pointer hover:text-slate-700 select-none',
                    col.width
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === String(col.key)
                        ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        : <ChevronsUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length} />
            ))}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading && sorted.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'hover:bg-primary-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row) : String(row[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/DataTable.tsx
git commit -m "feat: build sortable DataTable component"
```

---

### Task 14: Build Drawer component

**Files:**
- Create: `src/components/ui/Drawer.tsx`

- [ ] **Step 1: Write `src/components/ui/Drawer.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { slideInRight, overlayVariants } from '../../utils/animations'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: number
}

export function Drawer({ open, onClose, title, subtitle, children, width = 480 }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 h-screen bg-card shadow-drawer z-50 flex flex-col overflow-hidden"
            style={{ width }}
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="text-muted hover:text-slate-700 transition-colors mt-0.5">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/components/ui/Drawer.tsx
git commit -m "feat: build Drawer component"
```

---

### Task 15: Build Modal wrapper and Toast system

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/ToastStack.tsx`
- Modify: `src/components/layout/AppShell.tsx` (add ToastStack)

- [ ] **Step 1: Write `src/components/ui/Modal.tsx`**

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { scaleIn, overlayVariants } from '../../utils/animations'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg', footer }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                  variants={overlayVariants}
                  initial="hidden" animate="visible" exit="exit"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} bg-card rounded-xl shadow-modal z-50 overflow-hidden`}
                  variants={scaleIn}
                  initial="hidden" animate="visible" exit="exit"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <Dialog.Title className="text-base font-semibold text-slate-800">{title}</Dialog.Title>
                    <button onClick={onClose} className="text-muted hover:text-slate-700 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="px-5 py-5">{children}</div>
                  {footer && <div className="px-5 py-4 border-t border-border bg-surface flex justify-end gap-2">{footer}</div>}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/ToastStack.tsx`**

```tsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { Toast } from '../../types'
import clsx from 'clsx'

const CONFIG = {
  success: { icon: CheckCircle, cls: 'border-l-success bg-success-light text-success' },
  error:   { icon: XCircle,     cls: 'border-l-danger bg-danger-light text-danger' },
  warning: { icon: AlertTriangle, cls: 'border-l-warning bg-warning-light text-warning' },
  info:    { icon: Info,        cls: 'border-l-primary bg-primary-50 text-primary' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useAppStore((s) => s.removeToast)
  const { icon: Icon, cls } = CONFIG[toast.variant]

  useEffect(() => {
    const t = setTimeout(() => remove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, remove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      className={clsx('flex items-start gap-3 p-3.5 pr-10 rounded-lg shadow-card border-l-4 bg-card relative max-w-sm', cls)}
    >
      <Icon size={17} className="flex-shrink-0 mt-0.5" />
      <span className="text-sm text-slate-700">{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        className="absolute right-3 top-3.5 text-muted hover:text-slate-700"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastStack() {
  const toasts = useAppStore((s) => s.toasts)
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3: Add `ToastStack` to `AppShell`**

In `src/components/layout/AppShell.tsx`, add import and render `<ToastStack />` inside the root div:

```tsx
import { ToastStack } from '../ui/ToastStack'

// Inside the return, after </motion.div>:
<ToastStack />
```

- [ ] **Step 4: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/components/ui/Modal.tsx src/components/ui/ToastStack.tsx src/components/layout/AppShell.tsx
git commit -m "feat: build Modal and ToastStack components"
```

---

### Task 16: Build Stepper and Timeline components

**Files:**
- Create: `src/components/ui/Stepper.tsx`
- Create: `src/components/ui/Timeline.tsx`

- [ ] **Step 1: Write `src/components/ui/Stepper.tsx`**

```tsx
import { Check } from 'lucide-react'
import clsx from 'clsx'

export interface Step {
  label: string
  description?: string
}

interface Props {
  steps: Step[]
  current: number
}

export function Stepper({ steps, current }: Props) {
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors',
                done   && 'border-success bg-success text-white',
                active && 'border-primary bg-primary text-white',
                !done && !active && 'border-border bg-surface text-muted'
              )}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <div className="text-xs font-medium mt-1.5 text-center w-20 leading-tight">
                <span className={active ? 'text-primary' : done ? 'text-success' : 'text-muted'}>
                  {step.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx(
                'flex-1 h-0.5 mt-4 mx-1 transition-colors',
                i < current ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/Timeline.tsx`**

```tsx
import clsx from 'clsx'

export interface TimelineItem {
  label: string
  timestamp: string
  description?: string
  actor?: string
  status?: 'done' | 'active' | 'pending'
}

interface Props {
  items: TimelineItem[]
}

export function Timeline({ items }: Props) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
      {items.map((item, i) => (
        <div key={i} className="relative mb-5 last:mb-0">
          <div className={clsx(
            'absolute -left-4 top-1 w-3 h-3 rounded-full border-2',
            item.status === 'done'   && 'bg-success border-success',
            item.status === 'active' && 'bg-primary border-primary',
            (!item.status || item.status === 'pending') && 'bg-surface border-border',
          )} />
          <div className="text-xs text-muted mb-0.5">{item.timestamp}</div>
          <div className="text-sm font-medium text-slate-800">{item.label}</div>
          {item.actor && <div className="text-xs text-muted">{item.actor}</div>}
          {item.description && <div className="text-xs text-slate-600 mt-1">{item.description}</div>}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/components/ui/Stepper.tsx src/components/ui/Timeline.tsx
git commit -m "feat: build Stepper and Timeline components"
```

---

### Task 17: Build chart wrapper components

**Files:**
- Create: `src/components/charts/BarChart.tsx`
- Create: `src/components/charts/PieChart.tsx`
- Create: `src/components/charts/AreaChart.tsx`
- Create: `src/components/charts/LineChart.tsx`

- [ ] **Step 1: Write `src/components/charts/BarChart.tsx`**

```tsx
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Props {
  data: Record<string, unknown>[]
  xKey: string
  bars: { key: string; color: string; name?: string }[]
  height?: number
}

export function BarChart({ data, xKey, bars, height = 220 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name ?? b.key} fill={b.color} radius={[3, 3, 0, 0]} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Write `src/components/charts/PieChart.tsx`**

```tsx
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface Slice {
  name: string
  value: number
  color: string
}

interface Props {
  data: Slice[]
  height?: number
  donut?: boolean
}

export function PieChart({ data, height = 220, donut = false }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? '55%' : 0}
          outerRadius="75%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((slice, i) => <Cell key={i} fill={slice.color} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </RePieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Write `src/components/charts/AreaChart.tsx`**

```tsx
import { ResponsiveContainer, AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Props {
  data: Record<string, unknown>[]
  xKey: string
  areas: { key: string; color: string; name?: string }[]
  height?: number
}

export function AreaChart({ data, xKey, areas, height = 200 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((a) => (
            <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={a.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={a.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        {areas.map((a) => (
          <Area
            key={a.key}
            type="monotone"
            dataKey={a.key}
            name={a.name ?? a.key}
            stroke={a.color}
            fill={`url(#grad-${a.key})`}
            strokeWidth={2}
          />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Write `src/components/charts/LineChart.tsx`**

```tsx
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Props {
  data: Record<string, unknown>[]
  xKey: string
  lines: { key: string; color: string; name?: string }[]
  height?: number
}

export function LineChart({ data, xKey, lines, height = 200 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name ?? l.key}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 5: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/components/charts/
git commit -m "feat: build Recharts wrapper components (Bar, Pie, Area, Line)"
```

---

## Phase 4: Mock Data & Services (Tasks 18–20)

---

### Task 18: Create mock data files

**Files:**
- Create: `src/data/mockAgencies.ts`
- Create: `src/data/mockParticipants.ts`
- Create: `src/data/mockTransactions.ts`
- Create: `src/data/mockSettlements.ts`
- Create: `src/data/mockDisputes.ts`
- Create: `src/data/mockCompliance.ts`
- Create: `src/data/mockRouting.ts`
- Create: `src/data/mockReports.ts`

- [ ] **Step 1: Write `src/data/mockAgencies.ts`**

```ts
import type { Agency } from '../types'

export const mockAgencies: Agency[] = [
  {
    id: 'URA', name: 'Uganda Revenue Authority', shortName: 'URA',
    type: 'Tax & Revenue',
    settlementAccount: 'BOU-TREAS-001-URA',
    dailyVolume: 4_820_000_000, monthlyRevenue: 89_400_000_000, status: 'active',
    services: [
      { id: 'ura-tax', name: 'Income Tax', fee: 2000, description: 'Personal and corporate income tax payments' },
      { id: 'ura-vat', name: 'VAT Payment', fee: 2000, description: 'Value added tax remittance' },
      { id: 'ura-customs', name: 'Customs Duty', fee: 5000, description: 'Import and export duty payments' },
      { id: 'ura-paye', name: 'PAYE', fee: 2000, description: 'Pay As You Earn employer remittance' },
    ],
  },
  {
    id: 'NIRA', name: 'National Identification & Registration Authority', shortName: 'NIRA',
    type: 'Identification',
    settlementAccount: 'BOU-TREAS-002-NIRA',
    dailyVolume: 380_000_000, monthlyRevenue: 7_200_000_000, status: 'active',
    services: [
      { id: 'nira-nid', name: 'National ID', fee: 5000, description: 'National ID card application' },
      { id: 'nira-passport', name: 'Passport', fee: 250000, description: 'Ordinary passport application' },
      { id: 'nira-birth', name: 'Birth Certificate', fee: 20000, description: 'Birth certificate issuance' },
    ],
  },
  {
    id: 'URSB', name: 'Uganda Registration Services Bureau', shortName: 'URSB',
    type: 'Business Registration',
    settlementAccount: 'BOU-TREAS-003-URSB',
    dailyVolume: 210_000_000, monthlyRevenue: 3_900_000_000, status: 'active',
    services: [
      { id: 'ursb-bizreg', name: 'Business Registration', fee: 100000, description: 'Company name and business registration' },
      { id: 'ursb-trademark', name: 'Trademark Registration', fee: 400000, description: 'Trademark and IP registration' },
    ],
  },
  {
    id: 'MOL', name: 'Ministry of Lands', shortName: 'Ministry of Lands',
    type: 'Land Services',
    settlementAccount: 'BOU-TREAS-004-MOL',
    dailyVolume: 560_000_000, monthlyRevenue: 10_500_000_000, status: 'active',
    services: [
      { id: 'mol-landsearch', name: 'Land Search', fee: 50000, description: 'Land title and ownership search' },
      { id: 'mol-transfer', name: 'Land Transfer', fee: 200000, description: 'Land title transfer and registration' },
      { id: 'mol-lease', name: 'Lease Extension', fee: 150000, description: 'Mailo/leasehold extension fees' },
    ],
  },
  {
    id: 'UPF', name: 'Uganda Police Force', shortName: 'Uganda Police',
    type: 'Law Enforcement',
    settlementAccount: 'BOU-TREAS-005-UPF',
    dailyVolume: 95_000_000, monthlyRevenue: 1_800_000_000, status: 'active',
    services: [
      { id: 'upf-fine', name: 'Court Fine', fee: 10000, description: 'Traffic and court-ordered fines' },
      { id: 'upf-clearance', name: 'Police Clearance', fee: 80000, description: 'Police clearance certificate' },
      { id: 'upf-permit', name: 'Firearms Permit', fee: 500000, description: 'Firearms possession permit' },
    ],
  },
  {
    id: 'IMM', name: 'Directorate of Citizenship & Immigration', shortName: 'Immigration',
    type: 'Immigration',
    settlementAccount: 'BOU-TREAS-006-IMM',
    dailyVolume: 180_000_000, monthlyRevenue: 3_400_000_000, status: 'active',
    services: [
      { id: 'imm-visa', name: 'Visa Application', fee: 120000, description: 'Tourist and work visa fees' },
      { id: 'imm-permit', name: 'Work Permit', fee: 820000, description: 'Work permit and stay extension' },
    ],
  },
  {
    id: 'KCCA', name: 'Kampala Capital City Authority', shortName: 'KCCA',
    type: 'Local Government',
    settlementAccount: 'BOU-TREAS-007-KCCA',
    dailyVolume: 290_000_000, monthlyRevenue: 5_500_000_000, status: 'active',
    services: [
      { id: 'kcca-permit', name: 'Business Permit', fee: 200000, description: 'Kampala operating license' },
      { id: 'kcca-parking', name: 'Parking Fine', fee: 20000, description: 'Parking violation fine payment' },
      { id: 'kcca-rates', name: 'Property Rates', fee: 5000, description: 'Annual property rates' },
    ],
  },
  {
    id: 'MOW', name: 'Ministry of Works & Transport', shortName: 'Ministry of Works',
    type: 'Transport',
    settlementAccount: 'BOU-TREAS-008-MOW',
    dailyVolume: 420_000_000, monthlyRevenue: 7_900_000_000, status: 'active',
    services: [
      { id: 'mow-dlvehicle', name: 'Driving License', fee: 80000, description: 'Driving license application and renewal' },
      { id: 'mow-uvehicle', name: 'Vehicle Registration', fee: 200000, description: 'Vehicle registration and transfer' },
      { id: 'mow-roadtax', name: 'Road Tax', fee: 350000, description: 'Annual road licensing fees' },
    ],
  },
]
```

- [ ] **Step 2: Write `src/data/mockParticipants.ts`**

```ts
import type { Participant } from '../types'

function health7(): number[] {
  return Array.from({ length: 7 }, () => 80 + Math.floor(Math.random() * 200))
}

export const mockParticipants: Participant[] = [
  { id: 'STB', name: 'Stanbic Bank Uganda', shortName: 'Stanbic', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 92, settlementAccount: 'BOU-STB-001', dailyVolume: 8_400_000_000, dailyCount: 12400, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-01-15', apiHealthHistory: health7() },
  { id: 'CTB', name: 'Centenary Bank', shortName: 'Centenary', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 108, settlementAccount: 'BOU-CTB-001', dailyVolume: 3_200_000_000, dailyCount: 7800, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-03-10', apiHealthHistory: health7() },
  { id: 'DFCU', name: 'DFCU Bank', shortName: 'DFCU', type: 'Bank', status: 'active', apiHealth: 'degraded', apiLatency: 340, settlementAccount: 'BOU-DFCU-001', dailyVolume: 1_900_000_000, dailyCount: 4200, slaStatus: 'warning', riskRating: 'medium', joinedDate: '2022-05-20', apiHealthHistory: health7() },
  { id: 'EQB', name: 'Equity Bank Uganda', shortName: 'Equity', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 115, settlementAccount: 'BOU-EQB-001', dailyVolume: 2_700_000_000, dailyCount: 5900, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-02-28', apiHealthHistory: health7() },
  { id: 'ABSA', name: 'Absa Bank Uganda', shortName: 'Absa', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 98, settlementAccount: 'BOU-ABSA-001', dailyVolume: 2_100_000_000, dailyCount: 3800, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-04-05', apiHealthHistory: health7() },
  { id: 'BOA', name: 'Bank of Africa Uganda', shortName: 'Bank of Africa', type: 'Bank', status: 'suspended', apiHealth: 'down', apiLatency: 0, settlementAccount: 'BOU-BOA-001', dailyVolume: 0, dailyCount: 0, slaStatus: 'breach', riskRating: 'high', joinedDate: '2022-06-12', apiHealthHistory: health7() },
  { id: 'HFB', name: 'Housing Finance Bank', shortName: 'Housing Finance', type: 'Bank', status: 'active', apiHealth: 'healthy', apiLatency: 125, settlementAccount: 'BOU-HFB-001', dailyVolume: 980_000_000, dailyCount: 2100, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2022-07-19', apiHealthHistory: health7() },
  { id: 'MTN', name: 'MTN Mobile Money Uganda', shortName: 'MTN MoMo', type: 'Mobile Money Operator', status: 'active', apiHealth: 'healthy', apiLatency: 78, settlementAccount: 'BOU-MTN-001', dailyVolume: 12_800_000_000, dailyCount: 380000, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-11-01', apiHealthHistory: health7() },
  { id: 'AIR', name: 'Airtel Money Uganda', shortName: 'Airtel Money', type: 'Mobile Money Operator', status: 'active', apiHealth: 'healthy', apiLatency: 83, settlementAccount: 'BOU-AIR-001', dailyVolume: 7_200_000_000, dailyCount: 210000, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-11-15', apiHealthHistory: health7() },
  { id: 'PESA', name: 'Pesalink Aggregator', shortName: 'Pesalink', type: 'Payment Aggregator', status: 'active', apiHealth: 'healthy', apiLatency: 142, settlementAccount: 'BOU-PESA-001', dailyVolume: 1_400_000_000, dailyCount: 9200, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2023-01-10', apiHealthHistory: health7() },
  { id: 'TREAS', name: 'Consolidated Fund (Treasury)', shortName: 'Treasury', type: 'Treasury', status: 'active', apiHealth: 'healthy', apiLatency: 55, settlementAccount: 'BOU-TREAS-MAIN', dailyVolume: 0, dailyCount: 0, slaStatus: 'compliant', riskRating: 'low', joinedDate: '2021-07-01', apiHealthHistory: health7() },
]
```

- [ ] **Step 3: Write `src/data/mockTransactions.ts`**

Create a generator for 500 realistic Ugandan transactions:

```ts
import type { Transaction, Channel, Region, Status } from '../types'
import { generateTxnId } from '../utils/format'

const PAYERS = [
  'Mugisha Robert', 'Namutebi Grace', 'Okello James', 'Nakato Fatuma',
  'Ssekandi Paul', 'Nansubuga Doreen', 'Oryem Moses', 'Akello Sarah',
  'Byamukama Denis', 'Namugga Ritah', 'Tumukunde Frank', 'Akullo Betty',
  'Ssentongo Richard', 'Nabwire Joyce', 'Olweny Peter', 'Nabirye Esther',
]

const CHANNELS: Channel[] = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD']
const REGIONS: Region[] = ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Mbale', 'Arua', 'Fort Portal', 'Masaka']
const STATUSES: Status[] = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'failed', 'pending', 'processing', 'reversed']

const SERVICES = [
  { agency: 'URA', service: 'Income Tax', amounts: [500000, 1200000, 4500000, 280000] },
  { agency: 'URA', service: 'PAYE', amounts: [2800000, 5600000, 890000] },
  { agency: 'NIRA', service: 'Passport', amounts: [250000] },
  { agency: 'NIRA', service: 'National ID', amounts: [5000] },
  { agency: 'MOW', service: 'Driving License', amounts: [80000] },
  { agency: 'MOW', service: 'Vehicle Registration', amounts: [200000, 350000] },
  { agency: 'MOL', service: 'Land Search', amounts: [50000] },
  { agency: 'MOL', service: 'Land Transfer', amounts: [200000, 500000] },
  { agency: 'UPF', service: 'Court Fine', amounts: [50000, 100000, 200000] },
  { agency: 'URSB', service: 'Business Registration', amounts: [100000, 250000] },
  { agency: 'KCCA', service: 'Business Permit', amounts: [200000, 400000, 800000] },
  { agency: 'IMM', service: 'Visa Application', amounts: [120000, 240000] },
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): string {
  const d = new Date()
  d.setTime(d.getTime() - Math.random() * daysBack * 86400000)
  return d.toISOString()
}

function buildTransactions(): Transaction[] {
  return Array.from({ length: 500 }, (_, i) => {
    const svc = randomItem(SERVICES)
    const amount = randomItem(svc.amounts)
    const status = randomItem(STATUSES)
    return {
      id: `TXN-2026-${String(100000 + i).slice(1)}`,
      amount,
      payer: randomItem(PAYERS),
      payee: svc.agency,
      agency: svc.agency,
      service: svc.service,
      channel: randomItem(CHANNELS),
      status,
      region: randomItem(REGIONS),
      prn: `PRN2026${String(100000 + i).slice(1)}`,
      timestamp: randomDate(30),
      processingTime: 100 + Math.floor(Math.random() * 800),
      failureReason: status === 'failed' ? randomItem([
        'Insufficient funds', 'Network timeout', 'Invalid PRN', 'Bank API unavailable',
      ]) : undefined,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const mockTransactions: Transaction[] = buildTransactions()
```

- [ ] **Step 4: Write `src/data/mockSettlements.ts`**

```ts
import type { SettlementBatch, SettlementAccount } from '../types'

const PARTICIPANTS = ['Stanbic Bank', 'Centenary Bank', 'DFCU Bank', 'Equity Bank', 'MTN Mobile Money', 'Airtel Money']

function settlementDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().split('T')[0]
}

export const mockSettlementBatches: SettlementBatch[] = [
  { id: 'BATCH-2026-0531-001', batchDate: settlementDate(0), participant: 'Stanbic Bank', grossAmount: 8_400_000_000, netAmount: 8_376_000_000, transactionCount: 12400, status: 'pending' },
  { id: 'BATCH-2026-0531-002', batchDate: settlementDate(0), participant: 'MTN Mobile Money', grossAmount: 12_800_000_000, netAmount: 12_736_000_000, transactionCount: 380000, status: 'processing' },
  { id: 'BATCH-2026-0531-003', batchDate: settlementDate(0), participant: 'Centenary Bank', grossAmount: 3_200_000_000, netAmount: 3_184_000_000, transactionCount: 7800, status: 'pending' },
  { id: 'BATCH-2026-0530-001', batchDate: settlementDate(1), participant: 'Stanbic Bank', grossAmount: 7_900_000_000, netAmount: 7_861_500_000, transactionCount: 11200, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'BATCH-2026-0530-002', batchDate: settlementDate(1), participant: 'Airtel Money', grossAmount: 7_200_000_000, netAmount: 7_164_000_000, transactionCount: 210000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 82800000).toISOString() },
  { id: 'BATCH-2026-0530-003', batchDate: settlementDate(1), participant: 'DFCU Bank', grossAmount: 1_900_000_000, netAmount: 1_890_500_000, transactionCount: 4200, status: 'failed', failureReason: 'API timeout during settlement confirmation' },
  { id: 'BATCH-2026-0529-001', batchDate: settlementDate(2), participant: 'Equity Bank', grossAmount: 2_700_000_000, netAmount: 2_686_500_000, transactionCount: 5900, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'BATCH-2026-0529-002', batchDate: settlementDate(2), participant: 'MTN Mobile Money', grossAmount: 11_400_000_000, netAmount: 11_343_000_000, transactionCount: 340000, status: 'completed', approvedBy: 'Treasury Officer', completedAt: new Date(Date.now() - 169200000).toISOString() },
]

export const mockSettlementAccounts: SettlementAccount[] = [
  { participant: 'Treasury (Consolidated Fund)', type: 'Treasury', accountNumber: 'BOU-TREAS-MAIN', balance: 248_400_000_000, pendingInflow: 24_400_000_000, pendingOutflow: 0 },
  { participant: 'URA Settlement', type: 'Agency', accountNumber: 'BOU-TREAS-001-URA', balance: 89_400_000_000, pendingInflow: 4_820_000_000, pendingOutflow: 0 },
  { participant: 'NIRA Settlement', type: 'Agency', accountNumber: 'BOU-TREAS-002-NIRA', balance: 7_200_000_000, pendingInflow: 380_000_000, pendingOutflow: 0 },
  { participant: 'Stanbic Bank', type: 'Bank', accountNumber: 'BOU-STB-001', balance: 12_400_000_000, pendingInflow: 8_400_000_000, pendingOutflow: 8_376_000_000 },
  { participant: 'MTN Mobile Money', type: 'Bank', accountNumber: 'BOU-MTN-001', balance: 18_200_000_000, pendingInflow: 12_800_000_000, pendingOutflow: 12_736_000_000 },
]
```

- [ ] **Step 5: Write `src/data/mockDisputes.ts`**

```ts
import type { Dispute } from '../types'

export const mockDisputes: Dispute[] = [
  {
    id: 'DSP-2026-001', transactionId: 'TXN-2026-100042', amount: 250000,
    payer: 'Namutebi Grace', agency: 'NIRA', channel: 'MTN Mobile Money',
    type: 'failed_debit', status: 'investigating', raisedAt: '2026-05-29T10:23:00Z',
    slaDueAt: '2026-06-05T10:23:00Z',
    timeline: [
      { stage: 'Dispute Raised', actor: 'Namutebi Grace', timestamp: '2026-05-29T10:23:00Z', note: 'Reported via citizen portal — debited but no passport confirmation received', status: 'done' } as never,
      { stage: 'Investigation', actor: 'Support Officer', timestamp: '2026-05-29T11:05:00Z', note: 'Transaction confirmed on MTN side. Awaiting NIRA confirmation API response', status: 'done' } as never,
      { stage: 'Participant Response', actor: 'NIRA', timestamp: '', note: '', status: 'pending' } as never,
    ],
  },
  {
    id: 'DSP-2026-002', transactionId: 'TXN-2026-100128', amount: 80000,
    payer: 'Okello James', agency: 'MOW', channel: 'Bank Transfer',
    type: 'duplicate_payment', status: 'open', raisedAt: '2026-05-30T14:45:00Z',
    slaDueAt: '2026-06-06T14:45:00Z',
    timeline: [
      { stage: 'Dispute Raised', actor: 'Okello James', timestamp: '2026-05-30T14:45:00Z', note: 'Paid twice for driving license — duplicate PRN charged', status: 'done' } as never,
    ],
  },
  {
    id: 'DSP-2026-003', transactionId: 'TXN-2026-099841', amount: 500000,
    payer: 'Ssekandi Paul', agency: 'MOL', channel: 'Visa/Mastercard',
    type: 'incorrect_amount', status: 'approved', raisedAt: '2026-05-27T09:12:00Z',
    slaDueAt: '2026-06-03T09:12:00Z', refundAmount: 300000,
    timeline: [
      { stage: 'Dispute Raised', actor: 'Ssekandi Paul', timestamp: '2026-05-27T09:12:00Z', note: 'Charged UGX 500,000 but invoice was UGX 200,000', status: 'done' } as never,
      { stage: 'Investigation', actor: 'Support Officer', timestamp: '2026-05-27T10:00:00Z', note: 'Confirmed overcharge of UGX 300,000 — Ministry of Lands fee schedule mismatch', status: 'done' } as never,
      { stage: 'Approved', actor: 'Settlement Officer', timestamp: '2026-05-28T14:30:00Z', note: 'Refund of UGX 300,000 approved', status: 'done' } as never,
    ],
  },
]
```

- [ ] **Step 6: Write `src/data/mockCompliance.ts`**

```ts
import type { ComplianceAlert, BlacklistedAccount, AuditLogEntry } from '../types'

export const mockAlerts: ComplianceAlert[] = [
  { id: 'AML-001', type: 'High Volume', severity: 'critical', description: 'Single payer made 47 payments totaling UGX 8.4M in 2 hours', payer: 'Unknown Corp Ltd', triggeredAt: '2026-05-31T07:23:00Z', status: 'open', rule: 'VELOCITY_PAYER_2H_GT_40' },
  { id: 'AML-002', type: 'Repeated Failures', severity: 'high', description: 'Bank of Africa API returning 503 for all settlement calls — 89 transactions queued', participant: 'Bank of Africa', triggeredAt: '2026-05-31T06:00:00Z', status: 'investigating', rule: 'PARTICIPANT_DOWN_GT_60MIN' },
  { id: 'AML-003', type: 'Settlement Mismatch', severity: 'high', description: 'DFCU settlement batch discrepancy: switch total UGX 1.9B vs bank-reported UGX 1.87B (UGX 30M gap)', participant: 'DFCU Bank', triggeredAt: '2026-05-30T23:45:00Z', status: 'investigating', rule: 'SETTLEMENT_MISMATCH_GT_1PCT' },
  { id: 'AML-004', type: 'High Value Payment', severity: 'medium', description: 'Single UGX 45M payment to URA — exceeds automated clearance threshold', transactionId: 'TXN-2026-100511', triggeredAt: '2026-05-31T08:12:00Z', status: 'open', rule: 'HIGHVALUE_GT_40M' },
  { id: 'AML-005', type: 'Blacklist Match', severity: 'critical', description: 'Payment attempt from blacklisted account #BL-0042', payer: 'Kato Investment Holdings', triggeredAt: '2026-05-31T05:44:00Z', status: 'resolved', rule: 'BLACKLIST_MATCH' },
]

export const mockBlacklist: BlacklistedAccount[] = [
  { id: 'BL-0042', accountNumber: '0XX-XXXX-8821', name: 'Kato Investment Holdings', reason: 'Suspected tax fraud — under URA investigation', blacklistedAt: '2026-03-15T00:00:00Z', addedBy: 'Compliance Officer' },
  { id: 'BL-0038', accountNumber: '0XX-XXXX-4417', name: 'Sunrise Trading Ltd', reason: 'AML pattern — structuring below reporting threshold', blacklistedAt: '2026-02-28T00:00:00Z', addedBy: 'Bank of Uganda Operator' },
  { id: 'BL-0031', accountNumber: '0XX-XXXX-9903', name: 'Lagos Express Services', reason: 'Cross-border fund diversion — flagged by FIA', blacklistedAt: '2025-11-10T00:00:00Z', addedBy: 'Compliance Officer' },
]

export const mockAuditLog: AuditLogEntry[] = [
  { id: 'AUD-001', actor: 'Treasury Officer', role: 'Treasury Officer', action: 'APPROVED_SETTLEMENT', resource: 'BATCH-2026-0530-001', timestamp: '2026-05-30T16:30:00Z', ip: '196.43.X.X' },
  { id: 'AUD-002', actor: 'Compliance Officer', role: 'Compliance Officer', action: 'BLACKLISTED_ACCOUNT', resource: 'BL-0042', timestamp: '2026-03-15T09:00:00Z', ip: '196.43.X.X' },
  { id: 'AUD-003', actor: 'Super Admin', role: 'Super Admin', action: 'SUSPENDED_PARTICIPANT', resource: 'BOA', timestamp: '2026-05-20T11:24:00Z', ip: '196.43.X.X' },
  { id: 'AUD-004', actor: 'Settlement Officer', role: 'Settlement Officer', action: 'RERUN_SETTLEMENT', resource: 'BATCH-2026-0530-003', timestamp: '2026-05-31T08:05:00Z', ip: '196.43.X.X' },
]
```

- [ ] **Step 7: Write `src/data/mockRouting.ts`**

```ts
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
```

- [ ] **Step 8: Write `src/data/mockReports.ts`**

```ts
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
  { agency: 'URA',            revenue: 89_400_000_000, count: 420000 },
  { agency: 'MTN MoMo',       revenue: 38_400_000_000, count: 1140000 },
  { agency: 'Ministry of Lands', revenue: 10_500_000_000, count: 62000 },
  { agency: 'KCCA',           revenue: 5_500_000_000,  count: 48000 },
  { agency: 'NIRA',           revenue: 7_200_000_000,  count: 84000 },
  { agency: 'Ministry of Works', revenue: 7_900_000_000, count: 92000 },
  { agency: 'URSB',           revenue: 3_900_000_000,  count: 24000 },
  { agency: 'Immigration',    revenue: 3_400_000_000,  count: 18000 },
]

export const channelBreakdown: ChannelBreakdown[] = [
  { channel: 'MTN Mobile Money', count: 1140000, amount: 38_400_000_000 },
  { channel: 'Airtel Money',     count: 630000,  amount: 21_600_000_000 },
  { channel: 'Bank Transfer',    count: 48000,   amount: 28_800_000_000 },
  { channel: 'Visa/Mastercard',  count: 24000,   amount: 8_400_000_000 },
  { channel: 'USSD',             count: 72000,   amount: 1_440_000_000 },
]
```

- [ ] **Step 9: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/data/
git commit -m "feat: create all mock data files with realistic Ugandan data"
```

---

### Task 19: Build mock API service and live updates hook

**Files:**
- Create: `src/services/mockApi.ts`
- Create: `src/hooks/useLiveUpdates.ts`

- [ ] **Step 1: Write `src/services/mockApi.ts`**

```ts
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
    return { success: !!rule, rule, fallback: !rule ? mockRoutingRules[0] : null }
  },
  reorderRule: async (id: string, direction: 'up' | 'down') => { await delay(400); return { success: true, id, direction } },
}

export const reportsApi = {
  dailyVolume: async () => { await delay(500); return dailyVolumeStats },
  agencyRevenue: async () => { await delay(450); return agencyRevenue },
  channelBreakdown: async () => { await delay(400); return channelBreakdown },
}
```

- [ ] **Step 2: Write `src/hooks/useLiveUpdates.ts`**

```ts
import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { mockTransactions } from '../data/mockTransactions'
import { generateTxnId } from '../utils/format'
import type { Transaction } from '../types'

const CHANNELS = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer'] as const
const STATUSES = ['completed', 'completed', 'completed', 'failed', 'pending'] as const
const PAYERS = ['Mugisha Robert', 'Namutebi Grace', 'Okello James', 'Nakato Fatuma', 'Ssekandi Paul']
const AGENCIES = ['URA', 'NIRA', 'MOW', 'MOL', 'KCCA']

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateLiveTx(): Transaction {
  const base = mockTransactions[Math.floor(Math.random() * 100)]
  return {
    ...base,
    id: generateTxnId(),
    payer: randomItem(PAYERS),
    agency: randomItem(AGENCIES),
    channel: randomItem(CHANNELS),
    status: randomItem(STATUSES),
    amount: 10000 + Math.floor(Math.random() * 2000000),
    timestamp: new Date().toISOString(),
    processingTime: 100 + Math.floor(Math.random() * 600),
  }
}

export function useLiveUpdates() {
  const pushTransaction = useAppStore((s) => s.pushTransaction)

  useEffect(() => {
    // Seed with 20 recent transactions on mount
    for (let i = 0; i < 20; i++) {
      const tx = generateLiveTx()
      tx.timestamp = new Date(Date.now() - i * 12000).toISOString()
      pushTransaction(tx)
    }

    const id = setInterval(() => {
      if (document.visibilityState === 'hidden') return
      pushTransaction(generateLiveTx())
    }, 4000)

    return () => clearInterval(id)
  }, [pushTransaction])
}
```

- [ ] **Step 3: Mount `useLiveUpdates` in `AppShell`**

In `src/components/layout/AppShell.tsx`, add:
```tsx
import { useLiveUpdates } from '../../hooks/useLiveUpdates'

export function AppShell() {
  useLiveUpdates()  // Add this line inside the component body
  // ... rest of component
}
```

- [ ] **Step 4: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/services/ src/hooks/ src/components/layout/AppShell.tsx
git commit -m "feat: build mock API service and live updates hook"
```

---

## Phase 5: Module Implementation (Tasks 20–32)

---

### Task 20: Dashboard module

**Files:**
- Modify: `src/routes/app/dashboard.tsx`
- Create: `src/features/dashboard/TransactionFeed.tsx`
- Create: `src/features/dashboard/AlertStrip.tsx`

- [ ] **Step 1: Write `src/features/dashboard/TransactionFeed.tsx`**

```tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../../store/appStore'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { formatUGX, timeAgo } from '../../utils/format'

export function TransactionFeed() {
  const transactions = useAppStore((s) => s.liveTransactions)

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-slate-800">Live Transaction Feed</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {transactions.slice(0, 15).map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-700 truncate">{tx.id}</div>
                <div className="text-xs text-muted truncate">{tx.payer} · {tx.agency}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-xs font-semibold text-primary">{formatUGX(tx.amount)}</span>
                <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                <span className="text-xs text-muted w-14 text-right">{timeAgo(tx.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/features/dashboard/AlertStrip.tsx`**

```tsx
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { mockAlerts } from '../../data/mockCompliance'
import { Badge } from '../../components/ui/Badge'
import type { AlertSeverity } from '../../types'

const SEV_VARIANT: Record<AlertSeverity, 'danger' | 'warning' | 'muted'> = {
  critical: 'danger', high: 'danger', medium: 'warning', low: 'muted',
}

export function AlertStrip() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const active = mockAlerts.filter((a) => a.status !== 'resolved' && !dismissed.includes(a.id)).slice(0, 3)

  if (active.length === 0) return null

  return (
    <div className="space-y-2">
      {active.map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 bg-danger-light border border-danger/20 rounded-lg px-4 py-3">
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant={SEV_VARIANT[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
              <span className="text-xs font-semibold text-danger">{alert.type}</span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 truncate">{alert.description}</p>
          </div>
          <button onClick={() => setDismissed((d) => [...d, alert.id])} className="text-muted hover:text-slate-700 flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write full `src/routes/app/dashboard.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, AlertCircle, Clock, Users, Zap, DollarSign, CheckCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../components/ui/KPICard'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { TransactionFeed } from '../../features/dashboard/TransactionFeed'
import { AlertStrip } from '../../features/dashboard/AlertStrip'
import { transactionsApi } from '../../services/mockApi'
import { agencyRevenue, channelBreakdown } from '../../data/mockReports'
import { fadeInUp, staggerContainer } from '../../utils/animations'
import { formatUGX, formatNumber, formatPercent } from '../../utils/format'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: transactionsApi.todayStats,
    refetchInterval: 30_000,
  })

  const agencyBar = agencyRevenue.slice(0, 6).map((a) => ({ agency: a.agency, revenue: a.revenue / 1_000_000_000 }))
  const channelPie = channelBreakdown.map((c, i) => ({
    name: c.channel, value: c.count,
    color: ['#1B3A6B', '#F4B000', '#16A34A', '#D62828', '#64748B'][i],
  }))

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time national payment infrastructure overview"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-success bg-success-light px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            System Operational
          </div>
        }
      />

      <AlertStrip />

      {/* KPI Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />) : (
          <>
            <motion.div variants={fadeInUp}>
              <KPICard title="Transactions Today" value={stats!.count} subtitle={`${formatNumber(stats!.count)} payments processed`} icon={<Activity size={16} />} accent="primary" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Total Value" value={formatUGX(stats!.totalValue)} subtitle="UGX processed today" icon={<DollarSign size={16} />} accent="accent" animate={false} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Success Rate" value={formatPercent(stats!.successRate)} subtitle="Completed transactions" icon={<CheckCircle size={16} />} accent="success" animate={false} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Failed Transactions" value={stats!.failedCount} subtitle="Require attention" icon={<AlertCircle size={16} />} accent="danger" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Pending Settlements" value={stats!.pendingSettlements} subtitle="Awaiting approval" icon={<Clock size={16} />} accent="warning" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Active Participants" value={stats!.activeParticipants} subtitle="Banks, MNOs & agencies" icon={<Users size={16} />} accent="primary" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="System Uptime" value={`${stats!.uptime}%`} subtitle="Last 30 days" icon={<TrendingUp size={16} />} accent="success" animate={false} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Avg Processing" value={`${stats!.avgProcessingTime}ms`} subtitle="End-to-end latency" icon={<Zap size={16} />} accent="primary" animate={false} />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Charts + Feed */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-1">
          <TransactionFeed />
        </div>
        <div className="col-span-1 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Channel Breakdown</h3>
          <PieChart data={channelPie} donut />
        </div>
        <div className="col-span-1 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Agency Collections (UGX B)</h3>
          <BarChart data={agencyBar} xKey="agency" bars={[{ key: 'revenue', color: '#1B3A6B', name: 'Revenue (B UGX)' }]} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: TypeScript check and verify**

```bash
npx tsc --noEmit
npm run dev
```

Visit `/app/dashboard`. Should show 8 KPI cards loading then populating with animated counters, live transaction feed with real-time updates, two charts. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/routes/app/dashboard.tsx src/features/dashboard/
git commit -m "feat: implement Dashboard module with live KPIs and feed"
```

---

### Task 21: Payment Flow Simulator module

**Files:**
- Modify: `src/routes/app/simulator.tsx`
- Create: `src/features/simulator/FlowDiagram.tsx`
- Create: `src/features/simulator/SimulatorForm.tsx`

- [ ] **Step 1: Write `src/features/simulator/FlowDiagram.tsx`**

```tsx
import { motion } from 'framer-motion'
import clsx from 'clsx'

export type NodeState = 'idle' | 'active' | 'completed' | 'failed' | 'skipped'

export interface FlowNode {
  id: string
  label: string
  sublabel?: string
  state: NodeState
}

interface Props {
  nodes: FlowNode[]
}

const STATE_STYLES: Record<NodeState, string> = {
  idle:      'bg-surface border-border text-muted',
  active:    'bg-primary border-primary text-white shadow-lg scale-105',
  completed: 'bg-success border-success text-white',
  failed:    'bg-danger border-danger text-white',
  skipped:   'bg-surface border-border text-muted opacity-50',
}

export function FlowDiagram({ nodes }: Props) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center flex-shrink-0">
          <motion.div
            layout
            className={clsx(
              'border-2 rounded-xl px-4 py-3 text-center min-w-[110px] transition-all duration-300',
              STATE_STYLES[node.state]
            )}
            animate={node.state === 'active' ? { boxShadow: ['0 0 0 0 rgba(27,58,107,0)', '0 0 0 12px rgba(27,58,107,0.2)', '0 0 0 0 rgba(27,58,107,0)'] } : {}}
            transition={{ duration: 1.5, repeat: node.state === 'active' ? Infinity : 0 }}
          >
            <div className="text-xs font-bold leading-tight">{node.label}</div>
            {node.sublabel && <div className="text-[10px] mt-0.5 opacity-80">{node.sublabel}</div>}
          </motion.div>
          {i < nodes.length - 1 && (
            <div className={clsx(
              'w-8 h-0.5 flex-shrink-0 transition-colors duration-300',
              nodes[i + 1].state === 'completed' || nodes[i + 1].state === 'active' ? 'bg-primary' :
              nodes[i + 1].state === 'failed' ? 'bg-danger' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write full `src/routes/app/simulator.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { FlowDiagram, type FlowNode, type NodeState } from '../../features/simulator/FlowDiagram'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { mockAgencies } from '../../data/mockAgencies'
import { generateTxnId } from '../../utils/format'
import { formatUGX } from '../../utils/format'
import { Play, RotateCcw } from 'lucide-react'

type Scenario = 'success' | 'failed' | 'timeout' | 'reversal'

const SCENARIO_PATHS: Record<Scenario, (NodeState | 'skip')[]> = {
  success:  ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'],
  failed:   ['completed', 'completed', 'completed', 'failed',    'skipped',   'skipped',   'skipped',   'skipped',   'skipped',   'skipped'],
  timeout:  ['completed', 'completed', 'completed', 'completed', 'active',    'skipped',   'skipped',   'skipped',   'skipped',   'skipped'],
  reversal: ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'failed',    'completed', 'completed', 'completed'],
}

const NODE_LABELS = [
  { id: 'citizen',    label: 'Citizen / Business' },
  { id: 'portal',     label: 'Gov Service Portal' },
  { id: 'switch',     label: 'GovPay Switch' },
  { id: 'validation', label: 'Validation Engine' },
  { id: 'routing',    label: 'Routing Engine' },
  { id: 'channel',    label: 'Bank / MoMo / Card' },
  { id: 'confirm',    label: 'Confirmation' },
  { id: 'agency',     label: 'Gov Agency' },
  { id: 'treasury',   label: 'Treasury' },
  { id: 'settlement', label: 'Settlement & Recon' },
]

function buildNodes(step: number, scenario: Scenario): FlowNode[] {
  const path = SCENARIO_PATHS[scenario]
  return NODE_LABELS.map((n, i) => ({
    ...n,
    state: i < step ? (path[i] as NodeState) : i === step ? 'active' : 'idle',
  }))
}

export default function SimulatorPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(-1)
  const [scenario, setScenario] = useState<Scenario>('success')
  const [running, setRunning] = useState(false)
  const [txnId, setTxnId] = useState('')
  const [amount, setAmount] = useState('250000')
  const [payer, setPayer] = useState('Mugisha Robert')
  const [agency, setAgency] = useState('URA')
  const [channel, setChannel] = useState('MTN Mobile Money')

  const nodes = step >= 0 ? buildNodes(step, scenario) : NODE_LABELS.map((n) => ({ ...n, state: 'idle' as NodeState }))

  const simulate = useCallback(async () => {
    if (running) return
    setRunning(true)
    setStep(0)
    const id = generateTxnId()
    setTxnId(id)

    const maxStep = scenario === 'failed' ? 4 : scenario === 'timeout' ? 5 : 10

    for (let i = 1; i <= maxStep; i++) {
      await new Promise((res) => setTimeout(res, 600))
      setStep(i)
    }

    setRunning(false)
    if (scenario === 'success') addToast(`Transaction ${id} completed successfully`, 'success')
    else if (scenario === 'failed') addToast(`Transaction ${id} failed at validation`, 'error')
    else if (scenario === 'timeout') addToast(`Transaction ${id} timed out — routing engine`, 'warning')
    else addToast(`Transaction ${id} reversed successfully`, 'info')
  }, [running, scenario, addToast])

  function reset() {
    setStep(-1)
    setRunning(false)
    setTxnId('')
  }

  const finalNode = step >= 0 ? nodes[Math.min(step - 1, nodes.length - 1)] : null
  const isDone = !running && step > 0

  return (
    <div>
      <PageHeader title="Payment Flow Simulator" subtitle="Animate a payment through the GovPay Switch end-to-end" />

      {/* Scenario selector */}
      <div className="flex gap-2 mb-6">
        {(['success', 'failed', 'timeout', 'reversal'] as Scenario[]).map((s) => (
          <button
            key={s}
            onClick={() => { setScenario(s); reset() }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${scenario === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:text-slate-800'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Flow diagram */}
      <div className="bg-card rounded-card shadow-card p-6 mb-4 overflow-x-auto">
        <FlowDiagram nodes={nodes} />
      </div>

      {/* Transaction info + result */}
      {txnId && (
        <div className="bg-card rounded-card shadow-card p-4 mb-4 flex items-center gap-6 text-sm">
          <div><span className="text-muted">ID:</span> <span className="font-mono font-medium">{txnId}</span></div>
          <div><span className="text-muted">Amount:</span> <span className="font-semibold">{formatUGX(Number(amount))}</span></div>
          <div><span className="text-muted">Payer:</span> <span>{payer}</span></div>
          <div><span className="text-muted">Channel:</span> <span>{channel}</span></div>
          {isDone && finalNode && (
            <div className="ml-auto">
              <Badge variant={statusVariant(finalNode.state)}>{finalNode.state.toUpperCase()}</Badge>
            </div>
          )}
        </div>
      )}

      {/* Form + controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Payer Name</label>
              <input value={payer} onChange={(e) => setPayer(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Amount (UGX)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Agency</label>
              <select value={agency} onChange={(e) => setAgency(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 bg-white">
                {mockAgencies.map((a) => <option key={a.id}>{a.shortName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Payment Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 bg-white">
                {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Simulate</h3>
          <button
            onClick={simulate}
            disabled={running}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            <Play size={16} />
            {running ? 'Simulating...' : 'Simulate Payment'}
          </button>
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-border text-muted rounded-xl text-sm hover:text-slate-800 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <div className="mt-2 text-xs text-muted space-y-1">
            <p><span className="font-medium">Success</span> — full path completes</p>
            <p><span className="font-medium">Failed</span> — fails at validation</p>
            <p><span className="font-medium">Timeout</span> — hangs at routing</p>
            <p><span className="font-medium">Reversal</span> — confirms then reverses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check, verify, and commit**

```bash
npx tsc --noEmit
npm run dev
```

Visit `/app/simulator`. Select "Failed" scenario, fill in the form, click "Simulate Payment" — nodes should light up in sequence then turn red at node 4. Stop server.

```bash
git add src/routes/app/simulator.tsx src/features/simulator/
git commit -m "feat: implement Payment Flow Simulator with animated scenarios"
```

---

### Task 22: Collections module

**Files:**
- Modify: `src/routes/app/collections.tsx`

- [ ] **Step 1: Write full `src/routes/app/collections.tsx`**

```tsx
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Stepper } from '../../components/ui/Stepper'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { mockAgencies } from '../../data/mockAgencies'
import { useAppStore } from '../../store/appStore'
import { formatUGX, generatePRN, generateTxnId } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, scaleIn } from '../../utils/animations'
import { CheckCircle, Printer, RotateCcw } from 'lucide-react'
import type { Agency, AgencyService } from '../../types'

const STEPS = [
  { label: 'Select Service' },
  { label: 'Review Invoice' },
  { label: 'Pay & Confirm' },
]

const CHANNELS = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard']
const LIFECYCLE = ['Invoice Generated', 'Payment Initiated', 'Bank/MoMo Processing', 'Confirmation Received', 'Agency Notified']

export default function CollectionsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(0)
  const [agency, setAgency] = useState<Agency>(mockAgencies[0])
  const [service, setService] = useState<AgencyService>(mockAgencies[0].services[0])
  const [channel, setChannel] = useState(CHANNELS[0])
  const [prn, setPrn] = useState('')
  const [txnId, setTxnId] = useState('')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  const [lifecycleStage, setLifecycleStage] = useState(0)

  function handleAgencyChange(id: string) {
    const a = mockAgencies.find((ag) => ag.id === id)!
    setAgency(a)
    setService(a.services[0])
  }

  function handleGeneratePRN() {
    setPrn(generatePRN())
    setStep(1)
  }

  async function handlePay() {
    setPaying(true)
    const id = generateTxnId()
    setTxnId(id)
    setStep(2)
    for (let i = 0; i <= 4; i++) {
      await new Promise((r) => setTimeout(r, 600))
      setLifecycleStage(i)
    }
    setPaying(false)
    setDone(true)
    addToast(`Payment ${id} confirmed successfully`, 'success')
  }

  function reset() {
    setStep(0); setPrn(''); setTxnId(''); setDone(false); setPaying(false); setLifecycleStage(0)
  }

  return (
    <div>
      <PageHeader title="Government Collections" subtitle="Pay for government services across all agencies" />

      <div className="mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Select agency + service */}
        {step === 0 && (
          <motion.div key="step0" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Agency</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mockAgencies.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleAgencyChange(a.id)}
                      className={`text-left p-3 rounded-lg border-2 text-sm transition-colors
                        ${agency.id === a.id ? 'border-primary bg-primary-50 text-primary' : 'border-border hover:border-primary/30'}`}
                    >
                      <div className="font-semibold">{a.shortName}</div>
                      <div className="text-xs text-muted mt-0.5">{a.type}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Service — {agency.shortName}</h3>
                <div className="space-y-2 mb-4">
                  {agency.services.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setService(svc)}
                      className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-colors
                        ${service.id === svc.id ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{svc.name}</span>
                        <span className="text-primary font-semibold">{formatUGX(svc.fee)}</span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">{svc.description}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGeneratePRN}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Invoice preview */}
        {step === 1 && (
          <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-card shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">Invoice Preview</h3>
                  <Badge variant="warning">Pending Payment</Badge>
                </div>
                <div className="border border-border rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted">PRN</span><span className="font-mono font-medium">{prn}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Agency</span><span>{agency.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Service</span><span>{service.name}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between font-semibold">
                    <span>Total Due</span>
                    <span className="text-primary text-lg">{formatUGX(service.fee)}</span>
                  </div>
                </div>
                <button onClick={reset} className="mt-3 text-xs text-muted hover:text-slate-700">← Back</button>
              </div>
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Payment Channel</h3>
                <div className="space-y-2 mb-4">
                  {CHANNELS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-colors
                        ${channel === c ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePay}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
                >
                  Pay {formatUGX(service.fee)} via {channel}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Processing + success */}
        {step === 2 && (
          <motion.div key="step2" variants={scaleIn} initial="hidden" animate="visible">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-card shadow-card p-6 text-center">
                {done ? (
                  <>
                    <CheckCircle size={48} className="text-success mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Confirmed!</h3>
                    <p className="text-sm text-muted mb-4">Transaction ID: <span className="font-mono font-medium">{txnId}</span></p>
                    <div className="bg-surface rounded-lg p-4 text-sm text-left space-y-2 mb-4">
                      <div className="flex justify-between"><span className="text-muted">Agency</span><span>{agency.shortName}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Service</span><span>{service.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold">{formatUGX(service.fee)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Channel</span><span>{channel}</span></div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm text-muted hover:text-slate-800 transition-colors" onClick={() => window.print()}>
                        <Printer size={14} /> Print Receipt
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors" onClick={reset}>
                        <RotateCcw size={14} /> New Payment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700">Processing payment via {channel}...</p>
                  </>
                )}
              </div>
              <div className="bg-card rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Lifecycle</h3>
                <div className="space-y-3">
                  {LIFECYCLE.map((stage, i) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${i <= lifecycleStage ? 'bg-success border-success' : 'bg-surface border-border'}`} />
                      <span className={`text-sm ${i <= lifecycleStage ? 'text-slate-800 font-medium' : 'text-muted'}`}>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check, verify, and commit**

```bash
npx tsc --noEmit
git add src/routes/app/collections.tsx
git commit -m "feat: implement Collections module with 3-step stepper and receipt"
```

---

### Task 23: Payment Routing module

**Files:**
- Modify: `src/routes/app/routing.tsx`

- [ ] **Step 1: Write full `src/routes/app/routing.tsx`**

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { routingApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatPercent } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ChevronUp, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import type { RoutingRule, ChannelHealth } from '../../types'
import clsx from 'clsx'

type RouteState = 'idle' | 'primary' | 'fallback' | 'failed' | 'success'

export default function RoutingPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [routeState, setRouteState] = useState<RouteState>('idle')
  const [testAmount, setTestAmount] = useState('500000')
  const [testChannel, setTestChannel] = useState('MTN Mobile Money')

  const { data: rules = [], isLoading: rulesLoading } = useQuery({ queryKey: ['routing-rules'], queryFn: routingApi.listRules })
  const { data: health = [], isLoading: healthLoading } = useQuery({ queryKey: ['channel-health'], queryFn: routingApi.listChannelHealth })

  const { mutate: testRoute, isPending: testing } = useMutation({
    mutationFn: () => routingApi.testRoute(Number(testAmount), testChannel),
    onMutate: () => setRouteState('primary'),
    onSuccess: (result) => {
      setRouteState(result.success ? 'success' : result.fallback ? 'fallback' : 'failed')
      if (result.success) addToast('Route successful via primary channel', 'success')
      else if (result.fallback) addToast('Primary failed — routed via fallback', 'warning')
      else addToast('All routes failed', 'error')
    },
  })

  const healthStatusColor = (status: ChannelHealth['status']) =>
    status === 'healthy' ? 'text-success' : status === 'degraded' ? 'text-warning' : 'text-danger'

  const routeColors: Record<RouteState, string> = {
    idle:     'bg-surface border-border text-muted',
    primary:  'bg-primary border-primary text-white animate-pulse',
    fallback: 'bg-warning/10 border-warning text-warning',
    failed:   'bg-danger-light border-danger text-danger',
    success:  'bg-success-light border-success text-success',
  }

  return (
    <div>
      <PageHeader title="Payment Routing" subtitle="Channel availability, routing rules, and fallback configuration" />

      <div className="grid grid-cols-3 gap-4">
        {/* Rules table */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Routing Rules</h3>
          <DataTable<RoutingRule & Record<string, unknown>>
            columns={[
              { key: 'priority', header: 'Priority', sortable: true, width: 'w-16',
                render: (r) => <span className="text-xs font-bold text-primary">#{r.priority}</span> },
              { key: 'channel', header: 'Channel', sortable: true },
              { key: 'participant', header: 'Participant' },
              { key: 'fee', header: 'Fee',
                render: (r) => r.feeType === 'flat' ? formatUGX(r.fee as number) : `${r.fee}%` },
              { key: 'status', header: 'Status',
                render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
            ]}
            data={rules as (RoutingRule & Record<string, unknown>)[]}
            keyField="id"
            loading={rulesLoading}
          />
        </div>

        {/* Route test + channel health */}
        <div className="space-y-4">
          {/* Route visualizer */}
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Route Visualizer</h3>
            <div className="flex flex-col items-center gap-1 mb-4">
              {[
                { label: 'Payer', sub: 'Initiates payment' },
                { label: 'GovPay Switch', sub: 'Routing engine' },
                { label: testChannel, sub: routeState === 'idle' ? 'Waiting' : routeState === 'success' ? 'Confirmed' : routeState === 'failed' ? 'Failed' : 'Processing...' },
                { label: 'Government Agency', sub: 'Receives confirmation' },
              ].map((node, i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className={clsx(
                    'w-full text-center px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-500',
                    i === 2 ? routeColors[routeState] : 'bg-surface border-border text-slate-700'
                  )}>
                    <div className="font-semibold">{node.label}</div>
                    <div className="text-[10px] opacity-70">{node.sub}</div>
                  </div>
                  {i < 3 && <ArrowDown size={14} className="text-muted my-1" />}
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Amount (UGX)</label>
                <input type="number" value={testAmount} onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Channel</label>
                <select value={testChannel} onChange={(e) => { setTestChannel(e.target.value); setRouteState('idle') }}
                  className="w-full border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 bg-white">
                  {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'DFCU Bank'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => testRoute()}
              disabled={testing}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60"
            >
              {testing ? 'Testing...' : 'Test Route'}
            </button>
          </div>

          {/* Channel health */}
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Channel Health</h3>
            <div className="space-y-2">
              {healthLoading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)
                : health.map((h) => (
                  <div key={h.participant} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      {h.status === 'down' ? <WifiOff size={14} className={healthStatusColor(h.status)} /> : <Wifi size={14} className={healthStatusColor(h.status)} />}
                      <span className="text-xs font-medium">{h.participant.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${healthStatusColor(h.status)}`}>{h.status}</div>
                      {h.status !== 'down' && <div className="text-[10px] text-muted">{h.latency}ms</div>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/routing.tsx
git commit -m "feat: implement Payment Routing module with route visualizer"
```

---

### Task 24: Participant Management module

**Files:**
- Modify: `src/routes/app/participants.tsx`
- Create: `src/features/participants/ParticipantDrawer.tsx`

- [ ] **Step 1: Write `src/features/participants/ParticipantDrawer.tsx`**

```tsx
import { Drawer } from '../../components/ui/Drawer'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { participantsApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatNumber } from '../../utils/format'
import { LineChart } from '../../components/charts/LineChart'
import type { Participant } from '../../types'
import { ShieldOff, ShieldCheck, Key } from 'lucide-react'

interface Props {
  participant: Participant | null
  onClose: () => void
}

export function ParticipantDrawer({ participant, onClose }: Props) {
  const addToast = useAppStore((s) => s.addToast)
  const qc = useQueryClient()
  const [apiKeyModal, setApiKeyModal] = useState(false)

  const { mutate: suspend } = useMutation({
    mutationFn: (id: string) => participantsApi.suspend(id),
    onSuccess: () => { addToast(`${participant?.name} suspended`, 'warning'); qc.invalidateQueries({ queryKey: ['participants'] }); onClose() },
  })

  const { mutate: activate } = useMutation({
    mutationFn: (id: string) => participantsApi.activate(id),
    onSuccess: () => { addToast(`${participant?.name} activated`, 'success'); qc.invalidateQueries({ queryKey: ['participants'] }); onClose() },
  })

  if (!participant) return null

  const healthData = participant.apiHealthHistory.map((v, i) => ({ day: `D-${6 - i}`, latency: v }))

  return (
    <>
      <Drawer open={!!participant} onClose={onClose} title={participant.name} subtitle={`${participant.type} · ${participant.id}`}>
        <div className="space-y-5">
          {/* Status row */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={statusVariant(participant.status)}>{participant.status}</Badge>
            <Badge variant={statusVariant(participant.apiHealth)}>API: {participant.apiHealth}</Badge>
            <Badge variant={statusVariant(participant.riskRating)}>Risk: {participant.riskRating}</Badge>
            <Badge variant={statusVariant(participant.slaStatus)}>SLA: {participant.slaStatus}</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">Daily Volume</div>
              <div className="text-sm font-bold text-primary">{formatUGX(participant.dailyVolume)}</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">Daily Count</div>
              <div className="text-sm font-bold text-primary">{formatNumber(participant.dailyCount)}</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">API Latency</div>
              <div className="text-sm font-bold">{participant.apiLatency}ms</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">Settlement Account</div>
              <div className="text-xs font-mono mt-0.5">{participant.settlementAccount}</div>
            </div>
          </div>

          {/* API health chart */}
          <div>
            <div className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">API Latency — Last 7 Days (ms)</div>
            <LineChart data={healthData} xKey="day" lines={[{ key: 'latency', color: '#1B3A6B', name: 'Latency (ms)' }]} height={140} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {participant.status === 'active'
              ? <button onClick={() => suspend(participant.id)} className="flex items-center gap-2 w-full py-2.5 border border-danger text-danger rounded-lg text-sm font-medium hover:bg-danger-light transition-colors justify-center">
                  <ShieldOff size={14} /> Suspend Participant
                </button>
              : <button onClick={() => activate(participant.id)} className="flex items-center gap-2 w-full py-2.5 bg-success text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors justify-center">
                  <ShieldCheck size={14} /> Activate Participant
                </button>
            }
            <button onClick={() => setApiKeyModal(true)} className="flex items-center gap-2 w-full py-2.5 border border-border text-slate-700 rounded-lg text-sm font-medium hover:bg-surface transition-colors justify-center">
              <Key size={14} /> View API Keys
            </button>
          </div>
        </div>
      </Drawer>

      <Modal open={apiKeyModal} onClose={() => setApiKeyModal(false)} title="API Key Management"
        footer={
          <button onClick={() => { setApiKeyModal(false); addToast('New API key generated', 'success') }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
            Regenerate Key
          </button>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-xs text-muted mb-1">Live API Key</div>
            <div className="font-mono bg-surface border border-border rounded px-3 py-2 text-xs">gps_live_{'*'.repeat(32)}{participant.id.slice(0, 4)}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Sandbox API Key</div>
            <div className="font-mono bg-surface border border-border rounded px-3 py-2 text-xs">gps_test_{'*'.repeat(32)}{participant.id.slice(0, 4)}</div>
          </div>
          <p className="text-xs text-muted">Regenerating invalidates the current key immediately. Ensure the participant has been notified.</p>
        </div>
      </Modal>
    </>
  )
}
```

- [ ] **Step 2: Write full `src/routes/app/participants.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { ParticipantDrawer } from '../../features/participants/ParticipantDrawer'
import { participantsApi } from '../../services/mockApi'
import { formatUGX } from '../../utils/format'
import type { Participant } from '../../types'
import { Wifi, WifiOff } from 'lucide-react'

export default function ParticipantsPage() {
  const [selected, setSelected] = useState<Participant | null>(null)
  const { data = [], isLoading } = useQuery({ queryKey: ['participants'], queryFn: participantsApi.list })

  return (
    <div>
      <PageHeader title="Participant Management" subtitle="Banks, mobile money operators, agencies, and aggregators" />
      <DataTable<Participant & Record<string, unknown>>
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'type', header: 'Type', sortable: true, render: (r) => <Badge variant="info">{r.type as string}</Badge> },
          { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
          { key: 'apiHealth', header: 'API Health', render: (r) => (
            <div className="flex items-center gap-1.5">
              {r.apiHealth === 'down' ? <WifiOff size={13} className="text-danger" /> : <Wifi size={13} className={r.apiHealth === 'healthy' ? 'text-success' : 'text-warning'} />}
              <Badge variant={statusVariant(r.apiHealth as string)}>{r.apiHealth as string}</Badge>
              {r.apiHealth !== 'down' && <span className="text-xs text-muted">{r.apiLatency as number}ms</span>}
            </div>
          )},
          { key: 'dailyVolume', header: 'Daily Volume', sortable: true, render: (r) => formatUGX(r.dailyVolume as number) },
          { key: 'slaStatus', header: 'SLA', render: (r) => <Badge variant={statusVariant(r.slaStatus as string)}>{r.slaStatus as string}</Badge> },
          { key: 'riskRating', header: 'Risk', render: (r) => <Badge variant={statusVariant(r.riskRating as string)}>{r.riskRating as string}</Badge> },
        ]}
        data={data as (Participant & Record<string, unknown>)[]}
        keyField="id"
        loading={isLoading}
        onRowClick={(row) => setSelected(row as unknown as Participant)}
      />
      <ParticipantDrawer participant={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/participants.tsx src/features/participants/
git commit -m "feat: implement Participant Management with drawer and API key modal"
```

---

### Task 25: Settlement module

**Files:**
- Modify: `src/routes/app/settlement.tsx`

- [ ] **Step 1: Write full `src/routes/app/settlement.tsx`**

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../components/ui/KPICard'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { settlementsApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatDate } from '../../utils/format'
import type { SettlementBatch } from '../../types'
import { Download, CheckCircle, XCircle, RotateCcw, Banknote } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '../../utils/animations'

const PIPELINE_STAGES = ['Batch Created', 'Validation', 'Netting', 'Approval', 'Settlement Complete']

function downloadCSV(batches: SettlementBatch[]) {
  const header = 'Batch ID,Date,Participant,Gross Amount,Net Amount,Transactions,Status\n'
  const rows = batches.map((b) =>
    `${b.id},${b.batchDate},${b.participant},${b.grossAmount},${b.netAmount},${b.transactionCount},${b.status}`
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'settlement-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function SettlementPage() {
  const addToast = useAppStore((s) => s.addToast)
  const qc = useQueryClient()
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null)
  const [pipelineStep, setPipelineStep] = useState(4)

  const { data: batches = [], isLoading } = useQuery({ queryKey: ['settlement-batches'], queryFn: settlementsApi.listBatches })
  const { data: accounts = [] } = useQuery({ queryKey: ['settlement-accounts'], queryFn: settlementsApi.listAccounts })

  const { mutate: approve } = useMutation({
    mutationFn: (id: string) => settlementsApi.approve(id),
    onSuccess: () => { addToast('Settlement batch approved', 'success'); qc.invalidateQueries({ queryKey: ['settlement-batches'] }); setSelectedBatch(null) },
  })
  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => settlementsApi.reject(id),
    onSuccess: () => { addToast('Settlement batch rejected', 'error'); qc.invalidateQueries({ queryKey: ['settlement-batches'] }); setSelectedBatch(null) },
  })
  const { mutate: rerun } = useMutation({
    mutationFn: (id: string) => settlementsApi.rerun(id),
    onSuccess: () => { addToast('Settlement batch requeued for processing', 'info'); qc.invalidateQueries({ queryKey: ['settlement-batches'] }); setSelectedBatch(null) },
  })

  const pending = batches.filter((b) => b.status === 'pending')
  const completed = batches.filter((b) => b.status === 'completed')
  const failed = batches.filter((b) => b.status === 'failed')
  const totalPending = pending.reduce((s, b) => s + b.netAmount, 0)
  const totalCompleted = completed.reduce((s, b) => s + b.netAmount, 0)

  return (
    <div>
      <PageHeader
        title="Settlement"
        subtitle="Batch settlement management and treasury account positions"
        actions={
          <button
            onClick={() => downloadCSV(batches)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* KPIs */}
      <motion.div className="grid grid-cols-4 gap-4 mb-5" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={fadeInUp}><KPICard title="Pending Value" value={formatUGX(totalPending)} accent="warning" animate={false} icon={<Banknote size={16} />} /></motion.div>
        <motion.div variants={fadeInUp}><KPICard title="Completed Today" value={completed.length} accent="success" /></motion.div>
        <motion.div variants={fadeInUp}><KPICard title="Failed Batches" value={failed.length} accent="danger" /></motion.div>
        <motion.div variants={fadeInUp}><KPICard title="Net Position (Today)" value={formatUGX(totalCompleted)} accent="primary" animate={false} /></motion.div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {/* Batch table */}
        <div className="col-span-2">
          <DataTable<SettlementBatch & Record<string, unknown>>
            columns={[
              { key: 'id', header: 'Batch ID', render: (r) => <span className="font-mono text-xs">{r.id as string}</span> },
              { key: 'participant', header: 'Participant', sortable: true },
              { key: 'netAmount', header: 'Net Amount', sortable: true, render: (r) => formatUGX(r.netAmount as number) },
              { key: 'transactionCount', header: 'Txns', sortable: true },
              { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
              { key: 'batchDate', header: 'Date', render: (r) => formatDate(r.batchDate as string) },
            ]}
            data={batches as (SettlementBatch & Record<string, unknown>)[]}
            keyField="id"
            loading={isLoading}
            onRowClick={(row) => setSelectedBatch(row as unknown as SettlementBatch)}
          />
        </div>

        {/* Pipeline + accounts */}
        <div className="space-y-4">
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Settlement Pipeline</h3>
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < pipelineStep ? 'bg-success text-white' : i === pipelineStep ? 'bg-primary text-white animate-pulse' : 'bg-surface border border-border text-muted'}`}>
                  {i < pipelineStep ? '✓' : i + 1}
                </div>
                <div>
                  <div className={`text-xs font-medium ${i <= pipelineStep ? 'text-slate-800' : 'text-muted'}`}>{stage}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Account Positions</h3>
            {accounts.map((acc) => (
              <div key={acc.accountNumber} className="py-2 border-b border-border last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium">{acc.participant}</div>
                    <div className="text-[10px] text-muted font-mono">{acc.accountNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-primary">{formatUGX(acc.balance)}</div>
                    {acc.pendingInflow > 0 && <div className="text-[10px] text-success">+{formatUGX(acc.pendingInflow)}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batch action modal */}
      <Modal
        open={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        title={`Batch: ${selectedBatch?.id}`}
        footer={
          <div className="flex gap-2 w-full">
            {selectedBatch?.status === 'pending' && (
              <>
                <button onClick={() => reject(selectedBatch.id)} className="flex items-center gap-1.5 px-3 py-2 border border-danger text-danger rounded-lg text-sm hover:bg-danger-light transition-colors">
                  <XCircle size={14} /> Reject
                </button>
                <button onClick={() => approve(selectedBatch.id)} className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors ml-auto">
                  <CheckCircle size={14} /> Approve
                </button>
              </>
            )}
            {selectedBatch?.status === 'failed' && (
              <button onClick={() => rerun(selectedBatch.id)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors ml-auto">
                <RotateCcw size={14} /> Re-run Settlement
              </button>
            )}
          </div>
        }
      >
        {selectedBatch && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Participant</span><span className="font-medium">{selectedBatch.participant}</span></div>
            <div className="flex justify-between"><span className="text-muted">Gross Amount</span><span>{formatUGX(selectedBatch.grossAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Net Amount</span><span className="font-bold text-primary">{formatUGX(selectedBatch.netAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Transactions</span><span>{selectedBatch.transactionCount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted">Status</span><Badge variant={statusVariant(selectedBatch.status)}>{selectedBatch.status}</Badge></div>
            {selectedBatch.failureReason && <div className="bg-danger-light text-danger text-xs p-3 rounded-lg">{selectedBatch.failureReason}</div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/settlement.tsx
git commit -m "feat: implement Settlement module with batch approvals and CSV export"
```

---

### Task 26: Reconciliation module

**Files:**
- Modify: `src/routes/app/reconciliation.tsx`

- [ ] **Step 1: Write full `src/routes/app/reconciliation.tsx`**

```tsx
import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../components/ui/PageHeader'
import { PieChart } from '../../components/charts/PieChart'
import { LineChart } from '../../components/charts/LineChart'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { mockTransactions } from '../../data/mockTransactions'
import { formatUGX, formatDate } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, CheckCircle, AlertCircle } from 'lucide-react'

const MATCH_RATE_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  matched: 96 + Math.random() * 3,
  unmatched: 0.5 + Math.random() * 2,
}))

const SCORE = 97.4

export default function ReconciliationPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [resolveModal, setResolveModal] = useState(false)
  const [selectedException, setSelectedException] = useState<(typeof matchedTx)[0] | null>(null)
  const [note, setNote] = useState('')

  const matchedTx = mockTransactions.filter((t) => t.status === 'completed').slice(0, 20)
  const unmatchedTx = mockTransactions.filter((t) => t.status === 'failed').slice(0, 8)
  const exceptions = mockTransactions.filter((t) => t.status === 'pending').slice(0, 5)

  async function runRecon() {
    setRunning(true)
    await new Promise((r) => setTimeout(r, 2500))
    setRunning(false)
    setRan(true)
    addToast('Reconciliation complete — 97.4% match rate', 'success')
  }

  const piData = [
    { name: 'Matched', value: 97.4, color: '#16A34A' },
    { name: 'Unmatched', value: 1.8, color: '#D62828' },
    { name: 'Exceptions', value: 0.8, color: '#D97706' },
  ]

  return (
    <div>
      <PageHeader
        title="Reconciliation"
        subtitle="Match payment records across switch, bank, and agency systems"
        actions={
          <button
            onClick={runRecon}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            {running ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlayCircle size={16} />}
            {running ? 'Running Reconciliation...' : 'Run Reconciliation'}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-card rounded-card shadow-card p-4 flex flex-col items-center">
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Reconciliation Score</div>
          <PieChart data={piData} height={160} donut />
          <div className="text-3xl font-bold text-primary mt-1">{SCORE}%</div>
          <div className="text-xs text-muted">Match rate</div>
        </div>
        <div className="col-span-2 bg-card rounded-card shadow-card p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Match Rate — Last 14 Days</div>
          <LineChart data={MATCH_RATE_DATA} xKey="day" lines={[
            { key: 'matched', color: '#16A34A', name: 'Matched %' },
            { key: 'unmatched', color: '#D62828', name: 'Unmatched %' },
          ]} height={180} />
        </div>
      </div>

      <Tabs.Root defaultValue="matched">
        <Tabs.List className="flex gap-1 bg-surface p-1 rounded-lg mb-4 w-fit">
          {[
            { value: 'matched', label: `Matched (${matchedTx.length})` },
            { value: 'unmatched', label: `Unmatched (${unmatchedTx.length})` },
            { value: 'exceptions', label: `Exceptions (${exceptions.length})` },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-1.5 text-sm rounded-md text-muted data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:font-semibold transition-all"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="matched">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['ID', 'Payer', 'Agency', 'Amount', 'Status'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matchedTx.map((t) => (
                  <tr key={t.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-2.5">{t.payer}</td>
                    <td className="px-4 py-2.5">{t.agency}</td>
                    <td className="px-4 py-2.5 font-semibold">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-2.5"><Badge variant="success"><CheckCircle size={10} className="inline mr-1" />Matched</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        <Tabs.Content value="unmatched">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['ID', 'Payer', 'Agency', 'Amount', 'Reason'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {unmatchedTx.map((t) => (
                  <tr key={t.id} className="hover:bg-danger-light/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-2.5">{t.payer}</td>
                    <td className="px-4 py-2.5">{t.agency}</td>
                    <td className="px-4 py-2.5 font-semibold">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-2.5 text-danger text-xs">{t.failureReason ?? 'No agency confirmation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        <Tabs.Content value="exceptions">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['ID', 'Payer', 'Amount', 'Type', 'Action'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exceptions.map((t) => (
                  <tr key={t.id} className="hover:bg-warning/5">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-2.5">{t.payer}</td>
                    <td className="px-4 py-2.5">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-2.5"><Badge variant="warning">Pending Confirmation</Badge></td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => { setSelectedException(t); setResolveModal(true) }}
                        className="text-xs text-primary underline hover:text-primary-light"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Modal
        open={resolveModal}
        onClose={() => setResolveModal(false)}
        title="Resolve Exception"
        footer={
          <button
            onClick={() => { setResolveModal(false); addToast('Exception resolved manually', 'success') }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
          >
            Save Resolution
          </button>
        }
      >
        {selectedException && (
          <div className="space-y-4 text-sm">
            <div className="bg-surface rounded-lg p-3 space-y-1">
              <div className="flex justify-between"><span className="text-muted">Transaction</span><span className="font-mono">{selectedException.id}</span></div>
              <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold">{formatUGX(selectedException.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Payer</span><span>{selectedException.payer}</span></div>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Resolution Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
                placeholder="Describe how this exception was resolved..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/reconciliation.tsx
git commit -m "feat: implement Reconciliation module with animated recon run"
```

---

### Task 27: Compliance & Risk module

**Files:**
- Modify: `src/routes/app/compliance.tsx`

- [ ] **Step 1: Write full `src/routes/app/compliance.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Drawer } from '../../components/ui/Drawer'
import { AreaChart } from '../../components/charts/AreaChart'
import { complianceApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatDateTime } from '../../utils/format'
import { AlertTriangle, ShieldX, Search } from 'lucide-react'
import type { ComplianceAlert, AlertSeverity } from '../../types'
import clsx from 'clsx'

const SEV_COLOR: Record<AlertSeverity, string> = {
  critical: 'border-l-danger bg-danger-light/40',
  high:     'border-l-danger/60 bg-danger-light/20',
  medium:   'border-l-warning bg-warning-light/40',
  low:      'border-l-muted bg-surface',
}

const VELOCITY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  volume: 8000 + Math.floor(Math.random() * 12000),
  threshold: 15000,
}))

export default function CompliancePage() {
  const addToast = useAppStore((s) => s.addToast)
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null)
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all')

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({ queryKey: ['compliance-alerts'], queryFn: complianceApi.listAlerts })
  const { data: blacklist = [] } = useQuery({ queryKey: ['blacklist'], queryFn: complianceApi.listBlacklist })
  const { data: auditLog = [] } = useQuery({ queryKey: ['audit-log'], queryFn: complianceApi.listAuditLog })

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div>
      <PageHeader title="Compliance & Risk" subtitle="AML monitoring, transaction velocity, blacklists, and audit trail" />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Alert feed */}
        <div className="col-span-1 bg-card rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">AML Alerts</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AlertSeverity | 'all')}
              className="text-xs border border-border rounded px-2 py-1 bg-white outline-none"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((alert) => (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={clsx('w-full text-left p-3 rounded-lg border-l-4 text-sm transition-all hover:shadow-md', SEV_COLOR[alert.severity])}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} className="text-danger flex-shrink-0" />
                  <span className="font-semibold text-xs uppercase tracking-wide text-danger">{alert.severity}</span>
                  <Badge variant={statusVariant(alert.status)} className="ml-auto">{alert.status}</Badge>
                </div>
                <div className="text-xs font-medium text-slate-800">{alert.type}</div>
                <div className="text-[10px] text-muted mt-0.5 line-clamp-2">{alert.description}</div>
                <div className="text-[10px] text-muted mt-1">{formatDateTime(alert.triggeredAt)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Velocity chart */}
        <div className="col-span-2 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Transaction Velocity — Last 24 Hours</h3>
          <p className="text-xs text-muted mb-3">Red threshold line at 15,000 transactions/hour</p>
          <AreaChart
            data={VELOCITY_DATA}
            xKey="hour"
            areas={[
              { key: 'volume', color: '#1B3A6B', name: 'Transaction Volume' },
              { key: 'threshold', color: '#D62828', name: 'Threshold' },
            ]}
            height={200}
          />
          <div className="mt-3 flex gap-4">
            <div className="text-xs"><span className="text-muted">Blacklisted Accounts:</span> <span className="font-bold text-danger">{blacklist.length}</span></div>
            <div className="text-xs"><span className="text-muted">Open Alerts:</span> <span className="font-bold text-danger">{alerts.filter((a) => a.status === 'open').length}</span></div>
            <div className="text-xs"><span className="text-muted">Under Investigation:</span> <span className="font-bold text-warning">{alerts.filter((a) => a.status === 'investigating').length}</span></div>
          </div>
        </div>
      </div>

      {/* Blacklist + audit log */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><ShieldX size={14} className="text-danger" /> Blacklisted Accounts</h3>
          {blacklist.map((b) => (
            <div key={b.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-muted font-mono">{b.accountNumber}</div>
                  <div className="text-xs text-danger mt-0.5">{b.reason}</div>
                </div>
                <Badge variant="danger" className="ml-2 flex-shrink-0">Blocked</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Audit Log</h3>
          {auditLog.map((entry) => (
            <div key={entry.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium">{entry.action.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-muted">{entry.actor} · {entry.role}</div>
                  <div className="text-[10px] text-muted font-mono mt-0.5">{entry.resource}</div>
                </div>
                <div className="text-[10px] text-muted text-right">{formatDateTime(entry.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert detail drawer */}
      <Drawer
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.type ?? ''}
        subtitle={selectedAlert ? `Rule: ${selectedAlert.rule}` : ''}
      >
        {selectedAlert && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2">
              <Badge variant={statusVariant(selectedAlert.severity)}>{selectedAlert.severity.toUpperCase()}</Badge>
              <Badge variant={statusVariant(selectedAlert.status)}>{selectedAlert.status}</Badge>
            </div>
            <div className="bg-danger-light border border-danger/20 rounded-lg p-3 text-danger text-sm">{selectedAlert.description}</div>
            <div className="space-y-2">
              {selectedAlert.payer && <div className="flex justify-between"><span className="text-muted">Payer</span><span>{selectedAlert.payer}</span></div>}
              {selectedAlert.participant && <div className="flex justify-between"><span className="text-muted">Participant</span><span>{selectedAlert.participant}</span></div>}
              {selectedAlert.transactionId && <div className="flex justify-between"><span className="text-muted">Transaction</span><span className="font-mono text-xs">{selectedAlert.transactionId}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Triggered</span><span>{formatDateTime(selectedAlert.triggeredAt)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Rule</span><span className="font-mono text-xs">{selectedAlert.rule}</span></div>
            </div>
            {selectedAlert.status !== 'resolved' && (
              <button
                onClick={() => { setSelectedAlert(null); addToast('Investigation initiated', 'info') }}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
              >
                Investigate
              </button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/compliance.tsx
git commit -m "feat: implement Compliance & Risk module with AML alerts and audit log"
```

---

### Task 28: Dispute & Refund module

**Files:**
- Modify: `src/routes/app/disputes.tsx`

- [ ] **Step 1: Write full `src/routes/app/disputes.tsx`**

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Drawer } from '../../components/ui/Drawer'
import { Timeline } from '../../components/ui/Timeline'
import { disputesApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatDate, formatDateTime } from '../../utils/format'
import { Clock, CheckCircle, XCircle, ArrowUp } from 'lucide-react'
import type { Dispute } from '../../types'

function SLATimer({ dueAt }: { dueAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function update() {
      const diff = new Date(dueAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('OVERDUE'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${days}d ${hours}h ${mins}m`)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [dueAt])

  const isOverdue = timeLeft === 'OVERDUE'
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isOverdue ? 'text-danger' : 'text-warning'}`}>
      <Clock size={12} />
      {timeLeft}
    </div>
  )
}

export default function DisputesPage() {
  const addToast = useAppStore((s) => s.addToast)
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Dispute | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: disputes = [], isLoading } = useQuery({ queryKey: ['disputes'], queryFn: disputesApi.list })

  const { mutate: resolve } = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => disputesApi.resolve(id, action),
    onSuccess: (_, { action }) => {
      addToast(`Dispute ${action === 'approve' ? 'resolved with refund' : action === 'reject' ? 'rejected' : 'escalated'}`, action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning')
      qc.invalidateQueries({ queryKey: ['disputes'] })
      setSelected(null)
    },
  })

  const filtered = statusFilter === 'all' ? disputes : disputes.filter((d) => d.status === statusFilter)

  const timelineItems = selected?.timeline.map((t) => ({
    label: t.stage,
    timestamp: t.timestamp ? formatDateTime(t.timestamp) : 'Pending',
    description: t.note,
    actor: t.actor,
    status: t.timestamp ? 'done' : 'pending',
  })) ?? []

  return (
    <div>
      <PageHeader title="Disputes & Refunds" subtitle="Payment dispute resolution and refund management" />

      <div className="flex gap-2 mb-4">
        {['all', 'open', 'investigating', 'approved', 'closed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors
              ${statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:text-slate-800'}`}>
            {s}
          </button>
        ))}
      </div>

      <DataTable<Dispute & Record<string, unknown>>
        columns={[
          { key: 'id', header: 'Dispute ID', render: (r) => <span className="font-mono text-xs">{r.id as string}</span> },
          { key: 'transactionId', header: 'Transaction', render: (r) => <span className="font-mono text-xs">{r.transactionId as string}</span> },
          { key: 'payer', header: 'Payer', sortable: true },
          { key: 'type', header: 'Type', render: (r) => <Badge variant="warning">{(r.type as string).replace(/_/g, ' ')}</Badge> },
          { key: 'amount', header: 'Amount', sortable: true, render: (r) => formatUGX(r.amount as number) },
          { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
          { key: 'slaDueAt', header: 'SLA', render: (r) => <SLATimer dueAt={r.slaDueAt as string} /> },
        ]}
        data={filtered as (Dispute & Record<string, unknown>)[]}
        keyField="id"
        loading={isLoading}
        onRowClick={(row) => setSelected(row as unknown as Dispute)}
      />

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Dispute ${selected?.id}`}
        subtitle={selected ? `${selected.type.replace(/_/g, ' ')} · ${selected.channel}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface rounded-lg p-3"><div className="text-xs text-muted">Amount</div><div className="font-bold text-primary">{formatUGX(selected.amount)}</div></div>
              <div className="bg-surface rounded-lg p-3"><div className="text-xs text-muted">SLA Deadline</div><SLATimer dueAt={selected.slaDueAt} /></div>
              <div className="bg-surface rounded-lg p-3 col-span-2"><div className="text-xs text-muted">Transaction ID</div><div className="font-mono text-xs">{selected.transactionId}</div></div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Resolution Timeline</div>
              <Timeline items={timelineItems as any} />
            </div>

            {selected.status !== 'closed' && selected.status !== 'approved' && selected.status !== 'rejected' && (
              <div className="flex flex-col gap-2">
                <button onClick={() => resolve({ id: selected.id, action: 'approve' })}
                  className="flex items-center justify-center gap-2 py-2.5 bg-success text-white rounded-lg text-sm font-semibold">
                  <CheckCircle size={14} /> Approve Refund
                </button>
                <button onClick={() => resolve({ id: selected.id, action: 'reject' })}
                  className="flex items-center justify-center gap-2 py-2.5 border border-danger text-danger rounded-lg text-sm">
                  <XCircle size={14} /> Reject Dispute
                </button>
                <button onClick={() => resolve({ id: selected.id, action: 'escalate' })}
                  className="flex items-center justify-center gap-2 py-2.5 border border-border text-muted rounded-lg text-sm">
                  <ArrowUp size={14} /> Escalate
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/disputes.tsx
git commit -m "feat: implement Disputes module with SLA countdown and resolution workflow"
```

---

### Task 29: API Platform module

**Files:**
- Modify: `src/routes/app/api-platform.tsx`

- [ ] **Step 1: Write full `src/routes/app/api-platform.tsx`**

```tsx
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { Code2, RefreshCw, CheckCircle2 } from 'lucide-react'

const ENDPOINTS = [
  {
    method: 'POST', path: '/api/v1/invoices', name: 'Create Invoice',
    description: 'Generate a new payment reference number (PRN) for a government service',
    request: `{\n  "agency_id": "URA",\n  "service_id": "ura-tax",\n  "payer_name": "Mugisha Robert",\n  "amount": 1200000,\n  "currency": "UGX"\n}`,
    response: `{\n  "prn": "PRN20260531001234",\n  "invoice_id": "INV-2026-001234",\n  "agency": "Uganda Revenue Authority",\n  "service": "Income Tax",\n  "amount": 1200000,\n  "expires_at": "2026-06-07T23:59:59Z",\n  "status": "pending"\n}`,
  },
  {
    method: 'GET', path: '/api/v1/invoices/{prn}', name: 'Validate Payment',
    description: 'Validate a PRN and retrieve invoice details before payment',
    request: `GET /api/v1/invoices/PRN20260531001234`,
    response: `{\n  "prn": "PRN20260531001234",\n  "valid": true,\n  "status": "pending",\n  "amount": 1200000,\n  "payer": "Mugisha Robert"\n}`,
  },
  {
    method: 'POST', path: '/api/v1/payments', name: 'Initiate Payment',
    description: 'Initiate a payment for a validated PRN via a specified channel',
    request: `{\n  "prn": "PRN20260531001234",\n  "channel": "MTN Mobile Money",\n  "phone": "256771234567",\n  "amount": 1200000\n}`,
    response: `{\n  "transaction_id": "TXN-2026-100512",\n  "status": "processing",\n  "channel_reference": "MTN-REF-89012345"\n}`,
  },
  {
    method: 'GET', path: '/api/v1/transactions/{id}', name: 'Query Transaction',
    description: 'Retrieve the current status and details of a payment transaction',
    request: `GET /api/v1/transactions/TXN-2026-100512`,
    response: `{\n  "id": "TXN-2026-100512",\n  "status": "completed",\n  "amount": 1200000,\n  "completed_at": "2026-05-31T09:24:15Z",\n  "processing_ms": 342\n}`,
  },
  {
    method: 'POST', path: '/api/v1/payments/{id}/confirm', name: 'Confirm Payment',
    description: 'Webhook endpoint — bank or MNO posts payment confirmation',
    request: `{\n  "transaction_id": "TXN-2026-100512",\n  "channel_reference": "MTN-REF-89012345",\n  "status": "success",\n  "confirmed_at": "2026-05-31T09:24:15Z"\n}`,
    response: `{\n  "acknowledged": true,\n  "transaction_id": "TXN-2026-100512"\n}`,
  },
  {
    method: 'GET', path: '/api/v1/reports/settlement', name: 'Settlement Report',
    description: 'Retrieve settlement batch details for a given date',
    request: `GET /api/v1/reports/settlement?date=2026-05-31`,
    response: `{\n  "date": "2026-05-31",\n  "batches": 8,\n  "total_amount": 24400000000,\n  "status": "completed"\n}`,
  },
  {
    method: 'GET', path: '/api/v1/reports/reconciliation', name: 'Reconciliation API',
    description: 'Pull reconciliation results and exception reports',
    request: `GET /api/v1/reports/reconciliation?date=2026-05-31`,
    response: `{\n  "match_rate": 97.4,\n  "matched": 48012,\n  "unmatched": 892,\n  "exceptions": 387\n}`,
  },
  {
    method: 'POST', path: '/api/v1/webhooks', name: 'Register Webhook',
    description: 'Register a callback URL for real-time payment event notifications',
    request: `{\n  "url": "https://your-agency.go.ug/webhooks/payments",\n  "events": ["payment.completed", "payment.failed", "settlement.done"]\n}`,
    response: `{\n  "webhook_id": "WH-001234",\n  "secret": "whsec_***masked***",\n  "status": "active"\n}`,
  },
]

const WEBHOOK_LOGS = [
  { id: 'WL-001', event: 'payment.completed', url: 'https://ura.go.ug/webhooks', status: 'delivered', timestamp: '2026-05-31T09:24:16Z', responseCode: 200 },
  { id: 'WL-002', event: 'settlement.done', url: 'https://mow.go.ug/webhooks', status: 'delivered', timestamp: '2026-05-31T08:00:01Z', responseCode: 200 },
  { id: 'WL-003', event: 'payment.failed', url: 'https://nira.go.ug/webhooks', status: 'failed', timestamp: '2026-05-31T07:45:12Z', responseCode: 503 },
]

const METHOD_COLOR: Record<string, string> = {
  GET: 'bg-success-light text-success',
  POST: 'bg-primary-50 text-primary',
}

export default function ApiPlatformPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [tryModal, setTryModal] = useState<typeof ENDPOINTS[0] | null>(null)
  const [apiKeys, setApiKeys] = useState({ live: 'gps_live_' + 'x'.repeat(36), sandbox: 'gps_test_' + 'x'.repeat(36) })

  return (
    <div>
      <PageHeader
        title="API Platform"
        subtitle="Developer portal — GovPay Switch payment integration APIs"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-light text-success rounded-full text-xs font-medium">
            <CheckCircle2 size={13} /> Sandbox: Operational
          </div>
        }
      />

      {/* API cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {ENDPOINTS.map((ep) => (
          <div key={ep.path} className="bg-card rounded-card shadow-card p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${METHOD_COLOR[ep.method] ?? 'bg-muted/10 text-muted'}`}>{ep.method}</span>
                <code className="text-xs text-muted font-mono">{ep.path}</code>
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-800">{ep.name}</div>
            <div className="text-xs text-muted flex-1">{ep.description}</div>
            <button
              onClick={() => setTryModal(ep)}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-light transition-colors w-fit"
            >
              <Code2 size={12} /> Try It →
            </button>
          </div>
        ))}
      </div>

      {/* API Keys + Webhooks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">API Key Management</h3>
          <div className="space-y-4">
            {[{ label: 'Live API Key', key: apiKeys.live, env: 'live' }, { label: 'Sandbox API Key', key: apiKeys.sandbox, env: 'test' }].map((k) => (
              <div key={k.env}>
                <div className="text-xs text-muted mb-1">{k.label}</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-surface border border-border rounded px-3 py-2 truncate">
                    {k.key.slice(0, 16)}{'*'.repeat(24)}
                  </code>
                  <button
                    onClick={() => { setApiKeys((prev) => ({ ...prev, [k.env === 'live' ? 'live' : 'sandbox']: `gps_${k.env}_` + Math.random().toString(36).slice(2, 38) })); addToast(`${k.label} regenerated`, 'warning') }}
                    className="text-xs text-muted hover:text-danger transition-colors flex-shrink-0"
                    title="Regenerate key"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Webhook Delivery Log</h3>
          <div className="space-y-2">
            {WEBHOOK_LOGS.map((log) => (
              <div key={log.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-xs font-medium">{log.event}</div>
                  <div className="text-[10px] text-muted font-mono truncate max-w-[180px]">{log.url}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <Badge variant={log.status === 'delivered' ? 'success' : 'danger'} className="text-[10px]">{log.responseCode}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Try It modal */}
      <Modal open={!!tryModal} onClose={() => setTryModal(null)} title={tryModal?.name ?? ''} maxWidth="max-w-3xl">
        {tryModal && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-muted uppercase mb-2">Request</div>
              <pre className="bg-slate-900 text-green-400 text-xs rounded-lg p-4 overflow-auto max-h-64 font-mono leading-relaxed">
                {tryModal.request}
              </pre>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted uppercase mb-2">Response</div>
              <pre className="bg-slate-900 text-blue-300 text-xs rounded-lg p-4 overflow-auto max-h-64 font-mono leading-relaxed">
                {tryModal.response}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/api-platform.tsx
git commit -m "feat: implement API Platform developer portal with Try It modal"
```

---

### Task 30: Real-time Operations Center module

**Files:**
- Modify: `src/routes/app/operations.tsx`

- [ ] **Step 1: Write full `src/routes/app/operations.tsx`**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { AreaChart } from '../../components/charts/AreaChart'
import { useAppStore } from '../../store/appStore'
import { AnimatePresence, motion } from 'framer-motion'
import { formatUGX, timeAgo } from '../../utils/format'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const SYSTEM_COMPONENTS = [
  { name: 'Payment Gateway',    status: 'healthy',  latency: 42  },
  { name: 'Routing Engine',     status: 'healthy',  latency: 18  },
  { name: 'Validation Engine',  status: 'healthy',  latency: 23  },
  { name: 'Settlement Engine',  status: 'healthy',  latency: 31  },
  { name: 'Reconciliation',     status: 'healthy',  latency: 55  },
  { name: 'Notification Svc',   status: 'degraded', latency: 280 },
  { name: 'Database (Primary)', status: 'healthy',  latency: 8   },
  { name: 'Database (Replica)', status: 'healthy',  latency: 12  },
  { name: 'Cache Layer',        status: 'healthy',  latency: 3   },
  { name: 'Message Queue',      status: 'healthy',  latency: 15  },
  { name: 'Audit Logger',       status: 'healthy',  latency: 22  },
  { name: 'Webhook Dispatcher', status: 'healthy',  latency: 48  },
]

// Uganda simplified SVG region dots (approximate relative positions within a 300x360 bounding box)
const REGIONS = [
  { name: 'Kampala',    x: 148, y: 210, volume: 18400 },
  { name: 'Wakiso',     x: 138, y: 218, volume: 9200  },
  { name: 'Mukono',     x: 165, y: 208, volume: 4100  },
  { name: 'Jinja',      x: 190, y: 195, volume: 3200  },
  { name: 'Mbarara',    x: 118, y: 285, volume: 2800  },
  { name: 'Gulu',       x: 148, y: 100, volume: 1900  },
  { name: 'Mbale',      x: 215, y: 168, volume: 2100  },
  { name: 'Arua',       x: 82,  y: 88,  volume: 1100  },
  { name: 'Fort Portal', x: 88,  y: 210, volume: 1400  },
  { name: 'Masaka',     x: 128, y: 265, volume: 1700  },
]

const SUCCESS_FAILURE_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  success: 18000 + Math.floor(Math.random() * 4000),
  failed: 200 + Math.floor(Math.random() * 600),
}))

const INCIDENTS = [
  { id: 'INC-001', description: 'DFCU Bank API timeout — 89 transactions queued', severity: 'high',     at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'INC-002', description: 'Notification service degraded — latency 280ms', severity: 'medium',   at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'INC-003', description: 'Settlement batch DFCU failed — retry initiated', severity: 'high',     at: new Date(Date.now() - 18 * 3600000).toISOString() },
]

const maxVol = Math.max(...REGIONS.map((r) => r.volume))

export default function OperationsPage() {
  const liveTransactions = useAppStore((s) => s.liveTransactions)

  const healthyCnt = SYSTEM_COMPONENTS.filter((c) => c.status === 'healthy').length
  const degradedCnt = SYSTEM_COMPONENTS.filter((c) => c.status === 'degraded').length

  return (
    <div>
      <PageHeader
        title="Real-time Operations Center"
        subtitle="Live system health, regional activity, and incident monitoring"
        actions={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-success"><span className="w-2 h-2 rounded-full bg-success animate-pulse" />{healthyCnt} Healthy</span>
            {degradedCnt > 0 && <span className="flex items-center gap-1.5 text-warning"><span className="w-2 h-2 rounded-full bg-warning animate-pulse" />{degradedCnt} Degraded</span>}
          </div>
        }
      />

      {/* System component grid */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {SYSTEM_COMPONENTS.map((comp) => (
          <div key={comp.name} className="bg-card rounded-lg shadow-card p-3 flex items-center gap-2">
            {comp.status === 'down' ? <WifiOff size={13} className="text-danger" /> : <Wifi size={13} className={comp.status === 'healthy' ? 'text-success' : 'text-warning'} />}
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-800 truncate">{comp.name}</div>
              <div className={`text-[10px] ${comp.status === 'healthy' ? 'text-success' : 'text-warning'}`}>{comp.latency}ms</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Uganda map */}
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Regional Activity</h3>
          <div className="relative" style={{ paddingBottom: '120%' }}>
            <svg viewBox="0 0 300 360" className="absolute inset-0 w-full h-full" fill="none">
              {/* Simplified Uganda country outline */}
              <path d="M80,70 L100,50 L140,45 L180,55 L220,60 L240,90 L235,130 L240,160 L230,200 L220,240 L200,280 L170,310 L140,320 L110,305 L90,280 L75,250 L65,210 L70,170 L75,130 L72,100 Z"
                stroke="#E2E8F0" strokeWidth="2" fill="#F5F7FA" />
              {/* Lake Victoria */}
              <ellipse cx="180" cy="280" rx="30" ry="20" fill="#DBEAFE" opacity="0.6" />
              {REGIONS.map((r) => {
                const radius = 4 + (r.volume / maxVol) * 14
                return (
                  <g key={r.name}>
                    <motion.circle
                      cx={r.x} cy={r.y} r={radius}
                      fill="#1B3A6B" fillOpacity={0.15}
                      animate={{ r: [radius, radius + 4, radius] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                    <circle cx={r.x} cy={r.y} r={radius / 2} fill="#1B3A6B" fillOpacity={0.7} />
                    <text x={r.x} y={r.y - radius - 3} textAnchor="middle" fontSize="7" fill="#64748B">{r.name}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Live stream */}
        <div className="bg-card rounded-card shadow-card p-4 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-800">Live Transaction Stream</h3>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            <AnimatePresence mode="popLayout" initial={false}>
              {liveTransactions.slice(0, 12).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between text-xs py-1 border-b border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0',
                      tx.status === 'completed' ? 'bg-success' : tx.status === 'failed' ? 'bg-danger' : 'bg-warning'
                    )} />
                    <span className="font-mono truncate">{tx.id}</span>
                  </div>
                  <span className="text-muted flex-shrink-0 ml-2">{timeAgo(tx.timestamp)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Queue depths + incidents */}
        <div className="space-y-4">
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Queue Depths</h3>
            {[
              { label: 'Payment Processing', value: 1247, max: 5000 },
              { label: 'Settlement Queue', value: 892, max: 2000 },
              { label: 'Webhook Dispatch', value: 341, max: 1000 },
            ].map((q) => (
              <div key={q.label} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{q.label}</span>
                  <span className="font-medium">{q.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(q.value / q.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5"><AlertTriangle size={13} className="text-warning" /> Incidents</h3>
            {INCIDENTS.map((inc) => (
              <div key={inc.id} className="text-xs py-2 border-b border-border last:border-0">
                <div className="flex items-start gap-1.5">
                  <Badge variant={inc.severity === 'high' ? 'danger' : 'warning'} className="flex-shrink-0 mt-0.5">{inc.severity}</Badge>
                  <span className="text-slate-700">{inc.description}</span>
                </div>
                <div className="text-muted mt-0.5">{timeAgo(inc.at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success/failure chart */}
      <div className="bg-card rounded-card shadow-card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">24-Hour Success vs Failure Volume</h3>
        <AreaChart data={SUCCESS_FAILURE_DATA} xKey="hour" areas={[
          { key: 'success', color: '#16A34A', name: 'Success' },
          { key: 'failed', color: '#D62828', name: 'Failed' },
        ]} height={180} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/operations.tsx
git commit -m "feat: implement Operations Center with Uganda map and live stream"
```

---

### Task 31: Reports & Analytics module

**Files:**
- Modify: `src/routes/app/reports.tsx`

- [ ] **Step 1: Write full `src/routes/app/reports.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { AreaChart } from '../../components/charts/AreaChart'
import { LineChart } from '../../components/charts/LineChart'
import { reportsApi } from '../../services/mockApi'
import { agencyRevenue, channelBreakdown } from '../../data/mockReports'
import { useAppStore } from '../../store/appStore'
import { formatUGX } from '../../utils/format'
import { Download } from 'lucide-react'

const RECON_EXCEPTIONS = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  exceptions: 80 + Math.floor(Math.random() * 200),
}))

function downloadReport() {
  const content = 'Report Type,Date,Value\nDaily Volume,2026-05-31,24400000000\nSuccess Rate,2026-05-31,97.4%'
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'govpay-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [dateRange, setDateRange] = useState('30d')

  const { data: dailyVolume = [], isLoading } = useQuery({
    queryKey: ['daily-volume', dateRange],
    queryFn: reportsApi.dailyVolume,
  })

  const volumeSlice = dateRange === '7d' ? dailyVolume.slice(-7) :
                      dateRange === '14d' ? dailyVolume.slice(-14) : dailyVolume

  const agencyBar = agencyRevenue.map((a) => ({ agency: a.agency, revenue: Math.round(a.revenue / 1_000_000_000) }))
  const channelPie = channelBreakdown.map((c, i) => ({
    name: c.channel, value: c.count,
    color: ['#1B3A6B', '#F4B000', '#16A34A', '#D62828', '#64748B'][i],
  }))
  const failedData = volumeSlice.map((d) => ({ date: d.date, failed: d.failed }))
  const settlementTrends = volumeSlice.map((d) => ({ date: d.date, amount: Math.round(d.amount / 1_000_000_000) }))

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Transaction volumes, agency collections, and reconciliation trends"
        actions={
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 bg-white">
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={() => { downloadReport(); addToast('Report exported', 'success') }}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Daily Transaction Volume</h3>
          <BarChart data={volumeSlice} xKey="date" bars={[
            { key: 'success', color: '#16A34A', name: 'Success' },
            { key: 'failed', color: '#D62828', name: 'Failed' },
          ]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Revenue by Agency (UGX B)</h3>
          <BarChart data={agencyBar} xKey="agency" bars={[{ key: 'revenue', color: '#1B3A6B' }]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Channel Breakdown (by count)</h3>
          <PieChart data={channelPie} height={200} donut />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Failed Transaction Trend</h3>
          <LineChart data={failedData} xKey="date" lines={[{ key: 'failed', color: '#D62828', name: 'Failed' }]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Settlement Volume Trend (UGX B)</h3>
          <AreaChart data={settlementTrends} xKey="date" areas={[{ key: 'amount', color: '#1B3A6B' }]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Reconciliation Exceptions</h3>
          <BarChart data={RECON_EXCEPTIONS} xKey="day" bars={[{ key: 'exceptions', color: '#D97706' }]} height={200} />
        </div>
      </div>

      {/* Treasury summary */}
      <div className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Treasury Collection Summary</h3>
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>{['Agency', 'Revenue (UGX)', 'Transactions', 'Avg Per Txn'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {agencyRevenue.map((a) => (
              <tr key={a.agency} className="hover:bg-primary-50">
                <td className="px-4 py-2.5 font-medium">{a.agency}</td>
                <td className="px-4 py-2.5 font-semibold text-primary">{formatUGX(a.revenue)}</td>
                <td className="px-4 py-2.5">{a.count.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-muted">{formatUGX(Math.round(a.revenue / a.count))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and commit**

```bash
npx tsc --noEmit
git add src/routes/app/reports.tsx
git commit -m "feat: implement Reports & Analytics with 6 charts and CSV export"
```

---

### Task 32: Admin & Configuration module

**Files:**
- Modify: `src/routes/app/admin.tsx`

- [ ] **Step 1: Write full `src/routes/app/admin.tsx`**

```tsx
import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { mockRoutingRules } from '../../data/mockRouting'
import { formatUGX } from '../../utils/format'
import { ChevronUp, ChevronDown, Save } from 'lucide-react'
import type { RoutingRule } from '../../types'
import type { Role } from '../../types'

const ROLES: Role[] = ['Super Admin', 'Bank of Uganda Operator', 'Treasury Officer', 'Agency Officer', 'Compliance Officer', 'Settlement Officer', 'Support Officer', 'Developer']
const PERMISSIONS = ['View Dashboard', 'Run Settlement', 'Approve Settlement', 'View Compliance', 'Manage Participants', 'Access API Keys', 'Admin Config', 'View Reports']
const ROLE_PERMS: Record<string, string[]> = {
  'Super Admin': PERMISSIONS,
  'Bank of Uganda Operator': ['View Dashboard', 'View Compliance', 'View Reports', 'Run Settlement'],
  'Treasury Officer': ['View Dashboard', 'Run Settlement', 'Approve Settlement', 'View Reports'],
  'Agency Officer': ['View Dashboard', 'View Reports'],
  'Compliance Officer': ['View Dashboard', 'View Compliance', 'View Reports'],
  'Settlement Officer': ['View Dashboard', 'Run Settlement', 'Approve Settlement'],
  'Support Officer': ['View Dashboard', 'View Reports'],
  'Developer': ['View Dashboard', 'Access API Keys'],
}

const SETTLEMENT_CYCLES = [
  { id: 'SC-01', name: 'MTN Mobile Money', frequency: 'Daily', cutoff: '21:00', nextRun: '2026-06-01T21:00:00Z' },
  { id: 'SC-02', name: 'Stanbic Bank', frequency: 'Daily', cutoff: '22:00', nextRun: '2026-06-01T22:00:00Z' },
  { id: 'SC-03', name: 'Airtel Money', frequency: 'Daily', cutoff: '21:30', nextRun: '2026-06-01T21:30:00Z' },
]

const NOTIFICATION_TEMPLATES = [
  { id: 'NT-01', name: 'Payment Confirmed', channel: 'SMS + Email', active: true },
  { id: 'NT-02', name: 'Payment Failed', channel: 'SMS', active: true },
  { id: 'NT-03', name: 'Settlement Complete', channel: 'Email', active: true },
  { id: 'NT-04', name: 'Dispute Raised', channel: 'Email', active: false },
]

export default function AdminPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [rules, setRules] = useState<RoutingRule[]>(mockRoutingRules)
  const [editWorkflow, setEditWorkflow] = useState(false)
  const [txLimits, setTxLimits] = useState({ mtn: 5000000, airtel: 3000000, bank: 50000000000 })

  function reorder(id: string, dir: 'up' | 'down') {
    setRules((prev) => {
      const arr = [...prev]
      const idx = arr.findIndex((r) => r.id === id)
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= arr.length) return arr
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      return arr.map((r, i) => ({ ...r, priority: i + 1 }))
    })
    addToast('Routing priority updated', 'success')
  }

  function save() {
    addToast('Configuration saved', 'success')
  }

  return (
    <div>
      <PageHeader title="Admin & Configuration" subtitle="Platform fees, limits, routing, settlement cycles, roles, and notifications" />

      <Tabs.Root defaultValue="roles">
        <Tabs.List className="flex gap-1 bg-surface p-1 rounded-lg mb-5 flex-wrap">
          {['roles', 'routing', 'limits', 'settlement', 'notifications', 'webhooks'].map((tab) => (
            <Tabs.Trigger key={tab} value={tab}
              className="px-3 py-1.5 text-sm rounded-md text-muted capitalize data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:font-semibold transition-all">
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Role permissions matrix */}
        <Tabs.Content value="roles">
          <div className="bg-card rounded-card shadow-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted uppercase">Permission</th>
                  {ROLES.map((r) => <th key={r} className="px-3 py-3 text-center font-semibold text-muted uppercase w-24">{r.split(' ')[0]}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PERMISSIONS.map((perm) => (
                  <tr key={perm} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{perm}</td>
                    {ROLES.map((role) => (
                      <td key={role} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={ROLE_PERMS[role]?.includes(perm)}
                          onChange={() => addToast('Permission updated (demo)', 'info')}
                          className="accent-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
              <Save size={14} /> Save Permissions
            </button>
          </div>
        </Tabs.Content>

        {/* Routing rules reorder */}
        <Tabs.Content value="routing">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['Priority', 'Channel', 'Participant', 'Fee', 'Status', 'Reorder'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-bold text-primary">#{rule.priority}</td>
                    <td className="px-4 py-2.5">{rule.channel}</td>
                    <td className="px-4 py-2.5">{rule.participant}</td>
                    <td className="px-4 py-2.5">{rule.feeType === 'flat' ? formatUGX(rule.fee) : `${rule.fee}%`}</td>
                    <td className="px-4 py-2.5"><Badge variant={rule.status === 'active' ? 'success' : 'muted'}>{rule.status}</Badge></td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => reorder(rule.id, 'up')} className="p-1 hover:bg-surface rounded transition-colors text-muted hover:text-primary"><ChevronUp size={14} /></button>
                        <button onClick={() => reorder(rule.id, 'down')} className="p-1 hover:bg-surface rounded transition-colors text-muted hover:text-primary"><ChevronDown size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Transaction limits */}
        <Tabs.Content value="limits">
          <div className="bg-card rounded-card shadow-card p-5 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Channel Transaction Limits (UGX)</h3>
            <div className="space-y-4">
              {[
                { key: 'mtn', label: 'MTN Mobile Money — Max per transaction' },
                { key: 'airtel', label: 'Airtel Money — Max per transaction' },
                { key: 'bank', label: 'Bank Transfer — Max per transaction' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted mb-1 block">{f.label}</label>
                  <input
                    type="number"
                    value={txLimits[f.key as keyof typeof txLimits]}
                    onChange={(e) => setTxLimits((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                  />
                </div>
              ))}
              <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
                <Save size={14} /> Save Limits
              </button>
            </div>
          </div>
        </Tabs.Content>

        {/* Settlement cycles */}
        <Tabs.Content value="settlement">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['Participant', 'Frequency', 'Cutoff Time', 'Next Run', 'Action'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SETTLEMENT_CYCLES.map((sc) => (
                  <tr key={sc.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium">{sc.name}</td>
                    <td className="px-4 py-2.5">{sc.frequency}</td>
                    <td className="px-4 py-2.5 font-mono">{sc.cutoff}</td>
                    <td className="px-4 py-2.5 text-muted">{new Date(sc.nextRun).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => addToast(`Settlement cycle for ${sc.name} updated`, 'success')} className="text-xs text-primary underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Notifications */}
        <Tabs.Content value="notifications">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr>{['Template', 'Channel', 'Active', 'Action'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {NOTIFICATION_TEMPLATES.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-primary-50">
                    <td className="px-4 py-2.5 font-medium">{tmpl.name}</td>
                    <td className="px-4 py-2.5 text-muted">{tmpl.channel}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={tmpl.active ? 'success' : 'muted'}>{tmpl.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => addToast(`${tmpl.name} template saved`, 'success')} className="text-xs text-primary underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* Webhooks */}
        <Tabs.Content value="webhooks">
          <div className="bg-card rounded-card shadow-card p-5 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Webhook Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Default Webhook URL</label>
                <input defaultValue="https://treasury.go.ug/webhooks/govpay" className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 font-mono" />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Retry Policy</label>
                <select defaultValue="3" className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none bg-white">
                  <option value="1">1 retry</option>
                  <option value="3">3 retries (recommended)</option>
                  <option value="5">5 retries</option>
                </select>
              </div>
              <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
                <Save size={14} /> Save Webhook Config
              </button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Modal open={editWorkflow} onClose={() => setEditWorkflow(false)} title="Edit Approval Workflow">
        <p className="text-sm text-muted">Workflow editor — drag steps to reorder, set approvers per stage.</p>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check and final verify**

```bash
npx tsc --noEmit
npm run dev
```

Navigate through all 13 modules: Dashboard → Simulator → Collections → Routing → Participants → Settlement → Reconciliation → Compliance → Disputes → API Platform → Operations → Reports → Admin. Verify each page loads, charts render, tables show data, interactive elements respond, toasts fire on actions. Stop server.

- [ ] **Step 3: Final commit**

```bash
git add src/routes/app/admin.tsx
git commit -m "feat: implement Admin & Configuration with role matrix, routing reorder, and settings"
```

---

## Phase 6: Final Polish (Task 33)

---

### Task 33: README and final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Uganda GovPay Switch

> **DEMO ONLY** — This is a demonstration UI for a national payment infrastructure platform. No real payment processing, no real credentials, no external financial API calls.

A full-depth, 13-module demo application simulating the Government of Uganda's national Payment Service Provider / Payment System Operator platform.

## Purpose

Built to demonstrate to senior government officials, central bank stakeholders, treasury officers, banks, and payment operators how a national-grade payment infrastructure command center could look and operate.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 → select a role → explore the platform.

## Modules

| Module | Path | Description |
|---|---|---|
| Dashboard | /app/dashboard | Executive KPIs, live feed, charts |
| Simulator | /app/simulator | Animated payment flow with 4 scenarios |
| Collections | /app/collections | 3-step stepper for government service payments |
| Routing | /app/routing | Channel health and route testing |
| Participants | /app/participants | Banks, MNOs, agencies management |
| Settlement | /app/settlement | Batch settlement with approvals |
| Reconciliation | /app/reconciliation | Match rates and exception management |
| Compliance | /app/compliance | AML alerts, velocity, blacklists |
| Disputes | /app/disputes | Dispute resolution with SLA countdown |
| API Platform | /app/api-platform | Developer portal with Try It |
| Operations | /app/operations | Live ops center with Uganda map |
| Reports | /app/reports | 6 analytics charts + treasury summary |
| Admin | /app/admin | Roles, routing, limits, notifications |

## Limitations

- All data is generated locally — no real payments are processed
- No authentication — role selection is for demo purposes only
- Live updates are simulated via setInterval

## Tech Stack

React 18 · Vite · TypeScript · TanStack Router · TanStack Query · Zustand · Tailwind CSS · Framer Motion · Recharts · Radix UI · Lucide React
```

- [ ] **Step 2: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: add README with module index and setup instructions"
```

- [ ] **Step 4: Verify production build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or Vite errors. Output in `dist/`.

- [ ] **Step 5: Final commit if build succeeded**

```bash
git add -A
git commit -m "chore: verify production build passes"
```

---

## Summary

| Phase | Tasks | Output |
|---|---|---|
| Foundation | 1–7 | Scaffolded project, dependencies, Tailwind, Router, types, Zustand, animations |
| Layout | 8–11 | AppShell, Sidebar (collapsible), Topbar, Login (role switcher) |
| Shared UI | 12–17 | Badge, KPICard, DataTable, Drawer, Modal, Toast, Stepper, Timeline, Charts |
| Data & Services | 18–19 | All mock data files, mock API service, live updates hook |
| Modules | 20–32 | All 13 modules fully implemented |
| Polish | 33 | README + production build verification |

**Total: 33 tasks · ~40 git commits**
