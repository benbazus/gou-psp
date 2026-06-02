import React from 'react'
import { createRouter, createRootRoute, createRoute, Outlet, redirect, useParams } from '@tanstack/react-router'
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

// ─── Bank portal pages (placeholders — real implementations in Tasks 12-15) ──
import BankDashboardPage         from './routes/app/bank/dashboard'
import BankIncomingPage          from './routes/app/bank/incoming'
import BankOutgoingPage          from './routes/app/bank/outgoing'
import BankRtgsQueuePage         from './routes/app/bank/rtgs-queue'
import BankSettlementPage        from './routes/app/bank/settlement'
import BankLiquidityPage         from './routes/app/bank/liquidity'
import BankExceptionsPage        from './routes/app/bank/exceptions'
import BankTreasuryTransfersPage from './routes/app/bank/treasury-transfers'
import BankReconciliationPage    from './routes/app/bank/reconciliation'
import BankReportsPage           from './routes/app/bank/reports'

import { nationalPortalConfig, rtgsPortalConfig, BANK_CONFIGS } from './data/mockPortalConfigs'
import type { Role } from './types'
import { Lock } from 'lucide-react'

// ─── RBAC map ─────────────────────────────────────────────────────────────────
export const ROUTE_ROLES: Record<string, Role[]> = {
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

function BankPortalShell() {
  const { bankId } = useParams({ strict: false }) as { bankId: string }
  const config = BANK_CONFIGS[bankId]
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted text-sm">Unknown bank: {bankId}</p>
      </div>
    )
  }
  return <PortalShell config={config} />
}

// ─── Route tree ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">Page Not Found</h1>
        <p className="text-muted text-sm">This route does not exist in Uganda GovPay Switch.</p>
      </div>
    </div>
  ),
})

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

const rtgsIndex        = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/',             component: guardedRoute('/app/rtgs',              RTGSDashboardPage) })
const rtgsSimulator    = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/simulator',    component: guardedRoute('/app/rtgs/simulator',    RTGSSimulatorPage) })
const rtgsQueue        = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/queue',        component: guardedRoute('/app/rtgs/queue',        RTGSQueuePage) })
const rtgsLiquidity    = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/liquidity',    component: guardedRoute('/app/rtgs/liquidity',    RTGSLiquidityPage) })
const rtgsInterbank    = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/interbank',    component: guardedRoute('/app/rtgs/interbank',    RTGSInterbankPage) })
const rtgsTreasury     = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/treasury',     component: guardedRoute('/app/rtgs/treasury',     RTGSTreasuryPage) })
const rtgsParticipants = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/participants', component: guardedRoute('/app/rtgs/participants', RTGSParticipantsPage) })
const rtgsExceptions   = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/exceptions',   component: guardedRoute('/app/rtgs/exceptions',   RTGSExceptionsPage) })
const rtgsReports      = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/reports',      component: guardedRoute('/app/rtgs/reports',      RTGSReportsPage) })
const rtgsAdmin        = createRoute({ getParentRoute: () => rtgsShellRoute, path: '/admin',        component: guardedRoute('/app/rtgs/admin',        RTGSAdminPage) })

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
