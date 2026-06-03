import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import {
  Globe, Shield, Zap, ArrowRight,
  Layers, GitBranch, Activity, RefreshCw, Bell,
  Users, Building2, Banknote,
  MessageSquareWarning, BarChart3, Settings, ChevronDown, ChevronUp,
  Printer, FileDown,
} from 'lucide-react'
import clsx from 'clsx'

const PRINT_STYLES = `
@media print {
  /* Hide app chrome */
  aside, header, nav, [data-sidebar], [data-topbar],
  button:not(.print-keep), .no-print { display: none !important; }

  /* Reset layout - full width */
  body { background: white !important; font-family: 'Inter', sans-serif; font-size: 11pt; color: #1a1a1a; }
  main { padding: 0 !important; margin: 0 !important; }
  .flex.h-screen { display: block !important; }
  .flex-1, .overflow-y-auto { overflow: visible !important; height: auto !important; }

  /* Page setup */
  @page { size: A4; margin: 20mm 18mm; }

  /* Headings */
  h1 { font-size: 22pt; color: #1B3A6B; page-break-before: avoid; }
  h2, h3 { color: #1B3A6B; page-break-after: avoid; }

  /* Cards - keep borders, drop shadows */
  .shadow-card, .shadow-modal, .shadow-drawer { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }

  /* Tab content - show ALL panels when printing */
  [data-tab-content] { display: block !important; opacity: 1 !important; }

  /* Prevent page breaks inside cards */
  .bg-card, .rounded-card { page-break-inside: avoid; }

  /* SVG diagram - scale to fit */
  svg { max-width: 100%; page-break-inside: avoid; }

  /* Print header */
  .print-header {
    display: flex !important;
    align-items: center;
    gap: 12px;
    border-bottom: 2px solid #1B3A6B;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  /* Colours in print */
  .text-primary { color: #1B3A6B !important; }
  .bg-primary { background: #1B3A6B !important; color: white !important; }
  .text-success { color: #16A34A !important; }
  .text-danger { color: #D62828 !important; }
  .text-warning { color: #D97706 !important; }
  .text-muted { color: #64748B !important; }

  /* Page breaks between major sections */
  .print-break-before { page-break-before: always; }
}`

// ─── Data ──────────────────────────────────────────────────────────────────

const MICROSERVICES = [
  {
    id: 'gateway', name: 'govpay-gateway', port: 8080,
    tech: 'Spring Cloud Gateway 4.1', color: 'primary',
    desc: 'Unified entry point for all API traffic. Handles request routing, rate limiting (Bucket4j), JWT validation, and SSL termination. Routes requests to downstream microservices via service discovery.',
    deps: ['Spring Cloud Gateway', 'Bucket4j', 'Spring Security', 'Eureka Client'],
    endpoints: ['ALL /*'],
    icon: Shield,
  },
  {
    id: 'auth', name: 'govpay-auth', port: 8081,
    tech: 'Spring Boot 3.2 + Spring Security', color: 'primary',
    desc: 'Authentication and authorisation service. Issues RS256-signed JWTs with role-based claims. Integrates with LDAP for staff accounts and OTP via Africa\'s Talking for external users.',
    deps: ['Spring Security OAuth2', 'JJWT', 'Spring Data JPA', 'PostgreSQL'],
    endpoints: ['POST /auth/login', 'POST /auth/refresh', 'POST /auth/logout', 'GET /auth/me'],
    icon: Shield,
  },
  {
    id: 'payment', name: 'govpay-payment', port: 8082,
    tech: 'Spring Boot 3.2', color: 'accent',
    desc: 'Core payment processing engine. Manages PRN generation, payment lifecycle state machine (INITIATED → PROCESSING → CONFIRMED/FAILED), idempotency via Redis, and publishes events to Kafka.',
    deps: ['Spring State Machine', 'Spring Data JPA', 'Kafka Producer', 'Redis', 'PostgreSQL'],
    endpoints: ['POST /payments', 'GET /payments/{id}', 'POST /payments/{id}/confirm', 'POST /payments/{id}/reverse'],
    icon: Zap,
  },
  {
    id: 'routing', name: 'govpay-routing', port: 8083,
    tech: 'Spring Boot 3.2', color: 'primary',
    desc: 'Intelligent payment routing engine. Evaluates routing rules (priority, amount range, channel availability) stored in PostgreSQL. Falls back to secondary channels on failure with configurable retry policies via Resilience4j.',
    deps: ['Resilience4j Circuit Breaker', 'Spring Data JPA', 'Redis Cache', 'Feign Client'],
    endpoints: ['POST /routing/resolve', 'GET /routing/rules', 'PUT /routing/rules/{id}', 'GET /routing/health'],
    icon: GitBranch,
  },
  {
    id: 'collections', name: 'govpay-collections', port: 8084,
    tech: 'Spring Boot 3.2', color: 'success',
    desc: 'Government collections orchestration. Manages agency service catalogues, generates invoices with unique PRNs, validates payments against invoices, and notifies agencies via webhooks upon confirmation.',
    deps: ['Spring Data JPA', 'Quartz Scheduler', 'WebClient', 'PostgreSQL'],
    endpoints: ['POST /collections/invoices', 'GET /collections/invoices/{prn}', 'GET /collections/agencies', 'GET /collections/services/{agencyId}'],
    icon: Building2,
  },
  {
    id: 'settlement', name: 'govpay-settlement', port: 8085,
    tech: 'Spring Boot 3.2 + Spring Batch', color: 'warning',
    desc: 'End-of-day net settlement processing. Spring Batch jobs aggregate daily transactions per participant, compute net positions, generate SWIFT MT202 messages for interbank settlement, and persist batch results.',
    deps: ['Spring Batch', 'Spring Data JPA', 'Kafka Consumer', 'MinIO', 'PostgreSQL'],
    endpoints: ['POST /settlement/batches/run', 'GET /settlement/batches', 'POST /settlement/batches/{id}/approve', 'GET /settlement/accounts'],
    icon: Banknote,
  },
  {
    id: 'reconciliation', name: 'govpay-reconciliation', port: 8086,
    tech: 'Spring Boot 3.2 + Spring Batch', color: 'primary',
    desc: 'Three-way reconciliation engine. Matches switch records against bank and agency confirmations. Flags unmatched, duplicate, and exception transactions. Exposes exception queues for manual resolution.',
    deps: ['Spring Batch', 'Elasticsearch', 'Spring Data JPA', 'Kafka Consumer'],
    endpoints: ['POST /reconciliation/run', 'GET /reconciliation/results', 'GET /reconciliation/exceptions', 'POST /reconciliation/exceptions/{id}/resolve'],
    icon: RefreshCw,
  },
  {
    id: 'compliance', name: 'govpay-compliance', port: 8087,
    tech: 'Spring Boot 3.2 + Drools', color: 'danger',
    desc: 'AML/KYC compliance and fraud detection. Drools rule engine evaluates configurable AML rules (velocity checks, blacklist matching, structuring detection) in real time. Publishes alerts to Kafka and stores in Elasticsearch.',
    deps: ['Drools Rule Engine', 'Elasticsearch', 'Kafka Consumer/Producer', 'Redis', 'Spring Data JPA'],
    endpoints: ['GET /compliance/alerts', 'POST /compliance/alerts/{id}/investigate', 'GET /compliance/blacklist', 'POST /compliance/blacklist', 'GET /compliance/audit-log'],
    icon: Shield,
  },
  {
    id: 'dispute', name: 'govpay-dispute', port: 8088,
    tech: 'Spring Boot 3.2', color: 'warning',
    desc: 'Dispute lifecycle management. Tracks disputes through a state machine (OPEN → INVESTIGATING → PARTICIPANT_RESPONSE → APPROVED/REJECTED → CLOSED). Enforces SLA timers with Quartz and stores evidence documents in MinIO.',
    deps: ['Spring State Machine', 'Quartz Scheduler', 'MinIO SDK', 'Spring Data JPA'],
    endpoints: ['POST /disputes', 'GET /disputes', 'GET /disputes/{id}', 'POST /disputes/{id}/resolve', 'POST /disputes/{id}/evidence'],
    icon: MessageSquareWarning,
  },
  {
    id: 'notification', name: 'govpay-notification', port: 8089,
    tech: 'Spring Boot 3.2', color: 'primary',
    desc: "Multi-channel notification dispatcher. Consumes Kafka events and dispatches SMS via Africa's Talking, email via AWS SES, and webhook POSTs to participant URLs. Implements retry with exponential backoff and dead-letter queues.",
    deps: ["Africa's Talking SDK", 'AWS SES SDK', 'Kafka Consumer', 'Spring Retry', 'PostgreSQL'],
    endpoints: ['GET /notifications/logs', 'POST /notifications/webhooks', 'GET /notifications/webhooks', 'DELETE /notifications/webhooks/{id}'],
    icon: Bell,
  },
  {
    id: 'reporting', name: 'govpay-reporting', port: 8090,
    tech: 'Spring Boot 3.2 + JasperReports', color: 'success',
    desc: 'Analytics and reporting service. Aggregates data from Elasticsearch and PostgreSQL read replicas. Generates PDF/Excel reports via JasperReports. Scheduled daily/monthly treasury reports via Quartz.',
    deps: ['JasperReports', 'Elasticsearch', 'Apache POI', 'Quartz Scheduler', 'PostgreSQL Read Replica'],
    endpoints: ['GET /reports/daily-volume', 'GET /reports/agency-revenue', 'GET /reports/settlement-trends', 'POST /reports/export'],
    icon: BarChart3,
  },
  {
    id: 'participant', name: 'govpay-participant', port: 8091,
    tech: 'Spring Boot 3.2', color: 'primary',
    desc: 'Participant onboarding and management. Manages banks, MNOs, aggregators, and agencies. Issues and rotates API keys (AES-256 encrypted at rest). Tracks SLA breaches and publishes health status to service mesh.',
    deps: ['Spring Data JPA', 'Vault SDK (API keys)', 'Spring Security Crypto', 'PostgreSQL'],
    endpoints: ['GET /participants', 'POST /participants', 'PUT /participants/{id}', 'POST /participants/{id}/suspend', 'GET /participants/{id}/api-keys', 'POST /participants/{id}/api-keys/rotate'],
    icon: Users,
  },
]

