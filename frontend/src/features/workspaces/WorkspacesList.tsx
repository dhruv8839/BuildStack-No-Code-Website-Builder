import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetOrganizationWorkspacesQuery, useCreateWorkspaceMutation } from './workspacesApiSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { toast } from 'sonner'
import { FolderKanban, ArrowRight, Plus, Briefcase } from 'lucide-react'

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
      await createWorkspace({ organizationId, body: { name, key, color: '#6366f1' } }).unwrap()
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
          <Card key={i} className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader><Skeleton className="h-4 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-4 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive font-medium">Error loading workspaces. Please select an organization.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Workspaces</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Manage workspaces and client projects within your organization.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2 text-white font-semibold cursor-pointer" style={{ backgroundColor: 'var(--primary)' }} />}>
            <Plus className="h-4 w-4" />
            <span>Create Workspace</span>
          </DialogTrigger>
          <DialogContent className="bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--foreground)]">Create Workspace</DialogTitle>
              <DialogDescription className="text-[var(--muted-foreground)]">
                Create a new workspace folder to organize your projects.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[var(--foreground)] text-xs">Workspace Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Client Portfolios, Marketing Campaign"
                  className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating} className="text-white font-semibold cursor-pointer" style={{ backgroundColor: 'var(--primary)' }}>
                  {isCreating ? 'Creating...' : 'Create Workspace'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!workspaces?.length ? (
        <div className="flex h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-6 text-center">
          <Briefcase className="h-10 w-10 text-[var(--muted-foreground)] opacity-50 mb-2" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No workspaces found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">Create your first workspace to start organizing website projects.</p>
          <Button onClick={() => setOpen(true)} className="gap-2 text-white text-xs font-semibold cursor-pointer" style={{ backgroundColor: 'var(--primary)' }}>
            <Plus className="h-3.5 w-3.5" />
            Create Workspace Now
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="bg-[var(--card)] border-[var(--border)] shadow-xs hover:border-[var(--primary)]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
                    style={{ backgroundColor: workspace.color || 'var(--primary)' }}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-[var(--foreground)] truncate">{workspace.name}</CardTitle>
                </div>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Created {new Date(workspace.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-xs text-[var(--muted-foreground)] min-h-[32px] line-clamp-2 leading-relaxed">
                  {workspace.description || 'Workspace folder for website projects and digital assets.'}
                </p>
                <Link to={`/workspaces/${workspace.id}/projects`} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer font-semibold text-xs h-9 px-3"
                  >
                    <span className="flex items-center gap-2">
                      <FolderKanban className="h-3.5 w-3.5 text-[var(--primary)] group-hover:text-white" />
                      Open Projects
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
