import { useState } from 'react'
import { usePlanStore } from '../stores/usePlanStore'
import { useBodyStore } from '../stores/useBodyStore'

const ACTIVITY_LEVELS = [
  { value: 1.2, label: '久坐 (基本不运动)' },
  { value: 1.375, label: '轻度 (1-3天/周)' },
  { value: 1.55, label: '中度 (3-5天/周)' },
  { value: 1.725, label: '重度 (6-7天/周)' },
  { value: 1.9, label: '运动员 (每天高强度)' },
]

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
        <h2 className="text-lg font-bold">训练计划</h2>
        <button onClick={() => setShowForm(true)} className="bg-cyan-500 text-black px-4 py-1.5 rounded-full text-sm font-semibold">
          + 新建计划
        </button>
      </div>

      {!currentPlan ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">暂无活跃计划</p>
          <p className="text-gray-600 text-sm">创建一个增肌或减脂计划来开始追踪</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentPlan.goal === 'bulk' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                {currentPlan.goal === 'bulk' ? '增肌' : '减脂'}
              </span>
              <button onClick={() => deactivatePlan(currentPlan.id)} className="text-xs text-gray-500">结束计划</button>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>目标进度</span>
                <span className="text-cyan-400">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-800/50 rounded-lg p-2">
                <span className="text-gray-400 text-xs">起始体重</span>
                <div className="font-semibold">{currentPlan.startWeightKg} kg</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2">
                <span className="text-gray-400 text-xs">目标体重</span>
                <div className="font-semibold">{currentPlan.targetWeightKg} kg</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2">
                <span className="text-gray-400 text-xs">每日目标热量</span>
                <div className="font-semibold text-cyan-400">{currentPlan.dailyCalorieTarget} kcal</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2">
                <span className="text-gray-400 text-xs">剩余天数</span>
                <div className="font-semibold">{daysRemaining} 天</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-3 text-sm">
            <span className="text-gray-400">计划周期：</span>
            {currentPlan.startDate} ~ {currentPlan.endDate}
            <span className="text-gray-500 ml-2">(共 {Math.ceil((new Date(currentPlan.endDate).getTime() - new Date(currentPlan.startDate).getTime()) / 86400000)} 天)</span>
          </div>

          {plans.filter((p) => !p.isActive).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400">历史计划</h3>
              {plans.filter((p) => !p.isActive).map((p) => (
                <div key={p.id} className="bg-gray-800/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs ${p.goal === 'bulk' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                      {p.goal === 'bulk' ? '增肌' : '减脂'}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">{p.startWeightKg} → {p.targetWeightKg} kg</span>
                  </div>
                  <span className="text-gray-600 text-xs">{p.startDate} ~ {p.endDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create plan modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-gray-900 rounded-t-2xl w-full max-h-[90%] overflow-y-auto p-4 pb-safe" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">新建计划</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">关闭</button>
            </div>

            <label className="text-xs text-gray-400">目标</label>
            <div className="flex gap-2 mb-3 mt-1">
              {(['bulk', 'cut'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    goal === g ? (g === 'bulk' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white') : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {g === 'bulk' ? '增肌' : '减脂'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-400">开始日期</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400">结束日期</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-400">起始体重 (kg)</label>
                <input type="number" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none" step="0.1" />
              </div>
              <div>
                <label className="text-xs text-gray-400">目标体重 (kg)</label>
                <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none" step="0.1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-400">基础代谢 (kcal)</label>
                <input type="number" value={bmr} onChange={(e) => setBmr(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none" />
                <button onClick={fillFromLatestBody} className="text-xs text-cyan-400 mt-1">填入最近身体数据</button>
              </div>
              <div>
                <label className="text-xs text-gray-400">活动系数</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(parseFloat(e.target.value))} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none">
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {bmr && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">TDEE (维持热量)</span>
                  <span>{Math.round(parseFloat(bmr) * activityLevel)} kcal</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-cyan-400">每日目标摄入</span>
                  <span className="text-cyan-400 font-semibold">{calculateCalorieTarget()} kcal</span>
                </div>
              </div>
            )}

            <button onClick={handleCreate} className="w-full bg-cyan-500 text-black py-2.5 rounded-lg font-semibold">
              创建计划
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
