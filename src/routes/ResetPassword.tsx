import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { useContext, useState, useEffect } from "react"
import AuthContext from "@/context/AuthContext"

function ResetPassword() {
  const authCtx = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
    }
  }, [token])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }

    if (authCtx?.onResetPasswordHandler && token) {
      await authCtx.onResetPasswordHandler({
        password: formData.password,
        token,
      })
      setIsSubmitted(true)
    }
  }

  const passwordsMatch = formData.password && formData.confirmPassword && 
    formData.password === formData.confirmPassword

  const isFormValid = formData.password && formData.confirmPassword && 
    passwordsMatch && formData.password.length >= 6

  if (!isValidToken) {
    return (
      <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
        <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
          <Card className="border-2 border-destructive/20">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl text-destructive">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link to continue.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/forgot-password">
                    Request New Reset Link
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
        <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
          <Card className="border-2 border-green-200">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Password Reset Complete</CardTitle>
              <CardDescription>
                Your password has been successfully updated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/login">
                  Sign In with New Password
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below to complete the reset process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Enter your new password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm pr-10"
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formData.password && formData.password.length < 6 && (
                    <p className="text-sm text-destructive">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      placeholder="Confirm your new password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={cn(
                        "shadow-sm pr-10",
                        formData.confirmPassword && !passwordsMatch && "border-destructive"
                      )}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-destructive">
                      Passwords do not match
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="text-sm text-green-600">
                      Passwords match ✓
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full shadow-sm"
                  disabled={authCtx?.loading || !isFormValid}
                >
                  {authCtx?.loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
