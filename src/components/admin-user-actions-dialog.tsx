import { useState, useEffect, useContext } from "react"
import { 
  Settings, 
  Key, 
  Lock, 
  Unlock, 
  Clock,
  XCircle,
  Shield,
  Eye,
  EyeOff,
  Mail,
  CalendarIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Tabs component not available - using simple sections instead
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AdminContext from "@/context/AdminContext"

interface User {
  userId: number
  userName: string
  email: string
  accountNonLocked: boolean
  accountNonExpired: boolean
  credentialsNonExpired: boolean
  enabled: boolean
  credentialsExpiryDate: string | null
  accountExpiryDate: string | null
  twoFactorSecret: string | null
  signUpMethod: string | null
  role?: {
    roleId: number
    roleName: string
  }
  createdDate: string
  updatedDate: string
  twoFactorEnabled: boolean
}

interface AdminUserActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function AdminUserActionsDialog({
  open,
  onOpenChange,
  user,
}: AdminUserActionsDialogProps) {
  const adminCtx = useContext(AdminContext)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [accountExpiryDate, setAccountExpiryDate] = useState<Date | undefined>()
  const [credentialsExpiryDate, setCredentialsExpiryDate] = useState<Date | undefined>()

  if (!adminCtx) {
    console.error('AdminUserActionsDialog must be used within AdminProvider')
    return null
  }

  // Initialize state when user changes
  useEffect(() => {
    if (user) {
      setNewEmail(user.email)
      setAccountExpiryDate(user.accountExpiryDate ? new Date(user.accountExpiryDate) : undefined)
      setCredentialsExpiryDate(user.credentialsExpiryDate ? new Date(user.credentialsExpiryDate) : undefined)
    }
  }, [user])

  if (!user) return null

  const handlePasswordUpdate = async () => {
    if (!newPassword.trim()) return
    
    try {
      setIsUpdating(true)
      await adminCtx.updateUserPassword(user.userId, newPassword)
      setNewPassword("")
      setShowPassword(false)
    } catch (error) {
      console.error("Password update error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEmailUpdate = async () => {
    if (!newEmail.trim() || newEmail === user.email) return
    
    try {
      setIsUpdating(true)
      await adminCtx.updateUserEmail(user.userId, newEmail)
    } catch (error) {
      console.error("Email update error:", error)
    } finally {
      setIsUpdating(false)
    }
  }


  const handleStatusToggle = async (
    action: 'lock' | 'accountExpiry' | 'credentialsExpiry'
  ) => {
    try {
      setIsUpdating(true)
      switch (action) {
        case 'lock':
          await adminCtx.updateAccountLockStatus(user.userId, !user.accountNonLocked)
          break
        case 'accountExpiry':
          await adminCtx.updateAccountExpiryStatus(user.userId, user.accountNonExpired)
          break
        case 'credentialsExpiry':
          await adminCtx.updateCredentialsExpiryStatus(user.userId, user.credentialsNonExpired)
          break
      }
    } catch (error) {
      console.error("Status update error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: boolean, positiveText: string, negativeText: string) => (
    <Badge variant={status ? "default" : "destructive"} className={status ? "bg-green-100 text-green-800" : ""}>
      {status ? positiveText : negativeText}
    </Badge>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <DialogTitle>Manage User: {user.userName}</DialogTitle>
          </div>
          <DialogDescription>
            Update user settings, passwords, and account status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-medium">Update Email Address</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={!newEmail.trim() || newEmail === user.email || isUpdating} 
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Update Email
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Email Update</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to update the email address for user "{user.userName}" 
                    from "{user.email}" to "{newEmail}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEmailUpdate}>
                    Update Email
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Separator />
          
          {/* Password Section */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-600" />
                <Label className="text-base font-medium">Reset User Password</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={!newPassword.trim() || isUpdating} 
                    className="w-full"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reset the password for user "{user.userName}"? 
                      This action will immediately change their login credentials.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordUpdate}>
                      Reset Password
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <Separator />
          
          {/* Security Section */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <Label className="text-base font-medium">Account Security</Label>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {user.accountNonLocked ? <Unlock className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-red-600" />}
                      <span className="font-medium">Account Lock Status</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.accountNonLocked ? "Account is unlocked" : "Account is locked"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.accountNonLocked, "Unlocked", "Locked")}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                        >
                          {user.accountNonLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          {user.accountNonLocked ? "Lock" : "Unlock"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {user.accountNonLocked ? "Lock Account" : "Unlock Account"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.accountNonLocked 
                              ? `Are you sure you want to lock the account for "${user.userName}"? They won't be able to log in until unlocked.`
                              : `Are you sure you want to unlock the account for "${user.userName}"? They will regain login access.`
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusToggle('lock')}>
                            {user.accountNonLocked ? "Lock Account" : "Unlock Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Account Status Section */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <Label className="text-base font-medium">Expiry Status</Label>
              </div>
              
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {user.accountNonExpired ? <Clock className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="font-medium">Account Expiry</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.accountNonExpired ? "Account is valid" : "Account has expired"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.accountNonExpired, "Valid", "Expired")}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                          >
                            {user.accountNonExpired ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            {user.accountNonExpired ? "Expire" : "Activate"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {user.accountNonExpired ? "Expire Account" : "Activate Account"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.accountNonExpired 
                                ? `Are you sure you want to expire the account for "${user.userName}"?`
                                : `Are you sure you want to activate the account for "${user.userName}"?`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusToggle('accountExpiry')}>
                              {user.accountNonExpired ? "Expire Account" : "Activate Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Account Expiry Date Picker */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isUpdating}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {accountExpiryDate ? format(accountExpiryDate, "PPP") : 
                            user.accountExpiryDate ? format(new Date(user.accountExpiryDate), "PPP") : 
                            <span className="text-muted-foreground">No expiry date set</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-0">
                          <Calendar
                            mode="single"
                            selected={accountExpiryDate}
                            onSelect={(date) => {
                              setAccountExpiryDate(date)
                              if (date) {
                                // Auto-update when date is selected
                                const dateString = format(date, "yyyy-MM-dd")
                                adminCtx.updateAccountExpiryDate(user.userId, dateString)
                              }
                            }}
                            initialFocus
                          />
                          {(accountExpiryDate || user.accountExpiryDate) && (
                            <div className="p-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setAccountExpiryDate(undefined)
                                  // Clear the expiry date by setting it to null
                                  adminCtx.updateAccountExpiryDate(user.userId, null)
                                }}
                              >
                                Remove Expiry Date
                              </Button>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {user.credentialsNonExpired ? <Shield className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="font-medium">Credentials Expiry</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.credentialsNonExpired ? "Credentials are valid" : "Credentials have expired"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.credentialsNonExpired, "Valid", "Expired")}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                          >
                            {user.credentialsNonExpired ? <XCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                            {user.credentialsNonExpired ? "Expire" : "Activate"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {user.credentialsNonExpired ? "Expire Credentials" : "Activate Credentials"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.credentialsNonExpired 
                                ? `Are you sure you want to expire the credentials for "${user.userName}"? They will need to reset their password.`
                                : `Are you sure you want to activate the credentials for "${user.userName}"?`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusToggle('credentialsExpiry')}>
                              {user.credentialsNonExpired ? "Expire Credentials" : "Activate Credentials"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Credentials Expiry Date Picker */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Credentials Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isUpdating}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {credentialsExpiryDate ? format(credentialsExpiryDate, "PPP") : 
                            user.credentialsExpiryDate ? format(new Date(user.credentialsExpiryDate), "PPP") : 
                            <span className="text-muted-foreground">No expiry date set</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-0">
                          <Calendar
                            mode="single"
                            selected={credentialsExpiryDate}
                            onSelect={(date) => {
                              setCredentialsExpiryDate(date)
                              if (date) {
                                // Auto-update when date is selected
                                const dateString = format(date, "yyyy-MM-dd")
                                adminCtx.updateCredentialsExpiryDate(user.userId, dateString)
                              }
                            }}
                            initialFocus
                          />
                          {(credentialsExpiryDate || user.credentialsExpiryDate) && (
                            <div className="p-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setCredentialsExpiryDate(undefined)
                                  // Clear the expiry date by setting it to null
                                  adminCtx.updateCredentialsExpiryDate(user.userId, null)
                                }}
                              >
                                Remove Expiry Date
                              </Button>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}