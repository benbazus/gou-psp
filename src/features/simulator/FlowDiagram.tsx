import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import {
  User, Globe, Zap, ShieldCheck, GitBranch,
  Smartphone, CheckCircle2, Building2, Landmark, BarChart3,
  RefreshCw,
} from 'lucide-react'

export type NodeState = 'idle' | 'active' | 'completed' | 'failed' | 'skipped' | 'retrying' | 'reversing'

export interface FlowNode {
  id: string
  label: string
  description: string
  state: NodeState
}

// ─── Per-node icons ───────────────────────────────────────────────────────────
const NODE_ICONS: Record<string, LucideIcon> = {
  citizen:    User,
  portal:     Globe,
  switch:     Zap,
  validation: ShieldCheck,
  routing:    GitBranch,
  channel:    Smartphone,
  confirm:    CheckCircle2,
  agency:     Building2,
  treasury:   Landmark,
  settlement: BarChart3,
}

// ─── State styling ────────────────────────────────────────────────────────────
const NODE_RING: Record<NodeState, string> = {
  idle:      'border-border bg-surface text-muted',
  active:    'border-primary bg-primary text-white shadow-xl shadow-primary/30',
  completed: 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200',
  failed:    'border-danger bg-danger text-white shadow-md shadow-red-200',
  skipped:   'border-border bg-surface text-muted opacity-30',
  retrying:  'border-orange-400 bg-orange-400 text-white shadow-md shadow-orange-200',
  reversing: 'border-purple-500 bg-purple-500 text-white shadow-md shadow-purple-200',
}

const NODE_LABEL: Record<NodeState, string> = {
  idle:      'text-muted',
  active:    'text-primary font-bold',
  completed: 'text-green-700 font-semibold',
  failed:    'text-danger font-semibold',
  skipped:   'text-muted opacity-40',
  retrying:  'text-orange-600 font-bold',
  reversing: 'text-purple-700 font-semibold',
}

const NODE_DESC: Record<NodeState, string> = {
  idle:      'text-muted',
  active:    'text-primary/80',
  completed: 'text-green-600',
  failed:    'text-danger/80',
  skipped:   'text-muted opacity-40',
  retrying:  'text-orange-500',
  reversing: 'text-purple-500',
}

const CONNECTOR_COLOR: Record<NodeState, string> = {
  idle:      'bg-border',
  active:    'bg-primary',
  completed: 'bg-green-500',
  failed:    'bg-danger',
  skipped:   'bg-border',
  retrying:  'bg-orange-400',
  reversing: 'bg-purple-400',
}

interface Props {
  nodes: FlowNode[]
}

export function FlowDiagram({ nodes }: Props) {
  return (
    <div className="flex flex-col items-center w-full">
      {nodes.map((node, i) => {
        const Icon       = NODE_ICONS[node.id] ?? Zap
        const isActive   = node.state === 'active' || node.state === 'retrying'
        const nextNode   = nodes[i + 1]
        const connectorState = nextNode?.state ?? 'idle'

        return (
          <div key={node.id} className="flex flex-col items-center w-full max-w-sm">
            {/* ── Node card ── */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: node.state === 'skipped' ? 0.35 : 1,
                scale:   1,
              }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <motion.div
                animate={isActive ? {
                  boxShadow: [
                    '0 0 0 0 rgba(27,58,107,0)',
                    '0 0 0 8px rgba(27,58,107,0.18)',
                    '0 0 0 0 rgba(27,58,107,0)',
                  ],
                } : {}}
                transition={isActive ? { duration: 1.4, repeat: Infinity } : {}}
                className={clsx(
                  'flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-2 transition-all duration-300',
                  NODE_RING[node.state],
                )}
              >
                {/* Icon circle */}
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  node.state === 'idle' || node.state === 'skipped'
                    ? 'bg-border/60'
                    : 'bg-white/20',
                )}>
                  {node.state === 'retrying'
                    ? <RefreshCw size={18} className="animate-spin" />
                    : <Icon size={18} />
                  }
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <div className={clsx('text-sm leading-tight transition-colors duration-300', NODE_LABEL[node.state])}>
                    {node.label}
                  </div>
                  <div className={clsx('text-xs mt-0.5 leading-snug transition-colors duration-300', NODE_DESC[node.state])}>
                    {node.description}
                  </div>
                </div>

                {/* Step number */}
                <div className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0',
                  node.state === 'idle' || node.state === 'skipped'
                    ? 'bg-border text-muted'
                    : 'bg-white/25 text-white',
                )}>
                  {i + 1}
                </div>
              </motion.div>
            </motion.div>

            {/* ── Animated connector ── */}
            {i < nodes.length - 1 && (
              <div className="relative w-0.5 h-8 bg-border/60 my-0.5 rounded-full overflow-hidden">
                <AnimatePresence>
                  {(connectorState !== 'idle' && connectorState !== 'skipped') && (
                    <motion.div
                      key={`conn-${i}-${connectorState}`}
                      className={clsx('absolute inset-x-0 top-0 rounded-full', CONNECTOR_COLOR[connectorState])}
                      initial={{ height: '0%', opacity: 0 }}
                      animate={{ height: '100%', opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  )}
                </AnimatePresence>

                {/* Travelling pulse dot when active */}
                <AnimatePresence>
                  {connectorState === 'active' && (
                    <motion.div
                      key={`pulse-${i}`}
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
                      initial={{ top: '-4px', opacity: 0 }}
                      animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 0.55, ease: 'easeIn', repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
