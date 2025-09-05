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
} from "lucide-react"

interface TimelineItem {
  id: string | number
  type: "record" | "measurement"
  time: string
  title: string
  description: string
}

interface BabyContextType {
  currentBaby: {
    id: number
    name: string
    records: Array<{
      id: number
      type: string
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

// Helper function to get icon and color for different record types
const getRecordTypeInfo = (type: string) => {
  const normalizedType = type.toLowerCase()

  switch (normalizedType) {
    case "feeding":
    case "feed":
    case "milk":
    case "bottle":
      return {
        icon: Utensils,
        color: "bg-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      }
    case "sleep":
    case "nap":
    case "bedtime":
      return {
        icon: Moon,
        color: "bg-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      }
    case "diaper":
    case "change":
    case "wet":
    case "dirty":
      return {
        icon: Baby,
        color: "bg-yellow-500",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
      }
    case "bath":
    case "bathing":
    case "shower":
      return {
        icon: Bath,
        color: "bg-cyan-500",
        bgColor: "bg-cyan-50",
        textColor: "text-cyan-700",
        borderColor: "border-cyan-200",
      }
    case "temperature":
    case "fever":
    case "temp":
      return {
        icon: Thermometer,
        color: "bg-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      }
    case "weight":
    case "weigh":
      return {
        icon: Scale,
        color: "bg-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
      }
    case "height":
    case "length":
    case "measure":
      return {
        icon: Ruler,
        color: "bg-indigo-500",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-700",
        borderColor: "border-indigo-200",
      }
    case "play":
    case "activity":
    case "tummy":
      return {
        icon: Heart,
        color: "bg-pink-500",
        bgColor: "bg-pink-50",
        textColor: "text-pink-700",
        borderColor: "border-pink-200",
      }
    default:
      return {
        icon: Activity,
        color: "bg-gray-500",
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
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

    // Group records by date
    const groupedData = records.reduce(
      (
        acc: { [key: string]: TimelineItem[] },
        record: {
          id: number
          type: string
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
          time: format(new Date(record.startTime), "HH:mm"),
          title: record.type,
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
          <div className="text-right">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur">
              <Calendar className="mr-1 h-3 w-3" />
              {Object.keys(timelineData).length} Days
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {Object.keys(timelineData).length === 0 ? (
          <div className="space-y-4 py-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-900">
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
                    <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6">
                      <div className="mb-6 flex items-center gap-3 border-b border-gray-200/60 pb-4">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
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
                          const typeInfo = getRecordTypeInfo(item.title)
                          const Icon = typeInfo.icon

                          return (
                            <div
                              key={item.id}
                              className={`group relative rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${typeInfo.bgColor} ${typeInfo.borderColor} bg-white/60 backdrop-blur-sm`}
                            >
                              {/* Timeline connector */}
                              {index < items.length - 1 && (
                                <div className="absolute top-16 left-8 h-4 w-0.5 rounded-full bg-gray-200" />
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
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${typeInfo.textColor} bg-white/80`}
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
                                    <p className="text-sm leading-relaxed text-gray-600">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Hover effect */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
              <CarouselPrevious className="relative translate-y-0 transform-none border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <div className="text-muted-foreground px-2 text-xs">
                Navigate days
              </div>
              <CarouselNext className="relative translate-y-0 transform-none border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </div>
          </Carousel>
        )}
      </CardContent>
    </Card>
  )
}
