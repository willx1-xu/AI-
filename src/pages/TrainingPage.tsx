import { useState, useMemo } from 'react'
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
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="text-cyan-400 text-lg px-2">&lt;</button>
        <span className="text-sm text-gray-300">
          {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="text-cyan-400 text-lg px-2">&gt;</button>
      </div>

      {/* Day selector */}
      <div className="flex px-1 py-2 bg-gray-900/80 border-b border-gray-800">
        {weekDates.map((date) => {
          const isToday = date === todayStr()
          const isSelected = date === selectedDate
          const hasWorkout = getWorkoutsByDate(date).length > 0
          const d = new Date(date)
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-1 flex flex-col items-center py-1 rounded-lg text-xs transition-colors ${
                isSelected ? 'bg-cyan-500/20 text-cyan-400' : isToday ? 'text-white' : 'text-gray-400'
              }`}
            >
              <span>{DAY_LABELS[d.getDay()]}</span>
              <span className="text-sm font-medium">{formatDate(date)}</span>
              {hasWorkout && <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
            </button>
          )
        })}
      </div>

      {/* Selected day content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{selectedDate} 训练记录</h2>
        </div>

        {/* Body part selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {BODY_PARTS.map((bp) => (
            <button
              key={bp}
              onClick={() => setSelectedBodyPart(bp === selectedBodyPart ? '' : bp)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                bp === selectedBodyPart ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-300'
              }`}
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
            className="px-3 py-1.5 rounded-full text-sm bg-cyan-500/30 text-cyan-400 disabled:opacity-30"
          >
            + 添加训练
          </button>
        </div>

        {/* Workouts for selected date */}
        {dayWorkouts.length === 0 && (
          <p className="text-gray-500 text-center py-8">选择部位后点击"+ 添加训练"开始记录</p>
        )}

        {dayWorkouts.map((workout: Workout) => (
          <div key={workout.id} className="mb-4 bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-cyan-400">{workout.bodyPart}</h3>
              <button
                onClick={() => removeWorkout(workout.id)}
                className="text-red-400 text-xs"
              >
                删除
              </button>
            </div>

            {/* Templates quick-add */}
            {getTemplatesByBodyPart(workout.bodyPart).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {getTemplatesByBodyPart(workout.bodyPart).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAddTemplateQuick(workout.id, t.name)}
                    className="px-2 py-0.5 text-xs bg-gray-700 rounded-full text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400"
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
            )}

            {/* Exercises */}
            {workout.exercises.map((ex: Exercise) => (
              <div key={ex.id} className="flex items-center gap-2 py-1.5 border-b border-gray-700/50 last:border-0">
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
                  className="w-10 bg-gray-700 rounded text-center text-sm text-white"
                  placeholder="组"
                />
                <span className="text-gray-600 text-xs">组</span>
                <input
                  type="number"
                  value={ex.reps}
                  onChange={(e) => updateExercise(workout.id, ex.id, { reps: parseInt(e.target.value) || 0 })}
                  className="w-10 bg-gray-700 rounded text-center text-sm text-white"
                  placeholder="次"
                />
                <span className="text-gray-600 text-xs">次</span>
                <input
                  type="number"
                  value={ex.weightKg || ''}
                  onChange={(e) => updateExercise(workout.id, ex.id, { weightKg: parseFloat(e.target.value) || 0 })}
                  className="w-14 bg-gray-700 rounded text-center text-sm text-white"
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
              className="mt-2 text-xs text-cyan-400 py-1"
            >
              + 添加动作
            </button>

            {/* Save as template */}
            {workout.exercises.some((e) => e.exerciseName) && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => {
                    workout.exercises.forEach((e) => {
                      if (e.exerciseName && !templates.find((t) => t.name === e.exerciseName && t.bodyPart === workout.bodyPart)) {
                        addTemplate(e.exerciseName, workout.bodyPart)
                      }
                    })
                  }}
                  className="text-xs text-gray-500 hover:text-cyan-400"
                >
                  保存动作为模板
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rest timer display */}
      <div className={`fixed bottom-16 right-4 z-40 ${restTimerActive ? 'block' : 'hidden'}`}>
        <div className="bg-gray-800/95 backdrop-blur rounded-full p-4 border border-gray-700 shadow-lg text-center">
          <div className="text-2xl font-mono font-bold text-cyan-400">
            {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
          </div>
          <button onClick={() => { if (intervalId) clearInterval(intervalId); setRestTimerActive(false) }} className="text-xs text-gray-400 mt-1">停止</button>
        </div>
      </div>

      {/* Rest timer trigger button */}
      <button
        onClick={() => (restTimerActive ? setRestTimerActive(false) : startRestTimer())}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-cyan-500 text-black rounded-full flex items-center justify-center text-sm font-bold shadow-lg active:scale-95 transition-transform"
      >
        {restTimerActive ? '⏹' : '⏱'}
      </button>
    </div>
  )
}
