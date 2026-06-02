import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { AreaChart } from '../../components/charts/AreaChart'
import { LineChart } from '../../components/charts/LineChart'
import { reportsApi } from '../../services/mockApi'
import { agencyRevenue, channelBreakdown, regionalActivity, failureReasons } from '../../data/mockReports'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatNumber } from '../../utils/format'
import { Download, FileSpreadsheet, FileText, TrendingUp, AlertTriangle, MapPin, Building2 } from 'lucide-react'

const RECON_EXCEPTIONS = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  exceptions: 80 + Math.floor(Math.random() * 200),
}))

const CHANNEL_COLORS = ['#1B3A6B', '#F4B000', '#16A34A', '#D62828', '#64748B']

// ─── Export helpers ────────────────────────────────────────
// A single source of truth for the export payload so CSV / Excel / PDF all
// stay in sync — each exporter just re-serialises the same row matrix.
function buildReportMatrix(): { title: string; headers: string[]; rows: (string | number)[][] }[] {
  return [
    {
      title: 'Revenue by Agency',
      headers: ['Agency', 'Revenue (UGX)', 'Transactions'],
      rows: agencyRevenue.map((a) => [a.agency, a.revenue, a.count]),
    },
    {
      title: 'Revenue by Channel',
      headers: ['Channel', 'Revenue (UGX)', 'Transactions'],
      rows: channelBreakdown.map((c) => [c.channel, c.amount, c.count]),
    },
    {
      title: 'Regional Activity',
      headers: ['Region', 'Transactions', 'Amount (UGX)', 'Success Rate %', 'Top Channel'],
      rows: regionalActivity.map((r) => [r.region, r.count, r.amount, r.successRate, r.topChannel]),
    },
    {
      title: 'Failure Reasons',
      headers: ['Reason', 'Count', 'Share %'],
      rows: failureReasons.map((f) => [f.reason, f.count, f.pct]),
    },
  ]
}

function exportCSV() {
  const sections = buildReportMatrix()
  const lines: string[] = ['Uganda GovPay Switch — Analytics Export', new Date().toISOString(), '']
  for (const s of sections) {
    lines.push(s.title)
    lines.push(s.headers.join(','))
    for (const r of s.rows) lines.push(r.map((c) => `"${c}"`).join(','))
    lines.push('')
  }
  triggerDownload(lines.join('\n'), 'govpay-report.csv', 'text/csv')
}

function exportExcel() {
  // Excel opens tab-separated .xls files natively — no library needed for a demo.
  const sections = buildReportMatrix()
  const lines: string[] = ['Uganda GovPay Switch — Analytics Export', new Date().toISOString(), '']
  for (const s of sections) {
    lines.push(s.title)
    lines.push(s.headers.join('\t'))
    for (const r of s.rows) lines.push(r.join('\t'))
    lines.push('')
  }
  triggerDownload(lines.join('\n'), 'govpay-report.xls', 'application/vnd.ms-excel')
}

function exportPDF() {
  // Browser print-to-PDF: render the sections into a printable window.
  const sections = buildReportMatrix()
  const html = `
    <html><head><title>GovPay Analytics Report</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:32px;color:#1e293b}
      h1{color:#1B3A6B;font-size:20px} h2{color:#1B3A6B;font-size:14px;margin-top:24px;border-bottom:2px solid #F4B000;padding-bottom:4px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
      th{background:#1B3A6B;color:#fff;text-align:left;padding:6px 8px}
      td{border-bottom:1px solid #e2e8f0;padding:6px 8px}
      .meta{color:#64748b;font-size:11px}
    </style></head><body>
    <h1>🇺🇬 Uganda GovPay Switch — Analytics Report</h1>
    <p class="meta">Generated ${new Date().toLocaleString()}</p>
    ${sections.map((s) => `
      <h2>${s.title}</h2>
      <table><thead><tr>${s.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${s.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
    `).join('')}
    </body></html>`
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 250)
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── KPI summary strip ─────────────────────────────────────
function KpiStrip() {
  const totalRevenue = agencyRevenue.reduce((s, a) => s + a.revenue, 0)
  const totalTxns = agencyRevenue.reduce((s, a) => s + a.count, 0)
  const totalFailed = failureReasons.reduce((s, f) => s + f.count, 0)
  const topRegion = [...regionalActivity].sort((a, b) => b.amount - a.amount)[0]

  const items = [
    { label: 'Total Revenue', value: formatUGX(totalRevenue), icon: TrendingUp, tint: 'text-primary' },
    { label: 'Total Transactions', value: formatNumber(totalTxns), icon: Building2, tint: 'text-emerald-600' },
    { label: 'Failed (period)', value: formatNumber(totalFailed), icon: AlertTriangle, tint: 'text-danger' },
    { label: 'Top Region', value: topRegion.region, icon: MapPin, tint: 'text-accent' },
  ]
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {items.map((it) => (
        <div key={it.label} className="bg-card rounded-card shadow-card p-4 flex items-center gap-3">
          <div className={`${it.tint}`}><it.icon size={22} /></div>
          <div>
            <div className="text-xs text-muted">{it.label}</div>
            <div className="text-lg font-bold text-slate-800">{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
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

  // FIX: chart channel *revenue* (amount), not transaction count, per spec.
  const channelPie = channelBreakdown.map((c, i) => ({
    name: c.channel,
    value: Math.round(c.amount / 1_000_000_000),
    color: CHANNEL_COLORS[i],
  }))

  const failedData = volumeSlice.map((d) => ({ date: d.date, failed: d.failed }))
  const settlementData = volumeSlice.map((d) => ({ date: d.date, amount: Math.round(d.amount / 1_000_000_000) }))
  const regionBar = regionalActivity.map((r) => ({
    region: r.region,
    amount: Math.round(r.amount / 1_000_000_000),
  }))

  const handleExport = (fn: () => void, label: string) => {
    fn()
    addToast(`${label} report exported`, 'success')
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Transaction volumes, agency collections, regional activity, and reconciliation trends"
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
              onClick={() => handleExport(exportCSV, 'CSV')}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={() => handleExport(exportExcel, 'Excel')}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button
              onClick={() => handleExport(exportPDF, 'PDF')}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
            >
              <FileText size={14} /> PDF
            </button>
          </div>
        }
      />

      <KpiStrip />

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
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Revenue by Payment Channel (UGX B)</h3>
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

      {/* Failure-reason breakdown + Regional activity */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Failed Transaction Analysis (by reason)</h3>
          <div className="space-y-2.5">
            {failureReasons.map((f) => (
              <div key={f.reason}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700">{f.reason}</span>
                  <span className="text-muted">{formatNumber(f.count)} · {f.pct}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Regional Payment Activity (UGX B)</h3>
          <BarChart
            data={regionBar}
            xKey="region"
            bars={[{ key: 'amount', color: '#16A34A', name: 'Amount (B UGX)' }]}
            height={220}
          />
        </div>
      </div>

      {/* Regional detail table */}
      <div className="bg-card rounded-card shadow-card p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Regional Activity Breakdown</h3>
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Region', 'Transactions', 'Amount (UGX)', 'Success Rate', 'Top Channel'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {regionalActivity.map((r) => (
              <tr key={r.region} className="hover:bg-primary-50">
                <td className="px-4 py-2.5 font-medium">{r.region}</td>
                <td className="px-4 py-2.5">{formatNumber(r.count)}</td>
                <td className="px-4 py-2.5 font-semibold text-primary">{formatUGX(r.amount)}</td>
                <td className="px-4 py-2.5">
                  <span className={r.successRate >= 97 ? 'text-emerald-600' : 'text-amber-600'}>{r.successRate}%</span>
                </td>
                <td className="px-4 py-2.5 text-muted">{r.topChannel}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
