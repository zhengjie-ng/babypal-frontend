import { useContext, useState, useEffect } from "react"
import { ScrollText, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { GiBabyBottle } from "react-icons/gi"
import { BiTrash } from "react-icons/bi"
import { Bed } from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import BabyContext from "@/context/BabyContext"
import RecordContext from "@/context/RecordContext"
import { formatDate } from "@/lib/utils"
import { RecordDialog } from "./dialog-record-details"
import { Button } from "./ui/button"

type SortField = "type" | "startTime" | "note"
type SortDirection = "asc" | "desc"

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

const getTypeIcon = (type: string) => {
  switch (type) {
    case "feeding":
      return (
        <GiBabyBottle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      )
    case "sleep":
      return <Bed className="h-4 w-4 text-purple-600 dark:text-purple-400" />
    case "diaper change":
      return <BiTrash className="h-4 w-4 text-green-600 dark:text-green-400" />
    default:
      return <ScrollText className="h-4 w-4" />
  }
}

export function TableRecord({ type }: { type: string }) {
  const babyCtx = useContext(BabyContext)
  const recordCtx = useContext(RecordContext)
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("startTime")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

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

  const sortRecords = (a: Record, b: Record) => {
    switch (sortField) {
      case "type": {
        const typeA = a.subType || a.type
        const typeB = b.subType || b.type
        return sortDirection === "asc"
          ? typeA.localeCompare(typeB)
          : typeB.localeCompare(typeA)
      }

      case "startTime": {
        const timeA = new Date(a.startTime).getTime()
        const timeB = new Date(b.startTime).getTime()
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA
      }

      case "note": {
        const noteA = a.note || ""
        const noteB = b.note || ""
        return sortDirection === "asc"
          ? noteA.localeCompare(noteB)
          : noteB.localeCompare(noteA)
      }

      default:
        return 0
    }
  }

  const filteredRecords = records
    .filter((record) => record.type === type)
    .sort(sortRecords)

  const handleRowDoubleClick = (record: Record) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  // Get border color based on type
  const getBorderColor = (type: string) => {
    switch (type) {
      case "feeding":
        return "border-blue-200 dark:border-blue-800"
      case "sleep":
        return "border-purple-200 dark:border-purple-800"
      case "diaper change":
        return "border-green-200 dark:border-green-800"
      default:
        return "border-gray-200 dark:border-gray-800"
    }
  }

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)

  // Get current page records
  const getCurrentPageRecords = () => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredRecords.slice(start, end)
  }

  return (
    <div className="space-y-4">
      <div
        className={`overflow-hidden rounded-lg border-2 ${getBorderColor(type)}`}
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[500px]">
          <TableCaption className="capitalize">{type} Records</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("type")}
                  className="-ml-2 h-9 px-3 py-2 font-medium touch-manipulation"
                >
                  Type
                  {getSortIcon("type")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("startTime")}
                  className="-ml-2 h-9 px-3 py-2 font-medium touch-manipulation"
                >
                  Time
                  {getSortIcon("startTime")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("note")}
                  className="-ml-2 h-9 px-3 py-2 font-medium touch-manipulation"
                >
                  Note
                  {getSortIcon("note")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageRecords().map((record) => (
              <TableRow
                key={record.id}
                onDoubleClick={() => handleRowDoubleClick(record)}
                className="cursor-pointer"
              >
                <TableCell className="flex items-center gap-2">
                  {getTypeIcon(record.type)}
                  <span className="capitalize">
                    {record.subType || record.type}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(record.startTime, "MMM d, h:mm a")}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {record.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            variant="outline"
            size="lg"
            className="touch-manipulation min-w-24"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="touch-manipulation min-w-24"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <RecordDialog
        record={selectedRecord}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
