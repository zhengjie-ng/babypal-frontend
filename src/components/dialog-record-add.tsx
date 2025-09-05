import { useContext, useState } from "react"
import { format, isAfter } from "date-fns"
import { CalendarIcon, PlusCircle } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import RecordContext from "@/context/RecordContext"
import BabyContext from "@/context/BabyContext"

const formSchema = z
  .object({
    type: z.string().min(1, "Type is required"),
    subType: z.string().optional(),
    startDate: z.date(),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.date().optional(),
    endTime: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Type is required",
        path: ["type"],
      })
    }

    if (!data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is required",
        path: ["startDate"],
      })
    }

    if (!data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time is required",
        path: ["startTime"],
      })
    }

    if (data.endDate && data.endTime) {
      const startDateTime = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate(),
        ...data.startTime.split(":").map(Number)
      )

      const endDateTime = new Date(
        data.endDate.getFullYear(),
        data.endDate.getMonth(),
        data.endDate.getDate(),
        ...data.endTime.split(":").map(Number)
      )

      if (!isAfter(endDateTime, startDateTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date/time must be after start date/time",
          path: ["endDate"],
        })
      }
    }
  })
  .refine(
    (data) => {
      if (!data.endDate || !data.endTime) return true // Skip validation if end date/time not provided

      const startDateTime = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate(),
        ...data.startTime.split(":").map(Number)
      )

      const endDateTime = new Date(
        data.endDate.getFullYear(),
        data.endDate.getMonth(),
        data.endDate.getDate(),
        ...(data.endTime?.split(":").map(Number) || [0, 0])
      )

      return isAfter(endDateTime, startDateTime)
    },
    {
      message: "End date/time must be after start date/time",
      path: ["endDate"],
    }
  )
export type FormData = z.infer<typeof formSchema>

export function DialogRecordAdd() {
  const recordCtx = useContext(RecordContext)
  const babyCtx = useContext(BabyContext)
  const [open, setOpen] = useState(false)
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      startDate: new Date(),
      startTime: format(new Date(), "HH:mm"),
      note: "",
    },
  })

  const type = watch("type")

  const onSubmit = async (data: FormData) => {
    try {
      // Convert form data to API format
      // Make sure we have a baby ID before proceeding
      if (!babyCtx?.currentBaby?.id) {
        toast.error("No baby selected. Please select a baby first.")
        return
      }

      const recordData = {
        type: data.type,
        subType: data.subType || null,
        startTime: (function () {
          const startDateTime = new Date(
            data.startDate.getFullYear(),
            data.startDate.getMonth(),
            data.startDate.getDate(),
            ...data.startTime.split(":").map(Number)
          )
          // Format date to ISO string but preserve local time
          return new Date(
            startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000
          ).toISOString()
        })(),
        endTime: (function () {
          if (!data.endDate || !data.endTime) return null
          const endDateTime = new Date(
            data.endDate.getFullYear(),
            data.endDate.getMonth(),
            data.endDate.getDate(),
            ...data.endTime.split(":").map(Number)
          )
          // Format date to ISO string but preserve local time
          return new Date(
            endDateTime.getTime() - endDateTime.getTimezoneOffset() * 60000
          ).toISOString()
        })(),
        note: data.note || null,
        baby: { id: babyCtx.currentBaby.id },
      }

      await recordCtx?.onRecordAdd(recordData)
      // Refresh records after successful addition
      await recordCtx?.refreshRecords()
      setOpen(false)
      reset()
    } catch {
      toast.error("Failed to add record")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-5 w-5" /> Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Record</DialogTitle>
          <DialogDescription>
            Fill in the details for the new record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select
                  value={watch("type")}
                  onValueChange={(value) => {
                    setValue("type", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                    // Clear subType when type changes
                    setValue("subType", "", {
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="diaper change">Diaper Change</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            {(type === "feeding" || type === "diaper change") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subType" className="text-right">
                  Sub Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={watch("subType")}
                    onValueChange={(value) => setValue("subType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub type" />
                    </SelectTrigger>
                    <SelectContent>
                      {type === "feeding" && (
                        <>
                          <SelectItem value="breastfeed">Breastfeed</SelectItem>
                          <SelectItem value="bottle">Bottle</SelectItem>
                          <SelectItem value="self">Self</SelectItem>
                        </>
                      )}
                      {type === "diaper change" && (
                        <>
                          <SelectItem value="wet">Wet</SelectItem>
                          <SelectItem value="solid">Solid</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("startDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("startDate") ? (
                        format(watch("startDate"), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch("startDate")}
                      onSelect={(date) =>
                        setValue("startDate", date || new Date())
                      }
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="startTime"
                  type="time"
                  value={watch("startTime")}
                  onChange={(e) => setValue("startTime", e.target.value)}
                  className="w-full"
                />
                {errors.startTime && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("endDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("endDate") ? (
                        format(watch("endDate") as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch("endDate")}
                      onSelect={(date) => setValue("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="endTime"
                  type="time"
                  value={watch("endTime") || ""}
                  onChange={(e) => setValue("endTime", e.target.value)}
                  className="w-full"
                />
                {errors.endTime && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="note"
                  placeholder="Add any additional notes here"
                  className="w-full"
                  value={watch("note") || ""}
                  onChange={(e) => setValue("note", e.target.value)}
                />
                {errors.note && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.note.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
