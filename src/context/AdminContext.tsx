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
  credentialsExpiryDate: string | null
  accountExpiryDate: string | null
  twoFactorSecret: string | null
  signUpMethod: string
  role: Role
  createdDate: string
  updatedDate: string
  twoFactorEnabled: boolean
}

interface Record {
  id: number
  author: string
  type: string
  subType: string | null
  note: string | null
  startTime: string
  endTime: string | null
  createdAt: string
  updatedAt: string
}

interface Measurement {
  id: number
  author: string
  time: string
  weight: number
  height: number
  headCircumference: number
  createdAt: string
  updatedAt: string
}

interface Baby {
  id: number
  name: string
  gender: string | null
  dateOfBirth: string
  weight: number | null
  height: number | null
  headCircumference: number | null
  caregivers: string[]
  owner: string
  createdAt: string
  updatedAt: string
  records: Record[]
  measurements: Measurement[]
}

interface Log {
  id: number
  username: string
  type: string
  typeId: number
  action: string
  statusCode: string
  createdAt: string
}

interface AdminContextType {
  users: User[]
  babies: Baby[]
  logs: Log[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  fetchBabies: () => Promise<void>
  fetchLogs: () => Promise<void>
  getUserById: (userId: number) => Promise<User | null>
  updateUserStatus: (userId: number, enabled: boolean) => Promise<void>
  updateUserRole: (userId: number, roleName: string) => Promise<void>
  deleteUser: (userId: number) => Promise<void>
  updateUserPassword: (userId: number, password: string) => Promise<void>
  updateAccountLockStatus: (userId: number, lock: boolean) => Promise<void>
  updateAccountExpiryStatus: (userId: number, expire: boolean) => Promise<void>
  updateCredentialsExpiryStatus: (userId: number, expire: boolean) => Promise<void>
  updateUserEmail: (userId: number, email: string) => Promise<void>
  updateAccountExpiryDate: (userId: number, expiryDate: string | null) => Promise<void>
  updateCredentialsExpiryDate: (userId: number, expiryDate: string | null) => Promise<void>
  deactivateTwoFactor: (userId: number) => Promise<void>
  updateBaby: (babyId: number, babyData: Partial<Baby>) => Promise<void>
  deleteBaby: (babyId: number) => Promise<void>
}

const AdminContext = createContext<AdminContextType | null>(null)

// Constants for handling "never expires" dates
const NEVER_EXPIRES_DATE = "2125-12-31"
const isNeverExpiresDate = (date: string | null) => {
  return date === NEVER_EXPIRES_DATE || date === "2125-09-04" // Handle existing far future dates
}

const normalizeExpiryDate = (date: string | null): string | null => {
  if (!date || isNeverExpiresDate(date)) {
    return null
  }
  return date
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [babies, setBabies] = useState<Baby[]>([])
  const [logs, setLogs] = useState<Log[]>([])
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
            const userData = detailResponse.data
            // Normalize expiry dates (convert far future dates to null for UI)
            return {
              ...userData,
              accountExpiryDate: normalizeExpiryDate(userData.accountExpiryDate),
              credentialsExpiryDate: normalizeExpiryDate(userData.credentialsExpiryDate)
            }
          } catch (error) {
            console.warn(`Failed to fetch details for user ${user.userId}:`, error)
            return {
              ...user,
              accountExpiryDate: normalizeExpiryDate(user.accountExpiryDate),
              credentialsExpiryDate: normalizeExpiryDate(user.credentialsExpiryDate)
            }
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

  const fetchBabies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("JWT_TOKEN")
      const isAdmin = localStorage.getItem("IS_ADMIN")

      if (!token) {
        throw new Error("No authentication token found")
      }

      if (isAdmin !== "true") {
        throw new Error("User does not have admin privileges")
      }

      const response = await api.get("/admin/get-babies")
      const babiesData = Array.isArray(response.data) ? response.data : []
      
      // Sort babies by id
      const sortedBabies = babiesData.sort((a, b) => a.id - b.id)
      setBabies(sortedBabies)
    } catch (err) {
      console.error("Admin babies fetch error:", err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Error fetching babies"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("JWT_TOKEN")
      const isAdmin = localStorage.getItem("IS_ADMIN")

      if (!token) {
        throw new Error("No authentication token found")
      }

      if (isAdmin !== "true") {
        throw new Error("User does not have admin privileges")
      }

      const response = await api.get("/admin/logs")
      const logsData = Array.isArray(response.data) ? response.data : []
      
      // Sort logs by id descending (newest first)
      const sortedLogs = logsData.sort((a, b) => b.id - a.id)
      setLogs(sortedLogs)
    } catch (err) {
      console.error("Admin logs fetch error:", err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Error fetching logs"
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

  const updateUserPassword = useCallback(
    async (userId: number, password: string) => {
      try {
        await api.put(`/admin/update-password?userId=${userId}&password=${encodeURIComponent(password)}`)
        toast.success("User password updated successfully")
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating user password"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateAccountLockStatus = useCallback(
    async (userId: number, lock: boolean) => {
      try {
        await api.put(`/admin/update-lock-status?userId=${userId}&lock=${lock}`)

        // Update local state and maintain sort order
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, accountNonLocked: !lock } : user
          ).sort((a, b) => a.userId - b.userId)
        )

        toast.success(`User account ${lock ? "locked" : "unlocked"} successfully`)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating account lock status"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateAccountExpiryStatus = useCallback(
    async (userId: number, expire: boolean) => {
      try {
        await api.put(`/admin/update-expiry-status?userId=${userId}&expire=${expire}`)

        // Update local state and maintain sort order
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, accountNonExpired: !expire } : user
          ).sort((a, b) => a.userId - b.userId)
        )

        toast.success(`User account ${expire ? "expired" : "unexpired"} successfully`)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating account expiry status"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateCredentialsExpiryStatus = useCallback(
    async (userId: number, expire: boolean) => {
      try {
        await api.put(`/admin/update-credentials-expiry-status?userId=${userId}&expire=${expire}`)

        // Update local state and maintain sort order
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, credentialsNonExpired: !expire } : user
          ).sort((a, b) => a.userId - b.userId)
        )

        toast.success(`User credentials ${expire ? "expired" : "unexpired"} successfully`)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating credentials expiry status"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateUserEmail = useCallback(
    async (userId: number, email: string) => {
      try {
        await api.put(`/admin/update-email?userId=${userId}&email=${encodeURIComponent(email)}`)
        
        // Update local state and maintain sort order
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, email } : user
          ).sort((a, b) => a.userId - b.userId)
        )
        
        toast.success("User email updated successfully")
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating user email"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateAccountExpiryDate = useCallback(
    async (userId: number, expiryDate: string | null) => {
      try {
        // Backend expects a valid date string, so use a far future date for "no expiry"
        // This is a technical limitation of the current backend implementation
        const dateToSend = expiryDate || NEVER_EXPIRES_DATE
        const url = `/admin/update-account-expiry-date?userId=${userId}&expiryDate=${dateToSend}`
        await api.put(url)
        
        // Update local state - keep null in the UI but backend stores far future date
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, accountExpiryDate: expiryDate } : user
          ).sort((a, b) => a.userId - b.userId)
        )
        
        const message = expiryDate 
          ? "Account expiry date updated successfully"
          : "Account expiry date removed successfully"
        toast.success(message)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating account expiry date"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateCredentialsExpiryDate = useCallback(
    async (userId: number, expiryDate: string | null) => {
      try {
        // Backend expects a valid date string, so use a far future date for "no expiry"
        // This is a technical limitation of the current backend implementation
        const dateToSend = expiryDate || NEVER_EXPIRES_DATE
        const url = `/admin/update-credentials-expiry-date?userId=${userId}&expiryDate=${dateToSend}`
        await api.put(url)
        
        // Update local state - keep null in the UI but backend stores far future date
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, credentialsExpiryDate: expiryDate } : user
          ).sort((a, b) => a.userId - b.userId)
        )
        
