import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import type { Role } from "../types";
import { fadeInUp, staggerContainer } from "../utils/animations";
import {
  ShieldCheck,
  Landmark,
  Receipt,
  Building2,
  ShieldAlert,
  Banknote,
  Headset,
  Code2,
  Smartphone,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
} from "lucide-react";

const ROLES: { role: Role; icon: React.ElementType; description: string }[] = [
  { role: "Super Admin",             icon: ShieldCheck,  description: "Full system access and configuration" },
  { role: "Bank of Uganda Operator", icon: Landmark,     description: "Central bank oversight and controls" },
  { role: "Treasury Officer",        icon: Receipt,      description: "Settlement and treasury management" },
  { role: "Agency Officer",          icon: Building2,    description: "Government agency collections" },
  { role: "Compliance Officer",      icon: ShieldAlert,  description: "AML, risk, and audit functions" },
  { role: "Settlement Officer",      icon: Banknote,     description: "Batch settlement operations" },
  { role: "Support Officer",         icon: Headset,      description: "Dispute resolution and support" },
  { role: "Developer",               icon: Code2,        description: "API integration and sandbox access" },
  { role: "RTGS Super Admin",                icon: Landmark,     description: "Full RTGS system access and configuration" },
  { role: "Central Bank Settlement Operator", icon: Banknote,    description: "Central bank RTGS settlement operations" },
  { role: "Treasury Settlement Officer",      icon: Receipt,     description: "Treasury and settlement management" },
  { role: "Bank RTGS Operator",               icon: Building2,   description: "Bank-level RTGS transaction operations" },
  { role: "Liquidity Manager",                icon: Smartphone,  description: "Liquidity monitoring and management" },
  { role: "RTGS Auditor",                     icon: ShieldAlert, description: "RTGS audit and compliance functions" },
];

type Step = "role" | "mfa";

export default function LoginPage() {
  const [step, setStep]           = useState<Step>("role");
  const [selected, setSelected]   = useState<Role | null>(null);
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);
  const [shaking, setShaking]     = useState(false);
  const [timeLeft, setTimeLeft]   = useState(300); // 5 min
  const [challenge, setChallenge] = useState<{ code: string; expiresAt: number } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const setRole         = useAppStore((s) => s.setRole);
  const startMfa        = useAppStore((s) => s.startMfaChallenge);
  const verifyMfa       = useAppStore((s) => s.verifyMfa);
  const navigate        = useNavigate();

  // Countdown timer
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

  function handleRoleNext() {
    if (!selected) return;
    setRole(selected);
    const c = startMfa(selected);
    setChallenge(c);
    setTimeLeft(300);
    setStep("mfa");
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }

  function handleOtpChange(idx: number, val: string) {
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
    const ok = verifyMfa(code);
    if (ok) {
      navigate({ to: "/app/dashboard" });
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
    if (!selected) return;
    const c = startMfa(selected);
    setChallenge(c);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setTimeLeft(300);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-light flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="w-full max-w-2xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
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
            <div className="text-left">
              <div className="text-white font-bold text-xl leading-tight">Uganda GovPay Switch</div>
              <div className="text-accent text-sm">National Payment Infrastructure</div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step === "role" ? "text-accent" : "text-white/50"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === "role" ? "bg-accent text-primary border-accent" : "border-white/30 text-white/50 bg-white/10"}`}>
                {step === "mfa" ? <CheckCircle2 size={12} /> : "1"}
              </div>
              Select Role
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step === "mfa" ? "text-accent" : "text-white/30"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === "mfa" ? "bg-accent text-primary border-accent" : "border-white/20 text-white/30"}`}>
                2
              </div>
              Verify Identity
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "role" && (
            <motion.div
              key="role-step"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
            >
              <motion.p variants={fadeInUp} className="text-white/70 text-sm text-center mb-4">
                Select your role to access the platform
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 gap-3 mb-6"
                role="radiogroup"
                aria-label="Select your role"
              >
                {ROLES.map(({ role, icon: Icon, description }) => (
                  <button
                    key={role}
                    role="radio"
                    aria-checked={selected === role}
                    onClick={() => setSelected(role)}
                    className={`
                      text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${selected === role
                        ? "bg-accent border-accent text-primary shadow-lg scale-[1.02]"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                      }
                    `}
                  >
                    <Icon size={20} className="mb-2" />
                    <div className="font-semibold text-sm">{role}</div>
                    <div className={`text-xs mt-0.5 ${selected === role ? "text-primary/70" : "text-white/60"}`}>
                      {description}
                    </div>
                  </button>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <button
                  onClick={handleRoleNext}
                  disabled={!selected}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                    bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                >
                  {selected ? `Continue as ${selected}` : "Select a role to continue"}
                </button>
              </motion.div>
            </motion.div>
          )}

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
                  <div className="text-white/60 text-xs">Verify your identity to proceed</div>
                </div>
                <button onClick={() => { setStep("role"); setOtp(["","","","","",""]); setError(""); }}
                  className="ml-auto text-white/50 hover:text-white transition-colors">
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
                    ref={(el) => { inputRefs.current[idx] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`
                      w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                      bg-white/10 text-white
                      ${error ? "border-red-400" : digit ? "border-accent bg-accent/20" : "border-white/30 focus:border-accent"}
                    `}
                    style={{ height: '3.25rem' }}
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
                Verify & Enter Platform
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
