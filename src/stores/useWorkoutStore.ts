import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Exercise {
  id: string
  exerciseName: string
  sets: number
  reps: number
  weightKg: number
}

export interface Workout {
  id: string
  date: string            // YYYY-MM-DD
  bodyPart: string
  exercises: Exercise[]
}

export interface ExerciseTemplate {
  id: string
  name: string
  bodyPart: string
}

interface WorkoutState {
  workouts: Workout[]
  templates: ExerciseTemplate[]
  restTimerSeconds: number

  getWorkoutsByDate: (date: string) => Workout[]
  addWorkout: (date: string, bodyPart: string) => Workout
  removeWorkout: (id: string) => void
  addExercise: (workoutId: string, exercise: Omit<Exercise, 'id'>) => void
  removeExercise: (workoutId: string, exerciseId: string) => void
  updateExercise: (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => void
  addTemplate: (name: string, bodyPart: string) => void
  removeTemplate: (id: string) => void
  getTemplatesByBodyPart: (bodyPart: string) => ExerciseTemplate[]
  setRestTimer: (seconds: number) => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      templates: [],
      restTimerSeconds: 90,

      getWorkoutsByDate(date) {
        return get().workouts.filter((w) => w.date === date)
      },

      addWorkout(date, bodyPart) {
        const w: Workout = {
          id: `wo-${Date.now()}`,
          date,
          bodyPart,
          exercises: [],
        }
        set((s) => ({ workouts: [...s.workouts, w] }))
        return w
      },

      removeWorkout(id) {
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) }))
      },

      addExercise(workoutId, exercise) {
        const ex: Exercise = { ...exercise, id: `ex-${Date.now()}` }
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId ? { ...w, exercises: [...w.exercises, ex] } : w,
          ),
        }))
      },

      removeExercise(workoutId, exerciseId) {
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId
              ? { ...w, exercises: w.exercises.filter((e) => e.id !== exerciseId) }
              : w,
          ),
        }))
      },

      updateExercise(workoutId, exerciseId, updates) {
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId
              ? {
                  ...w,
                  exercises: w.exercises.map((e) =>
                    e.id === exerciseId ? { ...e, ...updates } : e,
                  ),
                }
              : w,
          ),
        }))
      },

      addTemplate(name, bodyPart) {
        const t: ExerciseTemplate = { id: `tmpl-${Date.now()}`, name, bodyPart }
        set((s) => ({ templates: [...s.templates, t] }))
      },

      removeTemplate(id) {
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
      },

      getTemplatesByBodyPart(bodyPart) {
        return get().templates.filter((t) => t.bodyPart === bodyPart)
      },

      setRestTimer(seconds) {
        set({ restTimerSeconds: seconds })
      },
    }),
    { name: 'fittrack-workouts' },
  ),
)
