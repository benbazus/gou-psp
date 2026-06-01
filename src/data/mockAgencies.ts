import type { Agency } from '../types'

export const mockAgencies: Agency[] = [
  {
    id: 'URA', name: 'Uganda Revenue Authority', shortName: 'URA',
    type: 'Tax & Revenue',
    settlementAccount: 'BOU-TREAS-001-URA',
    dailyVolume: 4_820_000_000, monthlyRevenue: 89_400_000_000, status: 'active',
    services: [
      { id: 'ura-tax', name: 'Income Tax', fee: 2000, description: 'Personal and corporate income tax payments' },
      { id: 'ura-vat', name: 'VAT Payment', fee: 2000, description: 'Value added tax remittance' },
      { id: 'ura-customs', name: 'Customs Duty', fee: 5000, description: 'Import and export duty payments' },
      { id: 'ura-paye', name: 'PAYE', fee: 2000, description: 'Pay As You Earn employer remittance' },
    ],
  },
  {
    id: 'NIRA', name: 'National Identification & Registration Authority', shortName: 'NIRA',
    type: 'Identification',
    settlementAccount: 'BOU-TREAS-002-NIRA',
    dailyVolume: 380_000_000, monthlyRevenue: 7_200_000_000, status: 'active',
    services: [
      { id: 'nira-nid', name: 'National ID', fee: 5000, description: 'National ID card application' },
      { id: 'nira-passport', name: 'Passport', fee: 250000, description: 'Ordinary passport application' },
      { id: 'nira-birth', name: 'Birth Certificate', fee: 20000, description: 'Birth certificate issuance' },
    ],
  },
  {
    id: 'URSB', name: 'Uganda Registration Services Bureau', shortName: 'URSB',
    type: 'Business Registration',
    settlementAccount: 'BOU-TREAS-003-URSB',
    dailyVolume: 210_000_000, monthlyRevenue: 3_900_000_000, status: 'active',
    services: [
      { id: 'ursb-bizreg', name: 'Business Registration', fee: 100000, description: 'Company name and business registration' },
      { id: 'ursb-trademark', name: 'Trademark Registration', fee: 400000, description: 'Trademark and IP registration' },
    ],
  },
  {
    id: 'MOL', name: 'Ministry of Lands', shortName: 'Ministry of Lands',
    type: 'Land Services',
    settlementAccount: 'BOU-TREAS-004-MOL',
    dailyVolume: 560_000_000, monthlyRevenue: 10_500_000_000, status: 'active',
    services: [
      { id: 'mol-landsearch', name: 'Land Search', fee: 50000, description: 'Land title and ownership search' },
      { id: 'mol-transfer', name: 'Land Transfer', fee: 200000, description: 'Land title transfer and registration' },
      { id: 'mol-lease', name: 'Lease Extension', fee: 150000, description: 'Mailo/leasehold extension fees' },
    ],
  },
  {
    id: 'UPF', name: 'Uganda Police Force', shortName: 'Uganda Police',
    type: 'Law Enforcement',
    settlementAccount: 'BOU-TREAS-005-UPF',
    dailyVolume: 95_000_000, monthlyRevenue: 1_800_000_000, status: 'active',
    services: [
      { id: 'upf-fine', name: 'Court Fine', fee: 10000, description: 'Traffic and court-ordered fines' },
      { id: 'upf-clearance', name: 'Police Clearance', fee: 80000, description: 'Police clearance certificate' },
      { id: 'upf-permit', name: 'Firearms Permit', fee: 500000, description: 'Firearms possession permit' },
    ],
  },
  {
    id: 'IMM', name: 'Directorate of Citizenship & Immigration', shortName: 'Immigration',
    type: 'Immigration',
    settlementAccount: 'BOU-TREAS-006-IMM',
    dailyVolume: 180_000_000, monthlyRevenue: 3_400_000_000, status: 'active',
    services: [
      { id: 'imm-visa', name: 'Visa Application', fee: 120000, description: 'Tourist and work visa fees' },
      { id: 'imm-permit', name: 'Work Permit', fee: 820000, description: 'Work permit and stay extension' },
    ],
  },
  {
    id: 'KCCA', name: 'Kampala Capital City Authority', shortName: 'KCCA',
    type: 'Local Government',
    settlementAccount: 'BOU-TREAS-007-KCCA',
    dailyVolume: 290_000_000, monthlyRevenue: 5_500_000_000, status: 'active',
    services: [
      { id: 'kcca-permit', name: 'Business Permit', fee: 200000, description: 'Kampala operating license' },
      { id: 'kcca-parking', name: 'Parking Fine', fee: 20000, description: 'Parking violation fine payment' },
      { id: 'kcca-rates', name: 'Property Rates', fee: 5000, description: 'Annual property rates' },
    ],
  },
  {
    id: 'MOW', name: 'Ministry of Works & Transport', shortName: 'Ministry of Works',
    type: 'Transport',
    settlementAccount: 'BOU-TREAS-008-MOW',
    dailyVolume: 420_000_000, monthlyRevenue: 7_900_000_000, status: 'active',
    services: [
      { id: 'mow-dlvehicle', name: 'Driving License', fee: 80000, description: 'Driving license application and renewal' },
      { id: 'mow-uvehicle', name: 'Vehicle Registration', fee: 200000, description: 'Vehicle registration and transfer' },
      { id: 'mow-roadtax', name: 'Road Tax', fee: 350000, description: 'Annual road licensing fees' },
    ],
  },
]
