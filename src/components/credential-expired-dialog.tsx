import { useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CredentialExpiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  onPasswordReset: (email: string) => Promise<void>
  loading?: boolean
}

export function CredentialExpiredDialog({
  open,
  onOpenChange,
  username,
  onPasswordReset,
  // loading = false,
}: CredentialExpiredDialogProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      return
    }

    try {
      setIsSubmitting(true)
      await onPasswordReset(email)
      onOpenChange(false)
      setEmail("")
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim() && !isSubmitting) {
      handlePasswordReset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Credentials Expired</DialogTitle>
          </div>
          <DialogDescription>
            Your password has expired and needs to be reset before you can
            continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Account: <strong>{username}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="email">
              Enter your email address to reset your password
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordReset}
            disabled={!email.trim() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
