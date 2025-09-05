import { BiTrash } from "react-icons/bi"
import { GiBabyBottle } from "react-icons/gi"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useContext, useEffect, useState } from "react"
import BabyContext from "@/context/BabyContext"
import RecordContext from "@/context/RecordContext"
import { Bed, Clock, ScrollText, User } from "lucide-react"

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

export function CardRecord({ type }: { type: string }) {
  const babyCtx = useContext(BabyContext)
  const recordCtx = useContext(RecordContext)
  const [lastProcessedUpdate, setLastProcessedUpdate] = useState<number>(0)

  // Refresh data when lastUpdate changes
  useEffect(() => {
    if (!recordCtx?.lastUpdate || !babyCtx?.updateCurrentBabyRecords) return

    // Only update if we haven't processed this timestamp yet
    if (recordCtx.lastUpdate > lastProcessedUpdate) {
      babyCtx.updateCurrentBabyRecords()
      setLastProcessedUpdate(recordCtx.lastUpdate)
    }
  }, [recordCtx?.lastUpdate, babyCtx, lastProcessedUpdate])

  const records = (babyCtx?.currentBaby?.records || []) as Record[]
  const filteredRecords = records
    .filter((record) => record.type === type)
    .sort((a, b) => {
      const timeA = a.endTime
        ? new Date(a.endTime).getTime()
        : new Date(a.startTime).getTime()
      const timeB = b.endTime
        ? new Date(b.endTime).getTime()
        : new Date(b.startTime).getTime()
      return timeB - timeA
    })

  const latestRecord = filteredRecords[0]

  const getDuration = (start: string, end: string) => {
    const timeDiff = new Date(end).getTime() - new Date(start).getTime()
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getTimeAgo = (record: Record | undefined) => {
    if (!record) return ""

    const timeToCompare = record.endTime || record.startTime
    const timeDiff = new Date().getTime() - new Date(timeToCompare).getTime()

    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    let timeAgo = hours > 0 ? `${hours}h ${minutes}m ago` : `${minutes}m ago`

    // Add duration if both start and end times exist
    if (record.startTime && record.endTime) {
      const duration = getDuration(record.startTime, record.endTime)
      timeAgo += ` (${duration})`
    }

    return timeAgo
  }

  const getTypeStyles = () => {
    switch (type) {
      case "feeding":
        return {
          icon: <GiBabyBottle className="h-5 w-5" />,
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          borderColor: "border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
        }
      case "sleep":
        return {
          icon: <Bed className="h-5 w-5" />,
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
          borderColor: "border-purple-200 dark:border-purple-800",
          iconColor: "text-purple-600 dark:text-purple-400",
        }
      case "diaper change":
        return {
          icon: <BiTrash className="h-5 w-5" />,
          bgColor: "bg-green-100 dark:bg-green-900/30",
          borderColor: "border-green-200 dark:border-green-800",
          iconColor: "text-green-600 dark:text-green-400",
        }
      default:
        return {
          icon: <ScrollText className="h-5 w-5" />,
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          borderColor: "border-gray-200 dark:border-gray-800",
          iconColor: "text-gray-600 dark:text-gray-400",
        }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <Card
      className={`h-50 w-full border-2 transition-shadow hover:shadow-lg ${typeStyles.borderColor}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-2 ${typeStyles.bgColor} ${typeStyles.iconColor}`}
            >
              {typeStyles.icon}
            </div>
            <CardTitle className="text-lg capitalize">{type}</CardTitle>
          </div>
          <div className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{getTimeAgo(latestRecord)}</span>
          </div>
        </div>
        <CardDescription>
          <div className="mt-2 space-y-2">
            {latestRecord?.subType && (
              <div className="flex items-center gap-2">
                <span className="bg-secondary/50 rounded px-2 py-0.5 text-sm font-medium capitalize">
                  {latestRecord.subType}
                </span>
              </div>
            )}
            {latestRecord?.note && (
              <div className="text-muted-foreground flex items-start gap-2">
                <ScrollText className="mt-0.5 h-4 w-4" />
                <p className="text-sm">{latestRecord.note}</p>
              </div>
            )}
            {latestRecord?.author && (
              <div className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                <p className="text-xs capitalize">by {latestRecord.author}</p>
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  )
}