const DATABASES = [
  { name: 'PostgreSQL 16', role: 'Primary transactional store', detail: 'One schema per microservice (database-per-service pattern). Read replicas for reporting queries. PgBouncer connection pooling. Point-in-time recovery (PITR) enabled.', color: 'primary', badge: 'RDBMS' },
  { name: 'Redis 7.2', role: 'Cache, session & idempotency', detail: 'Payment idempotency keys (TTL 24h). JWT deny-list for logout. Routing rule cache (TTL 5 min). Rate limiter sliding windows. Pub/Sub for real-time feed.', color: 'danger', badge: 'In-Memory' },
  { name: 'Apache Kafka 3.6', role: 'Event streaming backbone', detail: 'Topics: payment.events, settlement.commands, compliance.alerts, notification.dispatch, audit.log. Retention: 30 days. Replication factor: 3. Schema registry with Avro.', color: 'warning', badge: 'Event Bus' },
  { name: 'Elasticsearch 8.x', role: 'Audit log & full-text search', detail: 'All audit events indexed in real time via Kafka Consumer. Powers compliance search, transaction lookup, and reconciliation exception queries. 90-day retention policy.', color: 'success', badge: 'Search' },
  { name: 'MinIO', role: 'Object storage', detail: 'Dispute evidence attachments, settlement batch files (CSV/SWIFT), compliance documents, generated PDF reports. S3-compatible API. Versioning and lifecycle policies enabled.', color: 'accent', badge: 'Object Store' },
  { name: 'HashiCorp Vault', role: 'Secrets & key management', detail: 'API key encryption (AES-256-GCM). Database credential rotation. TLS certificate management. PKI for mTLS between microservices. Audit log for all secret accesses.', color: 'muted', badge: 'Secrets' },
]

