import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { ParticipantDrawer } from '../../features/participants/ParticipantDrawer'
import { participantsApi } from '../../services/mockApi'
import { formatUGX } from '../../utils/format'
import { Wifi, WifiOff } from 'lucide-react'
import type { Participant } from '../../types'

export default function ParticipantsPage() {
  const [selected, setSelected] = useState<Participant | null>(null)
  const { data = [], isLoading } = useQuery({
    queryKey: ['participants'],
    queryFn: participantsApi.list,
  })

  return (
    <div>
      <PageHeader title="Participant Management" subtitle="Banks, mobile money operators, agencies, and aggregators" />
      <DataTable<Participant & Record<string, unknown>>
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'type', header: 'Type', sortable: true,
            render: (r) => <Badge variant="info">{r.type as string}</Badge> },
          { key: 'status', header: 'Status', sortable: true,
            render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
          { key: 'apiHealth', header: 'API Health',
            render: (r) => (
              <div className="flex items-center gap-1.5">
                {r.apiHealth === 'down'
                  ? <WifiOff size={13} className="text-danger" />
                  : <Wifi size={13} className={r.apiHealth === 'healthy' ? 'text-success' : 'text-warning'} />}
                <Badge variant={statusVariant(r.apiHealth as string)}>{r.apiHealth as string}</Badge>
                {r.apiHealth !== 'down' && (
                  <span className="text-xs text-muted">{r.apiLatency as number}ms</span>
                )}
              </div>
            )},
          { key: 'dailyVolume', header: 'Daily Volume', sortable: true,
            render: (r) => formatUGX(r.dailyVolume as number) },
          { key: 'slaStatus', header: 'SLA',
            render: (r) => <Badge variant={statusVariant(r.slaStatus as string)}>{r.slaStatus as string}</Badge> },
          { key: 'riskRating', header: 'Risk',
            render: (r) => <Badge variant={statusVariant(r.riskRating as string)}>{r.riskRating as string}</Badge> },
        ]}
        data={data as (Participant & Record<string, unknown>)[]}
        keyField="id"
        loading={isLoading}
        onRowClick={(row) => setSelected(row as unknown as Participant)}
      />
      <ParticipantDrawer participant={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
