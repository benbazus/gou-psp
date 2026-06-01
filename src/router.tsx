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
import type { Role } from './types'
import { Lock } from 'lucide-react'

// ─── RBAC map ─────────────────────────────────────────────────────────────────
const ALL: Role[] = [
  'Super Admin', 'Bank of Uganda Operator', 'Treasury Officer', 'Agency Officer',
  'Compliance Officer', 'Settlement Officer', 'Support Officer', 'Developer',
]

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute, simulatorRoute, collectionsRoute, routingRoute,
    participantsRoute, settlementRoute, reconciliationRoute, complianceRoute,
    disputesRoute, apiPlatformRoute, operationsRoute, reportsRoute, adminRoute, architectureRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
