# Uganda GovPay Switch

> **DEMO ONLY** — This is a demonstration UI for a national payment infrastructure platform. No real payment processing, no real credentials, no external financial API calls. All data is mocked.

A full-depth, 13-module demo application simulating the Government of Uganda's national Payment Service Provider / Payment System Operator platform, built to present to senior government officials, central bank stakeholders, treasury officers, banks, and payment operators.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → select a role → explore the platform.

## Modules

| Module | Path | Description |
|---|---|---|
| Dashboard | /app/dashboard | Executive KPIs, live transaction feed, charts |
| Payment Simulator | /app/simulator | Animated 10-node payment flow with 4 scenarios |
| Collections | /app/collections | 3-step stepper for government service payments |
| Payment Routing | /app/routing | Channel health grid and route test visualizer |
| Participants | /app/participants | Banks, MNOs, agencies management with drawer |
| Settlement | /app/settlement | Batch settlement with approvals and CSV export |
| Reconciliation | /app/reconciliation | Match rates, exception management, resolution modal |
| Compliance & Risk | /app/compliance | AML alerts, velocity chart, blacklist, audit log |
| Disputes & Refunds | /app/disputes | SLA countdown, resolution workflow, timeline |
| API Platform | /app/api-platform | Developer portal with 8 endpoints and Try It modal |
| Operations Center | /app/operations | Uganda SVG map, live stream, queue depths, incidents |
| Reports & Analytics | /app/reports | 6 analytics charts, treasury summary, CSV export |
| Admin & Configuration | /app/admin | Role matrix, routing reorder, limits, notifications |

## Roles Available at Login

- **Super Admin** — Full system access
- **Bank of Uganda Operator** — Central bank oversight
- **Treasury Officer** — Settlement and treasury management
- **Agency Officer** — Government agency collections
- **Compliance Officer** — AML, risk, and audit
- **Settlement Officer** — Batch settlement operations
- **Support Officer** — Dispute resolution
- **Developer** — API integration and sandbox access

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 6 + React 19 + TypeScript |
| Routing | TanStack Router v1 (declarative) |
| Data fetching | TanStack Query v5 |
| Global state | Zustand v5 |
| Styling | Tailwind CSS v3 (custom design tokens) |
| Animations | Framer Motion v12 |
| Charts | Recharts v2 |
| UI primitives | Radix UI (Dialog, Tabs, Tooltip, Select, etc.) |
| Icons | Lucide React |

## Design

- **Theme:** Light government — deep navy sidebar (#1B3A6B), white content canvas, gold accents (#F4B000), red alerts (#D62828)
- **Font:** Inter
- **Responsive:** Desktop-first; also works on tablets

## Limitations

- All data is generated locally — no real payments are processed
- Role selection at login is for demo purposes only (no real authentication)
- Live transaction feed is simulated via `setInterval` (4-second interval)
- `npm run build` produces a static bundle suitable for hosting anywhere

## Project Structure

```
src/
  components/       Shared UI components (layout, ui, charts)
  data/             Mock data files (agencies, participants, transactions, etc.)
  features/         Feature-specific sub-components
  hooks/            Custom hooks (useLiveUpdates)
  routes/           Page components for each module
  services/         Mock API service layer
  store/            Zustand global store
  types/            Shared TypeScript interfaces
  utils/            Animation variants and format utilities
```
