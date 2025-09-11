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
  CalendarIcon,
  ShieldCheck,
  ChevronDown
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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

  // Initialize state when user changes
  useEffect(() => {
    if (user) {
      setNewEmail(user.email)
      
      // Safely parse account expiry date
      if (user.accountExpiryDate) {
        try {
          const accountDate = new Date(user.accountExpiryDate)
          setAccountExpiryDate(isNaN(accountDate.getTime()) ? undefined : accountDate)
        } catch {
          setAccountExpiryDate(undefined)
        }
      } else {
        setAccountExpiryDate(undefined)
      }
      
      // Safely parse credentials expiry date
      if (user.credentialsExpiryDate) {
        try {
          const credentialsDate = new Date(user.credentialsExpiryDate)
          setCredentialsExpiryDate(isNaN(credentialsDate.getTime()) ? undefined : credentialsDate)
        } catch {
          setCredentialsExpiryDate(undefined)
        }
      } else {
        setCredentialsExpiryDate(undefined)
      }
    }
  }, [user])

  if (!adminCtx) {
    console.error('AdminUserActionsDialog must be used within AdminProvider')
    return null
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Actions */}
          <div className="space-y-4">
            {/* Email Update */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <Label className="font-medium">Email Address</Label>
              </div>
              <Input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    disabled={!newEmail.trim() || newEmail === user.email || isUpdating} 
                    className="w-full"
                  >
                    Update Email
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Email Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update email for "{user.userName}" from "{user.email}" to "{newEmail}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEmailUpdate}>Update</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Password Reset */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-orange-600" />
                <Label className="font-medium">Reset Password</Label>
              </div>
              <div className="relative">
                <Input
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    disabled={!newPassword.trim() || isUpdating} 
                    className="w-full"
                  >
                    Reset Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
                    <AlertDialogDescription>
                      Reset password for "{user.userName}"? This will immediately change their login credentials.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordUpdate}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Right Column - Security Actions */}
          <div className="space-y-4">
            {/* Account Security Quick Actions */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <Label className="font-medium">Security Actions</Label>
              </div>
              
              {/* Account Lock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.accountNonLocked ? <Unlock className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-red-600" />}
                  <span className="text-sm">{user.accountNonLocked ? "Unlocked" : "Locked"}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isUpdating}>
                      {user.accountNonLocked ? "Lock" : "Unlock"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{user.accountNonLocked ? "Lock" : "Unlock"} Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        {user.accountNonLocked 
                          ? `Lock "${user.userName}"? They won't be able to log in.`
                          : `Unlock "${user.userName}"? They will regain login access.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusToggle('lock')}>
                        {user.accountNonLocked ? "Lock" : "Unlock"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* 2FA Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.twoFactorEnabled ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm">2FA {user.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
                </div>
                {user.twoFactorEnabled && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isUpdating}>
                        Deactivate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate 2FA</AlertDialogTitle>
                        <AlertDialogDescription>
                          Deactivate two-factor authentication for "{user.userName}"? This will make their account less secure.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={async () => {
                            try {
                              setIsUpdating(true)
                              await adminCtx.deactivateTwoFactor(user.userId)
                            } catch (error) {
                              console.error("2FA deactivation error:", error)
                            } finally {
                              setIsUpdating(false)
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings - Collapsible */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Advanced Settings</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Expiry */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <Label className="font-medium">Account Expiry</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{user.accountNonExpired ? "Valid" : "Expired"}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isUpdating}>
                        {user.accountNonExpired ? "Expire" : "Activate"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{user.accountNonExpired ? "Expire" : "Activate"} Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          {user.accountNonExpired ? `Expire account for "${user.userName}"?` : `Activate account for "${user.userName}"?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusToggle('accountExpiry')}>
                          {user.accountNonExpired ? "Expire" : "Activate"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left" disabled={isUpdating}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="text-xs">
                        {accountExpiryDate ? format(accountExpiryDate, "MMM dd, yyyy") : 
                          user.accountExpiryDate ? format(new Date(user.accountExpiryDate), "MMM dd, yyyy") : 
                          "Set date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={accountExpiryDate}
                      onSelect={(date) => {
                        setAccountExpiryDate(date)
                        if (date) {
                          const dateString = format(date, "yyyy-MM-dd")
                          adminCtx.updateAccountExpiryDate(user.userId, dateString)
                        }
                      }}
                      initialFocus
                    />
                    {(accountExpiryDate || user.accountExpiryDate) && (
                      <div className="p-3 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => {
                          setAccountExpiryDate(undefined)
                          adminCtx.updateAccountExpiryDate(user.userId, null)
                        }}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Credentials Expiry */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <Label className="font-medium">Credentials Expiry</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{user.credentialsNonExpired ? "Valid" : "Expired"}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isUpdating}>
                        {user.credentialsNonExpired ? "Expire" : "Activate"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{user.credentialsNonExpired ? "Expire" : "Activate"} Credentials</AlertDialogTitle>
                        <AlertDialogDescription>
                          {user.credentialsNonExpired 
                            ? `Expire credentials for "${user.userName}"? They'll need to reset their password.`
                            : `Activate credentials for "${user.userName}"?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusToggle('credentialsExpiry')}>
                          {user.credentialsNonExpired ? "Expire" : "Activate"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left" disabled={isUpdating}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="text-xs">
                        {credentialsExpiryDate ? format(credentialsExpiryDate, "MMM dd, yyyy") : 
                          user.credentialsExpiryDate ? format(new Date(user.credentialsExpiryDate), "MMM dd, yyyy") : 
                          "Set date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={credentialsExpiryDate}
                      onSelect={(date) => {
                        setCredentialsExpiryDate(date)
                        if (date) {
                          const dateString = format(date, "yyyy-MM-dd")
                          adminCtx.updateCredentialsExpiryDate(user.userId, dateString)
                        }
                      }}
                      initialFocus
                    />
                    {(credentialsExpiryDate || user.credentialsExpiryDate) && (
                      <div className="p-3 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => {
                          setCredentialsExpiryDate(undefined)
                          adminCtx.updateCredentialsExpiryDate(user.userId, null)
                        }}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}