import { useContext } from "react"
import AuthContext from "@/context/AuthContext"
import AdminContext from "@/context/AdminContext"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

export function AdminDebug() {
  const authCtx = useContext(AuthContext)
  const adminCtx = useContext(AdminContext)

  const token = localStorage.getItem("JWT_TOKEN")
  const isAdminStorage = localStorage.getItem("IS_ADMIN")
  const storedUser = localStorage.getItem("USER")

  const debugInfo = {
    // Token info
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token?.substring(0, 50) + "..." || "No token",
    
    // Auth context
    authIsAdmin: authCtx?.isAdmin,
    authCurrentUser: authCtx?.currentUser,
    authLoading: authCtx?.loading,
    
    // Local storage
    storedIsAdmin: isAdminStorage,
    storedUser: storedUser ? JSON.parse(storedUser) : null,
    
    // Admin context
    adminLoading: adminCtx?.loading,
    adminError: adminCtx?.error,
    usersCount: adminCtx?.users?.length || 0,

    // Environment Variables
    viteClientUrl: import.meta.env.VITE_CLIENT_URL,
    viteApiUrl: import.meta.env.VITE_API_URL,
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">🐛 Admin Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Authentication Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Has Token:</span>
              <Badge 
                variant={debugInfo.hasToken ? "default" : "destructive"} 
                className={`ml-2 ${debugInfo.hasToken ? "dark:text-white" : ""}`}
              >
                {debugInfo.hasToken ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Auth Loading:</span>
              <Badge 
                variant={debugInfo.authLoading ? "secondary" : "default"} 
                className={`ml-2 ${!debugInfo.authLoading ? "dark:text-white" : ""}`}
              >
                {debugInfo.authLoading ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Auth Is Admin:</span>
              <Badge 
                variant={debugInfo.authIsAdmin ? "default" : "destructive"} 
                className={`ml-2 ${debugInfo.authIsAdmin ? "dark:text-white" : ""}`}
              >
                {debugInfo.authIsAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Storage Is Admin:</span>
              <Badge 
                variant={debugInfo.storedIsAdmin === "true" ? "default" : "destructive"} 
                className={`ml-2 ${debugInfo.storedIsAdmin === "true" ? "dark:text-white" : ""}`}
              >
                {debugInfo.storedIsAdmin || "Not set"}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">User Info</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Username:</span>
              <span className="ml-2">{debugInfo.authCurrentUser?.username || "Not loaded"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2">{debugInfo.authCurrentUser?.email || "Not loaded"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>
              <span className="ml-2">
                {debugInfo.authCurrentUser?.role?.roleName || "Not loaded"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Admin Context</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Admin Loading:</span>
              <Badge 
                variant={debugInfo.adminLoading ? "secondary" : "default"} 
                className={`ml-2 ${!debugInfo.adminLoading ? "dark:text-white" : ""}`}
              >
                {debugInfo.adminLoading ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Admin Error:</span>
              <span className="ml-2 text-red-600">{debugInfo.adminError || "None"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Users Loaded:</span>
              <span className="ml-2">{debugInfo.usersCount}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Environment Variables</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">VITE_CLIENT_URL:</span>
              <span className="ml-2 font-mono">{debugInfo.viteClientUrl || "Not set"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">VITE_API_URL:</span>
              <span className="ml-2 font-mono">{debugInfo.viteApiUrl || "Not set"}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Raw Data</h4>
          <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}