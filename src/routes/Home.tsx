import { CardBabyProfile } from "@/components/card-baby-profile"
import { CardTimeline } from "@/components/card-timeline"
import { EmptyBabyState } from "@/components/empty-baby-state"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"

function Home() {
  const babyCtx = useContext(BabyContext)

  if (!babyCtx?.currentBaby) {
    return <EmptyBabyState />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-40 md:grid-cols-[350px_1fr]">
        <CardBabyProfile />
        <CardTimeline />
      </div>
    </div>
  )
}

export default Home
