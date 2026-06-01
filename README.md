# Uganda GovPay Switch

> **DEMO APPLICATION — NO REAL PAYMENT PROCESSING**  
> All transactions, institutions, settlements, and financial data are simulated. No real credentials, no real APIs, no external financial calls.

---

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-v1-FF4154)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion)
[![License](https://img.shields.io/badge/License-Government_of_Uganda-yellow)](https://www.finance.go.ug)

---

## Overview

The **Uganda GovPay Switch** is a full-depth demo frontend for a proposed national Payment Service Provider (PSP) / Payment System Operator (PSO) platform for the Government of Uganda. It simulates the operations of a sovereign national payment infrastructure — the Uganda National Payment Switch (UNPS) — conceptually analogous to Nigeria's NIBSS or Kenya's PesaLink, but purpose-built for Uganda's regulatory, institutional, and technical landscape.

This demo is designed to present to **senior government officials, Bank of Uganda stakeholders, treasury officers, commercial banks, mobile money operators, and payment regulators** to illustrate how such an infrastructure would look, feel, and operate at a national scale.

### What it demonstrates

```
Citizens / Businesses / Government Agencies
         │
         ▼
  ┌──────────────────────────────────────────┐
  │         Uganda GovPay Switch             │
  │   National Payment Infrastructure        │
  │                                          │
  │  ┌─────────┐  ┌──────────┐  ┌────────┐  │
  │  │ Routing │  │Settlement│  │  Risk  │  │
  │  │ Engine  │  │  Engine  │  │  AML   │  │
  │  └─────────┘  └──────────┘  └────────┘  │
  │                                          │
  │  ┌──────────────────────────────────┐   │
  │  │  Banks · MNOs · Gov Agencies    │   │
  │  │  Stanbic · MTN · Airtel · URA   │   │
  │  └──────────────────────────────────┘   │
  └──────────────────────────────────────────┘
         │
         ▼
  BOU Settlement · Treasury · Reconciliation
```

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Platform Modules](#platform-modules)
3. [Security Features](#security-features)
4. [Roles & Access Control](#roles--access-control)
5. [Architecture](#architecture)
   - [High-Level System Architecture](#high-level-system-architecture)
   - [Frontend Architecture](#frontend-architecture)
   - [Full-Stack Architecture (Production Target)](#full-stack-architecture-production-target)
   - [Microservices Layout](#microservices-layout)
   - [Database Architecture](#database-architecture)
   - [Event-Driven Architecture](#event-driven-architecture)
6. [Technology Stack](#technology-stack)
7. [Project Structure](#project-structure)
8. [API Reference](#api-reference)
9. [Mock Data Coverage](#mock-data-coverage)
10. [Business Workflows](#business-workflows)
11. [Non-Functional Requirements (Production Target)](#non-functional-requirements-production-target)
12. [Integration Standards](#integration-standards)
13. [Implementation Roadmap](#implementation-roadmap)
14. [Disaster Recovery Strategy](#disaster-recovery-strategy)
15. [Compliance & Regulatory Framework](#compliance--regulatory-framework)
16. [Design System](#design-system)
17. [Known Limitations](#known-limitations)

---

## Quick Start

```bash
# Prerequisites: Node.js 20+ (LTS)
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Login flow:**
1. Select your role from the login screen
2. A one-time passcode (TOTP) is generated — shown on screen for demo convenience
3. Enter the 6-digit code to complete multi-factor authentication
4. You are placed in a role-scoped session with full audit logging

```bash
# Production build
npm run build

# Type check
npx tsc --noEmit
```

---

## Platform Modules

| # | Module | Path | Description |
|---|--------|------|-------------|
| 1 | **Dashboard** | `/app/dashboard` | Executive KPIs, animated counters, live transaction feed, channel breakdown, treasury settlement status, fraud alerts |
| 2 | **Payment Simulator** | `/app/simulator` | Interactive 10-node animated payment flow: success, failure, retry, timeout, and reversal scenarios |
| 3 | **Collections** | `/app/collections` | 3-step stepper for government service payments across URA, NIRA, URSB, Police, Immigration, Local Government |
| 4 | **Payment Routing** | `/app/routing` | Channel health grid, routing rules, fee configuration, fallback routing, animated route visualizer |
| 5 | **Participants** | `/app/participants` | Banks, MNOs, agencies management — API health, SLA status, risk rating, settlement accounts, drawer profile view |
| 6 | **Settlement** | `/app/settlement` | Batch settlement with approvals, animated pipeline, net/gross positions, treasury accounts, CSV mock export |
| 7 | **Reconciliation** | `/app/reconciliation` | Match rates, exception queue, animated reconciliation run, manual resolution modal, mismatch categories |
| 8 | **Compliance & Risk** | `/app/compliance` | AML alerts, transaction velocity chart, blacklist management, audit trail |
| 9 | **Disputes & Refunds** | `/app/disputes` | SLA countdown timers, multi-step resolution workflow, dispute timeline, evidence mock attachments |
| 10 | **API Platform** | `/app/api-platform` | Developer portal — 8 API endpoint cards, Try It modal, example request/response, webhook logs, sandbox status |
| 11 | **Operations Center** | `/app/operations` | Uganda SVG regional map, live transaction stream, queue depth gauges, channel health, system component status |
| 12 | **Reports & Analytics** | `/app/reports` | 6 analytics charts, revenue by agency, channel breakdown, treasury summary, settlement trends, CSV export |
| 13 | **Admin & Configuration** | `/app/admin` | Role matrix, routing priority, transaction limits, settlement cycles, notification templates, webhooks, **Security tab**, **Privacy/PDPA tab** |
| 14 | **Architecture** | `/app/architecture` | Interactive system architecture diagram with print-to-PDF export |

---

## Security Features

This demo application implements a full mock security stack to demonstrate how a production deployment would be secured.

### Multi-Factor Authentication (MFA)

```
Step 1: Role Selection
        ↓
Step 2: TOTP Verification (6-digit OTP)
        ├── Code expires in 5 minutes
        ├── 3 attempts before lockout
        ├── New code can be generated on demand
        └── Session encrypted with TLS 1.3 / AES-256-GCM
        ↓
Step 3: Authenticated Session
        ├── Session ID: UUID v4
        ├── IP address logged
        ├── Expiry: 8 hours
        └── All actions audit-logged
```

**MFA policy by role:**

| Role | Required | Method |
|------|----------|--------|
| Super Admin | ✓ | TOTP + Hardware Key |
| Bank of Uganda Operator | ✓ | TOTP |
| Treasury Officer | ✓ | TOTP |
| Compliance Officer | ✓ | TOTP |
| Settlement Officer | ✓ | TOTP |
| Agency Officer | ✓ | SMS OTP |
| Support Officer | ✓ | SMS OTP |
| Developer | ✓ | TOTP |

### Role-Based Access Control (RBAC)

Every route has an explicit access control list. Attempting to access a restricted module shows an **Access Restricted** screen listing the permitted roles, rather than a silent redirect.

| Module | Permitted Roles |
|--------|----------------|
| Dashboard | All roles |
| Payment Simulator | All roles |
| Collections | Super Admin, Agency Officer, Support Officer, Treasury Officer |
| Routing | Super Admin, Bank of Uganda Operator |
| Participants | Super Admin, Bank of Uganda Operator, Treasury Officer, Settlement Officer |
| Settlement | Super Admin, Treasury Officer, Settlement Officer, Bank of Uganda Operator |
| Reconciliation | Super Admin, Treasury Officer, Settlement Officer |
| Compliance & Risk | Super Admin, Bank of Uganda Operator, Compliance Officer |
| Disputes | Super Admin, Support Officer, Settlement Officer, Compliance Officer |
| API Platform | Super Admin, Developer |
| Operations Center | Super Admin, Bank of Uganda Operator, Treasury Officer |
| Reports | All roles |
| Admin & Configuration | Super Admin only |
| Architecture | All roles |

The sidebar renders a 🔒 lock icon on routes the active role cannot access, with a tooltip listing the required roles.

### Data Encryption

| Layer | Algorithm | Notes |
|-------|-----------|-------|
| Database (PostgreSQL) | AES-256-GCM | Tablespace encryption via pgcrypto + HSM-backed keys |
| File Storage (settlements) | AES-256-GCM | Encrypted at write; keys rotated every 90 days |
| Audit Logs | AES-256-GCM | Immutable append-only store; WORM policy enforced |
| API Secrets / Keys | RSA-4096 (wrap) | Keys wrapped with HSM master key; never stored plaintext |
| Data in Transit | TLS 1.3 | All API traffic and admin sessions |

### Audit Logging

Every state-changing operation generates an immutable `SecurityEvent` record stored in the Zustand store and displayed in real-time in the **Admin → Security** tab. The audit log captures:

- Actor (username + role)
- Action type (`LOGIN`, `MFA_VERIFIED`, `MFA_FAILED`, `SETTLEMENT_APPROVED`, `CONFIG_CHANGED`, `ROUTE_ACCESS_DENIED`, etc.)
- Resource identifier
- Timestamp (epoch ms)
- IP address
- Session ID

Historical audit entries from `mockCompliance.ts` are merged with live session events, sorted by timestamp descending.

### Session Security Indicator (Topbar)

The topbar displays a **"MFA Verified"** badge that opens a security panel showing:

- MFA verification status (method, time)
- Cipher: AES-256-GCM
- Transport: TLS 1.3
- Session ID (truncated)
- IP address
- Session age / time to expiry
- Data-at-rest encryption status
- PDPA compliance note

---

## Roles & Access Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Role Hierarchy                                  │
│                                                                      │
│  Super Admin          ──────── Full system + configuration           │
│  Bank of Uganda Op.   ──────── Oversight, compliance, reporting      │
│  Treasury Officer     ──────── Settlement + treasury management      │
│  Compliance Officer   ──────── AML, risk, audit functions           │
│  Settlement Officer   ──────── Batch settlement operations           │
│  Agency Officer       ──────── Government agency collections         │
│  Support Officer      ──────── Dispute resolution + support          │
│  Developer            ──────── API integration + sandbox             │
└─────────────────────────────────────────────────────────────────────┘
```

Select your role at the login screen. The RBAC enforcement is applied both at the **route level** (via TanStack Router's `beforeLoad`) and at the **component level** (lock icons, disabled actions).

---

## Architecture

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  ACCESS LAYER                                                          │
│  Citizens · Banks · MNOs · Merchants · Gov Agencies · Regulators       │
│  Web Portal · Mobile App · API Clients · POS · USSD · ATM             │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│  API GATEWAY & SECURITY LAYER                                          │
│  Spring Cloud Gateway · JWT Validation · Rate Limiting                 │
│  mTLS · IP Allowlisting · WAF · OWASP Rule Set                        │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│  APPLICATION SERVICES LAYER — Spring Boot Microservices                │
│                                                                        │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Identity │ │Institution│ │Transaction │ │Interbank │ │  Mobile │  │
│  │ & Auth   │ │ Registry  │ │   Switch   │ │ Transfer │ │  Money  │  │
│  └──────────┘ └───────────┘ └────────────┘ └──────────┘ └─────────┘  │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌─────────┐  │
│  │Gov Coll. │ │Settlement │ │Reconcilia- │ │   Risk   │ │Notifica-│  │
│  │ Service  │ │  Service  │ │   tion     │ │Compliance│ │  tion   │  │
│  └──────────┘ └───────────┘ └────────────┘ └──────────┘ └─────────┘  │
└───────────────────────┬──────────────────────────────┬────────────────┘
                        │                              │
       ┌────────────────▼────────┐      ┌─────────────▼────────────────┐
       │   PAYMENT RAILS         │      │   RISK & COMPLIANCE ENGINE    │
       │  Commercial Banks       │      │  Fraud Scoring · AML          │
       │  MTN · Airtel · PSPs    │      │  Blacklist · Velocity Checks  │
       │  Gov Agencies           │      │  Sanctions Screening          │
       └─────────────────────────┘      └──────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│  DATA & MESSAGING LAYER                                                │
│  PostgreSQL 16 · Redis 7 · Apache Kafka · OpenSearch                  │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│  SETTLEMENT & RECONCILIATION                                           │
│  Net Position Calculation · Batch Settlement · Exception Management    │
│  BOU Regulatory Reporting · Daily Settlement Files                     │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│  OBSERVABILITY & GOVERNANCE LAYER                                      │
│  Prometheus · Grafana · OpenSearch · Distributed Tracing (Jaeger)      │
│  Regulatory Audit Logs · Immutable Event Archive                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

The demo frontend is a React enterprise operations portal used by switch operators, regulators, bank representatives, PSPs, and government agencies. It is the first deliverable in a 4-phase implementation roadmap.

**State management:**

```
┌──────────────────────────────────────────────────┐
│  Zustand Store (appStore.ts)                     │
│                                                  │
│  ├── activeRole: Role | null                     │
│  ├── mfaVerified: boolean                        │
│  ├── sessionInfo: SessionInfo | null             │
│  ├── mfaChallenge: MfaChallenge | null           │
│  ├── securityEvents: SecurityEvent[]             │
│  ├── liveTransactions: Transaction[]             │
│  └── toasts: Toast[]                             │
│                                                  │
│  Actions: setRole · startMfaChallenge            │
│           verifyMfa · logout                     │
│           pushSecurityEvent · addToast           │
└──────────────────────────────────────────────────┘
```

**Data flow:**

```
Route Guard (beforeLoad)
     │
     ├── role missing → redirect /login
     ├── mfa flag missing → redirect /login
     └── role lacks permission → render AccessDenied
              │
              ▼
     Page Component
              │
              ├── TanStack Query → mockApi (async delay)
              ├── Zustand store reads (role, session, toasts)
              └── pushSecurityEvent() on state changes
```

### Full-Stack Architecture (Production Target)

```
User Browser / Mobile App / Institution API Client
         │ HTTPS / mTLS
         ▼
Nginx Ingress Controller + WAF (Cloud Load Balancer)
         │
         ├── → React SPA (Nginx static, CDN-cached assets)
         │
         └── → Spring Cloud Gateway (2+ replicas, Kubernetes HPA)
                      │
                      ├── Identity Service (Keycloak / OAuth2 / OIDC / MFA)
                      ├── Institution Registry Service
                      ├── Transaction Switch Service  ◄── Core engine
                      ├── Interbank Transfer Service
                      ├── Mobile Money Interop Service
                      ├── Government Collections Service
                      ├── Settlement Service
                      ├── Reconciliation Service
                      ├── Risk & Compliance Service   ◄── Real-time + async
                      ├── Notification Service
                      └── Reporting & Analytics Service
                                    │
          ┌───────────────┬─────────┴──────────┬──────────────┐
          ▼               ▼                    ▼              ▼
   PostgreSQL 16     Redis Cluster        Apache Kafka    OpenSearch
   (Primary +        (3-node sentinel)    (3-broker)      (3-node)
    2 read replicas)
```

### Microservices Layout

```
uganda-payment-switch/
  ├── api-gateway-service/              # Spring Cloud Gateway
  ├── identity-service/                 # Auth, JWT, RBAC, Keycloak
  ├── institution-service/              # Institution registry & health
  ├── transaction-switch-service/       # Core switching engine
  ├── interbank-transfer-service/       # Bank-to-bank transfers
  ├── mobile-money-service/             # Wallet interoperability
  ├── government-collections-service/   # URA, NSSF, KCCA, etc.
  ├── settlement-service/               # Net settlement & batch
  ├── reconciliation-service/           # Exception management
  ├── risk-compliance-service/          # Fraud & AML
  ├── notification-service/             # SMS, email, webhooks
  ├── reporting-service/                # Analytics & reports
  │
  └── common/
      ├── common-domain/                # Shared JPA entities & enums
      ├── common-security/              # JWT filter, security config
      ├── common-events/                # Kafka event DTOs
      ├── common-exceptions/            # Global exception hierarchy
      └── common-utils/                 # Formatters, validators
```

**Modular monolith layout (MVP starting point):**

```
uganda-payment-switch-api/
  src/main/java/ug/gov/paymentswitch/
    PaymentSwitchApplication.java

    auth/                              # Authentication & authorization
    institutions/                      # Institution registry
    transactions/                      # Core transaction switching
    interbank/                         # Interbank transfer logic
    mobilemoney/                       # Mobile money interop
    governmentcollections/             # Gov agency payments
    settlements/                       # Settlement processing
    reconciliation/                    # Reconciliation engine
    risk/                              # Risk & compliance
    notifications/                     # Notification dispatch
    reports/                           # Report generation
    config/                            # Spring configuration
    common/                            # Shared utilities
```

> **Package convention:** Each module follows `controller/ → service/ → repository/ → domain/ → dto/ → mapper/`.

### Database Architecture

PostgreSQL 16 is the primary database. Each microservice owns its schema in production.

| Module | Tables | Notes |
|--------|--------|-------|
| **Identity** | `users`, `roles`, `permissions`, `institution_users`, `api_clients`, `refresh_tokens`, `login_audit` | Keycloak manages auth; app-level user data here |
| **Institutions** | `institutions`, `institution_profiles`, `institution_endpoints`, `institution_credentials`, `institution_limits` | Soft-delete; status history tracked |
| **Transactions** | `transactions`, `transaction_status_history`, `transaction_events`, `transaction_participants`, `transaction_metadata` | Append-only status history — never update in place |
| **Payment Rails** | `payment_rails`, `rail_routing_rules`, `rail_health` | Configurable rules per institution type |
| **Government** | `government_agencies`, `collection_references`, `government_payments`, `agency_notifications`, `agency_settlements` | PRN/TIN validation rules per agency |
| **Settlement** | `settlement_batches`, `settlement_positions`, `settlement_ledger_entries`, `settlement_approvals`, `settlement_reports` | Ledger entries are immutable; corrections via reversal entries |
| **Reconciliation** | `reconciliation_records`, `reconciliation_exceptions`, `reconciliation_runs` | Stores both switch-side and institution-side records |
| **Risk** | `risk_rules`, `risk_alerts`, `blacklist_entries`, `velocity_checks`, `compliance_cases`, `audit_logs` | Audit logs are write-once, never updated |
| **Notifications** | `notifications`, `webhook_events`, `notification_templates` | Webhook retry state tracked in Redis |
| **Reports** | `reports`, `report_schedules`, `report_exports` | Generated files in object storage; metadata in DB |

**Key database design decisions:**
- **UUID v7 primary keys** — time-ordered, distributed-safe, no coordination needed
- **Append-only audit tables** — `transaction_status_history` and `audit_logs` are insert-only
- **Optimistic locking** — `@Version` on `Transaction` and `SettlementBatch` to prevent concurrent modification
- **Monthly partitioning** — `transactions` table partitioned by month for query performance
- **Read replicas** — reporting queries routed away from the primary to avoid impacting payment processing
- **Connection pooling** — HikariCP + PgBouncer in front of PostgreSQL

### Event-Driven Architecture

Apache Kafka is the backbone of asynchronous service communication. All significant transaction lifecycle changes are published as durable, ordered events.

**Kafka topic design:**

| Topic | Producers | Consumers | Retention |
|-------|-----------|-----------|-----------|
| `txn.initiated` | Transaction Switch | Risk, Notification, Audit | 7 days |
| `txn.validated` | Transaction Switch | Interbank, MobileMoney, GovCollections | 7 days |
| `txn.risk.passed` | Risk Service | Transaction Switch | 7 days |
| `txn.risk.failed` | Risk Service | Transaction Switch, Notification, Compliance | 30 days |
| `txn.successful` | Transaction Switch | Settlement, Notification, Reporting, Audit | 7 days |
| `txn.failed` | Transaction Switch | Notification, Reporting, Audit | 30 days |
| `txn.reversed` | Transaction Switch | Settlement, Notification, Reconciliation | 30 days |
| `settlement.entry.created` | Settlement Service | Reconciliation, Reporting | 90 days |
| `risk.alert.created` | Risk Service | Notification, Compliance, Reporting | 365 days |
| `webhook.delivery.failed` | Notification Service | Notification Service (retry) | 7 days |

> **Dead Letter Queue:** All consumers implement a DLQ pattern. Messages failing after 3 retries go to `{topic}.dlq` and trigger an operations alert.

**Transaction lifecycle states:**

```
INITIATED → VALIDATING → NAME_ENQUIRY → RISK_CHECK → ROUTING
         → PROCESSING → SUCCESSFUL → SETTLED
                      → FAILED
                      → REVERSED
```

---

## Technology Stack

### Demo (this repository)

| Layer | Technology | Version |
|-------|-----------|---------|
| Build | Vite | 6 |
| UI Framework | React | 19 |
| Language | TypeScript | 5 |
| Routing | TanStack Router | v1 (declarative, type-safe) |
| Data Fetching | TanStack Query | v5 |
| Global State | Zustand | v5 |
| Styling | Tailwind CSS | v3 (custom design tokens) |
| Animations | Framer Motion | v12 |
| Charts | Recharts | v2 |
| UI Primitives | Radix UI | Dialog, Tabs, Tooltip, Select |
| Icons | Lucide React | latest |

### Production Target (full-stack)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend API** | Java 21 + Spring Boot 3 | Virtual threads (Project Loom) for high-concurrency without reactive complexity. Mature ecosystem for financial systems. |
| **API Gateway** | Spring Cloud Gateway | Path routing, JWT validation, rate limiting, mTLS, circuit breaking |
| **Identity** | Keycloak | Self-hosted OAuth2/OIDC, no vendor lock-in, MFA, federation, fine-grained authorization |
| **Database** | PostgreSQL 16 | ACID compliance, row-level locking, JSON support, proven at national-scale workloads |
| **Cache** | Redis 7 | Sub-millisecond idempotency key lookups, rate limiting counters, session caching |
| **Messaging** | Apache Kafka | Durable ordered event log; enables replay, audit, and decoupled service communication |
| **Search / Logs** | OpenSearch | Centralized structured log search and audit trail querying |
| **Observability** | Prometheus + Grafana + Jaeger | Metrics, dashboards, distributed tracing |
| **Container** | Docker + Kubernetes | Horizontal pod autoscaling, rolling deployments, Kubernetes StatefulSets for databases |

---

## Project Structure

```
src/
  components/
    layout/
      AppShell.tsx            # Root shell with sidebar + topbar
      Sidebar.tsx             # Collapsible nav with RBAC lock icons + logout
      Topbar.tsx              # Breadcrumb + MFA badge + session security panel
      CommandPalette.tsx      # ⌘K global search
      NotificationPanel.tsx   # Real-time notification drawer

    ui/
      Badge.tsx               # Status, severity, and variant badges
      DataTable.tsx           # Sortable, filterable data table
      Drawer.tsx              # Right-side detail panel
      KPICard.tsx             # Animated metric card
      Modal.tsx               # Accessible dialog
      PageHeader.tsx          # Page title + subtitle
      Skeleton.tsx            # Loading placeholders
      Stepper.tsx             # Multi-step workflow progress
      Timeline.tsx            # Transaction / audit event timeline
      ToastStack.tsx          # Stacked toast notifications
      TransactionDrawer.tsx   # Transaction lifecycle detail drawer

    charts/
      AreaChart.tsx           # Area/line chart (Recharts)
      BarChart.tsx            # Bar chart (Recharts)
      LineChart.tsx           # Line chart (Recharts)
      PieChart.tsx            # Donut/pie chart (Recharts)

    flows/
      FlowDiagram.tsx         # Animated payment flow diagram (simulator)

    cards/
      KPICard.tsx

  data/
    mockAgencies.ts           # URA, NIRA, URSB, Police, Immigration, KCCA, MoW
    mockParticipants.ts       # Stanbic, Centenary, DFCU, Equity, MTN, Airtel
    mockTransactions.ts       # 50+ transactions across all statuses and channels
    mockSettlements.ts        # Settlement batches with net/gross positions
    mockDisputes.ts           # Dispute queue with SLA countdowns
    mockCompliance.ts         # AML alerts, blacklist, full audit log with security events
    mockRouting.ts            # Routing rules, fee configuration, channel health
    mockReports.ts            # Report data (volume, revenue, channel breakdown)

  features/
    dashboard/
      AlertStrip.tsx          # Scrolling fraud/compliance alert banner
      TransactionFeed.tsx     # Live auto-updating transaction feed
    participants/
      ParticipantDrawer.tsx   # Participant detail panel
    simulator/
      FlowDiagram.tsx         # Animated payment flow

  routes/
    login.tsx                 # 2-step login: role select + TOTP MFA
    app/
      dashboard.tsx           # Executive KPI dashboard
      simulator.tsx           # Payment flow simulator
      collections.tsx         # Government collections stepper
      routing.tsx             # Routing & channel health
      participants.tsx        # Participant management
      settlement.tsx          # Settlement batches
      reconciliation.tsx      # Reconciliation engine
      compliance.tsx          # AML & risk
      disputes.tsx            # Dispute queue
      api-platform.tsx        # Developer portal
      operations.tsx          # Live operations center
      reports.tsx             # Analytics & reports
      admin.tsx               # Admin configuration (incl. Security + PDPA tabs)
      architecture.tsx        # System architecture diagram

  services/
    mockApi.ts               # Async mock API layer (simulates network latency)

  store/
    appStore.ts              # Zustand store: auth, MFA, session, security events, toasts

  types/
    index.ts                 # All TypeScript interfaces and enums

  utils/
    animations.ts            # Framer Motion variant presets
    format.ts                # UGX formatting, date/time formatting

  router.tsx                 # TanStack Router: routes, RBAC guards, AccessDenied
  main.tsx                   # React app entry point
  index.css                  # Tailwind + custom design tokens
```

---

## API Reference

In production, all endpoints follow a consistent REST envelope:

```json
{
  "status": "success",
  "code": "TXN_001",
  "message": "Transaction initiated successfully",
  "data": { },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-01T10:00:00Z",
    "version": "v1"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1450,
    "totalPages": 73
  }
}
```

**Authentication:**
```
POST /api/v1/auth/login               # Username/password → JWT
POST /api/v1/auth/refresh-token       # Refresh JWT
POST /api/v1/auth/logout              # Revoke refresh token
GET  /api/v1/auth/me                  # Current user profile
POST /api/v1/auth/mfa/verify          # Verify TOTP code
POST /api/v1/auth/api-keys            # Generate institution API key
```

**Transactions:**
```
GET  /api/v1/transactions             # Search transactions
POST /api/v1/transactions             # Initiate transaction
GET  /api/v1/transactions/{id}        # Transaction detail
GET  /api/v1/transactions/{id}/timeline
GET  /api/v1/transactions/reference/{ref}
POST /api/v1/transactions/{id}/reverse
GET  /api/v1/transactions/stats/summary
```

**Government Collections:**
```
GET  /api/v1/government/agencies
POST /api/v1/government/validate-reference   # Validate PRN/TIN
POST /api/v1/government/collections/pay      # Submit payment
GET  /api/v1/government/collections/{id}
GET  /api/v1/government/agencies/{id}/collections
GET  /api/v1/government/agencies/{id}/reports
```

**Settlement:**
```
GET  /api/v1/settlements
POST /api/v1/settlements/batches
GET  /api/v1/settlements/batches/{id}
POST /api/v1/settlements/batches/{id}/approve
POST /api/v1/settlements/batches/{id}/close
GET  /api/v1/settlements/positions
```

**Risk & Compliance:**
```
GET  /api/v1/risk/alerts
POST /api/v1/risk/alerts/{id}/review
GET  /api/v1/risk/blacklist
POST /api/v1/risk/blacklist
GET  /api/v1/risk/rules
POST /api/v1/risk/rules
```

> The demo's mock API layer (`src/services/mockApi.ts`) simulates all of these endpoints with async delays of 200–600ms to match realistic network latency.

---

## Mock Data Coverage

All mock data uses realistic Ugandan names, amounts in UGX, and actual Ugandan institutions and regions.

| Data File | Records | Coverage |
|-----------|---------|----------|
| `mockTransactions.ts` | 50+ | All statuses, amounts UGX 5,000–500M, all channels and regions |
| `mockParticipants.ts` | 14 | Banks (Stanbic, Centenary, DFCU, Equity, Absa, BoA, HFB), MNOs (MTN, Airtel), Agencies, Treasury |
| `mockAgencies.ts` | 8 | URA, NIRA, URSB, Ministry of Lands, Uganda Police, Immigration, KCCA, Ministry of Works |
| `mockSettlements.ts` | 15+ | Settlement batches across 90 days with completed/failed/pending states |
| `mockDisputes.ts` | 10+ | Disputes with SLA timers and multi-step resolution workflows |
| `mockCompliance.ts` | 30+ | AML alerts, 3 blacklisted accounts, 16 audit log entries (including MFA events) |
| `mockRouting.ts` | 8 | Routing rules with priority, fees, channel health status |
| `mockReports.ts` | — | 90-day daily volume stats, agency revenue, channel breakdown |

**Ugandan regions covered:** Kampala · Wakiso · Mukono · Jinja · Mbarara · Gulu · Mbale · Arua · Fort Portal · Masaka

**Payment channels:** MTN Mobile Money · Airtel Money · Bank Transfer · Visa/Mastercard · USSD

---

## Business Workflows

### Bank-to-Bank Transfer

```
1. Customer initiates via bank channel
2. Origin bank submits to switch API
3. Switch validates + checks idempotency key
4. Name enquiry → destination bank account name
5. Risk engine: real-time fraud scoring (< 200ms)
6. Routing engine selects destination endpoint
7. Destination bank processes credit request
8. Switch marks SUCCESSFUL, publishes Kafka event
9. Settlement ledger entry created asynchronously
10. SMS/push notifications to both parties

SLA Target: P95 < 10 seconds | P99 < 30 seconds
```

### Government Tax Payment (URA)

```
1. Taxpayer obtains Payment Registration Number (PRN) from URA
2. Initiates payment via bank or mobile money
3. Switch validates PRN against URA reference database
4. Payment routed to URA collection account at BOU
5. URA receives payment notification with PRN
6. Reconciliation record created for daily recon
7. Taxpayer receives confirmation with receipt number
```

### Mobile Money to Bank Transfer

```
1. Customer initiates from MTN/Airtel USSD or app
2. MNO submits wallet debit request to switch
3. Switch validates wallet balance & bank account
4. Risk check performed (< 200ms)
5. Switch debits wallet via MNO API, credits bank account
6. Settlement position updated: MNO ↔ Bank
7. Both parties notified
```

### End-of-Day Settlement

```
1. Settlement window closes (configurable, e.g. 23:00 EAT)
2. Settlement service groups transactions by institution pair
3. Net positions calculated (multilateral netting)
4. Reconciliation checks run — exceptions flagged
5. Settlement officer reviews and approves batch
6. BOU settlement accounts debited/credited
7. Settlement report distributed to all institutions
```

---

## Non-Functional Requirements (Production Target)

| Category | Requirement | Target |
|----------|-------------|--------|
| **Availability** | API Gateway uptime | 99.99% (≤ 52 min downtime/year) |
| **Availability** | Transaction Switch uptime | 99.95% (≤ 4.4 hrs downtime/year) |
| **Performance** | Transaction P50 latency | < 1 second end-to-end |
| **Performance** | Transaction P99 latency | < 3 seconds end-to-end |
| **Throughput** | Peak TPS (Phase 3) | 1,000 transactions/second |
| **Throughput** | Peak TPS (Phase 4) | 5,000 transactions/second |
| **Scalability** | Horizontal scaling | All services scale independently via Kubernetes HPA |
| **Durability** | Transaction data retention | 7 years minimum (BOU regulatory requirement) |
| **Recovery** | RTO | < 4 hours for full service restoration |
| **Recovery** | RPO | < 15 minutes data loss in worst case |
| **Security** | Penetration testing | Annual third-party pen test + quarterly vulnerability scans |
| **Compliance** | Regulatory reporting | Daily automated reports to BOU by 06:00 EAT |
| **Auditability** | Audit log completeness | 100% of state-changing operations logged |

**Key Monitoring Metrics:**

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Transaction Success Rate | ≥ 99.5% | Alert < 99% |
| P99 End-to-End Latency | < 3s | Alert > 5s |
| API Gateway Uptime | 99.99% | Page on-call if drops |
| Settlement Queue at EOD | 0 unsettled | Alert if unsettled at window close |
| Kafka Consumer Lag | < 1,000 msgs | Alert > 5,000 msgs |
| DB Connection Pool | < 80% used | Alert at 90% utilization |

---

## Integration Standards

All institutions connecting to the UNPS must conform to published integration standards.

| Standard | Applies To | Details |
|----------|-----------|---------|
| **ISO 20022** | All financial messages | XML-based messaging standard for interbank transfers and settlement |
| **REST / JSON** | API integration | HTTPS REST with JSON; OpenAPI 3.1 specs published |
| **OAuth2 / OIDC** | Authentication | Client credentials (M2M); authorization code + PKCE (user-facing) |
| **mTLS** | Institution connectivity | Mutual TLS with BOU-issued certificates for all production endpoints |
| **HMAC-SHA256** | Webhook delivery | All webhook payloads signed; institutions must verify `X-Signature` before processing |
| **UUID v7** | Transaction references | Time-ordered UUIDs for all entity identifiers |
| **ISO 8601** | Date/time fields | All timestamps in UTC ISO 8601; EAT offset applied in display only |
| **E.164** | Phone numbers | All mobile money wallet identifiers in E.164 format (`+256...`) |

---

## Implementation Roadmap

```
PHASE 1 — Demo UI (Months 1–2)                       ← YOU ARE HERE
  React dashboard · Mock data · Animated flows
  Stakeholder buy-in · Requirements validation

PHASE 2 — Backend MVP (Months 3–6)
  Spring Boot modular monolith · PostgreSQL
  JWT authentication · Institution registry
  Transaction APIs · Settlement APIs · Swagger docs
  First real transactions processed

PHASE 3 — Production-Grade Platform (Months 7–12)
  Spring Cloud Gateway · Kafka event streaming
  Redis caching · Risk engine · Reconciliation engine
  Monitoring stack · CI/CD pipeline
  Pilot with 3–5 institutions

PHASE 4 — National Scale (Months 13–24)
  mTLS institution connectivity · High availability
  Disaster recovery · Full BOU regulatory reporting
  Advanced fraud detection
  Integration with all major banks and MNOs
```

---

## Disaster Recovery Strategy

| Component | DR Approach | RPO | RTO |
|-----------|------------|-----|-----|
| **PostgreSQL** | Streaming replication to DR site; daily PITR backups to object storage | 5 min | 30 min |
| **Kafka** | MirrorMaker 2 cross-site replication | 1 min | 15 min |
| **Redis** | AOF persistence + RDB snapshots; DR warm standby | 1 min | 10 min |
| **Application Services** | Kubernetes deployments pre-staged at DR site; DNS failover | 0 (stateless) | 15 min |
| **Object Storage** | Cross-region replication for reports and exports | 15 min | 5 min |

> **Failover Procedure:** On primary site failure, the operations team initiates failover via a runbook that promotes the DR PostgreSQL replica, redirects Kafka consumers, and updates DNS to the DR Kubernetes cluster. Target RTO for full restoration: **4 hours**.

---

## Compliance & Regulatory Framework

### Bank of Uganda — National Payment Systems Act

- All payment switch operators must maintain **tamper-evident audit logs for a minimum of 7 years**
- Achieved through append-only database tables + Kafka event archival to cold storage
- Daily automated regulatory reports to BOU by 06:00 EAT

### Uganda Data Protection and Privacy Act, 2019 (PDPA)

The platform is aligned with all 14 principles of the PDPA 2019. The **Admin → Privacy / PDPA** tab provides a full compliance checklist with article references.

| Section | Principle | Status |
|---------|-----------|--------|
| S.11 | Lawful Processing | ✓ Compliant |
| S.12 | Purpose Limitation | ✓ Compliant |
| S.13 | Data Minimisation | ✓ Compliant |
| S.14 | Accuracy | ✓ Compliant |
| S.15 | Storage Limitation (7-year retention) | ✓ Compliant |
| S.16 | Integrity & Confidentiality (AES-256 + TLS 1.3) | ✓ Compliant |
| S.20 | Right of Access | ✓ Compliant |
| S.21 | Right to Rectification | ✓ Compliant |
| S.22 | Right to Erasure | ⟳ Under Review |
| S.23 | Right to Object | ✓ Compliant |
| S.29 | Cross-border Transfers | ✓ Compliant |
| S.32 | Data Breach Notification (72hr PDPO / 30d subjects) | ✓ Compliant |
| S.36 | Data Protection Officer | ✓ Appointed (Bank of Uganda) |
| S.40 | Privacy Impact Assessment | ⚠ Action Required (Jan 2027) |

**Data Protection Officer:** Bank of Uganda — Legal & Compliance Division  
**DPO Contact:** `dpo@bou.go.ug` · **PDPO Registration:** DPO-2024-BOU-0018

### Security Control Matrix

| Layer | Control | Implementation |
|-------|---------|----------------|
| Network | TLS 1.3 in transit | Nginx + internal CA |
| Network | mTLS for institutions | Client certificates per institution endpoint |
| Network | IP allowlisting | Institution IP ranges registered in gateway |
| Network | WAF | OWASP rule set |
| Identity | OAuth2 / OIDC | Keycloak with PKCE |
| Identity | MFA | TOTP (FIDO2-compatible) |
| Identity | API keys | HMAC-SHA256 signed, scoped per institution |
| Authorization | RBAC | Spring Security `@PreAuthorize` + route guards |
| Authorization | Institution scoping | All queries filtered by institution ID from JWT claims |
| Application | Rate limiting | Redis sliding window per API key |
| Application | Idempotency | Redis-backed key store (24-hour TTL) |
| Application | Webhook signatures | HMAC-SHA256 `X-Signature` header |
| Data | Encryption at rest | PostgreSQL TDE + disk-level encryption (AES-256-GCM) |
| Data | PII masking | Account numbers masked in logs and non-privileged responses |
| Audit | Immutable audit log | Write-once `audit_logs` table + Kafka event archive |
| Audit | Session tracking | All sessions logged with IP, device, duration |

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#1B3A6B` | Deep government navy — sidebar, primary actions |
| `--primary-light` | `#2A5298` | Hover states, active nav |
| `--accent` | `#F4B000` | Uganda gold — highlights, active indicators |
| `--danger` | `#D62828` | Uganda red — alerts, errors, critical badges |
| `--surface` | `#F8FAFC` | Page background |
| `--card` | `#FFFFFF` | Card and panel backgrounds |
| `--border` | `#E2E8F0` | Dividers and input borders |
| `--muted` | `#64748B` | Secondary text, placeholders |

**Responsive:** Desktop-first layout; functional on tablets (1024px+).  
**Fonts:** System UI stack (no external font dependency).  
**Animations:** Framer Motion — page transitions, card mount stagger, payment flow steps, live feed entries.

---

## Known Limitations

This is a **demo-only application:**

| Limitation | Note |
|-----------|------|
| No real payments | All transactions are simulated with mock data |
| No real authentication | Role selection and MFA are demonstrative only |
| No external APIs | No calls to banks, MNOs, or government systems |
| No persistent backend | All state is in-memory (Zustand) or `localStorage` |
| MFA code displayed in UI | In production, codes are sent via SMS/authenticator app |
| Live feed via `setInterval` | In production, this would be WebSocket or SSE |
| Session expires on reload | `localStorage` flags persist role/MFA; full session is in-memory |
| Build warning | 1.2MB JS bundle — expected for a demo; production would use code-splitting |

**Production deployment:** `npm run build` produces a fully static bundle deployable on any CDN, Nginx, or object storage (S3, GCS). No server runtime required for the frontend.

---

*Uganda GovPay Switch — Demo UI v2.0 · Government of Uganda · June 2026*  
*This application is a demonstration prototype. It is not for public distribution and does not process real financial transactions.*
