import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyOrganizationsQuery } from '../organizations/organizationsApiSlice';
import { useGetOrganizationWorkspacesQuery } from '../workspaces/workspacesApiSlice';
import { useGetProjectsForWorkspaceQuery } from './projectsApiSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Building2, 
  Folder, 
  Clock, 
  Plus, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';
import type { EnrichedProject, EnrichedWorkspace } from './hooks/useAllUserProjects';

// Sub-component to load projects for a specific workspace reactively
function WorkspaceProjectsFetcher({
  workspace,
  onCollectProjects,
  onCollectWorkspaces
}: {
  workspace: EnrichedWorkspace;
  onCollectProjects: (projects: EnrichedProject[]) => void;
  onCollectWorkspaces: (workspace: EnrichedWorkspace) => void;
}) {
  const { data: projects = [] } = useGetProjectsForWorkspaceQuery(workspace.id);

  useEffect(() => {
    onCollectWorkspaces(workspace);
  }, [workspace, onCollectWorkspaces]);

  useEffect(() => {
    const enriched: EnrichedProject[] = projects.map((p) => ({
      ...p,
      organizationId: workspace.organizationId,
      organizationName: workspace.organizationName,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    }));
    onCollectProjects(enriched);
  }, [projects, workspace, onCollectProjects]);

  return null;
}

// Component to load workspaces for an organization
function OrgWorkspacesFetcher({
  organizationId,
  organizationName,
  onCollectProjects,
  onCollectWorkspaces
}: {
  organizationId: string;
  organizationName: string;
  onCollectProjects: (projects: EnrichedProject[]) => void;
  onCollectWorkspaces: (workspace: EnrichedWorkspace) => void;
}) {
  const { data: workspaces = [] } = useGetOrganizationWorkspacesQuery(organizationId);

  return (
    <>
      {workspaces.map((ws) => (
        <WorkspaceProjectsFetcher
          key={ws.id}
          workspace={{ ...ws, organizationId, organizationName }}
          onCollectProjects={onCollectProjects}
          onCollectWorkspaces={onCollectWorkspaces}
        />
      ))}
    </>
  );
}

import { useDuplicateProjectMutation } from './projectsApiSlice';
import { Copy } from 'lucide-react';

export function GlobalProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProjectsMap, setAllProjectsMap] = useState<Record<string, EnrichedProject[]>>({});
  const [allWorkspacesMap, setAllWorkspacesMap] = useState<Record<string, EnrichedWorkspace>>({});
  const [duplicateProject, { isLoading: isDuplicating }] = useDuplicateProjectMutation();

  const handleDuplicateProject = async (projectId: string, workspaceId: string) => {
    try {
      await duplicateProject({ projectId, workspaceId }).unwrap();
    } catch (err) {
      console.error('Failed to duplicate project', err);
    }
  };

  const { data: organizations = [], isLoading: isOrgsLoading } = useGetMyOrganizationsQuery();

  const handleCollectProjects = useCallback((wsProjects: EnrichedProject[]) => {
    if (wsProjects.length === 0) return;
    const wsId = wsProjects[0].workspaceId;
    setAllProjectsMap((prev) => {
      const existing = prev[wsId];
      if (existing && existing.length === wsProjects.length && existing.every((p, idx) => p.id === wsProjects[idx].id && p.updatedAt === wsProjects[idx].updatedAt)) {
        return prev;
      }
      return { ...prev, [wsId]: wsProjects };
    });
  }, []);

  const handleCollectWorkspaces = useCallback((ws: EnrichedWorkspace) => {
    setAllWorkspacesMap((prev) => {
      if (prev[ws.id]) return prev;
      return { ...prev, [ws.id]: ws };
    });
  }, []);

  // Flatten projects and workspaces
  const allProjects = useMemo(() => {
    return Object.values(allProjectsMap).flat();
  }, [allProjectsMap]);

  const allWorkspaces = useMemo(() => {
    return Object.values(allWorkspacesMap);
  }, [allWorkspacesMap]);

  // Filter projects by search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return allProjects;
    const query = searchTerm.toLowerCase();
    return allProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.workspaceName.toLowerCase().includes(query) ||
        p.organizationName.toLowerCase().includes(query)
    );
  }, [allProjects, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Background Fetchers */}
      {organizations.map((org) => (
        <OrgWorkspacesFetcher
          key={org.id}
          organizationId={org.id}
          organizationName={org.name}
          onCollectProjects={handleCollectProjects}
          onCollectWorkspaces={handleCollectWorkspaces}
        />
      ))}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and edit all websites across your organizations and workspaces
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, workspace, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </div>
      </div>

      {/* Projects Grid */}
      {isOrgsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed p-12 text-center bg-card/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">No Projects Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No projects matched your search query.'
              : 'Create your first project to start building websites with BuildStack.'}
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Create First Project
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group overflow-hidden hover:shadow-md transition-all duration-200 border-border/80 bg-card flex flex-col"
            >
              {/* Project Card Preview Canvas Header */}
              <div className="h-36 bg-gradient-to-br from-indigo-950/20 via-background to-muted/40 p-4 border-b flex flex-col justify-between relative group-hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="h-3 w-3" />
                    Web Site
                  </span>
                  <div className="flex items-center space-x-1">
                    <Link to={`/projects/${project.id}/preview`}>
                      <Button variant="ghost" size="icon-sm" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" title="Preview Site">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {project.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-muted-foreground gap-2">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{project.organizationName}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground gap-2">
                    <Folder className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{project.workspaceName}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs border-border"
                      onClick={() => handleDuplicateProject(project.id, project.workspaceId)}
                      title="Duplicate Project"
                      disabled={isDuplicating}
                    >
                      <Copy className="h-3 w-3" />
                      Clone
                    </Button>
                    <Link to={`/projects/${project.id}/builder`}>
                      <Button size="sm" className="h-8 gap-1.5 text-xs shadow-none" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                        Open Builder
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaces={allWorkspaces}
      />
    </div>
  );
}
