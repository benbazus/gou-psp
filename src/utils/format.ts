export function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-UG').format(n)
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-UG', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-UG', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export function generatePRN(): string {
  return `PRN${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 100)}`
}

export function generateTxnId(): string {
  return `TXN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`
}
