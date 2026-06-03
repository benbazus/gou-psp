// src/data/mockAgencyExceptions.ts
import type { AgencyException } from '../types'

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad2(n: number): string { return String(n).padStart(2, '0') }

function makeTimestamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3_600_000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const EXC_TYPES: AgencyException['type'][] = ['unmatched_prn', 'overpayment', 'duplicate', 'failed_settlement', 'channel_error']

const DESCRIPTIONS: Record<AgencyException['type'], string> = {
  unmatched_prn:    'Payment received with a PRN that does not match any open liability',
  overpayment:      'Payment amount exceeds the outstanding liability for this PRN',
  duplicate:        'Duplicate transaction detected — same PRN already settled',
  failed_settlement: 'Settlement batch failed to post to agency account',
  channel_error:    'Channel gateway returned an error before confirmation',
}

const PAYERS = ['Mutebe Ronald', 'Nakato Grace', 'Ssemakula Ivan', 'Ainembabazi Ruth', 'Okello Dennis']

function generateException(agencyId: string, idx: number): AgencyException {
  const type = rnd(EXC_TYPES)
  return {
    id: `AGEXC-${agencyId.toUpperCase()}-${String(idx).padStart(3, '0')}`,
    agencyId,
    transactionId: `AGT-${agencyId.toUpperCase()}-${String(rndInt(0, 139)).padStart(4, '0')}`,
    type,
    description: DESCRIPTIONS[type],
    amount: rndInt(10_000, 5_000_000),
    payer: rnd(PAYERS),
    createdAt: makeTimestamp(rndInt(1, 72)),
    status: rnd(['open', 'open', 'resolving', 'resolved'] as AgencyException['status'][]),
    priority: rnd(['high', 'medium', 'medium', 'low'] as AgencyException['priority'][]),
  }
}

const AGENCY_IDS = ['ura', 'nira', 'ursb', 'mol', 'upf', 'imm', 'kcca']

export const mockAgencyExceptions: AgencyException[] = AGENCY_IDS.flatMap((aid, agIdx) =>
  Array.from({ length: 5 }, (_, i) => generateException(aid, agIdx * 5 + i))
)
