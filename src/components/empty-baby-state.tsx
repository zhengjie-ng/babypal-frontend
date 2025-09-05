import { AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { DialogBabyAdd } from "@/components/dialog-baby-add"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"

export function EmptyBabyState() {
  const babyCtx = useContext(BabyContext)
  const hasBabies = babyCtx?.babies && babyCtx.babies.length > 0

  if (hasBabies && !babyCtx?.currentBaby) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Alert variant="default" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>No baby selected</AlertTitle>
          <AlertDescription>
            Please select a baby from the navigation menu to view their
            information.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link to="#baby-selector" className="mt-2">
            Select Baby
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Alert variant="default" className="max-w-md">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Welcome to BabyPal!</AlertTitle>
        <AlertDescription>
          Get started by adding your first baby. You'll be able to track their
          growth, daily activities, and important milestones.
        </AlertDescription>
      </Alert>
      <div className="mt-2">
        <DialogBabyAdd />
      </div>
    </div>
  )
}
