"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContext, useState } from "react"
import { PlusCircle, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import BabyContext from "@/context/BabyContext"
import MeasurementContext from "@/context/MeasurementContext"
import axios from "axios"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DialogMeasurementAdd() {
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [headCircumference, setHeadCircumference] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState(format(new Date(), "HH:mm"))

  const babyContext = useContext(BabyContext)
  const measurementContext = useContext(MeasurementContext)

  const currentBaby = babyContext?.currentBaby
  const onMeasurementAdd = measurementContext?.onMeasurementAdd

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!currentBaby) {
      toast.error("Please select a baby first")
      return
    }

    if (!onMeasurementAdd) {
      toast.error("Measurement context not available")
      return
    }

    try {
      // Combine date and time
      const measurementDate = new Date(date)
      const [hours, minutes] = time.split(":")
      measurementDate.setHours(parseInt(hours), parseInt(minutes))

      await onMeasurementAdd({
        weight: parseFloat(weight),
        height: parseFloat(height),
        headCircumference: parseFloat(headCircumference),
        time: measurementDate.toISOString(),
        baby: { id: currentBaby.id },
      })

      toast.success("Measurement added successfully")
      setOpen(false)
      setWeight("")
      setHeight("")
      setHeadCircumference("")
      setDate(new Date())
      setTime(format(new Date(), "HH:mm"))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Failed to add measurement")
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-5 w-5" /> Add Measurement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Measurement</DialogTitle>
          <DialogDescription>
            Add a new growth measurement for your baby. Enter the measurements
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headCircumference">Head Circumference (cm)</Label>
            <Input
              id="headCircumference"
              type="number"
              step="0.1"
              value={headCircumference}
              onChange={(e) => setHeadCircumference(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Measurement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
