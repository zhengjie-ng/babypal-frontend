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
}

interface User {
  username: string
  email?: string
  role: Role
}

interface AuthContextType {
  signup: (data: SignupData) => Promise<void>
  onLoginHandler: (data: LoginData) => Promise<void>
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem("JWT_TOKEN")
  const storedIsAdmin = localStorage.getItem("IS_ADMIN") === "true"

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(storedToken || "")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(storedIsAdmin)

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

  const onLoginHandler = async (data: LoginData) => {
    try {
      setLoading(true)
      const loginData = {
        ...data,
        username: data.username.toLowerCase(),
      }

      const response = await api.post("/auth/public/signin", loginData)

      if (response.status === 200 && response.data.jwtToken) {
        const decodedToken = jwtDecode<DecodedToken>(response.data.jwtToken)
        handleSuccessfulLogin(response.data.jwtToken, decodedToken)
        toast.success("Login Successful")
      } else {
        toast.error(
          "Login failed. Please check your credentials and try again."
        )
      }
    } catch (error) {
      console.log(error)
      toast.error("Invalid credentials")
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
        const { data } = await api.get("/auth/user")
        if (data.roles.includes("ROLE_ADMIN")) {
          localStorage.setItem("IS_ADMIN", "true")
          setIsAdmin(true)
        } else {
          localStorage.removeItem("IS_ADMIN")
          setIsAdmin(false)
        }
        setCurrentUser(data)
      } catch (error) {
        console.error("Error fetching current user", error)
        toast.error("Error fetching current user")
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

  const contextValue: AuthContextType = {
    signup,
    onLoginHandler,
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
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export default AuthContext
