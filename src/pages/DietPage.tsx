import { useState, useEffect } from 'react'
import { useDietStore } from '../stores/useDietStore'
import { usePlanStore } from '../stores/usePlanStore'

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snack', label: '加餐' },
] as const

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Daily summary */}
      <div className="p-4 bg-gray-900/80">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">今日饮食</h2>
          <span className="text-sm text-gray-400">{selectedDate}</span>
        </div>

        {/* Calorie progress */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>热量摄入</span>
            <span className={dailyTotal.calories > dailyCalorieTarget ? 'text-red-400' : 'text-cyan-400'}>
              {dailyTotal.calories} / {dailyCalorieTarget} kcal
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${caloriePercent > 100 ? 'bg-red-500' : 'bg-cyan-500'}`}
              style={{ width: `${Math.min(100, caloriePercent)}%` }}
            />
          </div>
        </div>

        {/* Macro cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '蛋白质', value: dailyTotal.protein, unit: 'g', color: 'text-orange-400' },
            { label: '碳水', value: dailyTotal.carbs, unit: 'g', color: 'text-yellow-400' },
            { label: '脂肪', value: dailyTotal.fat, unit: 'g', color: 'text-pink-400' },
          ].map((m) => (
            <div key={m.label} className="bg-gray-800/50 rounded-lg p-2 text-center">
              <span className="text-xs text-gray-400">{m.label}</span>
              <div className={`font-semibold ${m.color}`}>{m.value}<span className="text-xs"> {m.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal sections */}
      <div className="flex-1 p-4 space-y-3">
        {meals.map((meal) => (
          <div key={meal.key} className="bg-gray-800/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{meal.label}</h3>
              <button
                onClick={() => { setSelectedMeal(meal.key); setShowAddForm(true) }}
                className="text-cyan-400 text-sm"
              >
                + 添加
              </button>
            </div>
            {meal.entries.length === 0 ? (
              <p className="text-gray-600 text-xs">暂无记录</p>
            ) : (
              meal.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-1 border-b border-gray-700/30 last:border-0">
                  <div>
                    <span className="text-sm">{entry.foodName}</span>
                    <span className="text-xs text-gray-500 ml-2">{entry.servingGrams}g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-cyan-400">{entry.calories} kcal</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowAddForm(false)}>
          <div className="bg-gray-900 rounded-t-2xl w-full max-h-[80%] overflow-y-auto p-4 pb-safe" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">添加食物到{MEAL_TYPES.find((m) => m.key === selectedMeal)?.label}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400">关闭</button>
            </div>

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索食物..."
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 outline-none"
            />

            <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => { setSelectedFoodId(food.id); setSearchQuery('') }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between ${
                    selectedFoodId === food.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
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
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!selectedFoodId} className="flex-1 bg-cyan-500 text-black py-2 rounded-lg font-semibold disabled:opacity-30">
                添加
              </button>
              <button onClick={() => setShowCustomFoodForm(!showCustomFoodForm)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm">
                自定义食物
              </button>
            </div>

            {showCustomFoodForm && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg space-y-2">
                <input value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })} placeholder="食物名称" className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">热量/100g</label>
                    <input type="number" value={customFood.caloriesPer100g || ''} onChange={(e) => setCustomFood({ ...customFood, caloriesPer100g: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">蛋白质/100g</label>
                    <input type="number" value={customFood.proteinPer100g || ''} onChange={(e) => setCustomFood({ ...customFood, proteinPer100g: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">碳水/100g</label>
                    <input type="number" value={customFood.carbsPer100g || ''} onChange={(e) => setCustomFood({ ...customFood, carbsPer100g: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">脂肪/100g</label>
                    <input type="number" value={customFood.fatPer100g || ''} onChange={(e) => setCustomFood({ ...customFood, fatPer100g: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white outline-none" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (customFood.name && customFood.caloriesPer100g > 0) {
                      addCustomFood(customFood)
                      setCustomFood({ name: '', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 })
                      setShowCustomFoodForm(false)
                    }
                  }}
                  className="w-full bg-cyan-500/30 text-cyan-400 py-1 rounded text-sm"
                >
                  保存自定义食物
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
