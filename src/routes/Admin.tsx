import { useContext, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Calendar, Eye, UserCheck, UserX, Trash2, Users, Shield, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import AdminContext from "@/context/AdminContext"
import AuthContext from "@/context/AuthContext"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AdminDebug } from "@/components/admin-debug"

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
  credentialsExpiryDate: string
  accountExpiryDate: string
  twoFactorSecret: string | null
  signUpMethod: string
  role: Role
  createdDate: string
  updatedDate: string
  twoFactorEnabled: boolean
}

type SortField = "userId" | "userName" | "email" | "role" | "createdDate" | "enabled"
type SortDirection = "asc" | "desc"

function Admin() {
  const adminCtx = useContext(AdminContext)
  const authCtx = useContext(AuthContext)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sortField, setSortField] = useState<SortField>("userId")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

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
    let aValue: any
    let bValue: any

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
        aValue = a.role.roleName
        bValue = b.role.roleName
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
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
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

  const handleDeleteUser = async (userId: number) => {
    if (adminCtx?.deleteUser) {
      await adminCtx.deleteUser(userId)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy, hh:mm a")
    } catch {
      return dateString
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
              Manage users and system administration
            </p>
          </div>
          <Button 
            onClick={adminCtx?.fetchUsers} 
            disabled={adminCtx?.loading}
            variant="outline"
          >
            {adminCtx?.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Refresh
          </Button>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{adminCtx?.users.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {adminCtx?.users.filter(user => user.enabled).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {adminCtx?.users.filter(user => !user.enabled).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Inactive Users</p>
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
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : adminCtx?.users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
                        Status
                        {getSortIcon("enabled")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {user.userId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.userName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getUserRoleBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(user.createdDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.enabled ? "default" : "secondary"}
                          className={user.enabled ? "bg-green-100 text-green-800" : ""}
                        >
                          {user.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
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
                                  onClick={() => handleStatusToggle(user.userId, user.enabled)}
                                  disabled={adminCtx?.loading || isCurrentUser(user)}
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
                                  : user.enabled ? "Disable User" : "Enable User"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRoleToggle(user.userId, user.role.roleName)}
                                  disabled={adminCtx?.loading || isCurrentUser(user)}
                                >
                                  {user.role.roleName === "ROLE_ADMIN" ? (
                                    <Shield className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isCurrentUser(user) 
                                  ? "Cannot modify own role" 
                                  : user.role.roleName === "ROLE_ADMIN" ? "Remove Admin" : "Make Admin"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      disabled={isCurrentUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete user "{user.userName}"? 
                                  This action cannot be undone and will permanently remove 
                                  all user data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.userId)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                                </AlertDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isCurrentUser(user) ? "Cannot delete own account" : "Delete User"}
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
      </div>

      {/* User Details Modal - This could be expanded to a separate component */}
      {selectedUser && (
        <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>User Details</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="text-sm">{selectedUser.userName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <div className="mt-1">{getUserRoleBadge(selectedUser)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge 
                    variant={selectedUser.enabled ? "default" : "secondary"}
                    className={selectedUser.enabled ? "bg-green-100 text-green-800" : ""}
                  >
                    {selectedUser.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="text-sm">{formatDate(selectedUser.createdDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{selectedUser.userId}</p>
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
