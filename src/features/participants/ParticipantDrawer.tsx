import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { LineChart } from '../../components/charts/LineChart'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { participantsApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatNumber } from '../../utils/format'
import { ShieldOff, ShieldCheck, Key } from 'lucide-react'
import type { Participant } from '../../types'

interface Props {
  participant: Participant | null
  onClose: () => void
}

export function ParticipantDrawer({ participant, onClose }: Props) {
  const addToast = useAppStore((s) => s.addToast)
  const qc = useQueryClient()
  const [apiKeyModal, setApiKeyModal] = useState(false)

  const { mutate: suspend } = useMutation({
    mutationFn: (id: string) => participantsApi.suspend(id),
    onSuccess: () => {
      addToast(`${participant?.name} suspended`, 'warning')
      qc.invalidateQueries({ queryKey: ['participants'] })
      onClose()
    },
  })

  const { mutate: activate } = useMutation({
    mutationFn: (id: string) => participantsApi.activate(id),
    onSuccess: () => {
      addToast(`${participant?.name} activated`, 'success')
      qc.invalidateQueries({ queryKey: ['participants'] })
      onClose()
    },
  })

  if (!participant) return null

  const healthData = participant.apiHealthHistory.map((v, i) => ({
    day: `D-${6 - i}`,
    latency: v,
  }))

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={participant.name}
        subtitle={`${participant.type} · ${participant.id}`}
      >
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap">
            <Badge variant={statusVariant(participant.status)}>{participant.status}</Badge>
            <Badge variant={statusVariant(participant.apiHealth)}>API: {participant.apiHealth}</Badge>
            <Badge variant={statusVariant(participant.riskRating)}>Risk: {participant.riskRating}</Badge>
            <Badge variant={statusVariant(participant.slaStatus)}>SLA: {participant.slaStatus}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">Daily Volume</div>
              <div className="text-sm font-bold text-primary">{formatUGX(participant.dailyVolume)}</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">Daily Count</div>
              <div className="text-sm font-bold text-primary">{formatNumber(participant.dailyCount)}</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">API Latency</div>
              <div className="text-sm font-bold">{participant.apiLatency}ms</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-muted">Settlement Account</div>
              <div className="text-xs font-mono mt-0.5 break-all">{participant.settlementAccount}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">API Latency — Last 7 Days (ms)</div>
            <LineChart
              data={healthData}
              xKey="day"
              lines={[{ key: 'latency', color: '#1B3A6B', name: 'Latency (ms)' }]}
              height={140}
            />
          </div>

          <div className="flex flex-col gap-2">
            {participant.status === 'active'
              ? (
                <button onClick={() => suspend(participant.id)}
                  className="flex items-center gap-2 w-full py-2.5 border border-danger text-danger rounded-lg text-sm font-medium hover:bg-danger-light transition-colors justify-center">
                  <ShieldOff size={14} /> Suspend Participant
                </button>
              )
              : (
                <button onClick={() => activate(participant.id)}
                  className="flex items-center gap-2 w-full py-2.5 bg-success text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors justify-center">
                  <ShieldCheck size={14} /> Activate Participant
                </button>
              )}
            <button onClick={() => setApiKeyModal(true)}
              className="flex items-center gap-2 w-full py-2.5 border border-border text-slate-700 rounded-lg text-sm font-medium hover:bg-surface transition-colors justify-center">
              <Key size={14} /> View API Keys
            </button>
          </div>
        </div>
      </Drawer>

      <Modal
        open={apiKeyModal}
        onClose={() => setApiKeyModal(false)}
        title="API Key Management"
        footer={
          <button
            onClick={() => { setApiKeyModal(false); addToast('New API key generated', 'success') }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
            Regenerate Key
          </button>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-xs text-muted mb-1">Live API Key</div>
            <div className="font-mono bg-surface border border-border rounded px-3 py-2 text-xs">
              {`gps_live_${'*'.repeat(32)}${participant.id.slice(0, 4)}`}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Sandbox API Key</div>
            <div className="font-mono bg-surface border border-border rounded px-3 py-2 text-xs">
              {`gps_test_${'*'.repeat(32)}${participant.id.slice(0, 4)}`}
            </div>
          </div>
          <p className="text-xs text-muted">Regenerating invalidates the current key immediately.</p>
        </div>
      </Modal>
    </>
  )
}
