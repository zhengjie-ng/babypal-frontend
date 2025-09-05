"use client"

import { useContext, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import BabyContext from "@/context/BabyContext"
import { format } from "date-fns"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { cn } from "@/lib/utils"

interface Measurement {
  id: number
  time: string
  weight: number
  height: number
  headCircumference: number
}

interface TableMeasurementProps {
  type?: "all" | "weight" | "height" | "headCircumference"
}

interface BabyContextType {
  currentBaby: {
    id: number
    measurements: Measurement[]
  } | null
}

type SortField = "time" | "weight" | "height" | "headCircumference"
type SortDirection = "asc" | "desc"

export function TableMeasurement({ type = "all" }: TableMeasurementProps) {
  const { currentBaby } = useContext(BabyContext) as BabyContextType
  const measurements = currentBaby?.measurements || []

  // Always initialize with time in ascending order (oldest first)
  const [sortField, setSortField] = useState<SortField>("time")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Ensure time sorting always defaults to asc (oldest first)
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      // For time field, always start with asc (oldest first)
      setSortDirection(field === "time" ? "asc" : "desc")
    }
  }

  const getSortedData = () => {
    return [...measurements].sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1
      switch (sortField) {
        case "time":
          return (
            (new Date(b.time).getTime() - new Date(a.time).getTime()) *
            multiplier
          )
        case "weight":
          return (b.weight - a.weight) * multiplier
        case "height":
          return (b.height - a.height) * multiplier
        case "headCircumference":
          return (b.headCircumference - a.headCircumference) * multiplier
        default:
          return 0
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("time")}
                  className="flex w-full items-center justify-between hover:bg-transparent"
                >
                  Date & Time
                  {sortField === "time" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              {(type === "all" || type === "weight") && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("weight")}
                    className="flex w-full items-center justify-between hover:bg-transparent"
                  >
                    Weight (kg)
                    {sortField === "weight" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              )}
              {(type === "all" || type === "height") && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("height")}
                    className="flex w-full items-center justify-between hover:bg-transparent"
                  >
                    Height (cm)
                    {sortField === "height" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              )}
              {(type === "all" || type === "headCircumference") && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("headCircumference")}
                    className="flex w-full items-center justify-between hover:bg-transparent"
                  >
                    Head Circumference (cm)
                    {sortField === "headCircumference" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedData().map((measurement, index, array) => (
              <TableRow
                key={measurement.id}
                className={cn(
                  "hover:bg-muted/50 transition-colors",
                  index % 2 === 0 ? "bg-muted/20" : "bg-background"
                )}
              >
                <TableCell className="font-medium">
                  {format(new Date(measurement.time), "PPP p")}
                </TableCell>
                {(type === "all" || type === "weight") && (
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center space-x-2">
                          <span>{measurement.weight.toFixed(2)}</span>
                          {index < array.length - 1 && (
                            <Badge
                              variant={
                                array[index + 1].weight < measurement.weight
                                  ? "default"
                                  : array[index + 1].weight > measurement.weight
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {array[index + 1].weight < measurement.weight ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : array[index + 1].weight >
                                measurement.weight ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Badge>
                          )}
                        </TooltipTrigger>
                        {index < array.length - 1 && (
                          <TooltipContent>
                            <p>
                              {array[index + 1].weight < measurement.weight
                                ? `Gained ${(measurement.weight - array[index + 1].weight).toFixed(2)}kg`
                                : array[index + 1].weight > measurement.weight
                                  ? `Lost ${(array[index + 1].weight - measurement.weight).toFixed(2)}kg`
                                  : "No change"}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
                {(type === "all" || type === "height") && (
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center space-x-2">
                          <span>{measurement.height.toFixed(1)}</span>
                          {index < array.length - 1 && (
                            <Badge
                              variant={
                                array[index + 1].height < measurement.height
                                  ? "default"
                                  : array[index + 1].height > measurement.height
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {array[index + 1].height < measurement.height ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : array[index + 1].height >
                                measurement.height ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Badge>
                          )}
                        </TooltipTrigger>
                        {index < array.length - 1 && (
                          <TooltipContent>
                            <p>
                              {array[index + 1].height < measurement.height
                                ? `Grew ${(measurement.height - array[index + 1].height).toFixed(1)}cm`
                                : array[index + 1].height > measurement.height
                                  ? `Decreased ${(array[index + 1].height - measurement.height).toFixed(1)}cm`
                                  : "No change"}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
                {(type === "all" || type === "headCircumference") && (
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center space-x-2">
                          <span>
                            {measurement.headCircumference.toFixed(1)}
                          </span>
                          {index < array.length - 1 && (
                            <Badge
                              variant={
                                array[index + 1].headCircumference <
                                measurement.headCircumference
                                  ? "default"
                                  : array[index + 1].headCircumference >
                                      measurement.headCircumference
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {array[index + 1].headCircumference <
                              measurement.headCircumference ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : array[index + 1].headCircumference >
                                measurement.headCircumference ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Badge>
                          )}
                        </TooltipTrigger>
                        {index < array.length - 1 && (
                          <TooltipContent>
                            <p>
                              {array[index + 1].headCircumference <
                              measurement.headCircumference
                                ? `Increased ${(measurement.headCircumference - array[index + 1].headCircumference).toFixed(1)}cm`
                                : array[index + 1].headCircumference >
                                    measurement.headCircumference
                                  ? `Decreased ${(array[index + 1].headCircumference - measurement.headCircumference).toFixed(1)}cm`
                                  : "No change"}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
