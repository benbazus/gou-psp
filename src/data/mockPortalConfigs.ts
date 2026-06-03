import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, ListOrdered,
  Banknote, Gauge, AlertTriangle, Vault, RefreshCw,
  BarChart3, Settings, Building2, GitBranch, Users,
  ShieldAlert, MessageSquareWarning, Code2, Activity,
  Landmark, Cpu, ArrowLeftRight, UserCheck, FileBarChart,
  SlidersHorizontal, Clock, Coins, RotateCcw, Droplets,
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

// ─── Treasury Portal config ───────────────────────────────────────────────────
export const treasuryPortalConfig: PortalConfig = {
  portalType: 'treasury',
  tenantId: 'treasury',
  tenantName: 'Ministry of Finance',
  tenantShort: 'MoF',
  accentColor: '#a855f7',
  accentLight: '#f3e8ff',
  accentDark: '#581c87',
  homeRoute: '/app/treasury/dashboard',
  allowedRoles: ['Treasury Officer', 'Treasury Approver', 'Treasury Auditor', 'Super Admin'],
  navSections: [
    {
      header: 'Ministry of Finance',
      accent: 'violet',
      items: [
        { path: '/app/treasury/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/app/treasury/consolidated-fund', icon: Vault,           label: 'Consolidated Fund' },
        { path: '/app/treasury/disbursements',     icon: ArrowUpRight,    label: 'Disbursements' },
        { path: '/app/treasury/approvals',         icon: UserCheck,       label: 'Approval Queue' },
        { path: '/app/treasury/commitments',       icon: BarChart3,       label: 'Commitments' },
        { path: '/app/treasury/accounts',          icon: Building2,       label: 'Treasury Accounts' },
        { path: '/app/treasury/reconciliation',    icon: RefreshCw,       label: 'Reconciliation' },
        { path: '/app/treasury/reports',           icon: FileBarChart,    label: 'Reports' },
      ],
    },
  ],
}

// ─── Agency portal config factory ─────────────────────────────────────────────
export function getAgencyPortalConfig(agencyId: string, agencyName: string, agencyShort: string): PortalConfig {
  return {
    portalType: 'agency',
    tenantId: agencyId,
    tenantName: agencyName,
    tenantShort: agencyShort,
    accentColor: '#f97316',
    accentLight: '#ffedd5',
    accentDark: '#7c2d12',
    homeRoute: `/app/agency/${agencyId}/dashboard`,
    allowedRoles: ['Agency Officer', 'Collections Manager', 'Agency Auditor', 'Super Admin'],
    navSections: [
      {
        header: `${agencyShort} Portal`,
        accent: 'orange',
        items: [
          { path: `/app/agency/${agencyId}/dashboard`,      icon: LayoutDashboard, label: 'Dashboard' },
          { path: `/app/agency/${agencyId}/collections`,    icon: Coins,           label: 'Collections' },
          { path: `/app/agency/${agencyId}/pending`,        icon: Clock,           label: 'Pending Payments' },
          { path: `/app/agency/${agencyId}/settlement`,     icon: Banknote,        label: 'Settlement' },
          { path: `/app/agency/${agencyId}/reconciliation`, icon: RefreshCw,       label: 'Reconciliation' },
          { path: `/app/agency/${agencyId}/reversals`,      icon: RotateCcw,       label: 'Reversals' },
          { path: `/app/agency/${agencyId}/reports`,        icon: BarChart3,       label: 'Reports' },
          { path: `/app/agency/${agencyId}/profile`,        icon: Building2,       label: 'Agency Profile' },
        ],
      },
    ],
  }
}

export const uraConfig   = getAgencyPortalConfig('ura',  'Uganda Revenue Authority',                  'URA')
export const niraConfig  = getAgencyPortalConfig('nira', 'National ID & Registration Authority',      'NIRA')
export const ursbConfig  = getAgencyPortalConfig('ursb', 'Uganda Registration Services Bureau',       'URSB')
export const molConfig   = getAgencyPortalConfig('mol',  'Ministry of Lands',                         'MoL')
export const upfConfig   = getAgencyPortalConfig('upf',  'Uganda Police Force',                       'UPF')
export const immConfig   = getAgencyPortalConfig('imm',  'Directorate of Citizenship & Immigration',  'DCIA')
export const kccaConfig  = getAgencyPortalConfig('kcca', 'Kampala Capital City Authority',            'KCCA')

