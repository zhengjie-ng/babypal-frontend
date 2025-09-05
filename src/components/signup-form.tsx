import { useCallback, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import AuthContext from "@/context/AuthContext"
import { useContext } from "react"

export function SignupForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  if (!auth) {
    throw new Error("AuthContext not found")
  }
  const { signup } = auth
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    signUpMethod: "email" as const,
    twoFactorEnabled: false,
  })

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  })

  const validateForm = useCallback(() => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      await signup(formData)
      toast.success("Account created successfully!")
      navigate("/login")
    } catch (error: unknown) {
      console.error("Signup error:", error)
      const axiosError = error as { response?: { data?: { message?: string } } }
      if (
        axiosError?.response?.data?.message ===
        "Error: Username is already taken!"
      ) {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already taken",
        }))
      } else if (
        axiosError?.response?.data?.message ===
        "Error: Email is already in use!"
      ) {
        setErrors((prev) => ({ ...prev, email: "Email is already in use" }))
      } else {
        const errorMessage =
          axiosError?.response?.data?.message ||
          (error instanceof Error ? error.message : "Unknown error occurred")
        if (
          errorMessage.includes("Account created but login token was invalid")
        ) {
          toast.success("Account created successfully!")
          toast("Please log in to continue", {
            description: "You'll be redirected to the login page.",
          })
          navigate("/login")
          return
        }
        toast.error("Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="grid gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start tracking your baby's growth and development
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-xs"
              >
                {errors.username}
              </motion.p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-xs"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-xs"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sign Up
          </Button>

          <div className="relative mt-2">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary underline-offset-4 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
