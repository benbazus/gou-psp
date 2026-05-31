# Uganda GovPay Switch — Design Spec
**Date:** 2026-05-31
**Status:** Approved

---

## Overview

A full-depth demo UI for the Government of Uganda's national Payment Service Provider / Payment System Operator platform. This is a demo-only application — no real payment integrations, no real credentials, no external financial API calls. All data is mocked.

**Application name:** Uganda GovPay Switch
**Tagline:** National Payment Infrastructure

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Build scope | All 13 modules at full depth | Full demo for senior stakeholder presentations |
| Theme | Light Government (B) | Trustworthy, formal, legible — central bank tone |
| Sidebar | Collapsible (B) — starts expanded | Labels visible for demo audiences by default |
| Entry point | Mock login with role switcher | Sets multi-role governance context immediately |
| Component layer | Radix UI primitives + pure Tailwind | Accessible interactives, 100% custom visual style |

---

## Tech Stack

- **Build:** Vite + React 18 + TypeScript
- **Routing:** TanStack Router (file-based, routes under `src/routes/`)
- **Data fetching:** TanStack Query (wraps mock async services)
- **Global UI state:** Zustand
- **Styling:** Tailwind CSS (custom design tokens)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **UI primitives:** Radix UI (Dialog, DropdownMenu, Tooltip, Select, Tabs, Popover, ScrollArea)
- **Icons:** Lucide React
- **No backend** — all data from `src/data/` and `src/services/mockApi.ts`

---

## Design System

### Color Tokens (`tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1B3A6B` | Sidebar, primary buttons, headings |
| `primary-light` | `#2A5298` | Hover states, active nav items |
| `accent` | `#F4B000` | Gold highlights, KPI accents, logo |
| `danger` | `#D62828` | Alerts, failed status, critical badges |
| `success` | `#16A34A` | Success states, completed badges |
| `surface` | `#F5F7FA` | Page background |
| `card` | `#FFFFFF` | Card backgrounds |
| `border` | `#E2E8F0` | Dividers, table borders |
| `muted` | `#64748B` | Secondary text, labels |

### Typography
- Font: Inter (Google Fonts)
- Scale: `text-xs` labels → `text-sm` body → `text-base` table data → `text-lg` card values → `text-2xl`/`text-3xl` KPI numbers

### Component Patterns
- **KPI cards:** white bg, `shadow-sm`, 8px rounded, 3px colored top-border accent, animated counter on load
- **Data tables:** sticky header, alternating row shading, sortable columns, `primary/5` row hover
- **Status badges:** pill shape — success green / danger red / accent yellow / muted gray / primary blue
- **Page headers:** breadcrumb + title + right-side actions, border-bottom separator
- **Drawers:** slide from right (Framer Motion), 480px wide, overlay backdrop
- **Modals:** centered, max-w-lg, Radix Dialog, Framer Motion scale-in
- **Toasts:** bottom-right stack, 4s auto-dismiss, success/error/warning variants

### Animation Variants (`src/utils/animations.ts`)

| Variant | Usage |
|---|---|
| `fadeInUp` | Card/section entrance |
| `staggerContainer` | Parent staggering children 60ms apart |
| `slideInRight` | Drawer entrance |
| `scaleIn` | Modal entrance |
| `flowNode` | Payment flow node activation (glow + scale pulse) |
| `counterSpring` | KPI number tween on first render |

---

## Architecture

### State Management

**TanStack Query** — all "data" layer:
- Every module's data fetched via query hooks calling mock service functions
- Realistic async delays (300–800ms) for loading states
- Queries invalidated on mock mutations (approve settlement, resolve dispute, etc.)

**Zustand** — global UI state:
- `activeRole` — selected at login, persists for session
- `sidebarCollapsed` — sidebar expand/collapse state
- `toastQueue` — toast notifications
- `liveTransactions` — rolling buffer fed by `useLiveUpdates` hook

### Live Updates (`src/hooks/useLiveUpdates.ts`)
- `setInterval` at 4s pushes new mock transactions into Zustand
- Dashboard feed, Operations Center stream, and Compliance alert feed subscribe
- Interval pauses when `document.visibilityState === 'hidden'`

