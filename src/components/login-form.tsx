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
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Link } from "react-router-dom"
import { useContext, useState } from "react"
import AuthContext from "@/context/AuthContext"
import { CredentialExpiredDialog } from "@/components/credential-expired-dialog"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const authCtx = useContext(AuthContext)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (authCtx?.onLoginHandler) {
      await authCtx.onLoginHandler(formData)
    }
  }

  const handlePasswordReset = async (email: string) => {
    if (authCtx?.onPasswordForgotHandler) {
      await authCtx.onPasswordForgotHandler({ email })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-2">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="relative">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-primary ml-auto text-sm hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="shadow-sm pr-10"
                      autoComplete="current-password"
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
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full shadow-sm"
                  disabled={authCtx?.loading}
                >
                  {authCtx?.loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <span className="relative bg-background text-muted-foreground px-2 text-sm">
                  New to BabyPal?
                </span>
              </div>
              <Button
                variant="outline"
                type="button"
                className="shadow-sm"
                onClick={() => (window.location.href = "/signup")}
              >
                Create an account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Credential Expired Dialog */}
      <CredentialExpiredDialog
        open={!!authCtx?.credentialExpiredUser}
        onOpenChange={(open) => {
          if (!open && authCtx?.setCredentialExpiredUser) {
            authCtx.setCredentialExpiredUser(null)
          }
        }}
        username={authCtx?.credentialExpiredUser || ""}
        onPasswordReset={handlePasswordReset}
        loading={authCtx?.loading}
      />
    </div>
  )
}
