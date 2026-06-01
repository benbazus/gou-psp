import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface LineConfig {
  key: string
  color: string
  name?: string
}

interface Props {
  data: Record<string, unknown>[]
  xKey: string
  lines: LineConfig[]
  height?: number
}

export function LineChart({ data, xKey, lines, height = 200 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name ?? l.key}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
