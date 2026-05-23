import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import RingProgress from '../components/RingProgress'
import NeonCard from '../components/NeonCard'
import TimelineItem from '../components/TimelineItem'
import { useDietStore } from '../stores/useDietStore'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import { useBodyStore } from '../stores/useBodyStore'
import { usePlanStore } from '../stores/usePlanStore'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getThisWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const today = todayStr()

  const dailyTotal = useDietStore((s) => s.getDailyTotal(today))
  const calorieTarget = useDietStore((s) => s.dailyCalorieTarget)
  const todayEntries = useDietStore((s) => s.getEntriesByDate(today))
  const todayWorkouts = useWorkoutStore((s) => s.getWorkoutsByDate(today))
  const workouts = useWorkoutStore((s) => s.workouts)
  const latestBody = useBodyStore((s) => s.getLatest())
  const baseline = useBodyStore((s) => s.getBaseline())
  const activePlan = usePlanStore((s) => s.getActivePlan())

  const weekDates = useMemo(() => getThisWeekDates(), [])
  const workoutDates = useMemo(() => {
    const set = new Set(workouts.map((w) => w.date))
    return set
  }, [workouts])

  const caloriePercent = calorieTarget > 0
    ? Math.min(100, Math.round((dailyTotal.calories / calorieTarget) * 100))
    : 0

  // Build timeline of today's activity
  const timeline = useMemo(() => {
    const items: { time: string; text: string; color: string }[] = []

    todayEntries.forEach((e) => {
      items.push({
        time: e.mealType === 'breakfast' ? '08:00' : e.mealType === 'lunch' ? '12:00' : e.mealType === 'dinner' ? '18:00' : '15:00',
        text: `记录了${e.foodName}`,
        color: '#ff6b35',
      })
    })

    todayWorkouts.forEach((w) => {
      items.push({
        time: '09:30',
        text: `完成了${w.bodyPart}部训练 (${w.exercises.length}个动作)`,
        color: '#00ff88',
      })
    })

    if (latestBody) {
      const hasTodayRecord = latestBody
      if (hasTodayRecord) {
        items.push({
          time: '07:00',
          text: `体重记录 ${latestBody.weightKg}kg`,
          color: '#00d4ff',
        })
      }
    }

    return items.slice(0, 10)
  }, [todayEntries, todayWorkouts, latestBody])

  const hasTrainedToday = todayWorkouts.length > 0
  const hasLoggedDiet = todayEntries.length > 0
  const weightDiff = latestBody && baseline
    ? Math.round((latestBody.weightKg - baseline.weightKg) * 10) / 10
    : null

  return (
    <div className="flex flex-col px-4 pt-2 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Willx1-XU
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-lg"
        >
          ⚙️
        </motion.button>
      </motion.div>

      {/* Calorie Ring */}
      <div className="flex justify-center mb-6">
        <RingProgress progress={caloriePercent} size={180} strokeWidth={10} color="#ffffff">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
            className="text-center"
          >
            <div className="text-3xl font-extrabold font-mono text-white">
              {dailyTotal.calories}
            </div>
            <div className="text-xs text-gray-500">/ {calorieTarget} kcal</div>
            <div className="text-xs text-gray-500 mt-0.5">
              蛋白 {dailyTotal.protein}g · 碳水 {dailyTotal.carbs}g · 脂肪 {dailyTotal.fat}g
            </div>
          </motion.div>
        </RingProgress>
      </div>

      {/* 2×2 Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <NeonCard glowColor="green" onClick={() => navigate('/training')}>
            <div className="text-xs text-gray-400 mb-1">今日训练</div>
            <div className="text-lg font-bold text-[#00ff88] neon-text-green">
              {hasTrainedToday ? `✅ ${todayWorkouts[0].bodyPart}` : '未训练'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {hasTrainedToday ? `${todayWorkouts[0].exercises.length} 个动作` : '点击开始 →'}
            </div>
          </NeonCard>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <NeonCard glowColor="blue" onClick={() => navigate('/body')}>
            <div className="text-xs text-gray-400 mb-1">当前体重</div>
            <div className="text-lg font-bold text-[#00d4ff] neon-text-blue">
              {latestBody ? `${latestBody.weightKg} kg` : '--'}
            </div>
            {weightDiff !== null && weightDiff !== 0 && (
              <div className={`text-xs mt-1 ${weightDiff > 0 ? 'text-[#00ff88]' : 'text-[#ff6b35]'}`}>
                {weightDiff > 0 ? '↑' : '↓'} {Math.abs(weightDiff)} kg
              </div>
            )}
          </NeonCard>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <NeonCard glowColor="purple" onClick={() => navigate('/plan')}>
            <div className="text-xs text-gray-400 mb-1">当前计划</div>
            <div className="text-lg font-bold text-[#a855f7] neon-text-purple">
              {activePlan ? (activePlan.goal === 'bulk' ? '🔥 增肌' : '❄️ 减脂') : '无计划'}
            </div>
            {activePlan && (
              <div className="text-xs text-gray-500 mt-1">
                {Math.max(0, Math.ceil((new Date(activePlan.endDate).getTime() - Date.now()) / 86400000))} 天剩余
              </div>
            )}
          </NeonCard>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <NeonCard glowColor="orange" onClick={() => navigate('/diet')}>
            <div className="text-xs text-gray-400 mb-1">今日饮食</div>
            <div className="text-lg font-bold text-[#ff6b35] neon-text-orange">
              {hasLoggedDiet ? `${dailyTotal.calories} kcal` : '未记录'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {todayEntries.length > 0 ? `${todayEntries.length} 条记录` : '点击添加 →'}
            </div>
          </NeonCard>
        </motion.div>
      </div>

      {/* Weekly training dots */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">本周训练</h3>
        <div className="flex justify-between px-2">
          {weekDates.map((date, i) => {
            const hasWorkout = workoutDates.has(date)
            const isToday = date === today
            return (
              <div key={date} className="flex flex-col items-center gap-2">
                <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-gray-600'}`}>
                  {DAY_LABELS[i]}
                </span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
                  className={`w-3 h-3 rounded-full ${
                    hasWorkout
                      ? 'bg-[#00ff88]'
                      : 'bg-white/10'
                  }`}
                  style={hasWorkout ? { boxShadow: '0 0 8px rgba(0,255,136,0.5)' } : {}}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity timeline */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">今日动态</h3>
        {timeline.length === 0 ? (
          <p className="text-gray-600 text-sm py-4">暂无动态，开始记录吧</p>
        ) : (
          <div className="glass rounded-2xl px-4 py-2">
            {timeline.map((item, i) => (
              <TimelineItem key={i} time={item.time} text={item.text} color={item.color} delay={i * 0.1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
