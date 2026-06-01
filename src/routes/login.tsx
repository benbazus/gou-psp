import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import type { Role } from '../types'
import { fadeInUp, staggerContainer } from '../utils/animations'
import {
  ShieldCheck, Landmark, Receipt, Building2,
  ShieldAlert, Banknote, Headset, Code2,
} from 'lucide-react'

const ROLES: { role: Role; icon: React.ElementType; description: string }[] = [
  { role: 'Super Admin',              icon: ShieldCheck,  description: 'Full system access and configuration' },
  { role: 'Bank of Uganda Operator',  icon: Landmark,     description: 'Central bank oversight and controls' },
  { role: 'Treasury Officer',         icon: Receipt,      description: 'Settlement and treasury management' },
  { role: 'Agency Officer',           icon: Building2,    description: 'Government agency collections' },
  { role: 'Compliance Officer',       icon: ShieldAlert,  description: 'AML, risk, and audit functions' },
  { role: 'Settlement Officer',       icon: Banknote,     description: 'Batch settlement operations' },
  { role: 'Support Officer',          icon: Headset,      description: 'Dispute resolution and support' },
  { role: 'Developer',                icon: Code2,        description: 'API integration and sandbox access' },
]

export default function LoginPage() {
  const [selected, setSelected] = useState<Role | null>(null)
  const setRole = useAppStore((s) => s.setRole)
  const navigate = useNavigate()

  function handleEnter() {
    if (!selected) return
    setRole(selected)
    navigate({ to: '/app/dashboard' })
  }

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
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
              <Landmark size={24} className="text-primary" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-xl leading-tight">Uganda GovPay Switch</div>
              <div className="text-accent text-sm">National Payment Infrastructure</div>
            </div>
          </div>
          <p className="text-white/70 text-sm">Select your role to access the platform</p>
        </motion.div>

        {/* Role grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ role, icon: Icon, description }) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={`
                text-left p-4 rounded-xl border-2 transition-all duration-200
                ${selected === role
                  ? 'bg-accent border-accent text-primary shadow-lg scale-[1.02]'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'}
              `}
            >
              <Icon size={20} className="mb-2" />
              <div className="font-semibold text-sm">{role}</div>
              <div className={`text-xs mt-0.5 ${selected === role ? 'text-primary/70' : 'text-white/60'}`}>
                {description}
              </div>
            </button>
          ))}
        </motion.div>

        {/* Enter button */}
        <motion.div variants={fadeInUp}>
          <button
            onClick={handleEnter}
            disabled={!selected}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
              bg-accent text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
          >
            {selected ? `Enter as ${selected}` : 'Select a role to continue'}
          </button>
        </motion.div>

        <motion.p variants={fadeInUp} className="text-center text-white/40 text-xs mt-4">
          Demo environment — no real payment data
        </motion.p>
      </motion.div>
    </div>
  )
}
