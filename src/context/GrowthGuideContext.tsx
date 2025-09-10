import { createContext, useState, useCallback, useMemo, type ReactNode } from "react"
import { toast } from "sonner"
import api from "@/services/api"

interface GrowthGuide {
  id: number
  monthRange: string
  ageDescription: string
  physicalDevelopment: string[]
  cognitiveSocial: string[]
  motorSkills: string[]
}

interface GrowthGuideContextType {
  growthGuide: GrowthGuide | null
  loading: boolean
  onGrowthGuideGet: (id: number) => Promise<void>
}

const GrowthGuideContext = createContext<GrowthGuideContextType | undefined>(
  undefined
)

export function GrowthGuideProvider({ children }: { children: ReactNode }) {
  const [growthGuide, setGrowthGuide] = useState<GrowthGuide | null>(null)
  const [loading, setLoading] = useState(false)

  const onGrowthGuideGet = useCallback(async (id: number) => {
    // Don't fetch if we already have this growth guide and it's not loading
    if (growthGuide?.id === id && !loading) {
      return
    }

    try {
      setLoading(true)
      const response = await api.get("/growth-guides/" + id)
      setGrowthGuide(response.data)
    } catch (error) {
      toast.error("Failed to fetch growth guide")
      console.log(error)
      setGrowthGuide(null)
    } finally {
      setLoading(false)
    }
  }, [growthGuide?.id, loading])

  const contextValue: GrowthGuideContextType = useMemo(() => ({
    growthGuide,
    loading,
    onGrowthGuideGet,
  }), [growthGuide, loading, onGrowthGuideGet])

  return (
    <GrowthGuideContext.Provider value={contextValue}>
      {children}
    </GrowthGuideContext.Provider>
  )
}

export default GrowthGuideContext
