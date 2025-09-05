import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"
import api from "@/services/api"
import axios from "axios"
import BabyContext from "./BabyContext"

const RecordContext = createContext<RecordContextType | undefined>(undefined)

interface Record {
  id?: number
  type: string
  subType: string | null
  startTime: string
  endTime: string | null
  note: string | null
  baby: { id: number }
}

interface RecordContextType {
  onRecordAdd: (recordData: Omit<Record, "id">) => Promise<Record>
  onRecordUpdate: (id: number, recordData: Partial<Record>) => Promise<Record>
  onRecordDelete: (id: number) => Promise<void>
  refreshRecords: () => Promise<void>
  lastUpdate: number
}

export function RecordProvider({ children }: { children: ReactNode }) {
  const babyCtx = useContext(BabyContext)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  const refreshRecords = async () => {
    if (!babyCtx?.updateCurrentBabyRecords) {
      console.warn("BabyContext not available for refreshing records")
      return
    }

    try {
      // This will refresh just the current baby's records
      await babyCtx.updateCurrentBabyRecords()
      // We'll only update the timestamp when a new record is added, not during refresh
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch records"
        toast.error(errorMessage)
      }
      throw error
    }
  }

  const onRecordAdd = async (recordData: unknown) => {
    try {
      const response = await api.post("/records", recordData)
      toast.success("Record added successfully!")
      await refreshRecords()
      setLastUpdate(Date.now()) // Update timestamp only after successful record addition
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to add record"
        toast.error(errorMessage)
        console.error("Record creation error:", {
          data: recordData,
          error: error.response?.data,
        })
      } else {
        toast.error("Failed to add record")
        console.error(error)
      }
      throw error
    }
  }

  const onRecordUpdate = async (id: number, recordData: Partial<Record>) => {
    try {
      const response = await api.put(`/records/${id}`, recordData)
      toast.success("Record updated successfully!")
      await refreshRecords()
      setLastUpdate(Date.now())
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update record"
        toast.error(errorMessage)
        console.error("Record update error:", {
          id,
          data: recordData,
          error: error.response?.data,
        })
      } else {
        toast.error("Failed to update record")
        console.error(error)
      }
      throw error
    }
  }

  const onRecordDelete = async (id: number) => {
    try {
      await api.delete(`/records/${id}`)
      toast.success("Record deleted successfully!")
      await refreshRecords()
      setLastUpdate(Date.now())
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to delete record"
        toast.error(errorMessage)
        console.error("Record deletion error:", {
          id,
          error: error.response?.data,
        })
      } else {
        toast.error("Failed to delete record")
        console.error(error)
      }
      throw error
    }
  }

  const contextValue: RecordContextType = {
    onRecordAdd,
    onRecordUpdate,
    onRecordDelete,
    refreshRecords,
    lastUpdate,
  }

  return (
    <RecordContext.Provider value={contextValue}>
      {children}
    </RecordContext.Provider>
  )
}

export default RecordContext