        const message = expiryDate 
          ? "Credentials expiry date updated successfully"
          : "Credentials expiry date removed successfully"
        toast.success(message)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating credentials expiry date"
        toast.error(errorMessage)
      }
    },
    []
  )

  const deactivateTwoFactor = useCallback(
    async (userId: number) => {
      try {
        await api.put(`/admin/deactivate-2fa?userId=${userId}`)
        
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId 
              ? { 
                  ...user, 
                  twoFactorEnabled: false,
                  twoFactorSecret: null 
                } 
              : user
          ).sort((a, b) => a.userId - b.userId)
        )
        
        toast.success("Two-Factor Authentication deactivated successfully")
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error deactivating 2FA"
        toast.error(errorMessage)
      }
    },
    []
  )

  const updateBaby = useCallback(
    async (babyId: number, babyData: Partial<Baby>) => {
      try {
        await api.put(`/babies/${babyId}`, babyData)
        
        // Update local state
        setBabies((prevBabies) =>
          prevBabies.map((baby) =>
            baby.id === babyId ? { ...baby, ...babyData } : baby
          ).sort((a, b) => a.id - b.id)
        )
        
        toast.success("Baby updated successfully")
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Error updating baby"
        toast.error(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteBaby = useCallback(async (babyId: number) => {
    try {
      await api.delete(`/babies/${babyId}`)

      // Remove from local state
      setBabies((prevBabies) =>
        prevBabies.filter((baby) => baby.id !== babyId).sort((a, b) => a.id - b.id)
      )

      toast.success("Baby deleted successfully")
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Error deleting baby"
      toast.error(errorMessage)
      throw err
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
    babies,
    logs,
    loading,
    error,
    fetchUsers,
    fetchBabies,
    fetchLogs,
    getUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    updateUserPassword,
    updateAccountLockStatus,
    updateAccountExpiryStatus,
    updateCredentialsExpiryStatus,
    updateUserEmail,
    updateAccountExpiryDate,
    updateCredentialsExpiryDate,
    deactivateTwoFactor,
    updateBaby,
    deleteBaby,
  }

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContext
