import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import api from "@/services/api"
import AuthContext from "./AuthContext"

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

interface AdminContextType {
  users: User[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  getUserById: (userId: number) => Promise<User | null>
  updateUserStatus: (userId: number, enabled: boolean) => Promise<void>
  updateUserRole: (userId: number, roleName: string) => Promise<void>
  deleteUser: (userId: number) => Promise<void>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authCtx = useContext(AuthContext)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Debug: Check authentication state
      const token = localStorage.getItem("JWT_TOKEN")
      const isAdmin = localStorage.getItem("IS_ADMIN")

      console.log("Debug - Admin Context State:", {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        isAdmin: isAdmin,
      })

      // Debug: Log the actual token being sent
      console.log("Debug - JWT Token:", {
        tokenExists: !!token,
        tokenStart: token?.substring(0, 20) + "...",
        authHeader: `Bearer ${token?.substring(0, 20)}...`,
      })

      if (!token) {
        throw new Error("No authentication token found")
      }

      if (isAdmin !== "true") {
        throw new Error("User does not have admin privileges")
      }

      // Debug: Create a test request to see what headers are actually sent
      console.log("Debug - Making admin request with headers...")

      const response = await api.get("/admin/get-users")
      const usersData = Array.isArray(response.data) ? response.data : []
      
      // Fetch detailed user info for each user to get role information
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          try {
            const detailResponse = await api.get(`/admin/user/${user.userId}`)
            return detailResponse.data
          } catch (error) {
            console.warn(`Failed to fetch details for user ${user.userId}:`, error)
            return user // Return original user data if detail fetch fails
          }
        })
      )
      
      // Sort users by userId
      const sortedUsers = usersWithRoles.sort((a, b) => a.userId - b.userId)
      setUsers(sortedUsers)
    } catch (err) {
      console.error("Admin fetch error:", err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Error fetching users"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserById = useCallback(
    async (userId: number): Promise<User | null> => {
      try {
        const response = await api.get(`/admin/users/${userId}`)
        return response.data
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error fetching user details"
        toast.error(errorMessage)
        return null
      }
    },
    []
  )

  const updateUserStatus = useCallback(
    async (userId: number, enabled: boolean) => {
      try {
        await api.put(`/admin/update-enabled-status?userId=${userId}&enabled=${enabled}`)

        // Update local state and maintain sort order
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, enabled } : user
          ).sort((a, b) => a.userId - b.userId)
        )

        toast.success(`User ${enabled ? "enabled" : "disabled"} successfully`)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating user status"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateUserRole = useCallback(
    async (userId: number, roleName: string) => {
      try {
        await api.put(`/admin/update-role?userId=${userId}&roleName=${roleName}`)

        // Update local state and maintain sort order
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId 
              ? { 
                  ...user, 
                  role: { 
                    ...user.role, 
                    roleName: roleName 
                  } 
                } 
              : user
          ).sort((a, b) => a.userId - b.userId)
        )

        const roleDisplayName = roleName === "ROLE_ADMIN" ? "Admin" : "User"
        toast.success(`User role updated to ${roleDisplayName} successfully`)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating user role"
        toast.error(errorMessage)
      }
    },
    []
  )

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await api.delete(`/admin/users/${userId}`)

      // Remove from local state and maintain sort order
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== userId).sort((a, b) => a.userId - b.userId)
      )

      toast.success("User deleted successfully")
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Error deleting user"
      toast.error(errorMessage)
    }
  }, [])

  // Fetch users when component mounts and user is admin
  useEffect(() => {
    if (authCtx?.isAdmin && authCtx?.token && !loading) {
      fetchUsers()
    }
  }, [authCtx?.isAdmin, authCtx?.token])

  const contextValue: AdminContextType = {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser,
  }

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContext
