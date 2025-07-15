// app/apps/[id]/builds/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import supabase from '@/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, ExternalLink, Download, RefreshCw, Calendar, Clock } from 'lucide-react'

interface Build {
  id: string
  app_id: string
  type: string
  deployment_link: string | null
  file_link: string | null
  status: string
  created_at: string
  updated_at: string
}

const BUILD_TYPES = [
  { value: 'web', label: 'Web App' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'desktop', label: 'Desktop App' },
  { value: 'api', label: 'API' },
  { value: 'library', label: 'Library' },
]

const BUILD_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'building', label: 'Building', color: 'bg-blue-100 text-blue-800' },
  { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
]

export default function BuildsPage() {
  const params = useParams()
  const appId = params.id as string
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [formData, setFormData] = useState({
    type: '',
    deployment_link: '',
    file_link: '',
    status: 'pending'
  })

  useEffect(() => {
    fetchBuilds()
  }, [appId])

  const fetchBuilds = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBuilds(data || [])
    } catch (error) {
      console.error('Error fetching builds:', error)
      toast.error('Failed to fetch builds')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('builds')
        .insert([{
          app_id: appId,
          type: formData.type,
          deployment_link: formData.deployment_link || null,
          file_link: formData.file_link || null,
          status: formData.status
        }])
        .select()
        .single()

      if (error) throw error

      setBuilds([data, ...builds])
      setIsCreateDialogOpen(false)
      setFormData({ type: '', deployment_link: '', file_link: '', status: 'pending' })
      toast.success('Build created successfully')
    } catch (error) {
      console.error('Error creating build:', error)
      toast.error('Failed to create build')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBuild) return

    try {
      const { data, error } = await supabase
        .from('builds')
        .update({
          type: formData.type,
          deployment_link: formData.deployment_link || null,
          file_link: formData.file_link || null,
          status: formData.status
        })
        .eq('id', selectedBuild.id)
        .select()
        .single()

      if (error) throw error

      setBuilds(builds.map(build => 
        build.id === selectedBuild.id ? data : build
      ))
      setIsEditDialogOpen(false)
      setSelectedBuild(null)
      setFormData({ type: '', deployment_link: '', file_link: '', status: 'pending' })
      toast.success('Build updated successfully')
    } catch (error) {
      console.error('Error updating build:', error)
      toast.error('Failed to update build')
    }
  }

  const handleDelete = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('builds')
        .delete()
        .eq('id', buildId)

      if (error) throw error

      setBuilds(builds.filter(build => build.id !== buildId))
      toast.success('Build deleted successfully')
    } catch (error) {
      console.error('Error deleting build:', error)
      toast.error('Failed to delete build')
    }
  }

  const openEditDialog = (build: Build) => {
    setSelectedBuild(build)
    setFormData({
      type: build.type,
      deployment_link: build.deployment_link || '',
      file_link: build.file_link || '',
      status: build.status
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = BUILD_STATUSES.find(s => s.value === status)
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBuildTypeLabel = (type: string) => {
    return BUILD_TYPES.find(t => t.value === type)?.label || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Builds</h1>
          <p className="text-gray-600">Manage your application builds</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Build
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Build</DialogTitle>
              <DialogDescription>
                Add a new build to your application
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Build Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select build type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deployment_link">Deployment Link (Optional)</Label>
                  <Input
                    id="deployment_link"
                    type="url"
                    placeholder="https://your-app.com"
                    value={formData.deployment_link}
                    onChange={(e) => setFormData({ ...formData, deployment_link: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file_link">File Link (Optional)</Label>
                  <Input
                    id="file_link"
                    type="url"
                    placeholder="https://files.example.com/build.zip"
                    value={formData.file_link}
                    onChange={(e) => setFormData({ ...formData, file_link: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILD_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Build</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {builds.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100 p-6">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No builds yet</h3>
                <p className="text-gray-600">Create your first build to get started</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Build
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <Card key={build.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{getBuildTypeLabel(build.type)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(build.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(build)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Build</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this build? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(build.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    {getStatusBadge(build.status)}
                  </div>
                  
                  {build.deployment_link && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Deployment</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(build.deployment_link!, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  )}
                  
                  {build.file_link && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Download</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(build.file_link!, '_blank')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        File
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {formatDate(build.updated_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Build</DialogTitle>
            <DialogDescription>
              Update the build information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Build Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select build type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deployment_link">Deployment Link</Label>
                <Input
                  id="edit-deployment_link"
                  type="url"
                  placeholder="https://your-app.com"
                  value={formData.deployment_link}
                  onChange={(e) => setFormData({ ...formData, deployment_link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-file_link">File Link</Label>
                <Input
                  id="edit-file_link"
                  type="url"
                  placeholder="https://files.example.com/build.zip"
                  value={formData.file_link}
                  onChange={(e) => setFormData({ ...formData, file_link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Build</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}