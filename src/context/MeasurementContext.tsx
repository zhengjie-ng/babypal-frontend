import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"
import api from "@/services/api"
import axios from "axios"
import BabyContext from "./BabyContext"

const MeasurementContext = createContext<MeasurementContextType | undefined>(
  undefined
)

interface Measurement {
  id?: number
  weight: number
  height: number
  headCircumference: number
  time: string
  baby: { id: number }
}

interface MeasurementContextType {
  onMeasurementAdd: (
    measurementData: Omit<Measurement, "id">
  ) => Promise<Measurement>
  refreshMeasurements: () => Promise<void>
  lastUpdate: number
}

export function MeasurementProvider({ children }: { children: ReactNode }) {
  const babyCtx = useContext(BabyContext)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  const refreshMeasurements = async () => {
    if (!babyCtx?.updateCurrentBabyRecords) {
      console.warn("BabyContext not available for refreshing measurements")
      return
    }

    try {
      // This will refresh just the current baby's measurements
      await babyCtx.updateCurrentBabyRecords()
      // We'll only update the timestamp when a new measurement is added, not during refresh
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch measurements"
        toast.error(errorMessage)
      }
      throw error
    }
  }

  const onMeasurementAdd = async (measurementData: Omit<Measurement, "id">) => {
    try {
      // Add the measurement
      const response = await api.post("/measurements", measurementData)
      const newMeasurement = response.data

      // Check if we should update the baby's current measurements
      if (!babyCtx?.currentBaby) {
        console.warn("No current baby found")
        return newMeasurement
      }

      const measurementDate = new Date(measurementData.time)
      // Get the latest measurement by sorting by date
      const currentBabyLastMeasurement = [
        ...(babyCtx.currentBaby.measurements || []),
      ].sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      )[0]
      const lastMeasurementDate = currentBabyLastMeasurement
        ? new Date(currentBabyLastMeasurement.time)
        : new Date(0)

      // If this is the latest measurement, update the baby's current measurements
      if (measurementDate > lastMeasurementDate) {
        try {
          await babyCtx.onBabyUpdate(babyCtx.currentBaby.id, {
            ...babyCtx.currentBaby,
            weight: measurementData.weight,
            height: measurementData.height,
            headCircumference: measurementData.headCircumference,
          })
        } catch (error) {
          console.error("Failed to update baby's current measurements:", error)
          // Don't throw here as the measurement was still added successfully
        }
      }

      toast.success("Measurement added successfully!")
      await refreshMeasurements()
      setLastUpdate(Date.now())
      return newMeasurement
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to add measurement"
        toast.error(errorMessage)
        console.error("Measurement creation error:", {
          data: measurementData,
          error: error.response?.data,
        })
      } else {
        toast.error("Failed to add measurement")
        console.error(error)
      }
      throw error
    }
  }

  const contextValue: MeasurementContextType = {
    onMeasurementAdd,
    refreshMeasurements,
    lastUpdate,
  }

  return (
    <MeasurementContext.Provider value={contextValue}>
      {children}
    </MeasurementContext.Provider>
  )
}

export default MeasurementContext
