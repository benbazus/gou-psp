import { ResponsiveContainer, AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface AreaConfig {
  key: string
  color: string
  name?: string
}

interface Props {
  data: Record<string, unknown>[]
  xKey: string
  areas: AreaConfig[]
  height?: number
}

export function AreaChart({ data, xKey, areas, height = 200 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((a) => (
            <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={a.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={a.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        {areas.map((a) => (
          <Area
            key={a.key}
            type="monotone"
            dataKey={a.key}
            name={a.name ?? a.key}
            stroke={a.color}
            fill={`url(#grad-${a.key})`}
            strokeWidth={2}
          />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  )
}
