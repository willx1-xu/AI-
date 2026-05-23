import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { presetFoods, type PresetFood } from '../data/presetFoods'

export interface FoodItem extends PresetFood {
  id: string
  userId?: string
  isPreset: boolean
}

export interface DietEntry {
  id: string
  date: string               // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId: string
  foodName: string
  servingGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DietState {
  foods: FoodItem[]
  entries: DietEntry[]
  customFoods: FoodItem[]
  dailyCalorieTarget: number

  loadPresetFoods: () => void
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isPreset'>) => void
  addEntry: (entry: Omit<DietEntry, 'id'>) => void
  removeEntry: (id: string) => void
  getEntriesByDate: (date: string) => DietEntry[]
  getDailyTotal: (date: string) => { calories: number; protein: number; carbs: number; fat: number }
  setDailyCalorieTarget: (target: number) => void
}

function calcNutrient(per100g: number, grams: number): number {
  return Math.round(per100g * grams / 100 * 10) / 10
}

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      foods: [],
      entries: [],
      customFoods: [],
      dailyCalorieTarget: 2200,

      loadPresetFoods() {
        const existing = get().foods
        if (existing.length === 0) {
          const foodItems: FoodItem[] = presetFoods.map((f, i) => ({
            ...f,
            id: `preset-${i}`,
            isPreset: true,
          }))
          set({ foods: foodItems })
        }
      },

      addCustomFood(food) {
        const newFood: FoodItem = {
          ...food,
          id: `custom-${Date.now()}`,
          isPreset: false,
        }
        set((s) => ({
          customFoods: [...s.customFoods, newFood],
          foods: [...s.foods, newFood],
        }))
      },

      addEntry(entry) {
        const food = get().foods.find((f) => f.id === entry.foodId)
        if (!food) return
        const newEntry: DietEntry = {
          ...entry,
          id: `entry-${Date.now()}`,
          calories: calcNutrient(food.caloriesPer100g, entry.servingGrams),
          protein: calcNutrient(food.proteinPer100g, entry.servingGrams),
          carbs: calcNutrient(food.carbsPer100g, entry.servingGrams),
          fat: calcNutrient(food.fatPer100g, entry.servingGrams),
        }
        set((s) => ({ entries: [...s.entries, newEntry] }))
      },

      removeEntry(id) {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
      },

      getEntriesByDate(date) {
        return get().entries.filter((e) => e.date === date)
      },

      getDailyTotal(date) {
        const entries = get().entries.filter((e) => e.date === date)
        return entries.reduce(
          (acc, e) => ({
            calories: Math.round((acc.calories + e.calories) * 10) / 10,
            protein: Math.round((acc.protein + e.protein) * 10) / 10,
            carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
            fat: Math.round((acc.fat + e.fat) * 10) / 10,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        )
      },

      setDailyCalorieTarget(target) {
        set({ dailyCalorieTarget: target })
      },
    }),
    { name: 'fittrack-diet' },
  ),
)
