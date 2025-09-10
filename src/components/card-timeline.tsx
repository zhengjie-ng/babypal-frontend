"use client"

import { useContext, useEffect, useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel"
import BabyContext from "@/context/BabyContext"
import RecordContext from "@/context/RecordContext"
import { format } from "date-fns"
import { DialogRecordAdd } from "./dialog-record-add"
import { RecordDialog } from "./dialog-record-details"
import {
  Clock,
  Calendar,
  Activity,
  Baby,
  Utensils,
  Moon,
  Bath,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Stethoscope,
} from "lucide-react"

interface TimelineItem {
  id: string | number
  type: "record" | "measurement"
  time: string
  title: string
  description: string
}

interface Record {
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

interface BabyContextType {
  currentBaby: {
    id: number
    name: string
    records: Array<{
      id: number
      type: string
      subType: string | null
      startTime: string
      note: string | null
    }>
  } | null
  fetchBabies: () => Promise<void>
  updateCurrentBabyRecords: () => Promise<void>
}

interface RecordContextType {
  refreshRecords: () => Promise<void>
  lastUpdate: number
}

// Helper function to detect activity type from note keywords
const detectActivityFromNote = (note: string | null): string => {
  if (!note) return "activity"
  
  const normalizedNote = note.toLowerCase()
  
  // Check for play-related keywords
  if (normalizedNote.includes("play") || normalizedNote.includes("tummy") || 
      normalizedNote.includes("activity") || normalizedNote.includes("game")) {
    return "play"
  }
  
  // Check for bath-related keywords
  if (normalizedNote.includes("bath") || normalizedNote.includes("shower") || 
      normalizedNote.includes("wash") || normalizedNote.includes("clean")) {
    return "bath"
  }
  
  // Check for temperature-related keywords
  if (normalizedNote.includes("temperature") || normalizedNote.includes("fever") || 
      normalizedNote.includes("temp") || normalizedNote.includes("hot") || 
      normalizedNote.includes("cold")) {
    return "temperature"
  }
  
  // Check for weight-related keywords
  if (normalizedNote.includes("weight") || normalizedNote.includes("weigh") || 
      normalizedNote.includes("scale") || normalizedNote.includes("kg") || 
      normalizedNote.includes("lb")) {
    return "weight"
  }
  
  // Check for height-related keywords
  if (normalizedNote.includes("height") || normalizedNote.includes("length") || 
      normalizedNote.includes("measure") || normalizedNote.includes("cm") || 
      normalizedNote.includes("inch")) {
    return "height"
  }
  
  // Check for medical-related keywords
  if (normalizedNote.includes("doctor") || normalizedNote.includes("medicine") || 
      normalizedNote.includes("medication") || normalizedNote.includes("checkup") || 
      normalizedNote.includes("visit")) {
    return "medical"
  }
  
  return "activity"
}

// Helper function to get icon and color for different record types
const getRecordTypeInfo = (type: string, note?: string | null) => {
  const normalizedType = type.toLowerCase()

  // Handle "others" type by analyzing the note
  if (normalizedType === "others" || normalizedType === "other") {
    const detectedType = detectActivityFromNote(note || null)
    return getRecordTypeInfo(detectedType)
  }

  switch (normalizedType) {
    case "feeding":
      return {
        icon: Utensils,
        color: "bg-green-500 dark:bg-green-600",
        bgColor: "bg-green-50 dark:bg-green-950/50",
        textColor: "text-green-700 dark:text-green-300",
        borderColor: "border-green-200 dark:border-green-800",
      }
    case "sleep":
      return {
        icon: Moon,
        color: "bg-blue-500 dark:bg-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-950/50",
        textColor: "text-blue-700 dark:text-blue-300",
        borderColor: "border-blue-200 dark:border-blue-800",
      }
    case "diaper change":
      return {
        icon: Trash2,
        color: "bg-yellow-500 dark:bg-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
        textColor: "text-yellow-700 dark:text-yellow-300",
        borderColor: "border-yellow-200 dark:border-yellow-800",
      }
    case "bath":
      return {
        icon: Bath,
        color: "bg-cyan-500 dark:bg-cyan-600",
        bgColor: "bg-cyan-50 dark:bg-cyan-950/50",
        textColor: "text-cyan-700 dark:text-cyan-300",
        borderColor: "border-cyan-200 dark:border-cyan-800",
      }
    case "temperature":
      return {
        icon: Thermometer,
        color: "bg-red-500 dark:bg-red-600",
        bgColor: "bg-red-50 dark:bg-red-950/50",
        textColor: "text-red-700 dark:text-red-300",
        borderColor: "border-red-200 dark:border-red-800",
      }
    case "weight":
      return {
        icon: Scale,
        color: "bg-purple-500 dark:bg-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-950/50",
        textColor: "text-purple-700 dark:text-purple-300",
        borderColor: "border-purple-200 dark:border-purple-800",
      }
    case "height":
      return {
        icon: Ruler,
        color: "bg-indigo-500 dark:bg-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
        textColor: "text-indigo-700 dark:text-indigo-300",
        borderColor: "border-indigo-200 dark:border-indigo-800",
      }
    case "play":
      return {
        icon: Heart,
        color: "bg-pink-500 dark:bg-pink-600",
        bgColor: "bg-pink-50 dark:bg-pink-950/50",
        textColor: "text-pink-700 dark:text-pink-300",
        borderColor: "border-pink-200 dark:border-pink-800",
      }
    case "medical":
      return {
        icon: Stethoscope,
        color: "bg-red-500 dark:bg-red-600",
        bgColor: "bg-red-50 dark:bg-red-950/50",
        textColor: "text-red-700 dark:text-red-300",
        borderColor: "border-red-200 dark:border-red-800",
      }
    case "activity":
    default:
      return {
        icon: Activity,
        color: "bg-slate-500 dark:bg-slate-600",
        bgColor: "bg-slate-50 dark:bg-slate-950/50",
        textColor: "text-slate-700 dark:text-slate-300",
        borderColor: "border-slate-200 dark:border-slate-800",
      }
  }
}

export const CardTimeline = () => {
  const { currentBaby } = useContext(BabyContext) as BabyContextType
  const { refreshRecords } = useContext(RecordContext) as RecordContextType
  const [timelineData, setTimelineData] = useState<{
    [key: string]: TimelineItem[]
  }>({})
  const firstLoadRef = useRef(true)

  // Dialog state management
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Get records from currentBaby - memoized to prevent unnecessary re-renders
  const records = useMemo(
    () => currentBaby?.records || [],
    [currentBaby?.records]
  )

  useEffect(() => {
    // Only fetch records on first load and when currentBaby changes
    if (currentBaby?.id && firstLoadRef.current) {
      firstLoadRef.current = false
      refreshRecords()
    }
  }, [currentBaby?.id, refreshRecords])

  useEffect(() => {
    if (!currentBaby || records.length === 0) {
      setTimelineData({})
      return
    }

    // Helper function to capitalize first letter
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }

    // Helper function to format type and subtype display
    const formatTypeDisplay = (type: string, subType: string | null) => {
      const capitalizedType = capitalizeFirstLetter(type)
      if (subType) {
        const capitalizedSubType = capitalizeFirstLetter(subType)
        return `${capitalizedType} - ${capitalizedSubType}`
      }
      return capitalizedType
    }

    // Group records by date
    const groupedData = records.reduce(
      (
        acc: { [key: string]: TimelineItem[] },
        record: {
          id: number
          type: string
          subType: string | null
          startTime: string
          note: string | null
        }
      ) => {
        const date = format(new Date(record.startTime), "yyyy-MM-dd")

        if (!acc[date]) {
          acc[date] = []
        }

        acc[date].push({
          id: record.id,
          type: "record",
          time: format(new Date(record.startTime), "h:mm a"),
          title: formatTypeDisplay(record.type, record.subType),
          description: record.note || "",
        })

        return acc
      },
      {}
    )

    // Sort dates and items within each date
    Object.keys(groupedData).forEach((date) => {
      groupedData[date].sort(
        (a: TimelineItem, b: TimelineItem) =>
          new Date(date + " " + b.time).getTime() -
          new Date(date + " " + a.time).getTime()
      )
    })

    setTimelineData(groupedData)
  }, [records, currentBaby])

  // Handle double-click to edit record
  const handleTimelineItemDoubleClick = (item: TimelineItem) => {
    // Find the full record from currentBaby.records using the timeline item's id
    const fullRecord = currentBaby?.records?.find(
      (record) => record.id === item.id
    ) as Record
    if (fullRecord) {
      setSelectedRecord(fullRecord)
      setDialogOpen(true)
    }
  }

  if (!currentBaby) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-12">
          <div className="space-y-4 text-center">
            <Baby className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground text-lg">
              Select a baby to view timeline
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-1 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="bg-clip-text text-2xl font-bold">
                Activity Timeline
              </h3>
              <p className="text-muted-foreground text-sm">
                Track your baby's daily activities and milestones
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DialogRecordAdd />
            <Badge variant="secondary" className="backdrop-blur">
              <Calendar className="mr-1 h-3 w-3" />
              {Object.keys(timelineData).length} Days
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {Object.keys(timelineData).length === 0 ? (
          <div className="space-y-4 py-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-medium">
                No activities yet
              </h4>
              <p className="text-muted-foreground">
                Start tracking activities to see them here
              </p>
            </div>
          </div>
        ) : (
          <Carousel className="w-full" opts={{ align: "start" }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {Object.entries(timelineData)
                .sort(
                  ([dateA], [dateB]) =>
                    new Date(dateB).getTime() - new Date(dateA).getTime()
                )
                .map(([date, items]) => (
                  <CarouselItem key={date} className="basis-full pl-2 md:pl-4">
                    <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/50 p-6">
                      <div className="mb-6 flex items-center gap-3 border-b pb-4">
                        <div className="rounded-lg bg-primary/10 p-2 shadow-sm">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold">
                            {format(new Date(date), "EEEE, MMMM d")}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {format(new Date(date), "yyyy")} • {items.length}{" "}
                            activities
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {items.map((item, index) => {
                          // Find the original record to get the main type and note
                          const originalRecord = currentBaby?.records?.find(
                            (record) => record.id === item.id
                          )
                          const mainType =
                            originalRecord?.type || item.title.split(" - ")[0]
                          const typeInfo = getRecordTypeInfo(mainType, originalRecord?.note)
                          const Icon = typeInfo.icon

                          return (
                            <div
                              key={item.id}
                              className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${typeInfo.bgColor} ${typeInfo.borderColor} bg-card/60 backdrop-blur-sm`}
                              onDoubleClick={() =>
                                handleTimelineItemDoubleClick(item)
                              }
                              title="Double-click to edit"
                            >
                              {/* Timeline connector */}
                              {index < items.length - 1 && (
                                <div className="absolute top-16 left-8 h-4 w-0.5 rounded-full bg-border" />
                              )}

                              <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                  className={`flex-shrink-0 rounded-xl p-3 ${typeInfo.color} shadow-sm`}
                                >
                                  <Icon className="h-5 w-5 text-white" />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                  <div className="mb-2 flex items-center gap-2">
                                    <div
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${typeInfo.textColor} bg-card/80`}
                                    >
                                      <Clock className="h-3 w-3" />
                                      {item.time}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-medium"
                                    >
                                      {item.title}
                                    </Badge>
                                  </div>

                                  {item.description && (
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Hover effect */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>

            {/* Custom navigation */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <CarouselPrevious className="relative translate-y-0 transform-none border-2 border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-accent">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <div className="text-muted-foreground px-2 text-xs">
                Navigate days
              </div>
              <CarouselNext className="relative translate-y-0 transform-none border-2 border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-accent">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </div>
          </Carousel>
        )}
      </CardContent>

      {/* Record Details Dialog */}
      <RecordDialog
        record={selectedRecord}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}
