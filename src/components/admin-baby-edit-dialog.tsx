import { useState, useContext, useEffect } from "react"
import { 
  Baby as BabyIcon,
  Calendar,
  User,
  Weight,
  Ruler,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import AdminContext from "@/context/AdminContext"
import { format } from "date-fns"

interface Baby {
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
  records: any[]
  measurements: any[]
}

interface AdminBabyEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baby: Baby | null
}

export function AdminBabyEditDialog({
  open,
  onOpenChange,
  baby,
}: AdminBabyEditDialogProps) {
  const adminCtx = useContext(AdminContext)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    weight: "",
    height: "",
    headCircumference: "",
    caregivers: "",
  })

  // Initialize form when baby changes
  useEffect(() => {
    if (baby) {
      setFormData({
        name: baby.name || "",
        gender: baby.gender || "",
        dateOfBirth: baby.dateOfBirth ? format(new Date(baby.dateOfBirth), "yyyy-MM-dd'T'HH:mm") : "",
        weight: baby.weight?.toString() || "",
        height: baby.height?.toString() || "",
        headCircumference: baby.headCircumference?.toString() || "",
        caregivers: baby.caregivers?.join(", ") || "",
      })
    } else {
      setFormData({
        name: "",
        gender: "",
        dateOfBirth: "",
        weight: "",
        height: "",
        headCircumference: "",
        caregivers: "",
      })
    }
  }, [baby])

  if (!adminCtx) {
    console.error('AdminBabyEditDialog must be used within AdminProvider')
    return null
  }

  if (!baby) return null

  const handleSave = async () => {
    if (!baby) return
    
    try {
      setIsUpdating(true)
      
      // Prepare update data
      const updateData: any = {
        name: formData.name.trim(),
        gender: formData.gender || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : null,
        caregivers: formData.caregivers
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0),
      }

      // Only include dateOfBirth if it has changed
      if (formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth
      }

      await adminCtx.updateBaby(baby.id, updateData)
      onOpenChange(false)
    } catch (error) {
      console.error("Baby update error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BabyIcon className="h-5 w-5" />
            <DialogTitle>Edit Baby: {baby.name}</DialogTitle>
          </div>
          <DialogDescription>
            Update baby information and measurements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-medium">Basic Information</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Baby's name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || "unspecified"}
                  onValueChange={(value) => handleInputChange("gender", value === "unspecified" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">Not specified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="datetime-local"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              />
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-green-600" />
              <Label className="text-base font-medium">Current Measurements</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-1">
                  <Weight className="h-3 w-3" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="0.0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="0.0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headCircumference">Head Circumference (cm)</Label>
                <Input
                  id="headCircumference"
                  type="number"
                  step="0.1"
                  value={formData.headCircumference}
                  onChange={(e) => handleInputChange("headCircumference", e.target.value)}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Caregivers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <Label className="text-base font-medium">Caregivers</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caregivers">Caregivers (comma-separated usernames)</Label>
              <Textarea
                id="caregivers"
                value={formData.caregivers}
                onChange={(e) => handleInputChange("caregivers", e.target.value)}
                placeholder="username1, username2, username3"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Enter usernames separated by commas. Current owner: <strong>{baby.owner}</strong>
              </p>
            </div>
          </div>

          {/* Read-only Information */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <Label className="text-base font-medium">Information</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Baby ID</p>
                <p className="font-mono">{baby.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p>{baby.owner}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Records Count</p>
                <p>{baby.records.length}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !formData.name.trim()}>
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}