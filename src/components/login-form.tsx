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
import { Separator } from "@/components/ui/separator"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { FaGoogle, FaGithub } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useContext, useState } from "react"
import AuthContext from "@/context/AuthContext"
import { CredentialExpiredDialog } from "@/components/credential-expired-dialog"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const authCtx = useContext(AuthContext)
  const [step, setStep] = useState(1) // Step 1: Login, Step 2: 2FA verification
  const [jwtToken, setJwtToken] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    code: "",
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
      const result = await authCtx.onLoginHandler(formData)
      if (result?.requiresTwoFA && result.jwtToken) {
        setJwtToken(result.jwtToken)
        setStep(2)
      }
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (authCtx?.verify2FALogin && jwtToken && formData.code) {
      await authCtx.verify2FALogin(formData.code, jwtToken)
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
        {step === 1 ? (
          // Step 1: Login Form
          <>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Login with your Google account or Github account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* OAuth Sign-in Buttons */}
              <div className="mb-6 grid gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full shadow-sm"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_OAUTH_URL}/oauth2/authorization/google`
                  }}
                >
                  <FaGoogle className="mr-2 h-4 w-4 text-black" />
                  Sign in with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full shadow-sm"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_OAUTH_URL}/oauth2/authorization/github`
                  }}
                >
                  <FaGithub className="mr-2 h-4 w-4" />
                  Sign in with GitHub
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    Or continue with
                  </span>
                </div>
              </div>

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
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
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
                          className="pr-10 shadow-sm"
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <Eye className="text-muted-foreground h-4 w-4" />
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
                  <div className="relative mt-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <span className="bg-background text-muted-foreground relative px-2 text-sm">
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
          </>
        ) : (
          // Step 2: 2FA Verification Form
          <>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Verify 2FA</CardTitle>
              <CardDescription>
                Enter the authentication code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify2FA} className="relative">
                <div className="grid gap-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-medium">
                        Authentication Code
                      </Label>
                      <Input
                        id="code"
                        placeholder="Enter your 2FA code"
                        type="text"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        className="text-center text-lg tracking-widest shadow-sm"
                        autoComplete="one-time-code"
                        maxLength={6}
                      />
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
                          Verifying...
                        </>
                      ) : (
                        "Verify 2FA"
                      )}
                    </Button>
                  </div>
                  <div className="relative text-center">
                    <Separator />
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    className="shadow-sm"
                    onClick={() => {
                      setStep(1)
                      setJwtToken("")
                      setFormData((prev) => ({ ...prev, code: "" }))
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
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
