import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePlanStore } from '../stores/usePlanStore'
import { useBodyStore } from '../stores/useBodyStore'

const ACTIVITY_LEVELS = [
  { value: 1.2, label: '久坐 (基本不运动)' },
  { value: 1.375, label: '轻度 (1-3天/周)' },
  { value: 1.55, label: '中度 (3-5天/周)' },
  { value: 1.725, label: '重度 (6-7天/周)' },
  { value: 1.9, label: '运动员 (每天高强度)' },
]

const NEON = '#a855f7'

export default function PlanPage() {
  const [showForm, setShowForm] = useState(false)
  const [goal, setGoal] = useState<'bulk' | 'cut'>('bulk')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 56)
    return d.toISOString().slice(0, 10)
  })
  const [startWeight, setStartWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [bmr, setBmr] = useState('')
  const [activityLevel, setActivityLevel] = useState(1.55)

  const { plans, createPlan, deactivatePlan, getActivePlan } = usePlanStore()
  const latestBody = useBodyStore((s) => s.getLatest())

  const calculateCalorieTarget = () => {
    if (!bmr) return 0
    const tdee = parseFloat(bmr) * activityLevel
    const adjustment = goal === 'cut' ? -400 : 400
    return Math.round(tdee + adjustment)
  }

  const handleCreate = () => {
    const dailyTarget = calculateCalorieTarget()
    createPlan({
      goal,
      startDate,
      endDate,
      startWeightKg: parseFloat(startWeight) || 0,
      targetWeightKg: parseFloat(targetWeight) || 0,
      dailyCalorieTarget: dailyTarget,
      activityLevel,
    })
    setShowForm(false)
  }

  const fillFromLatestBody = () => {
    if (latestBody) {
      setStartWeight(String(latestBody.weightKg))
      setBmr(String(latestBody.bmrKcal))
    }
  }

  const currentPlan = getActivePlan()

  const progress = currentPlan
    ? (() => {
        const currentWeight = latestBody?.weightKg ?? currentPlan.startWeightKg
        const totalChange = currentPlan.targetWeightKg - currentPlan.startWeightKg
        const actualChange = currentWeight - currentPlan.startWeightKg
        if (totalChange === 0) return 0
        return Math.max(0, Math.min(100, Math.round((actualChange / totalChange) * 100)))
      })()
    : 0

  const daysRemaining = currentPlan
    ? Math.max(0, Math.ceil((new Date(currentPlan.endDate).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold" style={{ color: NEON }}>训练计划</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: NEON, color: '#fff' }}
        >
          + 新建计划
        </motion.button>
      </div>

      {!currentPlan ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-2">暂无活跃计划</p>
          <p className="text-gray-600 text-sm">创建一个增肌或减脂计划来开始追踪</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active plan card */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentPlan.goal === 'bulk' ? '🔥' : '❄️'}</span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: currentPlan.goal === 'bulk' ? 'rgba(249,115,22,0.2)' : 'rgba(0,255,136,0.2)',
                    color: currentPlan.goal === 'bulk' ? '#f97316' : '#00ff88',
                  }}
                >
                  {currentPlan.goal === 'bulk' ? '增肌' : '减脂'}
                </span>
              </div>
              <button onClick={() => deactivatePlan(currentPlan.id)} className="text-xs text-gray-500">结束计划</button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">目标进度</span>
                <span style={{ color: NEON }}>{progress}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${NEON}, #c084fc)`,
                    boxShadow: `0 0 12px ${NEON}40`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '起始体重', value: `${currentPlan.startWeightKg} kg` },
                { label: '目标体重', value: `${currentPlan.targetWeightKg} kg` },
                { label: '每日目标热量', value: `${currentPlan.dailyCalorieTarget} kcal`, highlight: true },
                { label: '剩余天数', value: `${daysRemaining} 天` },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <div
                    className="font-bold text-sm mt-0.5"
                    style={item.highlight ? { color: NEON } : { color: '#fff' }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan period */}
          <div className="glass-card p-4 text-sm">
            <span className="text-gray-400">计划周期：</span>
            <span className="text-white">{currentPlan.startDate} ~ {currentPlan.endDate}</span>
            <span className="text-gray-500 ml-2">
              (共 {Math.ceil((new Date(currentPlan.endDate).getTime() - new Date(currentPlan.startDate).getTime()) / 86400000)} 天)
            </span>
          </div>

          {/* History */}
          {plans.filter((p) => !p.isActive).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400 font-semibold">历史计划</h3>
              {plans.filter((p) => !p.isActive).map((p) => (
                <div key={p.id} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: p.goal === 'bulk' ? 'rgba(249,115,22,0.15)' : 'rgba(0,255,136,0.15)',
                        color: p.goal === 'bulk' ? '#f97316' : '#00ff88',
                      }}
                    >
                      {p.goal === 'bulk' ? '增肌' : '减脂'}
                    </span>
                    <span className="text-sm text-gray-300">{p.startWeightKg} → {p.targetWeightKg} kg</span>
                  </div>
                  <span className="text-xs text-gray-500">{p.startDate} ~ {p.endDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create plan modal */}
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
            className="glass rounded-t-3xl w-full max-h-[90%] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: `${NEON}20` }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">新建计划</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">&times;</button>
            </div>

            <label className="text-xs text-gray-400">目标</label>
            <div className="flex gap-2 mb-4 mt-1">
              {(['bulk', 'cut'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={
                    goal === g
                      ? { background: g === 'bulk' ? '#f97316' : '#00ff88', color: '#000' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#6b7280' }
                  }
                >
                  {g === 'bulk' ? '🔥 增肌' : '❄️ 减脂'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400">开始日期</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5" />
              </div>
              <div>
                <label className="text-xs text-gray-400">结束日期</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400">起始体重 (kg)</label>
                <input type="number" value={startWeight} onChange={(e) => setStartWeight(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5" step="0.1" />
              </div>
              <div>
                <label className="text-xs text-gray-400">目标体重 (kg)</label>
                <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5" step="0.1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400">基础代谢 (kcal)</label>
                <input type="number" value={bmr} onChange={(e) => setBmr(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5" />
                <button onClick={fillFromLatestBody} className="text-xs mt-1" style={{ color: NEON }}>填入最近身体数据</button>
              </div>
              <div>
                <label className="text-xs text-gray-400">活动系数</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5">
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a.value} value={a.value} className="bg-gray-900">{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {bmr && (
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">TDEE (维持热量)</span>
                  <span className="text-white">{Math.round(parseFloat(bmr) * activityLevel)} kcal</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span style={{ color: NEON }}>每日目标摄入</span>
                  <span className="font-bold" style={{ color: NEON }}>{calculateCalorieTarget()} kcal</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              className="w-full py-3.5 rounded-xl font-semibold text-base"
              style={{ background: NEON, color: '#fff' }}
            >
              创建计划
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
