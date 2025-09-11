import { useState, useEffect, useContext, useCallback } from "react"
import AuthContext from "@/context/AuthContext"
import api from "@/services/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDownIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"
import moment from "moment"

interface DecodedToken {
  sub: string
  iat: number
  exp: number
}

interface UserProfile {
  id: number
  username: string
  email: string
  roles: string[]
  accountNonExpired: boolean
  accountNonLocked: boolean
  enabled: boolean
  credentialsNonExpired: boolean
  credentialsExpiryDate: string
}

interface FormData {
  username: string
  email: string
  password: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message: string
}

function Profile() {
  const authCtx = useContext(AuthContext)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loginSession, setLoginSession] = useState<string | null>(null)
  const [credentialExpireDate, setCredentialExpireDate] = useState<
    string | null
  >(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [pageLoader, setPageLoader] = useState(true)
  const [loading, setLoading] = useState(false)

  // Account settings state
  const [accountExpired, setAccountExpired] = useState(false)
  const [accountLocked, setAccountLock] = useState(false)
  const [accountEnabled, setAccountEnabled] = useState(false)
  const [credentialExpired, setCredentialExpired] = useState(false)

  // Accordion states
  const [openAccount, setOpenAccount] = useState(false)
  const [openSetting, setOpenSetting] = useState(false)

  // 2FA state
  const [is2faEnabled, setIs2faEnabled] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState(1) // Step 1: Enable, Step 2: Verify
  const [disabledLoader, setDisabledLoader] = useState(false)
  const [twofaCodeLoader, setTwofaCodeLoader] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  })

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      setPageLoader(true)
      const response = await api.get("/auth/user")
      const data = response.data
      setUserProfile(data)

      setValue("username", data.username)
      setValue("email", data.email)
      setAccountExpired(!data.accountNonExpired)
      setAccountLock(!data.accountNonLocked)
      setAccountEnabled(data.enabled)
      setCredentialExpired(!data.credentialsNonExpired)

      const expiredFormatDate = moment(data.credentialsExpiryDate).format(
        "D MMMM YYYY"
      )
      setCredentialExpireDate(expiredFormatDate)
    } catch (error) {
      const apiError = error as ApiError
      setPageError(apiError?.response?.data?.message || apiError.message)
      toast.error("Error fetching user profile")
    } finally {
      setPageLoader(false)
    }
  }, [setValue])

  // Fetch 2FA status
  const fetch2FAStatus = async () => {
    try {
      const response = await api.get("/auth/user/2fa-status")
      setIs2faEnabled(response.data.is2faEnabled)
    } catch (error) {
      const apiError = error as ApiError
      setPageError(apiError?.response?.data?.message || apiError.message)
      toast.error("Error fetching 2FA status")
    }
  }

  useEffect(() => {
    fetchUserProfile()
    fetch2FAStatus()
  }, [fetchUserProfile])

  useEffect(() => {
    if (authCtx?.token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(authCtx.token)
        const lastLoginSession = moment
          .unix(decodedToken.iat)
          .format("dddd, D MMMM YYYY, h:mm A")
        setLoginSession(lastLoginSession)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }, [authCtx?.token])

  // Enable 2FA
  const enable2FA = async () => {
    setDisabledLoader(true)
    try {
      const response = await api.post("/auth/enable-2fa")
      setQrCodeUrl(response.data)
      setStep(2)
    } catch {
      toast.error("Error enabling 2FA")
    } finally {
      setDisabledLoader(false)
    }
  }

  // Disable 2FA
  const disable2FA = async () => {
    setDisabledLoader(true)
    try {
      await api.post("/auth/disable-2fa")
      setIs2faEnabled(false)
      setQrCodeUrl("")
      setStep(1)
      toast.success("2FA disabled successfully")
    } catch {
      toast.error("Error disabling 2FA")
    } finally {
      setDisabledLoader(false)
    }
  }

  // Verify 2FA
  const verify2FA = async () => {
    if (!code || code.trim().length === 0) {
      return toast.error("Please Enter The Code To Verify")
    }

    setTwofaCodeLoader(true)
    try {
      const formData = new URLSearchParams()
      formData.append("code", code)

      await api.post("/auth/verify-2fa", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      toast.success("2FA verified successfully")
      setIs2faEnabled(true)
      setStep(1)
      setCode("")
    } catch {
      toast.error("Invalid 2FA Code")
    } finally {
      setTwofaCodeLoader(false)
    }
  }

  // Update email and password
  const handleUpdateCredential = async (data: FormData) => {
    const { email, password } = data

    if (!password || password.trim() === "") {
      toast.error("Password is required")
      return
    }

    try {
      setLoading(true)
      const formData = new URLSearchParams()
      formData.append("token", authCtx?.token || "")
      formData.append("newEmail", email)
      formData.append("newPassword", password)

      await api.post("/auth/update-credentials", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      toast.success("Credentials updated successfully")
      await fetchUserProfile()
    } catch {
      toast.error("Failed to update credentials")
    } finally {
      setLoading(false)
    }
  }


  if (pageError) {
    return (
      <div className="flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-destructive mb-2 text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">{pageError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-74px)] py-10">
      {pageLoader ? (
        <div className="flex h-72 flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
          <span className="mt-4">Please wait...</span>
        </div>
      ) : (
        <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col gap-6 px-4 lg:flex-row">
          {/* Left side - User Profile */}
          <div className="flex-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="mx-auto mb-4 h-20 w-20">
                  <AvatarImage src="/static/images/avatar/1.jpg" />
                  <AvatarFallback>
                    {userProfile?.username ? 
                      (userProfile.username[0]?.toUpperCase() || '') + 
                      (userProfile.username[1]?.toUpperCase() || '') 
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">
                  {userProfile?.username}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Username:</span>
                    <span className="text-muted-foreground">
                      {userProfile?.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Role:</span>
                    <span className="text-muted-foreground">
                      {userProfile?.roles?.[0] || "ROLE_USER"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Update Credentials */}
                <Collapsible open={openAccount} onOpenChange={setOpenAccount}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="text-lg font-semibold">
                        Update Email & Password
                      </span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <form
                      onSubmit={handleSubmit(handleUpdateCredential)}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          readOnly
                          className="bg-muted"
                          {...register("username", {
                            required: "Username is required",
                          })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Username cannot be changed
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...register("email", {
                            required: "Email is required",
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">New Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter new password"
                          {...register("password", {
                            required: "New password is required",
                            minLength: {
                              value: 6,
                              message: "Password must be at least 6 characters",
                            },
                          })}
                        />
                        {errors.password && (
                          <p className="text-destructive mt-1 text-sm">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Update
                      </Button>
                    </form>
                  </CollapsibleContent>
                </Collapsible>

                {/* Account Settings */}
                <Collapsible open={openSetting} onOpenChange={setOpenSetting}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="text-lg font-semibold">
                        Account Information
                      </span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <div className="mb-3 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Account status information is read-only for security purposes.
                        Contact your administrator for any changes.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Account Expired</Label>
                        <Badge variant={accountExpired ? "destructive" : "secondary"}>
                          {accountExpired ? "Expired" : "Active"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Account Locked</Label>
                        <Badge variant={accountLocked ? "destructive" : "secondary"}>
                          {accountLocked ? "Locked" : "Unlocked"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Account Enabled</Label>
                        <Badge variant={accountEnabled ? "default" : "destructive"}>
                          {accountEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Credential Settings</Label>
                        <Card className="p-4">
                          <p className="text-muted-foreground text-sm">
                            Your credentials will expire on{" "}
                            <span className="font-medium">
                              {credentialExpireDate}
                            </span>
                          </p>
                        </Card>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Credential Expired</Label>
                        <Badge variant={credentialExpired ? "destructive" : "default"}>
                          {credentialExpired ? "Expired" : "Valid"}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Last Login Session */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">
                    Last Login Session
                  </Label>
                  <Card className="p-4">
                    <p className="text-muted-foreground text-sm">
                      Your last login session:
                      <br />
                      <span className="font-medium">{loginSession}</span>
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - 2FA */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">
                      Authentication (MFA)
                    </CardTitle>
                    <Badge variant={is2faEnabled ? "default" : "destructive"}>
                      {is2faEnabled ? "Activated" : "Deactivated"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    Multi Factor Authentication
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Two Factor Authentication adds an additional layer of
                    security to your account
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={is2faEnabled ? disable2FA : enable2FA}
                  disabled={disabledLoader}
                  variant={is2faEnabled ? "destructive" : "default"}
                  className="w-full"
                >
                  {disabledLoader ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {is2faEnabled
                    ? "Disable Two Factor Authentication"
                    : "Enable Two Factor Authentication"}
                </Button>

                {step === 2 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="font-bold uppercase">
                          QR Code To Scan
                        </span>
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      <div className="text-center">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="mx-auto mb-4"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="Enter 2FA code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={verify2FA}
                            disabled={twofaCodeLoader}
                          >
                            {twofaCodeLoader ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Verify 2FA"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
