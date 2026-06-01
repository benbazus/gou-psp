import { motion } from 'framer-motion'
import clsx from 'clsx'

export type NodeState = 'idle' | 'active' | 'completed' | 'failed' | 'skipped'

export interface FlowNode {
  id: string
  label: string
  state: NodeState
}

const STATE_STYLES: Record<NodeState, string> = {
  idle:      'bg-surface border-border text-muted',
  active:    'bg-primary border-primary text-white shadow-lg',
  completed: 'bg-success border-success text-white',
  failed:    'bg-danger border-danger text-white',
  skipped:   'bg-surface border-border text-muted opacity-40',
}

interface Props {
  nodes: FlowNode[]
}

export function FlowDiagram({ nodes }: Props) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center flex-shrink-0">
          <motion.div
            layout
            animate={node.state === 'active' ? {
              scale: [1, 1.06, 1],
              boxShadow: ['0 0 0 0 rgba(27,58,107,0)', '0 0 0 10px rgba(27,58,107,0.2)', '0 0 0 0 rgba(27,58,107,0)'],
            } : { scale: 1 }}
            transition={node.state === 'active' ? { duration: 1.4, repeat: Infinity } : { duration: 0.3 }}
            className={clsx(
              'border-2 rounded-xl px-4 py-3 text-center min-w-[110px] transition-colors duration-300',
              STATE_STYLES[node.state]
            )}
          >
            <div className="text-xs font-bold leading-tight">{node.label}</div>
          </motion.div>
          {i < nodes.length - 1 && (
            <div className={clsx(
              'w-8 h-0.5 flex-shrink-0 transition-colors duration-500',
              nodes[i + 1].state === 'completed' ? 'bg-success' :
              nodes[i + 1].state === 'failed' ? 'bg-danger' :
              nodes[i + 1].state === 'active' ? 'bg-primary' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
