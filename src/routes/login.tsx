import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import type { Role } from "../types";
import { fadeInUp, staggerContainer } from "../utils/animations";
import { ALL_PORTAL_ENTRIES } from "../data/mockPortalConfigs";
import type { PortalConfig } from "../types";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Smartphone,
  Building2,
} from "lucide-react";

// ─── Uganda Flag SVG ─────────────────────────────────────────────────────────
function UgandaFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="8"  fill="#1a1a1a" />
      <rect y="8"  width="48" height="8" fill="#FCDC04" />
      <rect y="16" width="48" height="8" fill="#CE1126" />
      <rect y="24" width="48" height="8" fill="#1a1a1a" />
      <rect y="32" width="48" height="8" fill="#FCDC04" />
      <rect y="40" width="48" height="8" fill="#CE1126" />
      <circle cx="24" cy="24" r="9.5" fill="white" />
      <ellipse cx="24" cy="27" rx="4.2" ry="2.9" fill="#555" />
      <path d="M24.8 24.2 Q26.5 21 24.2 18.8" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="23.8" cy="17.8" r="1.85" fill="#555" />
      <ellipse cx="23.8" cy="16.2" rx="1.45" ry="0.9" fill="#CE1126" />
      <line x1="22.3" y1="15.7" x2="21.2" y2="13.2" stroke="#FCDC04" strokeWidth="1" strokeLinecap="round" />
      <line x1="23.8" y1="15.4" x2="23.8" y2="12.7" stroke="#FCDC04" strokeWidth="1" strokeLinecap="round" />
      <line x1="25.3" y1="15.7" x2="26.4" y2="13.2" stroke="#FCDC04" strokeWidth="1" strokeLinecap="round" />
      <path d="M20.5 26.5 Q19 25 20 23.5" stroke="#666" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <line x1="23" y1="29.5" x2="22.2" y2="32.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="25" y1="29.5" x2="25.8" y2="32.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Institution → Roles mapping ─────────────────────────────────────────────
