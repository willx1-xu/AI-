import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDietStore } from '../stores/useDietStore'
import { usePlanStore } from '../stores/usePlanStore'

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', emoji: '🌅' },
  { key: 'lunch', label: '午餐', emoji: '☀️' },
  { key: 'dinner', label: '晚餐', emoji: '🌙' },
  { key: 'snack', label: '加餐', emoji: '🍎' },
] as const

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const NEON = '#ff6b35'

export default function DietPage() {
  const [selectedDate] = useState(todayStr())
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [servingGrams, setServingGrams] = useState(100)
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false)
  const [customFood, setCustomFood] = useState({ name: '', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 })

  const {
    foods, dailyCalorieTarget,
    loadPresetFoods, addCustomFood, addEntry, removeEntry,
    getEntriesByDate, getDailyTotal, setDailyCalorieTarget,
  } = useDietStore()

  const activePlan = usePlanStore((s) => s.activePlan)

  useEffect(() => {
    loadPresetFoods()
  }, [loadPresetFoods])

  useEffect(() => {
    if (activePlan) {
      setDailyCalorieTarget(activePlan.dailyCalorieTarget)
    }
  }, [activePlan, setDailyCalorieTarget])

  const dailyTotal = getDailyTotal(selectedDate)
  const todayEntries = getEntriesByDate(selectedDate)

  const filteredFoods = foods.filter((f) =>
    searchQuery ? f.name.includes(searchQuery) : true,
  )

  const meals = MEAL_TYPES.map((mt) => ({
    ...mt,
    entries: todayEntries.filter((e) => e.mealType === mt.key),
  }))

  const handleAdd = () => {
    const food = foods.find((f) => f.id === selectedFoodId)
    if (!food) return
    addEntry({
      date: selectedDate,
      mealType: selectedMeal,
      foodId: food.id,
      foodName: food.name,
      servingGrams,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    })
    setShowAddForm(false)
    setSelectedFoodId('')
    setServingGrams(100)
  }

  const caloriePercent = dailyCalorieTarget > 0
    ? Math.min(100, Math.round((dailyTotal.calories / dailyCalorieTarget) * 100))
    : 0

  const overTarget = dailyTotal.calories > dailyCalorieTarget && dailyCalorieTarget > 0

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Daily summary */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold" style={{ color: NEON }}>今日饮食</h2>
          <span className="text-sm text-gray-500">{selectedDate}</span>
        </div>

        {/* Calorie progress */}
        <div className="glass-card p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">热量摄入</span>
            <span style={{ color: overTarget ? '#ef4444' : NEON }}>
              {dailyTotal.calories} / {dailyCalorieTarget} kcal
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, caloriePercent)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: overTarget
                  ? '#ef4444'
                  : `linear-gradient(90deg, ${NEON}, #ff9f6b)`,
                boxShadow: `0 0 10px ${overTarget ? '#ef4444' : NEON}40`,
              }}
            />
          </div>
        </div>

        {/* Macro cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: '蛋白质', value: dailyTotal.protein, unit: 'g', color: '#f97316' },
            { label: '碳水', value: dailyTotal.carbs, unit: 'g', color: '#eab308' },
            { label: '脂肪', value: dailyTotal.fat, unit: 'g', color: '#ec4899' },
          ].map((m) => (
            <div key={m.label} className="glass-card p-3 text-center">
              <span className="text-xs text-gray-400">{m.label}</span>
              <div className="font-bold text-lg mt-1" style={{ color: m.color }}>{m.value}<span className="text-xs"> {m.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal sections */}
      <div className="flex-1 px-4 pb-4 space-y-3">
        {meals.map((meal) => (
          <div key={meal.key} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">
                {meal.emoji} {meal.label}
              </h3>
              <button
                onClick={() => { setSelectedMeal(meal.key); setShowAddForm(true) }}
                className="text-sm font-medium transition-colors"
                style={{ color: NEON }}
              >
                + 添加
              </button>
            </div>
            {meal.entries.length === 0 ? (
              <p className="text-gray-600 text-xs">暂无记录</p>
            ) : (
              meal.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-sm text-white">{entry.foodName}</span>
                    <span className="text-xs text-gray-500 ml-2">{entry.servingGrams}g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono" style={{ color: NEON }}>{entry.calories} kcal</span>
                    <button onClick={() => removeEntry(entry.id)} className="text-red-400 text-xs">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Add food modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowAddForm(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass rounded-t-3xl w-full max-h-[80%] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: `${NEON}20` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">添加食物到{MEAL_TYPES.find((m) => m.key === selectedMeal)?.label}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 text-lg">&times;</button>
            </div>

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索食物..."
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 mb-3 outline-none border border-white/5 focus:border-white/20 transition-colors"
            />

            <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => { setSelectedFoodId(food.id); setSearchQuery('') }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm flex justify-between transition-all"
                  style={
                    selectedFoodId === food.id
                      ? { background: `${NEON}20`, color: NEON }
                      : { background: 'rgba(255,255,255,0.03)', color: '#d1d5db' }
                  }
                >
                  <span>{food.name}</span>
                  <span className="text-gray-500">{food.caloriesPer100g} kcal/100g</span>
                </button>
              ))}
            </div>

            {selectedFoodId && (
              <div className="mb-4">
                <label className="text-xs text-gray-400">份量 (g)</label>
                <input
                  type="number"
                  value={servingGrams}
                  onChange={(e) => setServingGrams(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none border border-white/5"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!selectedFoodId}
                className="flex-1 py-3 rounded-xl font-semibold text-base transition-all"
                style={{
                  background: selectedFoodId ? NEON : 'rgba(255,255,255,0.05)',
                  color: selectedFoodId ? '#000' : '#4b5563',
                  opacity: selectedFoodId ? 1 : 0.5,
                }}
              >
                添加
              </button>
              <button
                onClick={() => setShowCustomFoodForm(!showCustomFoodForm)}
                className="px-4 py-3 rounded-xl text-sm transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}
              >
                自定义
              </button>
            </div>

            {showCustomFoodForm && (
              <div className="mt-4 p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <input value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })} placeholder="食物名称" className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['热量/100g', 'caloriesPer100g'],
                    ['蛋白质/100g', 'proteinPer100g'],
                    ['碳水/100g', 'carbsPer100g'],
                    ['脂肪/100g', 'fatPer100g'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400">{label}</label>
                      <input
                        type="number"
                        value={customFood[key as keyof typeof customFood] || ''}
                        onChange={(e) => setCustomFood({ ...customFood, [key]: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (customFood.name && customFood.caloriesPer100g > 0) {
                      addCustomFood(customFood)
                      setCustomFood({ name: '', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 })
                      setShowCustomFoodForm(false)
                    }
                  }}
                  className="w-full py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: `${NEON}20`, color: NEON }}
                >
                  保存自定义食物
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
