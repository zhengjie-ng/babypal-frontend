import { CardBabyProfile } from "@/components/card-baby-profile"
import { CardTimeline } from "@/components/card-timeline"
import { CardGrowthGuide } from "@/components/card-growth-guide"
import { EmptyBabyState } from "@/components/empty-baby-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"

function Home() {
  const babyCtx = useContext(BabyContext)

  if (!babyCtx?.currentBaby) {
    return <EmptyBabyState />
  }

  if (babyCtx?.loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Baby Profile & Growth Guide Skeletons */}
          <div className="xl:w-[420px] xl:flex-shrink-0">
            <div className="space-y-6">
              <div className="rounded-lg border p-6 space-y-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Timeline Skeleton */}
          <div className="xl:flex-1 min-w-0">
            <div className="space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column - Baby Profile & Growth Guide */}
        <div className="xl:w-[420px] xl:flex-shrink-0">
          <div className="space-y-6">
            <CardBabyProfile />
            <CardGrowthGuide />
          </div>
        </div>
        
        {/* Right Column - Activity Timeline */}
        <div className="xl:flex-1 min-w-0">
          <CardTimeline />
        </div>
      </div>
    </div>
  )
}

export default Home
