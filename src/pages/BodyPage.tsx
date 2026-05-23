import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBodyStore, type BodyRecord } from '../stores/useBodyStore'
import TrendChart from '../components/TrendChart'
import AnimatedNumber from '../components/AnimatedNumber'

const METRICS = [
  { key: 'weightKg', label: '体重', unit: 'kg', color: '#00d4ff' },
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

const NEON = '#00d4ff'

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
        <h2 className="text-lg font-extrabold" style={{ color: NEON }}>身体数据</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openForm}
          className="px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: NEON, color: '#000' }}
        >
          + 记录
        </motion.button>
      </div>

      {/* Latest data cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {METRICS.map((m, i) => {
          const value = latest?.[m.key as keyof BodyRecord]
          const baseValue = baseline?.[m.key as keyof BodyRecord]
          const diff = typeof value === 'number' && typeof baseValue === 'number'
            ? (value as number) - (baseValue as number)
            : null
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="glass-card p-4"
            >
              <span className="text-xs text-gray-400">{m.label}</span>
              <div className="text-xl font-extrabold mt-1 font-mono" style={{ color: m.color }}>
                {typeof value === 'number' ? <AnimatedNumber value={value} decimals={value < 10 ? 1 : 0} /> : '--'}
                <span className="text-xs ml-1 font-sans text-gray-500">{value != null ? m.unit : ''}</span>
              </div>
              {diff !== null && diff !== 0 && baseline && (
                <span
                  className="text-xs"
                  style={{ color: diff > 0 ? '#00ff88' : '#ff6b35' }}
                >
                  {diff > 0 ? '↑' : '↓'} {Math.abs(Math.round(diff * 10) / 10)} {m.unit}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Range selector */}
      <div className="flex gap-1 mb-4">
        {RANGES.map((r) => (
          <motion.button
            key={r.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRange(r.key)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              range === r.key
                ? { background: `${NEON}20`, color: NEON }
                : { background: 'rgba(255,255,255,0.05)', color: '#6b7280' }
            }
          >
            {r.label}
          </motion.button>
        ))}
      </div>

      {/* Trend charts */}
      <div className="space-y-3">
        {METRICS.map((m) => (
          <div key={m.key} className="glass-card p-4">
            <h3 className="text-sm text-gray-400 mb-3">{m.label} ({m.unit})</h3>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass rounded-t-3xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: `${NEON}20` }}
          >
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">记录身体数据</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">&times;</button>
              </div>

              <label className="text-xs text-gray-400">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mb-4 outline-none border border-white/5"
              />

              <div className="grid grid-cols-2 gap-3">
                {METRICS.map((m) => (
                  <div key={m.key}>
                    <label className="text-xs text-gray-400">{m.label} ({m.unit})</label>
                    <input
                      type="number"
                      value={form[m.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [m.key]: e.target.value })}
                      placeholder={m.label}
                      className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 pb-safe mt-2">
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-xl font-semibold text-base"
                style={{ background: NEON, color: '#000' }}
              >
                保存
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