---

## Route Tree

```
/                     → redirect to /login
/login                → LoginPage (role selector)
/app                  → AppShell layout route
  /app/dashboard
  /app/simulator
  /app/collections
  /app/routing
  /app/participants
  /app/settlement
  /app/reconciliation
  /app/compliance
  /app/disputes
  /app/api-platform
  /app/operations
  /app/reports
  /app/admin
```

---

## Login Screen

- Centered card on navy gradient background with Uganda coat of arms watermark
- "Uganda GovPay Switch" logo + "National Payment Infrastructure" tagline
- 8 role cards in 2×4 grid — click to select (gold border highlight)
- "Enter Dashboard" button activates after role selection
- Selected role stored in Zustand, persists for session
- Role gates: sidebar items dimmed for roles without access (visual only)

### Roles
Super Admin · Bank of Uganda Operator · Treasury Officer · Agency Officer · Compliance Officer · Settlement Officer · Support Officer · Developer

---

## Navigation

### Sidebar
- **Top:** Logo + "Uganda GovPay Switch" wordmark + collapse toggle (chevron icon)
- **Middle:** 13 nav items, Lucide icon + label, active item: gold left-border + `primary-light` background
- **Bottom:** Role badge (avatar circle + role name) + Settings shortcut
- **Collapsed state:** 56px wide, icons only, Radix Tooltip on hover shows label
- **Transition:** Framer Motion `width` spring (240px ↔ 56px), labels fade in/out

### Topbar
- Left: current page breadcrumb
- Right: global search bar (opens a mock command palette modal that filters local Zustand transaction store — no external search), notification bell (mock alert count), role badge

---

## Module Designs

### 1. Landing Dashboard
- Hero KPI row: 8 cards (transactions today, value processed, success rate, failed count, pending settlements, active participants, uptime, avg processing time)
- 3-column layout: real-time transaction feed (AnimatePresence) + channel breakdown pie chart + agency collections bar chart
- Bottom: treasury settlement timeline + compliance alert strip
- Mock live updates every 4s via Zustand

### 2. Payment Flow Simulator
- Full-width animated flow diagram: 10 nodes (Citizen → Treasury)
- Form: amount, payer name, channel, agency
- On submit: nodes light up sequentially (600ms between steps), transaction ID generated
- Four scenario buttons: Success · Failed · Timeout · Reversal
- Each scenario follows a different node path with different states

### 3. Collections Module
- 3-step stepper: Select agency + service → Generate PRN/invoice preview → Select channel + confirm
- Animated success screen with receipt preview after confirmation
- Payment lifecycle tracker: 5-stage status display below

### 4. Payment Routing Module
- Split view: routing rules table (left) + animated routing decision diagram (right)
- "Test Route" button: primary → secondary (fallback) → failed — each with distinct colors
- Channel health grid: all banks + MNOs with live mock health indicators

### 5. Participant Management
- Full-width sortable/filterable data table
- Row click → right-side drawer: API health sparkline, settlement account, SLA gauge, daily volume chart, risk rating
- Drawer actions: Suspend / Activate / View API Keys modal / View Settlement Rules / View Limits

### 6. Settlement Module
- 4 KPI cards: pending value, completed today, failed batches, net position
- Settlement batch table with approve/reject/re-run per row
- Right: animated 5-stage processing pipeline
- Bottom: treasury + agency account positions
- "Download Settlement File" → mock CSV blob download

### 7. Reconciliation Module
- Reconciliation score donut + match rate trend line (Recharts)
- Tabbed view: Matched / Unmatched / Exceptions
- "Run Reconciliation" → full-screen animated matching sequence (records fly together, green/amber states)
- Exception queue table with manual resolution modal

### 8. Compliance & Risk Module
- Left: AML alert feed with severity badges
- Center: 24h transaction velocity area chart
- Right: blacklisted accounts count + high-value payments list
- Bottom: audit log table
- Alert "Investigate" → detail drawer with transaction chain, payer history, triggering rule

### 9. Dispute & Refund Module
- Disputes table filterable by status: Open / Investigating / Resolved
- Row click → drawer: dispute timeline stepper, SLA countdown timer (animated), evidence mock, participant response, action buttons (Approve Refund / Reject / Escalate)

