import { useContext, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TbMoodKid } from "react-icons/tb"
import BabyContext from "@/context/BabyContext"
import GrowthGuideContext from "@/context/GrowthGuideContext"
import { calculateAgeInMonths } from "@/lib/utils"

export function CardGrowthGuide() {
  const babyCtx = useContext(BabyContext)
  const growthGuideCtx = useContext(GrowthGuideContext)

  // Memoize the baby months calculation to prevent recalculation on every render
  const babyMonths = useMemo(() => {
    if (!babyCtx?.currentBaby?.dateOfBirth) return null
    return calculateAgeInMonths(babyCtx.currentBaby.dateOfBirth)
  }, [babyCtx?.currentBaby?.dateOfBirth])

  // Memoize the growth guide ID to prevent unnecessary API calls
  const growthGuideId = useMemo(() => {
    if (babyMonths === null) return null
    return Math.min(babyMonths, 29)
  }, [babyMonths])

  useEffect(() => {
    if (growthGuideId !== null && growthGuideCtx?.onGrowthGuideGet) {
      growthGuideCtx.onGrowthGuideGet(growthGuideId)
    }
  }, [growthGuideId, growthGuideCtx?.onGrowthGuideGet])

  if (!babyCtx?.currentBaby?.dateOfBirth || babyMonths === null) {
    return null
  }

  // Don't show the card if baby is older than 29 months (no growth guide available)
  if (babyMonths > 29) {
    return null
  }

  if (growthGuideCtx?.loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <TbMoodKid className="text-primary size-5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!growthGuideCtx?.growthGuide) {
    return null
  }

  const { growthGuide } = growthGuideCtx

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <TbMoodKid className="text-primary size-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">Growth Guide</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {growthGuide.monthRange}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {growthGuide.ageDescription}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Physical Development
          </h4>
          <ul className="space-y-2 ml-4">
            {growthGuide.physicalDevelopment.map((item, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1.5 size-1.5 rounded-full bg-current flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Cognitive & Social
          </h4>
          <ul className="space-y-2 ml-4">
            {growthGuide.cognitiveSocial.map((item, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-1.5 size-1.5 rounded-full bg-current flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            Motor Skills
          </h4>
          <ul className="space-y-2 ml-4">
            {growthGuide.motorSkills.map((item, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-purple-500 mt-1.5 size-1.5 rounded-full bg-current flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}