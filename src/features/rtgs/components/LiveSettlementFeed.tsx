import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Zap, ArrowRight, AlertTriangle } from 'lucide-react'
import { formatUGX } from '../../../utils/format'
import type { RTGSLiveEvent, RTGSEventType } from '../../../types/rtgs'
import { mockLiveEvents } from '../../../data/mockRtgs'
import clsx from 'clsx'

const EVENT_ICON: Record<RTGSEventType, React.ReactNode> = {
  settled:            <CheckCircle2 size={13} className="text-green-400" />,
  failed:             <XCircle size={13} className="text-red-400" />,
  queued:             <Clock size={13} className="text-amber-400" />,
  authorized:         <Zap size={13} className="text-blue-400" />,
  liquidity_injected: <ArrowRight size={13} className="text-purple-400" />,
  exception_raised:   <AlertTriangle size={13} className="text-orange-400" />,
  reversed:           <XCircle size={13} className="text-purple-400" />,
}

const EVENT_BORDER: Record<RTGSEventType, string> = {
  settled:            'border-l-green-500',
  failed:             'border-l-red-500',
  queued:             'border-l-amber-500',
  authorized:         'border-l-blue-500',
  liquidity_injected: 'border-l-purple-500',
  exception_raised:   'border-l-orange-500',
  reversed:           'border-l-purple-500',
}

const BANKS = ['Stanbic Bank', 'Centenary Bank', 'DFCU Bank', 'Equity Bank', 'Absa Bank']
const LIVE_EVENT_TYPES: RTGSEventType[] = ['settled', 'queued', 'authorized', 'settled', 'settled']

function generateEvent(): RTGSLiveEvent {
  const type = LIVE_EVENT_TYPES[Math.floor(Math.random() * LIVE_EVENT_TYPES.length)]
  const refNum = Math.floor(Math.random() * 500 + 1)
  return {
    id: crypto.randomUUID(),
    type,
    rtgsRef: `RTGS/2026/06/02/${String(refNum).padStart(3, '0')}`,
    amount: Math.floor(Math.random() * 3_000_000_000 + 200_000_000),
    senderBank: BANKS[Math.floor(Math.random() * BANKS.length)],
    receiverBank: BANKS[Math.floor(Math.random() * BANKS.length)],
    timestamp: new Date().toISOString(),
    detail: type === 'settled' ? 'Settlement executed. Final.' : type === 'queued' ? 'Queued in settlement window.' : 'Authorized by CBU operator.',
  }
}

export function LiveSettlementFeed() {
  const [events, setEvents] = useState<RTGSLiveEvent[]>([...mockLiveEvents].slice(0, 6))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setEvents((prev) => [generateEvent(), ...prev].slice(0, 12))
    }, 3500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="space-y-1.5 overflow-hidden">
      <AnimatePresence initial={false}>
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: 20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx('bg-slate-800/60 border border-slate-700 border-l-2 rounded-lg px-3 py-2', EVENT_BORDER[ev.type])}
          >
            <div className="flex items-center gap-2">
              {EVENT_ICON[ev.type]}
              <span className="text-[10px] font-mono text-slate-400">{ev.rtgsRef}</span>
              <span className="text-xs font-bold text-white ml-auto">{formatUGX(ev.amount)}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
              <span className="truncate max-w-[100px]">{ev.senderBank}</span>
              <ArrowRight size={9} />
              <span className="truncate max-w-[100px]">{ev.receiverBank}</span>
              <span className="ml-auto flex-shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
