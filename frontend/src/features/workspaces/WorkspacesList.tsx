import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useGetOrganizationWorkspacesQuery, useCreateWorkspaceMutation } from './workspacesApiSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { toast } from 'sonner'

export function WorkspacesList() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const { data: workspaces, isLoading, error } = useGetOrganizationWorkspacesQuery(organizationId || '')
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation()
  
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationId) return
    try {
      const key = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) || 'WKSP'
      await createWorkspace({ organizationId, body: { name, key, color: '#4F46E5' } }).unwrap()
      setOpen(false)
      setName('')
      toast.success('Workspace created successfully!')
    } catch (err: any) {
      toast.error('Failed to create workspace.')
      console.error('Failed to create workspace:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-4 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive">Error loading workspaces. Please select an organization.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workspaces</h2>
          <p className="text-muted-foreground">Manage workspaces within your organization.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            Create Workspace
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your projects.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marketing Site"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!workspaces?.length ? (
        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No workspaces found.</p>
            <Button variant="link" onClick={() => setOpen(true)}>Create one now</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
                <CardDescription>Created: {new Date(workspace.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {workspace.description || 'No description provided.'}
                </p>
                <Link to={`/workspaces/${workspace.id}/projects`} className="w-full block">
                  <Button className="w-full" variant="outline">
                    Open Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
