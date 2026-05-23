import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useWorkoutStore, type Exercise, type Workout } from '../stores/useWorkoutStore'

const BODY_PARTS = ['胸', '背', '肩', '腿', '手臂', '核心']
const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function getWeekDates(weekOffset: number) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const NEON = '#00ff88'

export default function TrainingPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('')
  const [restTimerActive, setRestTimerActive] = useState(false)
  const [restSeconds, setRestSeconds] = useState(0)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)

  const {
    workouts, templates,
    getWorkoutsByDate, addWorkout, removeWorkout,
    addExercise, removeExercise, updateExercise,
    addTemplate, getTemplatesByBodyPart,
    restTimerSeconds,
  } = useWorkoutStore()

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const dayWorkouts = useMemo(() => getWorkoutsByDate(selectedDate), [selectedDate, getWorkoutsByDate, workouts])

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`
  }

  const startRestTimer = () => {
    if (intervalId) clearInterval(intervalId)
    setRestSeconds(restTimerSeconds)
    setRestTimerActive(true)
    const id = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setRestTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setIntervalId(id)
  }

  const handleAddExercise = (workoutId: string) => {
    addExercise(workoutId, { exerciseName: '', sets: 3, reps: 10, weightKg: 0 })
  }

  const handleAddTemplateQuick = (workoutId: string, templateName: string) => {
    addExercise(workoutId, { exerciseName: templateName, sets: 3, reps: 10, weightKg: 0 })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Week navigator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="text-[#00ff88] text-lg px-2">&lt;</button>
        <span className="text-sm text-gray-300">
          {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="text-[#00ff88] text-lg px-2">&gt;</button>
      </div>

      {/* Day selector */}
      <div className="flex px-1 py-2 border-b border-white/5">
        {weekDates.map((date) => {
          const isToday = date === todayStr()
          const isSelected = date === selectedDate
          const hasWorkout = getWorkoutsByDate(date).length > 0
          const d = new Date(date)
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className="flex-1 flex flex-col items-center py-1.5 rounded-xl text-xs transition-all duration-200"
              style={
                isSelected
                  ? { color: NEON, textShadow: `0 0 8px ${NEON}` }
                  : isToday ? { color: '#ffffff' } : { color: '#6b7280' }
              }
            >
              <span>{DAY_LABELS[d.getDay()]}</span>
              <span className="text-sm font-medium mt-0.5">{formatDate(date)}</span>
              {hasWorkout && (
                <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day content */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-extrabold mb-4" style={{ color: NEON }}>
          {selectedDate} 训练记录
        </h2>

        {/* Body part selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {BODY_PARTS.map((bp) => (
            <button
              key={bp}
              onClick={() => setSelectedBodyPart(bp === selectedBodyPart ? '' : bp)}
              className="px-3 py-1.5 rounded-full text-sm transition-all duration-200"
              style={
                bp === selectedBodyPart
                  ? { background: NEON, color: '#000', fontWeight: 600 }
                  : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }
              }
            >
              {bp}
            </button>
          ))}
          <button
            onClick={() => {
              if (selectedBodyPart) {
                addWorkout(selectedDate, selectedBodyPart)
                setSelectedBodyPart('')
              }
            }}
            disabled={!selectedBodyPart}
            className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: selectedBodyPart ? `${NEON}20` : 'rgba(255,255,255,0.03)',
              color: selectedBodyPart ? NEON : '#4b5563',
              opacity: selectedBodyPart ? 1 : 0.3,
            }}
          >
            + 添加训练
          </button>
        </div>

        {/* Workouts for selected date */}
        {dayWorkouts.length === 0 && (
          <p className="text-gray-600 text-center py-10">选择部位后点击"+ 添加训练"开始记录</p>
        )}

        {dayWorkouts.map((workout: Workout) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 glass-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base" style={{ color: NEON }}>{workout.bodyPart}</h3>
              <button onClick={() => removeWorkout(workout.id)} className="text-red-400 text-xs">删除</button>
            </div>

            {/* Templates quick-add */}
            {getTemplatesByBodyPart(workout.bodyPart).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {getTemplatesByBodyPart(workout.bodyPart).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAddTemplateQuick(workout.id, t.name)}
                    className="px-2 py-0.5 text-xs rounded-full transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
            )}

            {/* Exercises */}
            {workout.exercises.map((ex: Exercise) => (
              <div key={ex.id} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                <input
                  value={ex.exerciseName}
                  onChange={(e) => updateExercise(workout.id, ex.id, { exerciseName: e.target.value })}
                  placeholder="动作名"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0"
                />
                <input
                  type="number"
                  value={ex.sets}
                  onChange={(e) => updateExercise(workout.id, ex.id, { sets: parseInt(e.target.value) || 0 })}
                  className="w-10 bg-white/5 rounded-lg text-center text-sm text-white outline-none"
                  placeholder="组"
                />
                <span className="text-gray-600 text-xs">组</span>
                <input
                  type="number"
                  value={ex.reps}
                  onChange={(e) => updateExercise(workout.id, ex.id, { reps: parseInt(e.target.value) || 0 })}
                  className="w-10 bg-white/5 rounded-lg text-center text-sm text-white outline-none"
                  placeholder="次"
                />
                <span className="text-gray-600 text-xs">次</span>
                <input
                  type="number"
                  value={ex.weightKg || ''}
                  onChange={(e) => updateExercise(workout.id, ex.id, { weightKg: parseFloat(e.target.value) || 0 })}
                  className="w-14 bg-white/5 rounded-lg text-center text-sm text-white outline-none"
                  placeholder="kg"
                />
                <span className="text-gray-600 text-xs">kg</span>
                <button
                  onClick={() => removeExercise(workout.id, ex.id)}
                  className="text-red-400 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={() => handleAddExercise(workout.id)}
              className="mt-3 text-sm py-1.5 w-full rounded-lg transition-colors"
              style={{ color: NEON, background: `${NEON}10` }}
            >
              + 添加动作
            </button>

            {/* Save as template */}
            {workout.exercises.some((e) => e.exerciseName) && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    workout.exercises.forEach((e) => {
                      if (e.exerciseName && !templates.find((t) => t.name === e.exerciseName && t.bodyPart === workout.bodyPart)) {
                        addTemplate(e.exerciseName, workout.bodyPart)
                      }
                    })
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  保存动作为模板
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Rest timer display */}
      <div className={`fixed bottom-32 right-4 z-50 ${restTimerActive ? 'block' : 'hidden'}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="glass rounded-full p-4 text-center"
          style={{ borderColor: `${NEON}30`, boxShadow: `0 0 20px ${NEON}30` }}
        >
          <div className="text-2xl font-mono font-bold" style={{ color: NEON }}>
            {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
          </div>
          <button
            onClick={() => { if (intervalId) clearInterval(intervalId); setRestTimerActive(false) }}
            className="text-xs text-gray-400 mt-1"
          >
            停止
          </button>
        </motion.div>
      </div>

      {/* Rest timer trigger */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => (restTimerActive ? setRestTimerActive(false) : startRestTimer())}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
        style={{
          background: NEON,
          color: '#000',
          boxShadow: `0 0 24px ${NEON}60`,
        }}
      >
        {restTimerActive ? '⏹' : '⏱'}
      </motion.button>
    </div>
  )
}
