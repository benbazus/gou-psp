import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, ListOrdered,
  Banknote, Gauge, AlertTriangle, Vault, RefreshCw,
  BarChart3, Settings, Building2, GitBranch, Users,
  ShieldAlert, MessageSquareWarning, Code2, Activity,
  Landmark, Cpu, ArrowLeftRight, UserCheck, FileBarChart,
  SlidersHorizontal,
} from 'lucide-react'
import type { PortalConfig } from '../types'

// ─── National GovPay Command Center ──────────────────────────────────────────
export const nationalPortalConfig: PortalConfig = {
  portalType: 'national',
  tenantId: 'national',
  tenantName: 'Uganda GovPay',
  tenantShort: 'GovPay',
  accentColor: '#3b82f6',
  accentLight: '#dbeafe',
  accentDark: '#1e3a8a',
  homeRoute: '/app/national/dashboard',
  allowedRoles: [
    'Super Admin', 'Bank of Uganda Operator', 'Treasury Officer',
    'Agency Officer', 'Compliance Officer', 'Settlement Officer',
    'Support Officer', 'Developer',
  ],
  navSections: [
    {
      header: 'GovPay Platform',
      items: [
        { path: '/app/national/dashboard',      icon: LayoutDashboard,      label: 'Dashboard' },
        { path: '/app/national/collections',    icon: Building2,            label: 'Collections' },
        { path: '/app/national/routing',        icon: GitBranch,            label: 'Routing' },
        { path: '/app/national/participants',   icon: Users,                label: 'Participants' },
        { path: '/app/national/settlement',     icon: Banknote,             label: 'Settlement' },
        { path: '/app/national/reconciliation', icon: RefreshCw,            label: 'Reconciliation' },
        { path: '/app/national/compliance',     icon: ShieldAlert,          label: 'Compliance' },
        { path: '/app/national/disputes',       icon: MessageSquareWarning, label: 'Disputes' },
        { path: '/app/national/api-platform',   icon: Code2,                label: 'API Platform' },
        { path: '/app/national/operations',     icon: Activity,             label: 'Operations Center' },
        { path: '/app/national/reports',        icon: BarChart3,            label: 'Reports' },
        { path: '/app/national/admin',          icon: Settings,             label: 'Admin Settings' },
      ],
    },
    {
      header: 'RTGS Command Center',
      accent: 'amber',
      items: [
        { path: '/app/rtgs',              icon: Landmark,          label: 'RTGS Dashboard',      external: true },
        { path: '/app/rtgs/queue',        icon: ListOrdered,       label: 'Settlement Queue',    external: true },
        { path: '/app/rtgs/liquidity',    icon: Gauge,             label: 'Liquidity Monitor',   external: true },
        { path: '/app/rtgs/interbank',    icon: ArrowLeftRight,    label: 'Interbank Transfers', external: true },
        { path: '/app/rtgs/treasury',     icon: Vault,             label: 'Treasury Transfers',  external: true },
        { path: '/app/rtgs/exceptions',   icon: AlertTriangle,     label: 'RTGS Exceptions',     external: true },
        { path: '/app/rtgs/reports',      icon: FileBarChart,      label: 'RTGS Reports',        external: true },
      ],
    },
  ],
}

// ─── RTGS Command Center portal ───────────────────────────────────────────────
export const rtgsPortalConfig: PortalConfig = {
  portalType: 'rtgs',
  tenantId: 'rtgs',
  tenantName: 'RTGS Command Center',
  tenantShort: 'RTGS',
  accentColor: '#f59e0b',
  accentLight: '#fef3c7',
  accentDark: '#78350f',
  homeRoute: '/app/rtgs',
  allowedRoles: [
    'RTGS Super Admin', 'Central Bank Settlement Operator',
    'Treasury Settlement Officer', 'Bank RTGS Operator',
    'Liquidity Manager', 'RTGS Auditor', 'Super Admin',
  ],
  navSections: [
    {
      header: 'RTGS Command Center',
      accent: 'amber',
      items: [
        { path: '/app/rtgs',              icon: Landmark,          label: 'RTGS Dashboard' },
        { path: '/app/rtgs/simulator',    icon: Cpu,               label: 'RTGS Simulator' },
        { path: '/app/rtgs/queue',        icon: ListOrdered,       label: 'Settlement Queue' },
        { path: '/app/rtgs/liquidity',    icon: Gauge,             label: 'Liquidity Monitor' },
        { path: '/app/rtgs/interbank',    icon: ArrowLeftRight,    label: 'Interbank Transfers' },
        { path: '/app/rtgs/treasury',     icon: Vault,             label: 'Treasury Transfers' },
        { path: '/app/rtgs/participants', icon: UserCheck,         label: 'RTGS Participants' },
        { path: '/app/rtgs/exceptions',   icon: AlertTriangle,     label: 'RTGS Exceptions' },
        { path: '/app/rtgs/reports',      icon: FileBarChart,      label: 'RTGS Reports' },
        { path: '/app/rtgs/admin',        icon: SlidersHorizontal, label: 'RTGS Admin' },
      ],
    },
  ],
}

