import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, X, PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { useContext, useState, useRef } from "react"
import BabyContext from "@/context/BabyContext"
import AuthContext from "@/context/AuthContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { AiOutlineEdit } from "react-icons/ai"

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  gender: z.string().optional(),
  time: z.string().optional(),
  weight: z.number().min(0, "Weight must be 0 or greater").optional(),
  height: z.number().min(0, "Height must be 0 or greater").optional(),
  head: z.number().min(0, "Head circumference must be 0 or greater").optional(),
  newCaregiver: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function DialogBabyEdit() {
  const babyCtx = useContext(BabyContext)
  const authCtx = useContext(AuthContext)
  const currentBaby = babyCtx?.currentBaby
  const [caregivers, setCaregivers] = useState<string[]>(
    currentBaby?.caregivers || []
  )
  const [date, setDate] = useState<Date | undefined>(
    currentBaby ? new Date(currentBaby.dateOfBirth) : undefined
  )
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  const form = useForm<FormData>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentBaby?.name || "",
      gender: currentBaby?.gender || undefined,
      time: currentBaby
        ? new Date(currentBaby.dateOfBirth).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : undefined,
      weight: currentBaby?.weight || 0,
      height: currentBaby?.height || 0,
      head: currentBaby?.headCircumference || 0,
    },
  })

  const handleAddCaregiver = async () => {
    const newCaregiver = form.getValues("newCaregiver")?.toLowerCase()

    if (!newCaregiver) {
      toast.error("Please enter a username")
      return
    }

    // Don't allow duplicates
    if (caregivers.includes(newCaregiver)) {
      toast.error("This user is already a caregiver")
      form.setValue("newCaregiver", "")
      return
    }

    // Check if user exists
    try {
      const exists = await authCtx?.checkUserExists(newCaregiver)
      if (!exists) {
        toast.error(`User ${newCaregiver} not found`)
        return
      }

      setCaregivers([...caregivers, newCaregiver])
      form.setValue("newCaregiver", "")
    } catch (error) {
      //   toast.error("Failed to verify user")
      console.error("Error checking user:", error)
    }
  }

  const handleRemoveCaregiver = (caregiver: string) => {
    if (caregiver === authCtx?.currentUser?.username) {
      toast.error("You cannot remove yourself as a caregiver")
      return
    }
    setCaregivers(caregivers.filter((c) => c !== caregiver))
  }

  const handleSubmit = async (data: FormData) => {
    if (!currentBaby) return

    const selectedDate = date || new Date()

    if (selectedDate > new Date()) {
      toast.error("Date of birth cannot be in the future")
      return
    }

    const dateOfBirth = new Date(selectedDate)
    if (data.time) {
      const [hours, minutes] = data.time.split(":")
      dateOfBirth.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      if (dateOfBirth > new Date()) {
        toast.error("Time of birth cannot be in the future")
        return
      }
    } else {
      dateOfBirth.setHours(0, 0, 0, 0)
    }

    const localISOString = new Date(
      dateOfBirth.getTime() - dateOfBirth.getTimezoneOffset() * 60000
    ).toISOString()

    try {
      await babyCtx?.onBabyUpdate(currentBaby.id, {
        name: data.name,
        gender: data.gender || "",
        dateOfBirth: localISOString,
        weight: data.weight || 0,
        height: data.height || 0,
        headCircumference: data.head || 0,
        caregivers,
      })

      toast.success("Baby updated successfully!")
      dialogCloseRef.current?.click() // Close the dialog
    } catch (error) {
      toast.error("Failed to update baby")
      console.error("Error updating baby:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <AiOutlineEdit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Baby</DialogTitle>
          <DialogDescription>
            Edit baby information here. Click Save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              {...form.register("name")}
              id="name"
              placeholder="Enter baby's name"
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="gender">Gender</Label>
            <Select
              defaultValue={currentBaby?.gender}
              onValueChange={(value) => form.setValue("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="time">Time of Birth</Label>
            <Input
              {...form.register("time")}
              id="time"
              type="time"
              placeholder="Select time"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex items-center gap-2">
                <Input
                  {...form.register("weight", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                  })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
                <span className="text-muted-foreground text-sm">kg</span>
              </div>
              {form.formState.errors.weight && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.weight.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="height">Height</Label>
              <div className="flex items-center gap-2">
                <Input
                  {...form.register("height", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                  })}
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                />
                <span className="text-muted-foreground text-sm">cm</span>
              </div>
              {form.formState.errors.height && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.height.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="head">Head Circumference</Label>
              <div className="flex items-center gap-2">
                <Input
                  {...form.register("head", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                  })}
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                />
                <span className="text-muted-foreground text-sm">cm</span>
              </div>
              {form.formState.errors.head && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.head.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-3">
            <Label>Caregivers</Label>
            <div className="flex flex-wrap gap-2">
              {caregivers.map((caregiver) => (
                <div
                  key={caregiver}
                  className={cn(
                    "bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1",
                    caregiver === authCtx?.currentUser?.username &&
                      "border-primary/50 border"
                  )}
                >
                  <span className="text-sm capitalize">{caregiver}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCaregiver(caregiver)}
                    disabled={caregiver === authCtx?.currentUser?.username}
                    className={cn(
                      "hover:text-destructive size-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none"
                    )}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                {...form.register("newCaregiver")}
                placeholder="Add caregiver by username"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCaregiver}
              >
                <PlusCircle className="size-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose ref={dialogCloseRef} asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
