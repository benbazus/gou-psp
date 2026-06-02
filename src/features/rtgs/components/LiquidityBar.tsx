import { motion } from 'framer-motion'
import clsx from 'clsx'

interface Props {
  pct: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  height?: number
  showLabel?: boolean
}

const RISK_COLOR: Record<string, string> = {
  low:      'bg-green-500',
  medium:   'bg-amber-400',
  high:     'bg-orange-500',
  critical: 'bg-red-500',
}

export function LiquidityBar({ pct, riskLevel, height = 8, showLabel = false }: Props) {
  const clampedPct = Math.min(100, Math.max(0, pct))
  return (
    <div className="w-full">
      <div className="w-full bg-slate-700 rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          className={clsx('h-full rounded-full', RISK_COLOR[riskLevel])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedPct}%` }}
          transition={{ type: 'spring', damping: 30, stiffness: 150, delay: 0.1 }}
        />
      </div>
      {showLabel && (
        <p className={clsx('text-xs mt-1 font-semibold', {
          'text-green-400':  riskLevel === 'low',
          'text-amber-400':  riskLevel === 'medium',
          'text-orange-400': riskLevel === 'high',
          'text-red-400':    riskLevel === 'critical',
        })}>
          {clampedPct.toFixed(1)}%
        </p>
      )}
    </div>
  )
}
