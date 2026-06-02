import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Loader2, SkipForward, Wrench } from 'lucide-react'
import type { SimulatorNodeState } from '../../../types/rtgs'
import clsx from 'clsx'

interface Props {
  label: string
  description: string
  state: SimulatorNodeState
  isLast?: boolean
}

const STATE_RING: Record<SimulatorNodeState, string> = {
  idle:       'border-slate-600 bg-slate-800 text-slate-400',
  active:     'border-amber-400 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/30',
  completed:  'border-green-500 bg-green-500/20 text-green-300 shadow-sm shadow-green-500/20',
  failed:     'border-red-500 bg-red-500/20 text-red-300 shadow-sm shadow-red-500/20',
  skipped:    'border-slate-700 bg-slate-800/50 text-slate-600 opacity-40',
  waiting:    'border-blue-400 bg-blue-500/20 text-blue-300 shadow-md shadow-blue-500/20',
  overridden: 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-sm shadow-purple-500/20',
}

const STATE_ICON: Record<SimulatorNodeState, React.ReactNode> = {
  idle:       <div className="w-2 h-2 rounded-full bg-slate-600" />,
  active:     <Loader2 size={14} className="animate-spin text-amber-400" />,
  completed:  <CheckCircle2 size={14} className="text-green-400" />,
  failed:     <XCircle size={14} className="text-red-400" />,
  skipped:    <SkipForward size={14} className="text-slate-600" />,
  waiting:    <Clock size={14} className="text-blue-400 animate-pulse" />,
  overridden: <Wrench size={14} className="text-purple-400" />,
}

const STATE_LABEL: Record<SimulatorNodeState, string> = {
  idle:       'text-slate-500',
  active:     'text-amber-300 font-bold',
  completed:  'text-green-400 font-semibold',
  failed:     'text-red-400 font-semibold',
  skipped:    'text-slate-600',
  waiting:    'text-blue-400 font-semibold',
  overridden: 'text-purple-400 font-semibold',
}

export function RTGSFlowNode({ label, description, state, isLast = false }: Props) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          className={clsx('w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300', STATE_RING[state])}
          animate={state === 'active' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ repeat: state === 'active' ? Infinity : 0, duration: 1.2 }}
        >
          {STATE_ICON[state]}
        </motion.div>
        {!isLast && <div className="w-0.5 h-8 bg-slate-700 mt-1" />}
      </div>
      <div className="pt-1.5 pb-6 min-w-0 flex-1">
        <p className={clsx('text-sm transition-colors duration-300', STATE_LABEL[state])}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}
