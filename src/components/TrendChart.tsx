import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendChartProps {
  data: { date: string; value: number }[]
  label: string
  color: string
  unit: string
  range: '1w' | '1m' | '3m' | 'all'
}

export default function TrendChart({ data, label, color, unit, range }: TrendChartProps) {
  const now = new Date()
  const rangeDays = range === '1w' ? 7 : range === '1m' ? 30 : range === '3m' ? 90 : Infinity
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - rangeDays)

  const chartData = useMemo(() =>
    data
      .filter((d) => range === 'all' || d.date >= cutoff.toISOString().slice(0, 10))
      .map((d) => ({ date: d.date.slice(5), value: d.value })),
    [data, range],
  )

  if (chartData.length === 0) {
    return <p className="text-gray-600 text-sm text-center py-8">暂无数据</p>
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} unit={unit} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
          formatter={(value: number) => [`${value} ${unit}`, label]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
