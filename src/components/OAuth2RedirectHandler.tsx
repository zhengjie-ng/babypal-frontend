import { useEffect, useContext, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import AuthContext from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

interface DecodedToken {
  sub: string
  role?: {
    roleId: number
    roleName: string
  }
  exp?: number
  roles?: string
}

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const authCtx = useContext(AuthContext)
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // Prevent re-execution if already processed
    if (hasProcessedRef.current) {
      return
    }
    const params = new URLSearchParams(location.search)
    const token = params.get("token")
    const error = params.get("error")

    console.log("OAuth2RedirectHandler: Params:", params.toString())
    console.log("OAuth2RedirectHandler: Token:", token)
    console.log("OAuth2RedirectHandler: Error:", error)

    if (error) {
      console.error("OAuth2 authentication error:", error)
      hasProcessedRef.current = true
      navigate("/login")
      return
    }

    if (token && authCtx) {
      try {
        console.log("Raw JWT Token from OAuth:", token)
        const decodedToken = jwtDecode<DecodedToken>(token)
        console.log("Decoded Token:", decodedToken)
        console.log("Token expiry:", decodedToken.exp, new Date(decodedToken.exp! * 1000))
        console.log("Username from token:", decodedToken.sub)
        console.log("Roles from token:", decodedToken.roles)

        // Store token in localStorage
        localStorage.setItem("JWT_TOKEN", token)

        // Check if user is admin from roles string
        const roles = decodedToken.roles?.split(",") || []
        const isAdmin = roles.includes("ROLE_ADMIN")
        
        // Create user object from decoded token with proper role assignment
        const user = {
          username: decodedToken.sub,
          email: decodedToken.sub.includes("@") ? decodedToken.sub : undefined,
          role: isAdmin 
            ? { roleId: 2, roleName: "ROLE_ADMIN" } 
            : decodedToken.role || { roleId: 1, roleName: "ROLE_USER" },
        }

        console.log("User Object:", user)
        localStorage.setItem("USER", JSON.stringify(user))

        // Update context state
        authCtx.setToken(token)
        authCtx.setCurrentUser(user)
        authCtx.setIsAdmin(isAdmin)
        
        if (isAdmin) {
          localStorage.setItem("IS_ADMIN", "true")
        } else {
          localStorage.removeItem("IS_ADMIN")
        }

        // Mark as processed and navigate
        hasProcessedRef.current = true
        
        // Delay navigation to ensure local storage operations complete
        setTimeout(() => {
          console.log("Navigating to /home")
          navigate("/home")
        }, 100)
      } catch (error) {
        console.error("Token decoding failed:", error)
        hasProcessedRef.current = true
        navigate("/login")
      }
    } else {
      console.log("Token not found in URL, redirecting to login")
      hasProcessedRef.current = true
      navigate("/login")
    }
  }, [location.search, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  )
}

export default OAuth2RedirectHandler