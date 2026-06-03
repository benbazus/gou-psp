// src/data/mockAgencyTransactions.ts
import type { AgencyTransaction, Channel } from '../types'

const CHANNELS: Channel[] = ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'USSD', 'Visa/Mastercard']
const PAYERS = [
  'Mutebe Ronald', 'Nakato Grace', 'Ssemakula Ivan', 'Ainembabazi Ruth', 'Okello Dennis',
  'Nalwanga Joyce', 'Byamugisha Peter', 'Atim Sylvia', 'Mugisha David', 'Namukasa Fatuma',
  'Sekandi John', 'Akello Mary', 'Nsubuga Alex', 'Tibenderana Hope', 'Kakande Samuel',
]

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad2(n: number): string { return String(n).padStart(2, '0') }

function makeTimestamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3_600_000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const AGENCY_SERVICES: Record<string, { id: string; name: string; minAmt: number; maxAmt: number }[]> = {
  ura:  [
    { id: 'ura-tax',     name: 'Income Tax',   minAmt: 200_000,   maxAmt: 50_000_000  },
    { id: 'ura-vat',     name: 'VAT Payment',  minAmt: 500_000,   maxAmt: 80_000_000  },
    { id: 'ura-customs', name: 'Customs Duty', minAmt: 1_000_000, maxAmt: 200_000_000 },
    { id: 'ura-paye',    name: 'PAYE',         minAmt: 100_000,   maxAmt: 20_000_000  },
  ],
  nira: [
    { id: 'nira-nid',      name: 'National ID',      minAmt: 5_000,   maxAmt: 5_000   },
    { id: 'nira-passport', name: 'Passport',          minAmt: 250_000, maxAmt: 250_000 },
    { id: 'nira-birth',    name: 'Birth Certificate', minAmt: 20_000,  maxAmt: 20_000  },
  ],
  ursb: [
    { id: 'ursb-bizreg',   name: 'Business Registration', minAmt: 100_000, maxAmt: 500_000  },
    { id: 'ursb-trademark', name: 'Trademark',             minAmt: 400_000, maxAmt: 800_000  },
  ],
  mol:  [
    { id: 'mol-landsearch', name: 'Land Search',   minAmt: 50_000,  maxAmt: 50_000   },
    { id: 'mol-transfer',   name: 'Land Transfer', minAmt: 200_000, maxAmt: 2_000_000 },
    { id: 'mol-lease',      name: 'Lease Extension', minAmt: 150_000, maxAmt: 1_500_000 },
  ],
  upf:  [
    { id: 'upf-fine',      name: 'Court Fine',       minAmt: 10_000, maxAmt: 500_000  },
    { id: 'upf-clearance', name: 'Police Clearance', minAmt: 80_000, maxAmt: 80_000   },
  ],
  imm:  [
    { id: 'imm-visa',   name: 'Visa Application', minAmt: 120_000, maxAmt: 400_000   },
    { id: 'imm-permit', name: 'Work Permit',       minAmt: 820_000, maxAmt: 2_000_000 },
  ],
  kcca: [
    { id: 'kcca-permit',  name: 'Business Permit', minAmt: 200_000, maxAmt: 2_000_000 },
    { id: 'kcca-parking', name: 'Parking Fine',    minAmt: 20_000,  maxAmt: 20_000    },
    { id: 'kcca-rates',   name: 'Property Rates',  minAmt: 50_000,  maxAmt: 5_000_000 },
  ],
}

const STATUSES: AgencyTransaction['status'][] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed']

function generateTxn(agencyId: string, idx: number): AgencyTransaction {
  const services = AGENCY_SERVICES[agencyId] ?? AGENCY_SERVICES['ura']
  const svc = rnd(services)
  const status = rnd(STATUSES)
  return {
    id: `AGT-${agencyId.toUpperCase()}-${String(idx).padStart(4, '0')}`,
    agencyId,
    amount: rndInt(svc.minAmt, svc.maxAmt),
    payer: rnd(PAYERS),
    serviceId: svc.id,
    serviceName: svc.name,
    channel: rnd(CHANNELS),
    status,
    prn: `PRN${Date.now().toString().slice(-8)}${idx}`,
    timestamp: makeTimestamp(rndInt(0, 48)),
    processingTimeMs: rndInt(120, 3_000),
    failureReason: status === 'failed' ? rnd(['PRN not found', 'Account suspended', 'Service unavailable', 'Duplicate payment']) : undefined,
  }
}

const AGENCY_IDS = ['ura', 'nira', 'ursb', 'mol', 'upf', 'imm', 'kcca']

export const mockAgencyTransactions: AgencyTransaction[] = AGENCY_IDS.flatMap((aid, agIdx) =>
  Array.from({ length: 20 }, (_, i) => generateTxn(aid, agIdx * 20 + i))
)
