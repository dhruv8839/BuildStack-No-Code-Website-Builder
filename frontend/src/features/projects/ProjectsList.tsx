import { useParams, Link } from 'react-router-dom'
import {
  useGetProjectsForWorkspaceQuery,
  useDeleteProjectMutation,
} from './projectsApiSlice'
import { CreateProjectDialog } from './CreateProjectDialog'
import { Button } from '../../components/ui/button'
import { Loader2, Trash2, LayoutTemplate } from 'lucide-react'

export function ProjectsList() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  
  const { data: projects, isLoading, error } = useGetProjectsForWorkspaceQuery(workspaceId!)
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation()

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-destructive">Failed to load projects.</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <div className="flex items-center space-x-2">
          {workspaceId && <CreateProjectDialog workspaceId={workspaceId} />}
        </div>
      </div>
      
      {projects && projects.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <LayoutTemplate className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="mt-4 text-lg font-semibold">No projects created</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't created any projects in this workspace yet. Create one to start building.
            </p>
            {workspaceId && <CreateProjectDialog workspaceId={workspaceId} />}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-xl border bg-card p-6 text-card-foreground shadow transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold leading-none tracking-tight">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project?')) {
                          deleteProject({ projectId: project.id, workspaceId: workspaceId! })
                        }
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <div className={`mr-2 h-2 w-2 rounded-full ${project.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {project.status}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <Link to={`/projects/${project.id}/builder`} className="w-full block">
                  <Button className="w-full">
                    Open Builder
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
