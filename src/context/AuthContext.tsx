import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
// import toast from "react-hot-toast"
import { toast } from "sonner"
import api from "@/services/api"

interface SignupData {
  username: string
  email: string
  password: string
  signUpMethod: "email"
  twoFactorEnabled: boolean
}

interface LoginData {
  username: string
  password: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  password: string
  token: string
}

interface Role {
  roleId: number
  roleName: string
}

interface DecodedToken {
  sub: string
  role?: Role
  exp?: number
  is2faEnabled?: boolean
}

interface User {
  username: string
  email?: string
  role: Role
}

interface ProfileData {
  username: string
  password: string
}

interface LoginResult {
  requiresTwoFA: boolean
  jwtToken?: string
}

interface AuthContextType {
  signup: (data: SignupData) => Promise<void>
  onLoginHandler: (data: LoginData) => Promise<LoginResult | void>
  verify2FALogin: (code: string, jwtToken: string) => Promise<void>
  onPasswordForgotHandler: (data: ForgotPasswordData) => Promise<void>
  onResetPasswordHandler: (data: ResetPasswordData) => Promise<void>
  onLogoutHandler: () => void
  token: string
  setToken: (token: string) => void
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  checkUserExists: (username: string) => Promise<boolean>
  credentialExpiredUser: string | null
  setCredentialExpiredUser: (username: string | null) => void
  // Profile management functions
  fetch2FAStatus: () => Promise<{ is2faEnabled: boolean }>
  enable2FA: () => Promise<string>
  disable2FA: () => Promise<void>
  verify2FA: (code: string) => Promise<void>
  updateCredentials: (data: ProfileData) => Promise<void>
  updateAccountExpiryStatus: (expired: boolean) => Promise<void>
  updateAccountLockStatus: (locked: boolean) => Promise<void>
  updateAccountEnabledStatus: (enabled: boolean) => Promise<void>
  updateCredentialsExpiryStatus: (expired: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem("JWT_TOKEN")
  const storedIsAdmin = localStorage.getItem("IS_ADMIN") === "true"

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(storedToken || "")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(storedIsAdmin)
  const [credentialExpiredUser, setCredentialExpiredUser] = useState<string | null>(null)

  const navigate = useNavigate()

  const onLogoutHandler = useCallback(() => {
    // Clear all authentication data from localStorage
    localStorage.removeItem("JWT_TOKEN")
    localStorage.removeItem("USER")
    localStorage.removeItem("IS_ADMIN")
    localStorage.removeItem("CSRF_TOKEN")

    // Reset all state
    setToken("")
    setCurrentUser(null)
    setIsAdmin(false)

    // Navigate to login page
    navigate("/login")

    // Show success message
    toast.success("Logged out successfully")
  }, [navigate])

  useEffect(() => {
    const verifyAndFetchUser = () => {
      if (token) {
        try {
          // Verify token hasn't expired
          const decoded = jwtDecode<DecodedToken>(token)
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            // Token has expired
            console.log("Token expired")
            onLogoutHandler()
            return
          }
          fetchUser()
        } catch (error) {
          console.error("Invalid token:", error)
          onLogoutHandler()
        }
      }
    }

    verifyAndFetchUser()
  }, [token, onLogoutHandler])

  const handleSuccessfulLogin = (token: string, decodedToken: DecodedToken) => {
    const user: User = {
      username: decodedToken.sub,
      role: decodedToken.role || { roleId: 1, roleName: "ROLE_USER" },
    }
    localStorage.setItem("JWT_TOKEN", token)
    localStorage.setItem("USER", JSON.stringify(user))
    setToken(token)
    navigate("/home")
  }

  const onLoginHandler = async (data: LoginData): Promise<LoginResult | void> => {
    try {
      setLoading(true)
      const loginData = {
        ...data,
        username: data.username.toLowerCase(),
      }

      const response = await api.post("/auth/public/signin", loginData)

      if (response.status === 200 && response.data.jwtToken) {
        const decodedToken = jwtDecode<DecodedToken>(response.data.jwtToken)
        
        // Check if 2FA is enabled for this user
        if (decodedToken.is2faEnabled) {
          toast.success("Login successful! Please verify with 2FA.")
          return {
            requiresTwoFA: true,
            jwtToken: response.data.jwtToken
          }
        } else {
          // Normal login without 2FA
          handleSuccessfulLogin(response.data.jwtToken, decodedToken)
          toast.success("Login Successful")
        }
      } else {
        toast.error(
          "Login failed. Please check your credentials and try again."
        )
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: { message?: string; error?: string } } }
      console.log(error)
      
      // Check if it's a credential expired error
      if (apiError.response?.status === 401) {
        const errorMessage = apiError.response?.data?.message || apiError.response?.data?.error || ""
        
        if (errorMessage.toLowerCase().includes("credential") && 
            (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("expire"))) {
          // Credentials are expired, show the dialog
          setCredentialExpiredUser(data.username.toLowerCase())
          toast.error("Your password has expired. Please reset it to continue.")
          return
        }
      }
      
      // Handle other login errors
      const errorMessage = apiError.response?.data?.message || "Invalid credentials"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    const storedUser = localStorage.getItem("USER")
    if (!storedUser) return

    const user: User = JSON.parse(storedUser)

    if (user.username) {
      try {
        setLoading(true)
        const { data } = await api.get("/auth/user")
        if (data.roles.includes("ROLE_ADMIN")) {
          localStorage.setItem("IS_ADMIN", "true")
          setIsAdmin(true)
        } else {
          localStorage.removeItem("IS_ADMIN")
          setIsAdmin(false)
        }
        
        // Transform the API response to match the User interface
        const transformedUser: User = {
          username: data.username || user.username,
          email: data.email,
          role: {
            roleId: data.roles.includes("ROLE_ADMIN") ? 2 : 1,
            roleName: data.roles.includes("ROLE_ADMIN") ? "ROLE_ADMIN" : "ROLE_USER"
          }
        }
        
        setCurrentUser(transformedUser)
        // Update localStorage with fresh user data
        localStorage.setItem("USER", JSON.stringify(transformedUser))
      } catch (error) {
        console.error("Error fetching current user", error)
        toast.error("Error fetching current user")
      } finally {
        setLoading(false)
      }
    }
  }

