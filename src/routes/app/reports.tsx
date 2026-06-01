import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { AreaChart } from '../../components/charts/AreaChart'
import { LineChart } from '../../components/charts/LineChart'
import { reportsApi } from '../../services/mockApi'
import { agencyRevenue, channelBreakdown } from '../../data/mockReports'
import { useAppStore } from '../../store/appStore'
import { formatUGX } from '../../utils/format'
import { Download } from 'lucide-react'

const RECON_EXCEPTIONS = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  exceptions: 80 + Math.floor(Math.random() * 200),
}))

function downloadReport() {
  const content = [
    'Report Type,Date,Value',
    `Daily Volume,${new Date().toISOString().slice(0, 10)},24400000000`,
    `Success Rate,${new Date().toISOString().slice(0, 10)},97.4%`,
  ].join('\n')
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'govpay-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [dateRange, setDateRange] = useState('30d')

  const { data: dailyVolume = [] } = useQuery({
    queryKey: ['daily-volume', dateRange],
    queryFn: reportsApi.dailyVolume,
  })

  const volumeSlice =
    dateRange === '7d'  ? dailyVolume.slice(-7) :
    dateRange === '14d' ? dailyVolume.slice(-14) :
    dailyVolume

  const agencyBar = agencyRevenue.map((a) => ({
    agency: a.agency,
    revenue: Math.round(a.revenue / 1_000_000_000),
  }))

  const channelPie = channelBreakdown.map((c, i) => ({
    name: c.channel,
    value: c.count,
    color: ['#1B3A6B', '#F4B000', '#16A34A', '#D62828', '#64748B'][i],
  }))

  const failedData = volumeSlice.map((d) => ({ date: d.date, failed: d.failed }))
  const settlementData = volumeSlice.map((d) => ({ date: d.date, amount: Math.round(d.amount / 1_000_000_000) }))

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Transaction volumes, agency collections, and reconciliation trends"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={() => { downloadReport(); addToast('Report exported successfully', 'success') }}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Daily Transaction Volume</h3>
          <BarChart
            data={volumeSlice}
            xKey="date"
            bars={[
              { key: 'success', color: '#16A34A', name: 'Success' },
              { key: 'failed',  color: '#D62828', name: 'Failed' },
            ]}
            height={200}
          />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Revenue by Agency (UGX B)</h3>
          <BarChart
            data={agencyBar}
            xKey="agency"
            bars={[{ key: 'revenue', color: '#1B3A6B', name: 'Revenue (B UGX)' }]}
            height={200}
          />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Channel Breakdown (by count)</h3>
          <PieChart data={channelPie} height={200} donut />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Failed Transaction Trend</h3>
          <LineChart
            data={failedData}
            xKey="date"
            lines={[{ key: 'failed', color: '#D62828', name: 'Failed' }]}
            height={200}
          />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Settlement Volume Trend (UGX B)</h3>
          <AreaChart
            data={settlementData}
            xKey="date"
            areas={[{ key: 'amount', color: '#1B3A6B', name: 'Settlement (B UGX)' }]}
            height={200}
          />
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Reconciliation Exceptions</h3>
          <BarChart
            data={RECON_EXCEPTIONS}
            xKey="day"
            bars={[{ key: 'exceptions', color: '#D97706', name: 'Exceptions' }]}
            height={200}
          />
        </div>
      </div>

      {/* Treasury summary table */}
      <div className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Treasury Collection Summary</h3>
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Agency', 'Revenue (UGX)', 'Transactions', 'Avg Per Txn'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {agencyRevenue.map((a) => (
              <tr key={a.agency} className="hover:bg-primary-50">
                <td className="px-4 py-2.5 font-medium">{a.agency}</td>
                <td className="px-4 py-2.5 font-semibold text-primary">{formatUGX(a.revenue)}</td>
                <td className="px-4 py-2.5">{a.count.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-muted">{formatUGX(Math.round(a.revenue / a.count))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
