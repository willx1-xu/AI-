import { useState } from 'react'
import { useBodyStore, type BodyRecord } from '../stores/useBodyStore'
import TrendChart from '../components/TrendChart'

const METRICS = [
  { key: 'weightKg', label: '体重', unit: 'kg', color: '#22d3ee' },
  { key: 'bodyFatPct', label: '体脂率', unit: '%', color: '#f472b6' },
  { key: 'muscleMassKg', label: '骨骼肌量', unit: 'kg', color: '#a78bfa' },
  { key: 'bmrKcal', label: '基础代谢', unit: 'kcal', color: '#fbbf24' },
] as const

const RANGES = [
  { key: '1w', label: '1周' },
  { key: '1m', label: '1月' },
  { key: '3m', label: '3月' },
  { key: 'all', label: '全部' },
] as const

type RangeKey = typeof RANGES[number]['key']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function BodyPage() {
  const [range, setRange] = useState<RangeKey>('1m')
  const [date, setDate] = useState(todayStr())
  const [form, setForm] = useState({ weightKg: '', bodyFatPct: '', muscleMassKg: '', bmrKcal: '' })
  const [showForm, setShowForm] = useState(false)

  const { records, addOrUpdateRecord, getLatest, getBaseline, getAllRecords } = useBodyStore()

  const latest = getLatest()
  const baseline = getBaseline()

  const openForm = () => {
    const existing = records.find((r) => r.date === date)
    if (existing) {
      setForm({
        weightKg: String(existing.weightKg),
        bodyFatPct: String(existing.bodyFatPct),
        muscleMassKg: String(existing.muscleMassKg),
        bmrKcal: String(existing.bmrKcal),
      })
    } else {
      setForm({ weightKg: '', bodyFatPct: '', muscleMassKg: '', bmrKcal: '' })
    }
    setShowForm(true)
  }

  const handleSubmit = () => {
    addOrUpdateRecord({
      date,
      weightKg: parseFloat(form.weightKg) || 0,
      bodyFatPct: parseFloat(form.bodyFatPct) || 0,
      muscleMassKg: parseFloat(form.muscleMassKg) || 0,
      bmrKcal: parseInt(form.bmrKcal) || 0,
    })
    setShowForm(false)
  }

  const getChartData = (key: keyof BodyRecord) =>
    getAllRecords().map((r) => ({ date: r.date, value: r[key] as number }))

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">身体数据</h2>
        <button onClick={openForm} className="bg-cyan-500 text-black px-4 py-1.5 rounded-full text-sm font-semibold">
          + 记录
        </button>
      </div>

      {/* Latest data cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {METRICS.map((m) => {
          const value = latest?.[m.key as keyof BodyRecord]
          const baseValue = baseline?.[m.key as keyof BodyRecord]
          const diff = typeof value === 'number' && typeof baseValue === 'number'
            ? (value as number) - (baseValue as number)
            : null
          return (
            <div key={m.key} className="bg-gray-800/50 rounded-xl p-3">
              <span className="text-xs text-gray-400">{m.label}</span>
              <div className="text-xl font-bold mt-1" style={{ color: m.color }}>
                {value ?? '--'}<span className="text-xs ml-1">{value != null ? m.unit : ''}</span>
              </div>
              {diff !== null && diff !== 0 && baseline && (
                <span className={`text-xs ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {diff > 0 ? '↑' : '↓'} {Math.abs(Math.round(diff * 10) / 10)} {m.unit}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Range selector */}
      <div className="flex gap-1 mb-4">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1 rounded-full text-xs ${
              range === r.key ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-500'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Trend charts */}
      <div className="space-y-4">
        {METRICS.map((m) => (
          <div key={m.key} className="bg-gray-800/30 rounded-xl p-3">
            <h3 className="text-sm text-gray-400 mb-2">{m.label} ({m.unit})</h3>
            <TrendChart
              data={getChartData(m.key as keyof BodyRecord)}
              label={m.label}
              color={m.color}
              unit={m.unit}
              range={range}
            />
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-gray-900 rounded-t-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">记录身体数据</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400">关闭</button>
              </div>

              <label className="text-xs text-gray-400">日期</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mb-3 outline-none" />

              <div className="grid grid-cols-2 gap-3">
                {METRICS.map((m) => (
                  <div key={m.key}>
                    <label className="text-xs text-gray-400">{m.label} ({m.unit})</label>
                    <input
                      type="number"
                      value={form[m.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [m.key]: e.target.value })}
                      placeholder={m.label}
                      className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 pb-safe mt-2">
              <button onClick={handleSubmit} className="w-full bg-cyan-500 text-black py-3 rounded-lg font-semibold text-base">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
