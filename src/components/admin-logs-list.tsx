import { useContext, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Calendar,
  User,
  Activity,
  Filter,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import AdminContext from "@/context/AdminContext"
import { format } from "date-fns"

interface Log {
  id: number
  username: string
  type: string
  typeId: number
  action: string
  statusCode: string
  createdAt: string
}

type SortField = "id" | "username" | "type" | "action" | "statusCode" | "createdAt"
type SortDirection = "asc" | "desc"

export function AdminLogsList() {
  const adminCtx = useContext(AdminContext)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [pageSize, setPageSize] = useState<number>(30)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  // Filter and sort logs
  const filteredAndSortedLogs = [...(adminCtx?.logs || [])]
    .filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || log.type === typeFilter
      const matchesStatus =
        statusFilter === "all" || log.statusCode === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "id":
          aValue = a.id
          bValue = b.id
          break
        case "username":
          aValue = a.username.toLowerCase()
          bValue = b.username.toLowerCase()
          break
        case "type":
          aValue = a.type.toLowerCase()
          bValue = b.type.toLowerCase()
          break
        case "action":
          aValue = a.action.toLowerCase()
          bValue = b.action.toLowerCase()
          break
        case "statusCode":
          aValue = parseInt(a.statusCode)
          bValue = parseInt(b.statusCode)
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          aValue = a.id
          bValue = b.id
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  // Calculate pagination
  const totalLogs = filteredAndSortedLogs.length
  const totalPages = Math.ceil(totalLogs / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentLogs = filteredAndSortedLogs.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy, hh:mm:ss a")
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (statusCode: string) => {
    const code = parseInt(statusCode)
    if (code >= 200 && code < 300) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{statusCode}</Badge>
    } else if (code >= 400 && code < 500) {
      return <Badge variant="destructive">{statusCode}</Badge>
    } else if (code >= 500) {
      return <Badge variant="destructive" className="bg-red-600">{statusCode}</Badge>
    }
    return <Badge variant="outline">{statusCode}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const colorMap: { [key: string]: string } = {
      AUTH: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      BABY: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      RECORD: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      GROWTH_GUIDE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    }
    
    return (
      <Badge variant="outline" className={colorMap[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"}>
        {type}
      </Badge>
    )
  }

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(adminCtx?.logs.map((log) => log.type) || []))
  const uniqueStatusCodes = Array.from(new Set(adminCtx?.logs.map((log) => log.statusCode) || []))

  return (
    <>
      {/* Logs Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Logs Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {adminCtx?.logs.length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Total Logs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {adminCtx?.logs.filter((log) => {
                  const code = parseInt(log.statusCode)
                  return code >= 200 && code < 300
                }).length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Success (2xx)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {adminCtx?.logs.filter((log) => {
                  const code = parseInt(log.statusCode)
                  return code >= 400 && code < 500
                }).length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Client Errors (4xx)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {adminCtx?.logs.filter((log) => {
                  const code = parseInt(log.statusCode)
                  return code >= 500
                }).length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Server Errors (5xx)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            View all system activity logs and user actions
          </CardDescription>
          
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Input
                placeholder="Search username, action, or type..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilterChange()
                }}
                className="w-full md:w-64"
              />
              
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value)
                handleFilterChange()
              }}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                handleFilterChange()
              }}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatusCodes.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rows per page:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, totalLogs)} of {totalLogs} logs
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {adminCtx?.loading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="mb-2 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading logs...</p>
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                {adminCtx?.logs.length === 0 ? "No logs found" : "No logs match your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("id")}
                      >
                        ID
                        {getSortIcon("id")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("username")}
                      >
                        Username
                        {getSortIcon("username")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("type")}
                      >
                        Type
                        {getSortIcon("type")}
                      </Button>
                    </TableHead>
                    <TableHead>Type ID</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("action")}
                      >
                        Action
                        {getSortIcon("action")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("statusCode")}
                      >
                        Status
                        {getSortIcon("statusCode")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("createdAt")}
                      >
                        Timestamp
                        {getSortIcon("createdAt")}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {log.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{log.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(log.type)}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {log.typeId}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {log.action}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">{formatDate(log.createdAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}