const EXTERNAL_SYSTEMS = [
  { name: 'Bank of Uganda RTGS', protocol: 'ISO 20022 / SWIFT MT', type: 'Central Bank', desc: 'Real-time gross settlement for high-value interbank transfers. GovPay submits net settlement positions end-of-day.' },
  { name: 'MTN Mobile Money', protocol: 'REST (OAuth2)', type: 'MNO', desc: 'C2B collection and B2C disbursement APIs. Callback webhook for confirmation. Reconciliation file via SFTP.' },
  { name: 'Airtel Money', protocol: 'REST (API Key)', type: 'MNO', desc: 'Mobile money collection API with async confirmation model. Balance enquiry for settlement verification.' },
  { name: 'Stanbic / Centenary / DFCU', protocol: 'ISO 8583 / REST', type: 'Commercial Bank', desc: 'Direct API integration for bank transfer collections. Statement pull for end-of-day reconciliation.' },
  { name: 'Uganda Revenue Authority', protocol: 'REST (mTLS)', type: 'Gov Agency', desc: 'PRN validation and payment confirmation push. Daily revenue report via secure SFTP.' },
  { name: 'NIRA / URSB / MoL', protocol: 'REST / SOAP', type: 'Gov Agency', desc: 'Invoice validation and service confirmation endpoints. Mixed legacy SOAP and modern REST interfaces.' },
  { name: "Africa's Talking", protocol: 'REST', type: 'SMS Gateway', desc: 'Bulk SMS for payment confirmations, OTP, and fraud alerts. Uganda Telecom operator routing.' },
  { name: 'AWS SES', protocol: 'SMTP / API', type: 'Email', desc: 'Transactional email for receipts, settlement reports, and dispute notifications.' },
]

const INFRA_LAYERS = [
  { name: 'Kubernetes (EKS)', detail: 'All microservices containerised with Docker and orchestrated on AWS EKS. HPA scales pods based on CPU/RPS. PodDisruptionBudgets for zero-downtime deploys.', icon: Layers },
  { name: 'Spring Cloud Eureka', detail: 'Service registry for dynamic service discovery. All Spring Boot services register on startup. Gateway resolves downstream via Eureka rather than hardcoded URLs.', icon: Globe },
  { name: 'Spring Cloud Config', detail: 'Centralised configuration server backed by a private Git repository. Environment-specific profiles (dev/staging/prod). Encrypted sensitive properties via Vault.', icon: Settings },
  { name: 'Resilience4j', detail: 'Circuit breaker, retry, rate limiter, and bulkhead patterns on all inter-service calls. Automatic fallback to secondary channels on payment routing failures.', icon: Shield },
  { name: 'Zipkin / Micrometer', detail: 'Distributed tracing across all microservices. Every payment carries a trace ID through the full stack. Latency histograms and SLA dashboards in Grafana.', icon: Activity },
  { name: 'Prometheus + Grafana', detail: 'Metrics scraping from all Spring Boot Actuator endpoints. Pre-built dashboards for payment throughput, error rates, settlement position, and compliance alerts.', icon: BarChart3 },
]