const INSTITUTION_ROLES: Record<string, { role: Role; description: string }[]> = {
  national: [
    { role: "Super Admin",             description: "Full system access" },
    { role: "Bank of Uganda Operator", description: "Central bank oversight" },
    { role: "Compliance Officer",      description: "AML, risk and audit" },
    { role: "Settlement Officer",      description: "Batch settlement ops" },
    { role: "Support Officer",         description: "Dispute resolution" },
    { role: "Developer",               description: "API integration & sandbox" },
  ],
  stanbic:   [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  centenary: [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  dfcu:      [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  equity:    [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  absa:      [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  hfb:       [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  boa:       [{ role: "Bank RTGS Operator", description: "Settlement & queue management" }, { role: "Liquidity Manager", description: "Liquidity position & injection" }, { role: "Bank Auditor", description: "Read-only reporting access" }],
  rtgs:      [{ role: "RTGS Super Admin", description: "Full RTGS access" }, { role: "Central Bank Settlement Operator", description: "RTGS settlement ops" }, { role: "Liquidity Manager", description: "Liquidity management" }, { role: "RTGS Auditor", description: "Audit & compliance" }],
  treasury:  [{ role: "Treasury Officer", description: "Settlement & treasury" }, { role: "Treasury Approver", description: "Approvals & authorisations" }, { role: "Treasury Auditor", description: "Read-only access" }],
  ura:       [{ role: "Agency Officer", description: "Collections management" }, { role: "Collections Manager", description: "Revenue tracking" }, { role: "Agency Auditor", description: "Read-only access" }],
  mtn:       [{ role: "Mobile Operator", description: "Channel & routing ops" }, { role: "Mobile Auditor", description: "Read-only access" }],
  airtel:    [{ role: "Mobile Operator", description: "Channel & routing ops" }, { role: "Mobile Auditor", description: "Read-only access" }],
};

// ─── Portal type labels & group ordering ─────────────────────────────────────
const PORTAL_TYPE_LABELS: Record<string, string> = {
  national: "National",
  bank:     "Bank",
  rtgs:     "RTGS",
  treasury: "Treasury",
  agency:   "Agency",
  mobile:   "Mobile",
};

const GROUP_ORDER = ["national", "rtgs", "bank", "treasury", "agency", "mobile"];

type Step = "org" | "role" | "mfa";

export default function LoginPage() {
  const [step, setStep]           = useState<Step>("org");
  const [selectedConfig, setSelectedConfig] = useState<PortalConfig | null>(null);
  const [selectedRole, setSelectedRole]     = useState<Role | null>(null);
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);
  const [shaking, setShaking]     = useState(false);
  const [timeLeft, setTimeLeft]   = useState(300);
  const [challenge, setChallenge] = useState<{ code: string; expiresAt: number } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const setRole    = useAppStore((s) => s.setRole);
  const setPortal  = useAppStore((s) => s.setPortal);
  const startMfa   = useAppStore((s) => s.startMfaChallenge);
  const verifyMfa  = useAppStore((s) => s.verifyMfa);
  const navigate   = useNavigate();

  // Filter to non-coming-soon entries
  const availableEntries = ALL_PORTAL_ENTRIES.filter((e) => !e.comingSoon);

  // Group by portalType
  const grouped: Record<string, typeof availableEntries> = {};
  for (const entry of availableEntries) {
    const pt = entry.config.portalType;
    if (!grouped[pt]) grouped[pt] = [];
    grouped[pt].push(entry);
  }
  const groupKeys = GROUP_ORDER.filter((k) => grouped[k]);

  // Countdown timer for MFA step
  useEffect(() => {
    if (step !== "mfa") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Step indicator state helpers
  function stepIndex(): number {
    if (step === "org")  return 0;
    if (step === "role") return 1;
    return 2;
  }

  function handleOrgSelect(config: PortalConfig) {
    setSelectedConfig(config);
    setSelectedRole(null);
    setStep("role");
  }

  function handleRoleNext() {
    if (!selectedRole || !selectedConfig) return;
    setRole(selectedRole);
    const c = startMfa(selectedRole);
    setChallenge(c);
    setTimeLeft(300);
    setStep("mfa");
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }

  function handleOtpChange(idx: number, val: string) {
    if (val.length > 1) {
      handleOtpPaste(idx, val);
      return;
    }
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError("");
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      submitOtp(next.join(""));
    }
  }

  function handleOtpPaste(idx: number, text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 6 - idx).split("");
    if (digits.length === 0) return;
    const next = [...otp];
    digits.forEach((digit, offset) => {
      next[idx + offset] = digit;
    });
    setOtp(next);
    setError("");
    const nextEmpty = next.findIndex((digit) => digit === "");
    if (nextEmpty === -1) {
      submitOtp(next.join(""));
      return;
    }
    inputRefs.current[nextEmpty]?.focus();
  }

  function handleOtpPasteEvent(idx: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    handleOtpPaste(idx, e.clipboardData.getData("text"));
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") {
      const code = otp.join("");
      if (code.length === 6) submitOtp(code);
    }
  }

  function submitOtp(code: string) {
    if (!selectedConfig || !selectedRole) return;
    const ok = verifyMfa(code);
    if (ok) {
      setPortal(selectedConfig.portalType, selectedConfig.tenantId, selectedRole);
      navigate({ to: selectedConfig.homeRoute as "/" });
    } else {
      setShaking(true);
      setError("Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => { setShaking(false); inputRefs.current[0]?.focus(); }, 500);
    }
  }

  function copyCode() {
    if (!challenge) return;
    navigator.clipboard.writeText(challenge.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetChallenge() {
    if (!selectedRole) return;
    const c = startMfa(selectedRole);
    setChallenge(c);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setTimeLeft(300);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const currentStepIdx = stepIndex();

  // Step indicator labels
  const STEPS = ["Organisation", "Role", "Verify"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-light flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UgandaFlag className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0" />
            <div className="text-left">
              <div className="text-white font-bold text-xl leading-tight">Uganda GovPay Switch</div>
              <div className="text-accent text-sm">National Payment Infrastructure</div>
            </div>
          </div>

          {/* Step indicator — 3 steps */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {STEPS.map((label, idx) => {
              const isDone    = currentStepIdx > idx;
              const isActive  = currentStepIdx === idx;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? "text-accent" : isDone ? "text-white/70" : "text-white/30"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      isActive ? "bg-accent text-primary border-accent"
                      : isDone  ? "bg-white/20 text-white border-white/40"
                      : "border-white/20 text-white/30"
                    }`}>
                      {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                    </div>
                    {label}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="w-8 h-px bg-white/20" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Organisation Picker ───────────────────────── */}
          {step === "org" && (
            <motion.div
              key="org-step"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
            >
              <motion.p variants={fadeInUp} className="text-white/70 text-sm text-center mb-5">
                Select your institution to continue
              </motion.p>

              {groupKeys.map((portalType) => (
                <motion.div key={portalType} variants={fadeInUp} className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">
                      {PORTAL_TYPE_LABELS[portalType] ?? portalType}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {grouped[portalType].map(({ config }) => (
                      <button
                        key={config.tenantId}
                        type="button"
                        onClick={() => handleOrgSelect(config)}
                        className="text-left p-4 rounded-xl border-2 border-white/20 bg-white/10
                          hover:bg-white/20 hover:border-white/40 active:scale-[0.98]
                          transition-all duration-200 outline-none
                          focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                          group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                          style={{ backgroundColor: config.accentColor + "33", border: `1px solid ${config.accentColor}55` }}
                        >
                          <Building2 size={16} style={{ color: config.accentColor }} />
                        </div>
                        <div className="text-white font-semibold text-sm leading-snug">{config.tenantName}</div>
                        <div
                          className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                          style={{ backgroundColor: config.accentColor + "33", color: config.accentColor }}
                        >
                          {PORTAL_TYPE_LABELS[config.portalType] ?? config.portalType}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Step 2: Role Picker ───────────────────────────────── */}
          {step === "role" && selectedConfig && (
            <motion.div
              key="role-step"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
            >
              {/* Institution header */}
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => { setStep("org"); setSelectedRole(null); }}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Back to organisation picker"
                >
                  <ArrowLeft size={16} />
                </button>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedConfig.accentColor + "33", border: `1px solid ${selectedConfig.accentColor}55` }}
                >
                  <Building2 size={16} style={{ color: selectedConfig.accentColor }} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{selectedConfig.tenantName}</div>
                  <div className="text-white/50 text-xs">Select your role to continue</div>
                </div>
              </motion.div>

              {/* Role list */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col gap-2 mb-6"
                role="radiogroup"
                aria-label="Select your role"
              >
                {(INSTITUTION_ROLES[selectedConfig.tenantId] ?? []).map(({ role, description }) => (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={selectedRole === role}
                    onClick={() => setSelectedRole(role)}
                    className={`
                      relative text-left px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200
                      focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                      ${selectedRole === role
                        ? "bg-accent border-accent text-primary shadow-lg shadow-accent/30 ring-2 ring-white/80 scale-[1.01]"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 active:scale-[0.99]"
                      }
                    `}
                  >
                    {selectedRole === role && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-accent">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                    <div className="font-semibold text-sm">{role}</div>
                    <div className={`text-xs mt-0.5 ${selectedRole === role ? "text-primary/70" : "text-white/60"}`}>
                      {description}
                    </div>
                  </button>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <button
                  onClick={handleRoleNext}
                  disabled={!selectedRole}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                    bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                >
                  {selectedRole ? `Continue to Verify` : "Select a role to continue"}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Step 3: MFA ───────────────────────────────────────── */}
          {step === "mfa" && (
            <motion.div
              key="mfa-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
                  <Smartphone size={20} className="text-accent" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Multi-Factor Authentication</div>
                  <div className="text-white/60 text-xs">
                    Signing in as <span className="text-accent font-medium">{selectedRole}</span>
                    {selectedConfig && (
                      <span className="text-white/40"> · {selectedConfig.tenantName}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setStep("role"); setOtp(["","","","","",""]); setError(""); }}
                  className="ml-auto text-white/50 hover:text-white transition-colors"
                  aria-label="Back to role picker"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>

              {/* Demo OTP display */}
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={12} className="text-accent" />
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Demo — Your One-Time Code</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-accent tracking-[0.4em]">
                    {challenge?.code ?? "------"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors bg-white/10 rounded-md px-2 py-1"
                    >
                      {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={resetChallenge}
                      className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors bg-white/10 rounded-md px-2 py-1"
                    >
                      <RefreshCw size={12} />
                      New code
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${timeLeft > 60 ? "bg-green-400" : "bg-red-400 animate-pulse"}`} />
                  <span className={`text-xs font-mono ${timeLeft > 60 ? "text-white/50" : "text-red-400"}`}>
                    Expires in {mins}:{secs}
                  </span>
                </div>
              </div>

              {/* OTP digit inputs */}
              <label className="text-white/70 text-xs block mb-2">Enter the 6-digit code</label>
              <motion.div
                className="flex gap-2 justify-center mb-4"
                animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.35 }}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onPaste={(e) => handleOtpPasteEvent(idx, e)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`
                      w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                      bg-white/10 text-white
                      ${error ? "border-red-400" : digit ? "border-accent bg-accent/20" : "border-white/30 focus:border-accent"}
                    `}
                    style={{ height: "3.25rem" }}
                  />
                ))}
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-xs mb-4"
                >
                  <AlertCircle size={13} /> {error}
                </motion.div>
              )}

              {timeLeft === 0 && (
                <div className="text-red-400 text-xs text-center mb-4">
                  Code expired.{" "}
                  <button onClick={resetChallenge} className="underline">Generate a new one</button>
                </div>
              )}

              <button
                onClick={() => submitOtp(otp.join(""))}
                disabled={otp.join("").length < 6 || timeLeft === 0}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                  bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl"
              >
                Verify &amp; Enter Platform
              </button>

              <p className="text-center text-white/40 text-xs mt-3">
                Secured with TOTP · Session encrypted with TLS 1.3 / AES-256-GCM
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        <motion.p variants={fadeInUp} className="text-center text-white/40 text-xs mt-4">
          Demo environment — no real payment data · Uganda GovPay Switch v2.0
        </motion.p>
      </motion.div>
    </div>
  );
}
