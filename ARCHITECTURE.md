# Uganda GovPay Switch — System Architecture

> **Document type:** Technical Architecture Reference  
> **Version:** 1.0.0  
> **Date:** 2026-06-01  
> **Classification:** Internal — Government of Uganda, Bank of Uganda, Approved System Integrators

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Principles](#3-architecture-principles)
4. [High-Level Architecture Diagram](#4-high-level-architecture-diagram)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Microservices](#6-backend-microservices)
   - 6.1 [govpay-gateway](#61-govpay-gateway--api-gateway)
   - 6.2 [govpay-auth](#62-govpay-auth--authentication--authorisation)
   - 6.3 [govpay-payment](#63-govpay-payment--core-payment-engine)
   - 6.4 [govpay-routing](#64-govpay-routing--payment-routing-engine)
   - 6.5 [govpay-collections](#65-govpay-collections--government-collections)
   - 6.6 [govpay-settlement](#66-govpay-settlement--settlement-engine)
   - 6.7 [govpay-reconciliation](#67-govpay-reconciliation--reconciliation-engine)
   - 6.8 [govpay-compliance](#68-govpay-compliance--amlkyc-compliance)
   - 6.9 [govpay-dispute](#69-govpay-dispute--dispute-management)
   - 6.10 [govpay-notification](#610-govpay-notification--notification-dispatcher)
   - 6.11 [govpay-reporting](#611-govpay-reporting--analytics--reporting)
   - 6.12 [govpay-participant](#612-govpay-participant--participant-management)
7. [Event-Driven Architecture (Apache Kafka)](#7-event-driven-architecture-apache-kafka)
8. [Data Architecture](#8-data-architecture)
9. [Security Architecture](#9-security-architecture)
10. [External System Integrations](#10-external-system-integrations)
11. [Infrastructure & DevOps](#11-infrastructure--devops)
12. [Payment Data Flow — End-to-End](#12-payment-data-flow--end-to-end)
13. [API Reference Summary](#13-api-reference-summary)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Disaster Recovery & Business Continuity](#15-disaster-recovery--business-continuity)
16. [Compliance & Regulatory Framework](#16-compliance--regulatory-framework)

---

## 1. Executive Summary

The **Uganda GovPay Switch** is a nationally operated Payment Service Provider (PSP) and Payment System Operator (PSO) platform owned and operated by the Government of Uganda under the oversight of the **Bank of Uganda**. It provides a unified payment infrastructure for:

- **Government revenue collection** — taxes, permits, fees, and fines across all ministries and agencies
- **Interbank payment routing** — clearing and settlement between commercial banks and mobile money operators
- **Treasury management** — real-time net settlement positions and consolidated reporting
- **Regulatory compliance** — AML/KYC monitoring, audit trails, and dispute resolution

The system processes an estimated **48,000+ transactions per day** with a target capacity of **10,000 transactions per second (TPS)** at peak load, handling over **UGX 24 billion** in daily payment value.

### Key Design Goals

| Goal | Approach |
|---|---|
| High availability (99.99% SLA) | Multi-AZ Kubernetes deployment with pod auto-scaling |
| Low latency (< 500ms P95) | Redis caching, async Kafka events, connection pooling |
| Security (PCI-DSS aligned) | mTLS, JWT RS256, Vault secrets, WAF, SAST |
| Auditability | Immutable Elasticsearch audit log, Kafka event replay |
| Interoperability | ISO 20022, ISO 8583, REST, SWIFT MT202 |

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│   React SPA (Vite)    │  Mobile Browser   │  Gov Agency Portals     │
│   TanStack Router     │  Progressive Web  │  URA · NIRA · KCCA      │
└───────────────────────┴───────────────────┴─────────────────────────┘
                              │ HTTPS / TLS 1.3
┌─────────────────────────────────────────────────────────────────────┐
│                           EDGE LAYER                                │
│   CloudFront CDN   │   AWS WAF    │   AWS Shield   │  NLB           │
│   Static assets    │   OWASP rules│   DDoS protect │  Load balance  │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│              API GATEWAY — Spring Cloud Gateway 4.1 :8080           │
│   Route Predicates  │  JWT Validation  │  Rate Limiting  │  SSL     │
│   Service Discovery │  Request Logging │  Bucket4j       │  mTLS    │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│              SPRING BOOT MICROSERVICES (Java 21)                    │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │ Payment  │ │ Routing  │ │Collections │ │     Settlement       │ │
│  │  :8082   │ │  :8083   │ │   :8084    │ │       :8085          │ │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │  Recon   │ │Compliance│ │  Dispute   │ │    Notification      │ │
│  │  :8086   │ │  :8087   │ │   :8088    │ │       :8089          │ │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │Reporting │ │Participant│ │    Auth    │ │  Spring Cloud Config │ │
│  │  :8090   │ │  :8091   │ │   :8081    │ │  Eureka · Zipkin     │ │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
          │           │ Apache Kafka 3.6 Event Bus
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│  PostgreSQL 16  │  Redis 7.2  │  Elasticsearch 8  │  MinIO  │ Vault │
└─────────────────────────────────────────────────────────────────────┘
          │
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                            │
│  BOU RTGS  │  MTN MoMo  │  Airtel Money  │  Banks  │  Gov Agencies │
│  ISO 20022 │  REST OAuth│  REST API Key  │  ISO8583│  REST / SOAP  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture Principles

### 3.1 Microservices — Database-per-Service

Each microservice owns its PostgreSQL schema exclusively. No cross-service direct database access. Data sharing occurs only through:
- **Kafka events** (asynchronous, eventual consistency)
- **HTTP APIs via Feign clients** (synchronous, for query operations)

### 3.2 Event Sourcing Backbone

Apache Kafka is the central nervous system of the platform. All state changes are published as immutable events. Services can replay events for reprocessing, debugging, or building new read models.

### 3.3 Circuit Breaker First

Every inter-service HTTP call is wrapped with **Resilience4j** circuit breakers. Payment routing automatically falls back to secondary channels on failure. No cascading failures.

### 3.4 Security by Design

- **Zero trust network** — all inter-service communication uses mTLS
- **Secrets never in code** — all credentials managed by HashiCorp Vault
- **Immutable audit log** — every action is written to Elasticsearch and cannot be deleted
- **Least privilege** — JWT role claims gate every endpoint

### 3.5 Idempotency

All payment operations carry idempotency keys stored in Redis (24h TTL). Duplicate requests return the original response without re-processing. Critical for MNO webhook retries.

---

## 4. High-Level Architecture Diagram

See [Section 2](#2-system-overview) for the ASCII representation. The full interactive SVG diagram is available in the running application at `/app/architecture`.

### Layer Summary

| Layer | Components | Purpose |
|---|---|---|
| Client | React SPA, Mobile PWA, Agency Portals | User-facing interfaces |
| Edge | CloudFront, AWS WAF, Shield, NLB | Security, CDN, load balancing |
| API Gateway | Spring Cloud Gateway | Unified entry, auth, rate limiting |
| Microservices | 12 Spring Boot services | Business logic per domain |
| Event Bus | Apache Kafka 3.6 | Asynchronous event streaming |
| Data | PostgreSQL, Redis, ES, MinIO, Vault | Persistence and secrets |
| External | Banks, MNOs, BOU, Gov Agencies | Third-party integrations |

---

## 5. Frontend Architecture

### Technology Stack

| Technology | Version | Role |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 6.x | Build tool and dev server |
| TypeScript | 5.x | Type safety |
| TanStack Router | 1.x | Client-side routing (declarative) |
| TanStack Query | 5.x | Server state management, caching |
| Zustand | 5.x | Global UI state (role, sidebar, toasts) |
| Framer Motion | 12.x | Animations and transitions |
| Tailwind CSS | 3.4 | Utility-first styling |
| Recharts | 2.x | Analytics charts |
| Radix UI | 1.x | Accessible headless UI primitives |
| Lucide React | 1.x | Icon system |

### Design System

```
Design Tokens (tailwind.config.ts):
  primary:     #1B3A6B  ── Sidebar, buttons, headings
  primary-light:#2A5298  ── Hover states
  accent:      #F4B000  ── Gold highlights, logo
  danger:      #D62828  ── Alerts, failed states
  success:     #16A34A  ── Confirmed, completed
  warning:     #D97706  ── Pending, processing
  surface:     #F5F7FA  ── Page background
  card:        #FFFFFF  ── Card surfaces
  border:      #E2E8F0  ── Dividers
  muted:       #64748B  ── Secondary text
```

### Module Structure

```
src/
├── components/
│   ├── layout/          AppShell, Sidebar, Topbar, NotificationPanel
│   ├── ui/              Badge, KPICard, DataTable, Drawer, Modal,
│   │                    Toast, Stepper, Timeline, TransactionDrawer
│   └── charts/          BarChart, PieChart, AreaChart, LineChart
├── data/                Mock data (8 files, 500+ records)
├── features/            Feature sub-components (dashboard, simulator, participants)
├── hooks/               useLiveUpdates
├── routes/
│   ├── login.tsx        Role-selector login screen
│   └── app/             13 module pages + architecture page
├── services/            mockApi.ts (8 API namespaces)
├── store/               appStore.ts (Zustand)
├── types/               index.ts (all shared TypeScript interfaces)
└── utils/               animations.ts, format.ts
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────┐
│                    State Layers                     │
│                                                     │
│  TanStack Query ──── Server/async data              │
│  (data fetching)     - All API responses            │
│                      - 30s stale time               │
│                      - Auto-invalidation on mutate  │
│                                                     │
│  Zustand ─────────── Global UI state                │
│  (global store)      - activeRole (localStorage)    │
│                      - sidebarCollapsed             │
│                      - toasts[]                     │
│                      - liveTransactions[] (max 50)  │
│                      - notificationsRead            │
│                                                     │
│  React useState ──── Local component state          │
│  (local)             - Selected drawer items        │
│                      - Form values                  │
│                      - Tab selection                │
└─────────────────────────────────────────────────────┘
```

---

## 6. Backend Microservices

All services built with **Spring Boot 3.2**, **Java 21** (Virtual Threads enabled), containerised with **Docker**, orchestrated on **AWS EKS**.

Common dependencies across all services:
- `spring-boot-starter-actuator` — health endpoints for Kubernetes probes
- `spring-cloud-starter-netflix-eureka-client` — service registration
- `micrometer-tracing-bridge-brave` + `zipkin-reporter-brave` — distributed tracing
- `spring-boot-starter-aop` — aspect-oriented logging and metrics

---

### 6.1 `govpay-gateway` — API Gateway

**Port:** 8080  
**Technology:** Spring Cloud Gateway 4.1

#### Responsibilities
- Single entry point for all HTTP traffic (frontend SPA and external participants)
- Route predicate evaluation — path, host, method, header matching
- JWT token validation delegated to `govpay-auth` via Feign
- Rate limiting per participant using Bucket4j backed by Redis
- SSL/TLS termination (certificates managed by AWS ACM)
- Request/response logging to Elasticsearch via Kafka

#### Route Configuration

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: payment-service
          uri: lb://govpay-payment
          predicates:
            - Path=/api/v1/payments/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200
            - name: CircuitBreaker
              args:
                name: paymentCB
                fallbackUri: forward:/fallback
        - id: collections-service
          uri: lb://govpay-collections
          predicates:
            - Path=/api/v1/collections/**, /api/v1/invoices/**
          filters:
            - AuthFilter
```

#### Key Dependencies
```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
  <groupId>com.github.bucket4j</groupId>
  <artifactId>bucket4j-redis</artifactId>
</dependency>
<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-spring-cloud2</artifactId>
</dependency>
```

---

### 6.2 `govpay-auth` — Authentication & Authorisation

**Port:** 8081  
**Technology:** Spring Boot 3.2 + Spring Security 6 + OAuth2

#### Responsibilities
- Issue RS256-signed JWTs on successful login (15-minute access token, 7-day refresh token)
- Validate JWTs and return decoded claims for Gateway filter
- LDAP integration for Bank of Uganda and Ministry staff
- OTP-based login for agency officers via Africa's Talking SMS
- Role-based access control: 8 roles × 8 permission scopes
- JWT deny-list in Redis for instant logout

#### JWT Payload Structure

```json
{
  "sub": "user-uuid-v4",
  "iss": "govpay.ug",
  "iat": 1748761200,
  "exp": 1748762100,
  "role": "Treasury Officer",
  "permissions": ["settlement:read", "settlement:approve", "reports:read"],
  "participant_id": "BOU",
  "jti": "unique-token-id"
}
```

#### Role → Permission Matrix

| Role | Permissions |
|---|---|
| Super Admin | All permissions |
| Bank of Uganda Operator | compliance:read, settlement:read, reports:read, audit:read |
| Treasury Officer | settlement:read, settlement:approve, reports:read |
| Agency Officer | collections:read, reports:read |
| Compliance Officer | compliance:read, compliance:write, audit:read |
| Settlement Officer | settlement:read, settlement:approve, settlement:run |
| Support Officer | disputes:read, disputes:write, reports:read |
| Developer | api:sandbox, webhooks:write |

---

### 6.3 `govpay-payment` — Core Payment Engine

**Port:** 8082  
**Technology:** Spring Boot 3.2 + Spring State Machine

#### Responsibilities
- Receive payment initiation requests; validate PRN against `govpay-collections`
- Manage payment lifecycle via a formal state machine
- Store payment records in PostgreSQL with idempotency enforcement
- Publish Kafka events at each state transition
- Handle channel callbacks (MNO webhook confirmations)
- Initiate reversals on failure or dispute resolution

#### Payment State Machine

```
                     ┌──────────┐
                     │ CREATED  │
                     └────┬─────┘
                          │ validate()
                     ┌────▼─────┐
                     │VALIDATED │
                     └────┬─────┘
                          │ route()
                     ┌────▼─────┐
                     │  ROUTED  │
                     └────┬─────┘
                          │ submit()
                     ┌────▼──────┐
               ┌─────│PROCESSING │─────┐
               │     └───────────┘     │
          timeout()                confirm()
               │                       │
          ┌────▼──────┐         ┌──────▼────┐
          │  TIMEOUT  │         │ CONFIRMED │
          └────┬──────┘         └──────┬────┘
               │                       │
          retry()              notify_agency()
               │                       │
          ┌────▼──────┐         ┌──────▼────┐
          │  RETRYING │         │ COMPLETED │
          └────┬──────┘         └───────────┘
               │ max_retries
          ┌────▼──────┐
          │   FAILED  │ ──── reversal_requested() ───► REVERSED
          └───────────┘
```

#### Kafka Events Published

| Event | Topic | Trigger |
|---|---|---|
| `PaymentCreated` | `payment.events` | New payment initiated |
| `PaymentConfirmed` | `payment.events` | Channel confirmation received |
| `PaymentFailed` | `payment.events` | Max retries exceeded |
| `PaymentReversed` | `payment.events` | Reversal completed |

---

### 6.4 `govpay-routing` — Payment Routing Engine

**Port:** 8083  
**Technology:** Spring Boot 3.2 + Resilience4j

#### Responsibilities
- Evaluate routing rules in priority order (channel, amount range, participant status)
- Check real-time channel health before selecting a route
- Automatic fallback to secondary channel on circuit breaker open
- Cache routing decisions in Redis (5-minute TTL) for frequently used amounts
- Expose routing rule CRUD for Admin configuration

#### Routing Algorithm

```
Input: { amount, payer_type, agency, preferred_channel }

1. Load active routing rules ordered by priority ASC
2. For each rule:
   a. Check amount within [minAmount, maxAmount]
   b. Check participant status = ACTIVE
   c. Check channel health (Redis cached, refreshed every 30s)
   d. Check circuit breaker state (Resilience4j)
   e. If all pass → SELECT this rule → return
3. If no rule matches → return ERROR: NO_ROUTE_AVAILABLE
```

#### Resilience4j Configuration

```yaml
resilience4j:
  circuitbreaker:
    instances:
      mtn-mobile-money:
        slidingWindowSize: 100
        failureRateThreshold: 50
        waitDurationInOpenState: 30s
        permittedNumberOfCallsInHalfOpenState: 10
      stanbic-bank:
        slidingWindowSize: 50
        failureRateThreshold: 40
        waitDurationInOpenState: 60s
```

---

### 6.5 `govpay-collections` — Government Collections

**Port:** 8084  
**Technology:** Spring Boot 3.2 + Quartz Scheduler

#### Responsibilities
- Maintain agency and service catalogues (URA, NIRA, URSB, MOL, UPF, IMM, KCCA, MOW)
- Generate globally unique PRNs: `PRN{timestamp}{checksum}`
- Invoice lifecycle management (PENDING → PAID → EXPIRED)
- Push payment confirmations to agency systems via secure webhook
- Scheduled invoice expiry jobs via Quartz (daily midnight sweep)

#### PRN Generation

```java
public String generatePRN(String agencyCode, long serviceId) {
    String timestamp = String.valueOf(Instant.now().getEpochSecond());
    String payload   = agencyCode + serviceId + timestamp;
    String checksum  = DigestUtils.sha256Hex(payload + SECRET_KEY).substring(0, 4).toUpperCase();
    return "PRN" + timestamp + checksum;
    // Example: PRN1748761200A3F9
}
```

#### Supported Agencies

| Agency | Code | Services |
|---|---|---|
| Uganda Revenue Authority | URA | Income Tax, VAT, PAYE, Customs Duty |
| National Identification & Registration Authority | NIRA | National ID, Passport, Birth Certificate |
| Uganda Registration Services Bureau | URSB | Business Registration, Trademark |
| Ministry of Lands | MOL | Land Search, Land Transfer, Lease Extension |
| Uganda Police Force | UPF | Court Fine, Police Clearance, Firearms Permit |
| Directorate of Citizenship & Immigration | IMM | Visa Application, Work Permit |
| Kampala Capital City Authority | KCCA | Business Permit, Parking Fine, Property Rates |
| Ministry of Works & Transport | MOW | Driving License, Vehicle Registration, Road Tax |

---

### 6.6 `govpay-settlement` — Settlement Engine

**Port:** 8085  
**Technology:** Spring Boot 3.2 + **Spring Batch 5**

#### Responsibilities
- Run nightly net settlement batch job (default: 23:00 EAT)
- Aggregate all confirmed transactions per participant per day
- Compute gross and net positions (netting offsetting obligations)
- Generate SWIFT MT202 interbank transfer messages
- Submit net positions to Bank of Uganda RTGS for final settlement
- Persist batch records with full audit trail

#### Spring Batch Architecture

```
JobLauncher
    └── SettlementJob
          ├── Step 1: ReadTransactions
          │     ItemReader: JdbcCursorItemReader (streaming, 1000/chunk)
          │     
          ├── Step 2: ComputeNetPositions
          │     ItemProcessor: NetPositionCalculator
          │     ItemWriter: PostgreSQL batch insert
          │     
          ├── Step 3: GenerateSWIFTMessages
          │     ItemReader: NetPositionReader
          │     ItemProcessor: SwiftMT202Formatter
          │     ItemWriter: MinIO (file) + BOU API (HTTP)
          │     
          └── Step 4: PublishSettlementEvents
                ItemWriter: KafkaItemWriter → settlement.commands
```

---

### 6.7 `govpay-reconciliation` — Reconciliation Engine

**Port:** 8086  
**Technology:** Spring Boot 3.2 + **Spring Batch 5** + Elasticsearch

#### Responsibilities
- Three-way match: GovPay switch records ↔ Bank/MNO statements ↔ Agency confirmations
- Flag unmatched, duplicate, and exception transactions
- Store all results in Elasticsearch for full-text search and audit
- Expose exception queue API for manual resolution workflow
- Generate daily reconciliation score (target: > 97%)

#### Match Algorithm

```
For each switch transaction T:

  1. BANK MATCH:
     Query bank statement file (loaded from SFTP/MinIO)
     Match on: amount ± tolerance, timestamp ± 5min, reference number
     → MATCHED / UNMATCHED

  2. AGENCY MATCH:
     Query agency confirmation webhook log
     Match on: PRN, amount, confirmation timestamp
     → MATCHED / UNMATCHED

  3. CLASSIFY:
     Both matched      → STATUS: RECONCILED
     Bank only         → STATUS: BANK_ONLY (possible duplicate)
     Agency only       → STATUS: AGENCY_ONLY (missing bank confirm)
     Neither matched   → STATUS: EXCEPTION
     Amount mismatch   → STATUS: AMOUNT_DISCREPANCY
```

---

### 6.8 `govpay-compliance` — AML/KYC Compliance

**Port:** 8087  
**Technology:** Spring Boot 3.2 + **Drools 8** Rule Engine

#### Responsibilities
- Real-time AML rule evaluation via Drools (< 50ms per transaction)
- Rules: velocity checks, blacklist matching, structuring detection, high-value thresholds
- Publish compliance alerts to Kafka and index in Elasticsearch
- Maintain blacklisted account registry
- Expose audit log for regulatory reporting (Bank of Uganda, FIA)

#### AML Rule Examples (Drools DRL)

```drools
// Velocity check: > 40 transactions in 2 hours from same payer
rule "VELOCITY_PAYER_2H_GT_40"
  when
    $tx: Transaction($payer: payer)
    $count: Number(intValue > 40) from accumulate(
      Transaction(payer == $payer,
        timestamp > (System.currentTimeMillis() - 7200000)),
      count(1)
    )
  then
    alerts.add(new ComplianceAlert("High Volume", Severity.CRITICAL,
      "Payer " + $payer + " made " + $count + " payments in 2 hours",
      "VELOCITY_PAYER_2H_GT_40"));
end

// High-value payment: single transaction > UGX 40,000,000
rule "HIGHVALUE_GT_40M"
  when
    $tx: Transaction(amount > 40000000, status == "CONFIRMED")
  then
    alerts.add(new ComplianceAlert("High Value Payment", Severity.MEDIUM,
      "Single payment UGX " + $tx.amount + " exceeds automated clearance threshold",
      "HIGHVALUE_GT_40M"));
end
```

---

### 6.9 `govpay-dispute` — Dispute Management

**Port:** 8088  
**Technology:** Spring Boot 3.2 + Spring State Machine + Quartz

#### Responsibilities
- Accept dispute submissions from citizens, agencies, and participants
- Manage dispute lifecycle via state machine
- SLA countdown enforcement via Quartz (7-day default)
- Evidence document storage in MinIO
- Participant response portal

#### Dispute State Machine

```
OPEN
  │
  ├──── investigate() ────► INVESTIGATING
  │                              │
  │                         participant_respond() ─► PARTICIPANT_RESPONSE
  │                              │                        │
  │                         approve() ──────────────────► APPROVED
  │                         reject()  ──────────────────► REJECTED
  │
  └──────────────────────────────────────────────► CLOSED
```

---

### 6.10 `govpay-notification` — Notification Dispatcher

**Port:** 8089  
**Technology:** Spring Boot 3.2 + Kafka Consumer + Spring Retry

#### Channels

| Channel | Provider | Use Case |
|---|---|---|
| SMS | Africa's Talking | Payment confirmation, OTP, fraud alerts |
| Email | AWS SES | Receipts, settlement reports, dispute notices |
| Webhook | HTTP POST | Participant system integrations |
| Push (future) | Firebase FCM | Mobile app notifications |

#### Retry Strategy

```yaml
spring:
  retry:
    max-attempts: 3
    initial-interval: 1000ms
    multiplier: 2.0
    max-interval: 10000ms
    # Dead-letter queue after max retries: notification.dlq
```

---

### 6.11 `govpay-reporting` — Analytics & Reporting

**Port:** 8090  
**Technology:** Spring Boot 3.2 + JasperReports + Apache POI

#### Report Types

| Report | Format | Frequency | Audience |
|---|---|---|---|
| Daily Transaction Volume | PDF, Excel | Daily (06:00) | Operations, BOU |
| Agency Revenue Summary | PDF | Daily (06:00) | Treasury, Agencies |
| Settlement Position | PDF, CSV | Daily (23:30) | Treasury, BOU |
| Reconciliation Exceptions | PDF | Daily (01:00) | Reconciliation team |
| AML Alert Summary | PDF | Daily (06:00) | Compliance Officer, FIA |
| Monthly Executive Summary | PDF | Monthly (1st) | PS Finance, Governor BOU |
| Annual Revenue Report | Excel | Annually | Auditor General |

---

### 6.12 `govpay-participant` — Participant Management

**Port:** 8091  
**Technology:** Spring Boot 3.2 + HashiCorp Vault SDK

#### Participant Types

| Type | Examples |
|---|---|
| Bank | Stanbic, Centenary, DFCU, Equity, Absa, Bank of Africa, Housing Finance |
| Mobile Money Operator | MTN Mobile Money, Airtel Money |
| Government Agency | URA, NIRA, URSB, MOL, UPF, IMM, KCCA, MOW |
| Payment Aggregator | Pesalink |
| Treasury | Consolidated Fund (Bank of Uganda) |

#### API Key Management

All API keys are:
- Generated as cryptographically random 256-bit values
- Encrypted at rest using AES-256-GCM via HashiCorp Vault
- Rotatable without service downtime (dual key window: 24h)
- Prefixed for environment identification (`gps_live_` / `gps_test_`)

---

## 7. Event-Driven Architecture (Apache Kafka)

### Kafka Cluster Configuration

| Property | Value |
|---|---|
| Brokers | 3 (multi-AZ on AWS MSK) |
| Replication factor | 3 |
| Min in-sync replicas | 2 |
| Retention | 30 days (7 days for high-volume topics) |
| Serialisation | Apache Avro + Confluent Schema Registry |
| Security | SASL/SCRAM + TLS |

### Topic Reference

| Topic | Producers | Consumers | Purpose |
|---|---|---|---|
| `payment.events` | govpay-payment | settlement, compliance, notification, reporting | All payment state changes |
| `payment.commands` | gateway, collections | payment | Initiate / reverse commands |
| `settlement.commands` | settlement | notification, reporting | Settlement batch events |
| `settlement.results` | settlement | reconciliation, reporting | Batch completion results |
| `compliance.alerts` | compliance | notification, reporting, ops | AML alerts and rule firings |
| `notification.dispatch` | payment, settlement, dispute | notification | Outbound notification commands |
| `audit.log` | ALL services | elasticsearch-connector | Immutable audit trail |
| `reconciliation.exceptions` | reconciliation | dispute, reporting | Exception queue feed |

### Event Schema Example (`payment.events`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "record",
  "name": "PaymentEvent",
  "namespace": "ug.govpay.events",
  "fields": [
    { "name": "event_id",        "type": "string" },
    { "name": "event_type",      "type": { "type": "enum", "symbols": ["CREATED","CONFIRMED","FAILED","REVERSED"] } },
    { "name": "transaction_id",  "type": "string" },
    { "name": "prn",             "type": "string" },
    { "name": "amount",          "type": "long" },
    { "name": "currency",        "type": "string", "default": "UGX" },
    { "name": "payer",           "type": "string" },
    { "name": "agency_code",     "type": "string" },
    { "name": "channel",         "type": "string" },
    { "name": "participant_id",  "type": "string" },
    { "name": "timestamp",       "type": "long" },
    { "name": "trace_id",        "type": "string" }
  ]
}
```

---

## 8. Data Architecture

### 8.1 PostgreSQL 16 — Transactional Store

**Pattern:** Database-per-service (12 schemas, single cluster with PgBouncer)

| Service | Schema | Key Tables |
|---|---|---|
| govpay-payment | `payment` | transactions, idempotency_keys, reversals |
| govpay-collections | `collections` | agencies, services, invoices, prns |
| govpay-settlement | `settlement` | batches, positions, swift_messages |
| govpay-reconciliation | `reconciliation` | match_results, exceptions, resolution_log |
| govpay-compliance | `compliance` | alerts, blacklist, rules, investigations |
| govpay-dispute | `dispute` | disputes, timeline_entries, evidence_files |
| govpay-participant | `participant` | participants, api_keys, sla_records |
| govpay-auth | `auth` | users, roles, sessions, otp_log |

**Resiliency:** Multi-AZ RDS PostgreSQL, automatic failover < 30s, Point-in-Time Recovery (35 days).

### 8.2 Redis 7.2 — Cache & Session Store

| Key Pattern | TTL | Purpose |
|---|---|---|
| `idempotency:{key}` | 24h | Payment deduplication |
| `jwt:deny:{jti}` | 15m | Logout token invalidation |
| `routing:rules` | 5m | Routing rule cache |
| `channel:health:{id}` | 30s | Live channel health status |
| `rate:limit:{participant}` | 1m | Sliding window rate counter |
| `session:{user_id}` | 8h | Admin session state |

### 8.3 Apache Kafka 3.6 — Event Streaming

See [Section 7](#7-event-driven-architecture-apache-kafka).

### 8.4 Elasticsearch 8.x — Audit & Search

All audit events are indexed via Kafka Connect Elasticsearch Sink Connector. Index structure:

```
govpay-audit-{YYYY.MM}
  ├── actor         (keyword)
  ├── role          (keyword)
  ├── action        (keyword)
  ├── resource      (keyword)
  ├── timestamp     (date)
  ├── ip_address    (ip)
  ├── trace_id      (keyword)
  └── payload       (object)

govpay-transactions-{YYYY.MM}
  ├── transaction_id (keyword)
  ├── amount         (long)
  ├── payer          (text + keyword)
  ├── agency         (keyword)
  ├── channel        (keyword)
  ├── status         (keyword)
  └── timestamp      (date)
```

Retention: 90 days hot, 1 year warm (ILM policy).

### 8.5 MinIO — Object Storage

```
Buckets:
  govpay-settlement-files/
    {YYYY}/{MM}/{DD}/BATCH-{id}.csv
    {YYYY}/{MM}/{DD}/SWIFT-MT202-{id}.txt

  govpay-dispute-evidence/
    {dispute_id}/{timestamp}-{filename}

  govpay-reports/
    daily/{YYYY-MM-DD}-daily-report.pdf
    monthly/{YYYY-MM}-executive-summary.pdf

  govpay-reconciliation/
    {YYYY-MM-DD}/recon-results.json
    {YYYY-MM-DD}/exceptions.csv
```

### 8.6 HashiCorp Vault — Secrets Management

```
vault/
  secret/govpay/
    payment-service/
      db_password: ****
      kafka_api_secret: ****
    compliance-service/
      drools_license: ****
    participant-service/
      api_key_encryption_key: ****
  pki/
    int-ca/
      issue/govpay-service (mTLS certs, 30-day rotation)
```

---

## 9. Security Architecture

### 9.1 Authentication Flow

```
1. User submits credentials (username/password or OTP)
2. govpay-auth validates against PostgreSQL or LDAP
3. govpay-auth issues RS256-signed JWT (15-minute access + 7-day refresh)
4. Client stores tokens in memory (access) and httpOnly cookie (refresh)
5. All API requests carry Bearer token in Authorization header
6. Spring Cloud Gateway calls govpay-auth /auth/validate on each request
7. Decoded claims injected as X-User-* headers to downstream services
```

### 9.2 Network Security

| Layer | Control |
|---|---|
| Internet → CloudFront | TLS 1.3 only, HSTS enforced |
| CloudFront → NLB | AWS managed TLS, private subnet |
| NLB → Gateway | Internal VPC, no public access |
| Services → Services | Istio service mesh, mTLS enforced |
| Services → Databases | VPC security groups, no public endpoint |
| Services → Vault | Vault agent sidecar, AppRole auth |

### 9.3 API Security

```
┌─────────────────────────────────────────────┐
│                 Request Flow                │
│                                             │
│  Client ──HTTPS──► WAF (OWASP rules)        │
│                    │                        │
│                    ▼                        │
│              Rate Limiter (Bucket4j)        │
│                    │                        │
│                    ▼                        │
│           JWT Validation (RS256)            │
│                    │                        │
│                    ▼                        │
│        Permission Check (role claims)       │
│                    │                        │
│                    ▼                        │
│           Downstream Microservice           │
└─────────────────────────────────────────────┘
```

### 9.4 Data Security

- **Encryption at rest:** AES-256-GCM for all PostgreSQL tablespaces (AWS RDS encryption)
- **Encryption in transit:** TLS 1.3 minimum for all connections
- **API keys:** AES-256-GCM encrypted via Vault, never stored in plaintext
- **PII masking:** Account numbers masked in logs (`0XX-XXXX-{last4}`)
- **Audit trail:** Immutable append-only Elasticsearch index (delete API disabled)

---

## 10. External System Integrations

### 10.1 Bank of Uganda — Real-Time Gross Settlement (RTGS)

| Property | Detail |
|---|---|
| Protocol | ISO 20022 XML / SWIFT MT202 |
| Transport | SFTP + REST (BOU API gateway) |
| Integration point | `govpay-settlement` — net position submission |
| Frequency | Daily at 23:00 EAT (end-of-day net settlement) |
| Fallback | Manual settlement file submission if API unavailable |

### 10.2 MTN Mobile Money Uganda

| Property | Detail |
|---|---|
| Protocol | REST (OAuth2 Client Credentials) |
| Base URL | `https://sandbox.momodeveloper.mtn.com` (sandbox) |
| Auth | OAuth2 bearer token (1-hour TTL, auto-refreshed) |
| APIs used | C2B Collection, B2C Disbursement, Transfer Status |
| Webhook | POST `/api/v1/payments/{id}/confirm` on confirmation |
| SLA | < 30s confirmation, 99.97% uptime |

### 10.3 Airtel Money Uganda

| Property | Detail |
|---|---|
| Protocol | REST (API Key + Signature) |
| Auth | HMAC-SHA256 signed requests |
| APIs used | Payment Initiation, Status Query, Reconciliation File |
| Webhook | Async callback on payment completion |

### 10.4 Commercial Banks (Stanbic, Centenary, DFCU, etc.)

| Property | Detail |
|---|---|
| Protocol | ISO 8583 (legacy) / REST (newer banks) |
| Integration | Per-bank adapter pattern (Strategy pattern in `govpay-routing`) |
| Reconciliation | End-of-day statement file via SFTP |

### 10.5 Government Agencies

| Agency | Integration Type | Protocol |
|---|---|---|
| URA | REST (mTLS) — modern integration | REST + TLS client cert |
| NIRA | REST (API key) | REST |
| URSB | REST (API key) | REST |
| MOL, UPF, IMM, KCCA, MOW | SOAP (legacy) + REST (new) | Mixed |

### 10.6 Third-Party Services

| Service | Provider | Purpose |
|---|---|---|
| SMS | Africa's Talking | Payment confirmations, OTP |
| Email | AWS SES | Receipts, reports, alerts |
| Object Storage | AWS S3 / MinIO | Documents, settlement files |
| Secrets | HashiCorp Vault | API keys, credentials |
| Tracing | AWS X-Ray / Zipkin | Distributed tracing |

---

## 11. Infrastructure & DevOps

### 11.1 Kubernetes Architecture (AWS EKS)

```
EKS Cluster (us-east-1 / af-south-1)
├── Namespace: govpay-prod
│   ├── Deployment: govpay-gateway      (3 replicas, HPA: 3-10)
│   ├── Deployment: govpay-payment      (3 replicas, HPA: 3-20)
│   ├── Deployment: govpay-routing      (2 replicas, HPA: 2-8)
│   ├── Deployment: govpay-collections  (2 replicas, HPA: 2-8)
│   ├── Deployment: govpay-settlement   (1 replica, no HPA — batch only)
│   ├── Deployment: govpay-reconciliation (1 replica)
│   ├── Deployment: govpay-compliance   (2 replicas, HPA: 2-6)
│   ├── Deployment: govpay-dispute      (2 replicas)
│   ├── Deployment: govpay-notification (2 replicas, HPA: 2-8)
│   ├── Deployment: govpay-reporting    (1 replica)
│   ├── Deployment: govpay-participant  (2 replicas)
│   └── Deployment: govpay-auth         (3 replicas, HPA: 3-10)
├── Namespace: govpay-infra
│   ├── Eureka Server       (2 replicas)
│   ├── Config Server       (2 replicas)
│   └── Zipkin              (1 replica)
└── Namespace: govpay-monitoring
    ├── Prometheus          (1 replica + persistent volume)
    ├── Grafana             (1 replica)
    └── Alertmanager        (1 replica)
```

### 11.2 CI/CD Pipeline

```
Developer Push
      │
      ▼
Gerrit Code Review ──► 2 approvals required (including tech lead)
      │
      ▼
Jenkins Pipeline:
  Stage 1: Compile + Unit Tests (JUnit 5, Mockito)
  Stage 2: Integration Tests (Testcontainers — PostgreSQL, Redis, Kafka)
  Stage 3: SAST — SonarQube (quality gate: 0 blockers, coverage > 80%)
  Stage 4: Dependency scan — OWASP Dependency Check
  Stage 5: Docker build (multi-stage Dockerfile, distroless base)
  Stage 6: Push to AWS ECR (tagged with git SHA)
  Stage 7: Helm upgrade → EKS staging namespace
  Stage 8: Postman/Newman E2E test suite (100+ scenarios)
  Stage 9: Manual approval gate (Product Owner + BOU representative)
  Stage 10: Blue/green deploy → prod (Argo Rollouts, 5-min analysis)
  Stage 11: Smoke tests → rollback on failure
```

### 11.3 Observability Stack

| Tool | Purpose |
|---|---|
| Prometheus | Metrics scraping (Spring Boot Actuator endpoints) |
| Grafana | Dashboards — TPS, error rates, latency P50/P95/P99, settlement position |
| Zipkin | Distributed tracing with full payment journey trace |
| ELK Stack | Centralised log aggregation (Filebeat → Logstash → Elasticsearch → Kibana) |
| AWS CloudWatch | Infrastructure metrics, RDS, MSK, EKS cluster |
| PagerDuty | On-call alerting — < 5 minutes MTTD on critical alerts |

### 11.4 Dockerfile Pattern

```dockerfile
# Build stage — JDK 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Runtime stage — distroless (no shell, minimal attack surface)
FROM gcr.io/distroless/java21-debian12
COPY --from=builder /app/target/*.jar /app.jar
EXPOSE 8082
ENTRYPOINT ["java",
  "-XX:+UseVirtualThreads",
  "-XX:MaxRAMPercentage=75",
  "-jar", "/app.jar"]
```

---

## 12. Payment Data Flow — End-to-End

### Step-by-Step Processing

```
Step 01: Citizen Initiates Payment
  → React SPA: POST /api/v1/invoices
  → govpay-gateway: JWT auth + rate limit check
  → govpay-collections: PRN generated, invoice stored (PostgreSQL)
  → Kafka: payment.created event published

Step 02: Invoice Validated
  → govpay-payment: PRN validated against govpay-collections (Feign)
  → Idempotency key stored (Redis, 24h TTL)
  → State machine: CREATED → VALIDATED

Step 03: Route Selected
  → govpay-routing: Rules evaluated in priority order
  → Channel health checked (Redis cache, 30s TTL)
  → Resilience4j circuit breaker consulted
  → Best route returned: { channel, participant, fee }

Step 04: Payment Submitted to Channel
  → govpay-payment: Channel API called (MTN / Airtel / Bank)
  → State machine: VALIDATED → PROCESSING
  → Kafka: payment.processing event published

Step 05: Channel Confirmation (async)
  → Channel posts webhook to /api/v1/payments/{id}/confirm
  → govpay-payment: Confirmation validated (HMAC signature check)
  → State machine: PROCESSING → CONFIRMED

Step 06: Agency Notified
  → govpay-collections: Receives payment.confirmed Kafka event
  → Webhook pushed to agency system (with retry)
  → Invoice status updated: PENDING → PAID

Step 07: Payer Notified
  → govpay-notification: Receives payment.confirmed Kafka event
  → SMS dispatched via Africa's Talking (< 5s delivery target)
  → Email receipt dispatched via AWS SES

Step 08: Compliance Check
  → govpay-compliance: Drools rules evaluated asynchronously
  → If alert triggered: compliance.alerts Kafka event published
  → Alert indexed in Elasticsearch, notification sent to Compliance Officer

Step 09: Audit Log Written
  → All events indexed in Elasticsearch via audit.log Kafka topic
  → Immutable record: actor, action, resource, trace ID, IP

Step 10: End-of-Day Settlement
  → govpay-settlement: Spring Batch job runs at 23:00 EAT
  → Net positions computed per participant
  → SWIFT MT202 generated, submitted to BOU RTGS
  → Settlement batch status: COMPLETED
  → Kafka: settlement.results event → govpay-reconciliation
```

---

## 13. API Reference Summary

### Base URL

```
Production:  https://api.govpay.go.ug/v1
Sandbox:     https://sandbox.api.govpay.go.ug/v1
```

### Authentication

All requests require:
```http
Authorization: Bearer <JWT>
Content-Type: application/json
X-Idempotency-Key: <UUID v4>    (for POST/PUT mutations)
```

### Core Endpoints

| Method | Endpoint | Service | Description |
|---|---|---|---|
| `POST` | `/invoices` | collections | Generate PRN / invoice |
| `GET` | `/invoices/{prn}` | collections | Validate PRN |
| `POST` | `/payments` | payment | Initiate payment |
| `GET` | `/payments/{id}` | payment | Query payment status |
| `POST` | `/payments/{id}/confirm` | payment | Channel confirmation webhook |
| `POST` | `/payments/{id}/reverse` | payment | Initiate reversal |
| `GET` | `/routing/rules` | routing | List active routing rules |
| `POST` | `/routing/resolve` | routing | Resolve route for given params |
| `GET` | `/settlement/batches` | settlement | List settlement batches |
| `POST` | `/settlement/batches/{id}/approve` | settlement | Approve settlement batch |
| `GET` | `/reconciliation/results` | reconciliation | Get reconciliation results |
| `GET` | `/reconciliation/exceptions` | reconciliation | Get exception queue |
| `POST` | `/disputes` | dispute | Raise a dispute |
| `GET` | `/compliance/alerts` | compliance | List AML alerts |
| `GET` | `/reports/daily-volume` | reporting | Daily transaction volume |
| `GET` | `/participants` | participant | List participants |
| `POST` | `/participants/{id}/api-keys/rotate` | participant | Rotate API key |

### Error Response Format

```json
{
  "error": {
    "code": "PAYMENT_PRN_INVALID",
    "message": "The PRN provided does not match any active invoice",
    "detail": "PRN PRN20260601001234 has either expired or already been paid",
    "trace_id": "abc123def456",
    "timestamp": "2026-06-01T09:24:15Z"
  }
}
```

---

## 14. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| **Availability** | System uptime | 99.99% (< 53 min/year downtime) |
| **Throughput** | Peak transactions per second | 10,000 TPS |
| **Latency** | P50 end-to-end payment processing | < 200ms |
| **Latency** | P95 end-to-end payment processing | < 500ms |
| **Latency** | P99 end-to-end payment processing | < 2000ms |
| **Data Retention** | Transaction records | 7 years (regulatory requirement) |
| **Data Retention** | Audit logs | 10 years |
| **Backup** | Recovery Point Objective (RPO) | < 1 hour |
| **Backup** | Recovery Time Objective (RTO) | < 4 hours |
| **Security** | Penetration testing | Annual (Bank of Uganda requirement) |
| **Compliance** | PCI-DSS | Level 1 (> 6M transactions/year) |
| **Compliance** | ISO 27001 | Certification required |
| **Scalability** | Horizontal scale | Kubernetes HPA, 10× baseline capacity |

---

## 15. Disaster Recovery & Business Continuity

### Multi-Region Strategy

- **Primary region:** AWS af-south-1 (Cape Town) — lowest latency to Uganda
- **DR region:** AWS eu-west-1 (Ireland) — regulatory data residency compliance
- **RTO:** 4 hours (automated failover via Route53 health checks)
- **RPO:** 1 hour (cross-region PostgreSQL replication lag)

### DR Runbook (Abbreviated)

```
1. Declare DR: BOU Operations team + GovPay CTO
2. Route53: Update DNS to point to DR region (propagation: ~5 min)
3. Promote Aurora read replica to primary (RDS automated: ~30s)
4. Kafka: MSK Multi-Region Replication active (continuous)
5. Redis: Warm cache rebuild from DB (automatic on startup)
6. Verify: Run smoke test suite against DR endpoints
7. Notify: Bank of Uganda, participant banks, agencies
8. Monitor: War room for 4 hours post-failover
```

---

## 16. Compliance & Regulatory Framework

### Bank of Uganda Directives

| Directive | Requirement | Implementation |
|---|---|---|
| PSP Licensing (2022) | Licensed Payment System Operator | GovPay licensed entity under BOU |
| FIA AML Act (2013) | Real-time AML screening | Drools rule engine, alert thresholds |
| PDPA (2019) | Data privacy for Ugandan citizens | PII masking, consent management, data residency |
| National Payments Act (2020) | Interoperability standards | ISO 20022 adoption, open API specification |

### Audit Trail Requirements

Every system action is recorded with:
- `actor` — user ID + role
- `action` — CRUD verb + resource type
- `resource` — affected entity ID
- `timestamp` — ISO 8601 with milliseconds
- `ip_address` — originating IP
- `trace_id` — Zipkin distributed trace
- `payload_hash` — SHA-256 of request body (for integrity verification)

Audit log entries are **append-only**. Elasticsearch index lifecycle management archives to S3 after 90 days and retains for 10 years per regulatory requirement.

---

*Document maintained by the GovPay Technical Architecture team. For amendments, raise a PR against the `docs/` directory in the govpay-platform monorepo.*

*Last reviewed: 2026-06-01 | Next review: 2026-09-01*
