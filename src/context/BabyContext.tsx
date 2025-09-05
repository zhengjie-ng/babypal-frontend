import api from "@/services/api"
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from "react"
import AuthContext from "./AuthContext"

interface Measurement {
  id: number
  weight: number
  height: number
  headCircumference: number
  time: string
  baby: { id: number }
}

interface Baby {
  id: number
  name: string
  gender: string
  dateOfBirth: string
  weight: number
  height: number
  headCircumference: number
  caregivers: string[]
  owner: string
  records: Record<string, unknown>[]
  measurements: Measurement[]
}

interface BabyContextType {
  babies: Baby[]
  currentBaby: Baby | null
  fetchBabies: () => Promise<void>
  updateCurrentBabyRecords: () => Promise<void>
  onBabySelect: (babyId: number) => void
  onBabyAdd: (
    babyData: Omit<
      Baby,
      "id" | "owner" | "caregivers" | "records" | "measurements"
    >
  ) => Promise<void>
  onBabyDelete: (babyId: number) => Promise<void>
  onBabyUpdate: (
    babyId: number,
    babyData: Omit<Baby, "id" | "owner" | "records" | "measurements">
  ) => Promise<void>
}

const BabyContext = createContext<BabyContextType | null>(null)

export function BabyProvider({ children }: { children: ReactNode }) {
  const [babies, setBabies] = useState<Baby[]>([])
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null)
  const authCtx = useContext(AuthContext)

  const fetchBabies = useCallback(async () => {
    try {
      const response = await api.get("/babies")
      setBabies(response.data)

      // If there are babies and no baby is currently selected, select the first one
      if (response.data.length > 0 && !currentBaby) {
        setCurrentBaby(response.data[0])
      }
    } catch (error) {
      console.error("Error fetching babies:", error)
    }
  }, [currentBaby])

  useEffect(() => {
    // Only fetch babies if we have a token
    if (authCtx?.token) {
      fetchBabies()
    } else {
      // Clear babies and current baby if there's no token
      setBabies([])
      setCurrentBaby(null)
    }
  }, [authCtx?.token, fetchBabies])

  const onBabySelect = (babyId: number) => {
    const selectedBaby = babies.find((baby) => baby.id === babyId)
    setCurrentBaby(selectedBaby || null)
  }

  const updateCurrentBabyRecords = async () => {
    if (!currentBaby?.id) return

    try {
      const response = await api.get(`/babies/${currentBaby.id}`)
      const updatedBaby = response.data
      setCurrentBaby(updatedBaby)
      setBabies(
        babies.map((baby) => (baby.id === updatedBaby.id ? updatedBaby : baby))
      )
    } catch (error) {
      console.error("Error updating baby records:", error)
    }
  }

  const onBabyAdd = async (
    babyData: Omit<
      Baby,
      "id" | "owner" | "caregivers" | "records" | "measurements"
    >
  ) => {
    try {
      if (!authCtx?.currentUser?.username) {
        throw new Error("No authenticated user found")
      }

      const newBabyData = {
        ...babyData,
        owner: authCtx.currentUser.username,
        caregivers: [authCtx.currentUser.username],
        records: [],
        measurements: [],
      }

      const response = await api.post("/babies", newBabyData)
      const addedBaby = response.data

      setBabies((prevBabies) => [...prevBabies, addedBaby])
      setCurrentBaby(addedBaby)
    } catch (error) {
      console.error("Error adding baby:", error)
      throw error
    }
  }

  const onBabyDelete = async (babyId: number) => {
    try {
      if (!authCtx?.currentUser?.username) {
        throw new Error("No authenticated user found")
      }

      const babyToDelete = babies.find((baby) => baby.id === babyId)

      if (!babyToDelete) {
        throw new Error("Baby not found")
      }

      if (babyToDelete.owner !== authCtx.currentUser.username) {
        throw new Error(`Only ${babyToDelete.owner} can delete this baby`)
      }

      await api.delete(`/babies/${babyId}`)

      setBabies((prevBabies) => prevBabies.filter((baby) => baby.id !== babyId))
      if (currentBaby?.id === babyId) {
        setCurrentBaby(null)
      }
    } catch (error) {
      console.error("Error deleting baby:", error)
      throw error
    }
  }

  const onBabyUpdate = async (
    babyId: number,
    babyData: Omit<Baby, "id" | "owner" | "records" | "measurements">
  ) => {
    try {
      if (!authCtx?.currentUser?.username) {
        throw new Error("No authenticated user found")
      }

      const babyToUpdate = babies.find((baby) => baby.id === babyId)

      if (!babyToUpdate) {
        throw new Error("Baby not found")
      }

      if (babyToUpdate.owner !== authCtx.currentUser.username) {
        throw new Error(`Only ${babyToUpdate.owner} can update this baby`)
      }

      // Validate new caregivers
      const validatedCaregivers = []
      for (const caregiver of babyData.caregivers) {
        const exists = await authCtx?.checkUserExists(caregiver)
        if (!exists) {
          throw new Error(`User ${caregiver} not found`)
        }
        validatedCaregivers.push(caregiver)
      }

      // Make sure owner is always a caregiver
      if (!validatedCaregivers.includes(babyToUpdate.owner)) {
        validatedCaregivers.push(babyToUpdate.owner)
      }

      // Send update with validated caregivers
      const response = await api.put(`/babies/${babyId}`, {
        ...babyData,
        owner: babyToUpdate.owner,
        caregivers: validatedCaregivers,
      })

      const updatedBaby = response.data

      setBabies((prevBabies) =>
        prevBabies.map((baby) => (baby.id === babyId ? updatedBaby : baby))
      )
      setCurrentBaby(updatedBaby)
    } catch (error) {
      console.error("Error updating baby:", error)
      throw error
    }
  }

  const contextValue: BabyContextType = {
    babies,
    currentBaby,
    fetchBabies,
    updateCurrentBabyRecords,
    onBabySelect,
    onBabyAdd,
    onBabyDelete,
    onBabyUpdate,
  }

  return (
    <BabyContext.Provider value={contextValue}>{children}</BabyContext.Provider>
  )
}

export default BabyContext
