import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface Slice {
  name: string
  value: number
  color: string
}

interface Props {
  data: Slice[]
  height?: number
  donut?: boolean
}

export function PieChart({ data, height = 220, donut = false }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? '55%' : 0}
          outerRadius="75%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((slice, i) => <Cell key={i} fill={slice.color} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </RePieChart>
    </ResponsiveContainer>
  )
}
