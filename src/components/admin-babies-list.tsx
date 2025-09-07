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
  Baby,
  Calendar,
  Eye,
  Loader2,
  Ruler,
  Weight,
  User,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import AdminContext from "@/context/AdminContext"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AdminBabyEditDialog } from "@/components/admin-baby-edit-dialog"

interface Record {
  id: number
  author: string
  type: string
  subType: string | null
  note: string | null
  startTime: string
  endTime: string | null
  createdAt: string
  updatedAt: string
}

interface Measurement {
  id: number
  author: string
  time: string
  weight: number
  height: number
  headCircumference: number
  createdAt: string
  updatedAt: string
}

interface BabyData {
  id: number
  name: string
  gender: string | null
  dateOfBirth: string
  weight: number | null
  height: number | null
  headCircumference: number | null
  caregivers: string[]
  owner: string
  createdAt: string
  updatedAt: string
  records: Record[]
  measurements: Measurement[]
}

type SortField = "id" | "name" | "owner" | "gender" | "dateOfBirth" | "createdAt"
type SortDirection = "asc" | "desc"

export function AdminBabiesList() {
  const adminCtx = useContext(AdminContext)
  const [selectedBaby, setSelectedBaby] = useState<BabyData | null>(null)
  const [editBaby, setEditBaby] = useState<BabyData | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteBaby, setDeleteBaby] = useState<BabyData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort babies based on current sort field and direction
  const sortedBabies = [...(adminCtx?.babies || [])].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case "id":
        aValue = a.id
        bValue = b.id
        break
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "owner":
        aValue = a.owner.toLowerCase()
        bValue = b.owner.toLowerCase()
        break
      case "gender":
        aValue = a.gender || "unknown"
        bValue = b.gender || "unknown"
        break
      case "dateOfBirth":
        aValue = new Date(a.dateOfBirth).getTime()
        bValue = new Date(b.dateOfBirth).getTime()
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

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy, hh:mm a")
    } catch {
      return dateString
    }
  }

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return <Badge variant="secondary">Unknown</Badge>
    
    const genderLower = gender.toLowerCase()
    if (genderLower === "male") {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Male</Badge>
    } else if (genderLower === "female") {
      return <Badge variant="default" className="bg-pink-100 text-pink-800">Female</Badge>
    }
    return <Badge variant="secondary">{gender}</Badge>
  }

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      if (remainingMonths > 0) {
        return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
      }
      return `${years} year${years > 1 ? 's' : ''}`
    }
  }

  const handleEditBaby = (baby: BabyData) => {
    setEditBaby(baby)
    setEditDialogOpen(true)
  }

  const handleDeleteBaby = (baby: BabyData) => {
    setDeleteBaby(baby)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteBaby = async () => {
    if (!deleteBaby || !adminCtx) return
    
    try {
      await adminCtx.deleteBaby(deleteBaby.id)
      setDeleteDialogOpen(false)
      setDeleteBaby(null)
    } catch (error) {
      console.error("Failed to delete baby:", error)
    }
  }

  if (adminCtx?.error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Babies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{adminCtx.error}</p>
          <Button
            onClick={adminCtx.fetchBabies}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Baby Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {adminCtx?.babies.length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Total Babies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {adminCtx?.babies.filter((baby) => baby.gender?.toLowerCase() === "male").length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Male</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">
                {adminCtx?.babies.filter((baby) => baby.gender?.toLowerCase() === "female").length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Female</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {adminCtx?.babies.reduce((total, baby) => total + baby.records.length, 0) || 0}
              </p>
              <p className="text-muted-foreground text-sm">Total Records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Babies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Babies</CardTitle>
          <CardDescription>
            View all babies registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminCtx?.loading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="mb-2 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading babies...</p>
            </div>
          ) : adminCtx?.babies.length === 0 ? (
            <div className="py-8 text-center">
              <Baby className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No babies found</p>
            </div>
          ) : (
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
                      onClick={() => handleSort("name")}
                    >
                      Name
                      {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("gender")}
                    >
                      Gender
                      {getSortIcon("gender")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("dateOfBirth")}
                    >
                      Age
                      {getSortIcon("dateOfBirth")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("owner")}
                    >
                      Owner
                      {getSortIcon("owner")}
                    </Button>
                  </TableHead>
                  <TableHead>Caregivers</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Measurements</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBabies.map((baby) => (
                  <TableRow key={baby.id}>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {baby.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {baby.name}
                    </TableCell>
                    <TableCell>
                      {getGenderBadge(baby.gender)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{calculateAge(baby.dateOfBirth)}</p>
                        <p className="text-xs text-muted-foreground">
                          Born: {formatDate(baby.dateOfBirth)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        {baby.owner}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {baby.caregivers.map((caregiver, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {caregiver}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="text-sm font-medium">{baby.records.length}</p>
                        <p className="text-xs text-muted-foreground">records</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="text-sm font-medium">{baby.measurements.length}</p>
                        <p className="text-xs text-muted-foreground">measurements</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        {formatDateTime(baby.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedBaby(baby)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBaby(baby)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Baby</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBaby(baby)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Baby</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Baby Details Modal */}
      {selectedBaby && (
        <AlertDialog
          open={!!selectedBaby}
          onOpenChange={() => setSelectedBaby(null)}
        >
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5" />
                Baby Details: {selectedBaby.name}
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Name</p>
                  <p className="text-sm">{selectedBaby.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Gender</p>
                  <div className="mt-1">{getGenderBadge(selectedBaby.gender)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Date of Birth</p>
                  <p className="text-sm">{formatDate(selectedBaby.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Age</p>
                  <p className="text-sm">{calculateAge(selectedBaby.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Owner</p>
                  <p className="text-sm">{selectedBaby.owner}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Baby ID</p>
                  <p className="font-mono text-sm">{selectedBaby.id}</p>
                </div>
              </div>

              {/* Current Measurements */}
              {(selectedBaby.weight || selectedBaby.height || selectedBaby.headCircumference) && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-2">Current Measurements</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBaby.weight && (
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Weight className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{selectedBaby.weight} kg</p>
                          <p className="text-xs text-muted-foreground">Weight</p>
                        </div>
                      </div>
                    )}
                    {selectedBaby.height && (
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Ruler className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{selectedBaby.height} cm</p>
                          <p className="text-xs text-muted-foreground">Height</p>
                        </div>
                      </div>
                    )}
                    {selectedBaby.headCircumference && (
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Badge className="w-4 h-4 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{selectedBaby.headCircumference} cm</p>
                          <p className="text-xs text-muted-foreground">Head Circumference</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Caregivers */}
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2">Caregivers</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBaby.caregivers.map((caregiver, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {caregiver}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Records Count</p>
                  <p className="text-lg font-bold text-blue-600">{selectedBaby.records.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Measurements Count</p>
                  <p className="text-lg font-bold text-green-600">{selectedBaby.measurements.length}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Created</p>
                  <p className="text-sm">{formatDateTime(selectedBaby.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Last Updated</p>
                  <p className="text-sm">{formatDateTime(selectedBaby.updatedAt)}</p>
                </div>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedBaby(null)}>
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit Baby Dialog */}
      <AdminBabyEditDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) {
            setEditBaby(null)
          }
        }}
        baby={editBaby}
      />

      {/* Delete Baby Confirmation Dialog */}
      {deleteBaby && (
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Baby
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              <p>
                Are you sure you want to delete baby <strong>"{deleteBaby.name}"</strong>?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-red-800">This action cannot be undone!</p>
                    <p className="text-sm text-red-700">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      <li>Baby profile and information</li>
                      <li>{deleteBaby.records.length} record{deleteBaby.records.length !== 1 ? 's' : ''}</li>
                      <li>{deleteBaby.measurements.length} measurement{deleteBaby.measurements.length !== 1 ? 's' : ''}</li>
                      <li>All related data</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Owner:</strong> {deleteBaby.owner}
                  </p>
                </div>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteBaby(null)
              }}>
                Cancel
              </AlertDialogCancel>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteBaby}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Baby
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}