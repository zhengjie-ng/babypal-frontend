"use client"

import { useContext, useEffect, useState, useMemo, useRef } from "react"
import { Card } from "./ui/card"
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

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Activity Timeline</h3>
        <div className="text-muted-foreground text-sm">
          {Object.keys(timelineData).length} Days of Records
        </div>
      </div>

      <Carousel className="w-full" opts={{ align: "start" }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {Object.entries(timelineData)
            .sort(
              ([dateA], [dateB]) =>
                new Date(dateB).getTime() - new Date(dateA).getTime()
            )
            .map(([date, items]) => (
              <CarouselItem key={date} className="basis-full pl-2 md:pl-4">
                <div className="bg-card/50 rounded-lg p-4">
                  <h4 className="text-primary mb-6 border-b pb-3 text-xl font-medium">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </h4>
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border-primary/20 hover:border-primary relative border-l-2 pb-6 pl-6 transition-colors last:pb-0"
                      >
                        <div className="bg-primary ring-background absolute top-0 left-[-5px] h-2 w-2 rounded-full ring-4" />
                        <div className="mb-1 flex items-center gap-2">
                          <time className="bg-muted text-muted-foreground rounded px-2 py-1 text-sm font-medium">
                            {item.time}
                          </time>
                          <div className="text-muted-foreground text-sm">•</div>
                          <div className="text-primary text-sm font-medium">
                            {item.title}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
        </CarouselContent>
        <div className="mt-4 flex items-center justify-end gap-2">
          <CarouselPrevious className="position-static" />
          <CarouselNext className="position-static" />
        </div>
      </Carousel>
    </Card>
  )
}
