import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PlanGoal = 'bulk' | 'cut'

export interface Plan {
  id: string
  goal: PlanGoal
  startDate: string
  endDate: string
  startWeightKg: number
  targetWeightKg: number
  dailyCalorieTarget: number
  activityLevel: number
  isActive: boolean
}

interface PlanState {
  plans: Plan[]
  activePlan: Plan | null

  createPlan: (plan: Omit<Plan, 'id' | 'isActive'>) => void
  deactivatePlan: (id: string) => void
  getActivePlan: () => Plan | null
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      activePlan: null,

      createPlan(plan) {
        const newPlan: Plan = {
          ...plan,
          id: `plan-${Date.now()}`,
          isActive: true,
        }
        set((s) => ({
          plans: [...s.plans.map((p) => ({ ...p, isActive: false })), newPlan],
          activePlan: newPlan,
        }))
      },

      deactivatePlan(id) {
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
          activePlan: s.activePlan?.id === id ? null : s.activePlan,
        }))
      },

      getActivePlan() {
        return get().activePlan
      },
    }),
    { name: 'fittrack-plans' },
  ),
)
