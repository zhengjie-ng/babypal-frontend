import { CardRecord } from "@/components/card-record"
import { TableRecord } from "@/components/table-record"
import { Separator } from "@/components/ui/separator"
import { DialogRecordAdd } from "@/components/dialog-record-add"
import { EmptyBabyState } from "@/components/empty-baby-state"
import { useContext, useEffect } from "react"
import BabyContext from "@/context/BabyContext"

function Dashboard() {
  const babyCtx = useContext(BabyContext)


  if (!babyCtx?.currentBaby) {
    return <EmptyBabyState />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            View and manage {babyCtx.currentBaby.name}'s daily activities
          </p>
        </div>
        <DialogRecordAdd />
      </div>
      <Separator className="mb-6" />

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6">
          <CardRecord type="feeding" />
          <TableRecord type="feeding" />
        </div>

        <div className="flex flex-col gap-6">
          <CardRecord type="diaper change" />
          <TableRecord type="diaper change" />
        </div>
        <div className="flex flex-col gap-6">
          <CardRecord type="sleep" />
          <TableRecord type="sleep" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
