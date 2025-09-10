/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Mail,
  Calendar,
  Eye,
  UserCheck,
  UserX,
  // Trash2,
  Users,
  Shield,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Baby,
} from "lucide-react"
import AdminContext from "@/context/AdminContext"
import AuthContext from "@/context/AuthContext"
import { format } from "date-fns"
import {
  AlertDialog,
  // AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  // AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AdminDebug } from "@/components/admin-debug"
import { AdminUserActionsDialog } from "@/components/admin-user-actions-dialog"
import { AdminBabiesList } from "@/components/admin-babies-list"

interface Role {
  roleId: number
  roleName: string
}

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
  role?: Role
  createdDate: string
  updatedDate: string
  twoFactorEnabled: boolean
}

type SortField =
  | "userId"
  | "userName"
  | "email"
  | "role"
  | "createdDate"
  | "enabled"
type SortDirection = "asc" | "desc"

function Admin() {
  const adminCtx = useContext(AdminContext)
  const authCtx = useContext(AuthContext)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sortField, setSortField] = useState<SortField>("userId")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false)
  const [actionsUser, setActionsUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"users" | "babies">("users")

  // Helper function to check if user is the currently signed-in user
  const isCurrentUser = (user: User) => {
    return user.userName === authCtx?.currentUser?.username
  }

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort users based on current sort field and direction
  const sortedUsers = [...(adminCtx?.users || [])].sort((a, b) => {
    let aValue: string | number | boolean
    let bValue: string | number | boolean

    switch (sortField) {
      case "userId":
        aValue = a.userId
        bValue = b.userId
        break
      case "userName":
        aValue = a.userName.toLowerCase()
        bValue = b.userName.toLowerCase()
        break
      case "email":
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case "role":
        aValue = a.role?.roleName || "ROLE_USER"
        bValue = b.role?.roleName || "ROLE_USER"
        break
      case "createdDate":
        aValue = new Date(a.createdDate).getTime()
        bValue = new Date(b.createdDate).getTime()
        break
      case "enabled":
        aValue = a.enabled ? 1 : 0
        bValue = b.enabled ? 1 : 0
        break
      default:
        aValue = a.userId
        bValue = b.userId
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    if (adminCtx?.updateUserStatus) {
      await adminCtx.updateUserStatus(userId, !currentStatus)
    }
  }

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    if (adminCtx?.updateUserRole) {
      const newRole = currentRole === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN"
      await adminCtx.updateUserRole(userId, newRole)
    }
  }

  const handleManageUser = (user: User) => {
    setActionsUser(user)
    setActionsDialogOpen(true)
  }

  const handleTabChange = (tab: "users" | "babies") => {
    setActiveTab(tab)
    
    // Auto-fetch data when switching tabs
    if (tab === "babies" && adminCtx?.babies.length === 0) {
      adminCtx.fetchBabies()
    } else if (tab === "users" && adminCtx?.users.length === 0) {
      adminCtx.fetchUsers()
    }
  }


  // const handleDeleteUser = async (userId: number) => {
  //   if (adminCtx?.deleteUser) {
  //     await adminCtx.deleteUser(userId)
  //   }
  // }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy, hh:mm a")
    } catch {
      return dateString
    }
  }

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return "Never expires"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const isExpired = date < now
      const formattedDate = format(date, "MMM dd, yyyy")
      
      if (isExpired) {
        return `Expired: ${formattedDate}`
      }
      return formattedDate
    } catch {
      return dateString
    }
  }

  const getStatusIcon = (status: boolean, type: 'account' | 'credentials' | 'locked' | 'enabled') => {
    const iconClass = "h-4 w-4"
    
    if (type === 'locked') {
      // For locked status, true means NOT locked (good), false means locked (bad)
      return status ? (
        <CheckCircle className={`${iconClass} text-green-600`} />
      ) : (
        <XCircle className={`${iconClass} text-red-600`} />
      )
    }
    
    return status ? (
      <CheckCircle className={`${iconClass} text-green-600`} />
    ) : (
      <XCircle className={`${iconClass} text-red-600`} />
    )
  }

  const getExpiryIcon = (dateString: string | null) => {
    if (!dateString) return <CheckCircle className="h-4 w-4 text-blue-600" />
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const isExpired = date < now
      const daysDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (isExpired) {
        return <XCircle className="h-4 w-4 text-red-600" />
      } else if (daysDiff <= 30) {
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      }
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } catch {
      return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  const getUserRoleBadge = (user: User) => {
    console.log("Debug - User role:", user.role)
    const isAdmin = user.role && user.role.roleName === "ROLE_ADMIN"

    return (
      <Badge variant={isAdmin ? "destructive" : "default"}>
        {isAdmin ? "Admin" : "User"}
      </Badge>
    )
  }

  const getAccountStatusBadges = (user: User) => {
    return (
      <div className="flex flex-wrap gap-1">
        <div className="flex items-center gap-1">
          {getStatusIcon(user.enabled, 'enabled')}
          <span className="text-xs">
            {user.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon(user.accountNonLocked, 'locked')}
          <span className="text-xs">
            {user.accountNonLocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon(user.accountNonExpired, 'account')}
          <span className="text-xs">
            {user.accountNonExpired ? 'Valid' : 'Expired'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon(user.credentialsNonExpired, 'credentials')}
          <span className="text-xs">
            {user.credentialsNonExpired ? 'Valid' : 'Expired'}
          </span>
        </div>
      </div>
    )
  }

  if (adminCtx?.error) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 py-6">
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{adminCtx.error}</p>
            <Button
              onClick={adminCtx.fetchUsers}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-6">
      <div className="space-y-6">
        {/* Debug Component - Remove this after debugging */}
        <AdminDebug />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage users, babies, and system administration
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("users")}
                className={activeTab === "users" ? "dark:text-white" : ""}
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
              <Button
                variant={activeTab === "babies" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange("babies")}
                className={activeTab === "babies" ? "dark:text-white" : ""}
              >
                <Baby className="mr-2 h-4 w-4" />
                Babies
              </Button>
            </div>
            
            {/* Refresh Button */}
            <Button
              onClick={() => {
                if (activeTab === "users") {
                  adminCtx?.fetchUsers()
                } else {
                  adminCtx?.fetchBabies()
                }
              }}
              disabled={adminCtx?.loading}
              variant="outline"
            >
              {adminCtx?.loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "users" ? (
          <>
            {/* User Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {adminCtx?.users.length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {adminCtx?.users.filter((user) => user.enabled).length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Active Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {adminCtx?.users.filter((user) => !user.enabled).length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Inactive Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  View and manage all registered users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminCtx?.loading ? (
                  <div className="flex h-64 flex-col items-center justify-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : adminCtx?.users.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("userId")}
                          >
                            ID
                            {getSortIcon("userId")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("userName")}
                          >
                            Username
                            {getSortIcon("userName")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("email")}
                          >
                            Email
                            {getSortIcon("email")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("role")}
                          >
                            Role
                            {getSortIcon("role")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("createdDate")}
                          >
                            Created Date
                            {getSortIcon("createdDate")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("enabled")}
                          >
                            Account Status
                            {getSortIcon("enabled")}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Clock className="h-4 w-4" />
                            Credentials Expiry
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Calendar className="h-4 w-4" />
                            Account Expiry
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {user.userId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {user.userName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="text-muted-foreground h-4 w-4" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>{getUserRoleBadge(user)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground h-4 w-4" />
                              {formatDate(user.createdDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAccountStatusBadges(user)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getExpiryIcon(user.credentialsExpiryDate)}
                              <span className="text-xs">
                                {formatExpiryDate(user.credentialsExpiryDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getExpiryIcon(user.accountExpiryDate)}
                              <span className="text-xs">
                                {formatExpiryDate(user.accountExpiryDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleManageUser(user)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Manage User</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleStatusToggle(
                                          user.userId,
                                          user.enabled
                                        )
                                      }
                                      disabled={
                                        adminCtx?.loading || isCurrentUser(user)
                                      }
                                    >
                                      {user.enabled ? (
                                        <UserX className="h-4 w-4 text-orange-600" />
                                      ) : (
                                        <UserCheck className="h-4 w-4 text-green-600" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isCurrentUser(user)
                                      ? "Cannot modify own status"
                                      : user.enabled
                                        ? "Disable User"
                                        : "Enable User"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRoleToggle(
                                          user.userId,
                                          user.role?.roleName || "ROLE_USER"
                                        )
                                      }
                                      disabled={
                                        adminCtx?.loading || isCurrentUser(user)
                                      }
                                    >
                                      {user.role?.roleName === "ROLE_ADMIN" ? (
                                        <Shield className="h-4 w-4 text-red-600" />
                                      ) : (
                                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isCurrentUser(user)
                                      ? "Cannot modify own role"
                                      : user.role?.roleName === "ROLE_ADMIN"
                                        ? "Remove Admin"
                                        : "Make Admin"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Babies Tab Content */
          <AdminBabiesList />
        )}
      </div>

      {/* Admin User Actions Dialog */}
      <AdminUserActionsDialog
        open={actionsDialogOpen}
        onOpenChange={setActionsDialogOpen}
        user={actionsUser}
      />

      {/* User Details Modal - This could be expanded to a separate component */}
      {selectedUser && (
        <AlertDialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>User Details</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Username
                </p>
                <p className="text-sm">{selectedUser.userName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Email
                </p>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Role
                </p>
                <div className="mt-1">{getUserRoleBadge(selectedUser)}</div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Account Status
                </p>
                <div className="mt-1">
                  {getAccountStatusBadges(selectedUser)}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Credentials Expiry Date
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getExpiryIcon(selectedUser.credentialsExpiryDate)}
                  <span className="text-sm">
                    {formatExpiryDate(selectedUser.credentialsExpiryDate)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Account Expiry Date
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getExpiryIcon(selectedUser.accountExpiryDate)}
                  <span className="text-sm">
                    {formatExpiryDate(selectedUser.accountExpiryDate)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Two-Factor Authentication
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedUser.twoFactorEnabled, 'enabled')}
                  <span className="text-sm">
                    {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Sign-Up Method
                </p>
                <p className="text-sm capitalize">
                  {selectedUser.signUpMethod || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Created Date
                </p>
                <p className="text-sm">
                  {formatDate(selectedUser.createdDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  User ID
                </p>
                <p className="font-mono text-sm">{selectedUser.userId}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default Admin
