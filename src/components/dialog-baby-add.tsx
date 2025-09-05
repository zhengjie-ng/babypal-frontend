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
import { CalendarIcon, PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { useContext, useState } from "react"
import BabyContext from "@/context/BabyContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

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
})

type FormData = z.infer<typeof formSchema>

export function DialogBabyAdd() {
  const [date, setDate] = useState<Date>()
  const babyCtx = useContext(BabyContext)
  const form = useForm<FormData>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      time: undefined,
      weight: 0,
      height: 0,
      head: 0,
    },
  })

  const handleSubmit = async (data: FormData) => {
    // Use today's date if no date is selected
    const selectedDate = date || new Date()

    // Check if date is in the future
    if (selectedDate > new Date()) {
      toast.error("Date of birth cannot be in the future")
      return
    }

    // Create date of birth with or without time
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

    // Format date to ISO string but preserve local time
    const localISOString = new Date(
      dateOfBirth.getTime() - dateOfBirth.getTimezoneOffset() * 60000
    ).toISOString()

    try {
      await babyCtx?.onBabyAdd({
        name: data.name,
        gender: data.gender || "",
        dateOfBirth: localISOString,
        weight: data.weight || 0,
        height: data.height || 0,
        headCircumference: data.head || 0,
      })

      toast.success("Baby added successfully!")
      form.reset()
      setDate(undefined)
    } catch (error) {
      toast.error("Failed to add baby")
      console.error("Error adding baby:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PlusCircle className="size-4" />
          Add Baby
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Baby</DialogTitle>
          <DialogDescription>
            Add baby information here. Click Add Baby when you&apos;re done.
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
            <Select onValueChange={(value) => form.setValue("gender", value)}>
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
                  defaultValue={0}
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
                  defaultValue={0}
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
                  defaultValue={0}
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
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Baby</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
