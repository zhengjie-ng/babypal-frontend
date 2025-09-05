import { Separator } from "@/components/ui/separator"
import { TableMeasurement } from "@/components/table-measurement"
import { DialogMeasurementAdd } from "@/components/dialog-measurement-add"
import { EmptyBabyState } from "@/components/empty-baby-state"
import { useContext, useEffect } from "react"
import BabyContext from "@/context/BabyContext"

function Measurements() {
  const babyCtx = useContext(BabyContext)

  // Auto-select first baby if no baby is selected
  useEffect(() => {
    if (!babyCtx) return
    if (babyCtx.babies?.length && !babyCtx.currentBaby) {
      babyCtx.onBabySelect(babyCtx.babies[0].id)
    }
  }, [babyCtx])

  if (!babyCtx?.currentBaby) {
    return <EmptyBabyState />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Measurements
          </h2>
          <p className="text-muted-foreground text-sm">
            Track {babyCtx.currentBaby.name}'s growth measurements
          </p>
        </div>
        <DialogMeasurementAdd />
      </div>
      <Separator className="mb-6" />

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-3">
          <TableMeasurement type="all" />
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold">Weight History</h3>
          <TableMeasurement type="weight" />
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold">Height History</h3>
          <TableMeasurement type="height" />
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold">Head Circumference History</h3>
          <TableMeasurement type="headCircumference" />
        </div>
      </div>
    </div>
  )
}

export default Measurements