### 10. API Platform (Developer Portal)
- API cards grid: 8 endpoints (method badge, path, description, "Try It")
- "Try It" → split-pane modal: request JSON editor (left) + response JSON (right)
- Below: webhook logs table + API key management (masked keys, regenerate) + sandbox status

### 11. Real-time Operations Center
- System component health grid: 12 components, green/amber/red dots + latency
- Center: simplified static SVG outline of Uganda with 10 hardcoded regional dot positions (sized by mock volume, animated pulse — no mapping library needed)
- Right: live transaction stream + queue depth gauges
- Bottom: 24h success/failure area chart + incident alert list

### 12. Reports & Analytics
- Date range picker
- 6-chart grid: daily volume bar, revenue by agency pie, channel breakdown donut, failed trend line, settlement trends area, reconciliation exceptions bar
- Treasury collection summary table
- "Export Report" → mock CSV download
- All charts re-render on date range change with smooth transitions

### 13. Admin & Configuration
- 8-tab layout matching configuration categories
- Role management: user × permission matrix (checkboxes)
- Routing rules: priority list with click-up/click-down reorder buttons (no drag library — keeps native HTML controls constraint)
- Approval workflows: static visual workflow builder with edit modal
- All save actions → toast confirmation

---

## Mock Data Files (`src/data/`)

| File | Contents |
|---|---|
| `mockAgencies.ts` | 8 agencies, services, fee schedules, settlement accounts |
| `mockParticipants.ts` | 7 banks, 2 MNOs, 8 agencies, 3 aggregators — health, SLA, volume |
| `mockTransactions.ts` | 500 transactions — UGX amounts, payer names, 10 regions, statuses, channels |
| `mockSettlements.ts` | 30 settlement batches across 14 days with net/gross positions |
| `mockDisputes.ts` | 25 disputes in various stages with evidence and timeline entries |
| `mockCompliance.ts` | 40 AML alerts, 20 blacklisted accounts, audit log entries |
| `mockRouting.ts` | Routing rules, channel availability, fee matrix |
| `mockReports.ts` | 90-day aggregated stats for all chart series |

### Ugandan Mock Data
- **Agencies:** URA, NIRA, URSB, Ministry of Lands, Uganda Police, Immigration, KCCA, Ministry of Works
- **Banks:** Stanbic Bank, Centenary Bank, DFCU, Equity Bank, Absa Uganda, Bank of Africa, Housing Finance Bank
- **MNOs:** MTN Mobile Money, Airtel Money
- **Currency:** UGX
- **Payment types:** taxes, passports, driving permits, land fees, business registration, court fines, local government fees
- **Regions:** Kampala, Wakiso, Mukono, Jinja, Mbarara, Gulu, Mbale, Arua, Fort Portal, Masaka

---

## Mock API Layer (`src/services/mockApi.ts`)

- All functions return `Promise` with configurable delay (default 400ms)
- Grouped by domain: `transactionsApi`, `settlementsApi`, `participantsApi`, `collectionsApi`, `disputesApi`, `complianceApi`, `routingApi`, `reportsApi`
- TanStack Query wraps all — loading skeletons shown during delay

---

## Folder Structure

```
src/
  routes/
  components/
    layout/       # AppShell, Sidebar, Topbar, PageHeader
    ui/           # Modal, Drawer, Toast, Badge, DataTable, Stepper, Timeline
    charts/       # Recharts wrappers
    flows/        # Animated flow diagrams
    tables/       # DataTable with sort/filter
    modals/       # Feature-specific modals
    cards/        # KPI cards, stat cards, participant cards
  data/
  features/       # 13 feature folders
  services/
  hooks/
  types/
  store/          # Zustand stores
  utils/
    animations.ts # Shared Framer Motion variants
```

---

## Functional Constraints

- Every button performs a mock action, opens a modal, updates UI state, or shows a toast — no dead buttons
- No real payment processing, no real credentials, no external financial API calls
- All pages navigable
- Responsive: desktop-first, also works on tablets
- `.superpowers/` added to `.gitignore`
