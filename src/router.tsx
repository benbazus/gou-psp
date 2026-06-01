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
