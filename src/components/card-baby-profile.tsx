import { ImBin } from "react-icons/im"
import { TbMoodKid } from "react-icons/tb"
import { Button } from "@/components/ui/button"
import { formatDate, calculateAge, cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"
import AuthContext from "@/context/AuthContext"
import { toast } from "sonner"
import { DialogBabyEdit } from "./dialog-baby-edit"

export function CardBabyProfile() {
  const babyCtx = useContext(BabyContext)
  const authCtx = useContext(AuthContext)

  // Get gender-based colors
  const getGenderColors = () => {
    const gender = babyCtx?.currentBaby?.gender?.toLowerCase()
    
    if (gender === 'male') {
      return {
        bgColor: 'bg-blue-100 dark:bg-blue-950/30',
        iconColor: 'text-blue-600 dark:text-blue-400'
      }
    } else if (gender === 'female') {
      return {
        bgColor: 'bg-pink-100 dark:bg-pink-950/30',
        iconColor: 'text-pink-600 dark:text-pink-400'
      }
    } else {
      return {
        bgColor: 'bg-primary/10',
        iconColor: 'text-primary'
      }
    }
  }

  const { bgColor, iconColor } = getGenderColors()

  const handleDelete = async () => {
    if (!babyCtx?.currentBaby) return

    try {
      await babyCtx.onBabyDelete(babyCtx.currentBaby.id)
      toast.success("Baby deleted successfully")
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete baby")
      } else {
        toast.error("Failed to delete baby")
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className={cn("mx-auto mb-4 rounded-full p-4", bgColor)}>
          <TbMoodKid className={cn("size-24", iconColor)} />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {babyCtx?.currentBaby?.name}'s Profile
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Born
            </Label>
            <p className="font-medium">
              {babyCtx?.currentBaby?.dateOfBirth
                ? formatDate(babyCtx.currentBaby.dateOfBirth)
                : "Unknown"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Age
            </Label>
            <p className="font-medium">
              {babyCtx?.currentBaby?.dateOfBirth
                ? calculateAge(babyCtx.currentBaby.dateOfBirth)
                : "Unknown"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Gender
            </Label>
            <p className="font-medium capitalize">
              {babyCtx?.currentBaby?.gender || "Unknown"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Caregivers
            </Label>
            <p className="font-medium capitalize">
              {babyCtx?.currentBaby?.caregivers.join(", ") || "Unknown"}
            </p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-muted-foreground mb-4 text-sm font-medium">
            Measurements
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">
                Weight
              </Label>
              <p className="font-medium">
                {babyCtx?.currentBaby?.weight
                  ? `${babyCtx.currentBaby.weight} kg`
                  : "Unknown"}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">
                Height
              </Label>
              <p className="font-medium">
                {babyCtx?.currentBaby?.height
                  ? `${babyCtx.currentBaby.height} cm`
                  : "Unknown"}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">
                Head Circumference
              </Label>
              <p className="font-medium">
                {babyCtx?.currentBaby?.headCircumference
                  ? `${babyCtx.currentBaby.headCircumference} cm`
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <DialogBabyEdit />
        {babyCtx?.currentBaby?.owner === authCtx?.currentUser?.username && (
          <Button
            variant="outline"
            size="icon"
            className="hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <ImBin className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
