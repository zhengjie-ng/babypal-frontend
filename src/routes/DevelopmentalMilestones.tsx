import { useContext, useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TbMoodKid } from "react-icons/tb"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import BabyContext from "@/context/BabyContext"
import { calculateAgeInMonths } from "@/lib/utils"
import api from "@/services/api"
import { toast } from "sonner"

interface GrowthGuide {
  id: number
  monthRange: string
  ageDescription: string
  physicalDevelopment: string[]
  cognitiveSocial: string[]
  motorSkills: string[]
}

function DevelopmentalMilestones() {
  const babyCtx = useContext(BabyContext)
  const [growthGuides, setGrowthGuides] = useState<GrowthGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  // Calculate current baby's age in months
  const currentBabyMonths = useMemo(() => {
    if (!babyCtx?.currentBaby?.dateOfBirth) return null
    return calculateAgeInMonths(babyCtx.currentBaby.dateOfBirth)
  }, [babyCtx?.currentBaby?.dateOfBirth])

  // Filter growth guides based on selected month
  const filteredGrowthGuides = useMemo(() => {
    if (selectedMonth === "all") return growthGuides
    if (selectedMonth === "current") {
      return currentBabyMonths !== null 
        ? growthGuides.filter(guide => guide.id === currentBabyMonths)
        : growthGuides
    }
    return growthGuides.filter(guide => guide.id === parseInt(selectedMonth))
  }, [growthGuides, selectedMonth, currentBabyMonths])

  // Generate dropdown options
  const monthOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All Months" },
    ]
    
    if (currentBabyMonths !== null && babyCtx?.currentBaby) {
      options.push({ 
        value: "current", 
        label: `Current Age (${currentBabyMonths} months)` 
      })
    }

    // Add individual month options
    growthGuides.forEach(guide => {
      options.push({
        value: guide.id.toString(),
        label: `Month ${guide.id} - ${guide.ageDescription}`
      })
    })

    return options
  }, [growthGuides, currentBabyMonths, babyCtx?.currentBaby])

  useEffect(() => {
    const fetchAllGrowthGuides = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get("/growth-guides")
        setGrowthGuides(response.data || [])
      } catch (error) {
        console.error("Error fetching growth guides:", error)
        setError("Failed to load developmental milestones. Please try again later.")
        toast.error("Failed to load developmental milestones")
      } finally {
        setLoading(false)
      }
    }

    fetchAllGrowthGuides()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-80 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, sectionIndex) => (
                    <div key={sectionIndex}>
                      <Skeleton className="h-4 w-28 mb-2" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Developmental Milestones</h1>
            <p className="text-muted-foreground text-sm sm:text-base px-4">
              Track your baby's growth and development through each month of their first years
            </p>
            {currentBabyMonths !== null && babyCtx?.currentBaby && (
              <p className="text-sm text-primary font-medium">
                {babyCtx.currentBaby.name} is currently {currentBabyMonths} month{currentBabyMonths !== 1 ? 's' : ''} old
              </p>
            )}
          </div>
          
          {/* Month Filter Dropdown */}
          <div className="max-w-sm mx-auto px-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Growth Guides Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
          {filteredGrowthGuides.map((guide) => {
            const isCurrentBabyAge = currentBabyMonths !== null && guide.id === currentBabyMonths
            return (
            <Card 
              key={guide.id} 
              className={`w-full hover:shadow-lg transition-all ${
                isCurrentBabyAge 
                  ? 'ring-2 ring-primary border-primary shadow-lg' 
                  : 'hover:shadow-lg'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <TbMoodKid className="text-primary size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold">{guide.ageDescription}</CardTitle>
                      {isCurrentBabyAge && (
                        <Badge variant="default" className="text-xs">
                          Current Age
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={isCurrentBabyAge ? "default" : "secondary"} 
                      className="text-xs mt-1"
                    >
                      {guide.monthRange}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Physical Development */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    Physical Development
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {guide.physicalDevelopment.map((item, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1 size-1 rounded-full bg-current flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cognitive & Social */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Cognitive & Social
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {guide.cognitiveSocial.map((item, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1 size-1 rounded-full bg-current flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Motor Skills */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    Motor Skills
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {guide.motorSkills.map((item, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-purple-500 mt-1 size-1 rounded-full bg-current flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {!loading && (
          <>
            {growthGuides.length === 0 ? (
              <div className="text-center py-12">
                <TbMoodKid className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No milestones available</h3>
                <p className="mt-2 text-muted-foreground">
                  Developmental milestones will appear here when available.
                </p>
              </div>
            ) : filteredGrowthGuides.length === 0 ? (
              <div className="text-center py-12">
                <TbMoodKid className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No milestones for selected month</h3>
                <p className="mt-2 text-muted-foreground">
                  Try selecting a different month or view all available milestones.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default DevelopmentalMilestones