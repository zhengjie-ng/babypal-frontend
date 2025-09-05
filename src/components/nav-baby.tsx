import { Outlet } from "react-router-dom"
import { Button } from "./ui/button"
import { useContext } from "react"
import BabyContext from "@/context/BabyContext"
import AuthContext from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { DialogBabyAdd } from "./dialog-baby-add"
import { Loader2 } from "lucide-react"

function NavBaby() {
  const babyCtx = useContext(BabyContext)
  const authCtx = useContext(AuthContext)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40 w-full border-b px-4 backdrop-blur md:px-6">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between">
          <nav className="flex flex-1 items-center gap-3">
            {(babyCtx?.loading || authCtx?.loading) ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              babyCtx?.babies.map((baby) => (
                <Button
                  key={baby.id}
                  onClick={() => babyCtx.onBabySelect(baby.id)}
                  variant={
                    babyCtx?.currentBaby?.id === baby.id ? "default" : "ghost"
                  }
                  size="sm"
                  disabled={babyCtx.loading || authCtx?.loading}
                  className={cn(
                    "transition-colors",
                    babyCtx?.currentBaby?.id === baby.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10 hover:text-primary",
                    (babyCtx.loading || authCtx?.loading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {baby.name}
                </Button>
              ))
            )}
          </nav>
          <DialogBabyAdd />
        </div>
      </div>

      <div className="container mx-auto max-w-screen-2xl flex-1 px-4 py-6 md:px-6">
        <Outlet />
      </div>
    </div>
  )
}

export default NavBaby
