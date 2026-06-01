import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { mockAlerts } from '../../data/mockCompliance'
import { Badge } from '../../components/ui/Badge'
import type { AlertSeverity } from '../../types'

const SEV_VARIANT: Record<AlertSeverity, 'danger' | 'warning' | 'muted'> = {
  critical: 'danger', high: 'danger', medium: 'warning', low: 'muted',
}

export function AlertStrip() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const active = mockAlerts.filter((a) => a.status !== 'resolved' && !dismissed.includes(a.id)).slice(0, 3)

  if (active.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {active.map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 bg-danger-light border border-danger/20 rounded-lg px-4 py-3">
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant={SEV_VARIANT[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
              <span className="text-xs font-semibold text-danger">{alert.type}</span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 truncate">{alert.description}</p>
          </div>
          <button onClick={() => setDismissed((d) => [...d, alert.id])} className="text-muted hover:text-slate-700 flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
