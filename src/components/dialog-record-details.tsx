import { useContext, useState, useEffect, useMemo } from "react"
import { format, isAfter } from "date-fns"
import { CalendarIcon, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import RecordContext from "@/context/RecordContext"

type Record = {
  id: number
  type: string
  subType: string | null
  startTime: string
  endTime: string | null
  note: string | null
  author: string
  createdAt: string
  updatedAt: string
}

interface RecordDialogProps {
  record: Record | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function RecordDialog({
  record,
  open,
  onOpenChange,
}: RecordDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const recordCtx = useContext(RecordContext)

  // Parse the dates for form initialization
  const startDateTime = useMemo(
    () => (record ? new Date(record.startTime) : null),
    [record]
  )
  const endDateTime = useMemo(
    () => (record?.endTime ? new Date(record.endTime) : null),
    [record]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: record?.type || "",
      subType: record?.subType || "",
      startDate: startDateTime || new Date(),
      startTime: startDateTime ? format(startDateTime, "HH:mm") : "",
      endDate: endDateTime || undefined,
      endTime: endDateTime ? format(endDateTime, "HH:mm") : undefined,
      note: record?.note || "",
    },
  })

  useEffect(() => {
    if (open && record) {
      form.reset({
        type: record.type,
        subType: record.subType || "",
        startDate: startDateTime || new Date(),
        startTime: startDateTime ? format(startDateTime, "HH:mm") : "",
        endDate: endDateTime || undefined,
        endTime: endDateTime ? format(endDateTime, "HH:mm") : undefined,
        note: record.note || "",
      })
    }
  }, [open, record, startDateTime, endDateTime, form])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!record?.id || !recordCtx) return

    try {
      const startDateTime = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate(),
        ...data.startTime.split(":").map(Number)
      )

      const endDateTime =
        data.endDate && data.endTime
          ? new Date(
              data.endDate.getFullYear(),
              data.endDate.getMonth(),
              data.endDate.getDate(),
              ...data.endTime.split(":").map(Number)
            )
          : null

      await recordCtx.onRecordUpdate(record.id, {
        type: data.type,
        subType: data.subType || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime?.toISOString() || null,
        note: data.note || null,
      })
      setIsEditing(false)
      onOpenChange(false)
    } catch (error) {
      // Error is already handled by the context
      console.error(error)
    }
  }

  const onDelete = async () => {
    if (!record?.id || !recordCtx) return

    try {
      await recordCtx.onRecordDelete(record.id)
      onOpenChange(false)
    } catch (error) {
      // Error is already handled by the context
      console.error(error)
    }
  }

  if (!record) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false)
        }
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Details</DialogTitle>
          <DialogDescription>
            View or edit record details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select
                  disabled={!isEditing}
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="diaper change">Diaper Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(form.watch("type") === "feeding" ||
              form.watch("type") === "diaper change") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subType" className="text-right">
                  Sub Type
                </Label>
                <div className="col-span-3">
                  <Select
                    disabled={!isEditing}
                    value={form.watch("subType")}
                    onValueChange={(value) => form.setValue("subType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${form.watch("type")} type`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {form.watch("type") === "feeding" ? (
                        <>
                          <SelectItem value="breastfeed">Breastfeed</SelectItem>
                          <SelectItem value="bottle">Bottle</SelectItem>
                          <SelectItem value="self">Self</SelectItem>
                        </>
                      ) : form.watch("type") === "diaper change" ? (
                        <>
                          <SelectItem value="wet">Wet</SelectItem>
                          <SelectItem value="solid">Solid</SelectItem>
                        </>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start
              </Label>
              <div className="col-span-3 flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !form.watch("startDate") && "text-muted-foreground"
                      )}
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("startDate") ? (
                        format(form.watch("startDate") as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("startDate")}
                      onSelect={(date) =>
                        date && form.setValue("startDate", date)
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  disabled={!isEditing}
                  value={form.watch("startTime") || ""}
                  onChange={(e) => form.setValue("startTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End
              </Label>
              <div className="col-span-3 flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !form.watch("endDate") && "text-muted-foreground"
                      )}
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("endDate") ? (
                        format(form.watch("endDate") as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("endDate")}
                      onSelect={(date) =>
                        date && form.setValue("endDate", date)
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  disabled={!isEditing}
                  value={form.watch("endTime") || ""}
                  onChange={(e) => form.setValue("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Textarea
                className="col-span-3"
                disabled={!isEditing}
                value={form.getValues("note") || ""}
                onChange={(e) => form.setValue("note", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button type="button" variant="destructive" onClick={onDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
