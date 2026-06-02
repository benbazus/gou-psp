import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from './components/layout/AppShell'
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
import ArchitecturePage from './routes/app/architecture'
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
import type { Role } from './types'
import { Lock } from 'lucide-react'

// ─── RBAC map ─────────────────────────────────────────────────────────────────
const ALL: Role[] = [
  'Super Admin', 'Bank of Uganda Operator', 'Treasury Officer', 'Agency Officer',
  'Compliance Officer', 'Settlement Officer', 'Support Officer', 'Developer',
]
const RTGS_ALL: Role[] = [
  'RTGS Super Admin', 'Central Bank Settlement Operator', 'Treasury Settlement Officer',
  'Bank RTGS Operator', 'Liquidity Manager', 'RTGS Auditor',
]
const RTGS_AND_SUPER: Role[] = ['Super Admin', ...RTGS_ALL]

export const ROUTE_ROLES: Record<string, Role[]> = {
  '/app/dashboard':      ALL,
  '/app/simulator':      ALL,
  '/app/collections':    ['Super Admin', 'Agency Officer', 'Support Officer', 'Treasury Officer'],
  '/app/routing':        ['Super Admin', 'Bank of Uganda Operator'],
  '/app/participants':   ['Super Admin', 'Bank of Uganda Operator', 'Treasury Officer', 'Settlement Officer'],
  '/app/settlement':     ['Super Admin', 'Treasury Officer', 'Settlement Officer', 'Bank of Uganda Operator'],
  '/app/reconciliation': ['Super Admin', 'Treasury Officer', 'Settlement Officer'],
  '/app/compliance':     ['Super Admin', 'Bank of Uganda Operator', 'Compliance Officer'],
  '/app/disputes':       ['Super Admin', 'Support Officer', 'Settlement Officer', 'Compliance Officer'],
  '/app/api-platform':   ['Super Admin', 'Developer'],
  '/app/operations':     ['Super Admin', 'Bank of Uganda Operator', 'Treasury Officer'],
  '/app/reports':        ALL,
  '/app/admin':          ['Super Admin'],
  '/app/architecture':   ALL,
  '/app/rtgs':              RTGS_AND_SUPER,
  '/app/rtgs/simulator':    ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Super Admin'],
  '/app/rtgs/queue':        ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Treasury Settlement Officer', 'Super Admin'],
  '/app/rtgs/liquidity':    ['RTGS Super Admin', 'Liquidity Manager', 'Central Bank Settlement Operator', 'Super Admin'],
  '/app/rtgs/interbank':    ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Bank RTGS Operator', 'Super Admin'],
  '/app/rtgs/treasury':     ['RTGS Super Admin', 'Treasury Settlement Officer', 'Super Admin'],
  '/app/rtgs/participants': ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Super Admin'],
  '/app/rtgs/exceptions':   ['RTGS Super Admin', 'Central Bank Settlement Operator', 'Treasury Settlement Officer', 'Super Admin'],
  '/app/rtgs/reports':      RTGS_AND_SUPER,
  '/app/rtgs/admin':        ['RTGS Super Admin', 'Super Admin'],
}

function canAccess(path: string, role: Role | null): boolean {
  if (!role) return false
  return (ROUTE_ROLES[path] ?? ALL).includes(role)
}

