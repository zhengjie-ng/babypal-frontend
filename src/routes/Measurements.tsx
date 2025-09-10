import { Separator } from "@/components/ui/separator"
import { TableMeasurement } from "@/components/table-measurement"
import { DialogMeasurementAdd } from "@/components/dialog-measurement-add"
import { EmptyBabyState } from "@/components/empty-baby-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"

function Measurements() {
  const babyCtx = useContext(BabyContext)

  if (!babyCtx?.currentBaby) {
    return <EmptyBabyState />
  }

  if (babyCtx?.loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Separator className="mb-6" />

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {/* Full width table skeleton */}
          <div className="flex flex-col gap-6 md:col-span-3">
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="divide-y">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="grid grid-cols-5 gap-4 p-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual measurement tables */}
          {[
            "Weight History",
            "Height History",
            "Head Circumference History",
          ].map((index) => (
            <div key={index} className="flex flex-col gap-6">
              <Skeleton className="h-6 w-32" />
              <div className="rounded-lg border">
                <div className="border-b p-4">
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="divide-y">
                  {[1, 2, 3].map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Measurements
          </h2>
          <p className="text-muted-foreground text-sm">
            Track {babyCtx.currentBaby.name}'s growth measurements
          </p>
        </div>
        <DialogMeasurementAdd />
      </div>
      <Separator className="mb-6" />

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <TableMeasurement type="all" />
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-base sm:text-lg font-semibold">Weight History</h3>
          <TableMeasurement type="weight" />
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-base sm:text-lg font-semibold">Height History</h3>
          <TableMeasurement type="height" />
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-base sm:text-lg font-semibold">Head Circumference History</h3>
          <TableMeasurement type="headCircumference" />
        </div>
      </div>
    </div>
  )
}

export default Measurements
