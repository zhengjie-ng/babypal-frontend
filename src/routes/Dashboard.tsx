import { CardRecord } from "@/components/card-record"
import { TableRecord } from "@/components/table-record"
import { Separator } from "@/components/ui/separator"
import { DialogRecordAdd } from "@/components/dialog-record-add"
import { EmptyBabyState } from "@/components/empty-baby-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"

function Dashboard() {
  const babyCtx = useContext(BabyContext)

  if (!babyCtx?.currentBaby) {
    return <EmptyBabyState />
  }

  if (babyCtx?.loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Separator className="mb-6" />

        <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* Three columns of skeleton content */}
          {[1, 2, 3].map((col) => (
            <div key={col} className="flex flex-col gap-6">
              {/* Card Record Skeleton */}
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              {/* Table Record Skeleton */}
              <div className="rounded-lg border">
                <div className="p-4 border-b">
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4].map((row) => (
                    <div key={row} className="p-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-12" />
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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            View and manage {babyCtx.currentBaby.name}'s daily activities
          </p>
        </div>
        <DialogRecordAdd />
      </div>
      <Separator className="mb-6" />

      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-4 sm:gap-6">
          <CardRecord type="feeding" />
          <TableRecord type="feeding" />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <CardRecord type="diaper change" />
          <TableRecord type="diaper change" />
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6 sm:col-span-2 xl:col-span-1">
          <CardRecord type="sleep" />
          <TableRecord type="sleep" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