export const AGENCY_CONFIGS: Record<string, PortalConfig> = {
  ura: uraConfig, nira: niraConfig, ursb: ursbConfig, mol: molConfig,
  upf: upfConfig, imm: immConfig, kcca: kccaConfig,
}

// ─── Mobile portal config factory ─────────────────────────────────────────────
export function getMobilePortalConfig(operatorId: string, operatorName: string, operatorShort: string): PortalConfig {
  return {
    portalType: 'mobile',
    tenantId: operatorId,
    tenantName: operatorName,
    tenantShort: operatorShort,
    accentColor: '#06b6d4',
    accentLight: '#cffafe',
    accentDark: '#164e63',
    homeRoute: `/app/mobile/${operatorId}/dashboard`,
    allowedRoles: ['Mobile Operator', 'Mobile Auditor', 'Super Admin'],
    navSections: [
      {
        header: `${operatorShort} Mobile`,
        accent: 'cyan',
        items: [
          { path: `/app/mobile/${operatorId}/dashboard`,      icon: LayoutDashboard, label: 'Dashboard' },
          { path: `/app/mobile/${operatorId}/transactions`,   icon: ListOrdered,     label: 'Transactions' },
          { path: `/app/mobile/${operatorId}/float`,          icon: Droplets,        label: 'Float Management' },
          { path: `/app/mobile/${operatorId}/settlement`,     icon: Banknote,        label: 'Settlement' },
          { path: `/app/mobile/${operatorId}/exceptions`,     icon: AlertTriangle,   label: 'Exceptions' },
          { path: `/app/mobile/${operatorId}/reconciliation`, icon: RefreshCw,       label: 'Reconciliation' },
          { path: `/app/mobile/${operatorId}/reports`,        icon: BarChart3,       label: 'Reports' },
        ],
      },
    ],
  }
}

export const mtnConfig    = getMobilePortalConfig('mtn',    'MTN Mobile Money', 'MTN')
export const airtelConfig = getMobilePortalConfig('airtel', 'Airtel Money',     'Airtel')

export const MOBILE_CONFIGS: Record<string, PortalConfig> = {
  mtn: mtnConfig, airtel: airtelConfig,
}

// All portal entries for the Switch Portal modal
export const ALL_PORTAL_ENTRIES: {
  config: PortalConfig
  label: string
  comingSoon: boolean
}[] = [
  // National
  { config: nationalPortalConfig, label: 'National GovPay Command Center',     comingSoon: false },
  // Banks
  { config: stanbicConfig,        label: 'Stanbic Bank Portal',                comingSoon: false },
  { config: centenaryConfig,      label: 'Centenary Bank Portal',              comingSoon: false },
  { config: dfcuConfig,           label: 'DFCU Bank Portal',                   comingSoon: false },
  { config: equityConfig,         label: 'Equity Bank Portal',                 comingSoon: false },
  { config: absaConfig,           label: 'Absa Uganda Portal',                 comingSoon: false },
  { config: hfbConfig,            label: 'Housing Finance Portal',             comingSoon: false },
  { config: boaConfig,            label: 'Bank of Africa Portal',              comingSoon: false },
  // RTGS
  { config: rtgsPortalConfig,     label: 'RTGS Command Center',                comingSoon: false },
  // Treasury
  { config: treasuryPortalConfig, label: 'Treasury Portal — MoF',             comingSoon: false },
  // Agencies
  { config: uraConfig,            label: 'Uganda Revenue Authority',           comingSoon: false },
  { config: niraConfig,           label: 'NIRA — National ID & Registration',  comingSoon: false },
  { config: ursbConfig,           label: 'URSB — Business Registration',       comingSoon: false },
  { config: molConfig,            label: 'Ministry of Lands',                  comingSoon: false },
  { config: upfConfig,            label: 'Uganda Police Force',                comingSoon: false },
  { config: immConfig,            label: 'Immigration & Citizenship',          comingSoon: false },
  { config: kccaConfig,           label: 'Kampala Capital City Authority',     comingSoon: false },
  // Mobile Money
  { config: mtnConfig,            label: 'MTN Mobile Money',                   comingSoon: false },
  { config: airtelConfig,         label: 'Airtel Money',                       comingSoon: false },
]