const SCREENSHOTS = [
  {
    title: 'Executive Dashboard',
    path: '/app/dashboard',
    color: '#1B3A6B',
    preview: (
      <div className="p-2 space-y-1.5">
        <div className="grid grid-cols-4 gap-1">
          {['48,291 txns', 'UGX 18.4B', '98.4%', '382 failed'].map((v, i) => (
            <div key={i} className="bg-white rounded p-1 text-center">
              <div className="text-[6px] text-slate-400">KPI</div>
              <div className="text-[7px] font-bold text-slate-800 truncate">{v}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1 bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Live Feed</div>
            {[...Array(4)].map((_, i) => <div key={i} className="h-1.5 bg-slate-100 rounded mb-0.5" />)}
          </div>
          <div className="bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Channels</div>
            <div className="flex items-end gap-0.5 h-8">
              {[70,45,20,10,15].map((h,i) => <div key={i} className="flex-1 rounded-sm" style={{ height:`${h}%`, backgroundColor: ['#1B3A6B','#F4B000','#16A34A','#D62828','#64748B'][i] }} />)}
            </div>
          </div>
          <div className="bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Collections</div>
            <div className="flex items-end gap-0.5 h-8">
              {[90,55,40,60,35,50,30].map((h,i) => <div key={i} className="flex-1 bg-primary rounded-sm" style={{ height:`${h}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Payment Simulator',
    path: '/app/simulator',
    color: '#2A5298',
    preview: (
      <div className="p-2">
        <div className="flex items-center gap-0.5 mb-2 overflow-hidden">
          {['Citizen','Portal','Switch','Validate','Route','Bank','Confirm','Agency','Treasury','Settle'].map((n, i) => (
            <div key={i} className="flex items-center gap-0">
              <div className={clsx('text-[5px] rounded px-0.5 py-0.5 font-bold whitespace-nowrap', i < 6 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500')}>
                {n}
              </div>
              {i < 9 && <div className={clsx('w-1 h-px', i < 5 ? 'bg-primary' : 'bg-slate-300')} />}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-white rounded p-1 space-y-0.5">
            {['Payer Name','Amount (UGX)','Agency','Channel'].map(f => (
              <div key={f} className="h-2 bg-slate-100 rounded" />
            ))}
          </div>
          <div className="bg-primary rounded p-1 flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-1.5 bg-accent rounded text-[5px] text-center text-primary font-bold">Simulate</div>
            <div className="text-[5px] text-white/70 text-center">4 scenarios</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Collections',
    path: '/app/collections',
    color: '#16A34A',
    preview: (
      <div className="p-2">
        <div className="flex items-center gap-1 mb-2">
          {['Select Service','Review Invoice','Confirm Payment'].map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={clsx('w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold', i === 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400')}>{i+1}</div>
              <div className="text-[5px] text-slate-500">{s}</div>
              {i < 2 && <div className="w-2 h-px bg-slate-300" />}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-white rounded p-1">
            <div className="text-[6px] font-semibold text-slate-700 mb-0.5">Select Agency</div>
            <div className="grid grid-cols-2 gap-0.5">
              {['URA','NIRA','MOW','KCCA'].map((a,i) => <div key={i} className={clsx('text-[5px] rounded p-0.5 text-center', i===0 ? 'bg-primary-50 border border-primary text-primary' : 'bg-slate-100 text-slate-500')}>{a}</div>)}
            </div>
          </div>
          <div className="bg-white rounded p-1">
            <div className="text-[6px] font-semibold text-slate-700 mb-0.5">Services</div>
            {['Income Tax','VAT Payment','PAYE'].map(s => <div key={s} className="text-[5px] text-slate-600 py-0.5 border-b border-slate-100">{s}</div>)}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Operations Center',
    path: '/app/operations',
    color: '#1B3A6B',
    preview: (
      <div className="p-2">
        <div className="grid grid-cols-4 gap-0.5 mb-1.5">
          {['Payment GW','Routing','Validation','Settlement','Recon','Notif','DB Primary','Cache'].map((c,i) => (
            <div key={i} className="bg-white rounded px-0.5 py-0.5 flex items-center gap-0.5">
              <div className={clsx('w-1 h-1 rounded-full', i===5 ? 'bg-warning' : 'bg-success')} />
              <div className="text-[5px] text-slate-600 truncate">{c}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Uganda Map</div>
            <svg viewBox="0 0 40 50" className="w-full h-8">
              <path d="M10,8 L14,5 L22,5 L30,7 L34,12 L32,20 L34,26 L30,34 L24,42 L18,44 L12,40 L9,34 L8,26 L9,18 L9,13Z" stroke="#E2E8F0" strokeWidth="1" fill="#F5F7FA"/>
              {[[18,25,8],[16,30,5],[22,20,4],[25,22,3]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill="#1B3A6B" fillOpacity="0.6"/>)}
            </svg>
          </div>
          <div className="bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Live Stream</div>
            {[...Array(5)].map((_,i) => (
              <div key={i} className="flex items-center gap-0.5 py-0.5 border-b border-slate-50">
                <div className={clsx('w-1 h-1 rounded-full flex-shrink-0', i%3===0?'bg-success':i%3===1?'bg-warning':'bg-danger')} />
                <div className="text-[4px] text-slate-500 truncate">TXN-2026-{10000+i*100}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Queues</div>
            {[['Payments',62],['Settlement',45],['Webhooks',34]].map(([l,v])=>(
              <div key={String(l)} className="mb-0.5">
                <div className="text-[5px] text-slate-500">{l}</div>
                <div className="h-1 bg-slate-100 rounded overflow-hidden">
                  <div className="h-full bg-primary rounded" style={{width:`${v}%`}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Settlement',
    path: '/app/settlement',
    color: '#D97706',
    preview: (
      <div className="p-2 space-y-1.5">
        <div className="grid grid-cols-4 gap-1">
          {['UGX 24.4B Pending','4 Completed','1 Failed','UGX 19.8B Net'].map((v,i) => (
            <div key={i} className={clsx('rounded p-0.5 text-center text-[5px] font-bold', ['bg-warning-light text-warning','bg-success-light text-success','bg-danger-light text-danger','bg-primary-50 text-primary'][i])}>
              {v}
            </div>
          ))}
        </div>
        <div className="bg-white rounded overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 px-1 py-0.5">
            {['Batch ID','Participant','Net Amt','Txns','Status'].map(h=><div key={h} className="text-[5px] text-slate-400 font-semibold">{h}</div>)}
          </div>
          {[['BATCH-001','Stanbic','8.4B','12,400','pending'],['BATCH-002','MTN MoMo','12.7B','380K','processing'],['BATCH-003','Centenary','3.2B','7,800','pending']].map(([id,p,a,t,s])=>(
            <div key={String(id)} className="grid grid-cols-5 px-1 py-0.5 border-t border-slate-100">
              {[id,p,a,t].map((v,i)=><div key={i} className="text-[5px] text-slate-600 truncate">{v}</div>)}
              <div className={clsx('text-[4px] rounded px-0.5 font-bold text-center', s==='processing'?'bg-warning-light text-warning':'bg-primary-50 text-primary')}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Compliance & Risk',
    path: '/app/compliance',
    color: '#D62828',
    preview: (
      <div className="p-2">
        <div className="grid grid-cols-3 gap-1">
          <div className="space-y-0.5">
            <div className="text-[6px] font-semibold text-slate-700 mb-0.5">AML Alerts</div>
            {[['CRITICAL','High Volume'],['HIGH','Participant Down'],['HIGH','Settlement Mismatch'],['MEDIUM','High Value Txn'],['CRITICAL','Blacklist Match']].map(([sev,type])=>(
              <div key={type} className={clsx('rounded px-1 py-0.5 border-l-2 text-[5px]', sev==='CRITICAL'||sev==='HIGH'?'border-l-danger bg-danger-light/40 text-danger':'border-l-warning bg-warning-light text-warning')}>
                <span className="font-bold">{sev}</span> - {type}
              </div>
            ))}
          </div>
          <div className="col-span-2 bg-white rounded p-1">
            <div className="text-[6px] text-slate-400 mb-0.5">Velocity - 24h</div>
            <div className="flex items-end gap-px h-12">
              {[40,55,70,45,60,80,55,72,65,50,85,78,60,45,55,70,65,80,55,62,70,75,60,55].map((h,i)=>(
                <div key={i} className="flex-1 rounded-sm bg-primary/60" style={{height:`${h}%`}} />
              ))}
            </div>
            <div className="mt-0.5 w-full h-px bg-danger opacity-60" />
          </div>
        </div>
      </div>
    ),
  },
]

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary-50 border-primary/30 text-primary',
  accent:  'bg-accent/10 border-accent/30 text-amber-700',
  success: 'bg-success-light border-success/30 text-success',
  danger:  'bg-danger-light border-danger/30 text-danger',
  warning: 'bg-warning-light border-warning/30 text-warning',
  muted:   'bg-slate-50 border-border text-muted',
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ServiceCard({ svc }: { svc: typeof MICROSERVICES[0] }) {
  const [open, setOpen] = useState(false)
  const Icon = svc.icon
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-card rounded-card shadow-card border border-border overflow-hidden"
    >
      <button
        className="w-full text-left p-4"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border', COLOR_MAP[svc.color])}>
              <Icon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-bold text-slate-800">{svc.name}</code>
                <Badge variant="muted">:{svc.port}</Badge>
              </div>
              <div className="text-xs text-muted mt-0.5">{svc.tech}</div>
            </div>
          </div>
          {open ? <ChevronUp size={15} className="text-muted flex-shrink-0 mt-1" /> : <ChevronDown size={15} className="text-muted flex-shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed text-left">{svc.desc}</p>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Dependencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {svc.deps.map((d) => (
                    <span key={d} className="text-xs bg-surface border border-border rounded-full px-2.5 py-0.5">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">API Endpoints</div>
                <div className="space-y-1">
                  {svc.endpoints.map((ep) => {
                    const [method, ...rest] = ep.split(' ')
                    return (
                      <div key={ep} className="flex items-center gap-2">
                        <Badge variant={method === 'POST' ? 'info' : method === 'GET' ? 'success' : method === 'PUT' ? 'warning' : method === 'DELETE' ? 'danger' : 'muted'}>
                          {method}
                        </Badge>
                        <code className="text-xs text-slate-700">{rest.join(' ')}</code>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ArchitectureSVG() {
  return (
    <div className="bg-card rounded-card shadow-card p-6 overflow-x-auto">
      <svg viewBox="0 0 900 620" xmlns="http://www.w3.org/2000/svg" className="w-full min-w-[700px]">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-primary" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#1B3A6B" />
          </marker>
          <marker id="arrow-accent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#F4B000" />
          </marker>
        </defs>

        {/* ── Layer labels (left axis) ── */}
        {[
          [8,  62,  'CLIENT'],
          [8,  148, 'EDGE'],
          [8,  228, 'API GATEWAY'],
          [8,  330, 'MICROSERVICES'],
          [8,  458, 'DATA'],
          [8,  558, 'EXTERNAL'],
        ].map(([x, y, label]) => (
          <text key={String(label)} x={Number(x)} y={Number(y)} fontSize="8" fill="#94a3b8" fontWeight="700" letterSpacing="1" transform={`rotate(-90, ${x}, ${y})`} textAnchor="middle">
            {String(label)}
          </text>
        ))}

        {/* ══════════ LAYER 1: CLIENT ══════════ */}
        <rect x="30" y="20" width="840" height="60" rx="8" fill="#EEF2F9" stroke="#1B3A6B" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="45" y="38" fontSize="9" fill="#64748B" fontWeight="600">CLIENT LAYER</text>

        {/* Browser */}
        <rect x="50" y="42" width="120" height="30" rx="5" fill="#1B3A6B"/>
        <text x="110" y="57" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">React SPA (Vite)</text>
        <text x="110" y="67" fontSize="7" fill="#93c5fd" textAnchor="middle">TanStack Router + Query</text>

        {/* Mobile */}
        <rect x="190" y="42" width="100" height="30" rx="5" fill="#2A5298"/>
        <text x="240" y="57" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">Mobile Browser</text>
        <text x="240" y="67" fontSize="7" fill="#93c5fd" textAnchor="middle">Progressive Web App</text>

        {/* Gov portal */}
        <rect x="310" y="42" width="130" height="30" rx="5" fill="#374151"/>
        <text x="375" y="57" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">Gov Agency Portals</text>
        <text x="375" y="67" fontSize="7" fill="#9ca3af" textAnchor="middle">URA · NIRA · KCCA · MOW</text>

        {/* ══════════ LAYER 2: EDGE ══════════ */}
        <rect x="30" y="100" width="840" height="60" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="45" y="118" fontSize="9" fill="#64748B" fontWeight="600">EDGE / SECURITY LAYER</text>

        <rect x="50" y="122" width="120" height="30" rx="5" fill="#d97706"/>
        <text x="110" y="137" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">CloudFront CDN</text>
        <text x="110" y="147" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">Static assets + caching</text>

        <rect x="190" y="122" width="100" height="30" rx="5" fill="#b45309"/>
        <text x="240" y="137" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">AWS WAF</text>
        <text x="240" y="147" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">OWASP Top 10 rules</text>

        <rect x="310" y="122" width="100" height="30" rx="5" fill="#92400e"/>
        <text x="360" y="137" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">DDoS Protection</text>
        <text x="360" y="147" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">AWS Shield Advanced</text>

        <rect x="430" y="122" width="120" height="30" rx="5" fill="#78350f"/>
        <text x="490" y="137" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">NLB Load Balancer</text>
        <text x="490" y="147" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">Round-robin + health checks</text>

        {/* ══════════ LAYER 3: API GATEWAY ══════════ */}
        <rect x="30" y="180" width="840" height="65" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="45" y="198" fontSize="9" fill="#64748B" fontWeight="600">API GATEWAY LAYER - Spring Cloud Gateway 4.1</text>

        <rect x="50" y="202" width="150" height="34" rx="5" fill="#16a34a"/>
        <text x="125" y="218" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">Spring Cloud Gateway</text>
        <text x="125" y="228" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">:8080  |  Route predicates</text>

        <rect x="220" y="202" width="120" height="34" rx="5" fill="#15803d"/>
        <text x="280" y="218" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">JWT Validation</text>
        <text x="280" y="228" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">RS256 · Spring Security</text>

        <rect x="360" y="202" width="120" height="34" rx="5" fill="#166534"/>
        <text x="420" y="218" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">Rate Limiting</text>
        <text x="420" y="228" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">Bucket4j · Redis backend</text>

        <rect x="500" y="202" width="120" height="34" rx="5" fill="#14532d"/>
        <text x="560" y="218" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">SSL Termination</text>
        <text x="560" y="228" fontSize="7" fill="white" textAnchor="middle" opacity="0.8">TLS 1.3 · ACM certs</text>

        <rect x="640" y="202" width="120" height="34" rx="5" fill="#1a1a2e"/>
        <text x="700" y="218" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">Eureka Discovery</text>
        <text x="700" y="228" fontSize="7" fill="#a5b4fc" textAnchor="middle" opacity="0.8">Netflix OSS · :8761</text>

        {/* ══════════ LAYER 4: MICROSERVICES ══════════ */}
        <rect x="30" y="265" width="840" height="130" rx="8" fill="#EEF2F9" stroke="#1B3A6B" strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x="45" y="283" fontSize="9" fill="#64748B" fontWeight="600">SPRING BOOT MICROSERVICES - Java 21 · Docker · Kubernetes</text>

        {[
          [45,  'Payment\nService\n:8082', '#F4B000'],
          [130, 'Routing\nService\n:8083', '#1B3A6B'],
          [215, 'Collections\n:8084',     '#16A34A'],
          [300, 'Settlement\n:8085',      '#D97706'],
          [385, 'Reconciliation\n:8086',  '#2A5298'],
          [470, 'Compliance\nAML :8087',  '#D62828'],
          [555, 'Dispute\n:8088',         '#7C3AED'],
          [640, 'Notification\n:8089',    '#0F766E'],
          [725, 'Reporting\n:8090',       '#059669'],
          [810, 'Participant\n:8091',     '#64748B'],
        ].map(([x, label, color], i) => (
          <g key={i}>
            <rect x={Number(x)} y="288" width="75" height="95" rx="6" fill={String(color)} />
            <text textAnchor="middle" fontSize="7" fill="white" fontWeight="700">
              {String(label).split('\n').map((line, j) => (
                <tspan key={j} x={Number(x) + 37.5} dy={j === 0 ? 18 : 12}>{line}</tspan>
              ))}
            </text>
            {/* Spring Boot badge */}
            <rect x={Number(x) + 5} y="365" width="65" height="12" rx="3" fill="rgba(255,255,255,0.2)" />
            <text x={Number(x) + 37.5} y="374" textAnchor="middle" fontSize="6" fill="white">Spring Boot 3.2</text>
          </g>
        ))}

        {/* Kafka bus line */}
        <rect x="30" y="400" width="840" height="18" rx="4" fill="#f97316" opacity="0.15"/>
        <line x1="30" y1="409" x2="870" y2="409" stroke="#f97316" strokeWidth="2" strokeDasharray="6,3"/>
        <text x="440" y="413" fontSize="8" fill="#ea580c" textAnchor="middle" fontWeight="700">Apache Kafka 3.6 - Event Bus (payment.events · settlement.commands · compliance.alerts · audit.log)</text>

        {/* ══════════ LAYER 5: DATA ══════════ */}
        <rect x="30" y="428" width="840" height="70" rx="8" fill="#fdf4ff" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="45" y="446" fontSize="9" fill="#64748B" fontWeight="600">DATA LAYER</text>

        {[
          [50,  '#3b82f6', 'PostgreSQL 16', 'Per-service schema\nPgBouncer pooling'],
          [200, '#ef4444', 'Redis 7.2',     'Cache · Sessions\nIdempotency keys'],
          [350, '#f59e0b', 'Elasticsearch', 'Audit log · Search\n90-day retention'],
          [500, '#10b981', 'MinIO',         'Documents · Reports\nS3-compatible API'],
          [650, '#8b5cf6', 'HashiCorp Vault','API keys (AES-256)\nCred rotation'],
        ].map(([x, color, name, desc], i) => (
          <g key={i}>
            <rect x={Number(x)} y="452" width="130" height="38" rx="5" fill={String(color)} opacity="0.85"/>
            <text x={Number(x) + 65} y="468" fontSize="8" fill="white" textAnchor="middle" fontWeight="700">{String(name)}</text>
            {String(desc).split('\n').map((line, j) => (
              <text key={j} x={Number(x) + 65} y={478 + j * 9} fontSize="6.5" fill="white" textAnchor="middle" opacity="0.85">{line}</text>
            ))}
          </g>
        ))}

        {/* ══════════ LAYER 6: EXTERNAL ══════════ */}
        <rect x="30" y="515" width="840" height="70" rx="8" fill="#f1f5f9" stroke="#64748B" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="45" y="533" fontSize="9" fill="#64748B" fontWeight="600">EXTERNAL INTEGRATIONS</text>

        {[
          [50,  '#1B3A6B', 'BOU RTGS',   'ISO 20022 / SWIFT'],
          [165, '#FFCB00', 'MTN MoMo',   'REST OAuth2'],
          [280, '#EF0000', 'Airtel Money','REST API Key'],
          [395, '#003087', 'Banks',       'ISO 8583 / REST'],
          [510, '#006400', 'Gov Agencies','REST / SOAP mTLS'],
          [625, '#FF6B35', "Africa's Talking",'SMS Gateway'],
          [740, '#FF9900', 'AWS SES',    'Email SMTP/API'],
        ].map(([x, color, name, proto], i) => (
          <g key={i}>
            <rect x={Number(x)} y="538" width="105" height="38" rx="5" fill={String(color)} opacity="0.9"/>
            <text x={Number(x) + 52} y="554" fontSize="7.5" fill="white" textAnchor="middle" fontWeight="700">{String(name)}</text>
            <text x={Number(x) + 52} y="565" fontSize="6" fill="white" textAnchor="middle" opacity="0.8">{String(proto)}</text>
          </g>
        ))}

        {/* ── Connector arrows ── */}
        {/* Client → Edge */}
        <line x1="220" y1="80" x2="220" y2="100" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)"/>
        {/* Edge → Gateway */}
        <line x1="450" y1="160" x2="450" y2="180" stroke="#16a34a" strokeWidth="1.5" markerEnd="url(#arrow-primary)"/>
        {/* Gateway → Services */}
        <line x1="450" y1="245" x2="450" y2="265" stroke="#1B3A6B" strokeWidth="1.5" markerEnd="url(#arrow-primary)"/>
        {/* Services → Kafka */}
        <line x1="450" y1="395" x2="450" y2="400" stroke="#f97316" strokeWidth="1.5"/>
        {/* Kafka → Data */}
        <line x1="450" y1="418" x2="450" y2="428" stroke="#7c3aed" strokeWidth="1.5" markerEnd="url(#arrow)"/>
        {/* Data → External */}
        <line x1="450" y1="498" x2="450" y2="515" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow)"/>
      </svg>
    </div>
  )
}

function DataFlowSection() {
  const steps = [
    { n: '01', title: 'Citizen Initiates', color: 'bg-primary', desc: 'Citizen accesses Gov Agency portal (e.g. URA tax payment). React SPA calls POST /collections/invoices via API Gateway.' },
    { n: '02', title: 'PRN Generated', color: 'bg-primary-light', desc: 'govpay-collections generates a unique Payment Reference Number (PRN). Invoice stored in PostgreSQL. Event published to Kafka topic payment.created.' },
    { n: '03', title: 'JWT Auth Check', color: 'bg-success', desc: 'Spring Cloud Gateway intercepts request. govpay-auth validates RS256 JWT, checks role permissions. Bucket4j enforces rate limits per participant.' },
    { n: '04', title: 'Routing Decision', color: 'bg-warning', desc: 'govpay-routing evaluates routing rules (priority, amount, channel health). Primary route selected. Resilience4j circuit breaker monitors downstream health.' },
    { n: '05', title: 'Channel Processing', color: 'bg-accent', desc: 'govpay-payment calls selected channel API (MTN MoMo / Bank / Card). Idempotency key stored in Redis (24h TTL). State machine: INITIATED → PROCESSING.' },
    { n: '06', title: 'Async Confirmation', color: 'bg-primary', desc: 'Channel posts webhook callback to govpay-payment. State machine transitions to CONFIRMED. Kafka event: payment.confirmed published to all consumers.' },
    { n: '07', title: 'Agency Notification', color: 'bg-success', desc: 'govpay-collections webhook notifies agency. govpay-notification sends SMS/email to payer via Africa\'s Talking + AWS SES.' },
    { n: '08', title: 'AML Compliance', color: 'bg-danger', desc: 'govpay-compliance Drools engine evaluates transaction against AML rules (velocity, blacklist, structuring). Alert raised if threshold exceeded.' },
    { n: '09', title: 'Audit Logging', color: 'bg-muted text-slate-800', desc: 'All events indexed in Elasticsearch via Kafka consumer. Immutable audit trail with actor, action, timestamp, and IP address.' },
    { n: '10', title: 'Settlement (EOD)', color: 'bg-primary', desc: 'Spring Batch job aggregates all day\'s transactions. Net positions computed per participant. SWIFT MT202 generated. BOU RTGS settlement initiated.' },
  ]
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      {steps.map((s, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          className="relative flex gap-5 mb-5 last:mb-0"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 z-10 shadow-md ${s.color}`}>
            {s.n}
          </div>
          <div className="bg-card rounded-card shadow-card p-4 flex-1">
            <div className="text-sm font-bold text-slate-800 mb-1">{s.title}</div>
            <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function downloadMd() {
  const a = document.createElement('a')
  a.href = '/ARCHITECTURE.md'
  a.download = 'Uganda-GovPay-Switch-Architecture.md'
  a.click()
}

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'flow' | 'data' | 'infra' | 'screenshots'>('overview')

  // Inject print stylesheet on mount, remove on unmount
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'arch-print-styles'
    style.textContent = PRINT_STYLES
    document.head.appendChild(style)
    return () => { document.getElementById('arch-print-styles')?.remove() }
  }, [])

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'overview',     label: 'Architecture Overview' },
    { id: 'services',     label: 'Spring Boot Services' },
    { id: 'flow',         label: 'Payment Data Flow' },
    { id: 'data',         label: 'Data & Storage' },
    { id: 'infra',        label: 'Infrastructure' },
    { id: 'screenshots',  label: 'UI Screenshots' },
  ]

  return (
    <div>
      <PageHeader
        title="System Architecture"
        subtitle="Uganda GovPay Switch - Full-stack national payment infrastructure design"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="success">Spring Boot 3.2</Badge>
            <Badge variant="info">Java 21</Badge>
            <Badge variant="accent">React 19</Badge>
            <Badge variant="muted">Kubernetes</Badge>
            <div className="h-4 w-px bg-border mx-1" />
            <button
              onClick={downloadMd}
              title="Download ARCHITECTURE.md"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-slate-700 hover:bg-surface transition-colors no-print"
            >
              <FileDown size={13} /> Download .md
            </button>
            <button
              onClick={() => window.print()}
              title="Export as PDF via browser print dialog (choose 'Save as PDF')"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-light transition-colors no-print"
            >
              <Printer size={13} /> Export PDF
            </button>
          </div>
        }
      />

      {/* Tab navigation */}
      <div className="flex gap-1 bg-surface p-1 rounded-lg mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-1.5 text-sm rounded-md transition-all font-medium',
              activeTab === tab.id
                ? 'bg-card text-slate-800 shadow-card'
                : 'text-muted hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <motion.div variants={fadeInUp}>
              <h2 className="text-base font-bold text-slate-800 mb-3">Full System Architecture Diagram</h2>
              <ArchitectureSVG />
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-card rounded-card shadow-card p-4 border-t-[3px] border-t-primary">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Frontend Stack</div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {['React 19 + Vite 6 + TypeScript','TanStack Router v1 (client-side routing)','TanStack Query v5 (server state)','Zustand v5 (global UI state)','Framer Motion v12 (animations)','Tailwind CSS v3 (design system)','Recharts v2 (analytics charts)','Radix UI (accessible primitives)'].map(t => <li key={t} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{t}</li>)}
                </ul>
              </div>
              <div className="bg-card rounded-card shadow-card p-4 border-t-[3px] border-t-success">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Backend Stack</div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {['Java 21 (Virtual Threads via Loom)','Spring Boot 3.2 (12 microservices)','Spring Cloud Gateway 4.1','Spring Security + OAuth2 / JWT','Spring Batch (settlement & recon)','Spring State Machine (payment lifecycle)','Spring Cloud Config + Eureka','Resilience4j (circuit breaker)'].map(t => <li key={t} className="flex items-start gap-1.5"><span className="text-success mt-0.5">•</span>{t}</li>)}
                </ul>
              </div>
              <div className="bg-card rounded-card shadow-card p-4 border-t-[3px] border-t-warning">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Infrastructure</div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {['AWS EKS (Kubernetes orchestration)','Docker (containerisation)','Apache Kafka 3.6 (event streaming)','PostgreSQL 16 (per-service DB)','Redis 7.2 (cache + idempotency)','Elasticsearch 8.x (audit + search)','HashiCorp Vault (secrets)','Prometheus + Grafana (observability)'].map(t => <li key={t} className="flex items-start gap-1.5"><span className="text-warning mt-0.5">•</span>{t}</li>)}
                </ul>
              </div>
            </motion.div>

            {/* System stats */}
            <motion.div variants={fadeInUp} className="mt-4 grid grid-cols-6 gap-3">
              {[
                { label: 'Microservices', value: '12' },
                { label: 'API Endpoints', value: '60+' },
                { label: 'Kafka Topics', value: '8' },
                { label: 'DB Schemas', value: '12' },
                { label: 'Target TPS', value: '10,000' },
                { label: 'SLA Uptime', value: '99.99%' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-card rounded-card shadow-card p-3 text-center border-t-2 border-t-primary">
                  <div className="text-xl font-black text-primary">{value}</div>
                  <div className="text-xs text-muted mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── SPRING BOOT SERVICES ── */}
        {activeTab === 'services' && (
          <motion.div key="services" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <motion.div variants={fadeInUp} className="bg-primary-50 border border-primary/20 rounded-lg px-4 py-3 mb-5 text-sm text-primary">
              <strong>Architecture pattern:</strong> Database-per-service with shared Kafka event bus. Each service is independently deployable, horizontally scalable, and maintains its own PostgreSQL schema. Inter-service communication is asynchronous via Kafka for commands and synchronous via Feign HTTP clients for queries.
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {MICROSERVICES.map((svc) => <ServiceCard key={svc.id} svc={svc} />)}
            </div>
          </motion.div>
        )}

        {/* ── PAYMENT DATA FLOW ── */}
        {activeTab === 'flow' && (
          <motion.div key="flow" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-4 mb-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">End-to-End Payment Journey</h3>
              <p className="text-xs text-muted leading-relaxed">
                A single payment traverses 10 discrete stages across 7 microservices, 3 external systems, and 4 data stores before reaching final settlement. Average processing time: <strong className="text-slate-700">342ms</strong> (P95: 890ms). The flow is event-driven - services communicate via Kafka ensuring loose coupling and replay capability.
              </p>
            </motion.div>
            <DataFlowSection />
          </motion.div>
        )}

        {/* ── DATA & STORAGE ── */}
        {activeTab === 'data' && (
          <motion.div key="data" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4 mb-5">
              {DATABASES.map((db) => (
                <div key={db.name} className="bg-card rounded-card shadow-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-slate-800">{db.name}</div>
                    <Badge variant="info">{db.badge}</Badge>
                  </div>
                  <div className="text-xs font-medium text-muted mb-1">{db.role}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{db.detail}</p>
                </div>
              ))}
            </motion.div>

            {/* External integrations */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-bold text-slate-800 mb-3">External System Integrations</h3>
              <div className="grid grid-cols-2 gap-3">
                {EXTERNAL_SYSTEMS.map((sys) => (
                  <div key={sys.name} className="bg-card rounded-card shadow-card p-4 flex gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-semibold text-slate-800">{sys.name}</div>
                        <Badge variant="muted">{sys.type}</Badge>
                      </div>
                      <div className="text-xs text-primary font-mono mb-1">{sys.protocol}</div>
                      <p className="text-xs text-muted leading-relaxed">{sys.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── INFRASTRUCTURE ── */}
        {activeTab === 'infra' && (
          <motion.div key="infra" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4 mb-5">
              {INFRA_LAYERS.map((layer) => {
                const Icon = layer.icon
                return (
                  <div key={layer.name} className="bg-card rounded-card shadow-card p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 mb-1">{layer.name}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{layer.detail}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Deployment pipeline */}
            <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">CI/CD Pipeline</h3>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {[
                  { stage: 'Code Push', detail: 'Git + Gerrit code review', color: '#1B3A6B' },
                  { stage: 'Build & Test', detail: 'Jenkins + JUnit 5 + Testcontainers', color: '#2A5298' },
                  { stage: 'SAST Scan', detail: 'SonarQube + OWASP Dependency Check', color: '#D97706' },
                  { stage: 'Docker Build', detail: 'Multi-stage Dockerfile + ECR push', color: '#16A34A' },
                  { stage: 'Staging Deploy', detail: 'Helm chart → EKS staging namespace', color: '#0F766E' },
                  { stage: 'Integration Tests', detail: 'Postman + Newman E2E test suite', color: '#7C3AED' },
                  { stage: 'Prod Deploy', detail: 'Blue/green via Argo Rollouts', color: '#D62828' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center flex-shrink-0">
                    <div className="text-center px-3 py-2 rounded-lg min-w-[110px]" style={{ background: s.color }}>
                      <div className="text-xs font-bold text-white">{s.stage}</div>
                      <div className="text-[10px] text-white/70 mt-0.5">{s.detail}</div>
                    </div>
                    {i < 6 && <ArrowRight size={14} className="text-muted mx-1 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── SCREENSHOTS ── */}
        {activeTab === 'screenshots' && (
          <motion.div key="screenshots" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <motion.div variants={fadeInUp} className="mb-4 text-sm text-muted bg-card rounded-card shadow-card p-4">
              UI preview thumbnails of the 13 platform modules - rendered using the actual React component design system (navy #1B3A6B · gold #F4B000 · Tailwind CSS tokens).
            </motion.div>
            <div className="grid grid-cols-3 gap-4">
              {SCREENSHOTS.map((s) => (
                <motion.div key={s.title} variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden group">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border-b border-border">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div className="flex-1 bg-white rounded text-[8px] text-muted text-center py-0.5 ml-2 font-mono">
                      localhost:5173{s.path}
                    </div>
                  </div>
                  {/* Sidebar strip */}
                  <div className="flex">
                    <div className="w-10 bg-primary flex-shrink-0 flex flex-col items-center py-2 gap-1.5">
                      <div className="w-5 h-5 rounded" style={{ background: '#F4B000' }} />
                      {[...Array(6)].map((_, i) => <div key={i} className="w-3 h-3 rounded bg-white/20" />)}
                    </div>
                    {/* Screen preview */}
                    <div className="flex-1 bg-surface p-0 overflow-hidden" style={{ minHeight: 120 }}>
                      {/* Topbar */}
                      <div className="flex items-center justify-between px-2 py-1 bg-white border-b border-slate-100">
                        <div className="text-[6px] text-primary font-semibold">{s.title}</div>
                        <div className="flex gap-1">
                          <div className="w-8 h-2 bg-slate-100 rounded" />
                          <div className="w-4 h-2 bg-slate-100 rounded" />
                        </div>
                      </div>
                      {s.preview}
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">{s.title}</span>
                    <code className="text-[10px] text-muted">{s.path}</code>
                  </div>
                </motion.div>
              ))}

              {/* Remaining modules as simple cards */}
              {[
                { title: 'Payment Routing', path: '/app/routing', desc: 'Routing rules table + animated route visualizer + channel health grid' },
                { title: 'Reconciliation', path: '/app/reconciliation', desc: 'Donut score chart + 14-day match rate trend + 3-tab exception queue' },
                { title: 'Disputes & Refunds', path: '/app/disputes', desc: 'Filterable dispute table + SLA countdown timer + resolution workflow drawer' },
                { title: 'API Platform', path: '/app/api-platform', desc: '8 endpoint cards + Try It split-pane modal + webhook delivery log' },
                { title: 'Participants', path: '/app/participants', desc: 'Sortable table + API health sparkline drawer + API key management modal' },
                { title: 'Reports & Analytics', path: '/app/reports', desc: '6-chart grid + date range selector + treasury collection summary table' },
                { title: 'Admin & Config', path: '/app/admin', desc: '8-tab layout: role matrix · routing reorder · limits · settlement cycles' },
              ].map((m) => (
                <motion.div key={m.title} variants={fadeInUp} className="bg-card rounded-card shadow-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-bold text-slate-800">{m.title}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{m.desc}</p>
                  </div>
                  <code className="text-[10px] text-muted mt-3 block">{m.path}</code>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