  const checkUserExists = async (username: string): Promise<boolean> => {
    try {
      const response = await api.get(`/users/check/${username}`)
      return response.data.exists
    } catch (error) {
      console.error("Error checking user existence:", error)
      return false
    }
  }

  const signup = async (data: SignupData): Promise<void> => {
    try {
      setLoading(true)
      const response = await api.post("/auth/public/signup", data)

      // Check if the registration was successful
      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Failed to create account")
      }
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const onPasswordForgotHandler = async (
    data: ForgotPasswordData
  ): Promise<void> => {
    const { email } = data
    try {
      setLoading(true)

      const formData = new URLSearchParams()
      formData.append("email", email)
      await api.post("/auth/public/forgot-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      //showing success message
      toast.success("Password reset email sent! Check your inbox.")
    } catch (error) {
      console.log(error)
      toast.error("Error sending password reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onResetPasswordHandler = async (data: ResetPasswordData): Promise<void> => {
    const { password, token } = data

    try {
      setLoading(true)

      const formData = new URLSearchParams()
      formData.append("token", token)
      formData.append("newPassword", password)
      
      await api.post("/auth/public/reset-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      
      toast.success("Password reset successful! You can now log in.")
      navigate("/login")
    } catch (error) {
      console.log(error)
      toast.error("Error resetting password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Profile management functions
  const fetch2FAStatus = async (): Promise<{ is2faEnabled: boolean }> => {
    try {
      const response = await api.get("/auth/user/2fa-status")
      return response.data
    } catch (error) {
      console.error("Error fetching 2FA status:", error)
      throw error
    }
  }

  const enable2FA = async (): Promise<string> => {
    try {
      const response = await api.post("/auth/enable-2fa")
      return response.data
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      throw error
    }
  }

  const disable2FA = async (): Promise<void> => {
    try {
      await api.post("/auth/disable-2fa")
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      throw error
    }
  }

  const verify2FA = async (code: string): Promise<void> => {
    try {
      const formData = new URLSearchParams()
      formData.append("code", code)

      await api.post("/auth/verify-2fa", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    } catch (error) {
      console.error("Error verifying 2FA:", error)
      throw error
    }
  }

  const updateCredentials = async (data: ProfileData): Promise<void> => {
    try {
      const formData = new URLSearchParams()
      formData.append("token", token)
      formData.append("newUsername", data.username)
      formData.append("newPassword", data.password)

      await api.post("/auth/update-credentials", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    } catch (error) {
      console.error("Error updating credentials:", error)
      throw error
    }
  }

  const updateAccountExpiryStatus = async (expired: boolean): Promise<void> => {
    try {
      const formData = new URLSearchParams()
      formData.append("token", token)
      formData.append("expire", expired.toString())

      await api.put("/auth/update-expiry-status", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    } catch (error) {
      console.error("Error updating account expiry status:", error)
      throw error
    }
  }

  const updateAccountLockStatus = async (locked: boolean): Promise<void> => {
    try {
      const formData = new URLSearchParams()
      formData.append("token", token)
      formData.append("lock", locked.toString())

      await api.put("/auth/update-lock-status", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    } catch (error) {
      console.error("Error updating account lock status:", error)
      throw error
    }
  }

  const updateAccountEnabledStatus = async (enabled: boolean): Promise<void> => {
    try {
      const formData = new URLSearchParams()
      formData.append("token", token)
      formData.append("enabled", enabled.toString())

      await api.put("/auth/update-enabled-status", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    } catch (error) {
      console.error("Error updating account enabled status:", error)
      throw error
    }
  }

  const updateCredentialsExpiryStatus = async (expired: boolean): Promise<void> => {
    try {
      const formData = new URLSearchParams()
      formData.append("token", token)
      formData.append("expire", expired.toString())

      await api.put("/auth/update-credentials-expiry-status", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    } catch (error) {
      console.error("Error updating credentials expiry status:", error)
      throw error
    }
  }

  const verify2FALogin = async (code: string, jwtToken: string): Promise<void> => {
    try {
      setLoading(true)
      const formData = new URLSearchParams()
      formData.append("code", code)
      formData.append("jwtToken", jwtToken)

      await api.post("/auth/public/verify-2fa-login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      const decodedToken = jwtDecode<DecodedToken>(jwtToken)
      handleSuccessfulLogin(jwtToken, decodedToken)
      toast.success("2FA verification successful!")
    } catch (error) {
      console.error("2FA verification error:", error)
      toast.error("Invalid 2FA code. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const contextValue: AuthContextType = {
    signup,
    onLoginHandler,
    verify2FALogin,
    onPasswordForgotHandler,
    onResetPasswordHandler,
    onLogoutHandler,
    token,
    setToken,
    currentUser,
    setCurrentUser,
    isAdmin,
    setIsAdmin,
    loading,
    setLoading,
    checkUserExists,
    credentialExpiredUser,
    setCredentialExpiredUser,
    // Profile management functions
    fetch2FAStatus,
    enable2FA,
    disable2FA,
    verify2FA,
    updateCredentials,
    updateAccountExpiryStatus,
    updateAccountLockStatus,
    updateAccountEnabledStatus,
    updateCredentialsExpiryStatus,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export default AuthContext
