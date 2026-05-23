import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BodyRecord {
  id: string
  date: string            // YYYY-MM-DD
  weightKg: number
  bodyFatPct: number
  muscleMassKg: number
  bmrKcal: number
}

interface BodyState {
  records: BodyRecord[]

  addOrUpdateRecord: (record: Omit<BodyRecord, 'id'>) => void
  getRecordByDate: (date: string) => BodyRecord | undefined
  getRecordsInRange: (startDate: string, endDate: string) => BodyRecord[]
  getAllRecords: () => BodyRecord[]
  getLatest: () => BodyRecord | undefined
  getBaseline: () => BodyRecord | undefined
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      records: [],

      addOrUpdateRecord(record) {
        set((s) => {
          const existing = s.records.findIndex((r) => r.date === record.date)
          if (existing >= 0) {
            const updated = [...s.records]
            updated[existing] = { ...record, id: updated[existing].id }
            return { records: updated }
          }
          const newRecord: BodyRecord = { ...record, id: `br-${Date.now()}` }
          return { records: [...s.records, newRecord].sort((a, b) => a.date.localeCompare(b.date)) }
        })
      },

      getRecordByDate(date) {
        return get().records.find((r) => r.date === date)
      },

      getRecordsInRange(startDate, endDate) {
        return get().records.filter((r) => r.date >= startDate && r.date <= endDate)
      },

      getAllRecords() {
        return get().records
      },

      getLatest() {
        const records = get().records
        return records.length > 0 ? records[records.length - 1] : undefined
      },

      getBaseline() {
        const records = get().records
        return records.length > 0 ? records[0] : undefined
      },
    }),
    { name: 'fittrack-body' },
  ),
)
