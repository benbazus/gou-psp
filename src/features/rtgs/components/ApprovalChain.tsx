import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { ApprovalChainEntry } from '../../../types/rtgs'

interface Props {
  steps: ApprovalChainEntry[]
}

const STEP_ICON = {
  approved: <CheckCircle2 size={15} className="text-green-400" />,
  rejected: <XCircle size={15} className="text-red-400" />,
  pending:  <Clock size={15} className="text-amber-400 animate-pulse" />,
}

export function ApprovalChain({ steps }: Props) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-shrink-0">{STEP_ICON[step.status]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{step.role}</p>
            <p className="text-[11px] text-slate-500 truncate">{step.actor}</p>
          </div>
          {step.timestamp && (
            <span className="text-[10px] text-slate-500 flex-shrink-0">
              {new Date(step.timestamp).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {step.status === 'pending' && (
            <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded px-1.5 py-0.5 flex-shrink-0">
              Awaiting
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
