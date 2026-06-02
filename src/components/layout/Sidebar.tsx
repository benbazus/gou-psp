import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  LayoutDashboard, Zap, Building2, GitBranch, Users, Banknote, RefreshCw,
  ShieldAlert, MessageSquareWarning, Code2, Activity, BarChart3, Settings,
  ChevronLeft, ChevronRight, Network, Lock, LogOut,
  Landmark, Cpu, ListOrdered, Gauge, ArrowLeftRight, Vault, UserCheck,
  AlertTriangle, FileBarChart, SlidersHorizontal,
} from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { ROUTE_ROLES } from "../../router";
import type { Role, NavSection, NavItem } from "../../types";
import clsx from "clsx";

function UgandaFlag({ className }: { className?: string }) {
  const s = 28 / 6;
  return (
    <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="28" height={s} fill="#1a1a1a" />
      <rect y={s} width="28" height={s} fill="#FCDC04" />
      <rect y={s * 2} width="28" height={s} fill="#CE1126" />
      <rect y={s * 3} width="28" height={s} fill="#1a1a1a" />
      <rect y={s * 4} width="28" height={s} fill="#FCDC04" />
      <rect y={s * 5} width="28" height={s} fill="#CE1126" />
      <circle cx="14" cy="14" r="5.6" fill="white" />
      <ellipse cx="14" cy="15.8" rx="2.5" ry="1.7" fill="#555" />
      <path d="M14.4 14.1 Q15.6 12.2 14 10.9" stroke="#555" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="13.8" cy="10.3" r="1.05" fill="#555" />
      <ellipse cx="13.8" cy="9.45" rx="0.85" ry="0.55" fill="#CE1126" />
      <line x1="13.0" y1="9.1" x2="12.3" y2="7.6" stroke="#FCDC04" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="13.8" y1="8.9" x2="13.8" y2="7.3" stroke="#FCDC04" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="14.6" y1="9.1" x2="15.3" y2="7.6" stroke="#FCDC04" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="13.4" y1="17.3" x2="12.9" y2="19.0" stroke="#555" strokeWidth="0.75" strokeLinecap="round" />
      <line x1="14.6" y1="17.3" x2="15.1" y2="19.0" stroke="#555" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

const NAV_SECTIONS: NavSection[] = [
  {
    header: "GovPay Platform",
    items: [
      { path: "/app/dashboard",      icon: LayoutDashboard,      label: "Dashboard" },
      { path: "/app/simulator",      icon: Zap,                  label: "Payment Simulator" },
      { path: "/app/collections",    icon: Building2,            label: "Collections" },
      { path: "/app/routing",        icon: GitBranch,            label: "Routing" },
      { path: "/app/participants",   icon: Users,                label: "Participants" },
      { path: "/app/settlement",     icon: Banknote,             label: "Settlement" },
      { path: "/app/reconciliation", icon: RefreshCw,            label: "Reconciliation" },
      { path: "/app/compliance",     icon: ShieldAlert,          label: "Compliance" },
      { path: "/app/disputes",       icon: MessageSquareWarning, label: "Disputes" },
      { path: "/app/api-platform",   icon: Code2,                label: "API Platform" },
      { path: "/app/operations",     icon: Activity,             label: "Operations Center" },
      { path: "/app/reports",        icon: BarChart3,            label: "Reports" },
      { path: "/app/admin",          icon: Settings,             label: "Admin Settings" },
      { path: "/app/architecture",   icon: Network,              label: "Architecture" },
    ],
  },
  {
    header: "RTGS Command Center",
    accent: "amber",
    items: [
      { path: "/app/rtgs",              icon: Landmark,          label: "RTGS Dashboard" },
      { path: "/app/rtgs/simulator",    icon: Cpu,               label: "RTGS Simulator" },
      { path: "/app/rtgs/queue",        icon: ListOrdered,       label: "Settlement Queue" },
      { path: "/app/rtgs/liquidity",    icon: Gauge,             label: "Liquidity Monitor" },
      { path: "/app/rtgs/interbank",    icon: ArrowLeftRight,    label: "Interbank Transfers" },
      { path: "/app/rtgs/treasury",     icon: Vault,             label: "Treasury Transfers" },
      { path: "/app/rtgs/participants", icon: UserCheck,         label: "RTGS Participants" },
      { path: "/app/rtgs/exceptions",   icon: AlertTriangle,     label: "RTGS Exceptions" },
      { path: "/app/rtgs/reports",      icon: FileBarChart,      label: "RTGS Reports" },
      { path: "/app/rtgs/admin",        icon: SlidersHorizontal, label: "RTGS Admin" },
    ],
  },
];

interface SidebarProps {
  navSections?: NavSection[]
  portalType?: string
  tenantName?: string
}

export function Sidebar({ navSections: navSectionsProp, tenantName }: SidebarProps = {}) {
  const navSections = navSectionsProp ?? NAV_SECTIONS
  const collapsed     = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const activeRole    = useAppStore((s) => s.activeRole);
  const logout        = useAppStore((s) => s.logout);
  const pathname      = useRouterState({ select: (s) => s.location.pathname });

  function isAllowed(path: string): boolean {
    if (!activeRole) return false;
    const normPath = path.replace(/\/app\/bank\/[^/]+/, '/app/bank/:bankId')
    return (ROUTE_ROLES[normPath] ?? []).includes(activeRole as Role);
  }

  function renderNavItem(item: NavItem) {
    const { path, icon: Icon, label } = item;
    const isExactRtgsDashboard = path === "/app/rtgs";
    const active = isExactRtgsDashboard
      ? pathname === "/app/rtgs"
      : pathname === path || pathname.startsWith(path + "/");
    const allowed = isAllowed(path);

    const linkEl = (
      <Link
        key={path}
        to={path}
        className={clsx(
          "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-md text-sm transition-colors relative group",
          active && allowed
            ? "bg-primary-light text-white"
            : allowed
            ? "text-white/70 hover:text-white hover:bg-primary-light/50"
            : "text-white/30 hover:bg-primary-light/20 cursor-pointer",
        )}
      >
        {active && allowed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
        )}
        <Icon size={17} className="flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate whitespace-nowrap overflow-hidden font-medium flex-1"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {!allowed && !collapsed && (
          <Lock size={11} className="text-white/25 flex-shrink-0 ml-auto" />
        )}
      </Link>
    );

    const normPath = path.replace(/\/app\/bank\/[^/]+/, '/app/bank/:bankId')
    const tooltipContent = allowed
      ? label
      : `${label} — requires ${(ROUTE_ROLES[normPath] ?? []).slice(0, 2).join(", ")}`;

    if (collapsed) {
      return (
        <Tooltip.Root key={path}>
          <Tooltip.Trigger asChild>{linkEl}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className={clsx(
                "text-xs px-2.5 py-1.5 rounded-md shadow-lg ml-1",
                allowed ? "bg-slate-900 text-white" : "bg-slate-900 text-white/60",
              )}
            >
              {tooltipContent}
              <Tooltip.Arrow className="fill-slate-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      );
    }
    return linkEl;
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <motion.aside
        className="fixed left-0 top-0 h-screen bg-primary flex flex-col z-40 overflow-hidden"
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-primary-light/30">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div key="logo-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center gap-2 min-w-0">
                <UgandaFlag className="w-7 h-7 flex-shrink-0 rounded-md overflow-hidden" />
                <div className="min-w-0">
                  <div className="text-white font-bold text-xs leading-tight truncate">{tenantName ?? 'Uganda GovPay'}</div>
                  <div className="text-accent text-[10px] truncate">National Payment Infrastructure</div>
                </div>
              </motion.div>
            )}
            {collapsed && (
              <motion.div key="logo-icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
                <UgandaFlag className="w-7 h-7 rounded-md overflow-hidden" />
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={toggleSidebar} className="text-white/60 hover:text-white transition-colors flex-shrink-0 ml-1">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sections */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          {navSections.map((section, sIdx) => (
            <div key={section.header}>
              {sIdx > 0 && <div className="mx-3 my-2 border-t border-white/10" />}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={clsx(
                      "px-5 pt-1 pb-1.5 text-[9px] font-bold uppercase tracking-widest",
                      section.accent === "amber" ? "text-amber-400" : "text-white/35",
                    )}
                  >
                    {section.header}
                  </motion.div>
                )}
              </AnimatePresence>
              {section.items.map(renderNavItem)}
            </div>
          ))}
        </nav>

        {/* Role badge + logout */}
        <div className="border-t border-primary-light/30 px-3 py-3 space-y-2">
          <div className={clsx("flex items-center gap-2", collapsed && "justify-center")}>
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold">{activeRole ? activeRole[0] : "G"}</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
                  <div className="text-white text-xs font-medium truncate">{activeRole ?? "Guest"}</div>
                  <div className="text-white/50 text-[10px]">GovPay Switch</div>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={logout} className="text-white/40 hover:text-red-400 transition-colors flex-shrink-0" aria-label="Logout">
                    <LogOut size={14} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="top" className="bg-slate-900 text-white text-xs px-2 py-1 rounded-md">
                    Sign out <Tooltip.Arrow className="fill-slate-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </div>
          {collapsed && (
            <button onClick={logout} className="w-full flex justify-center text-white/40 hover:text-red-400 transition-colors" aria-label="Logout">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </motion.aside>
    </Tooltip.Provider>
  );
}