// ─── Access Denied component ──────────────────────────────────────────────────
function AccessDenied({ path }: { path: string }) {
  const allowed = ROUTE_ROLES[path] ?? ALL
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
        <Lock size={28} className="text-danger" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
      <p className="text-muted text-sm max-w-sm mb-4">
        Your current role does not have permission to access this module. Contact your system administrator to request access.
      </p>
      <div className="bg-surface border border-border rounded-xl px-4 py-3 max-w-xs w-full text-left">
        <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wider">Authorised roles</p>
        <div className="flex flex-wrap gap-1.5">
          {allowed.map((r) => (
            <span key={r} className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Guard helper ─────────────────────────────────────────────────────────────
function guardedRoute(path: string, Page: React.ComponentType) {
  return function GuardedPage() {
    const role = (localStorage.getItem('govpay_role') as Role | null)
    if (!canAccess(path, role)) return <AccessDenied path={path} />
    return <Page />
  }
}

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
  component: AppShell,
  beforeLoad: () => {
    const role = localStorage.getItem('govpay_role')
    const mfa  = localStorage.getItem('govpay_mfa')
    if (!role || mfa !== '1') throw redirect({ to: '/login' })
  },
})

const dashboardRoute      = createRoute({ getParentRoute: () => appRoute, path: '/dashboard',      component: guardedRoute('/app/dashboard',      DashboardPage) })
const simulatorRoute      = createRoute({ getParentRoute: () => appRoute, path: '/simulator',      component: guardedRoute('/app/simulator',      SimulatorPage) })
const collectionsRoute    = createRoute({ getParentRoute: () => appRoute, path: '/collections',    component: guardedRoute('/app/collections',    CollectionsPage) })
const routingRoute        = createRoute({ getParentRoute: () => appRoute, path: '/routing',        component: guardedRoute('/app/routing',        RoutingPage) })
const participantsRoute   = createRoute({ getParentRoute: () => appRoute, path: '/participants',   component: guardedRoute('/app/participants',   ParticipantsPage) })
const settlementRoute     = createRoute({ getParentRoute: () => appRoute, path: '/settlement',     component: guardedRoute('/app/settlement',     SettlementPage) })
const reconciliationRoute = createRoute({ getParentRoute: () => appRoute, path: '/reconciliation', component: guardedRoute('/app/reconciliation', ReconciliationPage) })
const complianceRoute     = createRoute({ getParentRoute: () => appRoute, path: '/compliance',     component: guardedRoute('/app/compliance',     CompliancePage) })
const disputesRoute       = createRoute({ getParentRoute: () => appRoute, path: '/disputes',       component: guardedRoute('/app/disputes',       DisputesPage) })
const apiPlatformRoute    = createRoute({ getParentRoute: () => appRoute, path: '/api-platform',   component: guardedRoute('/app/api-platform',   ApiPlatformPage) })
const operationsRoute     = createRoute({ getParentRoute: () => appRoute, path: '/operations',     component: guardedRoute('/app/operations',     OperationsPage) })
const reportsRoute        = createRoute({ getParentRoute: () => appRoute, path: '/reports',        component: guardedRoute('/app/reports',        ReportsPage) })
const adminRoute          = createRoute({ getParentRoute: () => appRoute, path: '/admin',          component: guardedRoute('/app/admin',          AdminPage) })
const architectureRoute   = createRoute({ getParentRoute: () => appRoute, path: '/architecture',   component: guardedRoute('/app/architecture',   ArchitecturePage) })

const rtgsDashboardRoute    = createRoute({ getParentRoute: () => appRoute, path: '/rtgs',              component: guardedRoute('/app/rtgs',              RTGSDashboardPage) })
const rtgsSimulatorRoute    = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/simulator',    component: guardedRoute('/app/rtgs/simulator',    RTGSSimulatorPage) })
const rtgsQueueRoute        = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/queue',        component: guardedRoute('/app/rtgs/queue',        RTGSQueuePage) })
const rtgsLiquidityRoute    = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/liquidity',    component: guardedRoute('/app/rtgs/liquidity',    RTGSLiquidityPage) })
const rtgsInterbankRoute    = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/interbank',    component: guardedRoute('/app/rtgs/interbank',    RTGSInterbankPage) })
const rtgsTreasuryRoute     = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/treasury',     component: guardedRoute('/app/rtgs/treasury',     RTGSTreasuryPage) })
const rtgsParticipantsRoute = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/participants', component: guardedRoute('/app/rtgs/participants', RTGSParticipantsPage) })
const rtgsExceptionsRoute   = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/exceptions',   component: guardedRoute('/app/rtgs/exceptions',   RTGSExceptionsPage) })
const rtgsReportsRoute      = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/reports',      component: guardedRoute('/app/rtgs/reports',      RTGSReportsPage) })
const rtgsAdminRoute        = createRoute({ getParentRoute: () => appRoute, path: '/rtgs/admin',        component: guardedRoute('/app/rtgs/admin',        RTGSAdminPage) })

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute, simulatorRoute, collectionsRoute, routingRoute,
    participantsRoute, settlementRoute, reconciliationRoute, complianceRoute,
    disputesRoute, apiPlatformRoute, operationsRoute, reportsRoute, adminRoute, architectureRoute,
    rtgsDashboardRoute, rtgsSimulatorRoute, rtgsQueueRoute, rtgsLiquidityRoute,
    rtgsInterbankRoute, rtgsTreasuryRoute, rtgsParticipantsRoute,
    rtgsExceptionsRoute, rtgsReportsRoute, rtgsAdminRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