// ─── Bank portal config factory ───────────────────────────────────────────────
export function getBankPortalConfig(tenantId: string, tenantName: string, tenantShort: string): PortalConfig {
  return {
    portalType: 'bank',
    tenantId,
    tenantName,
    tenantShort,
    accentColor: '#22c55e',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
    homeRoute: `/app/bank/${tenantId}/dashboard`,
    allowedRoles: ['Bank RTGS Operator', 'Liquidity Manager', 'Bank Auditor', 'Super Admin'],
    navSections: [
      {
        header: `${tenantShort} Bank Portal`,
        accent: 'emerald',
        items: [
          { path: `/app/bank/${tenantId}/dashboard`,          icon: LayoutDashboard, label: 'My Dashboard' },
          { path: `/app/bank/${tenantId}/incoming`,           icon: ArrowDownLeft,   label: 'Incoming Transactions' },
          { path: `/app/bank/${tenantId}/outgoing`,           icon: ArrowUpRight,    label: 'Outgoing Transactions' },
          { path: `/app/bank/${tenantId}/rtgs-queue`,         icon: ListOrdered,     label: 'RTGS Queue' },
          { path: `/app/bank/${tenantId}/settlement`,         icon: Banknote,        label: 'Settlement Status' },
          { path: `/app/bank/${tenantId}/liquidity`,          icon: Gauge,           label: 'Liquidity Position' },
          { path: `/app/bank/${tenantId}/exceptions`,         icon: AlertTriangle,   label: 'Exceptions' },
          { path: `/app/bank/${tenantId}/treasury-transfers`, icon: Vault,           label: 'Treasury Transfers' },
          { path: `/app/bank/${tenantId}/reconciliation`,     icon: RefreshCw,       label: 'Reconciliation' },
          { path: `/app/bank/${tenantId}/reports`,            icon: BarChart3,       label: 'Reports' },
        ],
      },
    ],
  }
}

// Pre-built configs for each of the 7 banks
export const stanbicConfig   = getBankPortalConfig('stanbic',   'Stanbic Bank Uganda',   'Stanbic')
export const centenaryConfig = getBankPortalConfig('centenary', 'Centenary Bank',         'Centenary')
export const dfcuConfig      = getBankPortalConfig('dfcu',      'DFCU Bank',              'DFCU')
export const equityConfig    = getBankPortalConfig('equity',    'Equity Bank Uganda',     'Equity')
export const absaConfig      = getBankPortalConfig('absa',      'Absa Uganda',            'Absa')
export const hfbConfig       = getBankPortalConfig('hfb',       'Housing Finance Bank',   'HFB')
export const boaConfig       = getBankPortalConfig('boa',       'Bank of Africa Uganda',  'BoA')

export const BANK_CONFIGS: Record<string, PortalConfig> = {
  stanbic: stanbicConfig, centenary: centenaryConfig, dfcu: dfcuConfig,
  equity: equityConfig, absa: absaConfig, hfb: hfbConfig, boa: boaConfig,
}

// All portal entries for the Switch Portal modal
export const ALL_PORTAL_ENTRIES: {
  config: PortalConfig
  label: string
  comingSoon: boolean
}[] = [
  { config: nationalPortalConfig, label: 'National GovPay Command Center', comingSoon: false },
  { config: stanbicConfig,        label: 'Stanbic Bank Portal',            comingSoon: false },
  { config: centenaryConfig,      label: 'Centenary Bank Portal',          comingSoon: false },
  { config: dfcuConfig,           label: 'DFCU Bank Portal',               comingSoon: false },
  { config: equityConfig,         label: 'Equity Bank Portal',             comingSoon: false },
  { config: absaConfig,           label: 'Absa Uganda Portal',             comingSoon: false },
  { config: hfbConfig,            label: 'Housing Finance Portal',         comingSoon: false },
  { config: boaConfig,            label: 'Bank of Africa Portal',          comingSoon: false },
  { config: rtgsPortalConfig,     label: 'RTGS Command Center',            comingSoon: false },
  // Phase 3+ portals — shown as coming soon in the Switch Portal modal
  {
    config: {
      portalType: 'treasury', tenantId: 'treasury', tenantName: 'Ministry of Finance',
      tenantShort: 'MoF', accentColor: '#a855f7', accentLight: '#f3e8ff', accentDark: '#581c87',
      homeRoute: '/app/treasury/dashboard', navSections: [], allowedRoles: [],
    },
    label: 'Treasury Portal',
    comingSoon: true,
  },
  {
    config: {
      portalType: 'agency', tenantId: 'ura', tenantName: 'Uganda Revenue Authority',
      tenantShort: 'URA', accentColor: '#f97316', accentLight: '#ffedd5', accentDark: '#7c2d12',
      homeRoute: '/app/agency/ura/dashboard', navSections: [], allowedRoles: [],
    },
    label: 'Uganda Revenue Authority',
    comingSoon: true,
  },
  {
    config: {
      portalType: 'mobile', tenantId: 'mtn', tenantName: 'MTN Mobile Money',
      tenantShort: 'MTN', accentColor: '#06b6d4', accentLight: '#cffafe', accentDark: '#164e63',
      homeRoute: '/app/mobile/mtn/dashboard', navSections: [], allowedRoles: [],
    },
    label: 'MTN Mobile Money',
    comingSoon: true,
  },
]
